// ─── Client-Side Paper Engine ───────────────────────────────
//
// All filtering, searching, sorting, and pagination happens
// locally in-memory. Zero API calls after the initial data fetch.
//
// This replaces the server-side paperService for the mobile app.

// ─── Normalize search text ──────────────────────────────────

function normalize(str) {
  return (str || "").toLowerCase().trim().replace(/\s+/g, " ");
}

// ─── Search ─────────────────────────────────────────────────

function matchesSearch(record, query) {
  if (!query) return true;
  const normalized = normalize(query);
  const terms = normalized.split(" ");
  const haystack = record.searchText || buildSearchText(record);
  return terms.every((term) => haystack.includes(term));
}

function buildSearchText(record) {
  return normalize(
    [
      record.subjectCode,
      record.subjectName,
      record.department,
      record.category,
      record.examType,
      record.examTypeRaw,
      record.year,
      record.session,
      record.fileName,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

// ─── Filter matching ────────────────────────────────────────

function matchesFilter(record, filters) {
  if (filters.department && record.department !== filters.department)
    return false;
  if (filters.deptCode && record.deptCode !== filters.deptCode) return false;
  if (filters.subjectCode && record.subjectCode !== filters.subjectCode)
    return false;
  if (filters.examType && record.examType !== filters.examType) return false;
  if (filters.category && record.category !== filters.category) return false;
  if (filters.catCode && record.catCode !== filters.catCode) return false;
  if (filters.session && record.session !== filters.session) return false;
  if (filters.variant && record.variant !== filters.variant) return false;
  if (filters.fileExtension && record.fileExtension !== filters.fileExtension)
    return false;

  if (
    filters.midsemNumber !== undefined &&
    filters.midsemNumber !== null &&
    filters.midsemNumber !== ""
  ) {
    const msNum = parseInt(filters.midsemNumber, 10);
    if (!isNaN(msNum) && record.midsemNumber !== msNum) return false;
  }

  if (filters.year) {
    const yearList = Array.isArray(filters.year)
      ? filters.year
      : filters.year.split(",");
    if (!yearList.includes(record.year)) return false;
  }

  return true;
}

// ─── Sorting ────────────────────────────────────────────────

const SORT_FIELDS = [
  "year",
  "subjectCode",
  "department",
  "examType",
  "uploadedAt",
  "fileSizeKB",
];

function sortRecords(records, sortBy, sortOrder) {
  const field = SORT_FIELDS.includes(sortBy) ? sortBy : "year";
  const order = sortOrder === "asc" ? 1 : -1;

  return [...records].sort((a, b) => {
    const valA = a[field] ?? "";
    const valB = b[field] ?? "";

    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * order;
    }

    return String(valA).localeCompare(String(valB)) * order;
  });
}

// ─── Main query function ────────────────────────────────────
//
// Takes the full dataset + query params, returns paginated results.
// Mirrors the server-side paperService.getPapers() signature.

export function queryPapers(
  allRecords,
  {
    query = "",
    filters = {},
    page = 1,
    limit = 10,
    sortBy = "year",
    sortOrder = "desc",
  } = {},
) {
  // Step 1: search
  let results = allRecords;
  if (query && query.trim()) {
    results = results.filter((r) => matchesSearch(r, query));
  }

  // Step 2: filter
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== "" && v !== null && v !== undefined,
  );
  if (hasActiveFilters) {
    results = results.filter((r) => matchesFilter(r, filters));
  }

  // Step 3: sort
  results = sortRecords(results, sortBy, sortOrder);

  // Step 4: paginate
  const totalRecords = results.length;
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedRecords = results.slice(startIdx, endIdx);

  return {
    data: paginatedRecords,
    pagination: {
      currentPage,
      pageSize,
      totalRecords,
      totalPages,
      hasMore: currentPage < totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
    },
  };
}

// ─── Extract filter options from data ───────────────────────
//
// Derives all filter dropdowns from the actual dataset.
// No need for a separate /api/filters call.

export function extractFilterOptions(allRecords) {
  const departments = new Set();
  const deptCodes = new Set();
  const subjectCodes = new Set();
  const categories = new Set();
  const examTypes = new Set();
  const years = new Set();
  const sessions = new Set();
  const variants = new Set();

  for (const r of allRecords) {
    if (r.department) departments.add(r.department);
    if (r.deptCode) deptCodes.add(r.deptCode);
    if (r.subjectCode) subjectCodes.add(r.subjectCode);
    if (r.category) categories.add(r.category);
    if (r.examType) examTypes.add(r.examType);
    if (r.year) years.add(r.year);
    if (r.session) sessions.add(r.session);
    if (r.variant) variants.add(r.variant);
  }

  const sorted = (set) => [...set].sort();

  return {
    departments: sorted(departments),
    deptCodes: sorted(deptCodes),
    subjectCodes: sorted(subjectCodes),
    categories: sorted(categories),
    examTypes: sorted(examTypes),
    years: sorted(years),
    sessions: sorted(sessions),
    variants: sorted(variants),
  };
}

// ─── Get a single paper by ID ───────────────────────────────

export function getPaperById(allRecords, id) {
  return allRecords.find((r) => r.id === id) || null;
}

// ─── Compute stats from data ────────────────────────────────

export function computeStats(allRecords) {
  const countBy = (field) => {
    const counts = {};
    for (const r of allRecords) {
      const key = r[field];
      if (key) counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  };

  return {
    totalPapers: allRecords.length,
    byDepartment: countBy("department"),
    byYear: countBy("year"),
    byExamType: countBy("examType"),
    byCategory: countBy("category"),
    bySubjectCode: countBy("subjectCode"),
    byFileExtension: countBy("fileExtension"),
  };
}

// ─── Exports ────────────────────────────────────────────────

const paperEngine = {
  queryPapers,
  extractFilterOptions,
  getPaperById,
  computeStats,
  matchesSearch,
  matchesFilter,
  sortRecords,
};

export default paperEngine;

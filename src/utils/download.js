import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";
import { Alert, Platform } from "react-native";

// ─── Constants ──────────────────────────────────────────────

const DOWNLOAD_DIR = FileSystem.documentDirectory + "pyq_downloads/";

// ─── Ensure private download directory exists ────────────────

async function ensureDownloadDir() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, {
        intermediates: true,
      });
    }
  } catch (err) {
    console.warn("[Download] ensureDownloadDir error:", err.message);
  }
}

// ─── Sanitize filename for filesystem ───────────────────────

function sanitizeFileName(name) {
  if (!name || typeof name !== 'string') {
    return 'unknown_file';
  }
  return name
    .replace(/[^a-zA-Z0-9._()-]/g, "_")
    .replace(/__+/g, "_")
    .replace(/^_|_$/g, "");
}

// ─── Get local path for a file ──────────────────────────────

function getLocalFilePath(fileName) {
  const sanitized = sanitizeFileName(fileName);
  return `${DOWNLOAD_DIR}${sanitized}`;
}

// ─── Check if file is already downloaded (Private) ──────────

async function isFileDownloaded(fileName) {
  try {
    const filePath = getLocalFilePath(fileName);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists && (info.size || 0) > 0;
  } catch {
    const filePath = getLocalFilePath(fileName);
    const info = await FileSystem.getInfoAsync(filePath);
    return info.exists && (info.size || 0) > 0;
  }
}

// ─── Determine MIME type from extension ─────────────────────

function getMimeType(fileName) {
  const ext = (fileName || "").split(".").pop().toLowerCase();
  const mimeMap = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    zip: "application/zip",
  };
  return mimeMap[ext] || "application/octet-stream";
}

// ─── Download a file ──────────────────────────

async function downloadFile(downloadUrl, fileName, onProgress = null) {
  try {
    await ensureDownloadDir();
    const filePath = getLocalFilePath(fileName);

    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      filePath,
      {},
      onProgress ? (p) => onProgress({
        totalBytesWritten: p.totalBytesWritten,
        totalBytesExpectedToWrite: p.totalBytesExpectedToWrite,
        progress: p.totalBytesExpectedToWrite > 0 ? p.totalBytesWritten / p.totalBytesExpectedToWrite : 0,
      }) : undefined
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) throw new Error("Download failed");

    const fileInfo = await FileSystem.getInfoAsync(result.uri);
    return {
      success: true,
      filePath: result.uri,
      size: fileInfo.size || 0,
      mimeType: result.headers?.["content-type"] || getMimeType(fileName),
    };
  } catch (err) {
    console.error("[Download] Error:", err.message);
    return { success: false, error: err.message || "Download failed" };
  }
}

// ─── Open file ─────

async function openFile(filePath, fileName) {
  try {
    if (Platform.OS === "android") {
      const contentUri = await FileSystem.getContentUriAsync(filePath);
      const mimeType = getMimeType(fileName);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1,
        type: mimeType,
      });
      return true;
    } else {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return false;
      await Sharing.shareAsync(filePath, { mimeType: getMimeType(fileName) });
      return true;
    }
  } catch (err) {
    console.error("[OpenFile] Error:", err.message);
    return false;
  }
}

// ─── Share a file ────────────────────

async function shareFile(filePath, fileName) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) return false;
    await Sharing.shareAsync(filePath, { mimeType: getMimeType(fileName) });
    return true;
  } catch (err) {
    console.error("[Share] Error:", err.message);
    return false;
  }
}

// ─── Download and immediately open ────────────

async function downloadAndOpen(downloadUrl, fileName, onProgress = null) {
  const filePath = getLocalFilePath(fileName);
  const existingFile = await FileSystem.getInfoAsync(filePath);

  if (existingFile.exists && (existingFile.size || 0) > 0) {
    return openFile(filePath, fileName);
  }

  const result = await downloadFile(downloadUrl, fileName, onProgress);
  if (!result.success) return false;
  return openFile(result.filePath, fileName);
}

// ─── Delete ───────────────────────────────

async function deleteDownloadedFile(fileName) {
  try {
    const filePath = getLocalFilePath(fileName);
    await FileSystem.deleteAsync(filePath, { idempotent: true });
    return true;
  } catch {
    return false;
  }
}

// ─── Clear All ─────────────────────────────

async function clearAllDownloads() {
  try {
    await FileSystem.deleteAsync(DOWNLOAD_DIR, { idempotent: true });
    return true;
  } catch {
    return false;
  }
}

// ─── Info ───────────────────────────

async function getDownloadedFilesInfo() {
  try {
    await ensureDownloadDir();
    const files = await FileSystem.readDirectoryAsync(DOWNLOAD_DIR);
    let totalSize = 0;
    const fileDetails = [];

    for (const file of files) {
      const info = await FileSystem.getInfoAsync(`${DOWNLOAD_DIR}${file}`);
      if (info.exists) {
        totalSize += info.size || 0;
        fileDetails.push({ name: file, size: info.size || 0 });
      }
    }

    return { count: fileDetails.length, totalSize, files: fileDetails };
  } catch {
    return { count: 0, totalSize: 0, files: [] };
  }
}

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export {
  downloadFile,
  downloadAndOpen,
  openFile,
  shareFile,
  isFileDownloaded,
  deleteDownloadedFile,
  clearAllDownloads,
  getDownloadedFilesInfo,
  getLocalFilePath,
  formatFileSize
};

export default {
  downloadFile,
  downloadAndOpen,
  openFile,
  shareFile,
  isFileDownloaded,
  deleteDownloadedFile,
  clearAllDownloads,
  getDownloadedFilesInfo,
  getLocalFilePath,
  formatFileSize
};

import AsyncStorage from "@react-native-async-storage/async-storage";

const BOOKMARKS_KEY = "@user_bookmarks";

/**
 * Structure of bookmarks:
 * {
 *   papers: [ { id, title, subject_code, ... }, ... ],
 *   jobs: [ { id, title, company, ... }, ... ]
 * }
 */

const getInitialBookmarks = () => ({
    papers: [],
    jobs: [],
});

/**
 * Fetches all bookmarks from storage.
 */
export const getAllBookmarks = async () => {
    try {
        const json = await AsyncStorage.getItem(BOOKMARKS_KEY);
        return json ? JSON.parse(json) : getInitialBookmarks();
    } catch (e) {
        console.error("Error getting bookmarks", e);
        return getInitialBookmarks();
    }
};

/**
 * Saves bookmarks to storage.
 */
const saveBookmarks = async (bookmarks) => {
    try {
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
        console.error("Error saving bookmarks", e);
    }
};

/**
 * Adds or removes a bookmark for a specific type.
 * @param {string} type - 'papers' or 'jobs'
 * @param {Object} item - The item to bookmark
 */
export const toggleBookmark = async (type, item) => {
    if (!['papers', 'jobs'].includes(type)) return;

    const bookmarks = await getAllBookmarks();
    const index = bookmarks[type].findIndex(b => b.id === item.id);

    if (index >= 0) {
        // Remove
        bookmarks[type].splice(index, 1);
    } else {
        // Add
        bookmarks[type].push({
            ...item,
            bookmarkedAt: new Date().toISOString()
        });
    }

    await saveBookmarks(bookmarks);
    return index < 0; // Returns true if added, false if removed
};

/**
 * Checks if an item is bookmarked.
 */
export const isBookmarked = async (type, id) => {
    if (!['papers', 'jobs'].includes(type)) return false;
    const bookmarks = await getAllBookmarks();
    return bookmarks[type].some(b => b.id === id);
};

/**
 * Clears all bookmarks for a specific type or all types.
 */
export const clearBookmarks = async (type = null) => {
    if (type) {
        const bookmarks = await getAllBookmarks();
        bookmarks[type] = [];
        await saveBookmarks(bookmarks);
    } else {
        await saveBookmarks(getInitialBookmarks());
    }
};

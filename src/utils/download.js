import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";
import { Alert, Platform } from "react-native";

// ─── Constants ──────────────────────────────────────────────

const DOWNLOAD_DIR = FileSystem.documentDirectory + "pyq_downloads/";

// ─── Ensure download directory exists ───────────────────────

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

// ─── Check if file is already downloaded ────────────────────

async function isFileDownloaded(fileName) {
  try {
    const filePath = getLocalFilePath(fileName);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists && (fileInfo.size || 0) > 0;
  } catch {
    return false;
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
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    txt: "text/plain",
    zip: "application/zip",
  };
  return mimeMap[ext] || "application/octet-stream";
}

// ─── Download a file to the device ──────────────────────────

/**
 * Downloads a file from a URL and saves it locally.
 *
 * @param {string} downloadUrl  - The full URL to download the file from
 * @param {string} fileName     - The desired filename (e.g. "CSPC20-ES-2019-Dec.pdf")
 * @param {Function} [onProgress] - Optional callback receiving { totalBytesWritten, totalBytesExpectedToWrite, progress }
 * @returns {Promise<{ success: boolean, filePath?: string, alreadyExisted?: boolean, size?: number, error?: string }>}
 */
async function downloadFile(downloadUrl, fileName, onProgress = null) {
  try {
    await ensureDownloadDir();

    const filePath = getLocalFilePath(fileName);

    // Check if already downloaded
    const existingFile = await FileSystem.getInfoAsync(filePath);
    if (existingFile.exists && (existingFile.size || 0) > 0) {
      return {
        success: true,
        filePath,
        alreadyExisted: true,
        size: existingFile.size,
      };
    }

    // Create download resumable for progress tracking
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      filePath,
      {},
      onProgress
        ? (downloadProgress) => {
            onProgress({
              totalBytesWritten: downloadProgress.totalBytesWritten,
              totalBytesExpectedToWrite:
                downloadProgress.totalBytesExpectedToWrite,
              progress:
                downloadProgress.totalBytesExpectedToWrite > 0
                  ? downloadProgress.totalBytesWritten /
                    downloadProgress.totalBytesExpectedToWrite
                  : 0,
            });
          }
        : undefined,
    );

    const result = await downloadResumable.downloadAsync();

    if (!result || !result.uri) {
      throw new Error("Download failed — no file URI returned");
    }

    const fileInfo = await FileSystem.getInfoAsync(result.uri);

    return {
      success: true,
      filePath: result.uri,
      alreadyExisted: false,
      size: fileInfo.size || 0,
      mimeType: result.headers?.["content-type"] || getMimeType(fileName),
    };
  } catch (err) {
    console.error("[Download] Error:", err.message);
    return {
      success: false,
      error: err.message || "Download failed",
    };
  }
}

// ─── Open file directly in PDF viewer / appropriate app ─────
//
// Android: Convert file:// to content:// URI, then launch
//          an ACTION_VIEW intent to open in the default PDF viewer.
// iOS:     Use expo-sharing which shows "Open in..." options
//          including the native PDF viewer.

async function openFile(filePath, fileName) {
  try {
    if (Platform.OS === "android") {
      // Convert file:// URI to content:// URI
      // Android 7+ blocks file:// URIs for security — content:// is required
      const contentUri = await FileSystem.getContentUriAsync(filePath);

      const mimeType = getMimeType(fileName);

      // Launch the file directly with an ACTION_VIEW intent
      // This opens the system "Open with" picker or the default PDF viewer
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.VIEW,
        {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: mimeType,
        },
      );

      return true;
    } else {
      // iOS — use Sharing which shows "Open in..." including PDF viewers
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert(
          "Cannot Open File",
          "File viewing is not supported on this device.",
        );
        return false;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: getMimeType(fileName),
        dialogTitle: "Open PDF",
        UTI: "com.adobe.pdf",
      });

      return true;
    }
  } catch (err) {
    console.error("[OpenFile] Error:", err.message);

    // Fallback: try expo-sharing if IntentLauncher fails
    if (Platform.OS === "android") {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(filePath, {
            mimeType: getMimeType(fileName),
            dialogTitle: "Open or Share PDF",
          });
          return true;
        }
      } catch (fallbackErr) {
        console.error("[OpenFile] Fallback also failed:", fallbackErr.message);
      }
    }

    Alert.alert(
      "Cannot Open File",
      "No app found to open this file. Please install a PDF viewer (like Google Drive or Adobe Reader) and try again.",
    );
    return false;
  }
}

// ─── Share a file (explicit share sheet) ────────────────────

async function shareFile(filePath, fileName) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert(
        "Sharing not available",
        "Sharing is not supported on this device.",
      );
      return false;
    }

    await Sharing.shareAsync(filePath, {
      mimeType: getMimeType(fileName || "file.pdf"),
      dialogTitle: "Share File",
      UTI: "com.adobe.pdf",
    });

    return true;
  } catch (err) {
    console.error("[Share] Error:", err.message);
    Alert.alert("Error", "Could not share the file.");
    return false;
  }
}

// ─── Download and immediately open in PDF viewer ────────────

/**
 * Downloads a PDF and opens it directly in the device's PDF viewer.
 * On Android, uses IntentLauncher to open with ACTION_VIEW.
 * On iOS, uses the native share/open dialog.
 *
 * If the file was previously downloaded, it opens from local cache instantly.
 *
 * @param {string} downloadUrl - The full URL to download the file from
 * @param {string} fileName    - The desired filename
 * @param {Function} [onProgress] - Optional progress callback
 * @returns {Promise<boolean>} - true if successful
 */
async function downloadAndOpen(downloadUrl, fileName, onProgress = null) {
  const result = await downloadFile(downloadUrl, fileName, onProgress);

  if (!result.success) {
    Alert.alert(
      "Download Failed",
      result.error ||
        "Could not download the file. Please check your internet connection and try again.",
    );
    return false;
  }

  if (result.alreadyExisted) {
    // File was already downloaded — open instantly from cache
    return openFile(result.filePath, fileName);
  }

  // Freshly downloaded — open it
  return openFile(result.filePath, fileName);
}

// ─── Delete a downloaded file ───────────────────────────────

async function deleteDownloadedFile(fileName) {
  try {
    const filePath = getLocalFilePath(fileName);
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
      return true;
    }

    return false;
  } catch (err) {
    console.error("[Delete] Error:", err.message);
    return false;
  }
}

// ─── Clear all downloaded files ─────────────────────────────

async function clearAllDownloads() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(DOWNLOAD_DIR, { idempotent: true });
    }
    return true;
  } catch (err) {
    console.error("[ClearDownloads] Error:", err.message);
    return false;
  }
}

// ─── Get total size of downloaded files ─────────────────────

async function getDownloadedFilesInfo() {
  try {
    await ensureDownloadDir();

    const files = await FileSystem.readDirectoryAsync(DOWNLOAD_DIR);
    let totalSize = 0;
    const fileDetails = [];

    for (const file of files) {
      const filePath = `${DOWNLOAD_DIR}${file}`;
      const info = await FileSystem.getInfoAsync(filePath);

      if (info.exists) {
        totalSize += info.size || 0;
        fileDetails.push({
          name: file,
          path: filePath,
          size: info.size || 0,
          sizeKB: Math.round((info.size || 0) / 1024),
        });
      }
    }

    return {
      count: fileDetails.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      files: fileDetails,
    };
  } catch (err) {
    console.error("[DownloadsInfo] Error:", err.message);
    return {
      count: 0,
      totalSize: 0,
      totalSizeMB: "0.00",
      files: [],
    };
  }
}

// ─── Format bytes to human readable ─────────────────────────

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Exports ────────────────────────────────────────────────

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
  formatFileSize,
  sanitizeFileName,
  getMimeType,
  DOWNLOAD_DIR,
};

const downloadUtils = {
  downloadFile,
  downloadAndOpen,
  openFile,
  shareFile,
  isFileDownloaded,
  deleteDownloadedFile,
  clearAllDownloads,
  getDownloadedFilesInfo,
  getLocalFilePath,
  formatFileSize,
  sanitizeFileName,
  getMimeType,
  DOWNLOAD_DIR,
};

export default downloadUtils;

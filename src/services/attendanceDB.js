import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('attendance.db');

// Initialize tables
export const initDB = async () => {
    try {
        await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT,
        required_percentage REAL DEFAULT 75.0,
        total_classes INTEGER DEFAULT 0,
        attended_classes INTEGER DEFAULT 0,
        color_code TEXT
      );
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(subject_id) REFERENCES subjects(id)
      );
    `);
        console.log("DB Init Success");
    } catch (error) {
        console.log("DB Init Error: " + error.message);
    }
};

export const getSubjects = async () => {
    try {
        const result = await db.getAllAsync('SELECT * FROM subjects');
        return result;
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const addSubject = async (name, code, color = "#3B82F6", required = 75.0) => {
    try {
        const result = await db.runAsync(
            'INSERT INTO subjects (name, code, color_code, required_percentage) VALUES (?, ?, ?, ?)',
            [name, code, color, required]
        );
        return result.lastInsertRowId;
    } catch (e) {
        console.error(e);
    }
};

export const deleteSubject = async (id) => {
    try {
        await db.runAsync('DELETE FROM logs WHERE subject_id = ?', [id]);
        await db.runAsync('DELETE FROM subjects WHERE id = ?', [id]);
    } catch (e) {
        console.error(e);
    }
};

export const markAttendance = async (subjectId, status, date = new Date().toISOString()) => {
    try {
        // Update log
        await db.runAsync(
            'INSERT INTO logs (subject_id, date, status) VALUES (?, ?, ?)',
            [subjectId, date, status]
        );

        // Update subject counts
        if (status === 'PRESENT') {
            await db.runAsync(
                'UPDATE subjects SET total_classes = total_classes + 1, attended_classes = attended_classes + 1 WHERE id = ?',
                [subjectId]
            );
        } else if (status === 'ABSENT') {
            await db.runAsync(
                'UPDATE subjects SET total_classes = total_classes + 1 WHERE id = ?',
                [subjectId]
            );
        }
    } catch (e) {
        console.error(e);
    }
};

export const resetSubject = async (subjectId) => {
    try {
        await db.runAsync('DELETE FROM logs WHERE subject_id = ?', [subjectId]);
        await db.runAsync('UPDATE subjects SET total_classes = 0, attended_classes = 0 WHERE id = ?', [subjectId]);
    } catch (e) {
        console.error(e);
    }
};

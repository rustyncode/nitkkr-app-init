/**
 * Utility functions for attendance prediction and calculations.
 */

/**
 * Calculates attendance percentage string.
 */
export const calculatePercentage = (attended, total) => {
    if (total === 0) return "100.0";
    return ((attended / total) * 100).toFixed(1);
};

/**
 * Predicts the number of classes that can be bunked or need to be attended.
 * 
 * @param {number} attended - Number of classes attended
 * @param {number} total - Total number of classes held
 * @param {number} required - Required percentage (e.g., 75)
 * @returns {Object} - Prediction result { status, count, type }
 */
export const predictAttendance = (attended, total, required = 75) => {
    const req = required / 100;
    const currentPercentage = total === 0 ? 100 : (attended / total) * 100;

    if (currentPercentage >= required) {
        // How many can I bunk?
        const maxTotalWithCurrentAttended = Math.floor(attended / req);
        const canBunk = Math.max(0, maxTotalWithCurrentAttended - total);

        return {
            status: canBunk > 0 ? `Safe to bunk ${canBunk} class${canBunk > 1 ? 'es' : ''}` : "On track",
            count: canBunk,
            type: 'BUNK',
            isSafe: true
        };
    } else {
        // How many more to attend?
        const needed = Math.ceil((req * total - attended) / (1 - req));

        return {
            status: `Attend next ${needed} class${needed > 1 ? 'es' : ''}`,
            count: needed,
            type: 'ATTEND',
            isSafe: false
        };
    }
};

/**
 * Calculates overall attendance stats for a list of subjects.
 */
export const calculateOverallStats = (subjects) => {
    if (!subjects || subjects.length === 0) {
        return { percentage: "0.0", attended: 0, total: 0 };
    }

    const totalAttended = subjects.reduce((sum, s) => sum + (s.attended_classes || 0), 0);
    const totalHeld = subjects.reduce((sum, s) => sum + (s.total_classes || 0), 0);

    const percentage = calculatePercentage(totalAttended, totalHeld);

    return {
        percentage,
        attended: totalAttended,
        total: totalHeld,
        subjectCount: subjects.length
    };
};

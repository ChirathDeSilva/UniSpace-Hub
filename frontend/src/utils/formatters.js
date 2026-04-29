/**
 * formatters.js
 * 
 * Safe formatting utilities to handle Jackson's JavaTime array serialization
 * (e.g. [10, 30] instead of "10:30:00") as well as standard strings.
 */

export function formatTime(timeVal) {
    if (!timeVal) return '--:--';
    if (Array.isArray(timeVal)) {
        const hh = String(timeVal[0] || 0).padStart(2, '0');
        const mm = String(timeVal[1] || 0).padStart(2, '0');
        return `${hh}:${mm}`;
    }
    if (typeof timeVal === 'string') {
        return timeVal.length >= 5 ? timeVal.substring(0, 5) : timeVal;
    }
    return '--:--';
}

export function formatDate(dateVal) {
    if (!dateVal) return '--/--/----';
    if (Array.isArray(dateVal)) {
        const yyyy = String(dateVal[0]);
        const mm = String(dateVal[1] || 1).padStart(2, '0');
        const dd = String(dateVal[2] || 1).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    return String(dateVal);
}

export function formatCode(codeVal) {
    if (!codeVal) return 'UNKNOWN';
    return String(codeVal).substring(0, 8);
}

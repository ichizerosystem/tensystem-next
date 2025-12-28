
export function getJstToday(dateStr?: string) {
    // Return 00:00:00 JST of the target date.
    let targetDateStr = dateStr;

    if (!targetDateStr) {
        // Get current date in JST
        // Use 'en-CA' for YYYY-MM-DD format
        targetDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
    }

    // Construct ISO string with +09:00
    // dateStr usually comes as YYYY-MM-DD.
    return new Date(`${targetDateStr}T00:00:00+09:00`);
}

export function getJstMonthRange(monthStr: string) {
    // monthStr: "YYYY-MM"
    // returns { start: Date, end: Date } in JST
    if (!/^\d{4}-\d{2}$/.test(monthStr)) {
        throw new Error('Invalid month string format. Expected YYYY-MM');
    }

    const [year, month] = monthStr.split('-').map(Number);

    // Start of month
    const mStr = String(month).padStart(2, '0');
    const startStr = `${year}-${mStr}-01T00:00:00+09:00`;
    const start = new Date(startStr);

    // Start of next month
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
    }
    const nmStr = String(nextMonth).padStart(2, '0');
    const endStr = `${nextYear}-${nmStr}-01T00:00:00+09:00`;
    const end = new Date(endStr);

    return { start, end };
}

export function getJstCurrentMonthStr() {
    // Returns YYYY-MM in JST
    const dateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
    return dateStr.slice(0, 7);
}

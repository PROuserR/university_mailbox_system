// lib/utils.ts

export default function formatDate(isoString: string | undefined): string {
    if (!isoString) return "";
    
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "";
        
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const isToday =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();

        const isThisYear = date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone,
            });
        }

        if (isThisYear) {
            return date.toLocaleDateString("ar-EG", {
                day: "2-digit",
                month: "short",
                timeZone,
            });
        }

        return date.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            timeZone,
        });
    } catch {
        return "";
    }
}
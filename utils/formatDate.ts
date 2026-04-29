export default function formatDate(isoString: string): string | undefined {
    if (isoString) {
        const date = new Date(isoString);
        const now = new Date();

        const isToday =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();

        const isThisYear = date.getFullYear() === now.getFullYear();

        if (isToday) {
            // HH:mm
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        }

        if (isThisYear) {
            // Month name + day (e.g., Apr 29)
            return date.toLocaleDateString('en-US', {
                month: 'short', // or 'long' → April
                day: '2-digit',
            });
        }

        // Different year → YYYY Month Day (e.g., 2023 Apr 29)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    }
}
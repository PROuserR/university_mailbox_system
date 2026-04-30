export default function formatDate(isoString: string | undefined) {
    if (isoString) {
        const date = new Date(isoString);
        const now = new Date();

        const isToday =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();

        const isThisYear = date.getFullYear() === now.getFullYear();

        if (isToday) {
            // HH:mm (Arabic numerals + format)
            return date.toLocaleTimeString('ar', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        }

        if (isThisYear) {
            // Month name + day (Arabic)
            return date.toLocaleDateString('ar', {
                month: 'short', // or 'long'
                day: '2-digit',
            });
        }

        // Different year → Year Month Day (Arabic)
        return date.toLocaleDateString('ar', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    }
}
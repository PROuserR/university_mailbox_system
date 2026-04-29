export default function getEmailContentPreview(html: string, wordLimit: number = 10): string {
    if (!html) return "";

    // 1. Remove HTML tags
    const text = html.replace(/<[^>]*>/g, " ");

    // 2. Decode common HTML entities (basic)
    const decoded = text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

    // 3. Normalize whitespace
    const clean = decoded.replace(/\s+/g, " ").trim();

    if (!clean) return "";

    // 4. Split into words
    const words = clean.split(" ");

    // 5. Take first N words
    const preview = words.slice(0, wordLimit).join(" ");

    // 6. Add ellipsis if trimmed
    return words.length > wordLimit ? preview + "..." : preview;
}
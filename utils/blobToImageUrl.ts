export default function blobToImageUrl(
    data: ArrayBuffer,
    mimeType: string = "image/png"
): string {
    const blob = new Blob([data], { type: mimeType });
    return URL.createObjectURL(blob);
}
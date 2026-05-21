"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { apiWrapper } from "@/utils/apiClient";
import blobToImageUrl from "@/utils/blobToImageUrl";

import LoadingCircleSpinner from "../ui/LoadingSpinner";

export default function MailFile({
    filePath,
    fileName,
    isImage,
}: {
    filePath: string;
    fileName: string | undefined;
    isImage: boolean;
}) {
    const [url, setUrl] =
        useState<string | null>(null);

    const [isDownloading, setIsDownloading] =
        useState(false);

    useEffect(() => {
        if (!isImage) return;

        let objectUrl: string;

        const load = async () => {
            try {
                const res =
                    await apiWrapper.get<ArrayBuffer>(
                        "/Attachments/download",
                        {
                            filePath,
                        },
                        {
                            responseType:
                                "blob",
                        }
                    );

                if (res.data) {
                    objectUrl =
                        blobToImageUrl(
                            res.data
                        );

                    setUrl(objectUrl);
                }
            } catch (error) {
                console.error(error);
            }
        };

        load();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(
                    objectUrl
                );
            }
        };
    }, [filePath, isImage]);

    const handleDownload =
        async () => {
            try {
                setIsDownloading(true);

                const response =
                    await apiWrapper.get<ArrayBuffer>(
                        "/Attachments/download",
                        {
                            filePath,
                        },
                        {
                            responseType:
                                "blob",
                        }
                    );

                const blob =
                    response.data;

                if (blob) {
                    const downloadUrl = blobToImageUrl(blob)
                    const link =
                        document.createElement(
                            "a"
                        );

                    link.href = downloadUrl;

                    link.download =
                        fileName ||
                        "downloaded-file";

                    document.body.appendChild(
                        link
                    );

                    link.click();

                    document.body.removeChild(
                        link
                    );

                    URL.revokeObjectURL(
                        downloadUrl
                    );
                }

            } catch (error) {
                console.error(
                    "Download failed:",
                    error
                );
            } finally {
                setIsDownloading(false);
            }
        };

    // IMAGE
    if (isImage) {
        if (!url)
            return <LoadingCircleSpinner />;

        return (
            <Image
                src={url}
                alt="Mail attachment image"
                width={600}
                height={600}
                className="rounded-2xl shadow-lg"
            />
        );
    }

    // FILE DOWNLOAD
    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="rounded-xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
            {isDownloading
                ? "جاري التحميل..."
                : `تحميل الملف: ${fileName}`}
        </button>
    );
}
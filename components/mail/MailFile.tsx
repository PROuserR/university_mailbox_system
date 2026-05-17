"use client";

import { apiWrapper } from "@/utils/apiClient";
import blobToImageUrl from "@/utils/blobToImageUrl";
import Image from "next/image";
import { useEffect, useState } from "react";
import LoadingCircleSpinner from "../ui/LoadingSpinner";

export default function MailFile({ filePath, fileName, isImage }: { filePath: string, fileName: string | undefined, isImage: boolean }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string;

        const load = async () => {
            const res = await apiWrapper.get<ArrayBuffer>(
                "/Attachments/view",
                {
                    filePath,
                },
                {
                    responseType: "blob",
                }
            );
            if (res.data) {

                const objectUrl = blobToImageUrl(res.data)
                setUrl(objectUrl)
            }
        };
        load();


    }, [filePath]);

    if (!url) return <LoadingCircleSpinner />;

    return <>
        {isImage ?
            <Image src={url} alt="Mail attachment image" width={600}
                height={600} /> :
            <a href={url} download={fileName} className="underline text-blue-600">
                Download file: {fileName}
            </a>}

    </>;
}
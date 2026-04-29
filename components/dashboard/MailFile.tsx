"use client";

import blobToImageUrl from "@/utils/blobToImageUrl";
import myAPI from "@/utils/myAPI";
import { useEffect, useState } from "react";

export default function MailFile({ filePath }: { filePath: string }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string;

        const load = async () => {
            const res = await myAPI.get("/attachment/view", {
                params: { filePath },
                responseType: "arraybuffer",
            });
            objectUrl = blobToImageUrl(res.data)

            setUrl(objectUrl);
        };

        load();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [filePath]);

    if (!url) return <div>Loading...</div>;

    return <img src={url} className="max-w-2xl mx-auto" />;
}
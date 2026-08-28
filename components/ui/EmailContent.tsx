// components/ui/EmailContent.tsx

"use client";

import { useRef, useEffect, useMemo } from "react";

interface EmailAttachment {
    id: number;
    fileName: string;
    fileSize: number;
    contentType: string;
    fileIdentifier: string;
    isInline: boolean;
    contentId?: string;
}

interface EmailContentProps {
    html?: string;
    text?: string;
    attachments?: EmailAttachment[];
    className?: string;
    height?: string | number;
    showPlainTextAsPre?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api";

export function EmailContent({
    html,
    text,
    attachments = [],
    className = "",
    height = "100%",
    showPlainTextAsPre = true,
}: EmailContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);

    // ✅ معالجة HTML واستبدال الصور المضمنة
    const processedHtml = useMemo(() => {
        if (!html) return null;

        let processed = html;

        if (attachments && attachments.length > 0) {
            const inlineImages = attachments.filter(att => att.isInline && att.contentId);
            
            inlineImages.forEach((att) => {
                if (att.contentId) {
                    const cidPattern = `cid:${att.contentId}`;
                    const cidPattern2 = `cid:${att.contentId.replace(/[<>]/g, '')}`;
                    const imageUrl = `${API_BASE_URL}/Attachments/${att.id}/view`;
                    
                    processed = processed.replace(new RegExp(cidPattern, 'g'), imageUrl);
                    processed = processed.replace(new RegExp(cidPattern2, 'g'), imageUrl);
                    
                    processed = processed.replace(
                        /src=["']cid:([^"']+)["']/g,
                        (match, cid) => {
                            const foundAtt = inlineImages.find(a => 
                                a.contentId === cid || 
                                a.contentId === `<${cid}>` || 
                                a.contentId === cid.replace(/[<>]/g, '')
                            );
                            if (foundAtt) {
                                return `src="${API_BASE_URL}/Attachments/${foundAtt.id}/view"`;
                            }
                            return match;
                        }
                    );
                }
            });
        }

        return processed;
    }, [html, attachments]);

    // ✅ تحديث Shadow DOM
    useEffect(() => {
        if (!containerRef.current || !processedHtml) return;

        if (!shadowRootRef.current) {
            const shadowRoot = containerRef.current.attachShadow({ mode: 'open' });
            shadowRootRef.current = shadowRoot;
        }

        const shadowRoot = shadowRootRef.current;
        shadowRoot.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.display = 'block';
        wrapper.style.width = '100%';
        wrapper.style.padding = '16px';
        wrapper.style.boxSizing = 'border-box';
        wrapper.style.background = '#ffffff';
        wrapper.style.color = '#1a1a1a';
        wrapper.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        wrapper.style.fontSize = '14px';
        wrapper.style.lineHeight = '1.6';
        wrapper.style.overflowWrap = 'break-word';
        wrapper.style.wordWrap = 'break-word';

        wrapper.innerHTML = processedHtml;

        shadowRoot.appendChild(wrapper);

        return () => {
            if (shadowRoot) {
                shadowRoot.innerHTML = '';
            }
        };
    }, [processedHtml]);

    // ===== عرض النص العادي =====
    if (text && !html) {
        return showPlainTextAsPre ? (
            <pre className={`whitespace-pre-wrap text-sm text-foreground ${className}`}>
                {text}
            </pre>
        ) : (
            <p className={`text-sm text-foreground ${className}`}>
                {text}
            </p>
        );
    }

    // ===== لا يوجد محتوى =====
    if (!html && !text) {
        return (
            <p className={`text-muted-foreground ${className}`}>
                لا يوجد محتوى
            </p>
        );
    }

    // ===== عرض HTML عبر Shadow DOM =====
    return (
        <div 
            ref={containerRef}
            className={className}
            style={{
                width: '100%',
                minHeight: '100px',
                overflow: 'auto',
                background: '#ffffff',
                borderRadius: '8px',
                height: height,
            }}
        />
    );
}
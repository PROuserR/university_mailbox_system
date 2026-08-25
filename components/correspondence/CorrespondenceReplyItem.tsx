// src/components/correspondence/CorrespondenceReplyItem.tsx

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CorrespondenceWithRepliesResponse, getStatusLabel, getStatusColor } from "@/types/api/correspondence.types";
import { format } from "date-fns";

interface CorrespondenceReplyItemProps {
    reply: CorrespondenceWithRepliesResponse;
    level?: number;
}

export function CorrespondenceReplyItem({ reply, level = 0 }: CorrespondenceReplyItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasReplies = reply.replies && reply.replies.length > 0;
    const statusLabel = getStatusLabel(reply.status);
    const statusColor = getStatusColor(reply.status);

    const getTypeLabel = (type: number) => {
        switch (type) {
            case 1: return "وارد";
            case 2: return "صادر";
            case 3: return "داخلي";
            default: return "غير محدد";
        }
    };

    const getTypeColor = (type: number) => {
        switch (type) {
            case 1: return "bg-emerald-100 text-emerald-700";
            case 2: return "bg-blue-100 text-blue-700";
            case 3: return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (date?: string | null) => {
        if (!date) return "";
        return format(new Date(date), "dd/MM/yyyy");
    };

    return (
        <div 
            className={cn(
                "border-r-2 border-gray-200 pr-4 mr-4",
                level > 0 && "mt-2"
            )}
            style={{ marginRight: level * 20 }}
        >
            {/* Reply Header */}
            <div className="flex items-start gap-3 py-2">
                {/* Toggle button for replies */}
                {hasReplies && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-6 w-6 shrink-0 mt-1"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                )}

                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {reply.senderEntity?.charAt(0) || "ج"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                            {reply.senderEntity || "جهة غير محددة"}
                        </span>
                        <Badge className={cn("text-[10px]", getTypeColor(reply.mainType))}>
                            {getTypeLabel(reply.mainType)}
                        </Badge>
                        {reply.isProfessional && (
                            <Badge variant="professional" className="text-[10px]">مهني</Badge>
                        )}
                        <Badge className={cn("text-[10px]", statusColor)}>
                            {statusLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            #{reply.number}
                        </span>
                    </div>

                    <p className="text-sm font-medium text-foreground mt-0.5">
                        {reply.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>📅 {formatDate(reply.issuedDate)}</span>
                        {reply.repliesCount > 0 && (
                            <span>💬 {reply.repliesCount} ردود</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply Content (collapsible) */}
            {isExpanded && (
                <div className="mr-11 space-y-2">
                    {reply.content && (
                        <div 
                            className="text-sm text-muted-foreground prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: reply.content }}
                        />
                    )}

                    {/* Attachments */}
                    {reply.attachments && reply.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {reply.attachments.map((att) => (
                                <span 
                                    key={att.id} 
                                    className="text-xs bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1"
                                >
                                    <FileText className="h-3 w-3" />
                                    {att.fileName}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Nested Replies */}
                    {hasReplies && (
                        <div className="mt-2">
                            {reply.replies!.map((childReply) => (
                                <CorrespondenceReplyItem
                                    key={childReply.id}
                                    reply={childReply}
                                    level={level + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
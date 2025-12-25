'use client';

import {
    FileText, Download, Link as LinkIcon, Trash2, Loader2,
    Image as ImageIcon, Video, Music, Code, Archive, Pin, PinOff
} from 'lucide-react';
import { FileItem, deleteFile } from '@/app/actions';
import { useState } from 'react';

interface FileCardProps {
    file: FileItem;
    isPinned: boolean;
    onTogglePin: (key: string) => void;
    onDeleted: () => void;
}

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': case 'svg':
            return <ImageIcon size={20} />;
        case 'mp4': case 'webm': case 'mov':
            return <Video size={20} />;
        case 'mp3': case 'wav': case 'ogg':
            return <Music size={20} />;
        case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
            return <Archive size={20} />;
        case 'js': case 'ts': case 'tsx': case 'jsx': case 'html': case 'css': case 'json':
            return <Code size={20} />;
        default:
            return <FileText size={20} />;
    }
};

export function FileCard({ file, isPinned, onTogglePin, onDeleted }: FileCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        setIsDeleting(true);
        try {
            await deleteFile(file.key);
            onDeleted();
        } catch (e) {
            alert('Failed to delete file');
            setIsDeleting(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(file.url);
                alert('Link copied!');
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = file.url;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('Link copied!');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                    alert('Failed to copy link');
                }
                document.body.removeChild(textArea);
            }
        } catch (e: any) {
            console.error('Copy failed', e);
            alert(`Failed to copy link: ${e.message}`);
        }
    };

    return (
        <div className={`
            group relative bg-white/5 border rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm
            ${isPinned ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:bg-white/10'}
        `}>
            {isPinned && (
                <div className="absolute top-2 right-2 text-indigo-400 rotate-45">
                    <Pin size={12} fill="currentColor" />
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div className={`p-3 rounded-lg ${isPinned ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700/50 text-slate-300'}`}>
                    {getFileIcon(file.key)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg p-1 backdrop-blur-md absolute top-2 right-2 z-10">
                    <button
                        onClick={() => onTogglePin(file.key)}
                        className={`p-1.5 rounded transition-colors ${isPinned ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-400 hover:text-white'}`}
                        title={isPinned ? "Unpin" : "Pin"}
                    >
                        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                    </button>
                    <a
                        href={file.url}
                        download={file.key}
                        className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Download"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Download size={16} />
                    </a>
                    <button
                        onClick={handleCopyLink}
                        className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Copy Link"
                    >
                        <LinkIcon size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="font-medium truncate text-slate-200" title={file.key}>
                    {file.key}
                </h3>
                <div className="flex justify-between items-end mt-2">
                    <p className="text-xs text-slate-500 font-medium">
                        {formatSize(file.size)}
                    </p>
                    <p className="text-xs text-slate-500 text-right">
                        {formatDate(file.lastModified)}
                    </p>
                </div>
            </div>
        </div>
    );
}

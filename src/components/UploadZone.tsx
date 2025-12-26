'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useStorage } from '@/context/StorageContext';

interface UploadZoneProps {
    onUploadComplete: () => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
    const { uploadFile: contextUploadFile } = useStorage();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const uploadFile = async (file: File) => {
        try {
            await contextUploadFile(file);
        } catch (error) {
            console.error('Upload failed', error);
            throw error;
        }
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            await Promise.all(files.map(uploadFile));
            onUploadComplete();
        } catch (error: any) {
            console.error(error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    }, [onUploadComplete]);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setIsUploading(true);
        try {
            await Promise.all(Array.from(e.target.files!).map(uploadFile));
            onUploadComplete();
        } catch (error: any) {
            console.error(error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div
            className={`
        border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
        flex flex-col items-center gap-4
        ${isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                    : 'border-white/20 hover:border-indigo-500/50 hover:bg-white/5'}
        ${isUploading ? 'opacity-75 pointer-events-none' : ''}
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
        >
            <input
                type="file"
                id="fileInput"
                multiple
                className="hidden"
                onChange={handleFileInput}
            />

            <div className={`
        w-16 h-16 rounded-full flex items-center justify-center transition-colors
        ${isDragging ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 group-hover:text-indigo-400'}
      `}>
                {isUploading ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={32} />}
            </div>

            <div className="space-y-1">
                {isUploading ? (
                    <p className="text-lg font-medium text-slate-200">Uploading...</p>
                ) : (
                    <>
                        <p className="text-lg font-medium text-slate-200">Click or drag files to upload</p>
                        <p className="text-sm text-slate-400">Support for all file types under 50MB</p>
                    </>
                )}
            </div>
        </div>
    );
}

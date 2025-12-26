'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageProvider, FileItem } from '@/lib/storage/types';
import { supabaseProvider } from '@/lib/storage/supabase-provider';
import { firebaseProvider } from '@/lib/storage/firebase-provider';

interface StorageContextType {
    providerName: 'supabase' | 'firebase';
    setProviderName: (name: 'supabase' | 'firebase') => void;
    files: FileItem[];
    isLoading: boolean;
    error: string | null;
    uploadFile: (file: File) => Promise<void>;
    deleteFile: (key: string) => Promise<void>;
    refreshFiles: () => void;
}

const StorageContext = createContext<StorageContextType | null>(null);

export function StorageProviderWrapper({ children }: { children: React.ReactNode }) {
    const [providerName, setProviderName] = useState<'supabase' | 'firebase'>('supabase');
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Initial load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('storageProvider');
        if (saved === 'firebase' || saved === 'supabase') {
            setProviderName(saved);
        }
    }, []);

    // Persist selection
    useEffect(() => {
        localStorage.setItem('storageProvider', providerName);
        setError(null); // Clear error on switch
        setFiles([]); // Clear files on switch to avoid confusion
    }, [providerName]);

    const activeProvider: StorageProvider = providerName === 'firebase' ? firebaseProvider : supabaseProvider;

    const refreshFiles = () => {
        setRefreshTrigger(prev => prev + 1);
    }

    useEffect(() => {
        const fetchFiles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await activeProvider.listFiles();
                setFiles(data);
            } catch (error: any) {
                console.error("Failed to list files", error);
                setError(error.message);
                setFiles([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFiles();
    }, [providerName, refreshTrigger]);

    const uploadFile = async (file: File) => {
        setError(null);
        try {
            await activeProvider.uploadFile(file);
            refreshFiles();
        } catch (error: any) {
            setError(error.message);
            throw error;
        }
    };

    const deleteFile = async (key: string) => {
        setError(null);
        try {
            await activeProvider.deleteFile(key);
            refreshFiles();
        } catch (error: any) {
            setError(error.message);
            throw error;
        }
    };

    return (
        <StorageContext.Provider value={{
            providerName,
            setProviderName,
            files,
            isLoading,
            error,
            uploadFile,
            deleteFile,
            refreshFiles
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('useStorage must be used within a StorageProviderWrapper');
    }
    return context;
}

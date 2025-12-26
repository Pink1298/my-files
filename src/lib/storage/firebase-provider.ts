import { StorageProvider, FileItem } from './types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, listAll, getDownloadURL, getMetadata, deleteObject } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Singleton Firebase App
const app = (() => {
    if (!firebaseConfig.apiKey) {
        return null; // Don't initialize if no config
    }
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
})();

const storage = app ? getStorage(app) : null;

export const firebaseProvider: StorageProvider = {
    name: 'firebase',

    async uploadFile(file: File): Promise<string> {
        if (!storage) throw new Error("Firebase is not configured. Please check your .env.local file.");
        const _storage = storage; // Local reference for TS inference
        const sanitizedName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${sanitizedName}`;
        const storageRef = ref(_storage, fileName);

        await uploadBytes(storageRef, file);
        return fileName;
    },

    async listFiles(): Promise<FileItem[]> {
        if (!storage) throw new Error("Firebase is not configured. Please check your .env.local file.");
        const _storage = storage;
        const listRef = ref(_storage); // Root ref, maybe should use a folder?
        const res = await listAll(listRef);

        const files: FileItem[] = await Promise.all(res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const metadata = await getMetadata(itemRef);
            return {
                key: itemRef.name,
                size: metadata.size,
                lastModified: metadata.updated,
                url: url
            };
        }));

        return files.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    },

    async deleteFile(key: string): Promise<void> {
        if (!storage) throw new Error("Firebase is not configured. Please check your .env.local file.");
        const _storage = storage;
        const storageRef = ref(_storage, key);
        await deleteObject(storageRef);
    }
};

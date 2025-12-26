export interface FileItem {
    key: string;
    size: number;
    lastModified: string;
    url: string;
}

export interface StorageProvider {
    name: 'supabase' | 'firebase';
    uploadFile(file: File): Promise<string>;
    listFiles(): Promise<FileItem[]>;
    deleteFile(key: string): Promise<void>;
}

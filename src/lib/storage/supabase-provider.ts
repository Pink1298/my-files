import { StorageProvider, FileItem } from './types';
import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'files';

export const supabaseProvider: StorageProvider = {
    name: 'supabase',

    async uploadFile(file: File): Promise<string> {
        const sanitizedName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${sanitizedName}`;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;
        return fileName;
    },

    async listFiles(): Promise<FileItem[]> {
        const { data, error } = await supabase
            .storage
            .from(BUCKET_NAME)
            .list();

        if (error || !data) {
            console.error('Error listing files:', error);
            return [];
        }

        return data.map((item) => {
            const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.name);
            return {
                key: item.name,
                size: item.metadata?.size || 0,
                lastModified: item.updated_at || item.created_at,
                url: publicUrl
            };
        }).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    },

    async deleteFile(key: string): Promise<void> {
        const { error } = await supabase
            .storage
            .from(BUCKET_NAME)
            .remove([key]);

        if (error) throw new Error(error.message);
    }
};

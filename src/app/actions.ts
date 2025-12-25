'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Using Anon key for client-like access on server or Service Role if needed

// Note: For deletion without RLS for non-authenticated users, you might need SERVICE_ROLE key.
// Ideally, RLS should govern this. I'll use ANON key assuming policies allow it or user adds SERVICE key.
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'files';

export interface FileItem {
    key: string; // name
    size: number;
    lastModified: string;
    url: string;
}

export async function listFiles(): Promise<FileItem[]> {
    const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list();

    if (error) {
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
}

export async function deleteFile(key: string) {
    const { error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .remove([key]);

    if (error) {
        throw new Error(error.message);
    }
}

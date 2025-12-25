import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Supabase File Manager',
    description: 'Manage your files with Supabase and Next.js',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, "antialiased bg-slate-900 text-slate-50 min-h-screen")}>
                {children}
            </body>
        </html>
    );
}

'use client';

import { UploadZone } from './UploadZone';
import { FileCard } from './FileCard';
import { RefreshCw, ArrowUpWideNarrow, ArrowDownWideNarrow, Settings, X, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStorage } from '@/context/StorageContext';

export function Dashboard() {
    const { files, providerName, setProviderName, refreshFiles, isLoading, error } = useStorage();

    const [pinnedFiles, setPinnedFiles] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showSettings, setShowSettings] = useState(false);

    // Load pinned files from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pinnedFiles');
            if (saved) setPinnedFiles(JSON.parse(saved));
        }
    }, []);

    const togglePin = (key: string) => {
        const newPinned = pinnedFiles.includes(key)
            ? pinnedFiles.filter(k => k !== key)
            : [...pinnedFiles, key];
        setPinnedFiles(newPinned);
        localStorage.setItem('pinnedFiles', JSON.stringify(newPinned));
    };

    const sortedFiles = [...(files || [])]
        .filter(file => file.key.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            // Pinned files always first
            const aPinned = pinnedFiles.includes(a.key);
            const bPinned = pinnedFiles.includes(b.key);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;

            // Then custom sort
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.key.localeCompare(b.key);
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'type':
                    const extA = a.key.split('.').pop() || '';
                    const extB = b.key.split('.').pop() || '';
                    comparison = extA.localeCompare(extB);
                    break;
                case 'date':
                default:
                    comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen relative">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        File Manager
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">{`Secure file storage with Bong map with love <3`}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:rotate-90"
                        onClick={() => setShowSettings(true)}
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all ${isLoading ? 'animate-spin' : 'hover:rotate-180 duration-500'}`}
                        onClick={refreshFiles}
                        disabled={isLoading}
                        title="Refresh"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </header>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Storage Provider</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setProviderName('supabase')}
                                        className={`px-4 py-3 rounded-xl border transition-all ${providerName === 'supabase'
                                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        Supabase
                                    </button>
                                    <button
                                        disabled
                                        onClick={() => setProviderName('firebase')}
                                        className={`px-4 py-3 rounded-xl border transition-all ${providerName === 'firebase'
                                            ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        Firebase
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Current Provider: <span className="text-white font-medium capitalize">{providerName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="mb-10">
                <UploadZone onUploadComplete={refreshFiles} />
            </div>

            <section className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-20 shadow-xl shadow-black/20">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-black/30 transition-colors"
                        />
                        <svg className="absolute left-3.5 top-3 text-slate-500" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <div className="flex items-center bg-black/20 border border-white/10 rounded-xl p-1">
                            <button
                                onClick={() => setSortBy('date')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'date' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Date
                            </button>
                            <button
                                onClick={() => setSortBy('name')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'name' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Name
                            </button>
                            <button
                                onClick={() => setSortBy('size')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'size' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Size
                            </button>
                            <button
                                onClick={() => setSortBy('type')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'type' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Type
                            </button>
                        </div>

                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="min-w-[42px] h-[42px] flex items-center justify-center rounded-xl bg-black/20 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                        >
                            {sortOrder === 'asc' ? (
                                <ArrowUpWideNarrow size={20} />
                            ) : (
                                <ArrowDownWideNarrow size={20} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center px-2">
                    <h2 className="text-lg font-medium text-slate-300">
                        {searchQuery ? `Found ${sortedFiles.length} results` : 'All Files'}
                    </h2>
                    <span className="text-xs font-mono text-slate-500 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">{files.length} Total</span>
                </div>

                {sortedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-600">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <p className="text-lg text-slate-400 font-medium">No files found</p>
                        <p className="text-sm text-slate-600 mt-1">{searchQuery ? 'Try adjusting your search' : 'Upload some files to get started'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedFiles.map((file) => (
                            <FileCard
                                key={file.key}
                                file={file}
                                isPinned={pinnedFiles.includes(file.key)}
                                onTogglePin={togglePin}
                                onDeleted={refreshFiles}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

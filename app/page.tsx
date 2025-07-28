'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { Plus, Search, FileText, LogIn, ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, getNotes, deleteNote, type GetNotesOptions } from '@/lib/storage';
import NoteCard from '@/components/note-card';

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

interface NotesData {
  notes: Note[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function HomePage() {
  const [notesData, setNotesData] = useState<NotesData>({
    notes: [],
    total: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isLoading, setIsLoading] = useState(true);
  
  // Use a ref to track the last fetch time to prevent rapid refetches
  const lastFetchTime = useRef(0);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Handle unauthenticated state if needed
    },
  });

  // Load notes with current filters and pagination
  const loadNotes = useCallback(async (options: Partial<GetNotesOptions> = {}) => {
    if (status !== 'authenticated' || !session?.user?.email) return;
    
    const now = Date.now();
    // Prevent rapid refetches (throttle to at most once per 500ms)
    if (now - lastFetchTime.current < 500) return;
    
    lastFetchTime.current = now;
    
    setIsLoading(true);
    try {
      const result = getNotes(session.user.email, {
        search: searchTerm,
        sortBy,
        page: options.page || 1,
        perPage: 6, // Fixed at 6 items per page
        includeDeleted: false,
        ...options
      });
      
      console.log('Loaded notes:', result); // Debug log
      setNotesData(result);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotesData({
        notes: [],
        total: 0,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [status, session, searchTerm, sortBy]);

  // Load notes when component mounts or when dependencies change
  useEffect(() => {
    // Use a small timeout to batch state updates
    const timer = setTimeout(() => {
      loadNotes();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [loadNotes, status, session?.user?.email]); // Only re-run if user email changes

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes({ page: 1 });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, loadNotes]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > notesData.totalPages) return;
    loadNotes({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption;
    setSortBy(newSort);
    // Reset to first page when changing sort
    loadNotes({ sortBy: newSort, page: 1 });
  };

  // Handle note deletion
  const handleDelete = (id: string) => {
    if (session?.user?.email) {
      deleteNote(session.user.email, id);
      // Reload notes after deletion
      loadNotes({ page: 1 });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div 
                  key={i} 
                  className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!session) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          >
            <FileText className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Welcome to QuickNotes
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 dark:text-gray-300 mb-6"
          >
            Sign in to create and manage your notes
          </motion.p>
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => signIn()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <div>
            <motion.h1 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
            >
              Welcome back, {session?.user?.name || 'User'}!
            </motion.h1>
            <motion.p 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-gray-600 dark:text-gray-400 mt-1"
            >
              You have {notesData.total} note{notesData.total !== 1 ? 's' : ''}
            </motion.p>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all w-full justify-center"
            >
              <Plus className="w-5 h-5" />
              New Note
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="relative max-w-lg flex-1"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </motion.div>
          
          <motion.div 
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="relative w-full md:w-48"
          >
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ArrowDown className="h-4 w-4 text-gray-400" />
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {notesData.notes.length > 0 ? (
            <>
              <motion.div 
                key="notes-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {notesData.notes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.1 * (index % 6),
                      duration: 0.3 
                    }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <NoteCard
                      note={note}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              <AnimatePresence>
                {notesData.totalPages > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6"
                  >
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Page <span className="font-medium">{notesData.page}</span> of{' '}
                      <span className="font-medium">{notesData.totalPages}</span>{' '}
                      (showing {notesData.notes.length} of {notesData.total} notes)
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(notesData.page - 1)}
                        disabled={!notesData.hasPrevious}
                        className={`p-2 rounded-md ${
                          notesData.hasPrevious
                            ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, notesData.totalPages) }, (_, i) => {
                        // Show first, last and current page with neighbors
                        let pageNum;
                        if (notesData.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (notesData.page <= 3) {
                          pageNum = i + 1;
                        } else if (notesData.page >= notesData.totalPages - 2) {
                          pageNum = notesData.totalPages - 4 + i;
                        } else {
                          pageNum = notesData.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-md flex items-center justify-center ${
                              notesData.page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(notesData.page + 1)}
                        disabled={!notesData.hasNext}
                        className={`p-2 rounded-md ${
                          notesData.hasNext
                            ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
            >
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: 'easeInOut'
                }}
              >
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
              </motion.div>
              <motion.h3 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mt-4 text-lg font-medium text-gray-900 dark:text-white"
              >
                {searchTerm ? 'No matching notes found' : 'No notes yet'}
              </motion.h3>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="mt-1 text-gray-500 dark:text-gray-400"
              >
                {searchTerm 
                  ? 'Try a different search term' 
                  : 'Create your first note by clicking the button above'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

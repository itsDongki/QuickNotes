'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowLeft, RotateCcw, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDeletedNotes, restoreNote, permanentlyDeleteNote } from '@/lib/storage';
import { Note } from '@/lib/storage';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TrashPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  
  const router = useRouter();
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const notes = getDeletedNotes(session.user.email);
      setDeletedNotes(notes);
      setIsLoading(false);
    }
  }, [status, session]);

  const handleRestore = (noteId: string) => {
    if (!session?.user?.email) return;
    
    const success = restoreNote(session.user.email, noteId);
    if (success) {
      setDeletedNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  const handlePermanentDelete = (noteId: string) => {
    if (!session?.user?.email) return;
    
    const success = permanentlyDeleteNote(session.user.email, noteId);
    if (success) {
      setDeletedNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Notes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Trash2 className="w-6 h-6 mr-2 text-red-500" />
            Trash
          </h1>
          <div className="w-24"></div> {/* For alignment */}
        </div>

        {deletedNotes.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notes in trash</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Notes you delete will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {deletedNotes.length} {deletedNotes.length === 1 ? 'note' : 'notes'} in trash
                </p>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {deletedNotes.map((note) => (
                  <li key={note.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {note.title || 'Untitled Note'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Deleted on {new Date(note.deletedAt || '').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <motion.button
                          onClick={() => handleRestore(note.id)}
                          className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Restore note"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handlePermanentDelete(note.id)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Delete permanently"
                        >
                          <Trash className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

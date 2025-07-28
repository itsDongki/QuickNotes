'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';
import { addNote, MediaItem } from '@/lib/storage';
import { useSession } from 'next-auth/react';
import MediaUploader from '@/components/MediaUploader';

export default function NewNotePage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Please add a title or content before saving.');
      return;
    }

    setIsSaving(true);
    
    try {
      if (!session?.user?.email) {
        throw new Error('User not authenticated');
      }
      
      const newNote = addNote(session.user.email, {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        media,
      });
      
      // Navigate to the newly created note
      router.push(`/note/${newNote.id}`);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (confirm('Are you sure you want to discard this note?')) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to notes</span>
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || (!title.trim() && !content.trim() && media.length === 0)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 mr-2 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 -ml-1" />
                Save Note
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-0 py-2 text-3xl font-bold bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="min-h-[200px]">
          <textarea
            placeholder="Start writing your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-0 text-gray-700 bg-transparent border-0 resize-none focus:ring-0 dark:text-gray-200 placeholder-gray-400"
            rows={10}
          />
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">Media</h3>
          <MediaUploader
            onMediaUpload={(mediaItem) => setMedia(prev => [...prev, mediaItem])}
            onMediaRemove={(mediaId) => setMedia(prev => prev.filter(item => item.id !== mediaId))}
            mediaItems={media}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-2">Tips:</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>Use Ctrl+S (Cmd+S on Mac) to quickly save your note</li>
          <li>Your notes are automatically saved to your browser&apos;s local storage</li>
          <li>You can use markdown formatting for better organization</li>
        </ul>
      </div>
    </div>
  );
}

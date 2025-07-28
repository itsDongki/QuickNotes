'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Edit, 
  X, 
  Image as ImageIcon, 
  Music, 
  Video, 
  File, 
  X as CloseIcon, 
  ChevronLeft, 
  ChevronRight, 
  Play 
} from 'lucide-react';
import { getNoteById, updateNote, deleteNote, type Note, type MediaItem } from '@/lib/storage';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface MediaViewerProps {
  media: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

interface MediaUploaderProps {
  onMediaUpload: (media: MediaItem) => void;
  onMediaRemove: (id: string) => void;
  mediaItems: MediaItem[];
  onMediaClick?: (index: number) => void;
}

// Button variants
const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98
  }
};

// Animation variants for the media viewer
const viewerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: [0.4, 0, 0.2, 1] as const
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
};

// Animation variants for media items
const mediaItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    } as const
  }),
  hover: {
    scale: 1.02,
    transition: { 
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    } as const
  },
  tap: {
    scale: 0.98
  }
};

// Media viewer component
const MediaViewer = ({ media, currentIndex, onClose, onNext, onPrev }: MediaViewerProps) => {
  if (!media.length) return null;
  
  const currentMedia = media[currentIndex];
  const isImage = ['image', 'gif'].includes(currentMedia.type);
  const isVideo = currentMedia.type === 'video';

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={viewerVariants}
      >
        <motion.button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-20"
          aria-label="Close media viewer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <CloseIcon size={24} />
        </motion.button>
        
        {media.length > 1 && (
          <motion.button
            onClick={onPrev}
            className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            aria-label="Previous media"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={32} />
          </motion.button>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            className="relative max-w-full max-h-[90vh] flex items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {isImage && (
              <motion.img 
                src={currentMedia.url} 
                alt={currentMedia.name}
                className="max-w-full max-h-[90vh] object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              />
            )}
            {isVideo && (
              <motion.video 
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {media.length > 1 && (
          <motion.button
            onClick={onNext}
            className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            aria-label="Next media"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={32} />
          </motion.button>
        )}
        
        <motion.div 
          className="absolute bottom-8 left-0 right-0 flex justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {media.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              onClick={() => {
                // This will be handled by the parent component
                if (index < currentIndex) {
                  // If clicking a dot to the left, go back that many times
                  const steps = (currentIndex - index) % media.length;
                  for (let i = 0; i < steps; i++) onPrev();
                } else if (index > currentIndex) {
                  // If clicking a dot to the right, go forward that many times
                  const steps = (index - currentIndex) % media.length;
                  for (let i = 0; i < steps; i++) onNext();
                }
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Dynamically import MediaUploader with no SSR
const MediaUploader = dynamic(
  () => import('@/components/MediaUploader'),
  { ssr: false }
);

interface NotePageProps {
  params: {
    id: string;
  };
}

export default function NotePage({ params }: NotePageProps) {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const searchParams = useSearchParams();
  const editMode = searchParams.get('edit') === 'true';
  
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(editMode);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  const contentEditableRef = useRef<HTMLDivElement>(null);

  // Handle paste events for images and other content
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isEditing || !e.clipboardData) return;
    
    const items = e.clipboardData.items;
    if (!items) return;

    // Check for image in clipboard
    let hasImage = false;
    for (let i = 0; i <items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        e.preventDefault();
        e.stopPropagation();
        
        const file = items[i].getAsFile();
        if (!file) continue;

        // Create a data URL for the image
        const dataUrl = URL.createObjectURL(file);
        
        // Create a new media item
        const newMedia: MediaItem = {
          id: `media-${Date.now()}`,
          type: file.type.includes('gif') ? 'gif' : 'image',
          url: dataUrl,
          name: `pasted-${Date.now()}.${file.type.split('/')[1] || 'png'}`,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };

        // Add to media array
        setMedia(prev => [...prev, newMedia]);
        
        // Update the content state
        if (contentEditableRef.current) {
          setContent(contentEditableRef.current.innerText);
        }
        
        break;
      }
    }

    // If no image was found, let the default paste behavior handle it
    if (!hasImage) {
      // Update content after the default paste occurs
      setTimeout(() => {
        if (contentEditableRef.current) {
          setContent(contentEditableRef.current.innerText);
        }
      }, 0);
    }
  }, [isEditing]);

  // Set up and clean up paste event listener
  useEffect(() => {
    const contentEditable = contentEditableRef.current;
    if (!contentEditable || !isEditing) return;

    const pasteHandler = (e: Event) => {
      handlePaste(e as ClipboardEvent);
    };

    contentEditable.addEventListener('paste', pasteHandler);
    return () => {
      contentEditable.removeEventListener('paste', pasteHandler);
    };
  }, [isEditing, handlePaste]);

  // Load note data
  useEffect(() => {
    if (!session?.user?.email) return;
    
    const foundNote = getNoteById(session.user.email, params.id);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content);
      setMedia(foundNote.media || []);
    }
    setIsLoading(false);
    
    // Check if we should be in edit mode
    if (editMode) {
      setIsEditing(true);
    }
  }, [params.id, session?.user?.email, editMode]);

  const handleSave = async () => {
    // Prevent multiple saves
    if (isSaving || !note || !session?.user?.email) return;
    
    try {
      setIsSaving(true);
      await updateNote(session.user.email, note.id, {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        media,
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!note || !session?.user?.email) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(session.user.email, note.id);
      router.push('/');
    }
  };

  const handleMediaUpload = useCallback((newMedia: MediaItem) => {
    setMedia(prev => [...prev, newMedia]);
  }, []);

  const handleMediaRemove = useCallback((mediaId: string) => {
    setMedia(prev => prev.filter(item => item.id !== mediaId));
  }, []);

  const renderMedia = useCallback(() => {
    if (!media || media.length === 0) return null;

    const mediaGridVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
          when: 'beforeChildren',
          staggerChildren: 0.1
        } as const
      }
    };

    return (
      <motion.div 
        className="mt-8"
        variants={mediaGridVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
      >
        <motion.h3 
          className="text-xl font-semibold mb-4 flex items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            <ImageIcon className="w-5 h-5 mr-2 inline-block" />
          </motion.span>
          Media
        </motion.h3>
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          layout
        >
          <AnimatePresence>
            {media.map((item, index) => (
              <motion.div 
                key={item.id}
                className="relative group"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={mediaItemVariants}
                custom={index}
                whileHover="hover"
                whileTap="tap"
                onClick={() => {
                  setCurrentMediaIndex(index);
                  setViewerOpen(true);
                }}
                layout
              >
                <motion.div 
                  className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.type === 'image' || item.type === 'gif' ? (
                    <motion.img 
                      src={item.url} 
                      alt={item.name} 
                      className="cursor-pointer w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : item.type === 'audio' ? (
                    <motion.div 
                      className="p-4 w-full"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-4 flex items-center space-x-2">
                        <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {item.name}
                        </span>
                      </div>
                    </motion.div>
                  ) : item.type === 'video' ? (
                    <motion.div
                      className="relative w-full h-full"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <video 
                        src={item.url} 
                        className="w-full h-full object-contain bg-black"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="p-4 text-center w-full h-full flex flex-col items-center justify-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <File className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {item.name}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
                {isEditing && (
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMediaRemove(item.id);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Remove media"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }, [media, isEditing, handleMediaRemove]);

  // Memoize the media uploader component to prevent unnecessary re-renders
  const mediaUploader = useMemo(() => (
    <MediaUploader
      onMediaUpload={handleMediaUpload}
      onMediaRemove={handleMediaRemove}
      mediaItems={media}
      onMediaClick={(index: number) => {
        setCurrentMediaIndex(index);
        setViewerOpen(true);
      }}
    />
  ), [handleMediaUpload, handleMediaRemove, media]);

  // Handle media viewer navigation
  const handleNextMedia = useCallback(() => {
    setCurrentMediaIndex(prev => (prev + 1) % media.length);
  }, [media.length]);

  const handlePrevMedia = useCallback(() => {
    setCurrentMediaIndex(prev => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  // Close media viewer when media array is empty
  useEffect(() => {
    if (media.length === 0) {
      setViewerOpen(false);
    }
  }, [media]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Note not found</h1>
        <Link 
          href="/" 
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to notes
        </Link>
      </div>
    );
  }

  // Animation variants for the header
  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
        when: 'beforeChildren',
        staggerChildren: 0.1
      } as const
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <motion.div variants={headerVariants}>
          <Link 
            href="/" 
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <motion.span 
              className="flex items-center"
              whileHover={{ x: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to notes
            </motion.span>
          </Link>
        </motion.div>

        <motion.div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block mr-2"
                    >
                      ⏳
                    </motion.span>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                Cancel
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                <Edit className="h-4 w-4" />
                Edit
              </motion.button>
              <motion.button
                onClick={handleDelete}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                title="Delete note"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                <Trash2 className="h-5 w-5" />
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>

      {isEditing ? (
        <div className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none py-2"
            placeholder="Note title"
          />
          <div className="relative">
            <div
              ref={contentEditableRef}
              className="w-full min-h-[300px] p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-pre-wrap outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:dark:text-gray-500"
              data-placeholder="Start writing your note here (paste images directly here)..."
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setContent(e.currentTarget.innerText || '')}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <div className="mt-4">
              {mediaUploader}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {renderMedia()}
        </div>
      )}

      {/* Media Viewer - outside of isEditing condition */}
      {viewerOpen && media.length > 0 && (
        <MediaViewer
          media={media}
          currentIndex={currentMediaIndex}
          onClose={() => setViewerOpen(false)}
          onNext={() => setCurrentMediaIndex(prev => (prev + 1) % media.length)}
          onPrev={() => setCurrentMediaIndex(prev => (prev - 1 + media.length) % media.length)}
        />
      )}
    </div>
  );
}
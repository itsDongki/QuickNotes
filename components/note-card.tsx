'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Edit, Calendar, Image as ImageIcon, Music, Video, File } from 'lucide-react';
import { Note, MediaItem } from '@/lib/storage';
import DeleteConfirmation from './delete-confirmation';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to move this note to trash? You can restore it later from the trash.')) {
      setIsDeleting(true);
      onDelete(note.id);
    }
  };

  const renderMediaThumbnail = (mediaItem: MediaItem) => {
    if (mediaItem.type === 'image' || mediaItem.type === 'gif') {
      return (
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
          <Image
            src={mediaItem.url}
            alt={mediaItem.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      );
    }
    
    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
        {mediaItem.type === 'audio' ? (
          <Music className="w-8 h-8 text-gray-400" />
        ) : mediaItem.type === 'video' ? (
          <Video className="w-8 h-8 text-gray-400" />
        ) : (
          <File className="w-8 h-8 text-gray-400" />
        )}
      </div>
    );
  };

  return (
    <div className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {isDeleting && (
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      <Link href={`/note/${note.id}`} className="block">
        {/* Media Thumbnail */}
        {note.media?.length > 0 && (
          <div className="mb-3">
            {renderMediaThumbnail(note.media[0])}
            {note.media.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                +{note.media.length - 1} more
              </div>
            )}
          </div>
        )}
        
        <div className="p-4 pt-2">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {note.title || 'Untitled Note'}
          </h3>

          {/* Content Preview */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3 leading-relaxed">
            {getPreview(note.content) || 'No content'}
          </p>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(note.updatedAt)}</span>
          </div>

          {/* Media count */}
          {note.media?.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <ImageIcon className="w-3 h-3" />
              <span>{note.media.length} {note.media.length === 1 ? 'attachment' : 'attachments'}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-full">
          <Link
            href={`/note/${note.id}?edit=true`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Edit note"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(e);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Move to trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Link>


    </div>
  );
}

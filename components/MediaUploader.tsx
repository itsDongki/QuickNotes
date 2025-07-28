'use client';

import { useState, useRef, ChangeEvent, useCallback } from 'react';
import Image from 'next/image';
import { Plus, X, Image as ImageIcon, Music, Video, File } from 'lucide-react';
import { MediaItem } from '@/lib/storage';
import { isFileTypeAllowed, isFileSizeValid, createMediaItem } from '@/lib/media';

interface MediaUploaderProps {
  onMediaUpload: (media: MediaItem) => void;
  onMediaRemove: (mediaId: string) => void;
  mediaItems: MediaItem[];
  onMediaClick?: (index: number) => void;
}

export default function MediaUploader({ 
  onMediaUpload, 
  onMediaRemove, 
  mediaItems, 
  onMediaClick 
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await processFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemove = useCallback((mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onMediaRemove(mediaId);
  }, [onMediaRemove]);

  const handleItemClick = useCallback((index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onMediaClick?.(index);
  }, [onMediaClick]);

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      if (!isFileTypeAllowed(file)) {
        setError(`File type not supported: ${file.name}`);
        continue;
      }

      if (!isFileSizeValid(file)) {
        setError(`File too large (max 10MB): ${file.name}`);
        continue;
      }

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const mediaItem = createMediaItem(file, dataUrl);
          onMediaUpload(mediaItem);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error processing file:', err);
        setError(`Error processing file: ${file.name}`);
      }
    }
  };

  const renderMediaItem = (item: MediaItem, index: number) => (
    <div 
      key={item.id} 
      className="relative group cursor-pointer"
      onClick={handleItemClick(index)}
    >
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        {item.type === 'image' || item.type === 'gif' ? (
          <div className="relative w-full h-full">
            <Image
              src={item.url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : item.type === 'audio' ? (
          <div className="p-4 w-full">
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-4 flex items-center space-x-2">
              <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {item.name}
              </span>
            </div>
            <audio 
              src={item.url} 
              controls 
              className="w-full mt-2"
            />
          </div>
        ) : item.type === 'video' ? (
          <video 
            src={item.url} 
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="p-4 text-center">
            <File className="w-8 h-8 mx-auto text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {item.name}
            </span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => handleRemove(item.id, e)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove media"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div
        className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supports images, GIFs, audio, and video (max 10MB each)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept="image/*,audio/*,video/*"
        />
      </div>

      {error && (
        <div className="text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaItems.map((item: MediaItem, index: number) => renderMediaItem(item, index))}
        </div>
      )}
    </div>
  );
}

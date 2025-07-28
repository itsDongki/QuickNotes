import { v4 as uuidv4 } from 'uuid';
import { MediaItem } from './storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'gif',
  'image/webp': 'image',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
} as const;

type AllowedMimeType = keyof typeof ALLOWED_TYPES;

export function isFileTypeAllowed(file: File): boolean {
  return file.type in ALLOWED_TYPES;
}

export function getFileType(file: File): MediaItem['type'] | null {
  return ALLOWED_TYPES[file.type as AllowedMimeType] || 'file';
}

export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

export function createMediaItem(file: File, url: string): MediaItem {
  return {
    id: uuidv4(),
    type: getFileType(file) || 'file',
    url,
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

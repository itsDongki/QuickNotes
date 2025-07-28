'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

type DeleteConfirmationProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function DeleteConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Move to Trash',
  description = 'This note will be moved to trash. You can restore it later from the trash.',
  confirmText = 'Move to Trash',
  cancelText = 'Cancel',
}: DeleteConfirmationProps) {
  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto z-[9998]"
          onClick={onCancel}
          aria-hidden="true"
        />

        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 400,
            duration: 0.2,
            ease: 'easeInOut'
          }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-[9999] mx-4 my-8 pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-500 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 
                id="delete-dialog-title"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
              <button
                onClick={onCancel}
                className="ml-auto p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p 
              id="delete-dialog-description"
              className="mt-3 text-gray-600 dark:text-gray-300"
            >
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

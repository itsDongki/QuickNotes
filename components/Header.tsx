'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Moon, Sun, Plus, FileText, LogIn, LogOut, User, Trash2 } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FileText className="h-6 w-6" />
            QuickNotes
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Notes
            </Link>
            <Link 
              href="/trash" 
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Trash
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {session && (
              <Link
                href="/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Note</span>
              </Link>
            )}
            
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Authentication */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all"
                  title="View profile"
                >
                  {session.user?.image ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-medium">
                      {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/profile"
                  className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {session.user?.name || session.user?.email}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: `${window.location.origin}/auth/signin` })}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

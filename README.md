# QuickNotes - Minimal Notes App

A simple and elegant notes application built with Next.js, Tailwind CSS, and localStorage for data persistence.

## 🧰 Tech Stack

### Frontend:
- **Next.js** (v14+ App Router) - Server-side rendering and file-based routing
- **Tailwind CSS** - Utility-first styling with dark mode support
- **TypeScript** - Type safety and better development experience

### State & Storage:
- **React Hooks** (`useState`, `useEffect`) - State management
- **localStorage** - Client-side data persistence

### Markdown Support:
- `react-markdown` - Render markdown syntax in notes

### Icons:
- `lucide-react` - Clean and modern icon library

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the Repository**
```bash
git clone <repository-url>
cd quicknotes
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Run Development Server**
```bash
npm run dev
# or
yarn dev
```

4. **Open in Browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
quicknotes/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page - List all notes
│   ├── new/
│   │   └── page.tsx         # Create new note page
│   └── note/
│       └── [id]/
│           └── page.tsx     # View/Edit individual note
├── components/
│   ├── Header.tsx           # Top navigation with dark mode
│   └── note-card.tsx        # Individual note preview card
├── lib/
│   └── storage.ts           # localStorage utility functions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🧠 Features

- ✅ **Create Notes** - Add new notes with title and content
- ✅ **Edit Notes** - Modify existing notes inline
- ✅ **Delete Notes** - Remove notes with confirmation
- ✅ **Search Notes** - Find notes by title or content
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Markdown Support** - Render markdown in note content
- ✅ **Local Storage** - Persist data in browser storage
- ✅ **Keyboard Shortcuts** - Ctrl+S to save notes

## 💾 Data Storage

Notes are stored in your browser's localStorage with the following schema:

```json
{
  "notes": [
    {
      "id": "note-1672531200000",
      "title": "My First Note",
      "content": "This is a quick note with **markdown** support.",
      "createdAt": "2025-07-28T05:30:00Z"
    }
  ]
}
```

## 🎨 UI/UX Features

- **Clean Design** - Minimal and distraction-free interface
- **Dark Mode** - Automatic system preference detection
- **Responsive Layout** - Mobile-first design approach
- **Smooth Animations** - Subtle transitions and hover effects
- **Empty States** - Helpful guidance when no notes exist
- **Search Functionality** - Real-time search across all notes

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **Components** - PascalCase naming (e.g., `NoteCard`)
- **Files** - kebab-case naming (e.g., `note-card.tsx`)
- **State** - Minimal and close to usage
- **Tailwind** - Grouped utilities for better readability

## 🚀 Deployment

The app can be deployed to any static hosting service:

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Vercel** (recommended)
```bash
npx vercel
```

Or deploy to Netlify, GitHub Pages, or any other static hosting service.

## ✨ Future Enhancements

- [ ] **Cloud Sync** - Sync notes across devices
- [ ] **Categories/Tags** - Organize notes with labels
- [ ] **Export/Import** - Backup and restore notes
- [ ] **Rich Text Editor** - WYSIWYG editing experience
- [ ] **Note Sharing** - Share notes via public links
- [ ] **User Authentication** - Multi-user support
- [ ] **Note Templates** - Pre-defined note formats
- [ ] **Attachments** - Add images and files to notes

## 📜 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using Next.js and Tailwind CSS

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Create and export the handler for both GET and POST requests
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

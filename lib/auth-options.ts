import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserWithPassword, verifyPassword } from './auth';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        // Find the user with password for verification
        const user = await findUserWithPassword(credentials.email);
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Verify the password using the auth helper
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Return user object without the password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.image as string | null | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
};

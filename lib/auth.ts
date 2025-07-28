import bcrypt from 'bcryptjs';
import type { AppUser } from '@/types';

// Simple in-memory user store (replace with a database in production)
interface DatabaseUser extends Omit<AppUser, 'id'> {
  id: string;
}

// Helper functions for user management

// Demo user (in production, use a database)
// Password: 'password123' (hashed with bcrypt)
const users: DatabaseUser[] = [
  {
    id: '1',
    email: 'dongki@gmail.com',
    password: '$2b$10$kvZLhy3IOSgFf3tjWYQN..QZ8vlHNykjLYdqBSh.uU6iHBjwZse3q', // 'password123' (new hash)
    name: 'dongki',
    image: null,
  },
];

// Public user type (without password)
export type User = Omit<DatabaseUser, 'password'>;

// Function to find user with password (for authentication)
export async function findUserWithPassword(email: string): Promise<DatabaseUser | undefined> {
  console.log('Looking for user with email:', email);
  const user = users.find((user) => user.email === email);
  console.log('Found user:', user ? 'Yes' : 'No');
  return user;
}

// Public function to find user (without password)
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const user = await findUserWithPassword(email);
  if (!user) return undefined;
  
  // Remove password before returning
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  console.log('Verifying password...');
  console.log('Provided password:', password);
  console.log('Stored hash:', hashedPassword);
  
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Password is valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// Update user information
export async function updateUser(id: string, updates: Partial<DatabaseUser>): Promise<User | undefined> {
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return undefined;
  }
  
  // Update the user with new values
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    // Ensure we don't accidentally change the ID
    id: users[userIndex].id,
  };
  
  // Return the updated user without the password
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
}

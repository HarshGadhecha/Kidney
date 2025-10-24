import { database } from '@/lib/database';
import * as Crypto from 'expo-crypto';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: 'patient' | 'caregiver' | 'doctor';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isPremium: boolean;
  };
  token?: string;
}

/**
 * Hash password using SHA256
 */
async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

/**
 * Generate a random auth token
 */
async function generateToken(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignupData): Promise<AuthResponse> {
  try {
    const { name, email, password, role = 'patient' } = data;

    // Validate inputs
    if (!name || name.trim().length < 2) {
      return {
        success: false,
        message: 'Name must be at least 2 characters long',
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address',
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long',
      };
    }

    const db = database.getDatabase();

    // Check if email already exists
    const existingUser = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists',
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate user ID and token
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = await generateToken();

    // Create user
    await db.runAsync(
      `INSERT INTO users (
        id, name, email, password_hash, role,
        created_at, updated_at, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        email.toLowerCase(),
        passwordHash,
        role,
        new Date().toISOString(),
        new Date().toISOString(),
        0,
      ]
    );

    // Get created user
    const user = await db.getFirstAsync<any>(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return {
        success: false,
        message: 'Failed to create user account',
      };
    }

    return {
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: false,
      },
      token,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      message: 'An error occurred during sign up. Please try again.',
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { email, password } = credentials;

    // Validate inputs
    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address',
      };
    }

    if (!password) {
      return {
        success: false,
        message: 'Please enter your password',
      };
    }

    const db = database.getDatabase();

    // Hash password
    const passwordHash = await hashPassword(password);

    // Find user with matching credentials
    const user = await db.getFirstAsync<any>(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (!user || user.password_hash !== passwordHash) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    // Check premium status
    const subscription = await db.getFirstAsync<any>(
      `SELECT * FROM subscriptions
       WHERE user_id = ?
       AND status = 'active'
       AND end_date > datetime('now')
       ORDER BY end_date DESC
       LIMIT 1`,
      [user.id]
    );

    const isPremium = !!subscription;

    // Generate new token
    const token = await generateToken();

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium,
      },
      token,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      message: 'An error occurred during login. Please try again.',
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<any> {
  try {
    const db = database.getDatabase();
    const user = await db.getFirstAsync<any>(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{ name: string; email: string }>
): Promise<AuthResponse> {
  try {
    const db = database.getDatabase();

    if (updates.email && !isValidEmail(updates.email)) {
      return {
        success: false,
        message: 'Please enter a valid email address',
      };
    }

    // Check if email is already taken by another user
    if (updates.email) {
      const existingUser = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [updates.email.toLowerCase(), userId]
      );

      if (existingUser) {
        return {
          success: false,
          message: 'This email is already in use',
        };
      }
    }

    // Build update query
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name.trim());
    }

    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email.toLowerCase());
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());

    fields.push('synced = ?');
    values.push(0);

    values.push(userId);

    await db.runAsync(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const user = await getUserById(userId);

    return {
      success: true,
      message: 'Profile updated successfully',
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: false,
      } : undefined,
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message: 'Failed to update profile',
    };
  }
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters long',
      };
    }

    const db = database.getDatabase();

    // Verify current password
    const currentHash = await hashPassword(currentPassword);
    const user = await db.getFirstAsync<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user || user.password_hash !== currentHash) {
      return {
        success: false,
        message: 'Current password is incorrect',
      };
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    await db.runAsync(
      'UPDATE users SET password_hash = ?, updated_at = ?, synced = ? WHERE id = ?',
      [newHash, new Date().toISOString(), 0, userId]
    );

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: 'Failed to change password',
    };
  }
}

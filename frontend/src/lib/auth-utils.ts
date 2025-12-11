import api from './api';

export interface User {
    id: string;
    email: string;
    username: string;
    name: string;
    role: 'ADMIN' | 'TESTER' | 'CLIENT';
    is_active: boolean;
    companies: string[]; // Array of company IDs
}

/**
 * Fetch the current authenticated user from the API
 */
export async function fetchCurrentUser(): Promise<User | null> {
    try {
        const response = await api.get('/users/me/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch current user:', error);
        return null;
    }
}

/**
 * Check if a user has global admin role
 */
export function isAdmin(user: User | null): boolean {
    return user?.role === 'ADMIN';
}

/**
 * Get user's full name
 */
export function getUserFullName(user: User): string {
    return user.name || user.username || user.email;
}

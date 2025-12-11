'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/lib/types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me/');
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const isAdmin = user?.role === 'ADMIN';
    const isClient = user?.role === 'CLIENT';
    const isTester = user?.role === 'TESTER';
    const canEdit = isAdmin || isTester;
    const canDelete = isAdmin || isTester;

    const hasCompanyAccess = (companyId: string) => {
        if (isAdmin) return true;
        return user?.companies.includes(companyId) || false;
    };

    return {
        user,
        loading,
        isAdmin,
        isClient,
        isTester,
        canEdit,
        canDelete,
        hasCompanyAccess,
    };
}

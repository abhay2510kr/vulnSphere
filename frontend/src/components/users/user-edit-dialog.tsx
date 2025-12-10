'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MultiSelect } from '@/components/ui/multi-select';
import { User } from '@/lib/auth-utils';
import api from '@/lib/api';

interface UserEditDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function UserEditDialog({ user, open, onOpenChange, onSuccess }: UserEditDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [companies, setCompanies] = useState<{ label: string, value: string }[]>([]);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        name: '',
        role: 'CLIENT' as 'ADMIN' | 'TESTER' | 'CLIENT',
        is_active: true,
        companies: [] as string[],
    });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get('/companies/');
                const companyOptions = (res.data.results || res.data).map((c: any) => ({
                    label: c.name,
                    value: c.id,
                }));
                setCompanies(companyOptions);
            } catch (err) {
                console.error('Failed to fetch companies', err);
            }
        };

        if (open) {
            fetchCompanies();
        }
    }, [open]);

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role,
                is_active: user.is_active,
                // @ts-ignore - companies might inevitably exist on user object from API now
                companies: user.companies || [],
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            await api.patch(`/users/${user.id}/`, formData);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.email?.[0] ||
                'Failed to update user';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information. Leave password empty to keep it unchanged.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email *</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-username">Username</Label>
                            <Input
                                id="edit-username"
                                value={formData.username}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">Username cannot be changed after creation</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                                id="edit-name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: 'ADMIN' | 'TESTER' | 'CLIENT') => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CLIENT">Client</SelectItem>
                                    <SelectItem value="TESTER">Tester</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(formData.role === 'TESTER' || formData.role === 'CLIENT') && (
                            <div className="grid gap-2">
                                <Label>Assigned Companies</Label>
                                <MultiSelect
                                    options={companies}
                                    selected={formData.companies}
                                    onChange={(selected) => setFormData({ ...formData, companies: selected })}
                                    placeholder="Select companies..."
                                />
                                <p className="text-xs text-muted-foreground">Select companies this user can access.</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="edit-active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="edit-active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

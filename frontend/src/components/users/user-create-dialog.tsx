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
import api from '@/lib/api';

interface UserCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function UserCreateDialog({ open, onOpenChange, onSuccess }: UserCreateDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [companies, setCompanies] = useState<{ label: string, value: string }[]>([]);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        name: '',
        password: '',
        role: 'CLIENT' as 'ADMIN' | 'TESTER' | 'CLIENT',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/users/', formData);
            onSuccess();
            onOpenChange(false);
            setFormData({
                email: '',
                username: '',
                name: '',
                password: '',
                role: 'CLIENT',
                companies: [],
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.email?.[0] ||
                'Failed to create user';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account. They will be able to login with the provided credentials.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                required
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username *</Label>
                            <Input
                                id="username"
                                required
                                placeholder="johndoe"
                                pattern="[a-zA-Z0-9_]{3,50}"
                                title="3-50 characters, letters, numbers and underscores only"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
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
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

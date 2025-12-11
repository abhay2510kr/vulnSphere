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
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Company {
    id: string;
    name: string;
}

interface ProjectCreateDialogProps {
    companyId?: string; // Now optional
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ProjectCreateDialog({ companyId, open, onOpenChange, onSuccess }: ProjectCreateDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyId || '');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        title: '',
        engagement_type: 'Web Application Penetration Test',
        start_date: today,
        end_date: today,
        summary: '',
    });

    // Fetch companies if companyId is not provided
    useEffect(() => {
        if (!companyId && open) {
            fetchCompanies();
        }
    }, [companyId, open]);

    // Update selectedCompanyId when companyId prop changes
    useEffect(() => {
        if (companyId) {
            setSelectedCompanyId(companyId);
        }
    }, [companyId]);

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies/');
            setCompanies(Array.isArray(res.data) ? res.data : (res.data.results || []));
        } catch (err) {
            console.error('Failed to fetch companies', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Use companyId from props or selected company
        const targetCompanyId = companyId || selectedCompanyId;

        if (!targetCompanyId) {
            setError('Please select a company');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post(`/companies/${targetCompanyId}/projects/`, formData);
            const createdProject = response.data;

            if (onSuccess) {
                onSuccess();
            }

            onOpenChange(false);

            // Navigate to the project detail page
            router.push(`/project/${createdProject.id}`);

            // Reset form
            setFormData({
                title: '',
                engagement_type: 'Web Application Penetration Test',
                start_date: today,
                end_date: today,
                summary: '',
            });
            setSelectedCompanyId(companyId || '');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.title?.[0] ||
                'Failed to create project';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Project</DialogTitle>
                        <DialogDescription>
                            Create a new vulnerability assessment project
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Show company selector only if companyId is not provided */}
                        {!companyId && (
                            <div className="grid gap-2">
                                <Label htmlFor="company">Company *</Label>
                                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                    <SelectTrigger id="company">
                                        <SelectValue placeholder="Select a company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="title">Project Title *</Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Q4 2024 Penetration Test"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="engagement_type">Engagement Type *</Label>
                            <Input
                                id="engagement_type"
                                required
                                value={formData.engagement_type}
                                onChange={(e) => setFormData({ ...formData, engagement_type: e.target.value })}
                                placeholder="e.g., Black Box Penetration Test"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Start Date *</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">End Date *</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

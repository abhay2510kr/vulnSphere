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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { ReportTemplate, Project, Company } from '@/lib/types'; // Make sure Project/Company are exported or use any

interface ReportGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ReportGeneratorDialog({ open, onOpenChange, onSuccess }: ReportGeneratorDialogProps) {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);

    const [scope, setScope] = useState<'project' | 'company'>('project');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [selectedScopeId, setSelectedScopeId] = useState<string>('');

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tplRes, projRes, compRes] = await Promise.all([
                api.get('/report-templates/'),
                api.get('/projects/'),
                api.get('/companies/')
            ]);
            // Handle both paginated and non-paginated responses
            setTemplates(Array.isArray(tplRes.data) ? tplRes.data : (tplRes.data.results || []));
            setProjects(Array.isArray(projRes.data) ? projRes.data : (projRes.data.results || []));
            setCompanies(Array.isArray(compRes.data) ? compRes.data : (compRes.data.results || []));
        } catch (err: any) {
            console.error(err);
            setError('Failed to load data needed for generation.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate || !selectedScopeId) {
            setError('Please select a template and a scope (Project/Company).');
            return;
        }

        setGenerating(true);
        setError('');

        try {
            const payload: any = {
                template_id: selectedTemplate,
            };

            if (scope === 'project') {
                payload.project_id = selectedScopeId;
            } else {
                payload.company_id = selectedScopeId;
            }

            await api.post('/generated-reports/generate/', payload);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to generate report.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Generate New Report</DialogTitle>
                    <DialogDescription>
                        Select a template and data source to generate a report.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Template Selection */}
                    <div className="grid gap-2">
                        <Label>Report Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(t => {
                                    const isHtml = t.file?.toLowerCase().endsWith('.html');
                                    const isDocx = t.file?.toLowerCase().endsWith('.docx');
                                    const type = isHtml ? 'HTML' : isDocx ? 'DOCX' : 'Unknown';
                                    const badgeColor = isHtml ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800';

                                    return (
                                        <SelectItem key={t.id} value={t.id}>
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <span>{t.name}</span>
                                                <Badge variant="outline" className={`ml-2 text-xs py-0 h-5 ${badgeColor}`}>
                                                    {type}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Scope Selection */}
                    <div className="grid gap-2">
                        <Label>Report Scope</Label>
                        <Select value={scope} onValueChange={(v: 'project' | 'company') => { setScope(v); setSelectedScopeId(''); }}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="project">Project</SelectItem>
                                <SelectItem value="company">Company</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Target Selection */}
                    <div className="grid gap-2">
                        <Label>{scope === 'project' ? 'Select Project' : 'Select Company'}</Label>
                        <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
                            <SelectTrigger>
                                <SelectValue placeholder={loading ? "Loading..." : `Select ${scope}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {scope === 'project' ? (
                                    projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                    ))
                                ) : (
                                    companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={generating || loading}>
                        {generating ? 'Generating...' : 'Generate Report'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { TemplatesTable } from '@/components/reports/templates-table';
import { TemplateUploadDialog } from '@/components/reports/template-upload-dialog';
import { TemplateEditDialog } from '@/components/reports/template-edit-dialog';
import api from '@/lib/api';
import { ReportTemplate } from '@/lib/types';
import Link from 'next/link';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await api.get('/report-templates/');
            setTemplates(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleEdit = (template: ReportTemplate) => {
        setSelectedTemplate(template);
        setEditDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href="/reports">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Reports
                            </Button>
                        </Link>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Report Templates</h2>
                    <p className="text-muted-foreground">
                        Manage your report templates for generating documents.
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Template
                </Button>
            </div>

            <TemplatesTable
                templates={templates}
                loading={loading}
                onDelete={fetchTemplates}
                onEdit={handleEdit}
            />

            <TemplateUploadDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={fetchTemplates}
            />

            <TemplateEditDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={fetchTemplates}
                template={selectedTemplate}
            />
        </div>
    );
}

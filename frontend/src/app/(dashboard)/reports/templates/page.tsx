'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { TemplatesTable } from '@/components/reports/templates-table';
import { TemplateUploadDialog } from '@/components/reports/template-upload-dialog';
import { TemplateEditDialog } from '@/components/reports/template-edit-dialog';
import api from '@/lib/api';
import { ReportTemplate } from '@/lib/types';
import Link from 'next/link';
import { TablePagination } from '@/components/ui/table-pagination';
import { User, fetchCurrentUser, isAdmin } from '@/lib/auth-utils';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [itemsPerPage] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

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

    useEffect(() => {
        const loadUser = async () => {
            const user = await fetchCurrentUser();
            setCurrentUser(user);
        };
        loadUser();
    }, []);

    const handleEdit = (template: ReportTemplate) => {
        setSelectedTemplate(template);
        setEditDialogOpen(true);
    };

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTemplates = templates.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Report Templates</h2>
                    <p className="text-muted-foreground">
                        Manage your report templates for generating documents.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/reports">
                            <FileText className="mr-2 h-4 w-4" />
                            Manage Reports
                        </Link>
                    </Button>
                    {isAdmin(currentUser) && (
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Template
                        </Button>
                    )}
                </div>
            </div>

            <TemplatesTable
                templates={currentTemplates}
                loading={loading}
                onDelete={fetchTemplates}
                onEdit={handleEdit}
            />

            <TablePagination
                currentPage={currentPage}
                totalItems={templates.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
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

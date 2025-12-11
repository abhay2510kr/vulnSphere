'use client';

import { ReportTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileText, Download, Trash2, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface TemplatesTableProps {
    templates: ReportTemplate[];
    loading?: boolean;
    onDelete: () => void;
    onEdit: (template: ReportTemplate) => void;
}

export function TemplatesTable({ templates, loading, onDelete, onEdit }: TemplatesTableProps) {
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) {
            return;
        }

        setDeleting(id);
        try {
            await api.delete(`/report-templates/${id}/`);
            onDelete();
        } catch (error) {
            console.error('Failed to delete template:', error);
            alert('Failed to delete template');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading templates...</div>;
    }

    if (templates.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/40">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No templates</h3>
                <p className="text-sm text-muted-foreground">
                    Upload your first template to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {templates.map((template) => {
                        const isHtml = template.file.toLowerCase().endsWith('.html');
                        const isDocx = template.file.toLowerCase().endsWith('.docx');
                        const type = isHtml ? 'HTML' : isDocx ? 'DOCX' : 'Unknown';

                        return (
                            <TableRow key={template.id}>
                                <TableCell className="font-medium">{template.name}</TableCell>
                                <TableCell>
                                    <Badge className={
                                        type === 'HTML'
                                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-300'
                                            : 'bg-orange-100 text-orange-800 hover:bg-orange-100/80 dark:bg-orange-900 dark:text-orange-300'
                                    }>
                                        {type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {template.description || 'No description'}
                                </TableCell>
                                <TableCell>
                                    {formatDistanceToNow(new Date(template.created_at), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onEdit(template)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={async () => {
                                            try {
                                                const response = await api.get(`/report-templates/${template.id}/download/`, {
                                                    responseType: 'blob'
                                                });

                                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                const contentDisposition = response.headers['content-disposition'];
                                                let filename = template.file.split('/').pop() || 'template';

                                                if (contentDisposition) {
                                                    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                                                    if (filenameMatch && filenameMatch.length === 2)
                                                        filename = filenameMatch[1];
                                                }

                                                link.setAttribute('download', filename);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                                window.URL.revokeObjectURL(url);
                                            } catch (error) {
                                                console.error('Failed to download template:', error);
                                                alert('Failed to download template');
                                            }
                                        }}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(template.id)}
                                        disabled={deleting === template.id}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

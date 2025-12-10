'use client';

import { GeneratedReport } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileText, Download, AlertCircle, Building2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import api from '@/lib/api';

interface ReportsTableProps {
    reports: GeneratedReport[];
    loading?: boolean;
    onDelete: (id: string) => void;
}

export function ReportsTable({ reports, loading, onDelete }: ReportsTableProps) {
    if (loading) {
        return <div className="text-center py-8">Loading reports...</div>;
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/40">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No reports generated</h3>
                <p className="text-sm text-muted-foreground">
                    Generate your first report to see it here.
                </p>
            </div>
        );
    }

    const handleDownload = async (reportId: string, filename: string) => {
        try {
            const response = await api.get(`/generated-reports/${reportId}/download/`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download report:', error);
            alert('Failed to download report');
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell>
                                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {report.company_name || report.company || 'Unknown'}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">
                                    {report.template_name || report.template || 'N/A'}
                                </span>
                            </TableCell>
                            <TableCell>
                                {report.project_title || report.project ? (
                                    <span className="flex items-center gap-2">
                                        <Badge variant="outline">Project</Badge>
                                        {report.project_title || report.project}
                                    </span>
                                ) : report.company_name || report.company ? (
                                    <span className="flex items-center gap-2">
                                        <Badge variant="outline">Company</Badge>
                                        {report.company_name || report.company}
                                    </span>
                                ) : (
                                    'Unknown'
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{report.format}</Badge>
                            </TableCell>
                            <TableCell>
                                {report.is_failed ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="destructive" className="flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Failed
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{report.error_message || 'Unknown error'}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <Badge variant="default" className="bg-green-600">Ready</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                {!report.is_failed && report.file && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            const filename = report.file ? report.file.split('/').pop() : `report-${report.id}.${report.format.toLowerCase()}`;
                                            handleDownload(report.id, filename || 'report');
                                        }}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onDelete(report.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}


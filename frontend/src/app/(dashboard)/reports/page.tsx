'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { ReportsTable } from '@/components/reports/reports-table';
import { ReportGeneratorDialog } from '@/components/reports/report-generator-dialog';
import api from '@/lib/api';
import { GeneratedReport } from '@/lib/types';
import Link from 'next/link';

export default function ReportsPage() {
    const [reports, setReports] = useState<GeneratedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/generated-reports/');
            setReports(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                    <p className="text-muted-foreground">
                        Generate and manage vulnerability reports for your projects.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/reports/templates">
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Templates
                        </Link>
                    </Button>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Report
                    </Button>
                </div>
            </div>

            <ReportsTable reports={reports} loading={loading} />

            <ReportGeneratorDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={() => {
                    fetchReports();
                }}
            />
        </div>
    );
}

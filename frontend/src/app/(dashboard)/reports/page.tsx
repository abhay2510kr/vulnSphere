'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, Search } from 'lucide-react';
import { ReportsTable } from '@/components/reports/reports-table';
import { ReportGeneratorDialog } from '@/components/reports/report-generator-dialog';
import api from '@/lib/api';
import { GeneratedReport } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TablePagination } from '@/components/ui/table-pagination';
import { useAuth } from '@/hooks/use-auth';

export default function ReportsPage() {
    const router = useRouter();
    const { canEdit, isClient, loading: authLoading } = useAuth();
    const [reports, setReports] = useState<GeneratedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState('all');
    const [companies, setCompanies] = useState<any[]>([]);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 15;

    // Redirect clients away from this page
    useEffect(() => {
        if (!authLoading && isClient) {
            router.push('/dashboard');
        }
    }, [isClient, authLoading, router]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                page,
                page_size: ITEMS_PER_PAGE,
            };

            if (searchTerm) {
                params.search = searchTerm;
            }

            if (companyFilter !== 'all') {
                params.company__name = companyFilter;
            }

            console.log('Fetching reports with params:', params);
            console.log('API Base URL:', api.defaults.baseURL);

            const response = await api.get('/generated-reports/', { params });

            if (response.data.results) {
                setReports(response.data.results);
                setTotalCount(response.data.count);
            } else {
                // Fallback if not paginated structure (shouldn't happen with DRF default)
                setReports(response.data);
                setTotalCount(response.data.length);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this report?')) {
            return;
        }

        try {
            await api.delete(`/generated-reports/${id}/`);
            fetchReports();
        } catch (error) {
            console.error('Failed to delete report:', error);
            alert('Failed to delete report');
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies/');
            const companiesData = response.data.results || response.data;
            
            // Filter inactive companies for non-admin users
            const filteredCompanies = canEdit ? companiesData : companiesData.filter((company: any) => company.is_active);
            setCompanies(filteredCompanies);
        } catch (error) {
            console.error('Failed to fetch companies', error);
        }
    }

    const fetchInitialData = async () => {
        await fetchCompanies();
        // Reports are fetched via useEffect
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch reports when params change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReports();
        }, 300); // Simple debounce

        return () => clearTimeout(timer);
    }, [page, searchTerm, companyFilter]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, companyFilter]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                    <p className="text-muted-foreground">
                        Generate and manage vulnerability reports for your projects.
                    </p>
                </div>
                {canEdit && (
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
                )}
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {companies.map((company) => (
                            <SelectItem key={company.id} value={company.name}>
                                {company.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ReportsTable
                reports={reports}
                loading={loading}
                onDelete={handleDelete}
            />

            <TablePagination
                currentPage={page}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />

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

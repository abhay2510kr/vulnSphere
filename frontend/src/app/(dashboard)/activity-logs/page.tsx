'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ActivityLog {
    id: string;
    company: string;
    user: string | null;
    entity_type: string;
    entity_id: string;
    action: string;
    metadata: Record<string, any>;
    user_name?: string; // Added from serializer
    company_name?: string; // Added from serializer
    created_at: string;
}

interface PaginatedResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ActivityLog[];
}

const ACTION_COLORS: Record<string, string> = {
    STATUS_CHANGED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    CREATED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    UPDATED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    DELETED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
    VULNERABILITY: 'bg-red-500',
    PROJECT: 'bg-blue-500',
    ASSET: 'bg-green-500',
    COMMENT: 'bg-purple-500',
};

export default function ActivityLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const res = await api.get<PaginatedResponse>('/activity-logs/', {
                    params: {
                        page,
                        page_size: ITEMS_PER_PAGE,
                    }
                });
                setLogs(res.data.results);
                setTotalCount(res.data.count);
                setTotalPages(Math.ceil(res.data.count / ITEMS_PER_PAGE));
            } catch (err: any) {
                console.error("Failed to fetch activity logs", err);
                if (err.response?.status === 403) {
                    setError("Access denied. Only administrators can view activity logs.");
                } else {
                    setError("Failed to load activity logs");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [page]);

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const getEntityName = (log: ActivityLog) => {
        if (log.entity_type === 'COMMENT') {
            if (log.metadata?.vulnerability_title) return `Comment on ${log.metadata.vulnerability_title}`;
            if (log.metadata?.project_title) return `Comment on ${log.metadata.project_title}`;
            return 'Comment';
        }
        if (log.entity_type === 'RETEST') {
            if (log.metadata?.vulnerability_title) return `Retest for ${log.metadata.vulnerability_title}`;
        }

        if (log.metadata?.title) return log.metadata.title;
        if (log.metadata?.name) return log.metadata.name;
        if (log.metadata?.username) return log.metadata.username;

        return log.entity_id;
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        // Simple logic for < [1] ... [5] >
        // If pages <= 7 show all
        // If pages > 7, show 1, 2, ..., current-1, current, current+1, ..., last

        // Using a simpler approach as requested: < [1] ... [5] >
        // Let's implement full range for small counts, and reduced for large.

        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, page + 2);

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return (
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, totalCount)}</span> of <span className="font-medium">{totalCount}</span> entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousPage}
                        disabled={page === 1 || loading}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {pages.map((p, idx) => (
                        typeof p === 'number' ? (
                            <Button
                                key={idx}
                                variant={page === p ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage(p)}
                                className="h-8 w-8"
                            >
                                {p}
                            </Button>
                        ) : (
                            <span key={idx} className="text-muted-foreground px-2">...</span>
                        )
                    ))}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={page === totalPages || loading}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                    <p className="text-muted-foreground">
                        View all system activities across all companies.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-destructive border rounded-lg p-6 bg-muted/40">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                    <p className="text-muted-foreground">
                        View all system activities across all companies.
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                    <Activity className="h-4 w-4 mr-2" />
                    {totalCount} total logs
                </Badge>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                </div>
            ) : logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 border rounded-lg bg-muted/40">No activity logs found</p>
            ) : (
                <>
                    <div className="rounded-md border p-6 bg-card">
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                                    <div
                                        className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${ENTITY_TYPE_COLORS[log.entity_type] || 'bg-gray-500'
                                            }`}
                                    >
                                        <Activity className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100'}>
                                                {log.action.replace(/_/g, ' ')}
                                            </Badge>
                                            <Badge variant="outline">
                                                {log.entity_type}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground ml-auto whitespace-nowrap md:hidden">
                                                {format(new Date(log.created_at), 'MMM d, HH:mm')}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <span className="font-semibold">{log.user_name || 'System'}:</span>{' '}
                                            <span className="text-muted-foreground">
                                                {log.action.toLowerCase().replace(/_/g, ' ')}{' '}
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {getEntityName(log)}
                                            </span>
                                        </div>

                                        {/* Metadata rendering - filtering out IDs and the main title/name we already displayed */}
                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <div className="mt-1 text-sm flex flex-wrap gap-x-4 gap-y-1">
                                                {Object.entries(log.metadata)
                                                    .filter(([key]) =>
                                                        !key.endsWith('_id') &&
                                                        !key.endsWith('_pk') &&
                                                        !key.endsWith('uuid') &&
                                                        key !== 'title' &&
                                                        key !== 'name' &&
                                                        key !== 'username' &&
                                                        key !== 'vulnerability_title' &&
                                                        key !== 'project_title' &&
                                                        key !== 'author_name' && // Redundant with log.user_name
                                                        key !== 'requested_by' && // Hide UUID
                                                        key !== 'performed_by' && // Hide UUID
                                                        key !== 'retest_id'
                                                    )
                                                    .map(([key, value]) => (
                                                        <span key={key} className="text-muted-foreground">
                                                            {key.replace(/_/g, ' ')}: <span className="font-medium text-foreground">{String(value)}</span>
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="hidden md:block text-sm text-muted-foreground whitespace-nowrap">
                                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {renderPagination()}
                </>
            )}
        </div>
    );
}

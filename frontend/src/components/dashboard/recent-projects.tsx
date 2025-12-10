'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { FileText } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    status: string;
    company_id: string;
    company_name: string;
    start_date: string;
    end_date: string;
    vulnerability_count: number;
    created_at: string;
}

interface RecentProjectsProps {
    projects: Project[];
}

const STATUS_COLORS = {
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    IN_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    FINAL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    ARCHIVED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export function RecentProjects({ projects }: RecentProjectsProps) {
    if (projects.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Latest security assessment projects</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    No projects found
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Latest security assessment projects</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div key={project.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                            <div className="mt-1">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Link
                                    href={`/project/${project.id}`}
                                    className="font-medium hover:underline"
                                >
                                    {project.title}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{project.company_name}</span>
                                    <span>•</span>
                                    <span>{format(new Date(project.start_date), 'MMM d')} - {format(new Date(project.end_date), 'MMM d, yyyy')}</span>
                                    <span>•</span>
                                    <span>{project.vulnerability_count} {project.vulnerability_count === 1 ? 'vulnerability' : 'vulnerabilities'}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                                </div>
                            </div>
                            <Badge variant="outline" className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}>
                                {project.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

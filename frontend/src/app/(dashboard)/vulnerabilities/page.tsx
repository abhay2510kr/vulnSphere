'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { TablePagination } from '@/components/ui/table-pagination';

interface Company {
    id: string;
    name: string;
}

interface Project {
    id: string;
    title: string;
    company: string;
}

interface Vulnerability {
    id: string;
    title: string;
    severity: string;
    status: string;
    category: string;
    project: string;
    created_at: string;
}

export default function VulnerabilitiesPage() {
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<string>('all');
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchData();
    }, [page, search]);

    useEffect(() => {
        filterVulnerabilities();
    }, [selectedCompany, selectedSeverity, selectedStatus]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('access_token');

            // Fetch companies
            const companiesRes = await fetch('http://localhost:8000/api/v1/companies/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const companiesData = await companiesRes.json();
            setCompanies(companiesData.results || companiesData);

            // Fetch projects
            const projectsRes = await fetch('http://localhost:8000/api/v1/projects/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const projectsData = await projectsRes.json();
            setProjects(projectsData.results || projectsData);

            // Fetch all vulnerabilities from all projects
            const allVulns: Vulnerability[] = [];
            const projectsList = projectsData.results || projectsData;

            for (const project of projectsList) {
                try {
                    const vulnsRes = await fetch(
                        `http://localhost:8000/api/v1/companies/${project.company}/projects/${project.id}/vulnerabilities/`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const vulnsData = await vulnsRes.json();
                    const vulns = vulnsData.results || vulnsData;
                    allVulns.push(...vulns);
                } catch (error) {
                    console.error(`Error fetching vulns for project ${project.id}:`, error);
                }
            }

            setVulnerabilities(allVulns);
            setTotalCount(allVulns.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterVulnerabilities = () => {
        // This will trigger a re-render with filtered data
    };

    const getFilteredVulnerabilities = () => {
        let filtered = vulnerabilities;

        if (search) {
            filtered = filtered.filter(v =>
                v.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (selectedCompany !== 'all') {
            const companyId = selectedCompany;
            const companyProjects = projects.filter(p => p.company === companyId).map(p => p.id);
            filtered = filtered.filter(v => companyProjects.includes(v.project));
        }

        if (selectedSeverity !== 'all') {
            filtered = filtered.filter(v => v.severity === selectedSeverity);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(v => v.status === selectedStatus);
        }

        // Pagination
        const startIndex = (page - 1) * 20;
        return filtered.slice(startIndex, startIndex + 20);
    };

    const getCompanyName = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return 'Unknown';
        const company = companies.find(c => c.id === project.company);
        return company?.name || `Company ${project.company}`;
    };

    const getProjectTitle = (projectId: string) => {
        return projects.find(p => p.id === projectId)?.title || `Project ${projectId}`;
    };

    const getSeverityBadge = (severity: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
            CRITICAL: { variant: 'destructive', className: 'bg-red-600 hover:bg-red-700' },
            HIGH: { variant: 'destructive', className: 'bg-orange-600 hover:bg-orange-700' },
            MEDIUM: { variant: 'default', className: 'bg-yellow-600 hover:bg-yellow-700' },
            LOW: { variant: 'secondary', className: 'bg-blue-600 hover:bg-blue-700' },
            INFO: { variant: 'outline', className: '' },
        };
        const config = variants[severity] || variants.INFO;
        return <Badge variant={config.variant} className={config.className}>{severity}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            OPEN: 'destructive',
            IN_PROGRESS: 'secondary',
            RESOLVED: 'default',
            ACCEPTED_RISK: 'outline',
            FALSE_POSITIVE: 'outline',
        };
        return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
    };

    const filteredVulns = getFilteredVulnerabilities();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">All Vulnerabilities</h2>
                    <p className="text-muted-foreground">
                        View and filter all vulnerabilities across all projects.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search vulnerabilities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Companies" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Companies</SelectItem>
                            {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                    {company.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Severities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="INFO">Informational</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="ACCEPTED_RISK">Accepted Risk</SelectItem>
                            <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredVulns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No vulnerabilities found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVulns.map((vuln) => (
                                <TableRow key={vuln.id}>
                                    <TableCell className="font-medium">{vuln.title}</TableCell>
                                    <TableCell>{getCompanyName(vuln.project)}</TableCell>
                                    <TableCell>{getProjectTitle(vuln.project)}</TableCell>
                                    <TableCell>{getSeverityBadge(vuln.severity)}</TableCell>
                                    <TableCell>{getStatusBadge(vuln.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/project/${vuln.project}/vulnerabilities/${vuln.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <TablePagination
                currentPage={page}
                totalItems={totalCount}
                itemsPerPage={20}
                onPageChange={setPage}
            />
        </div>
    );
}

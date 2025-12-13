'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Search, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KeywordData {
    category: string;
    keywords: { keyword: string; description: string; example: string }[];
}

const projectKeywords: KeywordData[] = [
    {
        category: 'Project',
        keywords: [
            { keyword: 'project.id', description: 'Project UUID', example: '{{ project.id }}' },
            { keyword: 'project.title', description: 'Project title', example: '{{ project.title }}' },
            { keyword: 'project.company', description: 'Company name', example: '{{ project.company }}' },
            { keyword: 'project.engagement_type', description: 'Engagement type', example: '{{ project.engagement_type }}' },
            { keyword: 'project.summary', description: 'Project summary (HTML)', example: '{{ project.summary }}' },
            { keyword: 'project.scope', description: 'Project scope (HTML)', example: '{{ project.scope }}' },
            { keyword: 'project.start_date', description: 'Start date', example: '{{ project.start_date }}' },
            { keyword: 'project.end_date', description: 'End date', example: '{{ project.end_date }}' },
            { keyword: 'project.status', description: 'Status code', example: '{{ project.status }}' },
            { keyword: 'project.status_display', description: 'Status display', example: '{{ project.status_display }}' },
        ]
    },
    {
        category: 'Severity Counts',
        keywords: [
            { keyword: 'severity_counts.critical', description: 'Critical count', example: '{{ severity_counts.critical }}' },
            { keyword: 'severity_counts.high', description: 'High count', example: '{{ severity_counts.high }}' },
            { keyword: 'severity_counts.medium', description: 'Medium count', example: '{{ severity_counts.medium }}' },
            { keyword: 'severity_counts.low', description: 'Low count', example: '{{ severity_counts.low }}' },
            { keyword: 'severity_counts.info', description: 'Info count', example: '{{ severity_counts.info }}' },
            { keyword: 'severity_counts.total', description: 'Total count', example: '{{ severity_counts.total }}' },
        ]
    },
    {
        category: 'Severity Array',
        keywords: [
            { keyword: 'severities', description: 'Array of severity objects', example: '{% for severity in severities %}{{ severity.label }}: {{ severity.count }}{% endfor %}' },
            { keyword: 'severity.severity', description: 'Severity level', example: '{{ severity.severity }}' },
            { keyword: 'severity.label', description: 'Severity label', example: '{{ severity.label }}' },
            { keyword: 'severity.count', description: 'Severity count', example: '{{ severity.count }}' },
        ]
    },
    {
        category: 'Assets',
        keywords: [
            { keyword: 'assets', description: 'Array of assets', example: '{% for asset in assets %}{{ asset.name }}{% endfor %}' },
            { keyword: 'asset.name', description: 'Asset name', example: '{{ asset.name }}' },
            { keyword: 'asset.type', description: 'Asset type', example: '{{ asset.type }}' },
            { keyword: 'asset.url', description: 'Asset URL', example: '{{ asset.url }}' },
            { keyword: 'asset.is_active', description: 'Active status', example: '{{ asset.is_active }}' },
        ]
    },
    {
        category: 'Vulnerabilities',
        keywords: [
            { keyword: 'vulnerabilities', description: 'Array of vulnerabilities', example: '{% for vuln in vulnerabilities %}{{ vuln.title }}{% endfor %}' },
            { keyword: 'vuln.id', description: 'Vulnerability UUID', example: '{{ vuln.id }}' },
            { keyword: 'vuln.title', description: 'Vulnerability title', example: '{{ vuln.title }}' },
            { keyword: 'vuln.severity', description: 'Severity code', example: '{{ vuln.severity }}' },
            { keyword: 'vuln.severity_display', description: 'Severity display', example: '{{ vuln.severity_display }}' },
            { keyword: 'vuln.status', description: 'Status code', example: '{{ vuln.status }}' },
            { keyword: 'vuln.status_display', description: 'Status display', example: '{{ vuln.status_display }}' },
            { keyword: 'vuln.cvss_score', description: 'CVSS score', example: '{{ vuln.cvss_score }}' },
            { keyword: 'vuln.cvss_vector', description: 'CVSS vector', example: '{{ vuln.cvss_vector }}' },
            { keyword: 'vuln.description', description: 'Description (HTML)', example: '{{ vuln.description }}' },
            { keyword: 'vuln.created_at', description: 'Creation date', example: '{{ vuln.created_at }}' },
        ]
    },
    {
        category: 'Retests',
        keywords: [
            { keyword: 'vuln.retests', description: 'Array of retests', example: '{% for retest in vuln.retests %}{{ retest.status }}{% endfor %}' },
            { keyword: 'retest.id', description: 'Retest UUID', example: '{{ retest.id }}' },
            { keyword: 'retest.request_type', description: 'Request type', example: '{{ retest.request_type }}' },
            { keyword: 'retest.status', description: 'Retest status', example: '{{ retest.status }}' },
            { keyword: 'retest.retest_date', description: 'Retest date', example: '{{ retest.retest_date }}' },
            { keyword: 'retest.performed_by', description: 'Performed by', example: '{{ retest.performed_by }}' },
            { keyword: 'retest.requested_by', description: 'Requested by', example: '{{ retest.requested_by }}' },
            { keyword: 'retest.notes', description: 'Notes (HTML)', example: '{{ retest.notes }}' },
        ]
    },
    {
        category: 'System',
        keywords: [
            { keyword: 'today', description: 'Current date', example: '{{ today }}' },
        ]
    }
];

const companyKeywords: KeywordData[] = [
    {
        category: 'Company',
        keywords: [
            { keyword: 'company.id', description: 'Company UUID', example: '{{ company.id }}' },
            { keyword: 'company.name', description: 'Company name', example: '{{ company.name }}' },
            { keyword: 'company.email', description: 'Contact email', example: '{{ company.email }}' },
            { keyword: 'company.address', description: 'Company address', example: '{{ company.address }}' },
            { keyword: 'company.notes', description: 'Company notes (HTML)', example: '{{ company.notes }}' },
        ]
    },
    {
        category: 'Company Projects',
        keywords: [
            { keyword: 'projects', description: 'Array of projects', example: '{% for project in projects %}{{ project.title }}{% endfor %}' },
            { keyword: 'project.id', description: 'Project UUID', example: '{{ project.id }}' },
            { keyword: 'project.title', description: 'Project title', example: '{{ project.title }}' },
            { keyword: 'project.engagement_type', description: 'Engagement type', example: '{{ project.engagement_type }}' },
            { keyword: 'project.start_date', description: 'Start date', example: '{{ project.start_date }}' },
            { keyword: 'project.end_date', description: 'End date', example: '{{ project.end_date }}' },
            { keyword: 'project.status', description: 'Status code', example: '{{ project.status }}' },
            { keyword: 'project.status_display', description: 'Status display', example: '{{ project.status_display }}' },
            { keyword: 'project.vuln_count', description: 'Vulnerability count', example: '{{ project.vuln_count }}' },
        ]
    },
    {
        category: 'Company Severity Summary',
        keywords: [
            { keyword: 'company_severity_counts.critical', description: 'Total critical across all projects', example: '{{ company_severity_counts.critical }}' },
            { keyword: 'company_severity_counts.high', description: 'Total high across all projects', example: '{{ company_severity_counts.high }}' },
            { keyword: 'company_severity_counts.medium', description: 'Total medium across all projects', example: '{{ company_severity_counts.medium }}' },
            { keyword: 'company_severity_counts.low', description: 'Total low across all projects', example: '{{ company_severity_counts.low }}' },
            { keyword: 'company_severity_counts.info', description: 'Total info across all projects', example: '{{ company_severity_counts.info }}' },
            { keyword: 'company_severity_counts.total', description: 'Total vulnerabilities across all projects', example: '{{ company_severity_counts.total }}' },
        ]
    },
    {
        category: 'Company Severity Array',
        keywords: [
            { keyword: 'company_severities', description: 'Array of company severity objects', example: '{% for severity in company_severities %}{{ severity.label }}: {{ severity.count }}{% endfor %}' },
            { keyword: 'company_severity.severity', description: 'Severity level', example: '{{ company_severity.severity }}' },
            { keyword: 'company_severity.label', description: 'Severity label', example: '{{ company_severity.label }}' },
            { keyword: 'company_severity.count', description: 'Severity count', example: '{{ company_severity.count }}' },
        ]
    },
    {
        category: 'System',
        keywords: [
            { keyword: 'today', description: 'Current date', example: '{{ today }}' },
        ]
    }
];

export function KeywordsDialog() {
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);

    const filterKeywords = (keywords: KeywordData[]) => {
        return keywords.map(category => ({
            ...category,
            keywords: category.keywords.filter(keyword =>
                keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
                keyword.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(category => category.keywords.length > 0);
    };

    const filteredProjectKeywords = filterKeywords(projectKeywords);
    const filteredCompanyKeywords = filterKeywords(companyKeywords);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        console.log('Copied to clipboard:', text);
    };

    const renderKeywordTable = (keywords: KeywordData[]) => (
        <div className="space-y-6">
            {keywords.map((category) => (
                <div key={category.category}>
                    <Badge variant="secondary" className="mb-3">
                        {category.category}
                    </Badge>
                    
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="text-left p-3 font-medium">Keyword</th>
                                    <th className="text-left p-3 font-medium">Description</th>
                                    <th className="text-left p-3 font-medium">Example</th>
                                    <th className="w-12 p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {category.keywords.map((keyword, index) => (
                                    <tr 
                                        key={keyword.keyword} 
                                        className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                    >
                                        <td className="p-3">
                                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                                                {keyword.keyword}
                                            </code>
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {keyword.description}
                                        </td>
                                        <td className="p-3">
                                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono cursor-pointer hover:bg-muted/80 transition-colors"
                                                  onClick={() => copyToClipboard(keyword.example)}>
                                                {keyword.example}
                                            </code>
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(keyword.example)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Code className="mr-2 h-4 w-4" />
                    View Keywords
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Report Template Keywords</DialogTitle>
                    <DialogDescription>
                        Available keywords for report templates. Click example to copy.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Tabs defaultValue="project" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="project">Project Reports</TabsTrigger>
                            <TabsTrigger value="company">Company Reports</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="project" className="mt-6">
                            {renderKeywordTable(filteredProjectKeywords)}
                        </TabsContent>
                        
                        <TabsContent value="company" className="mt-6">
                            {renderKeywordTable(filteredCompanyKeywords)}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

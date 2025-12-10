export interface Company {
    id: string;
    name: string;
    slug: string;
    // ... other fields as needed
}

export interface Project {
    id: string;
    title: string;
    company: string; // company ID
    // ...
}

export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    file: string; // URL
    created_at: string;
    updated_at: string;
}

export interface GeneratedReport {
    id: string;
    project?: string; // ID
    company?: string; // ID
    template: string; // ID
    template_name?: string; // Name of the template
    project_title?: string; // Title of the project
    company_name?: string; // Name of the company
    file: string; // URL
    format: 'DOCX' | 'HTML';
    is_failed: boolean;
    error_message?: string;
    created_at: string;
}

'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { VulnerabilityPanel } from '@/components/vulnerabilities/vulnerability-panel';

export default function EditTemplatePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>}>
            <TemplatePageContent />
        </Suspense>
    );
}

function TemplatePageContent() {
    const params = useParams();
    const templateId = params.templateId as string;

    return (
        <div className="h-full">
            <VulnerabilityPanel 
                projectId="template" 
                vulnerabilityId={templateId}
                isTemplate={true}
            />
        </div>
    );
}

'use client';

import { Suspense } from 'react';
import { VulnerabilityPanel } from '@/components/vulnerabilities/vulnerability-panel';

export default function CreateTemplatePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>}>
            <CreateTemplatePageContent />
        </Suspense>
    );
}

function CreateTemplatePageContent() {
    return (
        <div className="h-full">
            <VulnerabilityPanel 
                projectId="template" 
                vulnerabilityId="new"
                isTemplate={true}
            />
        </div>
    );
}

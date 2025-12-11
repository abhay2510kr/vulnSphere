'use client';

import { useParams } from 'next/navigation';
import { TemplateForm } from '@/components/templates/template-form';

export default function EditTemplatePage() {
    const params = useParams();
    const templateId = params.templateId as string;

    return <TemplateForm mode="edit" templateId={templateId} />;
}

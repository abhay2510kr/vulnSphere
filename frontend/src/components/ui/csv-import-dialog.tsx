'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface CSVImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    title: string;
    description: string;
    templateEndpoint: string;
    importEndpoint: string;
}

interface ImportResult {
    created: number;
    errors: { row: number; error: string }[];
    items: { id: string; title?: string; name?: string }[];
}

export function CSVImportDialog({
    open,
    onOpenChange,
    onSuccess,
    title,
    description,
    templateEndpoint,
    importEndpoint
}: CSVImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                setError('Please select a CSV file');
                return;
            }
            setFile(selectedFile);
            setError('');
            setResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        setDownloading(true);
        try {
            const response = await api.get(templateEndpoint, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', templateEndpoint.split('/').pop()?.replace('csv-template', 'template.csv') || 'template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download template', err);
            setError('Failed to download template');
        } finally {
            setDownloading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(importEndpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResult(response.data);

            if (response.data.created > 0) {
                onSuccess();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.detail ||
                'Failed to import CSV';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError('');
        setResult(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Download Template */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div>
                            <p className="text-sm font-medium">Download CSV Template</p>
                            <p className="text-xs text-muted-foreground">Get a sample CSV file with correct headers</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} disabled={downloading}>
                            <Download className="h-4 w-4 mr-2" />
                            {downloading ? 'Downloading...' : 'Template'}
                        </Button>
                    </div>

                    {/* File Upload */}
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">
                                {file ? file.name : 'Click to upload CSV file'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Only .csv files are accepted'}
                            </p>
                        </label>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Result Display */}
                    {result && (
                        <div className="space-y-2">
                            {result.created > 0 && (
                                <Alert className="border-green-200 bg-green-50 text-green-800">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>
                                        Successfully imported {result.created} item{result.created !== 1 ? 's' : ''}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {result.errors.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <p className="font-medium mb-1">{result.errors.length} row(s) failed:</p>
                                        <ul className="text-xs space-y-1 max-h-24 overflow-y-auto">
                                            {result.errors.map((err, i) => (
                                                <li key={i}>Row {err.row}: {err.error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose}>
                        {result?.created ? 'Close' : 'Cancel'}
                    </Button>
                    {!result?.created && (
                        <Button onClick={handleImport} disabled={!file || loading}>
                            <Upload className="h-4 w-4 mr-2" />
                            {loading ? 'Importing...' : 'Import'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

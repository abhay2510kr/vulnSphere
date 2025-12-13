import { cn } from "@/lib/utils";

export function VulnSphereLogo({ className = "" }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md">
                <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4.5 w-4.5"
                >
                    <defs>
                        <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
                        </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="url(#sphereGradient)" opacity="0.2"/>
                    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 5 L12 7 M12 17 L12 19 M5 12 L7 12 M17 12 L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    <path d="M9 9 L15 15 M15 9 L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                    <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.8"/>
                    <circle cx="8" cy="16" r="1" fill="currentColor" opacity="0.6"/>
                </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Smooch Sans, sans-serif', fontWeight: 700 }}>
                VulnSphere
            </span>
        </div>
    );
}

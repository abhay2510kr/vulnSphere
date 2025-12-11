import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
    severity: string;
    className?: string;
    grow?: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: "bg-red-500 hover:bg-red-600 border-transparent text-white",
    HIGH: "bg-orange-500 hover:bg-orange-600 border-transparent text-white",
    MEDIUM: "bg-yellow-500 hover:bg-yellow-600 border-transparent text-white",
    LOW: "bg-blue-500 hover:bg-blue-600 border-transparent text-white",
    INFO: "bg-gray-500 hover:bg-gray-600 border-transparent text-white",
};

export function SeverityBadge({ severity, className, grow }: SeverityBadgeProps) {
    const colorClass = SEVERITY_COLORS[severity] || SEVERITY_COLORS.INFO;

    return (
        <Badge
            className={cn(
                colorClass,
                grow && "w-full",
                className
            )}
        >
            {severity}
        </Badge>
    );
}

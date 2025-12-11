import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
    grow?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
    OPEN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-transparent",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-transparent",
    RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent",
    ACCEPTED_RISK: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-transparent",
    FALSE_POSITIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-transparent",
    RETEST_PENDING: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-transparent",
    RETEST_FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-transparent",
};

export function StatusBadge({ status, className, grow }: StatusBadgeProps) {
    const colorClass = STATUS_COLORS[status] || STATUS_COLORS.FALSE_POSITIVE;

    return (
        <Badge
            variant="outline"
            className={cn(
                colorClass,
                grow && "w-full",
                className
            )}
        >
            {status.replace('_', ' ')}
        </Badge>
    );
}

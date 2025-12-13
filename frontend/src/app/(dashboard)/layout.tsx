import { Sidebar } from "@/components/layout/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background p-6 m-4 rounded-lg border shadow-sm">
                {children}
            </main>
        </div>
    )
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, Building2, Shield, FileText, Settings, LogOut, Sun, Moon, Users, ShieldAlert, Activity, FolderKanban, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { User, fetchCurrentUser, isAdmin } from '@/lib/auth-utils';
import { VulnSphereLogo } from '@/components/layout/logo';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { setTheme, theme } = useTheme();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const user = await fetchCurrentUser();
            setCurrentUser(user);
        };
        loadUser();
    }, []);

    const handleLogout = () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        router.push('/login');
    };

    const showAdminLinks = currentUser && isAdmin(currentUser);

    return (
        <div className={cn("pb-12 w-64 border-r bg-card relative", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-4 px-4">
                        <VulnSphereLogo />
                    </div>
                    <div className="space-y-1">
                        <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/dashboard' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-3 h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/companies' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                            <Link href="/companies">
                                <Building2 className="mr-3 h-4 w-4" />
                                Companies
                            </Link>
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/projects' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                            <Link href="/projects">
                                <FolderKanban className="mr-3 h-4 w-4" />
                                Projects
                            </Link>
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/vulnerabilities' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                            <Link href="/vulnerabilities">
                                <ShieldAlert className="mr-3 h-4 w-4" />
                                Vulnerabilities
                            </Link>
                        </Button>
                        {/* Hide Templates and Reports from clients */}
                        {currentUser && currentUser.role !== 'CLIENT' && (
                            <>
                                <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/templates' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                                    <Link href="/templates">
                                        <Copy className="mr-3 h-4 w-4" />
                                        Templates
                                    </Link>
                                </Button>
                                <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/reports' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                                    <Link href="/reports">
                                        <FileText className="mr-3 h-4 w-4" />
                                        Reports
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom section for Settings and Users */}
                <div className="px-3 py-2 mt-auto">
                    <div className="space-y-1">
                        {showAdminLinks && (
                            <>
                                <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/users' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                                    <Link href="/users">
                                        <Users className="mr-3 h-4 w-4" />
                                        Users
                                    </Link>
                                </Button>
                                <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/activity-logs' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                                    <Link href="/activity-logs">
                                        <Activity className="mr-3 h-4 w-4" />
                                        Activity Logs
                                    </Link>
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" className={cn("w-full justify-start mb-1", pathname === '/settings' ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")} asChild>
                            <Link href="/settings">
                                <Settings className="mr-3 h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-3 right-3 flex items-center gap-2">
                <Button
                    variant="ghost"
                    className="flex-1 justify-start hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Logout</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex-shrink-0">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </div >
    );
}

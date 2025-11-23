'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Ticket, Users, BarChart3, LogOut, UserCircle, Shield, Building2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['CLIENT', 'TECHNICIAN', 'ADMIN'] },
    { icon: Ticket, label: 'Chamados', href: '/tickets', roles: ['CLIENT', 'TECHNICIAN', 'ADMIN'] },
    { icon: Building2, label: 'Unidades', href: '/units', roles: ['TECHNICIAN', 'ADMIN'] },
    { icon: Users, label: 'Usuários', href: '/users', roles: ['ADMIN'] },
    { icon: BarChart3, label: 'Relatórios', href: '/reports', roles: ['TECHNICIAN', 'ADMIN'] },
];

const ROLE_LABELS: Record<string, string> = {
    CLIENT: 'Usuário',
    TECHNICIAN: 'Técnico',
    ADMIN: 'Admin',
};

const ROLE_COLORS: Record<string, string> = {
    CLIENT: 'bg-slate-500/10 text-slate-400',
    TECHNICIAN: 'bg-blue-500/10 text-blue-400',
    ADMIN: 'bg-purple-500/10 text-purple-400',
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, profile, signOut, loading, refreshProfile } = useAuth();

    // Filter menu items based on user role
    const visibleMenuItems = menuItems.filter(item =>
        profile?.role && item.roles.includes(profile.role)
    );

    return (
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">H</span>
                    </div>
                    <span className="text-lg font-bold text-slate-100">HelpDesk Pro</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 w-full bg-slate-900/50 rounded-md animate-pulse mb-2" />
                    ))
                ) : !profile ? (
                    // Error State
                    <div className="text-center p-4">
                        <p className="text-slate-400 text-sm mb-3">Erro ao carregar perfil</p>
                        <button
                            onClick={() => refreshProfile()}
                            className="text-xs bg-primary/10 text-primary px-3 py-2 rounded hover:bg-primary/20 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                ) : (
                    // Menu Items
                    visibleMenuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                                )}
                            >
                                <Icon size={20} className={cn("transition-colors", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-100")} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })
                )}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-4">
                {loading ? (
                    <div className="flex items-center gap-3 px-2 animate-pulse">
                        <div className="w-9 h-9 rounded-full bg-slate-900" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-20 bg-slate-900 rounded" />
                            <div className="h-3 w-12 bg-slate-900 rounded" />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <UserCircle size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-slate-200 truncate">
                                {profile?.full_name || user?.user_metadata?.full_name || 'Usuário'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                {profile?.role && (
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-medium",
                                        ROLE_COLORS[profile.role]
                                    )}>
                                        {ROLE_LABELS[profile.role]}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
                >
                    <LogOut size={16} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}

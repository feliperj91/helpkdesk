import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export default function ReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 pl-64">
            <Sidebar />
            <main className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Relatórios</h2>
                        <p className="text-slate-400 text-sm mt-1">Análises e métricas do sistema</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        </Button>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}

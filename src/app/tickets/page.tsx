'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, TicketStatus, TicketPriority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, AlertCircle, CheckCircle2, MoreHorizontal, Search, Filter, Ticket as TicketIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<TicketStatus, string> = {
    OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    WAITING_CUSTOMER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    RESOLVED: "bg-green-500/10 text-green-400 border-green-500/20",
    CLOSED: "bg-slate-700/50 text-slate-400 border-slate-700",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
    OPEN: "Aberto",
    IN_PROGRESS: "Em Andamento",
    WAITING_CUSTOMER: "Aguardando Cliente",
    RESOLVED: "Resolvido",
    CLOSED: "Fechado",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
    LOW: "text-slate-400",
    MEDIUM: "text-blue-400",
    HIGH: "text-amber-400",
    CRITICAL: "text-red-400 font-bold",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    CRITICAL: "Crítica",
};

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    async function fetchTickets() {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredTickets = tickets.filter(ticket =>
        ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        total: tickets.length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-400">Carregando chamados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-400">Abertos</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-blue-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.open}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-400">Em Andamento</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-amber-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-400">Resolvidos</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.resolved}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-400">Total</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <TicketIcon className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar chamados..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-slate-950/50 border-slate-800"
                            />
                        </div>
                        <Button variant="outline" className="border-slate-800">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-white">Todos os Chamados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs font-medium border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Assunto</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Prioridade</th>
                                    <th className="px-6 py-4">Solicitante</th>
                                    <th className="px-6 py-4">Criado em</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                                            #{String(ticket.id).slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white group-hover:text-primary transition-colors cursor-pointer">
                                                {ticket.title}
                                            </p>
                                            {ticket.category && (
                                                <p className="text-xs text-slate-500 mt-1">{ticket.category}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium border",
                                                STATUS_STYLES[ticket.status]
                                            )}>
                                                {STATUS_LABELS[ticket.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "flex items-center gap-1.5",
                                                PRIORITY_STYLES[ticket.priority]
                                            )}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {PRIORITY_LABELS[ticket.priority]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                    {(ticket.contact_email?.[0] || '?').toUpperCase()}
                                                </div>
                                                <span className="text-slate-300 truncate max-w-[150px]">
                                                    {ticket.contact_email || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(ticket.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            {searchTerm ? 'Nenhum chamado encontrado' : 'Nenhum chamado cadastrado'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

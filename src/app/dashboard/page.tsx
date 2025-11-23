'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, TrendingUp, BarChart3, Users, Ticket } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Chamados Abertos
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">24</div>
                        <p className="text-xs text-emerald-500 flex items-center gap-1 mt-2">
                            <TrendingUp className="h-3 w-3" />
                            <span>12% vs mês anterior</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Em Atendimento
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">12</div>
                        <p className="text-xs text-slate-500 mt-2">
                            Tempo médio: 2.5h
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            SLA Crítico
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">3</div>
                        <p className="text-xs text-orange-400 mt-2">
                            Requer atenção imediata
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Resolvidos (Hoje)
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">8</div>
                        <p className="text-xs text-emerald-500 mt-2">
                            Taxa de resolução: 95%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <Card className="lg:col-span-2 border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    Desempenho Semanal
                                </CardTitle>
                                <p className="text-sm text-slate-400 mt-1">
                                    Chamados criados vs resolvidos
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-slate-950/50 rounded-lg flex items-center justify-center border border-slate-800 border-dashed">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-500">Gráfico de Chamados</p>
                                <p className="text-xs text-slate-600 mt-1">Em desenvolvimento</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Tickets */}
                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-primary" />
                            Chamados Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { title: 'Erro no Sistema ERP', time: 'Há 2 horas', priority: 'Alta', color: 'red' },
                                { title: 'Solicitação de Acesso', time: 'Há 4 horas', priority: 'Média', color: 'amber' },
                                { title: 'Problema na Impressora', time: 'Há 6 horas', priority: 'Baixa', color: 'blue' }
                            ].map((ticket, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                                >
                                    <div className={`w-2 h-2 mt-2 rounded-full bg-${ticket.color}-400`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {ticket.title}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {ticket.time} • {ticket.priority} Prioridade
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Técnicos Ativos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-2">5</div>
                        <p className="text-sm text-slate-400">
                            3 disponíveis • 2 ocupados
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Tempo Médio de Resposta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-2">1.2h</div>
                        <p className="text-sm text-emerald-400">
                            15% melhor que o mês passado
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Taxa de Satisfação
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-2">94%</div>
                        <p className="text-sm text-slate-400">
                            Baseado em 127 avaliações
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

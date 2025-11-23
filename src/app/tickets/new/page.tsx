'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { TicketPriority } from '@/types';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'LOW' as TicketPriority,
        category: 'Hardware',
        contact_email: '',
        unit: 'Matriz'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const { error: insertError } = await supabase
                .from('tickets')
                .insert([
                    {
                        ...formData,
                        status: 'OPEN',
                        created_by: user.id,
                        contact_email: formData.contact_email || user.email // Fallback to user email if empty
                    }
                ]);

            if (insertError) throw insertError;

            router.push('/tickets');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar chamado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/tickets" className="p-2 hover:bg-surface-800 rounded-lg text-surface-400 hover:text-surface-200 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-surface-100">Novo Chamado</h1>
                    <p className="text-surface-400 text-sm">Preencha os detalhes da solicitação</p>
                </div>
            </div>

            <div className="glass-panel p-8">
                {error && (
                    <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Assunto</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-surface-900/50 border border-surface-700 rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                placeholder="Ex: Computador não liga"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-surface-900/50 border border-surface-700 rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                >
                                    <option value="Hardware">Hardware</option>
                                    <option value="Software">Software</option>
                                    <option value="Rede">Rede</option>
                                    <option value="Acesso">Acesso / Login</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">Prioridade</label>
                                <select
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                                    className="w-full bg-surface-900/50 border border-surface-700 rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                >
                                    <option value="LOW">Baixa</option>
                                    <option value="MEDIUM">Média</option>
                                    <option value="HIGH">Alta</option>
                                    <option value="CRITICAL">Crítica</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Descrição Detalhada</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-surface-900/50 border border-surface-700 rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all min-h-[120px]"
                                placeholder="Descreva o problema com o máximo de detalhes possível..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">Email de Contato</label>
                                <input
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                    className="w-full bg-surface-900/50 border border-surface-700 rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                    placeholder="Opcional (usa o do cadastro)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">Unidade</label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full bg-surface-900/50 border border-surface-700 rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                    placeholder="Ex: Matriz"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4 border-t border-surface-800">
                        <Link href="/tickets" className="btn btn-ghost">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Criando...' : 'Criar Chamado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Apenas para log, não bloqueia nada
        const checkTokens = () => {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            if (accessToken) {
                console.log('� [INIT] Token detectado na URL.');
            } else {
                console.log('⚠️ [INIT] Nenhum token detectado (pode ser problema se não estiver logado).');
            }
        };
        checkTokens();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            console.log('🚀 [RESET] Iniciando reset de senha (Modo Direto)...');

            // 1. Obter tokens da URL
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');

            if (!accessToken) {
                throw new Error('Token de acesso não encontrado. Por favor, clique no link do email novamente.');
            }

            console.log('� [RESET] Token encontrado, fazendo requisição direta...');

            // 2. Construir a URL da API
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Configuração do Supabase ausente.');
            }

            // 3. Fazer a requisição direta (Bypass no SDK)
            // Endpoint: /auth/v1/user
            const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    password: password
                })
            });

            const data = await response.json();

            console.log('📊 [RESET] Resposta da API:', { status: response.status, data });

            if (!response.ok) {
                throw new Error(data.msg || data.error_description || data.message || 'Erro ao atualizar senha');
            }

            // 4. Sucesso!
            console.log('🎉 [RESET] Sucesso confirmado!');
            setSuccess(true);
            setTimeout(() => router.push('/'), 3000);

        } catch (err: any) {
            console.error('💥 [RESET] Erro:', err);
            setError(err.message || 'Erro ao redefinir senha');
        } finally {
            if (!success) setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-950">
                <Card className="w-full max-w-md border-slate-800 bg-slate-900/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        </div>
                        <CardTitle className="text-white">Senha Redefinida!</CardTitle>
                        <CardDescription>Redirecionando para o login...</CardDescription>
                    </CardHeader>
                </Card>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-950">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/50">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-white">Nova Senha</CardTitle>
                    <CardDescription>Digite sua nova senha abaixo</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-950/50 border-slate-800 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-slate-950/50 border-slate-800 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Redefinindo...
                                </>
                            ) : (
                                'Redefinir Senha'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}

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
    // Simplificando: não vamos usar o status para bloquear a UI
    const [sessionStatus, setSessionStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
    const router = useRouter();

    useEffect(() => {
        // Tenta recuperar a sessão silenciosamente ao carregar
        const initSession = async () => {
            try {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                if (accessToken && type === 'recovery') {
                    console.log('🔐 [INIT] Tentando estabelecer sessão com tokens da URL...');
                    // Não vamos esperar (await) isso bloquear a UI se travar
                    supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || ''
                    }).then(({ data, error }) => {
                        console.log('📊 [INIT] Resultado setSession:', { session: !!data.session, error });
                        if (data.session) setSessionStatus('authenticated');
                    });
                } else {
                    const { data } = await supabase.auth.getSession();
                    if (data.session) setSessionStatus('authenticated');
                    else setSessionStatus('unauthenticated');
                }
            } catch (e) {
                console.error('Erro no init:', e);
                setSessionStatus('unauthenticated');
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 [AUTH] Evento:', event);
            if (session) setSessionStatus('authenticated');
            if (event === 'USER_UPDATED') {
                setSuccess(true);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
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

        try {
            console.log('🚀 [RESET] Iniciando reset de senha...');

            // Tenta garantir que temos uma sessão antes de atualizar
            // Se o setSession anterior travou, vamos tentar forçar aqui com timeout
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken) {
                console.log('🔄 [RESET] Reforçando sessão antes do update...');
                await Promise.race([
                    supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || ''
                    }),
                    new Promise(r => setTimeout(r, 2000)) // Timeout curto de 2s para não travar
                ]);
            }

            console.log('📝 [RESET] Chamando updateUser...');
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            console.log('📊 [RESET] Resultado updateUser:', { data, error });

            if (error) throw error;

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

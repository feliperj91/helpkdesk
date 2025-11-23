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
    const [sessionStatus, setSessionStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
    const router = useRouter();

    // Check session on mount
    useEffect(() => {
        const checkConnection = async () => {
            const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (!sbUrl) return;

            try {
                console.log(`Testando conexão direta com ${sbUrl}...`);
                // Try to fetch the health check endpoint or just the root
                const start = Date.now();
                const res = await fetch(`${sbUrl}/auth/v1/health`, {
                    method: 'GET',
                    headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' }
                });
                const end = Date.now();
                console.log(`Conexão direta: ${res.status} ${res.statusText} (${end - start}ms)`);

                if (!res.ok) {
                    console.error('Erro na conexão direta:', await res.text());
                }
            } catch (e) {
                console.error('FALHA CRÍTICA DE REDE:', e);
                alert('Erro de Conexão: O navegador não consegue acessar o servidor do Supabase. Verifique se há bloqueadores de anúncio ou firewall impedindo a conexão.');
            }
        };

        const checkSession = async () => {
            console.log('Verificando sessão inicial...');
            console.log('URL Atual:', window.location.href);
            console.log('Hash da URL:', window.location.hash);

            // Check for errors in URL
            if (window.location.hash.includes('error=')) {
                console.error('Erro detectado na URL!');
                const params = new URLSearchParams(window.location.hash.substring(1));
                const errorDescription = params.get('error_description');
                alert(`Erro no Link: ${errorDescription || 'Link inválido ou expirado'}. Solicite uma nova redefinição de senha.`);
                setSessionStatus('unauthenticated');
                return;
            }

            // Run connection test first
            await checkConnection();

            console.log('Chamando supabase.auth.getSession()...');
            const { data: { session } } = await supabase.auth.getSession();
            console.log('getSession retornou:', session ? 'Sessão Válida' : 'Sem Sessão');
            setSessionStatus(session ? 'authenticated' : 'unauthenticated');
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Mudança de auth:', _event, !!session);
            setSessionStatus(session ? 'authenticated' : 'unauthenticated');
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

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            // Tenta obter a sessão atual com timeout
            console.log('Verificando sessão...');

            const sessionTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Tempo limite ao verificar sessão. Recarregue a página.')), 5000);
            });

            const sessionPromise = supabase.auth.getSession();

            let { data: { session } } = await Promise.race([sessionPromise, sessionTimeoutPromise]) as any;

            console.log('Sessão encontrada:', !!session);

            if (!session) {
                throw new Error('Sessão inválida ou expirada. Por favor, clique no link do email novamente.');
            }

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Tempo limite da requisição excedido. Verifique sua conexão.')), 10000);
            });

            const updatePromise = supabase.auth.updateUser({
                password: password
            });

            const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

            if (error) throw error;
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: any) {
            console.error('Erro ao redefinir senha:', err);
            setError(err.message || 'Erro ao redefinir senha');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
                </div>

                <Card className="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">Senha Redefinida!</CardTitle>
                        <CardDescription className="text-slate-400">
                            Sua senha foi alterada com sucesso
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-slate-400 mb-6">
                            Você será redirecionado para a página de login em alguns segundos...
                        </p>
                        <Link href="/">
                            <Button className="w-full">
                                Ir para o Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
            </div>

            <Card className="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${sessionStatus === 'authenticated' ? 'bg-emerald-500/10 text-emerald-500' :
                                sessionStatus === 'unauthenticated' ? 'bg-red-500/10 text-red-500' :
                                    'bg-blue-500/10 text-blue-500'
                            }`}>
                            {sessionStatus === 'authenticated' ? 'Conectado' :
                                sessionStatus === 'unauthenticated' ? 'Desconectado' :
                                    'Verificando conexão...'}
                        </span>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">Nova Senha</CardTitle>
                    <CardDescription className="text-slate-400">
                        Digite sua nova senha abaixo
                    </CardDescription>
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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-primary pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
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
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-primary pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
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
                <CardFooter className="flex justify-center border-t border-slate-800 pt-6">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-white">
                        Cancelar
                    </Link>
                </CardFooter>
            </Card>
        </main>
    );
}

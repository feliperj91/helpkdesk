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

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSessionStatus(session ? 'authenticated' : 'unauthenticated');
            } catch (err) {
                setSessionStatus('unauthenticated');
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('Sessão inválida ou expirada. Por favor, clique no link do email novamente.');
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);

            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: any) {
            let errorMessage = 'Erro ao redefinir senha';

            if (err.message?.toLowerCase().includes('same password')) {
                errorMessage = 'A nova senha não pode ser igual à senha atual. Por favor, escolha uma senha diferente.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
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

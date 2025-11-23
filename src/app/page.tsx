'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log('🚀 [LOGIN] Iniciando processo de login...');

            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                throw new Error('Configuração do Supabase não encontrada.');
            }

            // Tentativa 1: SDK Padrão com Timeout
            console.log('🔄 [LOGIN] Tentando via SDK...');
            const loginPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_SDK')), 5000)
            );

            try {
                const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

                if (error) throw error;

                if (data?.session) {
                    console.log('✅ [LOGIN] Sucesso via SDK!');
                    router.push('/dashboard');
                    return;
                }
            } catch (err: any) {
                if (err.message === 'TIMEOUT_SDK') {
                    console.warn('⚠️ [LOGIN] Timeout no SDK, tentando via API REST...');
                } else {
                    throw err; // Se for erro de senha incorreta, joga pra fora
                }
            }

            // Tentativa 2: Fallback para API REST
            console.log('🔄 [LOGIN] Tentando via API REST direta...');
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || data.msg || 'Erro ao fazer login');
            }

            console.log('✅ [LOGIN] Sucesso via API REST! Configurando sessão...');

            // Hidratar a sessão no SDK para o resto do app funcionar
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token
            });

            if (sessionError) {
                console.error('❌ [LOGIN] Erro ao salvar sessão:', sessionError);
                // Mesmo com erro no setSession, vamos tentar redirecionar pois o cookie pode ter sido setado
            }

            router.push('/dashboard');

        } catch (err: any) {
            console.error('💥 [LOGIN] Erro:', err);
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            // Só tira o loading se der erro, se der sucesso vai redirecionar
            // Mas como o router.push é assíncrono, melhor garantir que não fique travado se o redirecionamento falhar
            setTimeout(() => setLoading(false), 2000);
        }
    };


    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
            </div>

            <Card className="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">HelpDesk Pro</CardTitle>
                    <CardDescription className="text-slate-400">
                        Entre com suas credenciais para acessar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:text-primary/80 hover:underline"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-primary"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-800 pt-6">
                    <div className="text-sm text-muted-foreground">
                        Não tem uma conta?{" "}
                        <Link href="/register" className="text-primary hover:text-primary/80 font-medium hover:underline">
                            Cadastre-se
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}

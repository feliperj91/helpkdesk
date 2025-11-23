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

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create a timeout promise that rejects after 10 seconds
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Tempo limite da requisição excedido. Verifique sua conexão.')), 10000);
            });

            const signUpPromise = supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            // Race between the signUp and the timeout
            const { error } = await Promise.race([signUpPromise, timeoutPromise]) as any;

            if (error) throw error;

            router.push('/dashboard');
        } catch (err: any) {
            console.error('Erro no cadastro:', err);
            setError(err.message || 'Erro ao cadastrar');
        } finally {
            setLoading(false);
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
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">Crie sua conta</CardTitle>
                    <CardDescription className="text-slate-400">
                        Junte-se ao HelpDesk Pro para começar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Seu nome"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-primary"
                            />
                        </div>

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
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
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
                                    Criando conta...
                                </>
                            ) : (
                                'Cadastrar'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-800 pt-6">
                    <div className="text-sm text-muted-foreground">
                        Já tem uma conta?{" "}
                        <Link href="/" className="text-primary hover:text-primary/80 font-medium hover:underline">
                            Entrar
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}

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
        console.log('🔵 [SESSION] useEffect iniciado - verificando sessão...');

        const checkSession = async () => {
            try {
                // Verificar se há tokens na URL (hash fragments)
                console.log('🔗 [SESSION] URL:', window.location.href);
                console.log('🔗 [SESSION] Hash:', window.location.hash);

                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                console.log('🎫 [SESSION] Tokens:', {
                    accessToken: accessToken ? 'SIM' : 'NÃO',
                    refreshToken: refreshToken ? 'SIM' : 'NÃO',
                    type: type
                });

                // Se encontrou tokens de recovery, criar sessão manualmente
                if (accessToken && type === 'recovery') {
                    console.log('🔐 [SESSION] Criando sessão com tokens de recovery...');

                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || ''
                    });

                    console.log('📊 [SESSION] Resultado setSession:', {
                        session: data.session ? 'CRIADA' : 'FALHOU',
                        error: error,
                        user: data.session?.user?.email
                    });

                    if (error) {
                        console.error('❌ [SESSION] Erro ao criar sessão:', error);
                        setSessionStatus('unauthenticated');
                        setError('Link inválido ou expirado. Solicite um novo link.');
                        return;
                    }

                    if (data.session) {
                        console.log('✅ [SESSION] Sessão criada com sucesso!');
                        setSessionStatus('authenticated');
                        return;
                    }
                }

                // Se não encontrou tokens, verificar sessão existente
                console.log('🔍 [SESSION] Chamando supabase.auth.getSession()...');
                const { data: { session }, error } = await supabase.auth.getSession();

                console.log('📊 [SESSION] Resultado:', {
                    session: session ? 'ENCONTRADA' : 'NÃO ENCONTRADA',
                    error: error,
                    user: session?.user?.email
                });

                setSessionStatus(session ? 'authenticated' : 'unauthenticated');
                console.log('✅ [SESSION] Status definido como:', session ? 'authenticated' : 'unauthenticated');
            } catch (err) {
                console.error('❌ [SESSION] Erro ao verificar sessão:', err);
                setSessionStatus('unauthenticated');
            }
        };

        checkSession();

        console.log('👂 [SESSION] Configurando listener de mudanças de auth...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('🔄 [SESSION] Mudança de auth detectada:', {
                event: _event,
                session: session ? 'ATIVA' : 'NENHUMA'
            });
            setSessionStatus(session ? 'authenticated' : 'unauthenticated');

            // Failsafe: Se detectar atualização de usuário, considerar sucesso
            if (_event === 'USER_UPDATED') {
                console.log('🎉 [LISTENER] Evento USER_UPDATED detectado! Forçando sucesso...');
                setLoading(false);
                setSuccess(true);
                setTimeout(() => {
                    console.log('🔄 [LISTENER] Redirecionando...');
                    router.push('/');
                }, 3000);
            }
        });

        return () => {
            console.log('🔌 [SESSION] Desconectando listener');
            subscription.unsubscribe();
        };
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🚀 [RESET] Função handleResetPassword iniciada');
        console.log('🔑 [RESET] Valores:', {
            password: password,
            confirmPassword: confirmPassword,
            passwordLength: password.length,
            confirmPasswordLength: confirmPassword.length,
            areEqual: password === confirmPassword
        });
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            console.log('❌ [RESET] Senhas não coincidem');
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            console.log('❌ [RESET] Senha muito curta');
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        console.log('✅ [RESET] Validações iniciais passaram');

        try {
            console.log('🔍 [RESET] Verificando status da sessão atual...');
            console.log('📊 [RESET] sessionStatus:', sessionStatus);

            // Aguardar até que o status não seja mais 'checking'
            if (sessionStatus === 'checking') {
                console.log('⏳ [RESET] Aguardando sessão ser processada...');

                // Aguardar até 10 segundos para o status mudar
                const maxWait = 10000;
                const startTime = Date.now();

                while (sessionStatus === 'checking' && (Date.now() - startTime) < maxWait) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                console.log('📊 [RESET] sessionStatus após aguardar:', sessionStatus);

                if (sessionStatus === 'checking') {
                    throw new Error('Tempo limite ao aguardar conexão. Por favor, tente novamente.');
                }
            }

            // Verificar se está autenticado
            if (sessionStatus !== 'authenticated') {
                console.error('❌ [RESET] Status não autenticado:', sessionStatus);
                throw new Error('Sessão inválida. Por favor, clique no link do email novamente.');
            }

            console.log('🔄 [RESET] Tentando atualizar sessão antes de prosseguir...');
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
                console.warn('⚠️ [RESET] Erro ao atualizar sessão (não fatal):', refreshError);
            }

            console.log('✅ [RESET] Sessão pronta, iniciando atualização de senha...');
            const updateStart = Date.now();

            // Função para tentar atualizar com retry
            const attemptUpdate = async (attempt = 1): Promise<any> => {
                console.log(`🔄 [RESET] Tentativa de atualização ${attempt}/2...`);

                const updatePromise = supabase.auth.updateUser({
                    password: password
                });

                const timeoutMs = 15000; // 15 segundos
                const updateTimeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Timeout na tentativa ${attempt}`)), timeoutMs)
                );

                try {
                    return await Promise.race([updatePromise, updateTimeoutPromise]);
                } catch (err) {
                    if (attempt < 2) {
                        console.log(`⚠️ [RESET] Tentativa ${attempt} falhou, tentando novamente...`);
                        return attemptUpdate(attempt + 1);
                    }
                    throw err;
                }
            };

            const { data: updateData, error: updateError } = await attemptUpdate();

            const updateTime = Date.now() - updateStart;
            console.log(`⏱️ [RESET] Tempo total para atualizar senha: ${updateTime}ms`);
            console.log('📊 [RESET] Dados da atualização:', updateData);
            console.log('📊 [RESET] Erro da atualização:', updateError);

            if (updateError) {
                console.error('❌ [RESET] Erro ao atualizar senha:', updateError);
                throw updateError;
            }

            console.log('🎉 [RESET] Senha atualizada com sucesso!');
            setSuccess(true);

            setTimeout(() => {
                console.log('🔄 [RESET] Redirecionando para login...');
                router.push('/');
            }, 3000);
        } catch (err: any) {
            console.error('💥 [RESET] Erro capturado:', err);
            console.error('💥 [RESET] Tipo do erro:', typeof err);
            console.error('💥 [RESET] Mensagem:', err?.message);
            console.error('💥 [RESET] Stack:', err?.stack);

            let errorMessage = 'Erro ao redefinir senha';

            if (err.message?.toLowerCase().includes('same password')) {
                console.log('⚠️ [RESET] Erro: Senha igual à atual');
                errorMessage = 'A nova senha não pode ser igual à senha atual. Por favor, escolha uma senha diferente.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            console.log('📢 [RESET] Exibindo erro para usuário:', errorMessage);
            setError(errorMessage);
        } finally {
            if (!success) {
                console.log('🏁 [RESET] Finalizando, setLoading(false)');
                setLoading(false);
            }
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
                            disabled={loading || sessionStatus !== 'authenticated'}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Redefinindo...
                                </>
                            ) : sessionStatus === 'checking' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Aguardando conexão...
                                </>
                            ) : sessionStatus === 'unauthenticated' ? (
                                'Link Inválido'
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

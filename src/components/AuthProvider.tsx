'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'CLIENT' | 'TECHNICIAN' | 'ADMIN';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        console.log('🔐 AuthProvider: Inicializando...');

        // Verificar sessão imediatamente
        const checkSession = async () => {
            try {
                console.log('🔍 AuthProvider: Verificando sessão existente...');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ AuthProvider: Erro ao obter sessão:', error);
                    setLoading(false);
                    return;
                }

                console.log('📋 AuthProvider: Sessão obtida:', session ? '✓ Ativa' : '✗ Nenhuma');

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    console.log('👤 AuthProvider: Buscando perfil do usuário...');
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) {
                        console.error('❌ AuthProvider: Erro ao buscar perfil:', profileError);
                    } else {
                        console.log('✓ AuthProvider: Perfil carregado:', profileData?.role);
                    }

                    setProfile(profileData);
                } else {
                    setProfile(null);
                }

                setLoading(false);
            } catch (err) {
                console.error('❌ AuthProvider: Erro inesperado:', err);
                setLoading(false);
            }
        };

        checkSession();

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 AuthProvider: Mudança de estado:', event, session ? '✓ Sessão ativa' : '✗ Sem sessão');

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                console.log('👤 AuthProvider: Buscando perfil após mudança...');
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setProfile(profileData);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            console.log('🔌 AuthProvider: Desconectando listener');
            subscription.unsubscribe();
        };
    }, []);

    // Redirect logic based on authentication
    useEffect(() => {
        if (loading) {
            console.log('⏳ AuthProvider: Aguardando carregamento...');
            return;
        }

        const publicRoutes = ['/', '/register', '/forgot-password', '/reset-password'];
        const isPublicRoute = publicRoutes.includes(pathname);

        console.log('🔀 AuthProvider: Verificando redirecionamento', {
            pathname,
            isPublicRoute,
            hasUser: !!user
        });

        if (!user && !isPublicRoute) {
            console.log('🚫 AuthProvider: Usuário não autenticado, redirecionando para login');
            router.push('/');
        } else if (user) {
            console.log('✅ AuthProvider: Usuário autenticado:', user.email);
        }
    }, [user, loading, pathname, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

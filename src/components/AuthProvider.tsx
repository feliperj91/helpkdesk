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
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchProfile = async (userId: string, accessToken: string, attempt = 1): Promise<Profile | null> => {
        try {
            console.log(`🔍 [AUTH] Buscando perfil via REST (Tentativa ${attempt})...`);

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.error('❌ [AUTH] Configuração do Supabase ausente.');
                return null;
            }

            // Usar fetch direto para evitar travamento do SDK
            const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
                method: 'GET',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`❌ [AUTH] Erro HTTP: ${response.status}`);
                if (attempt < 3) {
                    console.log(`🔄 [AUTH] Tentando novamente em 1s...`);
                    await new Promise(r => setTimeout(r, 1000));
                    return fetchProfile(userId, accessToken, attempt + 1);
                }
                return null;
            }

            const data = await response.json();

            if (data && data.length > 0) {
                console.log('✅ [AUTH] Perfil encontrado (REST):', data[0]);
                return data[0];
            } else {
                console.warn('⚠️ [AUTH] Perfil não encontrado no banco.');
                return null;
            }

        } catch (err) {
            console.error('💥 [AUTH] Erro inesperado ao buscar perfil:', err);
            return null;
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            try {
                console.log('🔵 [AUTH] Verificando sessão inicial...');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ [AUTH] Erro ao verificar sessão:', error);
                    setLoading(false);
                    return;
                }

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    console.log('👤 [AUTH] Usuário detectado:', session.user.email);
                    const profileData = await fetchProfile(session.user.id, session.access_token);
                    setProfile(profileData);
                } else {
                    console.log('⚪ [AUTH] Nenhuma sessão ativa.');
                    setProfile(null);
                }

                setLoading(false);
            } catch (err) {
                console.error('💥 [AUTH] Erro fatal no checkSession:', err);
                setLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`🔄 [AUTH] Mudança de estado: ${event}`);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Se o perfil já estiver carregado e for o mesmo usuário, não precisa buscar de novo
                // Mas se for USER_UPDATED ou INITIAL_SESSION, vale a pena garantir
                if (!profile || profile.id !== session.user.id || event === 'USER_UPDATED') {
                    const profileData = await fetchProfile(session.user.id, session.access_token);
                    setProfile(profileData);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Redirect logic based on authentication
    useEffect(() => {
        if (loading) return;

        const publicRoutes = ['/', '/register', '/forgot-password', '/reset-password'];
        const isPublicRoute = publicRoutes.includes(pathname);

        if (!user && !isPublicRoute) {
            router.push('/');
        }
    }, [user, loading, pathname, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        router.push('/');
    };

    const refreshProfile = async () => {
        if (user && session) {
            setLoading(true);
            const profileData = await fetchProfile(user.id, session.access_token);
            setProfile(profileData);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

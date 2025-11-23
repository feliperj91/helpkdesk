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

    const fetchProfile = async (userId: string, attempt = 1): Promise<Profile | null> => {
        try {
            console.log(`🔍 [AUTH] Buscando perfil para usuário ${userId} (Tentativa ${attempt})...`);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('❌ [AUTH] Erro ao buscar perfil:', error);
                if (attempt < 3) {
                    console.log(`🔄 [AUTH] Tentando novamente em 1s...`);
                    await new Promise(r => setTimeout(r, 1000));
                    return fetchProfile(userId, attempt + 1);
                }
                return null;
            }

            console.log('✅ [AUTH] Perfil encontrado:', data);
            return data;
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
                    const profileData = await fetchProfile(session.user.id);
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
                    const profileData = await fetchProfile(session.user.id);
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

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

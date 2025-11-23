'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Users, Search, Shield, UserCog, Key, Loader2, AlertTriangle, UserPlus, Edit, Trash2, Plus, FolderKanban } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

type UserRole = 'CLIENT' | 'TECHNICIAN' | 'ADMIN';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    created_at: string;
}

interface AccessGroup {
    id: string;
    name: string;
    description: string | null;
}

interface TicketQueue {
    id: string;
    name: string;
    client_name: string;
    description: string | null;
}

const ROLE_LABELS: Record<UserRole, string> = {
    CLIENT: 'Usuário Padrão',
    TECHNICIAN: 'Técnico',
    ADMIN: 'Administrador',
};

const ROLE_COLORS: Record<UserRole, string> = {
    CLIENT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    TECHNICIAN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function UsersPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();

    // Users state
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [newRole, setNewRole] = useState<UserRole>('CLIENT');
    const [resetPasswordUser, setResetPasswordUser] = useState<{ email: string; name: string } | null>(null);

    // New user dialog
    const [showNewUserDialog, setShowNewUserDialog] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', full_name: '', password: '', role: 'CLIENT' as UserRole });
    const [creatingUser, setCreatingUser] = useState(false);

    // Edit user dialog
    const [editUserDialog, setEditUserDialog] = useState<Profile | null>(null);

    // Groups state
    const [groups, setGroups] = useState<AccessGroup[]>([]);
    const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });
    const [editingGroup, setEditingGroup] = useState<AccessGroup | null>(null);

    // Queues state
    const [queues, setQueues] = useState<TicketQueue[]>([]);
    const [showNewQueueDialog, setShowNewQueueDialog] = useState(false);
    const [newQueue, setNewQueue] = useState({ name: '', client_name: '', description: '' });
    const [editingQueue, setEditingQueue] = useState<TicketQueue | null>(null);

    // Check if user is ADMIN
    useEffect(() => {
        if (!authLoading && profile && profile.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        if (profile?.role === 'ADMIN') {
            fetchUsers();
            fetchGroups();
            fetchQueues();
        }
    }, [profile]);

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchGroups() {
        try {
            const { data, error } = await supabase
                .from('access_groups')
                .select('*')
                .order('name');

            if (error) throw error;
            setGroups(data || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    }

    async function fetchQueues() {
        try {
            const { data, error } = await supabase
                .from('ticket_queues')
                .select('*')
                .order('client_name, name');

            if (error) throw error;
            setQueues(data || []);
        } catch (error) {
            console.error('Error fetching queues:', error);
        }
    }

    async function handleCreateUser() {
        if (!newUser.email || !newUser.password || !newUser.full_name) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        setCreatingUser(true);
        try {
            // Create user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.full_name,
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Update profile with role
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        role: newUser.role,
                        full_name: newUser.full_name
                    })
                    .eq('id', authData.user.id);

                if (profileError) throw profileError;
            }

            alert('Usuário criado com sucesso!');
            setShowNewUserDialog(false);
            setNewUser({ email: '', full_name: '', password: '', role: 'CLIENT' });
            fetchUsers();
        } catch (error: any) {
            console.error('Error creating user:', error);
            alert(error.message || 'Erro ao criar usuário');
        } finally {
            setCreatingUser(false);
        }
    }

    async function handleUpdateUserName(userId: string, newName: string) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: newName })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, full_name: newName } : u));
            setEditUserDialog(null);
            alert('Nome atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating user name:', error);
            alert('Erro ao atualizar nome do usuário');
        }
    }

    async function handleRoleChange(userId: string, role: UserRole) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
            setEditingUser(null);
            alert('Função atualizada com sucesso!');
        } catch (error: any) {
            console.error('Error updating role:', error);
            alert('Erro ao atualizar função do usuário');
        }
    }

    async function confirmResetPassword() {
        if (!resetPasswordUser) return;

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetPasswordUser.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            alert(`Email de recuperação enviado para ${resetPasswordUser.email}`);
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Erro ao enviar email de recuperação');
        } finally {
            setResetPasswordUser(null);
        }
    }

    async function handleCreateGroup() {
        if (!newGroup.name) {
            alert('Digite o nome do grupo');
            return;
        }

        try {
            const { error } = await supabase
                .from('access_groups')
                .insert([newGroup]);

            if (error) throw error;

            alert('Grupo criado com sucesso!');
            setShowNewGroupDialog(false);
            setNewGroup({ name: '', description: '' });
            fetchGroups();
        } catch (error: any) {
            console.error('Error creating group:', error);
            alert(error.message || 'Erro ao criar grupo');
        }
    }

    async function handleUpdateGroup() {
        if (!editingGroup) return;

        try {
            const { error } = await supabase
                .from('access_groups')
                .update({ name: editingGroup.name, description: editingGroup.description })
                .eq('id', editingGroup.id);

            if (error) throw error;

            alert('Grupo atualizado com sucesso!');
            setEditingGroup(null);
            fetchGroups();
        } catch (error: any) {
            console.error('Error updating group:', error);
            alert(error.message || 'Erro ao atualizar grupo');
        }
    }

    async function handleDeleteGroup(groupId: string) {
        if (!confirm('Tem certeza que deseja excluir este grupo?')) return;

        try {
            const { error } = await supabase
                .from('access_groups')
                .delete()
                .eq('id', groupId);

            if (error) throw error;

            alert('Grupo excluído com sucesso!');
            fetchGroups();
        } catch (error: any) {
            console.error('Error deleting group:', error);
            alert(error.message || 'Erro ao excluir grupo');
        }
    }

    async function handleCreateQueue() {
        if (!newQueue.name || !newQueue.client_name) {
            alert('Preencha o nome da fila e o cliente');
            return;
        }

        try {
            const { error } = await supabase
                .from('ticket_queues')
                .insert([newQueue]);

            if (error) throw error;

            alert('Fila criada com sucesso!');
            setShowNewQueueDialog(false);
            setNewQueue({ name: '', client_name: '', description: '' });
            fetchQueues();
        } catch (error: any) {
            console.error('Error creating queue:', error);
            alert(error.message || 'Erro ao criar fila');
        }
    }

    async function handleUpdateQueue() {
        if (!editingQueue) return;

        try {
            const { error } = await supabase
                .from('ticket_queues')
                .update({
                    name: editingQueue.name,
                    client_name: editingQueue.client_name,
                    description: editingQueue.description
                })
                .eq('id', editingQueue.id);

            if (error) throw error;

            alert('Fila atualizada com sucesso!');
            setEditingQueue(null);
            fetchQueues();
        } catch (error: any) {
            console.error('Error updating queue:', error);
            alert(error.message || 'Erro ao atualizar fila');
        }
    }

    async function handleDeleteQueue(queueId: string) {
        if (!confirm('Tem certeza que deseja excluir esta fila?')) return;

        try {
            const { error } = await supabase
                .from('ticket_queues')
                .delete()
                .eq('id', queueId);

            if (error) throw error;

            alert('Fila excluída com sucesso!');
            fetchQueues();
        } catch (error: any) {
            console.error('Error deleting queue:', error);
            alert(error.message || 'Erro ao excluir fila');
        }
    }

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        technicians: users.filter(u => u.role === 'TECHNICIAN').length,
        clients: users.filter(u => u.role === 'CLIENT').length,
    };

    // Group queues by client
    const queuesByClient = queues.reduce((acc, queue) => {
        if (!acc[queue.client_name]) {
            acc[queue.client_name] = [];
        }
        acc[queue.client_name].push(queue);
        return acc;
    }, {} as Record<string, TicketQueue[]>);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (profile?.role !== 'ADMIN') {
        return null;
    }

    return (
        <>
            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="bg-slate-900 border border-slate-800">
                    <TabsTrigger value="users" className="data-[state=active]:bg-slate-800">
                        <Users className="h-4 w-4 mr-2" />
                        Usuários
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="data-[state=active]:bg-slate-800">
                        <Shield className="h-4 w-4 mr-2" />
                        Grupos de Acesso
                    </TabsTrigger>
                    <TabsTrigger value="queues" className="data-[state=active]:bg-slate-800">
                        <FolderKanban className="h-4 w-4 mr-2" />
                        Filas de Chamados
                    </TabsTrigger>
                </TabsList>

                {/* USERS TAB */}
                <TabsContent value="users" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-slate-800 bg-slate-900/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-400">Total de Usuários</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.total}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-400">Administradores</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-400">{stats.admins}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-400">Técnicos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-400">{stats.technicians}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-400">Clientes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-400">{stats.clients}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Actions */}
                    <Card className="border-slate-800 bg-slate-900/50">
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar usuários..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-slate-950/50 border-slate-800"
                                    />
                                </div>
                                <Button onClick={() => setShowNewUserDialog(true)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Novo Usuário
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users List */}
                    <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-white">Usuários Cadastrados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-white">{user.full_name || 'Sem nome'}</h4>
                                                    <span className={`text-xs px-2 py-0.5 rounded border ${ROLE_COLORS[user.role]}`}>
                                                        {ROLE_LABELS[user.role]}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editingUser === user.id ? (
                                                <>
                                                    <Select
                                                        value={newRole}
                                                        onValueChange={(value) => setNewRole(value as UserRole)}
                                                    >
                                                        <SelectTrigger className="w-40 bg-slate-950/50 border-slate-700">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="CLIENT">Usuário Padrão</SelectItem>
                                                            <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleRoleChange(user.id, newRole)}
                                                    >
                                                        Salvar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingUser(null)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditUserDialog(user)}
                                                        title="Editar nome"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingUser(user.id);
                                                            setNewRole(user.role);
                                                        }}
                                                        title="Alterar função"
                                                    >
                                                        <UserCog className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setResetPasswordUser({ email: user.email, name: user.full_name })}
                                                        title="Resetar senha"
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        Nenhum usuário encontrado
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* GROUPS TAB */}
                <TabsContent value="groups" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Grupos de Acesso</h3>
                            <p className="text-sm text-slate-400 mt-1">{groups.length} grupo(s) cadastrado(s)</p>
                        </div>
                        <Button onClick={() => setShowNewGroupDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Grupo
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <Card key={group.id} className="border-slate-800 bg-slate-900/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            <CardTitle className="text-white">{group.name}</CardTitle>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingGroup(group)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteGroup(group.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                {group.description && (
                                    <CardContent>
                                        <p className="text-sm text-slate-400">{group.description}</p>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                        {groups.length === 0 && (
                            <Card className="border-slate-800 bg-slate-900/50 col-span-full">
                                <CardContent className="py-12 text-center text-slate-500">
                                    Nenhum grupo cadastrado
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* QUEUES TAB */}
                <TabsContent value="queues" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Filas de Chamados</h3>
                            <p className="text-sm text-slate-400 mt-1">{queues.length} fila(s) cadastrada(s)</p>
                        </div>
                        <Button onClick={() => setShowNewQueueDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Fila
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(queuesByClient).map(([clientName, clientQueues]) => (
                            <Card key={clientName} className="border-slate-800 bg-slate-900/50">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <FolderKanban className="h-5 w-5 text-primary" />
                                        {clientName}
                                        <span className="text-sm text-slate-400 font-normal">
                                            ({clientQueues.length} fila{clientQueues.length !== 1 ? 's' : ''})
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {clientQueues.map((queue) => (
                                            <div
                                                key={queue.id}
                                                className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-white">{queue.name}</h4>
                                                        {queue.description && (
                                                            <p className="text-sm text-slate-400 mt-1">{queue.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => setEditingQueue(queue)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => handleDeleteQueue(queue.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3 text-red-400" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {queues.length === 0 && (
                            <Card className="border-slate-800 bg-slate-900/50">
                                <CardContent className="py-12 text-center text-slate-500">
                                    Nenhuma fila cadastrada
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* New User Dialog */}
            <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">Novo Usuário</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Crie um novo usuário no sistema
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="new-user-name">Nome Completo *</Label>
                            <Input
                                id="new-user-name"
                                value={newUser.full_name}
                                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                placeholder="João Silva"
                                className="bg-slate-950/50 border-slate-800"
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-user-email">Email *</Label>
                            <Input
                                id="new-user-email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="joao@exemplo.com"
                                className="bg-slate-950/50 border-slate-800"
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-user-password">Senha *</Label>
                            <Input
                                id="new-user-password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Mínimo 6 caracteres"
                                className="bg-slate-950/50 border-slate-800"
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-user-role">Função *</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                            >
                                <SelectTrigger className="bg-slate-950/50 border-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CLIENT">Usuário Padrão</SelectItem>
                                    <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowNewUserDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateUser} disabled={creatingUser}>
                            {creatingUser ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                'Criar Usuário'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Name Dialog */}
            <Dialog open={!!editUserDialog} onOpenChange={() => setEditUserDialog(null)}>
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">Editar Usuário</DialogTitle>
                    </DialogHeader>
                    {editUserDialog && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-user-name">Nome Completo</Label>
                                <Input
                                    id="edit-user-name"
                                    value={editUserDialog.full_name}
                                    onChange={(e) => setEditUserDialog({ ...editUserDialog, full_name: e.target.value })}
                                    className="bg-slate-950/50 border-slate-800"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditUserDialog(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={() => editUserDialog && handleUpdateUserName(editUserDialog.id, editUserDialog.full_name)}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={!!resetPasswordUser} onOpenChange={() => setResetPasswordUser(null)}>
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Resetar Senha
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Um email de recuperação será enviado para o usuário.
                        </DialogDescription>
                    </DialogHeader>
                    {resetPasswordUser && (
                        <div className="space-y-2">
                            <p className="text-white">
                                <strong>Usuário:</strong> {resetPasswordUser.name}
                            </p>
                            <p className="text-white">
                                <strong>Email:</strong> {resetPasswordUser.email}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setResetPasswordUser(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmResetPassword}>
                            Enviar Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Group Dialog */}
            <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">Novo Grupo de Acesso</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Crie um novo grupo de acesso
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="new-group-name">Nome do Grupo *</Label>
                            <Input
                                id="new-group-name"
                                value={newGroup.name}
                                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                placeholder="Ex: Suporte Nível 1"
                                className="bg-slate-950/50 border-slate-800"
                                autoFocus
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-group-description">Descrição</Label>
                            <Input
                                id="new-group-description"
                                value={newGroup.description}
                                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                placeholder="Descrição do grupo"
                                className="bg-slate-950/50 border-slate-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowNewGroupDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateGroup}>
                            Criar Grupo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Group Dialog */}
            <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">Editar Grupo</DialogTitle>
                    </DialogHeader>
                    {editingGroup && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-group-name">Nome do Grupo *</Label>
                                <Input
                                    id="edit-group-name"
                                    value={editingGroup.name}
                                    onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                                    className="bg-slate-950/50 border-slate-800"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-group-description">Descrição</Label>
                                <Input
                                    id="edit-group-description"
                                    value={editingGroup.description || ''}
                                    onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                                    className="bg-slate-950/50 border-slate-800"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingGroup(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateGroup}>
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Queue Dialog */}
            <Dialog open={showNewQueueDialog} onOpenChange={setShowNewQueueDialog}>
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">Nova Fila de Chamados</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Crie uma nova fila de chamados
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="new-queue-client">Cliente *</Label>
                            <Input
                                id="new-queue-client"
                                value={newQueue.client_name}
                                onChange={(e) => setNewQueue({ ...newQueue, client_name: e.target.value })}
                                placeholder="Nome do cliente"
                                className="bg-slate-950/50 border-slate-800"
                                autoFocus
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-queue-name">Nome da Fila *</Label>
                            <Input
                                id="new-queue-name"
                                value={newQueue.name}
                                onChange={(e) => setNewQueue({ ...newQueue, name: e.target.value })}
                                placeholder="Ex: Suporte Técnico"
                                className="bg-slate-950/50 border-slate-800"
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-queue-description">Descrição</Label>
                            <Input
                                id="new-queue-description"
                                value={newQueue.description}
                                onChange={(e) => setNewQueue({ ...newQueue, description: e.target.value })}
                                placeholder="Descrição da fila"
                                className="bg-slate-950/50 border-slate-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowNewQueueDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateQueue}>
                            Criar Fila
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Queue Dialog */}
            <Dialog open={!!editingQueue} onOpenChange={() => setEditingQueue(null)}>
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">Editar Fila</DialogTitle>
                    </DialogHeader>
                    {editingQueue && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-queue-client">Cliente *</Label>
                                <Input
                                    id="edit-queue-client"
                                    value={editingQueue.client_name}
                                    onChange={(e) => setEditingQueue({ ...editingQueue, client_name: e.target.value })}
                                    className="bg-slate-950/50 border-slate-800"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-queue-name">Nome da Fila *</Label>
                                <Input
                                    id="edit-queue-name"
                                    value={editingQueue.name}
                                    onChange={(e) => setEditingQueue({ ...editingQueue, name: e.target.value })}
                                    className="bg-slate-950/50 border-slate-800"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-queue-description">Descrição</Label>
                                <Input
                                    id="edit-queue-description"
                                    value={editingQueue.description || ''}
                                    onChange={(e) => setEditingQueue({ ...editingQueue, description: e.target.value })}
                                    className="bg-slate-950/50 border-slate-800"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingQueue(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateQueue}>
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

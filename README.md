# HelpDesk - Sistema de Gestão de Chamados

Sistema completo de gestão de chamados (helpdesk) desenvolvido com Next.js 14, TypeScript, Supabase e Tailwind CSS.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Autenticação Completa**: Login, registro, recuperação de senha
- **Dashboard**: Visão geral com métricas e estatísticas
- **Gestão de Chamados**: Listagem, criação e gerenciamento de tickets
- **Gestão de Usuários**: CRUD completo de usuários com controle de permissões
- **Gestão de Unidades**: Cadastro de unidades e locais
- **Grupos de Acesso**: Organização de permissões por grupos
- **Filas de Chamados**: Organização de chamados por cliente/fila
- **Sistema de Roles**: Admin, Técnico e Cliente
- **Design Responsivo**: Interface moderna e adaptável

### 🔄 Em Desenvolvimento
- **Relatórios**: Análises e exportação de dados
- **Gráficos**: Visualizações de métricas
- **Notificações**: Sistema de alertas em tempo real

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Conta na Vercel (para deploy)

## 🔧 Instalação Local

1. **Clone o repositório**:
   ```bash
   git clone <seu-repositorio>
   cd helpkdesk
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Execute o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Acesse no navegador**:
   ```
   http://localhost:3000
   ```

## 🚀 Deploy na Vercel

### Opção 1: Deploy via Dashboard da Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub/GitLab/Bitbucket
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em "Deploy"

### Opção 2: Deploy via CLI

1. **Instale a CLI da Vercel**:
   ```bash
   npm install -g vercel
   ```

2. **Faça login na Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy do projeto**:
   ```bash
   vercel
   ```

4. **Configure as variáveis de ambiente**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Deploy para produção**:
   ```bash
   vercel --prod
   ```

## 🗄️ Configuração do Supabase

### Tabelas Necessárias

O projeto requer as seguintes tabelas no Supabase:

1. **profiles** - Perfis de usuários
2. **tickets** - Chamados
3. **ticket_comments** - Comentários dos chamados
4. **units** - Unidades
5. **locations** - Locais/Salas
6. **access_groups** - Grupos de acesso
7. **ticket_queues** - Filas de chamados

### Configurar RLS (Row Level Security)

Certifique-se de configurar as políticas de segurança adequadas no Supabase para cada tabela.

## 📁 Estrutura do Projeto

```
helpkdesk/
├── src/
│   ├── app/                 # Páginas e rotas (App Router)
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── tickets/         # Gestão de chamados
│   │   ├── users/           # Gestão de usuários
│   │   ├── units/           # Gestão de unidades
│   │   └── reports/         # Relatórios (em desenvolvimento)
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes UI (shadcn)
│   │   └── AuthProvider.tsx # Provider de autenticação
│   ├── lib/                # Utilitários e configurações
│   │   └── supabase.ts     # Cliente Supabase
│   └── types/              # Definições TypeScript
├── public/                 # Arquivos estáticos
├── .env.local             # Variáveis de ambiente (não commitado)
├── vercel.json            # Configuração Vercel
└── package.json           # Dependências
```

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Produção (Vercel)
Configure as mesmas variáveis no dashboard da Vercel em:
`Settings > Environment Variables`

## 🎨 Design System

O projeto utiliza um design system consistente com:
- **Cores**: Tema dark com tons de slate e acentos coloridos
- **Tipografia**: Sistema de fontes responsivo
- **Componentes**: shadcn/ui para componentes base
- **Ícones**: Lucide React
- **Animações**: Transições suaves e micro-interações

## 👥 Níveis de Acesso

- **ADMIN**: Acesso total ao sistema
- **TECHNICIAN**: Gerenciamento de chamados e unidades
- **CLIENT**: Visualização e criação de chamados próprios

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linter
```

## 🐛 Troubleshooting

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo

### Erro de build na Vercel
- Verifique se todas as dependências estão no package.json
- Confirme que as variáveis de ambiente estão configuradas

### Problemas de autenticação
- Limpe o cache do navegador
- Verifique as configurações de Auth no Supabase

## 📄 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Suporte

Para suporte, entre em contato com a equipe de desenvolvimento.

---

Desenvolvido com ❤️ usando Next.js e Supabase

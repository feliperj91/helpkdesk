# 🚀 Guia Rápido de Deploy na Vercel

## Pré-requisitos
- Conta no GitHub (ou GitLab/Bitbucket)
- Conta na Vercel (gratuita)
- Projeto Supabase configurado

## Passo a Passo

### 1. Preparar o Repositório

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - HelpDesk System"

# Adicionar repositório remoto (substitua com seu repositório)
git remote add origin https://github.com/seu-usuario/seu-repositorio.git

# Push para o GitHub
git push -u origin main
```

### 2. Deploy na Vercel

#### Opção A: Via Dashboard (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Selecione **"Import Git Repository"**
4. Escolha seu repositório do GitHub
5. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (já configurado)
   - **Output Directory**: `.next` (já configurado)

6. **Adicione as Variáveis de Ambiente**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-chave-anonima
   ```

7. Clique em **"Deploy"**

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy para produção
vercel --prod
```

### 3. Configurar Domínio (Opcional)

1. No dashboard da Vercel, vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

### 4. Configurar Supabase para Produção

1. Acesse seu projeto no Supabase
2. Vá em **Authentication > URL Configuration**
3. Adicione a URL da Vercel em:
   - **Site URL**: `https://seu-app.vercel.app`
   - **Redirect URLs**: `https://seu-app.vercel.app/**`

### 5. Testar o Deploy

1. Acesse a URL fornecida pela Vercel
2. Teste o login
3. Verifique todas as funcionalidades

## ✅ Checklist Pré-Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Código commitado no Git
- [ ] Build local funcionando (`npm run build`)
- [ ] Supabase configurado corretamente
- [ ] RLS (Row Level Security) configurado no Supabase
- [ ] Tabelas criadas no banco de dados

## 🔄 Atualizações Automáticas

Após o deploy inicial, qualquer push para a branch `main` irá:
1. Automaticamente fazer build
2. Executar testes (se configurados)
3. Deploy automático se tudo estiver OK

## 🐛 Troubleshooting

### Build falhou
- Verifique os logs no dashboard da Vercel
- Certifique-se que `npm run build` funciona localmente
- Verifique se todas as dependências estão no `package.json`

### Erro 500 em produção
- Verifique as variáveis de ambiente
- Confira os logs em **Deployments > [seu-deploy] > Logs**

### Problemas de autenticação
- Verifique se a URL da Vercel está nas configurações do Supabase
- Confirme que as variáveis de ambiente estão corretas

## 📊 Monitoramento

A Vercel oferece:
- **Analytics**: Métricas de uso
- **Logs**: Logs em tempo real
- **Performance**: Métricas de performance

Acesse em: `https://vercel.com/seu-usuario/seu-projeto`

## 💰 Custos

- **Vercel**: Plano gratuito (Hobby) suporta:
  - 100 GB de bandwidth
  - Builds ilimitados
  - Domínios personalizados
  
- **Supabase**: Plano gratuito inclui:
  - 500 MB de banco de dados
  - 1 GB de armazenamento
  - 50.000 usuários ativos mensais

## 🔐 Segurança

### Variáveis de Ambiente
- ✅ Nunca commite `.env.local`
- ✅ Use variáveis de ambiente na Vercel
- ✅ Rotacione chaves periodicamente

### Supabase
- ✅ Configure RLS em todas as tabelas
- ✅ Use políticas de segurança adequadas
- ✅ Monitore logs de acesso

## 📞 Suporte

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Pronto!** Seu sistema de helpdesk está no ar! 🎉

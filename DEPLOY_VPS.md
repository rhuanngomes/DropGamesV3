# Publicação da DropGames em VPS

## Pré-requisitos

- Node.js 20 ou superior
- Git
- PM2
- OpenLiteSpeed, Nginx ou o proxy reverso do CloudPanel
- domínio apontando para o IP do VPS

## Instalação

```bash
git clone URL_DO_REPOSITORIO dropgames
cd dropgames
npm ci
cp .env.production.example .env
nano .env
npm run build
npm run start
```

Confirme antes de continuar:

```bash
curl http://127.0.0.1:3000/api/health
```

## Manter a aplicação ativa com PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

Execute o comando adicional exibido por `pm2 startup`.

Após novas versões:

```bash
git pull
npm ci
npm run build
pm2 reload dropgames --update-env
```

## Proxy reverso

Configure o domínio para encaminhar HTTP ao processo local:

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Depois, emita um certificado Let's Encrypt no painel do VPS e force HTTPS. Não exponha a porta 3000 publicamente; libere apenas 80, 443 e a porta SSH no firewall.

## DNS na Hostinger

- registro `A` de `@` apontando para o IPv4 do VPS
- registro `A` de `www` apontando para o mesmo IPv4, ou `CNAME` de `www` para o domínio raiz
- remova registros `A`/`AAAA` conflitantes

## Checklist

- `https://seudominio.com.br/api/health` responde com `status: ok`
- a conexão usa HTTPS válido
- login, logout e cadastro funcionam
- login Steam retorna ao domínio HTTPS
- perfil, biblioteca e avatar Steam carregam
- IA responde sem revelar a chave no navegador
- Epic, Steam e comparador carregam
- uma URL interna aberta diretamente não retorna 404
- `.env` e `data/dropgames-auth.json` não estão no Git
- existe backup periódico do diretório `data`

## Limites da persistência atual

O armazenamento em arquivo é apropriado para um único VPS e uma única instância PM2. Antes de executar múltiplas instâncias ou escalar horizontalmente, migre usuários, sessões e métricas para PostgreSQL ou outro banco transacional compartilhado.

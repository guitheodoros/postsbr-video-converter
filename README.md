# PostSBR — servidor de conversão de vídeo

Servidor pequeno em Node/Express que recebe um arquivo `.webm` (gravado no navegador) e devolve um `.mp4` pronto para o Instagram (H.264, yuv420p, 30fps), usando o ffmpeg nativo (via `ffmpeg-static`, um binário pronto — não precisa instalar ffmpeg no servidor).

Sem esse servidor, o app converte o vídeo no próprio navegador (mais lento, 1 a 4 minutos). Com o servidor, a conversão leva menos de 1 segundo.

## Rodar localmente

```bash
cd server
npm install
npm start
```

O servidor sobe em `http://localhost:3001`. Teste com:

```bash
curl http://localhost:3001/
```

Deve responder `{"ok":true,"message":"PostSBR video converter online"}`.

## Subir no Railway (recomendado)

1. Crie um repositório no GitHub só com a pasta `server/` (ou o projeto inteiro, o Railway detecta a pasta certa se você apontar o "root directory").
2. Em [railway.app](https://railway.app), clique em "New Project" → "Deploy from GitHub repo" e escolha o repositório.
3. Se o repositório tiver mais coisas além do servidor, em Settings → "Root Directory" aponte para `server`.
4. O Railway detecta o `package.json` e roda `npm install && npm start` sozinho. Não precisa configurar mais nada.
5. Quando terminar o deploy, em Settings → Networking, gere um domínio público (ex.: `postsbr-converter.up.railway.app`).

## Subir no Render (alternativa)

1. Crie um repositório no GitHub com a pasta `server/`.
2. Em [render.com](https://render.com), "New" → "Web Service", conecte o repositório.
3. Root Directory: `server`. Build Command: `npm install`. Start Command: `npm start`.
4. Plano gratuito funciona, mas "dorme" depois de um tempo sem uso — o primeiro request depois disso demora alguns segundos pra acordar.

## Configurar o app com o servidor

Depois de publicado, copie a URL (ex.: `https://postsbr-converter.up.railway.app`) e cole no campo **"Servidor de conversão"** que aparece no app quando você escolhe fundo em vídeo. Fica salvo no navegador — não precisa colar de novo toda vez.

Se deixar esse campo vazio, o app volta a converter no navegador automaticamente (mais lento, mas sem depender de nada externo).

## Nota sobre o `ffmpeg-static`

Esse pacote baixa o binário do ffmpeg via um script de pós-instalação (`postinstall`). Em ambientes com políticas de segurança que bloqueiam scripts de instalação, rode manualmente depois do `npm install`:

```bash
node node_modules/ffmpeg-static/install.js
```

Na Railway e no Render isso não costuma ser um problema — o `postinstall` roda normalmente durante o build.

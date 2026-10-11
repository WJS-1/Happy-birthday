// 无额外依赖：可部署到 Vercel，也可在普通 Node.js 服务器运行。
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { handleBirthdayAPI } from './lib/birthday-server.mjs';
const publicDir = new URL('./public/', import.meta.url);
const routes = new Map([
  ['/', ['index.html','text/html; charset=utf-8']],
  ['/ai', ['index.html','text/html; charset=utf-8']],
  ['/ai/', ['index.html','text/html; charset=utf-8']],
  ['/jiang-mizhi-birthday.html', ['index.html','text/html; charset=utf-8']],
  ['/ai-background.jpg', ['ai-background.jpg','image/jpeg']],
  ['/birthday-illustration.jpg', ['birthday-illustration.jpg','image/jpeg']]
]);
export const server = createServer(async (incoming, outgoing) => {
  try {
    const protocol = process.env.VERCEL || process.env.PUBLIC_HTTPS === '1' ? 'https' : 'http';
    const url = new URL(incoming.url || '/', `${protocol}://${incoming.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      const headers = new Headers();
      for (const [key,value] of Object.entries(incoming.headers)) if(value) headers.set(key,Array.isArray(value)?value.join(','):value);
      // 不信任客户端自己填写的 Cloudflare 地址头。
      headers.set('CF-Connecting-IP', process.env.VERCEL ? String(incoming.headers['x-forwarded-for'] || 'anonymous').split(',')[0].trim() : incoming.socket.remoteAddress || 'anonymous');
      const options = {method:incoming.method,headers};
      if(!['GET','HEAD'].includes(incoming.method)) {options.body=Readable.toWeb(incoming);options.duplex='half';}
      const result=await handleBirthdayAPI(new Request(url,options),process.env);
      if(!result){outgoing.writeHead(404);outgoing.end();return;}
      outgoing.writeHead(result.status,Object.fromEntries(result.headers));
      outgoing.end(Buffer.from(await result.arrayBuffer()));return;
    }
    const asset=routes.get(url.pathname);
    if(!asset){outgoing.writeHead(404);outgoing.end('Not found');return;}
    if(!['GET','HEAD'].includes(incoming.method)){outgoing.writeHead(405);outgoing.end();return;}
    const data=await readFile(new URL(asset[0],publicDir));
    outgoing.writeHead(200,{'Content-Type':asset[1],'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':asset[0].endsWith('.html')?'no-store':'public, max-age=3600'});
    outgoing.end(incoming.method==='HEAD'?undefined:data);
  }catch{outgoing.writeHead(500,{'Content-Type':'application/json'});outgoing.end(JSON.stringify({error:'服务暂时不可用，请稍后再试。'}));}
});
server.listen(Number(process.env.PORT || 3000),process.env.HOST || '127.0.0.1',()=>console.log(`Birthday server ready on port ${server.address().port}`));

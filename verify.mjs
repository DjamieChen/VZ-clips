import {readFile,access} from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile('dist/index.html','utf8');
const refs=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(x=>x[1]).filter(x=>!x.includes(':'));
for(const ref of new Set(refs))await access('dist/'+ref);
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
for(const target of [...html.matchAll(/href="#([^"]+)"/g)].map(x=>x[1]))if(!ids.has(target))throw Error('Missing navigation destination '+target);
const context={window:{}};vm.runInNewContext(await readFile('dist/config.js','utf8'),context);const config=context.window.VZ_CONFIG;
if(new URL(config.setmoreUrl).hostname!=='vzclipz.setmore.com')throw Error('Unexpected booking destination');
if(config.calendlyUrl){const url=new URL(config.calendlyUrl);if(url.protocol!=='https:'||url.hostname!=='calendly.com'||url.pathname==='/')throw Error('Provide an HTTPS Calendly event URL');}
for(const reel of [config.hero,...config.reels]){if(!/^[\w-]+$/.test(reel.id))throw Error('Invalid reel identifier');await access('dist/'+reel.poster);}
for(const look of config.gallery){if(!/^[\w-]+$/.test(look.source))throw Error('Invalid gallery source');await access('dist/'+look.image);}
console.log('Verified local assets, navigation, Instagram media sources, and booking configuration.');

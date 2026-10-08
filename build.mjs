import {readFile,writeFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const json=async name=>JSON.parse(await read(`sections/${name}.json`));
let page=await read('page.html');
for(const match of [...page.matchAll(/<!-- include: ([\w-]+) -->/g)]){
  page=page.replace(match[0],await read(`sections/${match[1]}.html`));
}
if(page.includes('<!-- include:'))throw Error('Unresolved section include');
const config={...await json('booking'),hero:await json('hero'),reels:await json('craft'),gallery:await json('cuts'),reviews:await json('reviews')};
await writeFile(new URL('dist/index.html',import.meta.url),page);
await writeFile(new URL('dist/config.js',import.meta.url),'// Generated from sections/*.json. Edit those files to update the website.\nwindow.VZ_CONFIG = '+JSON.stringify(config,null,2)+';\n');
await writeFile(new URL('dist/.nojekyll',import.meta.url),'');
console.log('Built website from editable section files.');

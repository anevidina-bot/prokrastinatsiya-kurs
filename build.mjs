import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const f of ['index.html','style.css','app.js','content.js','state.js','opening.js','opening-content.js','opening.css']) await copyFile(f,`dist/${f}`);
await cp('assets','dist/assets',{recursive:true});
await copyFile('index.html','dist/404.html');
console.log('Готово: dist/. Все пути относительные, зависимости отсутствуют.');


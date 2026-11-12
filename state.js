import {locations,example} from './content.js';
export const KEY='procrastination-quest-v1';
export const fresh=()=>({version:1,view:'home',loc:0,scene:0,done:[],answers:{},plan:{},useExample:false,reduced:false});
export function normalize(raw){
 const s=fresh(); if(!raw||raw.version!==1)return s;
 s.done=[...new Set((Array.isArray(raw.done)?raw.done:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<5))].sort();
 // Only consecutive completed locations can unlock the route.
 s.done=s.done.filter((n,i)=>n===i);
 s.loc=Number.isInteger(raw.loc)?Math.max(0,Math.min(raw.loc,s.done.length,4)):0;
 s.scene=Number.isInteger(raw.scene)?Math.max(0,Math.min(raw.scene,locations[s.loc].scenes.length-1)):0;
 s.view=['home','intro','map','scene','reward','ending'].includes(raw.view)?raw.view:'home';
 if(s.view==='ending'&&s.done.length<5)s.view='map';
 if(s.view==='reward'&&!s.done.includes(s.loc))s.view='map';
 if(raw.answers&&typeof raw.answers==='object')for(const [k,v]of Object.entries(raw.answers)){const [l,n]=k.split(':').map(Number);if(locations[l]?.scenes[n]?.options?.[v]?.ok)s.answers[k]=v;}
 if(raw.plan&&typeof raw.plan==='object')for(const k of Object.keys(example))if(typeof raw.plan[k]==='string')s.plan[k]=raw.plan[k].slice(0,1000);
 s.useExample=raw.useExample===true;s.reduced=raw.reduced===true;return s;
}
export function read(storage){try{return {state:normalize(JSON.parse(storage.getItem(KEY))),available:true};}catch{return {state:fresh(),available:false};}}
export function save(storage,state){try{storage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}}
export function canComplete(s,l){return locations[l].scenes.every((x,i)=>x.type!=='choice'||x.options[s.answers[`${l}:${i}`]]?.ok);}
export function complete(s,l){if(!canComplete(s,l)||l>s.done.length)return false;if(!s.done.includes(l))s.done.push(l);return true;}
export const labels={task:'Задача',why:'Зачем мне это',result:'Достаточный результат',step:'Первый шаг',start:'Когда или после чего начну',obstacle:'Вероятная помеха',response:'Если она появится, я'};
export function planText(s){const p=s.useExample?example:s.plan;return `${s.useExample?'Пример плана Андрея':'Мой план начала'}\n\n`+Object.entries(labels).map(([k,label])=>`${label}: ${p[k]?.trim()||'Пока не указано'}`).join('\n\n');}


import { locations } from './content.js';
import {cover,introduction,route,forestDialogue,anatomyParts,forestGuide,timeDragons} from './opening-content.js';
// Текущий этап согласования: обложка → введение → карта.
// Предыдущий сценарий и его сохранения не удаляются и не загружаются этим входом.
const app=document.querySelector('#app');let view='cover',step=0,seen=false;
const button=(text,action,kind='primary',attrs='')=>`<button class="${kind}" data-action="${action}" ${attrs}>${text}</button>`;
// Keep Russian prepositions and short conjunctions with the word they introduce.
function typeset(text) {
  const leadingWord = /(?<![\p{L}\p{N}-])(без|в|во|для|до|за|из|из-за|из-под|к|ко|между|на|над|надо|о|об|обо|от|ото|по|под|подо|перед|передо|при|про|с|со|ради|сквозь|у|через|и|а|но|как|что) +(?=\S)/giu;
  return text.replace(leadingWord, '$1\u00a0');
}
function navigate(v){view=v;render();window.scrollTo(0,0);(document.querySelector('h1') || document.querySelector('main')).focus();}
function shell(){return `<header><a href="#" class="brand" data-action="cover"><span class="brand-mark">П</span><span>ПРОКРАСТИНАЦИЯ</span></a><nav aria-label="Разделы курса">${view!=='cover'?button('Введение','intro','quiet'):''}${seen?button('Карта курса','map','quiet'):''}</nav></header>`;}
let forestLine = 0;
let guideStep = 0;
let forestComplete = false;
let showCaveUnlock = false;
let showMarshUnlock = false;
let marshStep = 0;
let marshCaseAnswer = null;
let marshFound = [false, false];
let marshFinding = false;
let marshComplete = false;
let mountainStep = 0, showMountainUnlock = false;
let mountainComplete = false;
let showFinalUnlock = false, battleStep = 0, battleAnswer = null;
let battleState = {completed:[], selections:[], matches:[null,null,null], order:[2,0,3,1]};
let battleFeedback = '', battlePicked = null;
let stressStage = 0, stressSelected = -1;
let stressPractice = {assigned:[null,null,null], spots:[], workspaceAnswer:null, plan:[], sortDone:false, planDone:false}, stressPicked = null, stressFeedback = '';
let perfectionChoices = [];
let perfectionCase = 0, perfectionCaseAnswer = null;
let falseGoalAnswer = null;
let marshAnswers = [], perfectionAnswers = [];
try { forestComplete = localStorage.getItem('forest-complete') === 'true'; } catch {}
function render(){app.innerHTML=shell()+`<main id="main" tabindex="-1">${view==='cover'?coverView():view==='intro'?introView():view==='forest'?forestView():view==='anatomy'?anatomyView():view==='forest-practice'?practiceView():view==='forest-guide'?guideView():view==='cave'?caveView():view==='cave-search'?caveSearchView():view==='marsh'?marshView():view==='mountain'?mountainView():view==='battle'?battleView():mapView()}</main><dialog id="location-dialog" aria-labelledby="location-title"></dialog>`;prepareConsequenceCards();}
function prepareConsequenceCards() {
  document.querySelectorAll('.marsh-consequences article').forEach(article => {
    const icon = article.querySelector('svg');
    const title = article.querySelector('h2');
    const description = article.querySelector('p');
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'consequence-card';
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `${title.textContent}: открыть описание`);
    card.innerHTML = `<span class="consequence-inner"><span class="consequence-face consequence-front">${icon.outerHTML}<span class="consequence-title">${title.innerHTML}</span><span class="consequence-hint">Нажми, чтобы узнать</span></span><span class="consequence-face consequence-back" aria-hidden="true"><span>${description.innerHTML}</span><span class="consequence-hint">Нажми, чтобы вернуться</span></span></span>`;
    card.addEventListener('click', () => {
      const open = card.getAttribute('aria-pressed') !== 'true';
      card.classList.toggle('is-flipped', open);
      card.setAttribute('aria-pressed', String(open));
      card.setAttribute('aria-label', open ? `${title.textContent}: ${description.textContent}. Нажми, чтобы вернуться` : `${title.textContent}: открыть описание`);
      card.querySelector('.consequence-front').setAttribute('aria-hidden', String(open));
      card.querySelector('.consequence-back').setAttribute('aria-hidden', String(!open));
    });
    article.replaceWith(card);
  });
}
function coverView(){return `<section class="opening-cover"><div class="cover-copy"><p class="eyebrow">${cover.type}</p><h1 tabindex="-1">${cover.title}</h1><p class="cover-description">${typeset(cover.description)}</p>${button('НАЧАТЬ КУРС →','intro')}<div class="cover-rule" aria-hidden="true"></div></div><div class="original-cover-art"><div class="dragon-halo" aria-hidden="true"></div><img class="cover-clock" src="./assets/original-clock.svg" alt="Часы"><img class="cover-dragon" src="./assets/original-dragon.svg" alt="Синий дракон Прокрастинации с обложки исходного курса"></div></section>`;}
function introView(){const x=introduction[step];return `<section class="story story-${x.kind}" aria-label="История Андрея"><div class="story-background" aria-hidden="true"></div><p class="eyebrow story-label">ВВЕДЕНИЕ <span class="story-counter">${String(step+1).padStart(2,'0')} / 04</span></p><div class="story-copy">${x.kind==='dream'?`<div class="thought-cloud"><svg class="cloud-shape" viewBox="0 0 600 320" preserveAspectRatio="none" aria-hidden="true"><path d="M91 259C35 261 8 219 30 181C-7 151 10 100 60 88C52 40 116 13 160 41C185 0 250 3 281 30C326 0 395 13 409 47C463 18 521 46 520 87C577 82 610 131 576 168C614 209 570 262 517 254C494 302 430 307 389 280C350 319 280 311 252 282C207 311 142 301 128 269C115 271 99 267 91 259Z"/></svg><h1 class="dream-question" tabindex="-1">${typeset(x.text)}</h1><span class="thought-dot dot-one" aria-hidden="true"></span><span class="thought-dot dot-two" aria-hidden="true"></span></div>`:`<p class="story-lead">${typeset(x.text)}</p>${x.paragraph?`<p class="story-paragraph">${typeset(x.paragraph)}</p>`:''}${x.traits?`<ul class="andrey-traits">${x.traits.map((t,i)=>`<li><span aria-hidden="true">0${i+1}</span>${typeset(t)}</li>`).join('')}</ul>`:''}`}</div><div class="story-illustration"><img src="./assets/${x.image}" alt="${x.alt}">${x.kind==='sleep'?'<span class="sleep-trail" aria-hidden="true">z <i>z</i> <b>z</b></span>':''}</div><div class="story-controls"><div class="story-navigation">${button('← Назад','previous','text-button')}${button(step===3?'Карта курса →':'Далее →','next')}</div><div class="story-dots" aria-label="Сцена ${step+1} из 4">${introduction.map((_,i)=>`<span class="${i===step?'active':''}" aria-hidden="true"></span>`).join('')}</div></div></section>`;}
function forestView() {
  const location = route[0];
  if (forestLine === 0) {
    return `<section class="forest-entry">
      <div class="forest-entry-copy">
        <h1 tabindex="-1">${location.name}</h1>
        <p>${typeset(location.description)}</p>
      </div>
      <div class="forest-actions">
        ${button('← К карте','map','text-button')}
        ${button('Начать →','forest-next')}
      </div>
    </section>`;
  }

  const line = forestDialogue[forestLine - 1];
  if (forestLine === forestDialogue.length) {
    const [first, last] = line.text.split(' Причина тому');
    return `<section class="forest-dialogue forest-explanation">
      <p class="eyebrow forest-label">ЛЕС МУДРОСТИ <span class="story-counter">0${forestLine} / 0${forestDialogue.length}</span></p>
      <div class="explanation-scene">
        <div class="explanation-bubble">
          <h1 tabindex="-1">${typeset(first)}</h1>
          <p>${typeset('Причина тому' + last)}</p>
        </div>
        <img class="mentor-book" src="./assets/mentor-book.svg" alt="Наставник с книгой">
      </div>
      <div class="forest-actions">
        ${button('← Назад','forest-back','text-button')}
        ${button('Далее →','anatomy')}
      </div>
    </section>`;
  }

  const mentorSpeaking = line.speaker === 'Наставник';
  const last = forestLine === forestDialogue.length;
  return `<section class="forest-dialogue">
    <p class="eyebrow forest-label">ЛЕС МУДРОСТИ <span class="story-counter">0${forestLine} / 0${forestDialogue.length}</span></p>
    <div class="forest-clearing">
      <div class="andrey-frame">
        <img src="./assets/${line.andreyPose ?? 'forest-andrey-standing.svg'}" alt="Андрей">
      </div>
      <div class="speech ${mentorSpeaking ? 'from-mentor' : 'from-andrey'}">
        <span class="speaker">${line.speaker}</span>
        <h1 tabindex="-1">${typeset(line.text)}</h1>
      </div>
      <img class="forest-actor mentor" src="./assets/${line.mentorPose ?? 'original-mentor.svg'}" alt="Наставник в остроконечной шляпе с посохом">
    </div>
    <div class="forest-actions">
      ${button('← Назад','forest-back','text-button')}
      ${button('Далее →', last ? 'anatomy' : 'forest-next')}
    </div>
  </section>`;
}
const readParts = new Set();
let selectedPart = null;

function anatomyView() {
  const part = anatomyParts[selectedPart];
  const markers = anatomyParts.map(({label}, index) => button(
    readParts.has(index) ? '✓' : '+',
    'read-part',
    'anatomy-marker',
    `data-index="${index}" aria-label="${label}" aria-pressed="${index === selectedPart}"`
  )).join('');
  return `<section class="anatomy">
    <p class="eyebrow forest-label">ЛЕС МУДРОСТИ</p>
    <div class="anatomy-scroll">
      <h1 tabindex="-1">Анатомия прокрастинации</h1>
      <div class="anatomy-inside">
        <div class="anatomy-reading" aria-live="polite">
          ${part ? `<h2>${part.label}</h2><p>${typeset(part.body)}</p>`
                 : `<p>${typeset('Нажимай на плюсы, чтобы узнать, из чего состоит прокрастинация!')}</p>`}
        </div>
        <div class="anatomy-diagram" role="group" aria-label="Пять составляющих прокрастинации">
          <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 17 83 42 70 80 30 80 17 42Z"/></svg>
          ${markers}
        </div>
      </div>
      <img class="scroll-dragon" src="./assets/original-dragon.svg" alt="">
      <p class="anatomy-count">Открыто ${readParts.size} из ${anatomyParts.length}</p>
    </div>
    <div class="forest-actions">
      ${button('← Назад','return-dialogue','text-button')}
       ${button('Потренироваться →','start-practice')}
    </div>
  </section>`;
}

let practiceStep = 0;
let practiceAnswer = null;
let forestAnswers = [], caveAnswers = [];

function practiceView() {
  const question = locations[0].scenes[practiceStep];
  const selected = practiceAnswer === null ? null : question.options[practiceAnswer];
  return `<section class="forest-practice">
    <p class="eyebrow forest-label">ЛЕС МУДРОСТИ <span class="story-counter">СИТУАЦИЯ ${practiceStep + 1} / 3</span></p>
    <div class="practice-content">
      <h1 tabindex="-1">${question.title}</h1>
      <p class="practice-story">${typeset(question.text)}</p>
      <div class="practice-options">
        ${question.options.map((option, index) => button(
          typeset(option.label), 'practice-answer', 'practice-option',
          `data-index="${index}" ${selected?.ok ? 'disabled' : ''}`
        )).join('')}
      </div>
      <div class="practice-feedback" aria-live="polite" tabindex="-1">
        ${selected ? `<p>${typeset(selected.feedback)}</p>${selected.ok ? button(practiceStep === 2 ? 'Далее →' : 'Следующая ситуация →', practiceStep === 2 ? 'start-guide' : 'practice-next') : '<p>Попробуй выбрать другой вариант.</p>'}` : ''}
        ${forestComplete && !selected?.ok ? `<p>Это задание уже пройдено.</p>${button(practiceStep === 2 ? 'Далее →' : 'Следующая ситуация →', practiceStep === 2 ? 'start-guide' : 'practice-next')}` : ''}
      </div>
    </div>
    <div class="forest-actions">${button('← К объяснению','anatomy-back','text-button')}</div>
  </section>`;
}

const equipmentPaths = [
  'M20 10 10 16 15 30 20 27 20 49 44 49 44 27 49 30 54 16 44 10 39 16 25 16Z',
  'M14 10 32 5 50 10 48 35Q44 48 32 57Q20 48 16 35Z',
  'M29 5 35 5 38 35 49 38 47 43 36 41 36 55 28 55 28 41 17 43 15 38 26 35Z'
];

function equipmentIcon(index, className = '') {
  return `<svg class="${className}" viewBox="0 0 64 64" aria-hidden="true"><path d="${equipmentPaths[index]}" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/></svg>`;
}

function guideView() {
  if (guideStep === forestGuide.length - 1) {
    return `<section class="forest-dialogue">
      <p class="eyebrow forest-label">ЛЕС МУДРОСТИ <span class="story-counter">05 / 05</span></p>
      <div class="forest-clearing">
        <div class="andrey-frame"><img src="./assets/forest-andrey-standing.svg" alt="Андрей"></div>
        <div class="speech from-mentor">
          <span class="speaker">Наставник</span>
          <h1 tabindex="-1">${typeset(forestGuide[guideStep])}</h1>
        </div>
        <img class="forest-actor mentor" src="./assets/original-mentor.svg" alt="Наставник с посохом">
      </div>
      <div class="forest-actions">
        ${button('← Назад','guide-back','text-button')}
        ${button('К карте →','guide-next')}
      </div>
    </section>`;
  }
  return `<section class="forest-dialogue forest-explanation">
    <p class="eyebrow forest-label">ЛЕС МУДРОСТИ <span class="story-counter">${String(guideStep + 1).padStart(2, '0')} / 05</span></p>
    <div class="explanation-scene">
      <div class="explanation-bubble">
        ${guideStep === 0
          ? `<h1 tabindex="-1">${typeset('Чтобы победить дракона, необходимо пройти три испытания:')}</h1>
             <ul class="guide-list">
               <li>${typeset('Пещеру поглотителей времени.')}</li>
               <li>${typeset('Топи потерянного времени.')}</li>
               <li>${typeset('Гору стресса.')}</li>
             </ul>`
          : `<h1 tabindex="-1">${typeset(forestGuide[guideStep])}</h1>`}
      </div>
      <div class="guide-portrait">
        <img class="mentor-book" src="./assets/mentor-book.svg" alt="Наставник с книгой">
        ${guideStep >= 1 && guideStep <= 3 ? `<div class="guide-equipment" role="img" aria-label="${['Броня','Щит Тайм-менеджмент','Меч Стресс-менеджмент'][guideStep - 1]}">${equipmentIcon(guideStep - 1)}</div>` : ''}
      </div>
    </div>
    <div class="forest-actions">
      ${button('← Назад','guide-back','text-button')}
      ${button(guideStep === forestGuide.length - 1 ? 'К карте →' : 'Далее →','guide-next')}
    </div>
  </section>`;
}

let caveComplete = false;
try { caveComplete = localStorage.getItem('cave-complete') === 'true'; } catch {}
let caveStep = -3;
let caveAnswer = null;


const discoveredDragons = new Set();


const hidingPlaces = [
  {name:'Закрытый сундук',kind:'crate',dragon:0},
  {name:'Статуэтка',kind:'rocks',dragon:1},
  {name:'Левый меч',kind:'barrel',dragon:2},
  {name:'Камень справа',kind:'crystal',dragon:3},
  {name:'Чаша',kind:'vase',dragon:4},
  {name:'Открытый сундук',kind:'chest'},
  {name:'Факел',kind:'lantern'},
  {name:'Череп',kind:'bag'}
];
const inspectedPlaces = new Set();
let caveCongratulationsSeen = false;

function caveSearchView() {
  return `<section class="dragon-cave cave-hunt">
    <p class="eyebrow forest-label">ПЕЩЕРА ПОГЛОТИТЕЛЕЙ ВРЕМЕНИ</p>
    <div class="cave-hunt-inner">
      <h1 tabindex="-1">Где прячутся поглотители времени?</h1>
      <p>Осмотри предметы в пещере. За некоторыми спрятались дракончики.</p>
      <div class="hiding-places" role="group" aria-label="Предметы в пещере">
        ${hidingPlaces.map((place, i) => {
          const found = place.dragon !== undefined && discoveredDragons.has(place.dragon);
          const examined = inspectedPlaces.has(i);
          return `<button class="hiding-place hide-${place.kind} ${found ? 'dragon-found' : ''}" data-action="inspect-place" data-index="${i}" aria-label="${place.name}${found ? ' — дракон найден' : examined ? ' — осмотрено' : ''}">

            ${found ? '<span class="found-check" aria-hidden="true">✓</span>' : ''}
          </button>`;
        }).join('')}
      </div>
      <div class="dragon-collection" role="group" aria-label="Найденные дракончики">
        ${timeDragons.map((dragon, index) => `<span class="dragon-collection-slot" ${discoveredDragons.has(index) ? `role="img" aria-label="${dragon.name} — найден"` : 'aria-hidden="true"'}>${discoveredDragons.has(index) ? `<img src="./assets/${dragon.image}" alt="">` : ''}</span>`).join('')}
      </div>
      <p class="dragon-count" aria-live="polite">Найдено дракончиков ${discoveredDragons.size} из ${timeDragons.length}</p>
    </div>
    <div class="forest-actions">
      ${button('← Назад','cave-search-back','text-button')}
      ${caveCongratulationsSeen || caveComplete ? button('Потренироваться →','cave-practice') : ''}
    </div>
  </section>`;
}
function caveIllustration(index) {
  const common = 'fill="none" stroke="#edca8b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const scenes = [
    `<rect x="75" y="8" width="90" height="144" rx="14"/><path d="M108 22h24M111 139h18"/><rect x="87" y="34" width="66" height="65" rx="6"/><circle cx="153" cy="37" r="22" fill="#bc5554" stroke="#edca8b"/><text x="153" y="43" fill="#fff" stroke="none" text-anchor="middle" font-family="sans-serif" font-size="14">100+</text><path d="M99 55h42M99 67h35M99 79h40"/>`,
    `<rect x="32" y="16" width="176" height="112" rx="7"/><path d="M18 142h204l-14-14H32z"/><path d="M49 34h62v70H49zM61 48h38M61 59h32M61 70h35M61 81h25"/><rect x="115" y="43" width="79" height="51" rx="8" fill="#294953"/><path d="M126 59h55M126 70h45M126 81h35"/>`,
    `<rect x="25" y="15" width="190" height="115" rx="7"/><path d="M100 130v14M140 130v14M80 146h80"/><rect x="38" y="28" width="52" height="36" rx="4"/><rect x="95" y="28" width="52" height="36" rx="4"/><rect x="152" y="28" width="50" height="36" rx="4"/><circle cx="64" cy="42" r="7"/><circle cx="121" cy="42" r="7"/><circle cx="177" cy="42" r="7"/><path d="M52 59q12-12 24 0M109 59q12-12 24 0M165 59q12-12 24 0M64 76h113"/>`,
    `<path d="M35 124V75M35 112h170M205 95v29M36 94h169v18H36z"/><rect x="43" y="79" width="48" height="15" rx="5"/><path d="M95 83h95q15 0 15 12M141 34h20l-20 22h20M172 18h15l-15 16h15"/>`,
    `<rect x="25" y="15" width="190" height="115" rx="7"/><path d="M100 130v14M140 130v14M80 146h80"/><rect x="40" y="28" width="60" height="20" rx="3"/><rect x="105" y="28" width="60" height="20" rx="3"/><rect x="40" y="53" width="60" height="20" rx="3"/><rect x="105" y="53" width="60" height="20" rx="3"/><rect x="40" y="78" width="60" height="20" rx="3"/><path d="M112 83l4 4 8-9M130 84h31M112 95h48"/>`
  ];
  return scenes[index] ? `<svg class="practice-illustration" viewBox="0 0 240 160" role="img" aria-label="${['Смартфон с более чем ста уведомлениями','Ноутбук с документом и сообщением коллеги','Монитор с видеоконференцией','Кровать и сон','Монитор с пятью приложениями и чек-листом'][index]}" ${common}>${scenes[index]}</svg>` : '';
}

function caveView() {
  const cave = locations[1];
  if (caveStep < 0) {
    return `<section class="cave-page ${caveStep === -2 ? 'cave-cover' : 'cave-conversation'}">
      <p class="eyebrow forest-label">ПЕЩЕРА ПОГЛОТИТЕЛЕЙ ВРЕМЕНИ</p>
      ${caveStep === -2
        ? `<div class="cave-intro"><h1 tabindex="-1">${cave.name}</h1><p class="cave-lead">${typeset('Какие дела воруют нашу жизнь, и что с ними делать')}</p></div>`
        : caveStep === -1
        ? `<div class="cave-character-scene"><div class="thought-cloud cave-thought"><svg class="cloud-shape" viewBox="0 0 600 320" preserveAspectRatio="none" aria-hidden="true"><path d="M91 259C35 261 8 219 30 181C-7 151 10 100 60 88C52 40 116 13 160 41C185 0 250 3 281 30C326 0 395 13 409 47C463 18 521 46 520 87C577 82 610 131 576 168C614 209 570 262 517 254C494 302 430 307 389 280C350 319 280 311 252 282C207 311 142 301 128 269C115 271 99 267 91 259Z"/></svg><h1 class="cave-thought-text" tabindex="-1">${typeset('Это и есть пещера поглотителей времени? Интересно, кто они такие?')}</h1><span class="thought-dot dot-one"></span><span class="thought-dot dot-two"></span></div><img class="cave-andrey" src="./assets/original-andrey.svg" alt="Андрей"></div>`
        : `<div class="explanation-scene cave-mentor-scene"><div class="explanation-bubble"><h1 tabindex="-1">${typeset('Поглотители времени (или хронофаги) — это всё, что мешает нам работать или срывает наши планы.')}</h1><p>${typeset('Одно и то же занятие может быть отдыхом или отвлечением — важно, в какой ситуации оно происходит.')}</p></div><img class="mentor-book" src="./assets/mentor-book.svg" alt="Наставник с книгой"></div>`}

      <div class="forest-actions">${button('← Назад','cave-back','text-button')}${button('Далее →','cave-start')}</div>
    </section>`;
  }
  if (caveStep === cave.scenes.length) {
    return `<section class="cave-page"><p class="eyebrow forest-label">ПЕЩЕРА ПОГЛОТИТЕЛЕЙ ВРЕМЕНИ</p><div class="cave-intro"><h1 tabindex="-1">Броня внимания получена</h1>${equipmentIcon(0, 'cave-reward')}<p class="cave-lead">${typeset('Андрей договорился с коллегами, защитил внимание и оставил место для отдыха. Теперь он может начать проект.')}</p></div><div class="forest-actions">${button('← Назад','cave-back','text-button')}${button('Далее →','cave-armored')}</div></section>`;
  }
  if (caveStep === cave.scenes.length + 1) {
    return `<section class="cave-page armor-scene">
      <p class="eyebrow forest-label">ПЕЩЕРА ПОГЛОТИТЕЛЕЙ ВРЕМЕНИ</p>
      <div class="armor-stage">
        <div class="armor-character">
          <img class="armor-before" src="./assets/andrey-before-armor.png" alt="">
          <img class="armor-after" src="./assets/andrey-armored.svg" alt="Андрей в броне">
        </div>
        <div class="speech from-andrey"><span class="speaker">Андрей</span><h1 tabindex="-1">${typeset('Отлично! Я победил поглотителей времени и получил броню, которая защитит меня от дракона! Теперь я могу отправляться в Топи потерянного времени!')}</h1></div>
      </div>
      <div class="forest-actions">${button('← Назад','cave-back','text-button')}${button('К карте →','map')}</div>
    </section>`;
  }
  const scene = cave.scenes[caveStep];
  const selected = caveAnswer === null ? null : scene.options[caveAnswer];
  return `<section class="cave-page">
    <p class="eyebrow forest-label">ПЕЩЕРА ПОГЛОТИТЕЛЕЙ ВРЕМЕНИ <span class="story-counter">СИТУАЦИЯ ${caveStep + 1} / ${cave.scenes.length}</span></p>
    <div class="practice-content">
      ${caveIllustration(caveStep)}<h1 class="visually-hidden" tabindex="-1">${scene.title}</h1><p class="practice-story">${typeset(scene.text)}</p>
      <div class="practice-options">${scene.options.map((o,i)=>button(typeset(o.label),'cave-answer','practice-option',`data-index="${i}" ${selected?.ok?'disabled':''}`)).join('')}</div>
      <div class="practice-feedback" aria-live="polite" tabindex="-1">${selected ? `<p>${typeset(selected.feedback)}</p>${selected.ok ? `<p>${typeset(scene.effect)}</p>${button(caveStep===cave.scenes.length-1?'Завершить →':'Следующая ситуация →','cave-next')}` : '<p>Попробуй выбрать другой вариант.</p>'}` : ''}${caveComplete && !selected?.ok ? `<p>Это задание уже пройдено.</p>${button(caveStep===cave.scenes.length-1?'Далее →':'Следующая ситуация →','cave-next')}` : ''}</div>
    </div>
    <div class="forest-actions">${button('← Назад','cave-back','text-button')}</div>
  </section>`;
}
function marshView() {
  if (marshStep === 16) {
    const choices = ['Записаться на длительный курс только потому, что друзья считают его престижным, хотя Андрей не хочет работать в этой сфере.', 'Освоить программу, которая нужна Андрею для выбранного им проекта.', 'Проверить, достаточно ли времени и денег на обучение перед записью.'];
    return `<section class="marsh-page marsh-lessons"><p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p><div class="marsh-topics"><p class="eyebrow">ЛОЖНЫЕ ЦЕЛИ</p><h1 tabindex="-1">Помоги Андрею проверить цель</h1><p>Какую цель стоит проверить особенно внимательно?</p><div class="practice-options">${choices.map((choice,i)=>button(typeset(choice),'false-goal-answer','practice-option',`data-index="${i}" ${falseGoalAnswer === 0 ? 'disabled' : ''}`)).join('')}</div>${marshComplete && falseGoalAnswer !== 0 ? `<div class="perfection-feedback">Это задание уже пройдено.</div>${button('Далее →','false-goal-next')}` : ''}${falseGoalAnswer === null ? '' : `<div class="perfection-feedback" role="status">${falseGoalAnswer === 0 ? 'Верно! Здесь цель навязана другими и не соответствует интересам Андрея. Прежде чем тратить ресурсы, стоит спросить себя, зачем ему этот курс.' : 'Попробуй ещё раз: обрати внимание на цель, выбранную из-за чужих ожиданий.'}</div>${falseGoalAnswer === 0 ? button('Далее →','false-goal-next') : ''}`}</div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}</div></section>`;
  }
  if (marshStep === 15) {
    const tips = [
      ['01','Выявляй опасные ситуации','Замечай задачи, в которых ты обычно застреваешь на мелочах или пропускаешь сроки.'],
      ['02','Устанавливай дедлайны','Назначай крайний срок для задачи или её отдельных этапов.'],
      ['03','Определяй приемлемый результат','Заранее решай, какие требования нужно выполнить, чтобы считать работу завершённой.'],
      ['04','Используй минимализм','Убирай второстепенные детали и сосредоточься на главном.']
    ];
    return `<section class="marsh-page marsh-lessons"><p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p><div class="marsh-topics marsh-theory perfection-summary"><p class="eyebrow">ПЕРФЕКЦИОНИЗМ</p><h1 tabindex="-1">Что поможет справиться с перфекционизмом</h1><div class="perfection-summary-grid">${tips.map(([number,title,description]) => `<article><span class="perfection-summary-number">${number}</span><h2>${title}</h2><p>${typeset(description)}</p></article>`).join('')}</div></div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}${button('Далее →','perfection-summary-next')}</div></section>`;
  }
  if (marshStep === 13) {
    const cases = [
      ['Андрей замечает, что каждый раз перед отправкой отчёта часами перепроверяет оформление и пропускает сроки. Скоро ему готовить новый отчёт. Что поможет заранее заметить риск?', 'Вспомнить подобные ситуации и отметить новый отчёт как задачу, где он может снова застрять на мелочах.'],
      ['Андрей бесконечно исправляет слайды. Презентация нужна завтра, но он не назначил время завершения работы. Что поможет остановиться вовремя?', 'Установить срок для подготовки и проверки презентации.'],
      ['Андрей приступает к отчёту и не знает, когда работа будет считаться готовой. Он боится упустить какую-нибудь деталь. С чего лучше начать?', 'Заранее определить требования к готовому отчёту.'],
      ['В презентации уже есть все необходимые данные, но Андрей хочет добавить множество украшений и эффектов. Что поможет сосредоточиться на главном?', 'Убрать второстепенные детали и оставить то, что помогает понять содержание.']
    ];
    const methods = ['Выявить опасные ситуации','Установить дедлайны','Определить минимально приемлемый результат','Использовать минимализм'];
    const correct = perfectionCaseAnswer === perfectionCase;
    return `<section class="marsh-page marsh-lessons"><p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ <span class="story-counter">КЕЙС ${perfectionCase + 1} / 4</span></p><div class="marsh-topics perfection-case"><p class="eyebrow">КАК СПРАВИТЬСЯ С ПЕРФЕКЦИОНИЗМОМ</p><h1 tabindex="-1">Выбери подходящий способ</h1><p class="perfection-scenario">${typeset(cases[perfectionCase][0])}</p><div class="practice-options">${methods.map((method,i)=>button(method,'perfection-case-answer','practice-option',`data-index="${i}" ${correct ? 'disabled' : ''}`)).join('')}</div>${perfectionCaseAnswer === null ? '' : `<div class="perfection-feedback" role="status">${correct ? `Верно! ${typeset(cases[perfectionCase][1])}` : 'Попробуй ещё раз: какой способ лучше всего подходит к этой ситуации?'}</div>${correct ? button(perfectionCase === 3 ? 'Далее →' : 'Следующий кейс →','perfection-case-next') : ''}`}${marshComplete && !correct ? `<div class="perfection-feedback">Этот кейс уже пройден.</div>${button(perfectionCase === 3 ? 'Далее →' : 'Следующий кейс →','perfection-case-next')}` : ''}</div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}</div></section>`;
  }
  if (marshStep === 12 || marshStep === 13) {
    const risks = [
      ['Низкая самооценка','Постоянная самокритика и поиск недостатков мешают замечать свои успехи.'],
      ['Потеря времени','Внимание к незначительным деталям замедляет работу, даже когда они не влияют на результат.'],
      ['Неудовлетворённость','Недовольство результатом превращает работу в источник напряжения и усталости.'],
      ['Тревожность','Ожидание идеальных условий и страх ошибки могут вызывать тревогу и раздражение.'],
      ['Откладывание','Задачу, которую невозможно выполнить идеально, легко отложить на неопределённый срок.'],
      ['Перегрузка','Стремление сделать всё самостоятельно может привести к избытку задач.']
    ];
    const tips = [
      ['Выявите опасные ситуации','Вспомните, когда погоня за идеалом мешала уложиться в срок или заставляла надолго застрять на мелочах. Отметьте похожие предстоящие задачи.'],
      ['Установите дедлайны','Назначьте крайний срок для всей задачи или отдельных этапов, чтобы вовремя перейти к следующему шагу.'],
      ['Определите минимально приемлемый результат','До начала работы решите, какие требования достаточно выполнить, чтобы считать задачу завершённой.'],
      ['Используйте минимализм','Уберите второстепенные детали и сосредоточьтесь на том, ради чего создаётся результат.']
    ];
    const isRisk = marshStep === 12;
    return `<section class="marsh-page marsh-lessons perfection-risks"><p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p><div class="marsh-topics marsh-theory"><p class="eyebrow">ПЕРФЕКЦИОНИЗМ</p><h1 tabindex="-1">Чем опасен перфекционизм</h1><p class="perfection-instruction">Нажми на последствия, чтобы узнать подробнее.</p><div class="perfection-grid">${risks.map(([title, description],i) => `<div class="perfection-detail"><button class="perfection-toggle" type="button" aria-expanded="false" aria-controls="risk-${i}"><span aria-hidden="true">▸</span> ${title}</button><div class="perfection-expand" id="risk-${i}"><div><p>${typeset(description)}</p></div></div></div>`).join('')}</div></div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}${button('Далее →','perfection-next')}</div></section>`;
  }
  if (marshStep === 14) {
    return `<section class="marsh-page marsh-dialogue"><p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p><div class="marsh-dialogue-scene shield-scene"><div class="shield-character"><img class="shield-andrey" src="./assets/andrey-shield-scene.png" alt="Андрей в броне"><img class="shield-reward" src="./assets/time-shield.png" alt="Щит Тайм-менеджмент"></div><div class="speech from-andrey"><h1 tabindex="-1">${typeset('Я прошел Топи потерянного времени и получил щит Тайм-менеджмент! Пришло время подняться на Гору стресса.')}</h1></div></div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}${button('К карте →','map')}</div></section>`;
  }
  if (marshStep === 0) {
    return `<section class="marsh-page">
      <p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p>
      <div class="marsh-copy"><h1 tabindex="-1">Топи потерянного времени</h1>
        <p>${typeset(route[2].description)}</p>
      </div>
      <div class="forest-actions">${button('← К карте','map','text-button')}${button('Начать →','marsh-next')}</div>
    </section>`;
  }
  if (marshStep === 10 || marshStep === 11) { const second = marshStep === 11; return `<section class="marsh-page marsh-search">
    <p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p>
    <div class="marsh-search-scene"><div class="marsh-search-instruction"><h1 tabindex="-1">${second ? 'В Топях прячется ещё один дракончик' : 'Кто прячется в Топях?'}</h1><p>${marshFinding ? 'Дракончик найден!' : 'Отыщи дракончика и нажми на него.'}</p></div>
      ${marshFinding ? '' : `<button class="marsh-hidden-dragon ${second ? 'marsh-hidden-second' : ''}" data-action="marsh-find-dragon" aria-label="Найти дракончика"><img src="./assets/${second ? 'perfectionism-dragon.png' : 'false-goals-dragon.png'}" alt=""></button>`}
    </div><div class="marsh-search-bottom"><div class="dragon-collection" role="group" aria-label="Найденные дракончики">${['false-goals-dragon.png','perfectionism-dragon.png'].map((src, i) => `<span class="dragon-collection-slot" ${marshFound[i] ? `role="img" aria-label="${i ? 'Дракончик перфекционизма' : 'Дракончик ложных целей'} найден"` : 'aria-hidden="true"'}>${marshFound[i] ? `<img class="${marshFinding && Number(second) === i ? 'marsh-collecting' : ''}" src="./assets/${src}" alt="">` : ''}</span>`).join('')}</div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}${!marshFinding && (marshComplete || marshFound[Number(second)]) ? button('Далее →','marsh-search-continue') : ''}</div></div></section>`; }
  if (marshStep === 5 || marshStep === 6) {
    const first = marshStep === 5;
    const options = first
      ? ['Продолжать работу: раз цель предложили другие, она обязательно нужна.', 'Уточнить, кому нужен результат и зачем его делать.', 'Сразу перейти к оформлению презентации.']
      : ['Продолжать менять шрифт, пока он не станет идеальным.', 'Отложить готовую работу и начать заново.', 'Проверить, выполнены ли требования, и завершить работу.'];
    return `<section class="marsh-page marsh-lessons marsh-case"><p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ <span class="story-counter">СИТУАЦИЯ ${first ? '1' : '2'} / 2</span></p>
      <div class="marsh-case-content"><div class="marsh-case-copy"><h1 tabindex="-1">${first ? 'Зачем нужна эта задача?' : 'Когда работа готова?'}</h1>
      <p>${typeset(first ? 'Андрей собирается подготовить подробную презентацию по просьбе знакомого. Но выясняется, что она никому не нужна, а сам Андрей не понимает, зачем тратит на неё время. Что ему сделать?' : 'Андрей подготовил нужную презентацию: все требования выполнены. Но он снова и снова меняет шрифты и цвета, боясь, что работа недостаточно хороша. Как ему поступить?')}</p>
      <div class="practice-options">${options.map((option, i) => button(typeset(option),'marsh-answer','practice-option',`data-index="${i}" ${marshCaseAnswer === (first ? 1 : 2) ? 'disabled' : ''}`)).join('')}</div>
      ${marshCaseAnswer === null ? '' : `<div class="marsh-case-feedback" role="status"><p>${marshCaseAnswer === (first ? 1 : 2) ? (first ? 'Верно! Андрей заметил ложную цель: он тратил время на результат, который никому не был нужен.' : 'Верно! Постоянная полировка уже выполненной работы — проявление перфекционизма.') : 'Попробуй ещё раз: подумай, что поможет Андрею не тратить время зря.'}</p>${marshCaseAnswer === (first ? 1 : 2) ? button(first ? 'Далее →' : 'Узнать о причинах →','marsh-case-next') : ''}</div>`}${marshComplete && marshCaseAnswer !== (first ? 1 : 2) ? `<div class="perfection-feedback">Это задание уже пройдено.</div>${button(first ? 'Далее →' : 'Узнать о причинах →','marsh-case-next')}` : ''}</div>
      <img class="marsh-case-dragon" src="./assets/${first ? 'false-goals-dragon.png' : 'perfectionism-dragon.png'}" alt="Дракончик в Топях"></div>
      <div class="forest-actions">${button('← Назад','marsh-back','text-button')}</div></section>`;
  }
  if (marshStep === 2) return `<section class="marsh-page marsh-lessons">
    <p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p>
    <div class="marsh-topics"><h1 tabindex="-1">Причины потерянного времени</h1><p>Выбери причину, чтобы узнать о ней подробнее.</p><div class="marsh-topic-grid">
      ${button('Ложные цели →','marsh-false-goals','marsh-topic')}
      ${button('Перфекционизм →','marsh-perfectionism','marsh-topic')}
    </div></div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}</div></section>`;
  if (marshStep >= 7 && marshStep <= 9) {
    const content = marshStep === 7
      ? `<h1 tabindex="-1">Виды ложных целей</h1><div class="marsh-theory-grid"><article><h2>Навязанные</h2><p>${typeset('Возникают под давлением других и не соответствуют собственным желаниям. Например, выбрать профессию только потому, что так советуют близкие.')}</p></article><article><h2>Недостижимые</h2><p>${typeset('Для их достижения не хватает ресурсов или результат никому не нужен. Например, пытаться продать услугу, на которую нет спроса.')}</p></article><article><h2>Ошибочные</h2><p>${typeset('Основаны на неверном представлении о результате. Например, стремиться стать руководителем, не представляя ответственности этой должности.')}</p></article><article><h2>Устаревшие</h2><p>${typeset('Потеряли актуальность, но человек продолжает следовать им по привычке. Например, искать работу по специальности, хотя условия на рынке изменились.')}</p></article></div>`
      : marshStep === 8
      ? `<h1 tabindex="-1">Чем опасны ложные цели</h1><div class="marsh-theory-grid marsh-consequences"><article><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M25 5c2 10-8 11-7 20-3-2-5-5-5-8-8 14-3 25 11 25s19-12 11-24c0 6-3 8-5 9 1-9-1-15-5-22Z"/><path d="M24 34v3"/></svg><h2>Потеря мотивации</h2><p>${typeset('Погоня за ненужным результатом может вызвать разочарование, обиду и отчаяние.')}</p></article><article><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="14" width="34" height="21" rx="3"/><path d="M39 20h4v9h-4M11 20v9m6-9v9"/></svg><h2>Расход ресурсов</h2><p>${typeset('Мы тратим силы, деньги и здоровье на то, что в итоге нам не нужно, и упускаем другие возможности.')}</p></article><article><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18"/><path d="M24 13v12l8 5"/></svg><h2>Потеря времени</h2><p>${typeset('Время, потраченное на ложную цель, можно было посвятить тому, что действительно важно.')}</p></article></div>`
      : `<h1 tabindex="-1">Как отличить ложную цель</h1><p class="marsh-definition">${typeset('Чтобы проверить цель, попробуй определить свои настоящие мотивы и ответить на вопросы:')}</p><ul class="marsh-questions"><li>Почему я этого хочу? Зачем мне это нужно?</li><li>${typeset('Это моя цель или я стремлюсь к ней под влиянием других?')}</li><li>${typeset('Соответствует ли она моим ценностям и нынешним обстоятельствам?')}</li><li>${typeset('Хватит ли мне времени, сил и других ресурсов?')}</li><li>${typeset('Представляю ли я результат и хочу ли тех изменений, которые он принесёт?')}</li></ul>`;
    return `<section class="marsh-page marsh-lessons"><p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p><div class="marsh-topics marsh-theory"><p class="eyebrow">ЛОЖНЫЕ ЦЕЛИ</p>${content}</div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}${button(marshStep === 9 ? 'Далее →' : 'Далее →','marsh-theory-next')}</div></section>`;
  }
  if (marshStep === 3 || marshStep === 4) {
    const falseGoals = marshStep === 3;
    return `<section class="marsh-page marsh-lessons"><p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p><div class="marsh-topics"><p class="eyebrow">ПРИЧИНЫ ПОТЕРЯННОГО ВРЕМЕНИ</p><h1 tabindex="-1">${falseGoals ? 'Ложные цели' : 'Перфекционизм'}</h1><p class="marsh-definition">${typeset(falseGoals ? 'Ложными называют цели, которые не приносят нам удовлетворения, не соответствуют нашим ожиданиям или не стоят затраченного на них времени.' : 'Перфекционизм — это чрезмерное и зачастую ненужное стремление к совершенству. Перфекционисты пытаются все делать «идеально» и проявляют повышенное внимание к мелочам.')}</p></div><div class="forest-actions">${button('← Назад','marsh-back','text-button')}${button('Далее →',falseGoals ? 'marsh-theory-next' : 'perfection-next')}</div></section>`;
  }
  return `<section class="marsh-page marsh-dialogue">
    <p class="eyebrow forest-label">ТОПИ ПОТЕРЯННОГО ВРЕМЕНИ</p>
    <div class="marsh-dialogue-scene">
      <img class="marsh-andrey" src="./assets/andrey-marsh.png" alt="Андрей в броне">
      <div class="speech from-andrey"><h1 tabindex="-1">${typeset('Какое мрачное место! Но по каким причинам люди теряют так много времени?')}</h1></div>
    </div>
    <div class="forest-actions">${button('← Назад','marsh-back','text-button')}${button('Далее →','marsh-next')}</div>
  </section>`;
}

function mountainView() {
  if (mountainStep === 12) return `<section class="mountain-page mountain-story sword-scene"><p class="eyebrow forest-label">ГОРА СТРЕССА</p><div class="sword-scene-stage"><div class="sword-hero"><img class="sword-hero-before" src="./assets/andrey-before-sword-vector.svg" alt=""><img class="sword-hero-after" src="./assets/andrey-with-sword-vector.svg" alt="Андрей в броне с мечом Стресс-менеджмент"></div><div class="speech from-andrey"><span class="speaker">Андрей</span><h1 tabindex="-1">${typeset('Мне удалось преодолеть стресс. Меч Стресс-менеджмент мой! Я могу отправляться на битву с Драконом!')}</h1></div></div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}${button('К карте →','map')}</div></section>`;
  if (mountainStep === 9) {
    const cards = ['Андрей несколько ночей плохо спит.','Перед встречей Андрей волнуется и никак не может расслабиться.','Уведомления постоянно отвлекают Андрея от работы.'];
    const zones = ['Симптомы','Напряжение','Причины'];
    const sortCard = (c,i) => `<button type="button" draggable="true" class="stress-sort-card ${stressPicked === i ? 'is-picked' : ''}" data-action="stress-pick" data-index="${i}" aria-pressed="${stressPicked === i}">${typeset(c)}</button>`;
    const done = stressPractice.assigned.every((v,i)=>v===i);
    return `<section class="mountain-page mountain-learning"><p class="eyebrow forest-label">ГОРА СТРЕССА <span class="story-counter">ПРАКТИКА 1 / 3</span></p><div class="mountain-learning-content stress-practice"><p class="eyebrow">ТРИ УРОВНЯ</p><h1 tabindex="-1">Что происходит с Андреем?</h1><p>Перетащи каждую карточку к подходящему уровню или выбери карточку и нажми на уровень.</p><div class="stress-sort-cards">${cards.map((c,i)=>stressPractice.assigned[i] === null ? sortCard(c,i) : '').join('') || '<p class="stress-sort-empty">Все карточки распределены. Их можно переместить в другое поле.</p>'}</div><div class="stress-sort-zones">${zones.map((z,i)=>`<div class="stress-sort-zone" data-zone="${i}"><button type="button" class="stress-zone-label" data-action="stress-assign" data-zone="${i}"><strong>${z}</strong><span>${stressPicked !== null ? 'Поместить выбранную карточку сюда' : 'Перетащи сюда карточку'}</span></button><div class="stress-zone-cards">${cards.map((c,j)=>stressPractice.assigned[j] === i ? sortCard(c,j) : '').join('')}</div></div>`).join('')}</div><div class="stress-practice-feedback" role="status">${stressFeedback}</div>${button('Проверить','stress-check-sort','primary',stressPractice.assigned.some(v=>v===null)?'disabled':'')}${done && stressPractice.sortDone ? button('Далее →','stress-practice-next') : ''}</div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}</div></section>`;
  }
  if (mountainStep === 10) {
    const spots=[['notifications','Уведомления','Сообщения прерывают работу и мешают сосредоточиться.'],['tasks','Список задач','Объёмный список без приоритетов может создавать ощущение перегрузки.'],['deadline','Срок','Приближающийся срок помогает понять, что важно сделать сначала.'],['plant','Растение','Растение само по себе не мешает работе.']];
    const found=stressPractice.spots.filter(i=>i<3).length;
    return `<section class="mountain-page mountain-learning"><p class="eyebrow forest-label">ГОРА СТРЕССА <span class="story-counter">ПРАКТИКА 2 / 3</span></p><div class="mountain-learning-content stress-practice"><p class="eyebrow">РАБОЧЕЕ МЕСТО АНДРЕЯ</p><h1 tabindex="-1">Что добавляет напряжения?</h1><p>Осмотри рабочее место и найди три возможных источника напряжения.</p><div class="stress-workspace"><img class="workspace-art" src="./assets/workspace-user.svg" alt=""><button class="stress-hotspot spot-notifications" data-action="stress-spot" data-index="0" aria-label="Телефон с уведомлениями">●</button><button class="stress-hotspot spot-tasks" data-action="stress-spot" data-index="1" aria-label="Список задач">●</button><button class="stress-hotspot spot-deadline" data-action="stress-spot" data-index="2" aria-label="Срок на экране">●</button><button class="stress-hotspot spot-plant" data-action="stress-spot" data-index="3" aria-label="Растение">●</button><button class="stress-hotspot spot-vase" data-action="stress-spot" data-index="4" aria-label="Ваза с фруктами">●</button><button class="stress-hotspot spot-picture" data-action="stress-spot" data-index="5" aria-label="Картина">●</button><button class="stress-hotspot spot-clock" data-action="stress-spot" data-index="6" aria-label="Часы">●</button><div class="workspace-display">ПРОЕКТ<br><strong>СРОК: ЗАВТРА</strong></div><div class="workspace-list">ЗАДАЧИ<br>☐ Отчёт<br>☐ Встреча<br>☐ Письма<br>☐ Презентация</div><div class="workspace-phone">99+</div></div><p class="workspace-count">Найдено ${found} из 3</p><div class="stress-practice-feedback" role="status">${stressFeedback}</div>${found===3 ? `<p>С чего Андрею стоит начать?</p><div class="practice-options">${button('Определить главное и распланировать ближайший шаг','stress-workspace-answer','practice-option','data-index="0"')}${button('Выполнять все задачи одновременно и не делать пауз','stress-workspace-answer','practice-option','data-index="1"')}</div>${stressPractice.workspaceAnswer === 0 ? `<p class="stress-practice-feedback">Верно! Приоритет и конкретный следующий шаг помогут организовать работу.</p>${button('Далее →','stress-practice-next')}` : stressPractice.workspaceAnswer === 1 ? '<p class="stress-practice-feedback">Попробуй ещё раз: выбери действие, которое уменьшит перегрузку.</p>' : ''}` : ''}</div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}</div></section>`;
  }
  if (mountainStep === 11) {
    const cards=['Обратить внимание на своё состояние','Сделать короткую паузу','Уточнить задачу и договориться о сроке','Работать без остановки до полного изнеможения','Игнорировать все сроки'];
    const done=[0,1,2].every(i=>stressPractice.plan.includes(i))&&stressPractice.plan.every(i=>i<3);
    return `<section class="mountain-page mountain-learning"><p class="eyebrow forest-label">ГОРА СТРЕССА <span class="story-counter">ПРАКТИКА 3 / 3</span></p><div class="mountain-learning-content stress-practice"><p class="eyebrow">ПЛАН ДЕЙСТВИЙ</p><h1 tabindex="-1">Собери план Андрея</h1><p>Перетащи подходящие карточки в план.</p><div class="stress-plan-layout"><div class="stress-plan-cards">${cards.map((c,i)=>!stressPractice.plan.includes(i) ? `<button draggable="true" class="stress-sort-card" data-action="stress-plan-pick" data-index="${i}">${typeset(c)}</button>` : '').join('') || '<p class="stress-plan-empty">Все карточки в плане</p>'}</div><div class="stress-plan-column"><h2>План Андрея</h2><div class="stress-plan-target" data-drop-plan aria-label="План Андрея"><div>${stressPractice.plan.length ? stressPractice.plan.map(i=>`<button class="stress-plan-item" data-action="stress-plan-remove" data-index="${i}">${typeset(cards[i])} <span>×</span></button>`).join('') : '<p>Здесь появятся выбранные действия</p>'}</div></div></div></div><div class="stress-practice-feedback" role="status">${stressFeedback}</div>${button('Проверить','stress-check-plan','primary',stressPractice.plan.length ? '' : 'disabled')}${done && stressPractice.planDone ? button('Завершить →','stress-practice-next') : ''}</div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}</div></section>`;
  }
  if (mountainStep === 8) return `<section class="mountain-page mountain-learning"><p class="eyebrow forest-label">ГОРА СТРЕССА</p><div class="mountain-learning-content stress-level-intro"><p class="eyebrow">УПРАВЛЕНИЕ СТРЕССОМ</p><h1 tabindex="-1">Три уровня управления стрессом</h1><p>${typeset('Сейчас мы рассмотрим три уровня: как обратить внимание на симптомы, снять напряжение и разобраться с его причинами.')}</p><p class="stress-level-intro-note">Вместе они помогают подойти к работе со стрессом комплексно.</p><div class="stress-level-intro-steps" aria-label="Три уровня"><span><b>01</b> Нейтрализация симптомов</span><span><b>02</b> Снятие напряжения</span><span><b>03</b> Устранение причин</span></div></div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}${button('Рассмотреть уровни →','mountain-next')}</div></section>`;
  if (mountainStep >= 5 && mountainStep <= 7) {
    const levels = [
      ['Нейтрализация симптомов','Замечай, как напряжение отражается на самочувствии, и уделяй внимание появившимся симптомам.','Андрей заметил, что несколько ночей плохо спит. Он выделил время на отдых и, если проблемы со сном не проходят, обращается за консультацией к специалисту.'],
      ['Снятие напряжения','Помогают действия, которые позволяют телу и мыслям немного успокоиться: дыхание, движение или медитация.','Перед важной встречей Андрей делает паузу, спокойно дышит и немного проходит пешком, чтобы снизить напряжение.'],
      ['Устранение причин','Работай с тем, что поддерживает стресс: поглотителями времени, ложными целями и перфекционизмом.','Андрей уточняет, что действительно нужно сделать, договаривается о сроке и отключает лишние уведомления во время работы.']
    ];
    const i = mountainStep - 5, [title, description, example] = levels[i];
    return `<section class="mountain-page mountain-learning stress-level-screen"><p class="eyebrow forest-label">ГОРА СТРЕССА <span class="story-counter">УРОВЕНЬ ${i+1} / 3</span></p><div class="stress-level-layout"><div class="stress-person" role="img" aria-label="Силуэт человека: уровень ${i+1} из 3"><img class="stress-person-image stress-person-dim" src="./assets/human-body-silhouette.png" alt=""><img class="stress-person-image stress-person-fill stress-person-fill-${i+1}" src="./assets/human-body-silhouette.png" alt=""></div><div class="stress-level-copy"><p class="eyebrow">УПРАВЛЕНИЕ СТРЕССОМ · 0${i+1}</p><h1 tabindex="-1">${title}</h1><p>${typeset(description)}</p><div class="stress-level-example"><span>ПРИМЕР</span><p>${typeset(example)}</p></div><p class="stress-level-note">Все три уровня дополняют друг друга.</p></div></div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}${i < 2 ? button('Следующий уровень →','mountain-next') : button('К практике →','stress-practice-start')}</div></section>`;
  }
  if (mountainStep === 0) return `<section class="mountain-page"><p class="eyebrow forest-label">ГОРА СТРЕССА</p><div class="mountain-cover"><h1 tabindex="-1">Гора стресса</h1><p>${typeset(route[3].description)}</p></div><div class="forest-actions">${button('← К карте','map','text-button')}${button('Начать →','mountain-next')}</div></section>`;
  if (mountainStep === 3) return `<section class="mountain-page mountain-learning"><p class="eyebrow forest-label">ГОРА СТРЕССА</p><div class="mountain-learning-content"><p class="eyebrow">ПРИЧИНЫ РАЗВИТИЯ СТРЕССА</p><h1 tabindex="-1">Почему откладывание вызывает напряжение</h1><p>${typeset('Откладывание – это всегда ситуация неопределенности. Мы смещаем фокус своего внимания на постороннюю деятельность. Однако незавершенное действие довлеет над нами, пусть мы и не осознаем этого. В результате мы испытываем физическое и нервное перенапряжение.')}</p></div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}${button('Далее →','mountain-next')}</div></section>`;
  if (mountainStep === 4) { const stages = [['Дела откладываются','Задача остаётся незавершённой, а срок приближается.'],['Рывок перед дедлайном','Перед сроком приходится срочно наверстывать упущенное.'],['Нервное истощение','Напряжённая работа в спешке может отнимать много сил.'],['Дела не выполнены или сроки сорваны','Неудача и чувство вины могут усложнить возвращение к работе.']]; return `<section class="mountain-page mountain-learning stress-screen"><p class="eyebrow forest-label">ГОРА СТРЕССА</p><div class="mountain-learning-content"><p class="eyebrow">ПРИЧИНЫ РАЗВИТИЯ СТРЕССА</p><h1 tabindex="-1">Как развивается напряжение</h1><p class="stress-instruction">Нажимай на этапы по кругу, чтобы проследить, как развивается напряжение.</p><div class="stress-cycle"><svg class="stress-cycle-line" viewBox="0 0 600 410" aria-hidden="true"><defs><marker id="stress-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#e8c687"/></marker></defs>${['M315 38 C445 40 510 102 510 185','M510 220 C505 305 445 365 322 370','M278 370 C155 365 95 305 90 220','M90 185 C95 102 155 40 278 38'].map((d,i)=>i < stressStage ? `<path class="stress-link ${i === stressStage-1 && stressSelected === i ? 'is-drawing' : ''}" pathLength="100" d="${d}"/>` : '').join('')}</svg>${stages.map(([title],i)=>i <= stressStage ? `<button class="stress-cycle-node stress-node-${i} ${i < stressStage ? 'is-open' : ''} ${i === stressStage ? 'is-next' : ''} ${i === stressStage && stressStage > 0 && stressSelected === stressStage-1 ? 'is-arriving' : ''}" data-action="stress-stage" data-index="${i}" ${i > stressStage ? 'disabled' : ''}><span class="stress-stage-number">0${i+1}</span><strong>${title}</strong></button>` : '').join('')}<div class="stress-cycle-center" aria-live="polite">${stressStage ? `<p>${typeset(stages[stressSelected >= 0 ? stressSelected : stressStage-1][1])}</p>` : '<p>Начни с первого этапа</p>'}</div></div>${stressStage === stages.length ? '<p class="stress-end">Замечая этот круг, можно вовремя остановиться и вернуться к задаче небольшим шагом.</p>' : ''}</div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}${stressStage === stages.length ? button('Далее →','mountain-next') : ''}</div></section>`; }
  if (mountainStep === 2) return `<section class="mountain-page mountain-story mountain-dragon-scene"><p class="eyebrow forest-label">ГОРА СТРЕССА <span class="story-counter">02 / 02</span></p><div class="mountain-encounter"><img class="mountain-encounter-andrey" src="./assets/mountain-andrey-scene.svg" alt="Андрей в броне со щитом"><div class="speech from-andrey"><span class="speaker">Андрей</span><h1 tabindex="-1">${typeset('Стресс – еще один спутник прокрастинации! Надо узнать о нем побольше, чтобы победить!')}</h1></div><img class="mountain-encounter-dragon" src="./assets/mountain-dragon.svg" alt="Дракон на горе"></div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}${button('Далее →','mountain-next')}</div></section>`;
  const mentor = mountainStep === 1;
  return `<section class="mountain-page mountain-story"><p class="eyebrow forest-label">ГОРА СТРЕССА <span class="story-counter">0${mountainStep} / 02</span></p><div class="mountain-dialogue"><img class="mountain-mentor" src="./assets/original-mentor.svg" alt="Наставник"><div class="speech ${mentor ? 'from-andrey' : 'from-mentor'}"><span class="speaker">${mentor ? 'Наставник' : 'Андрей'}</span><h1 tabindex="-1">${typeset(mentor ? 'Ты прошел длинный путь, друг мой. Впереди тебя ждет подъем на Гору стресса. Будь осторожен!' : 'Стресс – еще один спутник прокрастинации! Надо узнать о нем побольше, чтобы победить!')}</h1></div><div class="mountain-person"><img src="./assets/andrey-mountain.svg" alt="Андрей в броне со щитом за спиной"></div></div><div class="forest-actions">${button('← Назад','mountain-back','text-button')}${mountainStep === 1 ? button('Далее →','mountain-next') : button('К карте →','map')}</div></section>`;
}
const battleMethods = ['Определить достаточный результат', 'Назначить время завершения', 'Убрать лишние детали'];
const battleTraps = ['Андрей не знает, когда работа будет достаточно хороша.', 'Андрей бесконечно переписывает готовый текст.', 'Андрей часами выбирает украшения, не влияющие на смысл.'];
const battleOrder = ['Уточнить, что необходимо сделать и к какому сроку.', 'Договориться с коллегой о сроке ответа и отключить лишние уведомления.', 'Определить достаточный результат и сделать первый шаг.', 'Проверить главное и отправить результат.'];
function battleView() {
  if (battleStep === 0) return `<section class="battle-page battle-intro"><div class="battle-arena"><h1 tabindex="-1">Финальная битва</h1><div class="battle-fighter battle-hero"><img src="./assets/andrey-with-sword-vector.svg" alt="Андрей в броне с мечом и щитом"></div><div class="battle-fighter battle-boss"><img src="./assets/final-boss.svg" alt="Дракон Прокрастинация"></div><span class="battle-versus" aria-hidden="true">VS</span><div class="battle-intro-actions">${button('← К карте','map','text-button')}${button('Начать →','battle-start')}</div></div></section>`;
  if (battleStep === 6) return `<section class="battle-page battle-finish"><div class="battle-finish-content"><p class="eyebrow">ПОБЕДА</p><h1 tabindex="-1">Дракон отступает!</h1><p>Андрей распознал ловушки, воспользовался своими знаниями и сделал первый шаг. Броня, щит и меч помогли ему пройти последнее испытание.</p><div class="battle-victory-actions">${button('← Назад','battle-back','text-button')}${button('Далее →','battle-epilogue')}</div></div><div class="epilogue-hero victory-hero"><img class="epilogue-andrey" src="./assets/andrey-with-sword-vector.svg" alt="Андрей в броне с мечом и щитом"></div></section>`;
  if (battleStep === 7) return `<section class="battle-epilogue"><div class="epilogue-forest" aria-hidden="true"></div><div class="epilogue-stage"><div class="epilogue-hero"><img class="epilogue-andrey" src="./assets/andrey-with-sword-vector.svg" alt="Андрей в броне с мечом и щитом"></div><div class="speech from-mentor epilogue-speech"><span class="speaker">Наставник</span><h1 tabindex="-1">${typeset('Поздравляю тебя, друг мой! Ты прошел все испытания и победил коварного дракона Прокрастинации. Мы благодарим тебя! Теперь ты можешь отправляться домой.')}</h1></div><img class="epilogue-mentor" src="./assets/original-mentor.svg" alt="Наставник с посохом"></div><div class="forest-actions epilogue-actions">${button('← Назад','battle-back','text-button')}${button('Проснуться →','battle-wake')}</div></section>`;
  if (battleStep === 8) return `<section class="wake-scene" aria-label="Андрей просыпается и возвращается к игре"><div class="wake-frame"><img class="wake-desk" src="./assets/wake-andrey-complete.png" alt="Андрей проснулся за компьютером"><div class="wake-monitor"><div class="wake-monitor-frame"><img class="wake-game-art" src="./assets/wake-game-complete.png" alt="Игра на экране компьютера"><button class="wake-close" data-action="battle-close-game" aria-label="Закрыть игру" title="Закрыть игру"></button></div></div></div></section>`;
  if (battleStep === 9) return `<section class="course-ending"><div><p class="eyebrow">ИСТОРИЯ ЗАВЕРШЕНА</p><h1 tabindex="-1">Курс завершён</h1><p>Андрей понял: чтобы победить прокрастинацию, не нужно ждать идеального момента. Важно заметить, что мешает, и сделать первый шаг.</p><p>Теперь он готов действовать и воплощать свои планы в жизнь. А какой первый шаг сделаешь ты?</p></div></section>`;
  const done = battleState.completed.includes(battleStep);
  let content = '';
  if (battleStep === 1) content = `<p class="eyebrow">БРОНЯ ВНИМАНИЯ</p><h1 tabindex="-1">Похищенное утро</h1><p>Андрей выделил утро на подготовку заявки. Дракон шепчет: «Сначала посмотри ещё один обзор!» Найди в расписании занятие, которое превращается в поглотителя времени.</p><div class="battle-schedule" aria-label="Расписание Андрея"><div class="battle-schedule-head">РАСПИСАНИЕ · УТРО</div>${['09:00 · Подготовка заявки','09:20 · Обзоры гаджетов вместо работы над заявкой','10:30 · Запланированный перерыв','11:00 · Встреча по заявке'].map((t,i)=>`<button class="battle-schedule-entry ${battleState.selections.includes(i)?'is-selected':''}" data-action="battle-select" data-index="${i}"><span>${t}</span><span aria-hidden="true">${battleState.selections.includes(i)?'✓':'›'}</span></button>`).join('')}</div>`;
  if (battleStep === 2) content = `<p class="eyebrow">ЩИТ ОСОЗНАННОСТИ</p><h1 tabindex="-1">Чья это цель?</h1><p>Андрей хочет записаться на дорогой курс только потому, что его проходят знакомые. Сам он мечтает освоить фотографию и не понимает, пригодится ли ему этот курс. Какие вопросы помогут ему проверить цель? Выбери все подходящие.</p><div class="battle-options">${['Зачем этот курс нужен именно мне?','Поможет ли он приблизиться к тому, что для меня важно?','Сколько знакомых уже записалось?','Готов ли я потратить на него свои время и деньги?'].map((t,i)=>`<button class="battle-choice ${battleState.selections.includes(i)?'is-selected':''}" aria-pressed="${battleState.selections.includes(i)}" data-action="battle-select" data-index="${i}"><span class="battle-check">${battleState.selections.includes(i)?'✓':''}</span>${t}</button>`).join('')}</div>`;
  if (battleStep === 3) content = `<p class="eyebrow">ПРОТИВ ПЕРФЕКЦИОНИЗМА</p><h1 tabindex="-1">Три ловушки дракона</h1><p>Перетащи каждый способ к подходящей ситуации. Чтобы вернуть карточку, нажми на неё.</p><div class="battle-match-layout"><div class="battle-methods">${[2,0,1].filter(i=>!battleState.matches.includes(i)).map(i=>`<button draggable="true" class="battle-method ${battlePicked===i?'is-selected':''}" data-action="battle-pick" data-index="${i}">${battleMethods[i]}</button>`).join('')}</div><div class="battle-traps">${battleTraps.map((t,i)=>`<div class="battle-trap" data-battle-zone="${i}"><p>${t}</p><button data-action="battle-assign" data-index="${i}" class="battle-drop">${battleState.matches[i]===null?'Перетащи сюда способ':battleMethods[battleState.matches[i]]}</button></div>`).join('')}</div></div>`;
  if (battleStep === 4) content = `<p class="eyebrow">МЕЧ СТРЕСС-МЕНЕДЖМЕНТА</p><h1 tabindex="-1">Остановить круг напряжения</h1><p>После нескольких напряжённых дней Андрей замечает, что раздражается из-за каждой мелочи. На завтра ему снова назначили две встречи одновременно. Что поможет поработать с причиной, а не только ненадолго отвлечься?</p><div class="battle-options">${['Обсудить пересечение встреч и договориться, какую можно перенести.','Перед встречами сделать дыхательное упражнение, чтобы успокоиться.','После встреч выделить время на прогулку, чтобы восстановиться.'].map((t,i)=>`<button class="battle-choice ${battleState.selections.includes(i)?'is-selected':''}" aria-pressed="${battleState.selections.includes(i)}" data-action="battle-select" data-index="${i}">${t}</button>`).join('')}</div>`;
  if (battleStep === 5) content = `<p class="eyebrow">РЕШАЮЩИЙ ХОД</p><h1 tabindex="-1">Вернуть управление</h1><p>Завтра Андрей сдаёт предложение для клиента. Коллега просит ответить на несрочное письмо, а дракон убеждает переделывать оформление до идеала. Перетащи карточки и расположи действия в подходящем порядке.</p><ol class="battle-ranking" aria-label="Порядок действий Андрея">${battleState.order.map((i,n)=>`<li class="battle-ranking-row" draggable="true" data-battle-rank="${i}"><span class="battle-rank-number">${n+1}.</span><span class="battle-rank-text">${battleOrder[i]}</span><span class="battle-rank-controls"><button type="button" data-action="battle-order-move" data-index="${i}" data-direction="-1" aria-label="Поднять: ${battleOrder[i]}" ${n===0?'disabled':''}>↑</button><button type="button" data-action="battle-order-move" data-index="${i}" data-direction="1" aria-label="Опустить: ${battleOrder[i]}" ${n===battleState.order.length-1?'disabled':''}>↓</button></span><span class="battle-rank-grip" aria-hidden="true">⠿</span></li>`).join('')}</ol><p class="battle-order-hint">Можно также менять порядок кнопками со стрелками.</p>`;
  const messages = ['','Андрей заметил, что обзоры вытесняют важное дело. Запланированный отдых и нужная встреча сами по себе не мешают работе.','Эти вопросы помогают сопоставить цель со своими интересами и ресурсами, а не ориентироваться только на других.','Андрей выбрал способ для каждой ловушки: критерии готовности, срок и внимание к сути.','Договорённость о встречах помогает изменить источник перегрузки. Отдых тоже важен, но сам по себе не решит проблему расписания.','Андрей уточнил задачу, защитил время, определил достаточный результат и завершил работу. Дракон теряет силу!'];
  const checkDisabled = battleStep===3 ? battleState.matches.some(x=>x===null) : battleStep===5 ? battleState.order.length!==4 : battleState.selections.length===0;
  return `<section class="battle-page battle-question battle-case"><p class="eyebrow forest-label">ФИНАЛЬНАЯ БИТВА <span class="story-counter">ИСПЫТАНИЕ ${battleStep} / 5</span></p><div class="battle-case-layout"><div class="battle-question-content">${content}<div class="battle-result" role="status">${battleFeedback ? `<p>${battleFeedback}</p>` : done ? `<p>${messages[battleStep]}</p>` : ''}</div><div class="battle-case-actions">${button('Проверить','battle-check','primary',checkDisabled?'disabled':'')}${done ? button(battleStep===5?'Завершить битву →':'Далее →','battle-next') : ''}</div></div><div class="battle-progress-art" aria-hidden="true"><img src="./assets/final-boss.svg" alt=""><span>${battleStep} / 5</span></div></div><div class="forest-actions">${button('← Назад','battle-back','text-button')}</div></section>`;
}
function mapLocation(location, index) {
  const active = index === 0 || (index === 1 && forestComplete) || (index === 2 && caveComplete) || (index === 3 && marshComplete) || (index === 4 && mountainComplete);
  const bossStage = mountainComplete ? 4 : marshComplete ? 3 : caveComplete ? 2 : forestComplete ? 1 : 0;
  const hand = `<svg class="map-hand" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="19" fill="#162930" stroke="#efd196"/>
    <path d="M16 21V10a2 2 0 0 1 4 0v8-2a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v5c0 4-2 7-4 8H17l-7-10a2.2 2.2 0 0 1 3.5-2.7l2.5 3Z" fill="#f4d899" stroke="#14272d" stroke-linejoin="round"/>
  </svg>`;
  return `<button class="map-node ${index === 4 ? 'final-node' : ''} ${(index === 1 && showCaveUnlock) || (index === 2 && showMarshUnlock) || (index === 3 && showMountainUnlock) || (index === 4 && showFinalUnlock) ? 'cave-unlocking' : ''}" data-action="location" data-index="${index}"
    aria-label="${location.name}: ${active ? 'начать путь' : 'пока недоступно'}" ${active ? '' : 'disabled'}>
    <span class="map-picture"><img src="./assets/${index === 4 ? `boss-stage-${bossStage}.png` : location.image}" alt="">${(index === (mountainComplete ? 4 : marshComplete ? 3 : caveComplete ? 2 : forestComplete ? 1 : 0)) ? hand : ''}</span>
    <span class="node-number">${String(index+1).padStart(2,'0')}</span>
    <strong>${location.name}</strong><span>${(index === 0 && forestComplete) || (index === 1 && caveComplete) || (index === 2 && marshComplete) || (index === 3 && mountainComplete) ? 'Пройдено ✓' : active ? 'Начать путь →' : 'Пока недоступно'}</span>
  </button>`;
}
function mapView(){return `<section class="page opening-map"><div class="section-top"><div><p class="eyebrow">ПРОКРАСТИНАЦИЯ</p><h1 tabindex="-1">Карта курса</h1></div>${button('← Вернуться к истории','story-back','text-button')}</div><div class="map-world"><svg class="map-line" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true"><path d="M80 260 Q180 0 300 160 T510 170 T710 130 T920 230"/></svg><div class="map-nodes">${route.map(mapLocation).join('')}</div></div><div class="inventory"><div><p class="eyebrow">ДОСТИЖЕНИЯ</p><p>Снаряжение</p></div><div class="gear-list">${['Броня','Щит Тайм-менеджмент','Меч Стресс-менеджмент'].map((n,i)=>`<span class="gear ${(i === 0 && caveComplete) || (i === 1 && marshComplete) || (i === 2 && mountainComplete) ? 'owned' : ''}">${equipmentIcon(i)}<span>${n}<small>${(i === 0 && caveComplete) || (i === 1 && marshComplete) || (i === 2 && mountainComplete) ? 'Получено' : 'Пока не получено'}</small></span></span>`).join('')}</div></div></section>`;}
app.addEventListener('close', event => {
  if (event.target.matches('dialog') && view === 'cave-search') {
    render();
    showCaveCongratulations();
  }
}, true);
app.addEventListener('animationend', event => {
  if (event.animationName === 'hand-appear') { showCaveUnlock = false; showMarshUnlock = false; showMountainUnlock = false; showFinalUnlock = false; }
});
function showCaveCongratulations() {
  if (view !== 'cave-search' || discoveredDragons.size !== timeDragons.length || caveCongratulationsSeen) return;
  const dialog = document.querySelector('#location-dialog');
  dialog.innerHTML = `<h2 id="location-title">Молодец!</h2><p>Ты нашёл всех дракончиков. Теперь потренируемся!</p>${button('Продолжить','cave-congratulations-close')}`;
  dialog.addEventListener('cancel', event => event.preventDefault(), {once:true});
  dialog.showModal();
}

const progressKey = 'course-position-v1';
let awaitingResume = false;
function savePosition() {
  if (awaitingResume) return;
  try {
    localStorage.setItem(progressKey, JSON.stringify({
      view, step, seen, forestLine, guideStep, forestComplete, caveComplete, marshComplete, mountainComplete, marshStep, mountainStep, battleStep, battleAnswer, battleState, stressStage, stressPractice, marshCaseAnswer, marshFound, perfectionChoices, perfectionCase, perfectionCaseAnswer, falseGoalAnswer, forestAnswers, caveAnswers, marshAnswers, perfectionAnswers,
      practiceStep, practiceAnswer, caveStep, caveAnswer, selectedPart,
      readParts: [...readParts], discoveredDragons: [...discoveredDragons], inspectedPlaces: [...inspectedPlaces], caveCongratulationsSeen
    }));
  } catch {}
}
function restorePosition(saved) {
  const views = ['cover','intro','map','forest','anatomy','forest-practice','forest-guide','cave','cave-search','marsh','mountain','battle'];
  const bounded = (value, min, max, fallback) => Number.isInteger(value) && value >= min && value <= max ? value : fallback;
  view = views.includes(saved.view) ? saved.view : 'cover';
  step = bounded(saved.step, 0, introduction.length - 1, 0);
  forestLine = bounded(saved.forestLine, 0, forestDialogue.length, 0);
  guideStep = bounded(saved.guideStep, 0, forestGuide.length - 1, 0);
  practiceStep = bounded(saved.practiceStep, 0, 2, 0);
  practiceAnswer = bounded(saved.practiceAnswer, 0, 2, null);
  forestAnswers = Array.isArray(saved.forestAnswers) ? saved.forestAnswers.map((value, index) => Number.isInteger(value) && locations[0].scenes[index]?.options[value]?.ok ? value : null) : [];
  caveAnswers = Array.isArray(saved.caveAnswers) ? saved.caveAnswers.map((value, index) => Number.isInteger(value) && locations[1].scenes[index]?.options[value]?.ok ? value : null) : [];
  marshStep = bounded(saved.marshStep, 0, 16, 0);
  falseGoalAnswer = bounded(saved.falseGoalAnswer, 0, 2, null);
  marshAnswers = Array.isArray(saved.marshAnswers) ? saved.marshAnswers.map((v,i) => v === (i === 0 ? 1 : 2) ? v : null) : [];
  perfectionAnswers = Array.isArray(saved.perfectionAnswers) ? saved.perfectionAnswers.map((v,i) => v === i ? v : null) : [];
  mountainStep = bounded(saved.mountainStep, 0, 12, 0);
  mountainComplete = saved.mountainComplete === true;
  battleStep = bounded(saved.battleStep, 0, 9, 0); battleAnswer = null;
  const bs = saved.battleState || {}; const valid = (a,max) => Array.isArray(a) ? [...new Set(a.filter(x=>Number.isInteger(x)&&x>=0&&x<max))] : [];
  battleState = {completed:valid(bs.completed,6).filter(x=>x>0), selections:valid(bs.selections,4), matches:Array.from({length:3},(_,i)=>bounded(bs.matches?.[i],0,2,null)), order:[...valid(bs.order,4), ...[2,0,3,1].filter(i=>!valid(bs.order,4).includes(i))]}; battleFeedback=''; battlePicked=null;
  const sp = saved.stressPractice || {}; stressPractice = {assigned: Array.from({length:3}, (_,i) => Number.isInteger(sp.assigned?.[i]) && sp.assigned[i]>=0 && sp.assigned[i]<3 ? sp.assigned[i] : null), spots: Array.isArray(sp.spots) ? [...new Set(sp.spots.filter(i=>Number.isInteger(i) && i>=0 && i<7))] : [], workspaceAnswer: bounded(sp.workspaceAnswer,0,1,null), plan: Array.isArray(sp.plan) ? [...new Set(sp.plan.filter(i=>Number.isInteger(i) && i>=0 && i<5))] : [], sortDone: sp.sortDone === true, planDone: sp.planDone === true}; stressPicked = null; stressFeedback = '';
  stressStage = bounded(saved.stressStage, 0, 4, 0);
  perfectionChoices = Array.isArray(saved.perfectionChoices) ? saved.perfectionChoices.filter(i => Number.isInteger(i) && i >= 0 && i < 4) : [];
  perfectionCase = bounded(saved.perfectionCase, 0, 3, 0); perfectionCaseAnswer = bounded(saved.perfectionCaseAnswer, 0, 3, null);
  marshFound = Array.isArray(saved.marshFound) ? [saved.marshFound[0] === true, saved.marshFound[1] === true] : [false, false];
  marshFinding = false;
  marshCaseAnswer = bounded(saved.marshCaseAnswer, 0, 2, null);
  caveStep = bounded(saved.caveStep, -3, locations[1].scenes.length + 1, -2);
  caveAnswer = bounded(saved.caveAnswer, 0, 2, null);
  selectedPart = bounded(saved.selectedPart, 0, anatomyParts.length - 1, null);
  seen = saved.seen === true;
  forestComplete = saved.forestComplete === true;
  caveComplete = saved.caveComplete === true;
  marshComplete = saved.marshComplete === true || (saved.view === 'marsh' && saved.marshStep === 14);
  caveCongratulationsSeen = saved.caveCongratulationsSeen === true;
  readParts.clear();
  discoveredDragons.clear();
  inspectedPlaces.clear();
  if (Array.isArray(saved.readParts)) saved.readParts.forEach(i => { if (Number.isInteger(i) && i >= 0 && i < anatomyParts.length) readParts.add(i); });
  if (Array.isArray(saved.inspectedPlaces)) saved.inspectedPlaces.forEach(i => { if (Number.isInteger(i) && i >= 0 && i < hidingPlaces.length) inspectedPlaces.add(i); });
  if (Array.isArray(saved.discoveredDragons)) saved.discoveredDragons.forEach(i => { if (Number.isInteger(i) && i >= 0 && i < timeDragons.length) discoveredDragons.add(i); });
}
app.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el)return;event.preventDefault();const a=el.dataset.action;
 if (a === 'resume-course') {
   let saved;
   try { saved = JSON.parse(localStorage.getItem(progressKey)); } catch {}
   awaitingResume = false;
   if (saved && typeof saved === 'object') restorePosition(saved);
   navigate(view);
   showCaveCongratulations();
   return;
 }
 if (a === 'restart-course') {
   awaitingResume = false;
   try { localStorage.removeItem(progressKey); localStorage.removeItem('forest-complete'); localStorage.removeItem('cave-complete'); } catch {}
   restorePosition({});
   return navigate('cover');
 }
 if(a==='cover')return navigate('cover');
 if (a === 'intro') {
   showCaveUnlock = false;
   if (view === 'cover') {
     readParts.clear(); discoveredDragons.clear(); inspectedPlaces.clear(); caveCongratulationsSeen = false;
     forestComplete = false;
     caveComplete = false;
     marshComplete = false;
     mountainComplete = false;
     battleStep = 0; battleAnswer = null; battleState = {completed:[],selections:[],matches:[null,null,null],order:[2,0,3,1]}; battleFeedback=''; battlePicked=null;
     forestAnswers = []; caveAnswers = []; marshAnswers = []; perfectionAnswers = []; stressPractice = {assigned:[null,null,null],spots:[],workspaceAnswer:null,plan:[],sortDone:false,planDone:false}; stressStage = 0; stressSelected = -1; marshFound = [false, false]; perfectionCase = 0; perfectionCaseAnswer = null; falseGoalAnswer = null;
     try { localStorage.removeItem('forest-complete'); localStorage.removeItem('cave-complete'); } catch {}
   }
   step = 0;
   return navigate('intro');
 }
 if(a==='next'){if(step<3){step++;return navigate('intro');}seen=true;return navigate('map');}
 if(a==='previous'){if(step>0){step--;return navigate('intro');}return navigate('cover');}
 if(a==='story-back'){step=3;return navigate('intro');}
 if(a==='map'&&seen){
   if (view === 'cave' && caveStep === locations[1].scenes.length + 1 && caveComplete) showMarshUnlock = true;
   if (view === 'marsh' && marshStep === 14 && marshComplete) showMountainUnlock = true;
   if (view === 'mountain' && mountainStep === 12 && mountainComplete) showFinalUnlock = true;
   return navigate('map');
 }
 if (a === 'anatomy' && view === 'forest' && forestLine === forestDialogue.length) {
   return navigate('anatomy');
 }
 if (view === 'anatomy' && a === 'return-dialogue') return navigate('forest');
 if (view === 'anatomy' && a === 'read-part') {
   selectedPart = Number(el.dataset.index);
   readParts.add(selectedPart);
   render();
   app.querySelector('.anatomy-marker[aria-pressed="true"]').focus({preventScroll:true});
   return;
 }
 if (view === 'anatomy' && a === 'start-practice') {
   practiceStep = 0;
   practiceAnswer = forestAnswers[0] ?? null;
   return navigate('forest-practice');
 }
 if (view === 'forest-practice' && a === 'anatomy-back') return navigate('anatomy');
 if (view === 'forest-practice' && a === 'practice-answer') {
   practiceAnswer = Number(el.dataset.index);
   if (locations[0].scenes[practiceStep].options[practiceAnswer]?.ok) forestAnswers[practiceStep] = practiceAnswer;
   render();
   app.querySelector('.practice-feedback').focus();
   return;
 }
 if (view === 'forest-practice' && a === 'practice-next' && (forestComplete || locations[0].scenes[practiceStep].options[practiceAnswer]?.ok)) {
   practiceStep++;
   practiceAnswer = forestAnswers[practiceStep] ?? null;
   return navigate('forest-practice');
 }
 if (view === 'forest-practice' && a === 'start-guide' && (forestComplete || locations[0].scenes[practiceStep].options[practiceAnswer]?.ok)) {
   guideStep = 0;
   return navigate('forest-guide');
 }
 if (view === 'forest-guide' && a === 'guide-back') {
   if (guideStep > 0) { guideStep--; return navigate('forest-guide'); }
   return navigate('forest-practice');
 }
 if (view === 'forest-guide' && a === 'guide-next') {
   if (guideStep < forestGuide.length - 1) { guideStep++; return navigate('forest-guide'); }
   showCaveUnlock = !forestComplete;
   forestComplete = true;
   try { localStorage.setItem('forest-complete', 'true'); } catch {}
   return navigate('map');
 }
 if (view === 'map' && a === 'location' && el.dataset.index === '2' && caveComplete) {
   showMarshUnlock = false;
   marshStep = 0;
   return navigate('marsh');
 }
 if (view === 'map' && a === 'location' && el.dataset.index === '3' && marshComplete) { showMountainUnlock = false; mountainStep = 0; return navigate('mountain'); }
 if (view === 'map' && a === 'location' && el.dataset.index === '4' && mountainComplete) { showFinalUnlock = false; battleStep = 0; return navigate('battle'); }
 if (view === 'battle' && a === 'battle-start') { battleStep = 1; battleState.selections=[]; battleFeedback=''; return navigate('battle'); }
 if (view === 'battle' && a === 'battle-epilogue') { battleStep = 7; return navigate('battle'); }
 if (view === 'battle' && a === 'battle-wake') { battleStep = 8; return navigate('battle'); }
 if (view === 'battle' && a === 'battle-close-game') { battleStep = 9; return navigate('battle'); }
 if (view === 'battle' && a === 'battle-back') { battleStep = Math.max(0,battleStep-1); battleState.selections=[]; battleFeedback=''; battlePicked=null; return navigate('battle'); }
 if (view === 'battle' && a === 'battle-next') { if (!battleState.completed.includes(battleStep)) return; battleStep++; battleState.selections=[]; battleFeedback=''; battlePicked=null; return navigate('battle'); }
 if (view === 'battle' && a === 'battle-select') { const i=Number(el.dataset.index); battleState.selections = battleStep===2 ? (battleState.selections.includes(i)?battleState.selections.filter(v=>v!==i):[...battleState.selections,i]) : [i]; battleFeedback=''; render(); return; }
 if (view === 'battle' && a === 'battle-pick') { battlePicked=Number(el.dataset.index); battleFeedback=''; render(); return; }
 if (view === 'battle' && a === 'battle-assign') { const zone=Number(el.dataset.index); if(battlePicked===null) { battleState.matches[zone]=null; } else { battleState.matches[zone]=battlePicked; } battlePicked=null; battleFeedback=''; render(); return; }
 if (view === 'battle' && a === 'battle-order-move') { const i=battleState.order.indexOf(Number(el.dataset.index)), next=i+Number(el.dataset.direction); if(i<0||next<0||next>=battleState.order.length)return; [battleState.order[i],battleState.order[next]]=[battleState.order[next],battleState.order[i]]; battleFeedback=''; render(); app.querySelector(`[data-action="battle-order-move"][data-index="${el.dataset.index}"][data-direction="${el.dataset.direction}"]`)?.focus(); return; }
 if (view === 'battle' && a === 'battle-check') { const v=battleState.selections; const correct = battleStep===1 ? v.length===1&&v[0]===1 : battleStep===2 ? v.length===3&&[0,1,3].every(i=>v.includes(i)) : battleStep===3 ? battleState.matches.every((x,i)=>x===i) : battleStep===4 ? v.length===1&&v[0]===0 : battleState.order.length===4&&battleState.order.every((x,i)=>x===i); if(correct){ if(!battleState.completed.includes(battleStep))battleState.completed.push(battleStep); battleFeedback=''; } else { battleFeedback = battleStep===1?'Подумай, какое занятие заменило запланированную работу, а не помогло восстановиться.':battleStep===2?'Обрати внимание на личный смысл и ресурсы Андрея, а не на выбор знакомых.':battleStep===3?'Попробуй ещё раз: сначала определи, чего не хватает в каждой ситуации.':battleStep===4?'Это может помочь справиться с напряжением, но встречи по-прежнему совпадают. Подумай, как изменить расписание.':'Попробуй ещё раз: сначала проясни задачу, затем создай условия для работы.'; } render(); return; }
 if (view === 'mountain' && a === 'stress-practice-start') { mountainStep = 9; stressPicked = null; stressFeedback = ''; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-pick') { stressPicked = Number(el.dataset.index); stressFeedback = ''; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-assign' && stressPicked !== null) { stressPractice.assigned[stressPicked] = Number(el.dataset.zone); stressPractice.sortDone = false; stressPicked = null; stressFeedback = ''; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-check-sort') { const correct = stressPractice.assigned.every((v,i)=>v===i); stressPractice.sortDone = correct; stressFeedback = correct ? 'Верно! Сон — симптом, волнение — напряжение, а уведомления могут быть одной из причин.' : 'Посмотри ещё раз: что является проявлением, что — состоянием, а что может его вызывать?'; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-spot') { const i = Number(el.dataset.index); if (!stressPractice.spots.includes(i)) stressPractice.spots.push(i); stressFeedback = ['Уведомления прерывают работу и мешают сосредоточиться.','Большой список без приоритетов может создавать ощущение перегрузки.','Приближающийся срок помогает понять, что важно сделать сначала.','Растение само по себе не мешает работе.','Ваза с фруктами не является источником напряжения в этой ситуации.','Картина не мешает Андрею работать.','Часы показывают время и сами по себе не мешают работе.'][i]; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-workspace-answer') { stressPractice.workspaceAnswer = Number(el.dataset.index); return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-plan-pick') { const index = Number(el.dataset.index); if (!stressPractice.plan.includes(index)) stressPractice.plan.push(index); stressPractice.planDone = false; stressPicked = null; stressFeedback = ''; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-plan-add' && stressPicked !== null) { if (!stressPractice.plan.includes(stressPicked)) stressPractice.plan.push(stressPicked); stressPractice.planDone = false; stressPicked = null; stressFeedback = ''; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-plan-remove') { stressPractice.plan = stressPractice.plan.filter(i=>i!==Number(el.dataset.index)); stressPractice.planDone = false; stressFeedback = ''; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-check-plan') { const correct = [0,1,2].every(i=>stressPractice.plan.includes(i)) && stressPractice.plan.every(i=>i<3); stressPractice.planDone = correct; stressFeedback = correct ? 'Отлично! В плане есть внимание к состоянию, пауза и работа с причиной напряжения.' : 'Попробуй ещё раз: оставь действия, которые помогают позаботиться о состоянии и разобраться с задачей.'; return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-practice-next') { if (mountainStep === 9 && stressPractice.sortDone) mountainStep = 10; else if (mountainStep === 10 && stressPractice.workspaceAnswer === 0) mountainStep = 11; else if (mountainStep === 11 && stressPractice.planDone) { mountainComplete = true; mountainStep = 12; } else return; stressPicked = null; stressFeedback = ''; return navigate('mountain'); }
 if (view === 'mountain' && a === 'mountain-next') { mountainStep = mountainStep === 4 ? 8 : mountainStep === 8 ? 5 : Math.min(7,mountainStep + 1); return navigate('mountain'); }
 if (view === 'mountain' && a === 'stress-stage' && Number(el.dataset.index) <= stressStage) { stressSelected = Number(el.dataset.index); if (stressSelected === stressStage && stressStage < 4) stressStage++; return navigate('mountain'); }
 if (view === 'mountain' && a === 'mountain-back') { mountainStep = mountainStep === 8 ? 4 : mountainStep === 5 ? 8 : mountainStep === 9 ? 7 : Math.max(0,mountainStep - 1); return navigate('mountain'); }
 if (view === 'marsh' && a === 'marsh-next') { marshStep = marshStep === 0 ? 1 : 10; marshCaseAnswer = null; return navigate('marsh'); }
 if (view === 'marsh' && a === 'marsh-search-continue' && (marshStep === 10 || marshStep === 11) && (marshComplete || marshFound[marshStep === 10 ? 0 : 1])) { marshStep = marshStep === 10 ? 5 : 6; marshCaseAnswer = marshAnswers[marshStep === 5 ? 0 : 1] ?? null; return navigate('marsh'); }
 if (view === 'marsh' && a === 'marsh-find-dragon' && (marshStep === 10 || marshStep === 11) && !marshFinding) {
   const foundStep = marshStep; marshFound[foundStep === 10 ? 0 : 1] = true; marshFinding = true; marshCaseAnswer = marshAnswers[foundStep === 10 ? 0 : 1] ?? null; render(); savePosition();
   setTimeout(() => { if (view === 'marsh' && marshStep === foundStep && marshFinding) { marshFinding = false; marshStep = foundStep === 10 ? 5 : 6; navigate('marsh'); savePosition(); } }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000);
   return;
 }
 if (view === 'marsh' && a === 'marsh-answer' && (marshStep === 5 || marshStep === 6)) { marshCaseAnswer = Number(el.dataset.index); if (marshCaseAnswer === (marshStep === 5 ? 1 : 2)) marshAnswers[marshStep === 5 ? 0 : 1] = marshCaseAnswer; return navigate('marsh'); }
 if (view === 'marsh' && a === 'marsh-case-next' && (marshComplete || marshCaseAnswer === (marshStep === 5 ? 1 : 2))) { marshStep = marshStep === 5 ? 3 : 4; marshCaseAnswer = null; return navigate('marsh'); }
 if (view === 'marsh' && a === 'perfection-next') { if (marshStep === 12) { perfectionCase = 0; perfectionCaseAnswer = perfectionAnswers[0] ?? null; } marshStep = marshStep === 4 ? 12 : marshStep + 1; return navigate('marsh'); }
 if (view === 'marsh' && a === 'perfection-case-answer') { perfectionCaseAnswer = Number(el.dataset.index); if (perfectionCaseAnswer === perfectionCase) perfectionAnswers[perfectionCase] = perfectionCaseAnswer; return navigate('marsh'); }
 if (view === 'marsh' && a === 'perfection-case-next' && (marshComplete || perfectionCaseAnswer === perfectionCase)) { if (perfectionCase === 3) { marshStep = 15; perfectionCaseAnswer = null; } else { perfectionCase++; perfectionCaseAnswer = perfectionAnswers[perfectionCase] ?? null; } return navigate('marsh'); }
 if (view === 'marsh' && a === 'perfection-summary-next') { marshComplete = true; marshStep = 14; return navigate('marsh'); }
 if (view === 'marsh' && a === 'perfection-check') { const feedback = document.querySelector('.perfection-feedback'); const correct = [0,2,3].every(i => perfectionChoices.includes(i)) && !perfectionChoices.includes(1); feedback.textContent = correct ? 'Верно! Чёткие требования, срок и внимание к главному помогают завершить работу.' : 'Попробуй ещё раз: выбери действия, которые помогают закончить работу и не добавляют лишней полировки.'; if(correct && !document.querySelector('[data-action="perfection-finish"]')) document.querySelector('.forest-actions').insertAdjacentHTML('beforeend', button('К причинам →','perfection-finish')); return; }
 if (view === 'marsh' && a === 'perfection-finish') { marshStep = 2; return navigate('marsh'); }
 if (view === 'marsh' && a === 'marsh-theory-next') { if (marshStep === 9) marshFound[0] = true; marshStep = marshStep === 3 ? 7 : marshStep === 9 ? 16 : marshStep + 1; return navigate('marsh'); }
 if (view === 'marsh' && a === 'false-goal-answer') { falseGoalAnswer = Number(el.dataset.index); return navigate('marsh'); }
 if (view === 'marsh' && a === 'false-goal-next' && (marshComplete || falseGoalAnswer === 0)) { marshStep = 11; return navigate('marsh'); }
 if (view === 'marsh' && a === 'marsh-back') { marshFinding = false; if (marshStep === 13 && perfectionCase > 0) { perfectionCase--; perfectionCaseAnswer = perfectionAnswers[perfectionCase] ?? null; return navigate('marsh'); } if (marshStep === 15) perfectionCase = 3; marshStep = marshStep === 10 ? 1 : marshStep === 11 ? 16 : marshStep === 16 ? 9 : marshStep === 5 ? 10 : marshStep === 6 ? 11 : marshStep === 3 ? 5 : marshStep === 7 ? 3 : marshStep === 8 ? 7 : marshStep === 9 ? 8 : marshStep === 4 ? 6 : marshStep === 12 ? 4 : marshStep === 13 ? 12 : marshStep === 15 ? 13 : marshStep === 14 ? 15 : marshStep === 2 ? 14 : 0; marshCaseAnswer = marshStep === 5 || marshStep === 6 ? (marshAnswers[marshStep === 5 ? 0 : 1] ?? null) : null; perfectionCaseAnswer = marshStep === 13 ? (perfectionAnswers[perfectionCase] ?? null) : null; return navigate('marsh'); }
 if (view === 'marsh' && a === 'marsh-false-goals') { marshStep = 3; return navigate('marsh'); }
 if (view === 'marsh' && a === 'marsh-perfectionism') { marshStep = 4; return navigate('marsh'); }
 if (view === 'map' && a === 'location' && el.dataset.index === '1' && forestComplete) {
   showCaveUnlock = false;
   caveStep = -2;
   caveAnswer = null;
   return navigate('cave');
 }
 if (view === 'cave' && a === 'cave-start') {
   if (caveStep === -1) { caveStep = -3; return navigate('cave'); }
   if (caveStep === -3) return navigate('cave-search');
   caveStep++;
   return navigate('cave');
 }
 if (view === 'cave-search' && a === 'cave-search-back') {
   caveStep = -3;
   return navigate('cave');
 }
 if (view === 'cave-search' && a === 'cave-practice' && (caveComplete || (caveCongratulationsSeen && discoveredDragons.size === timeDragons.length))) {
   caveStep = 0;
   caveAnswer = caveAnswers[0] ?? null;
   return navigate('cave');
 }
 if (view === 'cave-search' && a === 'inspect-place') {
   const placeIndex = Number(el.dataset.index);
   const place = hidingPlaces[placeIndex];
   inspectedPlaces.add(placeIndex);
   if (place.dragon !== undefined) {
     const dragon = timeDragons[place.dragon];
     discoveredDragons.add(place.dragon);
     const dialog = document.querySelector('dialog');
     dialog.innerHTML = `<div class="modal-head"><h2 id="location-title">${dragon.name}</h2></div><div class="dragon-detail"><img src="./assets/${dragon.image}" alt=""><p>${typeset(dragon.text)}</p></div>${button('Вернуться в пещеру','dragon-close','secondary')}`;
     dialog.showModal();
   } else {
     const dialog = document.querySelector('dialog');
     dialog.innerHTML = `<div class="modal-head"><h2 id="location-title">${place.name}</h2></div><p>Здесь дракончик не прячется. Осмотри другие предметы.</p>${button('Вернуться в пещеру','dragon-close','secondary')}`;
     dialog.showModal();
   }
   return;
 }
 if (view === 'cave-search' && a === 'cave-dragon') {
   const index = Number(el.dataset.index);
   const dragon = timeDragons[index];
   discoveredDragons.add(index);
   const d = document.querySelector('dialog');
   d.innerHTML = `<div class="modal-head"><h2 id="location-title">${dragon.name}</h2></div><div class="dragon-detail"><img src="./assets/${dragon.image}" alt=""><p>${typeset(dragon.text)}</p></div>${button('Вернуться в пещеру','dragon-close','secondary')}`;
   d.showModal();
   return;
 }
 if (view === 'cave-search' && a === 'dragon-close') {
   document.querySelector('dialog').close();
   return;
 }
 if (view === 'cave-search' && a === 'cave-congratulations-close') {
   caveCongratulationsSeen = true;
   document.querySelector('dialog').close();
   return;
 }
 if (view === 'cave' && a === 'cave-answer') {
   caveAnswer = Number(el.dataset.index);
   if (locations[1].scenes[caveStep].options[caveAnswer]?.ok) caveAnswers[caveStep] = caveAnswer;
   render();
   app.querySelector('.practice-feedback').focus();
   return;
 }
 if (view === 'cave' && a === 'cave-next' && (caveComplete || locations[1].scenes[caveStep].options[caveAnswer]?.ok)) {
   if (caveStep < locations[1].scenes.length - 1) { caveStep++; caveAnswer = caveAnswers[caveStep] ?? null; return navigate('cave'); }
   caveStep++;
   showMarshUnlock = !caveComplete;
   caveComplete = true;
   try { localStorage.setItem('cave-complete', 'true'); } catch {}
   return navigate('cave');
 }
 if (view === 'cave' && a === 'cave-armored' && caveStep === locations[1].scenes.length) {
   caveStep++;
   return navigate('cave');
 }
 if (view === 'cave' && a === 'cave-back') {
   if (caveStep === -2) return navigate('map');
   if (caveStep === 0) return navigate('cave-search');
   if (caveStep === -3) { caveStep = -1; return navigate('cave'); }
   caveStep--; caveAnswer = caveAnswers[caveStep] ?? null; return navigate('cave');
 }

 if(a==='close'){document.querySelector('dialog').close();return;}
 if (a === 'location' && view === 'map' && el.dataset.index === '0') {
   showCaveUnlock = false;
   forestLine = 0;
   return navigate('forest');
 }
 if (view === 'forest' && a === 'forest-next' && forestLine < forestDialogue.length) {
   forestLine++;
   return navigate('forest');
 }
 if (view === 'forest' && a === 'forest-back' && forestLine > 0) {
   forestLine--;
   return navigate('forest');
 }
});
app.addEventListener('click', () => { queueMicrotask(savePosition); });
app.addEventListener('dragstart', event => {
  const rank = event.target.closest('[data-battle-rank]');
  if (rank && view === 'battle' && battleStep === 5) { event.dataTransfer.setData('text/plain', `battle-rank:${rank.dataset.battleRank}`); event.dataTransfer.effectAllowed = 'move'; rank.classList.add('is-dragging'); return; }
  const card = event.target.closest('[data-action="stress-pick"], [data-action="stress-plan-pick"], [data-action="battle-pick"]');
  if (!card) return;
  event.dataTransfer.setData('text/plain', `${card.dataset.action}:${card.dataset.index}`);
  event.dataTransfer.effectAllowed = 'move';
});
app.addEventListener('dragover', event => { if (event.target.closest('[data-zone], [data-drop-plan], [data-battle-zone], [data-battle-rank]')) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } });
app.addEventListener('drop', event => {
  const target = event.target.closest('[data-zone], [data-drop-plan], [data-battle-zone], [data-battle-rank]'); if (!target) return;
  event.preventDefault(); const [kind, raw] = event.dataTransfer.getData('text/plain').split(':'); const i = Number(raw);
  if (kind === 'battle-rank' && view === 'battle' && battleStep === 5 && target.dataset.battleRank !== undefined) { const from=battleState.order.indexOf(i), to=battleState.order.indexOf(Number(target.dataset.battleRank)); if(from<0 || to<0)return; battleState.order.splice(from,1); battleState.order.splice(to,0,i); battleFeedback=''; render(); savePosition(); return; }
  if (kind === 'battle-pick' && view === 'battle' && battleStep === 3 && Number.isInteger(i) && i >= 0 && i < 3 && target.dataset.battleZone !== undefined) { battleState.matches[Number(target.dataset.battleZone)] = i; battlePicked = null; battleFeedback = ''; render(); savePosition(); return; }
  if (kind === 'stress-pick' && mountainStep === 9 && Number.isInteger(i) && i >= 0 && i < 3 && target.dataset.zone !== undefined) { stressPractice.assigned[i] = Number(target.dataset.zone); stressPractice.sortDone = false; }
  else if (kind === 'stress-plan-pick' && mountainStep === 11 && Number.isInteger(i) && i >= 0 && i < 5 && target.hasAttribute('data-drop-plan')) { if (!stressPractice.plan.includes(i)) stressPractice.plan.push(i); stressPractice.planDone = false; }
  else return;
  stressPicked = null; stressFeedback = ''; render(); savePosition();
});
app.addEventListener('dragend', event => { event.target.closest('[data-battle-rank]')?.classList.remove('is-dragging'); });
app.addEventListener('click', event => {
  const toggle = event.target.closest('.perfection-toggle');
  if (!toggle) return;
  const expanded = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.closest('.perfection-detail').classList.toggle('is-open', expanded);
});
app.addEventListener('change', event => {
  if (!event.target.matches('[data-perfection-choice]')) return;
  const value = Number(event.target.dataset.perfectionChoice);
  perfectionChoices = event.target.checked ? [...new Set([...perfectionChoices, value])] : perfectionChoices.filter(i => i !== value);
  document.querySelector('[data-action="perfection-check"]').disabled = perfectionChoices.length === 0;
  document.querySelector('.perfection-feedback').textContent = '';
  document.querySelector('[data-action="perfection-finish"]')?.remove();
  savePosition();
});
app.addEventListener('close', () => { queueMicrotask(savePosition); }, true);
render();
try {
  const saved = JSON.parse(localStorage.getItem(progressKey));
  if (saved && typeof saved === 'object') {
    awaitingResume = true;
    const dialog = document.querySelector('#location-dialog');
    dialog.innerHTML = `<h2 id="location-title">Продолжить прохождение?</h2><p>Можно вернуться к тому, на чём остановились, или начать курс сначала.</p><div class="actions">${button('Начать сначала','restart-course','secondary')}${button('Продолжить','resume-course')}</div>`;
    dialog.addEventListener('cancel', event => event.preventDefault());
    dialog.showModal();
  }
} catch {}


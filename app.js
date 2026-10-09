'use strict';
const STORAGE_KEY = 'naka-pass.v1';
const stores = [
 {id:'mybasket',name:'まいばすけっと',icon:'🛒',app:'iAEON',url:'https://www.aeon.com/',payment:'いつもの決済'},
 {id:'seven',name:'セブン',icon:'7',app:'セブン',url:'https://www.sej.co.jp/',payment:'nanaco'},
 {id:'lawson',name:'ローソン',icon:'24',app:'ローソン',url:'https://www.lawson.co.jp/',payment:'いつもの決済'},
 {id:'yokado',name:'イトーヨーカドー',icon:'🏬',app:'ヨーカドー',url:'https://www.itoyokado.co.jp/',payment:'nanaco'},
 {id:'matsukiyo',name:'マツキヨ',icon:'薬',app:'マツキヨ',url:'https://www.matsukiyococokara.com/',payment:'いつもの決済'}
];
const cards = [
 ['iaeon','iAEON','まいばすで使用'],['seven','セブンアプリ','セブンで使用'],['nanaco','nanaco','セブン・ヨーカドーで使用'],['lawson','ローソンアプリ','ローソンで使用'],['dpoint','dポイント','ローソン・マツキヨで使用'],['yokado','ヨーカドーアプリ','ヨーカドー・薬局で使用'],['matsukiyo','マツココアプリ','マツキヨで使用']
];
const state = {cards:{},stores:{}};
const status = document.querySelector('#status');
function message(text){status.textContent=text;}
function validURL(value){
 try { const url=new URL(value); return (url.protocol==='https:' && !url.username && !url.password) || (/^[a-z][a-z0-9+.-]*:$/i.test(url.protocol) && !['http:','javascript:','data:','file:','blob:','vbscript:','about:'].includes(url.protocol) && !/[<>\s]/.test(value)); } catch{return false;}
}
try{
 const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
 if(saved && typeof saved==='object'){
  for(const [id] of cards) if(typeof saved.cards?.[id]==='boolean') state.cards[id]=saved.cards[id];
  for(const store of stores){const item=saved.stores?.[store.id];if(item && typeof item==='object') state.stores[store.id]={payment:typeof item.payment==='string' && item.payment.trim()?item.payment.slice(0,60):store.payment,url:typeof item.url==='string' && validURL(item.url)?item.url:store.url};}
 }
}catch{message('保存済み設定を読み込めませんでした。この画面では初期設定を使います。');}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{message('端末に保存できませんでした。ブラウザの保存設定や空き容量を確認してください。この画面では変更を使えます。');return false;}}
function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function renderStores(){
 const list=document.querySelector('#stores');list.replaceChildren();
 for(const store of stores){
  const settings=state.stores[store.id]||store;
  const article=element('article',`store ${store.id}`);
  const title=element('div','store-title');const icon=element('span','store-icon',store.icon);icon.setAttribute('aria-hidden','true');title.append(icon);
  const name=element('div');name.append(element('h3','',store.name));if(store.id==='yokado')name.append(element('span','badge','薬局も同じ'));title.append(name);article.append(title);
  const rows=store.id==='mybasket'?[['出す','iAEON'],['払う',settings.payment]]:store.id==='seven'?[['基本',settings.payment],['連携','セブンアプリ']]:store.id==='lawson'?[['出す','dポイント'],['連携','ローソンアプリ']]:store.id==='yokado'?[['出す','ヨーカドーアプリ'],['確認','クーポン'],['払う',settings.payment]]:[['出す①','マツココ'],['出す②','dポイント']];
  if(['lawson','matsukiyo'].includes(store.id)&&settings.payment!=='いつもの決済') rows.push(['払う',settings.payment]);
  const dl=element('dl');for(const [label,value] of rows){const row=element('div');row.append(element('dt','',label),element('dd','',value));dl.append(row);}article.append(dl);
  if(store.id==='mybasket')article.append(element('p','point-note','WAON POINT'));
  const link=element('a','open-link',`${store.app}を開く ↗`);link.href=settings.url;link.target=settings.url.startsWith('https:')?'_blank':'_self';link.rel='noopener noreferrer';link.setAttribute('aria-label',`${store.name}：${store.app}を開く`);article.append(link);
  article.append(element('p','link-caption',settings.url.startsWith('https:')?'公式Webページへ':(settings.url.startsWith('shortcuts:')?'iPhoneのショートカットを実行':'設定したアプリのリンクへ')));list.append(article);
 }
}
function renderCards(){
 const list=document.querySelector('#card-list');
 for(const [id,name,description] of cards){
  const row=element('div','card-row');const text=element('div');text.append(element('strong','',name),element('p','',description));const label=element('label','switch-label');const caption=element('span','',state.cards[id]?'登録済み':'未登録');const input=element('input');input.type='checkbox';input.role='switch';input.checked=state.cards[id]===true;input.setAttribute('aria-label',`${name}の登録状態`);input.addEventListener('change',()=>{state.cards[id]=input.checked;caption.textContent=input.checked?'登録済み':'未登録';if(save())message(`${name}を${caption.textContent}として保存しました。`);});label.append(caption,input);row.append(text,label);list.append(row);
 }
}
function renderSettings(){
 const list=document.querySelector('#settings-list');
 for(const store of stores){const settings=state.stores[store.id]||store;const box=element('fieldset','setting');const legend=element('legend','',store.name);box.append(legend);
  for(const [key,title] of [['payment','支払い方法'],['url','公式アプリ起動URL / 公式Web URL']]){const label=element('label','',title);const input=element('input');input.type='text';input.name=`${store.id}-${key}`;input.value=settings[key];input.required=true;input.maxLength=key==='payment'?60:2048;if(key==='url'){input.inputMode='url';input.autocapitalize='off';input.spellcheck=false;}label.append(input);box.append(label);}
  const shortcutName=`NAKA ${store.app}`;
  const help=element('p','shortcut-help',`ショートカット名：${shortcutName}`);
  const shortcut=element('button','shortcut-button','iPhoneのショートカットと連動');shortcut.type='button';
  shortcut.addEventListener('click',()=>{const input=box.querySelector(`[name="${store.id}-url"]`);input.value=`shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;input.setCustomValidity('');message(`「${shortcutName}」をiPhoneで作成してから、下の「設定を保存」を押してください。`);help.textContent=`連動URLを入力しました。ショートカット名：${shortcutName}（設定を保存してください）`;});
  const fallback=element('button','shortcut-button','公式Webに戻す');fallback.type='button';fallback.addEventListener('click',()=>{const input=box.querySelector(`[name="${store.id}-url"]`);input.value=store.url;input.setCustomValidity('');help.textContent='公式WebのURLを入力しました。設定を保存してください。';});
  box.append(help,shortcut,fallback);list.append(box);
 }
}
document.querySelector('#settings-form').addEventListener('submit',event=>{
 event.preventDefault();const next={};const form=event.currentTarget;
 for(const store of stores){const payment=form.elements[`${store.id}-payment`];const url=form.elements[`${store.id}-url`];payment.setCustomValidity(payment.value.trim()?'':'支払い方法を入力してください。');url.setCustomValidity(validURL(url.value.trim())?'':'HTTPSのURL、または確認済みアプリのURLを入力してください。');if(!payment.reportValidity()||!url.reportValidity())return;next[store.id]={payment:payment.value.trim(),url:url.value.trim()};}
 state.stores=next;renderStores();if(save())message('設定を保存しました。ホームに反映されています。');
});
document.querySelector('#settings-form').addEventListener('input',event=>event.target.setCustomValidity(''));
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>{for(const id of ['home','cards','settings'])document.getElementById(id).hidden=id!==button.dataset.view;for(const tab of document.querySelectorAll('[data-view]')){if(tab===button)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');}message('');window.scrollTo(0,0);});
renderStores();renderCards();renderSettings();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>message('オフライン用の保存ができませんでした。オンラインではそのまま使えます。'));

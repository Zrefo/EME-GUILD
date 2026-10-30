/* Structured article rendering: no stored HTML is executed. */
(() => {
 'use strict';
 const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
 function safeLink(value){if(typeof value!=='string'||value.length>2048)return '';try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}}
 function render(host,blocks){
  host.replaceChildren();let list=null;
  for(const block of blocks||[]){
   const tag={paragraph:'p',heading:'h2',subheading:'h3',bullet:'li',quote:'blockquote'}[block.type]||'p';
   const el=node(tag);for(const run of block.runs||[]){let child=document.createTextNode(run.text||'');if(run.italic){const e=node('em');e.append(child);child=e;}if(run.bold){const e=node('strong');e.append(child);child=e;}if(safeLink(run.href)){const a=node('a');a.href=safeLink(run.href);a.target='_blank';a.rel='noopener noreferrer';a.append(child);child=a;}el.append(child);}
   if(tag==='li'){if(!list){list=node('ul');host.append(list);}list.append(el);}else{list=null;host.append(el);}
  }
 }
 function read(editor){
  const blocks=[];let current=null;
  const flush=()=>{if(current){blocks.push(current);current=null;}};
  function walk(n,marks={},type='paragraph'){
   if(n.nodeType===3){if(!n.textContent)return;current||={type,runs:[]};const last=current.runs.at(-1);if(last&&last.bold===!!marks.bold&&last.italic===!!marks.italic&&(last.href||'')===(marks.href||''))last.text+=n.textContent;else current.runs.push({text:n.textContent,bold:!!marks.bold,italic:!!marks.italic,...(marks.href?{href:marks.href}:{})});return;}
   if(n.nodeType!==1)return;
   const tag=n.tagName;if(['SCRIPT','STYLE','IFRAME','OBJECT','IMG','SVG'].includes(tag))return;
   if(tag==='BR'){walk(document.createTextNode('\n'),marks,type);return;}
   const block=['P','DIV','H1','H2','H3','H4','LI','BLOCKQUOTE'].includes(tag);
   const nextType=['H1','H2'].includes(tag)?'heading':['H3','H4'].includes(tag)?'subheading':tag==='LI'?'bullet':tag==='BLOCKQUOTE'?'quote':type;
   if(block)flush();
   const next={bold:marks.bold||['B','STRONG'].includes(tag),italic:marks.italic||['I','EM'].includes(tag),href:tag==='A'?safeLink(n.getAttribute('href')):marks.href};
   for(const child of n.childNodes)walk(child,next,nextType);
   if(block)flush();
  }
  for(const child of editor.childNodes)walk(child);flush();return blocks;
 }
 function author(host,date,views){
  host.replaceChildren();const img=node('img');img.src='https://mc-heads.net/avatar/Zrefo/96';img.alt='Zrefo';img.width=40;img.height=40;img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{img.src='/assets/images/eme-logo.png';},{once:true});host.append(img);
  const details=node('div');details.append(node('strong','Zrefo'));const meta=[];
  if(date)meta.push(new Intl.DateTimeFormat('en',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date)));
  if(typeof views==='number')meta.push(new Intl.NumberFormat('en').format(views)+(views===1?' view':' views'));details.append(node('span',meta.join(' · ')||'EME Founder'));host.append(details);
 }
 function summary(post){
  const change=post.category==='changelog',card=node('article',undefined,'news-card');card.dataset.category=post.category;
  const a=node('a',undefined,'news-card-link');a.href='/news/?post='+encodeURIComponent(post.id);a.setAttribute('aria-label','Read article: '+post.title);
  const art=node('div',undefined,'news-card-art');art.setAttribute('aria-hidden','true');
  const icon=node('span',change?'</>':'↗','news-card-symbol');art.append(icon,node('span',change?'BUILDING BETTER':'FROM THE GUILD','news-card-art-label'));
  const body=node('div',undefined,'news-card-body');body.append(node('span',change?'CHANGELOG':'ANNOUNCEMENT','news-category'),node('h2',post.title),node('p',post.excerpt||'Discover the latest news and updates from the EME community.','news-excerpt'));
  const by=node('div',undefined,'post-author');author(by,post.publishedAt,post.views);body.append(by);
  const footer=node('div',undefined,'news-card-footer');footer.append(node('span','Read article'),node('span','↗','news-card-arrow'));body.append(footer);
  a.append(art,body);card.append(a);return card;
 }
 window.EMEPosts={render,read,author,summary,node,safeLink};
})();

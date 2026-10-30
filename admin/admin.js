(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let base='';
 try {if(window.EME_ADMIN_ORIGIN){const u=new URL(window.EME_ADMIN_ORIGIN);if(u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw Error();base=u.origin;}}catch{$('status').textContent='Invalid API URL in admin-config.js.';return;}
 let accessToken='',data=null,player='',guild='',busy=false;const dirty=new Set();
 const status=(text,error=false)=>{$('status').textContent=text;$('status').dataset.error=String(error);};
 let newsroom=null;
 function signedOut(){newsroom?.reset();accessToken='';data=null;$('workspace').hidden=true;$('logout').hidden=true;$('login').hidden=false;}
 async function api(url,method='GET',body){
  if(!base)throw Error('Set the API URL in assets/js/admin-config.js first.');
  let r;try{r=await fetch(base+url,{method,credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(12000),headers:{...(accessToken?{Authorization:'Bearer '+accessToken}:{}),...(method==='GET'?{}:{'Content-Type':'application/json'})},...(body?{body:JSON.stringify(body)}:{})});}catch{throw Error('Cannot connect to Cloudflare. Check your connection and Worker settings.');}
  let d;try{d=await r.json();}catch{throw Error('The API returned an invalid response. Check the server URL.');}
  if(!r.ok){if(r.status===401)signedOut();throw Error(d.error||'The operation could not be completed.');}return d;
 }
 async function load(){data=await api('/api/admin/content');$('players').replaceChildren();Object.keys(data.badges).forEach(name=>{const o=document.createElement('option');o.value=name;$('players').append(o);});$('guild-select').replaceChildren(new Option('Choose a guild',''));data.allies.forEach(g=>$('guild-select').append(new Option(g.name,g.name)));$('guild-select').value=guild;await newsroom.load();}
 function discard(kind){if(newsroom?.isBusy()){status('Wait for the post to finish saving.',true);return false;}return !(kind?dirty.has(kind):dirty.size)||confirm('You have unsaved changes. Discard them?');}
 function badgeForm(){const name=$('nickname').value.trim();if(!/^[A-Za-z0-9_]{1,16}$/.test(name))return;player=name;const key=Object.keys(data.badges).find(k=>k.toLowerCase()===name.toLowerCase());const assigned=data.badges[key]?.badges||[];$('editing-player').textContent='Badges for: '+name;$('badge-options').replaceChildren();for(const [id,b]of Object.entries(data.definitions)){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=id;input.checked=assigned.includes(id);label.append(input,document.createTextNode(b.label));$('badge-options').append(label);}$('badges-form').hidden=false;dirty.delete('badges');playerPreview();}
 function guildForm(){const g=data.allies.find(x=>x.name===guild);$('guild-form').hidden=!g;if(g)for(const key of ['logo','profileUrl','description','requirements'])$(key).value=g[key]||'';dirty.delete('guild');guildPreview();}
 async function save(kind,body){if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);status('Saving…');try{const result=await api('/api/admin/'+kind,'PUT',{...body,version:data.version});data.version=result.version;if(kind==='badges'){const key=Object.keys(data.badges).find(k=>k.toLowerCase()===body.name.toLowerCase())||body.name;data.badges[key]={badges:body.badges};}else if(kind==='definitions'){data.definitions[result.definition.id]=result.definition;const selected=[...$('badge-options').querySelectorAll('input:checked')].map(x=>x.value);const wasDirty=dirty.has('badges');if(player){badgeForm();for(const input of $('badge-options').querySelectorAll('input'))input.checked=selected.includes(input.value);if(wasDirty)dirty.add('badges');playerPreview();}$('definition-form').reset();definitionPreview();}else Object.assign(data.allies.find(g=>g.name===body.name),body);dirty.delete(kind);status('Saved. Your changes are now available on the website.');}catch(e){status(e.message,true);}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
 $('lookup').addEventListener('submit',e=>{e.preventDefault();if(data&&discard('badges'))badgeForm();});
 $('nickname').addEventListener('change',()=>{if(!discard('badges')){$('nickname').value=player;return;}dirty.delete('badges');$('badges-form').hidden=true;player='';});
 $('guild-select').addEventListener('change',()=>{if(!discard('guild')){$('guild-select').value=guild;return;}guild=$('guild-select').value;guildForm();});
 for(const id of ['badges-form','guild-form'])$(id).addEventListener('input',()=>dirty.add(id==='badges-form'?'badges':'guild'));
 $('badges-form').addEventListener('submit',e=>{e.preventDefault();if(player)save('badges',{name:player,badges:[...$('badge-options').querySelectorAll('input:checked')].map(x=>x.value)});});
 $('guild-form').addEventListener('submit',e=>{e.preventDefault();if(guild)save('guild',{name:guild,...Object.fromEntries(['logo','profileUrl','description','requirements'].map(k=>[k,$(k).value]))});});
 $('reload').addEventListener('click',async()=>{if(!discard())return;try{await load();if(player)badgeForm();if(guild)guildForm();$('definition-form').reset();definitionPreview();newsroom.reset();await newsroom.load();dirty.clear();status('Loaded the latest data.');}catch(e){status(e.message,true);}});
 $('logout').addEventListener('click',async()=>{if(!discard())return;try{await api('/api/logout','POST');dirty.clear();signedOut();status('Signed out.');}catch(e){status(e.message,true);}});
 addEventListener('beforeunload',e=>{if(dirty.size){e.preventDefault();e.returnValue='';}});

 function safeURL(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}}
 function renderLogo(el,name,url){const key=name+'|'+url;if(el.dataset.key===key)return;el.dataset.key=key;el.textContent=name.slice(0,1).toUpperCase();if(!url)return;const img=new Image();img.alt='';img.referrerPolicy='no-referrer';img.onload=()=>{if(el.dataset.key===key)el.replaceChildren(img);};img.onerror=()=>{if(el.dataset.key===key&&el.id==='preview-logo')$('logo-feedback').textContent='Image unavailable. The guild initial will be shown instead.';};img.src=url;}
 function guildPreview(){if(!guild)return;const url=safeURL($('logo').value.trim());$('logo-feedback').textContent=$('logo').value&&!url?'Enter a valid HTTP or HTTPS image URL.':'';renderLogo($('preview-logo'),guild,url);renderLogo($('preview-list-logo'),guild,url);$('preview-name').textContent=guild;$('preview-list-name').textContent=guild;for(const key of ['description','requirements'])$('preview-'+key).textContent=$(key).value.trim()||'This information has not been provided yet.';const link=$('preview-profile-link');link.href=safeURL($('profileUrl').value.trim())||'https://hylexmc.net/guilds/'+encodeURIComponent(guild);}
 function playerPreview(){const host=$('player-preview');host.replaceChildren();for(const input of $('badge-options').querySelectorAll('input:checked')){const b=data.definitions[input.value];if(b)host.append(window.EMEBadges.badgeElement(b));}if(!host.childElementCount)host.textContent='No special badges selected.';}
 function definitionPreview(){const b={label:$('badge-label').value.trim()||'YOUR BADGE',title:$('badge-title').value.trim()||'Your custom badge',color:$('badge-color').value,logo:safeURL($('badge-logo').value.trim())};$('definition-preview').replaceChildren(window.EMEBadges.badgeElement(b));$('definition-preview-title').textContent=b.title;$('definition-preview-description').textContent=$('badge-description').value.trim()||'Your badge description will appear here.';}
 $('badges-form').addEventListener('input',playerPreview);
 let previewTimer; $('guild-form').addEventListener('input',()=>{clearTimeout(previewTimer);previewTimer=setTimeout(guildPreview,180);});
 let definitionTimer; $('definition-form').addEventListener('input',()=>{dirty.add('definitions');clearTimeout(definitionTimer);definitionTimer=setTimeout(definitionPreview,180);});
 $('definition-form').addEventListener('submit',e=>{e.preventDefault();save('definitions',{id:'custom_'+$('badge-id').value.trim(),label:$('badge-label').value.trim(),title:$('badge-title').value.trim(),color:$('badge-color').value,logo:$('badge-logo').value.trim(),description:$('badge-description').value.trim()});});
 definitionPreview();
 newsroom=window.EMEPostAdmin({api,status,dirty});
 const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
 $('discord-login').addEventListener('click',async e=>{
  e.preventDefault();
  if(!base){status('Set the public API URL in assets/js/admin-config.js first.',true);return;}
  if(location.protocol==='file:'){status('Open the website through Live Server instead of opening the HTML file directly.',true);return;}
  try{
   const verifier=random(),state=random();
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
   const challenge=btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
   sessionStorage.setItem('eme-login-pending',JSON.stringify({verifier,state,expires:Date.now()+600000}));
   const url=new URL('/auth/discord',base);url.search=new URLSearchParams({origin:location.origin,state,challenge});location.assign(url.href);
  }catch{status('Cannot start sign-in. Use HTTPS or Live Server on localhost and enable session storage.',true);}
 });
 (async()=>{
  signedOut();
  const params=new URLSearchParams(location.hash.slice(1));
  if(location.pathname.endsWith('/callback.html'))history.replaceState(null,'','/admin/');
  else if(location.hash)history.replaceState(null,'',location.pathname);
  if(!params.has('code')&&!params.has('error')){status(base?'Sign in to manage EME.':'Set the API URL in assets/js/admin-config.js to enable sign-in.');return;}
  try{
   const pending=JSON.parse(sessionStorage.getItem('eme-login-pending')||'null');sessionStorage.removeItem('eme-login-pending');
   if(!pending||pending.expires<Date.now()||params.get('state')!==pending.state)throw Error('Sign-in expired. Please start again.');
   if(params.has('error'))throw Error(params.get('error')==='denied'?'This Discord account does not have access.':'Sign-in cancelled.');
   status('Completing sign-in…');
   const result=await api('/api/exchange','POST',{code:params.get('code'),verifier:pending.verifier});
   accessToken=result.token;await load();$('identity').textContent='SIGNED IN: '+result.user.name;$('login').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;status('Ready. Choose a player or guild.');
  }catch(e){signedOut();status(e.message,true);}
 })();
})();

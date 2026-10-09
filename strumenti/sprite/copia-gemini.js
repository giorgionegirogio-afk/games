/* copia-gemini.js — da incollare (o passare a javascript_tool) nella pagina di
   Gemini: aggiunge un pannello con un pulsante «COPIA Mn» per ogni risposta
   che contiene un'immagine grande (>=512 px). Il click VERO sul pulsante
   (serve il gesto utente: navigator.clipboard.write lo esige) ridisegna
   l'immagine su una tela e la copia negli appunti come PNG; poi
   salva-appunti.ps1 la scrive su disco. window.__esito dice com'e' andata.
   Restituisce le coordinate degli ultimi pulsanti, per cliccarli. */
document.getElementById('__salva')?.remove();
const ms=[...document.querySelectorAll('model-response')];
const pan=document.createElement('div'); pan.id='__salva';
pan.style.cssText='position:fixed;left:8px;top:70px;z-index:2147483647;background:#111;padding:6px;border-radius:8px;font:13px monospace;color:#fff';
window.__esito='(niente)'; const out=[];
ms.forEach((m,i)=>{ const im=m.querySelector('img'); if(!im||im.naturalWidth<512) return;
  const b=document.createElement('button'); b.textContent='COPIA M'+(2*i+1);
  b.style.cssText='display:block;padding:4px 10px;margin:2px;background:#26a;color:#fff;border:0;border-radius:4px;cursor:pointer';
  b.onclick=()=>{ const c=document.createElement('canvas'); c.width=im.naturalWidth; c.height=im.naturalHeight;
    c.getContext('2d').drawImage(im,0,0);
    c.toBlob(async bl=>{ try{ await navigator.clipboard.write([new ClipboardItem({'image/png':bl})]);
        window.__esito='copiato M'+(2*i+1)+' '+bl.size; b.style.background='#2a6'; }
      catch(e){ window.__esito='ERR '+e.message; b.style.background='#a22'; } },'image/png'); };
  pan.appendChild(b); });
document.body.appendChild(pan);
[...pan.querySelectorAll('button')].forEach(b=>{ const r=b.getBoundingClientRect(); out.push({n:b.textContent, x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)}); });
out.slice(-3)

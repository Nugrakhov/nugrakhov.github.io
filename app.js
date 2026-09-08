/* Haron Engine — JRA x Zodiak rule engine */
'use strict';

const ZODIACS = [
  { key:'aries', name:'Aries', symbol:'♈', jp:'牡羊座', color:{waku:3,id:'Merah',hex:'#e5484d'}, lucky:[3,7], dates:[[3,21],[4,19]] },
  { key:'taurus', name:'Taurus', symbol:'♉', jp:'牡牛座', color:{waku:5,id:'Kuning',hex:'#f5c451'}, lucky:[5,8], dates:[[4,20],[5,20]] },
  { key:'gemini', name:'Gemini', symbol:'♊', jp:'双子座', color:{waku:6,id:'Hijau',hex:'#46c26a'}, lucky:[2,6], dates:[[5,21],[6,21]] },
  { key:'cancer', name:'Cancer', symbol:'♋', jp:'蟹座', color:{waku:1,id:'Putih',hex:'#e8ecf5'}, lucky:[4,9], dates:[[6,22],[7,22]] },
  { key:'leo', name:'Leo', symbol:'♌', jp:'獅子座', color:{waku:7,id:'Oranye',hex:'#ff8a3d'}, lucky:[1,5], dates:[[7,23],[8,22]] },
  { key:'virgo', name:'Virgo', symbol:'♍', jp:'乙女座', color:{waku:4,id:'Biru',hex:'#3e8bff'}, lucky:[6,11], dates:[[8,23],[9,22]] },
  { key:'libra', name:'Libra', symbol:'♎', jp:'天秤座', color:{waku:8,id:'Pink',hex:'#ff6b9d'}, lucky:[7,12], dates:[[9,23],[10,23]] },
  { key:'scorpio', name:'Scorpio', symbol:'♏', jp:'蠍座', color:{waku:2,id:'Hitam',hex:'#2b2f3a'}, lucky:[8,10], dates:[[10,24],[11,22]] },
  { key:'sagittarius', name:'Sagitarius', symbol:'♐', jp:'射手座', color:{waku:3,id:'Merah',hex:'#e5484d'}, lucky:[9,3], dates:[[11,23],[12,21]] },
  { key:'capricorn', name:'Capricorn', symbol:'♑', jp:'山羊座', color:{waku:4,id:'Biru',hex:'#3e8bff'}, lucky:[10,2], dates:[[12,22],[1,19]] },
  { key:'aquarius', name:'Aquarius', symbol:'♒', jp:'水瓶座', color:{waku:6,id:'Hijau',hex:'#46c26a'}, lucky:[11,4], dates:[[1,20],[2,18]] },
  { key:'pisces', name:'Pisces', symbol:'♓', jp:'魚座', color:{waku:5,id:'Kuning',hex:'#f5c451'}, lucky:[12,1], dates:[[2,19],[3,20]] },
];

const WAKU = { 1:{id:'Putih',hex:'#e8ecf5',fg:'#111'}, 2:{id:'Hitam',hex:'#23262e',fg:'#fff'}, 3:{id:'Merah',hex:'#e5484d',fg:'#fff'}, 4:{id:'Biru',hex:'#3e8bff',fg:'#fff'}, 5:{id:'Kuning',hex:'#f5c451',fg:'#241300'}, 6:{id:'Hijau',hex:'#46c26a',fg:'#06240f'}, 7:{id:'Oranye',hex:'#ff8a3d',fg:'#2b1000'}, 8:{id:'Pink',hex:'#ff6b9d',fg:'#2b0012'} };

const TICKETS = {
  TRIO:  { label:'TRIO (Trio / Trifecta)', jp:'三連複・三連単', desc:'Pilih 3 kuda. Trio = tanpa urutan, Trifecta = urutan tepat 1-2-3.', need:3 },
  EXACTA:{ label:'EXACTA (Umaren-tan)', jp:'馬連・馬単', desc:'Pilih 2 kuda. Quinella=tanpa urutan, Exacta=urutan tepat 1-2.', need:2 },
  QUINELLA:{ label:'QUINELLA (Umaren)', jp:'馬連', desc:'Pilih 2 kuda tanpa urutan — cukup masuk 1-2.', need:2 },
  QP:    { label:'QUINELLA PLACE (Wide)', jp:'ワイド', desc:'Pilih 2 kuda — cukup keduanya masuk 3 besar.', need:2 },
};

function ticketForRank(r){
  if (r<=3) return 'TRIO';
  if (r<=6) return 'EXACTA';
  if (r<=9) return 'QUINELLA';
  return 'QP';
}

function getZodiac(m, d){
  for (const z of ZODIACS){

    const [[m1,d1],[m2,d2]] = z.dates;
    if (m1===12){ if ((m===12&&d>=d1)||(m===1&&d<=d2)) return z; }
    else if (m1===1 && m2===2){ if ((m===1&&d>=d1)||(m===2&&d<=d2)) return z; }
    else { if ((m===m1&&d>=d1)||(m===m2&&d<=d2)) return z; }
  }
  return ZODIACS[0];
}

function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
function mulberry(seed){ let a=seed>>>0; return function(){ a|=0;a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function seededShuffle(arr, seed){ const r=mulberry(seed); const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function dailyRanking(dateStr){
  const order = seededShuffle(ZODIACS.map(z=>z.key), hashStr('haron-rank:'+dateStr));
  const map = {}; order.forEach((k,i)=>map[k]=i+1);
  return { order, map };
}

function state(){ return { horses: [], variation: 0 }; }
const S = state();

const $ = id => document.getElementById(id);

function todayISO(){ const t=new Date(); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); }

function initDates(){
  const rd = $('raceDate'); if(!rd.value) rd.value = nextSundayISO() || todayISO();
  $('raceDayPill').textContent = 'Race Day ' + rd.value;
  rd.addEventListener('change', ()=>{ $('raceDayPill').textContent='Race Day '+rd.value; });
}

function nextSundayISO(){
  const t=new Date(); const d=new Date(t);
  d.setDate(t.getDate()+((7-t.getDay())%7));
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function horseRows(){ return [...document.querySelectorAll('#horseBody tr')]; }
function readHorses(){
  const out=[];
  for(const tr of horseRows()){
    const no=parseInt(tr.querySelector('.in-no').value,10);
    const waku=parseInt(tr.querySelector('.in-waku').value,10);
    const name=tr.querySelector('.in-name').value.trim();
    const jockey=tr.querySelector('.in-jockey').value.trim();
    if(!no||!waku) continue;
    out.push({ no, waku, name:name||('Kuda '+no), jockey:jockey||'-' });
  }
  out.sort((a,b)=>a.no-b.no);
  S.horses=out; return out;
}

function addHorseRow(h){
  const tb=$('horseBody'); const tr=document.createElement('tr');
  const n = h?.no ?? (tb.rows.length+1);
  tr.innerHTML =
    '<td><input class="num in-no" type="number" min="1" max="18" value="'+n+'"></td>'+
    '<td><input class="num in-waku" type="number" min="1" max="8" value="'+(h?.waku ?? (n<=2?1:n<=4?2:n<=6?3:n<=8?4:n<=10?5:n<=12?6:n<=14?7:8))+'"></td>'+
    '<td><input class="in-name" value="'+esc(h?.name??'')+'" placeholder="Nama kuda"></td>'+
    '<td><input class="in-jockey" value="'+esc(h?.jockey??'')+'" placeholder="Joki"></td>'+
    '<td><button class="del-btn" title="Hapus">×</button></td>';
  tr.querySelector('.del-btn').onclick=()=>tr.remove();
  tb.appendChild(tr);
}

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }

function loadSample(){
  $('horseBody').innerHTML='';
  const names=[['Equinox','C. Lemaire'],['Liberty Island','Y. Kawada'],['Do Deuce','Y. Take'],['Stars On Earth','K. Tosaki'],['Titleholder','T. Yokoyama'],['Efforia','T. Yokoyama'],['Daring Tact','K. Matsuyama'],['Contrail','Y. Fukunaga'],['Gran Alegria','C. Lemaire'],['Almond Eye','C. Lemaire'],['Orfevre','K. Ikezoe'],['Deep Impact','Y. Take']];
  names.forEach((nm,i)=>{
    const no=i+1;
    const waku = no<=2?1:no<=4?2:no<=6?3:no<=8?4:no<=10?5:6;
    addHorseRow({no, waku, name:nm[0], jockey:nm[1]});
  });
  $('raceMeta').textContent='Contoh race: Tokyo 11R · 12 kuda · edit bebas sesuai racecard asli.';
  setStatus('Contoh race dimuat — 12 kuda siap diramal.');
}

function parseRaceUrl(url){
  if(!url) return null;
  try{
    const u=new URL(url);
    if(u.hostname.includes('netkeiba')){
      const id=u.searchParams.get('race_id');
      if(id&&/^\d{12}$/.test(id)) return {site:'netkeiba', id, venue:'—', raceNo:parseInt(id.slice(-2),10), date:id.slice(0,4)+'-'+id.slice(4,6)+'-'+id.slice(6,8)};
    }
    if(u.hostname.includes('umanity')){
      const code=u.searchParams.get('code');
      if(code&&/^\d{16}$/.test(code)) return {site:'umanity', id:code, venue:'—', raceNo:parseInt(code.slice(-2),10), date:code.slice(0,4)+'-'+code.slice(4,6)+'-'+code.slice(6,8)};
      const m=url.match(/race_(\d+)/); if(m) return {site:'umanity', id:m[1], raceNo:parseInt(m[1],10)};
    }
  }catch(e){ return null; }
  return null;
}

async function fetchRacecard(){
  const url=$('raceUrl').value.trim();
  const info=parseRaceUrl(url);
  if(!info){ setStatus('URL tidak dikenali. Gunakan link shutuba netkeiba / race umanity, atau tempel HTML manual.'); return; }
  setStatus('Mencoba mengambil '+info.site+' ('+info.id+') …');
  const html = await tryFetchHtml(url, (msg)=>setStatus(msg));
  if(html){
    // Jina Reader mengembalikan markdown, bukan HTML — parse khusus
    if(html.via==='jina'){
      const horses = parseJinaMarkdown(html.text);
      if(horses.length>=2){
        $('horseBody').innerHTML=''; horses.forEach(addHorseRow);
        $('raceMeta').textContent='Sumber: '+info.site+' via Jina Reader · '+horses.length+' kuda (verifikasi dengan situs asli).';
        if(info.date) $('raceDate').value=info.date;
        setStatus('Berhasil via Jina Reader ('+horses.length+' kuda). Kalau ada nama janggal, cek situs asli ya~ 🎲');
        return;
      }
      // Jina dapat tapi parse gagal — taruh teksnya di kolom tempel agar user bisa bantu
      $('pasteHtml').value=html.text.slice(0,60000);
      setStatus('Jina Reader terhubung tapi tabel tak dikenali — teksnya sudah kutaruh di kolom HTML, klik Parse HTML Tempelan atau isi manual.');
      return;
    }
    const horses = info.site==='umanity' ? parseUmanity(html.text) : parseNetkeiba(html.text);
    const finalHorses = horses.length>=2 ? horses : parseShutuba(html.text);
    if(finalHorses.length>=2){
      $('horseBody').innerHTML=''; finalHorses.forEach(addHorseRow);
      $('raceMeta').textContent='Sumber: '+info.site+' via '+html.via+' · ID '+info.id+' · '+finalHorses.length+' kuda (verifikasi dengan situs asli).';
      if(info.date) $('raceDate').value=info.date;
      setStatus('Berhasil memuat '+finalHorses.length+' kuda via '+html.via+'. 🎲');
      return;
    }
    setStatus('Halaman terambil via '+html.via+' tapi tabel kuda tidak dikenali — gunakan Parse HTML Tempelan / isi manual.');
    return;
  }
  setStatus('Auto-fetch diblokir semua jalur (CORS/anti-bot/WAF). Solusi: (1) buka URL → Ctrl+U → copy → tempel ke kolom HTML → Parse HTML Tempelan, atau (2) isi tabel manual.');
}

/* Multi-jalur: proxy lokal dulu (paling stabil), lalu proxy publik.
   Mengembalikan {text, via} atau null. */
async function tryFetchHtml(url, onStep){
  const step=(m)=>{ try{onStep&&onStep(m);}catch(e){} };
  async function getText(fetchUrl, timeoutMs){
    const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const r=await fetch(fetchUrl,{signal:ctrl.signal});
      if(!r.ok) return null;
      const txt=await r.text();
      return txt&&txt.length>2000 ? txt : null;
    }catch(e){ return null; }finally{ clearTimeout(t); }
  }
  // 1) direct
  step('Jalur 1/10: direct…');
  try{
    const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(), 8000);
    const r=await fetch(url,{signal:ctrl.signal}); clearTimeout(t);
    if(r.ok){ const txt=await r.text(); if(txt&&txt.length>5000) return {text:txt, via:'direct'}; }
  }catch(e){}
  // 2) proxy lokal (paling stabil — jalankan `node proxy.js` di terminal)
  step('Jalur 2/10: local-proxy…');
  const localTxt=await getText('http://localhost:8080/?url='+encodeURIComponent(url), 20000);
  if(localTxt) return {text:localTxt, via:'local-proxy'};
  // 3-9) proxy publik
  const proxies=[
    ['allorigins-get', 'https://api.allorigins.win/get?url='+encodeURIComponent(url), true],
    ['allorigins-raw','https://api.allorigins.win/raw?url='+encodeURIComponent(url), false],
    ['corsproxy.io',   'https://corsproxy.io/?url='+encodeURIComponent(url), false],
    ['codetabs',       'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(url), false],
    ['cors.lol',       'https://api.cors.lol/?url='+encodeURIComponent(url), false],
    ['isomorphic-git', 'https://cors.isomorphic-git.org/'+url, false],
    ['corsfix',        'https://proxy.corsfix.com/?'+encodeURIComponent(url), false],
  ];
  let i=3;
  for(const [name, purl, isJson] of proxies){
    step('Jalur '+(i++)+'/10: '+name+'…');
    try{
      const txt = isJson
        ? await (async()=>{ const t=await getText(purl,15000); if(!t) return null;
            try{ const j=JSON.parse(t); return (j.contents&&j.contents.length>2000)?j.contents:null; }catch(e){ return null; } })()
        : await getText(purl,15000);
      if(txt) return {text:txt, via:name};
    }catch(e){}
  }
  // 10) Jina Reader
  step('Jalur 10/10: jina-reader…');
  const jinaTxt=await getText('https://r.jina.ai/http://'+url, 20000);
  if(jinaTxt) return {text:jinaTxt, via:'jina'};
  return null;
}

/* Parse markdown Jina: cari baris tabel shutuba netkeiba/umanity.
   Format umum: | BK | PP | Horse Name | ... | Jockey | atau | 1 | 1 | EQUINOX | ... */
function parseJinaMarkdown(md){
  const out=[];
  const lines=String(md).split('\n');
  let inTable=false;
  for(const ln of lines){
    const trimmed=ln.trim();
    // deteksi heading tabel (header row)
    if(/^\|?\s*(BK|Waku|Bracket|Draw|枠)\s*\|/.test(trimmed)||/^\|?\s*(PP|No|Num|馬番|Horse\s*No)\s*\|/.test(trimmed)){
      inTable=true; continue;
    }
    // baris pemisah markdown (|---|...)
    if(/^\|?\s*[-:]+\s*\|/.test(trimmed)&&inTable) continue;
    // baris kosong -> keluar dari tabel
    if(!trimmed){ inTable=false; continue; }
    if(!inTable) continue;
    // kolom: | BK | PP | HorseName | ... | Jockey | ... | Weight |
    const cols=trimmed.split('|').map(c=>c.trim()).filter(c=>c!=='');
    if(cols.length<3) continue;
    // cari kolom nomor
    let bk=NaN, pp=NaN, name='', jockey='';
    for(let i=0;i<cols.length;i++){
      const c=cols[i];
      const num=parseInt(c,10);
      if(!isNaN(num)&&num>=1&&num<=8&&isNaN(bk)){ bk=num; continue; }
      if(!isNaN(num)&&num>=1&&num<=18&&isNaN(pp)){ pp=num; continue; }
      // nama kuda: kapital, 3+ huruf (mungkin ada spasi), bukan angka
      if(/^[A-Z][A-Za-z'’\-\. ]{2,30}$/.test(c)&&!name&&!/^(Hanshin|Nakayama|Sapporo|Tokyo|Kyoto|Chukyo|Fukushima|Niigata|Kokura|Field|Odds|Result|Race|Horse|Jockey|Trainer|Weight|Handicap|Surface|Distance|Turf|Dirt|Class|Grade|Allowance|Maiden|Stakes|Handicap|Conditions|Course|Weather|Going|Firm|Good|Soft|Heavy|Standard)$/i.test(c)){
        name=c; continue;
      }
      // joki: bisa ada . atau spasi, bukan nama kuda
      if(!jockey&&/[A-Z][a-z.']+ [A-Z][a-z.']+/.test(c)&&c!==name){
        jockey=c; continue;
      }
    }
    if(pp>=1&&pp<=18&&name){
      out.push({no:pp, waku:(bk>=1&&bk<=8)?bk:1, name, jockey:jockey||'-'});
    }
  }
  // fallback: cari pola sederhana nomor+nama di baris manapun
  if(out.length<2){
    for(const ln of lines){
      const m=ln.match(/^\s*(\d{1,2})\s+([A-Z][A-Za-z'’\-\. ]{3,28})\s*$/);
      if(!m) continue;
      const no=parseInt(m[1],10); const name=m[2].trim();
      if(no>=1&&no<=18&&!/^(Hanshin|Nakayama|Sapporo|Tokyo|Kyoto|Field|Odds|Result|Race|Horse|Jockey|Trainer|Weight|Handicap|Surface|Distance|Turf|Dirt|Class|Grade|Conditions|Course|Weather|Going|Firm|Good|Soft|Heavy|Standard)$/i.test(name)){
        out.push({no, waku:1, name, jockey:'-'});
      }
    }
  }
  // ekstrak tanggal dari markdown
  if(out.length>=2){
    const dateMatch = String(md).match(/(?:Date|Race Date|開催日|RaceDay)[:：\s]*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i)
      || String(md).match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if(dateMatch){
      const d = dateMatch[1] && dateMatch[2] && dateMatch[3]
        ? dateMatch[1]+'-'+String(dateMatch[2]).padStart(2,'0')+'-'+String(dateMatch[3]).padStart(2,'0')
        : dateMatch[1].replace(/\//g,'-');
      if($('raceDate')&&!$('raceDate').value) $('raceDate').value=d;
    }
  }
  const seen=new Set(); return out.filter(h=>!seen.has(h.no)&&seen.add(h.no)).sort((a,b)=>a.no-b.no);
}

/* Parser netkeiba shutuba (EN & JA): table.Shutuba_Table > tr.HorseList
   td[0]=BK(waku), td[1]=PP(umaban), td.Horse_Info a=nama, td.Txt_L pertama=joki */
function parseNetkeiba(html){
  const doc=new DOMParser().parseFromString(html,'text/html');
  const out=[];
  doc.querySelectorAll('tr.HorseList').forEach(tr=>{
    const tds=[...tr.querySelectorAll('td')];
    if(tds.length<5) return;
    const waku=parseInt((tds[0].textContent||'').trim(),10);
    const no=parseInt((tds[1].textContent||'').trim(),10);
    if(!(waku>=1&&waku<=8&&no>=1&&no<=18)) return;
    const nameEl=tr.querySelector('td.Horse_Info a, dt.Horse a');
    const name=(nameEl?.textContent||'').replace(/\s+/g,' ').trim();
    if(!name||/^\d+$/.test(name)) return;
    const jockeyTds=[...tr.querySelectorAll('td.Txt_L')];
    const jockey=(jockeyTds[0]?.textContent||'-').replace(/\s+/g,' ').trim()||'-';
    out.push({no, waku, name, jockey});
  });
  // fallback generik bila markup berubah
  if(out.length<2){
    doc.querySelectorAll('table tr').forEach(tr=>{
      const tds=[...tr.querySelectorAll('td')];
      if(tds.length<5) return;
      const c0=parseInt((tds[0].textContent||'').trim(),10), c1=parseInt((tds[1].textContent||'').trim(),10);
      if(!(c0>=1&&c0<=8&&c1>=1&&c1<=18)) return;
      const a=[...tr.querySelectorAll('a')].map(x=>x.textContent.replace(/\s+/g,' ').trim()).find(t=>/[A-Za-z\u3040-\u30FF\u4E00-\u9FFF]{3,}/.test(t));
      const name=(a||'').trim();
      if(!name) return;
      out.push({no:c1, waku:c0, name, jockey:'-'});
    });
  }
  autoFillRaceDate(html);
  const seen=new Set(); return out.filter(h=>!seen.has(h.no)&&seen.add(h.no)).sort((a,b)=>a.no-b.no);
}

/* Parser khusus umanity: tabel racedata */
function parseUmanity(html){
  const doc=new DOMParser().parseFromString(html,'text/html');
  const out=[];
  doc.querySelectorAll('table tr').forEach(tr=>{
    const tds=[...tr.querySelectorAll('td')];
    if(tds.length<5) return;
    const c0=parseInt(tds[0].textContent.trim(),10), c1=parseInt(tds[1].textContent.trim(),10);
    if(!(c0>=1&&c0<=8&&c1>=1&&c1<=18)) return;
    const name=(tds[3]?.textContent||tds[2]?.textContent||'').trim().split('\n')[0];
    if(!name) return;
    out.push({no:c1, waku:c0, name, jockey:(tds[4]?.textContent||'-').trim().split('\n')[0]||'-'});
  });
  autoFillRaceDate(html);
  const seen=new Set(); return out.filter(h=>!seen.has(h.no)&&seen.add(h.no)).sort((a,b)=>a.no-b.no);
}

function parsePastedHtml(){
  const html=$('pasteHtml').value;
  if(!html||html.length<500){ setStatus('Tempel HTML sumber halaman dulu (Ctrl+U → Ctrl+A → Ctrl+C).'); return; }
  const url=$('raceUrl').value.trim();
  const info=parseRaceUrl(url);
  let horses = info?.site==='umanity' ? parseUmanity(html) : parseNetkeiba(html);
  if(horses.length<2) horses=parseShutuba(html);
  if(horses.length<2){ setStatus('Tidak menemukan tabel kuda di tempelan itu. Pastikan yang ditempel adalah view-source halaman shutuba/race, bukan halaman depan.'); return; }
  $('horseBody').innerHTML=''; horses.forEach(addHorseRow);
  $('raceMeta').textContent='Sumber: tempelan HTML manual · '+horses.length+' kuda.';
  if(info?.date) $('raceDate').value=info.date;
  setStatus('Berhasil parse '+horses.length+' kuda dari HTML tempelan.');
}

/* Ekstrak tanggal dari konten HTML/markdown: judul halaman, meta, atau breadcrumb */
function autoFillRaceDate(html){
  try{
    const txt=String(html);
    // judul halaman netkeiba: "Racecard | RaceName | YYYY-MM-DD | ..."
    const titleMatch = txt.match(/<title[^>]*>([^<]*)<\/title>/i);
    const content = titleMatch ? titleMatch[1] : txt;
    // 2026-09-06 atau 2026/09/06 atau 2026年9月6日
    let m = content.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/);
    if(!m) m = txt.match(/race_date[=:]\s*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/i);
    if(!m) m = txt.match(/RaceList_DateTitle[^>]*>(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/i);
    if(!m) m = txt.match(/RaceDay[=:]\s*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/i);
    if(m){
      const d = m[1]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[3]).padStart(2,'0');
      if($('raceDate')&&!$('raceDate').value) $('raceDate').value=d;
    }
  }catch(e){}
}

function parseShutuba(html){
  const doc=new DOMParser().parseFromString(html,'text/html');
  const out=[];
  const rows=doc.querySelectorAll('table tr');
  rows.forEach(tr=>{
    const tds=[...tr.querySelectorAll('td')];
    if(tds.length<4) return;
    const nums=tds.map(td=>td.textContent.trim());
    const no=parseInt(nums[1]||nums[0],10);
    const waku=parseInt(nums[0],10);
    if(!no||no>18||!waku||waku>8) return;
    const name=(tr.querySelector('a')?.textContent||nums[3]||nums[2]||'').trim();
    out.push({no, waku, name:name||('Kuda '+no), jockey:'-'});
  });
  const seen=new Set(); return out.filter(h=>!seen.has(h.no)&&seen.add(h.no)).sort((a,b)=>a.no-b.no);
}

function setStatus(msg){ $('fetchStatus').textContent=msg; }

function pickCombos(zodiac, rank, horses, variation){
  const rng=mulberry(hashStr('haron-combo:'+$('raceDate').value+':'+zodiac.key+':'+variation));
  const nos=horses.map(h=>h.no);
  const byNo=Object.fromEntries(horses.map(h=>[h.no,h]));
  const luckyPool=zodiac.lucky.map(n=>((n-1)%nos.length)+1);
  const luckyWaku=zodiac.color.waku;
  const wakuHorses=horses.filter(h=>h.waku===luckyWaku).map(h=>h.no);
  const ticket=ticketForRank(rank);
  const need=TICKETS[ticket].need;
  const combos=[];
  const anchor=luckyPool[0];
  function fill(base, k){
    const set=new Set(base); const cand=seededShuffle(nos.filter(n=>!set.has(n)), Math.floor(rng()*1e9));
    if(wakuHorses.length){ for(const w of seededShuffle(wakuHorses, Math.floor(rng()*1e9))){ if(set.size<k) set.add(w); } }
    for(const c of cand){ if(set.size>=k) break; set.add(c); }
    return [...set].sort((a,b)=>a-b);
  }
  const nCombos = ticket==='TRIO'?3:3;
  for(let i=0;i<nCombos;i++){
    const base = i===0 ? [anchor] : [luckyPool[i%luckyPool.length]];
    combos.push({ ticket, nums: fill(base, need), anchor: base[0] });
  }
  return { ticket, combos, byNo };
}

/* BOX maks 5 kuda: jangkar nomor lucky (selalu ikut) + prioritas waku lucky,
   sisanya seeded. Sub-kombinasi dihitung kombinatorial per tipe tiket. */
function pickBox(zodiac, rank, horses, variation){
  const ticket=ticketForRank(rank);
  const need=TICKETS[ticket].need;
  const nos=horses.map(h=>h.no);
  const byNo=Object.fromEntries(horses.map(h=>[h.no,h]));
  const size=Math.min(5, nos.length);
  const anchor=((zodiac.lucky[0]-1)%nos.length)+1;
  const luckyWaku=zodiac.color.waku;
  const pool=seededShuffle(nos, hashStr('haron-box:'+$('raceDate').value+':'+zodiac.key+':'+variation));
  const set=new Set([anchor]);
  // prioritas 1: kuda se-waku lucky (kecuali anchor sudah)
  for(const n of pool){ if(set.size>=size) break; if(byNo[n]?.waku===luckyWaku) set.add(n); }
  // prioritas 2: nomor lucky kedua
  const lucky2=((zodiac.lucky[1]-1)%nos.length)+1;
  if(set.size<size) set.add(lucky2);
  // sisanya dari pool acak
  for(const n of pool){ if(set.size>=size) break; set.add(n); }
  const members=[...set].sort((a,b)=>a-b);
  const subs=combinations(members, need);
  return { ticket, need, members, subs, anchor, byNo, cost: subs.length };
}

function combinations(arr, k){
  const res=[];
  (function rec(start, path){
    if(path.length===k){ res.push([...path]); return; }
    for(let i=start;i<arr.length;i++){ path.push(arr[i]); rec(i+1, path); path.pop(); }
  })(0, []);
  return res;
}

function boxSeparator(ticket){
  return ticket==='TRIO' ? ' — ' : (ticket==='EXACTA' ? ' → ' : ' + ');
}

function renderBox(zodiac, rank, horses){
  const box=pickBox(zodiac, rank, horses, S.variation);
  S.box=box;
  const T=TICKETS[box.ticket];
  $('boxTitle').textContent=box.ticket+' BOX · '+box.members.length+' kuda';
  $('boxInfo').textContent=T.label+' — '+subsDescription(box)+' · Semua sub-kombinasi tercakup.';
  const bm=$('boxMembers'); bm.innerHTML='';
  box.members.forEach(n=>{
    const h=box.byNo[n]; const w=WAKU[h.waku];
    const chip=document.createElement('div'); chip.className='box-chip';
    chip.innerHTML='<span class="mini-waku" style="background:'+w.hex+'">W'+h.waku+'</span><span>No.'+n+(n===box.anchor?' ⭐':'')+'</span><small>'+esc(h.name)+'</small>';
    bm.appendChild(chip);
  });
  const cost=document.createElement('span'); cost.className='box-cost';
  cost.textContent=box.cost+' titik × ¥100 = ¥'+(box.cost*100).toLocaleString('id-ID');
  bm.appendChild(cost);
  $('boxSubHead').innerHTML='Sub-kombinasi (<b>'+box.cost+' titik</b>): '+(box.ticket==='TRIO'?'trio tanpa urutan — untuk trifecta, tiap baris mencakup 6 susunan.':box.ticket==='EXACTA'?'exacta butuh urutan — tiap pasangan mencakup 2 susunan (tampilkan keduanya di bawah).':'tanpa urutan — 1 titik per baris.');
  const sg=$('boxSubGrid'); sg.innerHTML='';
  const shown = box.ticket==='EXACTA' ? expandExacta(box.subs) : box.subs;
  shown.forEach(nums=>{
    const d=document.createElement('div'); d.className='box-sub';
    d.innerHTML='<b>'+nums.join(boxSeparator(box.ticket))+'</b>';
    sg.appendChild(d);
  });
  if(box.ticket==='EXACTA'){
    $('boxSubHead').innerHTML+=' <b>'+shown.length+' susunan</b> dari '+box.subs.length+' pasangan.';
  }
}

function subsDescription(box){
  if(box.ticket==='TRIO') return 'C('+box.members.length+',3) = '+box.cost+' trio';
  return 'C('+box.members.length+',2) = '+box.cost+' pasangan';
}

/* Exacta butuh urutan: tiap pasangan [a,b] jadi a→b dan b→a */
function expandExacta(subs){
  const out=[];
  subs.forEach(([a,b])=>{ out.push([a,b]); out.push([b,a]); });
  return out;
}

function copyBox(){
  if(!S.box){ setStatus('Belum ada BOX untuk disalin.'); return; }
  const sep=boxSeparator(S.box.ticket);
  const lines=S.box.subs.map(nums=>S.box.ticket+' '+nums.join('-'));
  navigator.clipboard?.writeText($('resTitle').textContent+'\n'+S.box.ticket+' BOX ['+S.box.members.join(', ')+']\n'+lines.join('\n'));
  setStatus('BOX disalin: '+S.box.ticket+' BOX ['+S.box.members.join(', ')+'] ('+S.box.cost+' titik).');
}

function horseLabel(no, byNo){
  const h=byNo[no]; if(!h) return 'No.'+no;
  const w=WAKU[h.waku];
  return 'No.'+no+' '+(h.name||'')+' [Waku '+h.waku+' '+w.id+']';
}

function renderFortune(){
  const b=$('birthdate').value;
  if(!b){ setStatus('Isi tanggal lahir dulu.'); return; }
  const horses=readHorses();
  if(horses.length<2){ setStatus('Isi minimal 2 kuda di racecard (atau muat contoh).'); return; }
  const [by,bm,bd]=b.split('-').map(Number);
  const zodiac=getZodiac(bm,bd);
  const raceDate=$('raceDate').value||todayISO();
  const {map}=dailyRanking(raceDate);
  const rank=map[zodiac.key];
  const ticket=ticketForRank(rank);
  const T=TICKETS[ticket];
  const {combos, byNo}=pickCombos(zodiac, rank, horses, S.variation);

  $('resultSection').hidden=false;
  $('zodiacEmblem').textContent=zodiac.symbol;
  $('resDateLine').textContent=raceDate+' · '+zodiac.jp+' '+zodiac.name;
  $('resTitle').textContent='Ramalan '+zodiac.name+' ('+zodiac.symbol+')';
  $('rankBadge').textContent='#'+rank;
  $('rankText').textContent='Peringkat zodiak harian ke-'+rank+' dari 12 → '+T.label;
  $('ticketType').textContent=T.label;
  $('ticketJp').textContent=T.jp+' · '+T.desc;
  const dot=$('luckyColorDot'); dot.style.background=zodiac.color.hex;
  $('luckyColorText').textContent='Waku '+zodiac.color.waku+' · '+zodiac.color.id+' — prioritaskan kuda bracket ini.';
  $('luckyNumberText').textContent=zodiac.lucky.join(' · ');
  $('luckyNumberSub').textContent='Nomor jangkar: No.'+combos[0].anchor+' selalu masuk kombinasi.';
  $('narrativeText').textContent=narrative(zodiac, rank, T);

  const cl=$('comboList'); cl.innerHTML='';
  combos.forEach((c,i)=>{
    const div=document.createElement('div'); div.className='combo';
    const sep = ticket==='TRIO' ? ' — ' : (ticket==='EXACTA' ? ' → ' : ' + ');
    div.innerHTML='<div class="combo-num">'+(i+1)+'</div><div class="combo-main"><div class="combo-horses">'+c.nums.join(sep)+'</div><div class="combo-sub">'+c.nums.map(n=>horseLabel(n,byNo)).join('<br>')+'</div></div><button class="combo-copy">Salin</button>';
    div.querySelector('.combo-copy').onclick=()=>{ navigator.clipboard?.writeText(ticket+' '+c.nums.join('-')); setStatus('Kombinasi disalin: '+ticket+' '+c.nums.join('-')); };
    cl.appendChild(div);
  });

  const wg=$('wakuGrid'); wg.innerHTML='';
  horses.forEach(h=>{
    const w=WAKU[h.waku]; const cell=document.createElement('div');
    cell.className='waku-cell'+(h.waku===zodiac.color.waku?' lucky':'');
    cell.style.borderLeftColor=w.hex;
    cell.innerHTML='<b>No.'+h.no+' '+esc(h.name)+'</b>Waku '+h.waku+' · '+w.id+' · '+esc(h.jockey)+(h.waku===zodiac.color.waku?' ⭐ lucky':'');
    wg.appendChild(cell);
  });

  $('resultSection').scrollIntoView({behavior:'smooth'});
  setStatus('Ramalan selesai: '+zodiac.name+' rank #'+rank+' → '+ticket+'.');
  renderBox(zodiac, rank, horses);
}

function narrative(z, rank, T){
  const mood = rank<=3?'“Wah, harimu hoki! Gas pasang, mumpung bintangnya lagi rajin~”':rank<=6?'“Lumayan hoki. Fokus 1-2 finish, jangan serakah pasang semua~”':rank<=9?'“Biasa aja hari ini… main aman tanpa urutan, santai kayak Haron patroli.”':'“Hari apes nih… kayak dompet Haron tiap akhir bulan. Pasang kecil aja buat wide/place.”';
  return mood+' Haron racik warna '+z.color.id+' (waku '+z.color.waku+') dan nomor '+z.lucky.join('/')+' jadi '+T.label+'. 🎲';
}

function copyAll(){
  const lines=[...document.querySelectorAll('.combo-horses')].map((el,i)=>'Kombinasi '+(i+1)+': '+el.textContent);
  navigator.clipboard?.writeText($('resTitle').textContent+'\n'+$('ticketType').textContent+'\n'+lines.join('\n'));
  setStatus('Semua tiket disalin.');
}

document.addEventListener('DOMContentLoaded', ()=>{
  initDates();
  $('btnSample').onclick=loadSample;
  $('btnAddHorse').onclick=()=>addHorseRow();
  $('btnClear').onclick=()=>{ $('horseBody').innerHTML=''; $('raceMeta').textContent='Belum ada data lomba.'; };
  $('btnFetch').onclick=fetchRacecard;
  $('btnParsePaste').onclick=parsePastedHtml;
  $('btnFortune').onclick=()=>{ S.variation=0; renderFortune(); };
  $('btnReroll').onclick=()=>{ S.variation++; renderFortune(); };
  $('btnCopy').onclick=copyAll;
  $('btnCopyBox').onclick=copyBox;
  loadSample();
});

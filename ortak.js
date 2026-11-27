/* Tüm sayfaların ortak üst bölümü, sayfa menüsü, alt bilgisi, çıkış ve ilk şifre kuralı.
   Kullanım: <div id="ortak-ust" data-sayfa="ajanda"></div><script src="ortak.js"></script> */
(function(){
  const SAYFALAR={
    index:['index.html','🏠 Ana Sayfa','Dashboard'],
    ajanda:['ajanda.html','🗓️ Ajanda','Kurumsal Ajanda'],
    bulten:['bulten.html','📰 Bülten','Haftalık Bülten'],
    genel:['genel-bilgiler.html','ℹ️ Genel Bilgiler','Genel Bilgiler']
  };
  const ALT='Çanakkale İASB © 2026 • Agonya V2.5';
  const AMB='<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M3 25V8a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v17"/><path d="M29 12h7l7 7v6"/><path d="M3 25h5M17 25h12M39 25h4"/><path d="M3 15h26"/><path d="M13 6V3h6v3"/><circle cx="12.5" cy="26" r="3.5"/><circle cx="34.5" cy="26" r="3.5"/></svg>';
  const NABIZ='<svg class="ort-nabiz" viewBox="0 0 320 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 32H86l10-8 10 8h18l8 10 12-38 13 50 10-22h22l12-12 13 12h106"/></svg>';
  const $=id=>document.getElementById(id);
  const SB_URL='https://adylgqlzumwnzgehqjwf.supabase.co';
  const SB_KEY='sb_publishable_6FJPyl7rxOdLsjhqEWM4hA_6Ez9g2i4';
  const OTURUM='sb-adylgqlzumwnzgehqjwf-auth-token';
  const yer=$('ortak-ust'),aktif=yer.dataset.sayfa;

  const css=document.createElement('style');
  css.textContent=`
.ort-ust{background:#1e2f4f;color:#fff;padding:14px 16px;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.ort-nabiz{display:none}
.ort-ic{max-width:1400px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center}
.ort-ust h1{font-size:21px;margin:0;display:flex;align-items:center;gap:10px}
.ort-amblem{display:flex;font-style:normal}.ort-ust h1 small{display:none}
.ort-ust h1 svg{width:40px;height:27px;flex:none;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.ort-kul{display:flex;align-items:center;flex-wrap:wrap;gap:8px;background:rgba(0,0,0,.12);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:8px 14px}
#clk{font-size:12px;font-variant-numeric:tabular-nums;padding-right:10px;border-right:1px solid rgba(255,255,255,.35)}
#who{font-size:12px}
.ort-b{background:rgba(0,0,0,.2);color:#fff;border:1px solid rgba(255,255,255,.55);border-radius:12px;padding:8px 14px;font:600 12px/1.45 "Segoe UI",Tahoma,Geneva,Verdana,sans-serif;text-decoration:none;cursor:pointer}
.ort-b:hover{background:rgba(0,0,0,.32)}
.ort-b.ort-am{background:#a16207;border-color:#a16207}.ort-b.ort-am:hover{background:#854d0e}
.ort-menu{background:#fff;border-bottom:1px solid #e2e8f0}
.ort-menu .ort-ic{justify-content:flex-start;flex-wrap:nowrap;gap:6px;padding:0 16px;overflow-x:auto}
.ort-menu a{padding:12px 16px;font-weight:600;color:#64748b;border-bottom:3px solid transparent;white-space:nowrap;text-decoration:none}
.ort-menu a:hover{color:#1e293b}
.ort-menu a.on{color:#1e2f4f;border-bottom-color:#1e2f4f}
.ort-alt{text-align:center;padding:14px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;background:#fff}
.ort-giris{border-top:1px solid #f1f5f9;margin-top:8px;padding-top:12px;text-align:center;font-size:11px;color:#94a3b8}
@media(max-width:700px){.ort-ust h1{font-size:17px}#clk{width:100%;border:0}.ort-menu .ort-ic{flex-wrap:wrap;gap:0;padding:0 8px}.ort-menu a{padding:10px 8px;font-size:12.5px}}
@media print{.ort-ust,.ort-menu,.ort-alt{display:none!important}}`;
  document.head.appendChild(css);

  // ---- TEMA (giriş ekranıyla uyumlu). Kapatmak için TEMA=false yapmak yeterlidir. Yazdırmayı etkilemez. ----
  const TEMA=true;
  const tema=document.createElement('style');
  tema.textContent=`@media screen{
body{background-color:#eef2f9;background-image:radial-gradient(circle at 0 0,rgba(56,132,220,.16),transparent 40%),radial-gradient(circle at 100% 100%,rgba(225,29,72,.08),transparent 40%),linear-gradient(rgba(30,47,79,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(30,47,79,.045) 1px,transparent 1px);background-size:auto,auto,44px 44px,44px 44px;background-attachment:fixed}
.ort-ust{position:relative;overflow:hidden;padding:20px 16px;background:radial-gradient(circle at 12% 0,rgba(96,165,250,.42),transparent 42%),radial-gradient(circle at 92% 120%,rgba(225,29,72,.38),transparent 40%),linear-gradient(135deg,#0b1428,#1e2f4f 55%,#14213b);box-shadow:0 10px 30px rgba(11,20,40,.28)}
.ort-ust::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,#2a78d6,#e11d48,#2a78d6)}
.ort-ic{position:relative;z-index:1}
.ort-nabiz{display:block;position:absolute;left:30%;bottom:6px;width:34%;height:52px;fill:none;stroke:#fb7185;stroke-width:2;opacity:.35;pointer-events:none}
.ort-amblem{width:58px;height:58px;flex:none;border-radius:50%;display:grid;place-items:center;background:#fff;color:#1e2f4f;box-shadow:0 0 0 6px rgba(255,255,255,.10),0 8px 20px rgba(0,0,0,.35);margin:0 6px}
.ort-ust h1 small{display:block;font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#bfd3f2;margin-top:3px}
.ort-kul{background:rgba(255,255,255,.08);border-radius:16px;backdrop-filter:blur(6px)}
.ort-menu{background:rgba(255,255,255,.9);box-shadow:0 4px 14px rgba(30,47,79,.07)}
.ort-menu .ort-ic{padding-top:8px;padding-bottom:8px}
.ort-menu a{border:0;border-radius:12px;padding:9px 16px}
.ort-menu a:hover{background:#e8eef8}
.ort-menu a.on{color:#fff;background:linear-gradient(135deg,#2c4a80,#14213b);box-shadow:0 6px 16px rgba(30,47,79,.3)}
.ort-alt{border:0;color:#bfd3f2;padding:18px;background:linear-gradient(135deg,#0b1428,#1e2f4f 55%,#14213b)}
.card,.tb:not(.card .tb),.cal{border-color:#dbe4f3;border-radius:20px;box-shadow:0 10px 28px rgba(30,47,79,.09)}
.card .card{border-radius:14px;box-shadow:none}
.card h2,.tb h2{color:#14213b}
.b:not(.g):not(.em):not(.am):not(.ro):not(.bl){background:linear-gradient(135deg,color-mix(in srgb,var(--c) 80%,#60a5fa),var(--d));box-shadow:0 6px 14px color-mix(in srgb,var(--c) 28%,transparent)}
.b:hover{filter:brightness(1.1)}
main table th{background:#e6edf9;color:#14213b}
main #form table th{background:linear-gradient(135deg,#2c4a80,#14213b);color:#fff}
main .cal thead th{background:linear-gradient(180deg,#f4f7fd,#e6edf9)}
main .cal thead th.t0{background:var(--l);box-shadow:inset 0 3px 0 var(--c)}
input:focus,select:focus,textarea:focus{outline:3px solid rgba(42,120,214,.3);outline-offset:0}
dialog{border-radius:22px;border-top:6px solid #1e2f4f;box-shadow:0 30px 70px rgba(11,20,40,.45)}
dialog::backdrop{background:rgba(11,20,40,.72);backdrop-filter:blur(4px)}
}
@media screen and (max-width:700px){.ort-amblem{width:44px;height:44px;margin:0 4px}.ort-ust h1 small{font-size:9px;letter-spacing:.08em}.ort-menu a{padding:8px 9px}.ort-nabiz{display:none}}`;
  if(TEMA)document.head.appendChild(tema);

  // Ana sayfada pencereyi açan düğme, diğer sayfalarda ana sayfaya yönlendiren bağlantı.
  const dugme=(id,q,sinif,ad)=>aktif==='index'
    ?`<button type="button" class="ort-b ${sinif}" id="${id}">${ad}</button>`
    :`<a class="ort-b ${sinif}" id="${id}" href="index.html?${q}=1&amp;don=${SAYFALAR[aktif][0]}">${ad}</a>`;

  yer.innerHTML=`<div class="ort-ust">${NABIZ}<div class="ort-ic">
<h1><i class="ort-amblem">${AMB}</i><span>Çanakkale İASB / ${SAYFALAR[aktif][2]}<small>İl Ambulans Servisi Başhekimliği</small></span></h1>
<div class="ort-kul"><span id="clk"></span><b id="who"></b>
${dugme('adminbtn','yonetim','ort-am hide','🛡️ Yönetim')}
${dugme('pwbtn','sifre','','🔑 Şifre')}
<button type="button" class="ort-b" id="out">⏻ Çıkış</button></div></div></div>
<div class="ort-menu"><div class="ort-ic">${Object.entries(SAYFALAR).map(([k,s])=>`<a href="${s[0]}"${k===aktif?' class="on" aria-current="page"':''}>${s[1]}</a>`).join('')}</div></div>`;

  document.querySelectorAll('[data-ort-alt]').forEach(x=>x.textContent=ALT);
  document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-ort-alt]').forEach(x=>x.textContent=ALT));

  const saat=()=>{const n=new Date();$('clk').textContent=n.toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',weekday:'long'})+' · '+n.toLocaleTimeString('tr-TR')};
  saat();setInterval(saat,1000);

  // Yönetim yalnızca yöneticiye, Şifre ortak hesap dışındakilere görünür (asıl yetki kontrolü sunucudadır).
  const oku=()=>{try{return JSON.parse(localStorage.getItem('ort_kullanici'))}catch(e){return null}};
  const yonetimGoster=()=>{const k=oku(),ben=!!(k&&$('who').textContent.includes(k.ad));$('adminbtn').classList.toggle('hide',!(ben&&k.admin));$('pwbtn').classList.toggle('hide',ben&&!!k.ortak)};
  new MutationObserver(yonetimGoster).observe($('who'),{childList:true,characterData:true,subtree:true});

  // Çıkış her sayfada aynıdır: oturum kapatılır, ana sayfadaki giriş paneline gidilir.
  $('out').onclick=async()=>{
    $('out').disabled=true;
    try{
      const t=JSON.parse(localStorage.getItem(OTURUM)).access_token;
      await fetch(SB_URL+'/auth/v1/logout',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+t},signal:AbortSignal.timeout(4000)});
    }catch(e){/* sunucuya ulaşılamasa da bu tarayıcıdaki oturum silinir */}
    try{localStorage.removeItem(OTURUM);localStorage.removeItem('ort_kullanici')}catch(e){}
    location.replace('index.html');
  };
  // Geri tuşuyla bellekten açılan sayfa yeniden yüklenir (çıkıştan sonra eski veriler görünmesin).
  addEventListener('pageshow',e=>{if(e.persisted)location.reload()});

  // Her sayfa profili bu fonksiyona verir. false dönerse sayfa veri yüklemeden durmalıdır:
  // ilk şifresini belirlememiş kullanıcı yalnızca ana sayfadaki şifre ekranını kullanabilir.
  window.ortakKullanici=p=>{
    const ortak=!!p.ortak||p.rol==='skkm';
    if(aktif!=='index'&&'sifre_degisti' in p&&!p.sifre_degisti&&!ortak){location.replace('index.html');return false}
    const ek=p.rol==='admin'?'Yönetici':p.rol==='baskekim'?'Başhekim':(p.birimler||[]).join(', ');
    try{localStorage.setItem('ort_kullanici',JSON.stringify({ad:p.adsoyad,admin:p.rol==='admin',ortak}))}catch(e){}
    $('who').textContent='👤 '+p.adsoyad+(ek?' ('+ek+')':'');
    yonetimGoster();
    return true;
  };
})();

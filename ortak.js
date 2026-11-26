/* Tüm sayfaların ortak üst bölümü, sayfa menüsü, alt bilgisi, çıkış ve ilk şifre kuralı.
   Kullanım: <div id="ortak-ust" data-sayfa="ajanda"></div><script src="ortak.js"></script> */
(function(){
  const SAYFALAR={
    index:['index.html','🏠 Ana Sayfa','Dashboard'],
    ajanda:['ajanda.html','🗓️ Ajanda','Kurumsal Ajanda'],
    bulten:['bulten.html','📰 Bülten','Haftalık Bülten'],
    genel:['genel-bilgiler.html','ℹ️ Genel Bilgiler','Genel Bilgiler']
  };
  const ALT='Çanakkale İASB © 2026 • Agonya V2';
  const AMB='<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M3 25V8a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v17"/><path d="M29 12h7l7 7v6"/><path d="M3 25h5M17 25h12M39 25h4"/><path d="M3 15h26"/><path d="M13 6V3h6v3"/><circle cx="12.5" cy="26" r="3.5"/><circle cx="34.5" cy="26" r="3.5"/></svg>';
  const $=id=>document.getElementById(id);
  const SB_URL='https://adylgqlzumwnzgehqjwf.supabase.co';
  const SB_KEY='sb_publishable_6FJPyl7rxOdLsjhqEWM4hA_6Ez9g2i4';
  const OTURUM='sb-adylgqlzumwnzgehqjwf-auth-token';
  const yer=$('ortak-ust'),aktif=yer.dataset.sayfa;

  const css=document.createElement('style');
  css.textContent=`
.ort-ust{background:#1e2f4f;color:#fff;padding:14px 16px;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.ort-ic{max-width:1400px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center}
.ort-ust h1{font-size:21px;margin:0;display:flex;align-items:center;gap:10px}
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

  // Ana sayfada pencereyi açan düğme, diğer sayfalarda ana sayfaya yönlendiren bağlantı.
  const dugme=(id,q,sinif,ad)=>aktif==='index'
    ?`<button type="button" class="ort-b ${sinif}" id="${id}">${ad}</button>`
    :`<a class="ort-b ${sinif}" id="${id}" href="index.html?${q}=1&amp;don=${SAYFALAR[aktif][0]}">${ad}</a>`;

  yer.innerHTML=`<div class="ort-ust"><div class="ort-ic">
<h1>${AMB}<span>Çanakkale İASB / ${SAYFALAR[aktif][2]}</span></h1>
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

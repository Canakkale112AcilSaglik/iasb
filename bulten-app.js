const CFG = window.CFG || {}; CFG.URL = (CFG.URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, ''); CFG.KEY = (CFG.KEY || '').trim();
const DEMO = !CFG.URL, NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const $ = (s, e = document) => e.querySelector(s);
const el = (t, p = {}, ...k) => { const e = Object.assign(document.createElement(t), p); k.flat().forEach(c => e.append(c)); return e; };
const FREE = { "12:0": 2 };                       // "slayt:tablo" -> bu satırdan itibaren tüm hücreler düzenlenebilir
let SCH, user, week, prevWeek, unit, rows = {}, prevRows = {}, cur = {}, meta = {};

/* ---------- şema yardımcıları ---------- */
const kk = (s, t, r, c) => `${s}|${t}|${r}|${c}`, xk = (s, id) => `${s}|x|${id}`;
const hdrOf = rows => rows[0].map(c => /ge[çc]en hafta/i.test(c.t) ? 'prev' : /^bu hafta/i.test(c.t) ? 'cur' : '');
function kind(si, ti, rs, r, c, cell) {
  const h = hdrOf(rs); if (cell.m || r === 0) return 'L'; if (h[c] === 'prev') return 'P';
  if (cell.t === '' && cell.gs > 1) return 'L';                      // boş ayırıcı (birleşik) satır: girdi kutusu yok
  const f = FREE[si + ':' + ti]; if (f != null && r >= f) return 'E';
  if (c === 0) return cell.t === '' ? 'E' : 'L';
  return /^[\d.,%\s\-/:]*$/.test(cell.t) ? 'E' : 'L';
}
function defaults(unitName) {
  const d = {};
  for (const si of SCH.units[unitName]) {
    const s = SCH.slides[si];
    s.tables.forEach((rs, ti) => rs.forEach((row, r) => row.forEach((cell, c) => { if (kind(si, ti, rs, r, c, cell) === 'E') d[kk(si, ti, r, c)] = cell.t; })));
    s.texts.forEach(t => d[xk(si, t.id)] = t.lines.join('\n'));
  }
  return d;
}
// Yeni hafta: tablo hücreleri boş başlar; serbest metinler geçen haftadan devralınır
const KEEP = { 2: 'all', 5: [1], 8: 'all', 10: [0], 11: [0], 12: [2] };   // yeni haftada silinmeyen tablolar: slayt -> tablo numaraları (Genel Bilgiler, Personel Aylık Rapor, Ambulans Bakım, Modüler Eğitim, ASTE, DÖF Takibi)
function blankFor(n, pd) {
  const d = { ...defaults(n) };
  for (const k of Object.keys(d)) {
    const [s, t] = k.split('|'), keep = t === 'x' || KEEP[s] === 'all' || (KEEP[s] || []).includes(+t);
    if (keep) { if (pd && pd[k] != null) d[k] = pd[k]; } else d[k] = '';
  }
  return d;
}
const prevValue = (si, ti, rs, r, c, pd) => {            // "Geçen Hafta" = geçen haftanın "Bu Hafta" değeri
  const k = kk(si, ti, r, c + 1); return pd && pd[k] != null ? pd[k] : rs[r][c].t;
};

/* ---------- Supabase (veya DEMO) ---------- */
const REF = (CFG.URL.match(/\/\/([^.]+)\./) || [])[1], SKEY = `sb-${REF}-auth-token`;   // ajanda (supabase-js) ile aynı oturum anahtarı
const getSess = () => { try { return JSON.parse(localStorage[SKEY] || 'null'); } catch { return null; } };
async function freshSession() {
  let s = getSess(); if (!s) return null; if (s.expires_at && s.expires_at - 60 > Date.now() / 1000) return s; if (!s.refresh_token) return null;
  const r = await fetch(CFG.URL + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: CFG.KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
  if (!r.ok) return null; s = await r.json(); localStorage[SKEY] = JSON.stringify(s); return s;
}
async function api(path, opt = {}) {
  const s = getSess(), h = { apikey: CFG.KEY, 'Content-Type': 'application/json', ...(opt.headers || {}) }; if (s) h.Authorization = 'Bearer ' + s.access_token;
  const r = await fetch(CFG.URL + path, { ...opt, headers: h });
  if (r.status === 401) { localStorage.removeItem(SKEY); location.reload(); }
  const t = await r.text(); if (!r.ok) throw new Error(t); return t ? JSON.parse(t) : null;
}
const demoDB = () => JSON.parse(localStorage.demo || '{}');
async function getRows(w) {
  if (DEMO) return Object.fromEntries(Object.entries(demoDB()).filter(([k]) => k.startsWith(w + '#')).map(([k, v]) => [k.split('#')[1], v]));
  const a = await api(`/rest/v1/bulten_kayit?week=eq.${encodeURIComponent(w)}&select=*`); return Object.fromEntries(a.map(x => [x.unit, x]));
}
async function putRow(u, data, status, w = week) {
  const row = { week: w, unit: u, data, status, updated_at: new Date().toISOString() };
  if (DEMO) { const d = demoDB(); d[w + '#' + u] = row; localStorage.demo = JSON.stringify(d); return; }
  await api('/rest/v1/bulten_kayit?on_conflict=week,unit', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify(row) });
}
/* ---------- hafta ---------- */
const isoWeek = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y = t.getUTCFullYear(); return `${y}-${String(Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7)).padStart(2, '0')}`; };
const monOf = w => { const [y, n] = w.split('-').map(Number), j = new Date(Date.UTC(y, 0, 4)), d = j.getUTCDay() || 7; j.setUTCDate(j.getUTCDate() - d + 1 + (n - 1) * 7); return j; };
const shiftWeek = (w, k) => { const m = monOf(w); m.setUTCDate(m.getUTCDate() + 7 * k); return isoWeek(new Date(m.getUTCFullYear(), m.getUTCMonth(), m.getUTCDate())); };
const prevOf = w => shiftWeek(w, -1), nextOf = w => shiftWeek(w, 1);

/* ---------- arayüz ---------- */
async function load() {
  week = $('#week').value.trim(); prevWeek = prevOf(week);
  const safe = async w => { try { return await getRows(w); } catch (e) { $('#err').textContent = 'Sunucu hatası: ' + String(e.message).slice(0, 300) + ' — supabase.sql çalıştırıldı mı?'; return {}; } };
  $('#err').textContent = ''; [rows, prevRows] = await Promise.all([safe(week), safe(prevWeek)]);
  cur = {}; const names = Object.keys(SCH.units);
  names.forEach(n => { cur[n] = rows[n] ? rows[n].data : blankFor(n, prevRows[n]?.data); });
  const vis = user.role === 'admin' ? names : names.filter(n => (user.units || []).includes(n));
  const tabs = $('#tabs'); tabs.innerHTML = '';
  vis.forEach(n => tabs.append(el('button', { className: 'tab' + (n === unit ? ' on' : ''), textContent: n + (rows[n]?.status === 'approved' ? ' ✓' : ''), onclick: () => { unit = n; load2(); } })));
  if (!vis.includes(unit)) unit = vis[0]; load2();
}
function load2() { [...$('#tabs').children].forEach(b => b.classList.toggle('on', b.textContent.replace(' ✓', '') === unit)); render(); }
function render() {
  const box = $('#form'); box.innerHTML = ''; if (!unit) return;
  const st = rows[unit]?.status || 'draft', locked = st === 'approved', d = cur[unit];
  $('#status').textContent = locked ? '🔒 Onaylandı – düzenlenemez' : (rows[unit] ? 'Taslak (kaydedildi)' : 'Henüz kaydedilmedi');
  $('#save').disabled = locked; $('#approve').style.display = user.role === 'admin' ? '' : 'none';
  $('#approve').textContent = locked ? 'Onayı kaldır' : 'Onayla ve kilitle';
  for (const si of SCH.units[unit]) {
    const s = SCH.slides[si], card = el('section', { className: 'card' }, el('h3', { textContent: `Slayt ${si} · ${s.title}` }));
    s.tables.forEach((rs, ti) => {
      const tb = el('table', { className: 't' + rs[0].length }), hd = hdrOf(rs); const pd = prevRows[unit]?.data;
      rs.forEach((row, r) => { const tr = el('tr'); row.forEach((cell, c) => {
        if (cell.m) return; const k = kind(si, ti, rs, r, c, cell), td = el(r === 0 ? 'th' : 'td');
        if (cell.gs > 1) td.colSpan = cell.gs; if (cell.rs > 1) td.rowSpan = cell.rs;   // birleşik hücreler sunudaki gibi gösterilir
        if (k === 'E') { td.className = 'in'; td.append(el('input', { value: d[kk(si, ti, r, c)] ?? '', disabled: locked, oninput: e => d[kk(si, ti, r, c)] = e.target.value })); }
        else if (k === 'P') { td.textContent = prevValue(si, ti, rs, r, c, pd); td.className = 'prev'; }
        else { td.textContent = cell.t; td.className = 'lbl' + (r === 0 && hd[c] ? ' h' + hd[c] : ''); } tr.append(td); }); tb.append(tr); });
      card.append(el('div', { className: 'scroll' }, tb));
    });
    s.texts.forEach(t => card.append(el('textarea', { rows: Math.min(12, t.lines.length + 1), value: d[xk(si, t.id)] ?? '', disabled: locked, oninput: e => d[xk(si, t.id)] = e.target.value })));
    box.append(card);
  }
}
async function save(status) {
  try { await putRow(unit, cur[unit], status || rows[unit]?.status || 'draft'); } catch (e) { $('#err').textContent = 'Kaydedilemedi: ' + String(e.message).slice(0, 300); return; }
  await load(); toast('Kaydedildi');
}
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1800); };

/* ---------- PPTX üretimi (şablonu bozmadan hücre/metin doldurur) ---------- */
function setCell(tc, v) {
  const doc = tc.ownerDocument, ps = [...tc.getElementsByTagNameNS(NS, 'p')]; ps.slice(1).forEach(x => x.remove());
  const p = ps[0], rs = [...p.getElementsByTagNameNS(NS, 'r')]; let r = rs[0];
  if (!r) { r = doc.createElementNS(NS, 'a:r'); const rp = doc.createElementNS(NS, 'a:rPr'); rp.setAttribute('lang', 'tr-TR'); r.append(rp, doc.createElementNS(NS, 'a:t')); const end = p.getElementsByTagNameNS(NS, 'endParaRPr')[0]; end ? p.insertBefore(r, end) : p.append(r); }
  rs.slice(1).forEach(x => x.remove()); r.getElementsByTagNameNS(NS, 't')[0].textContent = v;
}
function setLines(sp, lines) {
  const ps = [...sp.getElementsByTagNameNS(NS, 'p')], tpl = ps.find(p => p.textContent.trim()) || ps[0], par = ps[0].parentNode;
  lines.forEach(L => { const c = tpl.cloneNode(true), rs = [...c.getElementsByTagNameNS(NS, 'r')];
    [...c.childNodes].filter(n => ['br', 'fld'].includes(n.localName)).forEach(n => n.remove()); rs.slice(1).forEach(x => x.remove());
    if (rs[0]) rs[0].getElementsByTagNameNS(NS, 't')[0].textContent = L; par.insertBefore(c, ps[0]); });
  ps.forEach(p => p.remove());
}
function fillSlide(xml, si, d, pd) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml'), s = SCH.slides[si];
  const frames = [...doc.getElementsByTagName('p:graphicFrame')].filter(g => g.getElementsByTagNameNS(NS, 'tbl').length);
  s.tables.forEach((rs, ti) => { const trs = frames[ti].getElementsByTagNameNS(NS, 'tr');
    rs.forEach((row, r) => { const tcs = trs[r].getElementsByTagName('a:tc'); row.forEach((cell, c) => {
      const k = kind(si, ti, rs, r, c, cell);
      if (k === 'E' && d[kk(si, ti, r, c)] != null) setCell(tcs[c], d[kk(si, ti, r, c)]);
      if (k === 'P') setCell(tcs[c], prevValue(si, ti, rs, r, c, pd)); }); }); });
  s.texts.forEach(t => { const sp = [...doc.getElementsByTagName('p:sp')].find(e => e.getElementsByTagName('p:cNvPr')[0].getAttribute('id') === t.id);
    const v = d[xk(si, t.id)]; if (sp && v != null) setLines(sp, v.split('\n')); });
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + new XMLSerializer().serializeToString(doc.documentElement);
}
async function exportPptx() {
  const src = await JSZip.loadAsync(await (await fetch('bulten-template.pptx?t=' + Date.now(), { cache: 'no-store' })).arrayBuffer()), zip = new JSZip(), pend = [];
  for (const [p, f] of Object.entries(src.files)) if (!f.dir) zip.file(p, await f.async('uint8array'), { createFolders: false });   // klasör girdilerini atla
  for (const [u, sl] of Object.entries(SCH.units)) {
    if (rows[u]?.status !== 'approved') pend.push(u);
    const d = rows[u]?.data || blankFor(u, prevRows[u]?.data), pd = prevRows[u]?.data;
    for (const si of sl) { const f = `ppt/slides/slide${si}.xml`; zip.file(f, fillSlide(await zip.file(f).async('string'), si, d, pd), { createFolders: false }); }
  }
  if ($('#range').value) { const f = 'ppt/slides/slide1.xml'; zip.file(f, (await zip.file(f).async('string')).replace(/\d{1,2}-\d{1,2}\.\d{2}\.\d{4}/, $('#range').value), { createFolders: false }); }
  if (pend.length && !confirm('Onaylanmamış birimler var: ' + pend.join(', ') + '\nYine de oluşturulsun mu?')) return;
  const a = el('a', { href: URL.createObjectURL(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })), download: `Haftalık_Bülten_${week}.pptx` }); a.click();
}
/* ---------- Haftayı kapat: onayla, geçmişi sil, yeni haftaya geç ---------- */
async function purge(keep) {
  keep = [...keep, '_config'];
  if (DEMO) { const d = demoDB(); Object.keys(d).forEach(k => { if (!keep.includes(k.split('#')[0])) delete d[k]; }); localStorage.demo = JSON.stringify(d); return; }
  await api('/rest/v1/bulten_kayit?week=not.in.(' + keep.map(w => '"' + w + '"').join(',') + ')', { method: 'DELETE' });
}
async function rollWeek() {
  if (!/^\d{4}-\d{2}$/.test(week)) { toast('Hafta 2026-38 biçiminde olmalı'); return; }
  const names = Object.keys(SCH.units), nxt = nextOf(week);
  const draft = names.filter(u => rows[u] && rows[u].status !== 'approved'), empty = names.filter(u => !rows[u]);
  const msg = `${week}. hafta onaylanıp kapatılacak, yeni hafta ${nxt} olacak.\n\n• Bu haftanın verileri "Geçen Hafta" olarak kalır, "Bu Hafta" tabloları boşalır.\n• ${prevWeek} ve öncesindeki tüm kayıtlar SİLİNİR.\n`
    + (draft.length ? `\nOnaysız birimler de kilitlenecek: ${draft.join(', ')}\n` : '') + (empty.length ? `\nBu hafta hiç kayıt girmeyen birimler: ${empty.join(', ')}\n` : '')
    + '\nSunuyu oluşturduysanız devam edin. Emin misiniz?';
  if (!confirm(msg)) return;
  try {
    for (const u of draft) await putRow(u, rows[u].data, 'approved');
    await purge([week, nxt]);
    $('#week').value = nxt; $('#range').value = '';
    await putRow('_meta', { week: nxt, range: '' }, 'draft', '_config');
  } catch (e) { $('#err').textContent = 'Hafta geçişi tamamlanamadı: ' + String(e.message).slice(0, 300); return; }
  await load(); toast('Yeni hafta: ' + nxt);
}
window.__t = { fillSlide, setSCH: s => SCH = s };   // test için

/* ---------- başlat ---------- */
async function init() {
  SCH = await (await fetch('bulten-schema.json?t=' + Date.now(), { cache: 'no-store' })).json();
  // Giriş, çıkış ve ilk şifre yalnızca ana sayfadadır; burada sadece bilgi mesajı gösterilir.
  const goster = () => { $('#app').style.display = ''; };
  const bilgi = msg => { goster(); $('.bar').style.display = $('#tabs').style.display = 'none'; $('#form').replaceChildren(el('div', { className: 'card yok', textContent: msg })); };
  if (DEMO) user = { role: 'admin', units: Object.keys(SCH.units), name: 'Demo' };
  else {
    if (!(await freshSession().catch(() => null))) return void location.replace('index.html');
    const me = await api('/rest/v1/rpc/bulten_me', { method: 'POST', body: '{}' }).catch(e => ({ err: String(e.message).slice(0, 200) }));
    if (!me || me.err) return bilgi(me ? 'Sunucu hatası: ' + me.err + ' — supabase_profil.sql çalıştırıldı mı?' : 'Bu kullanıcının aktif bir profili yok.');
    user = { role: me.admin ? 'admin' : 'unit', units: me.units, name: me.adsoyad };
  }
  // Ad soyad ve birim diğer sayfalarla aynı biçimde yazılır; profil okunamazsa bülten bilgisi kullanılır.
  if (DEMO) $('#who').textContent = 'DEMO modu (veri bu tarayıcıda)';
  else {
    const uid = getSess()?.user?.id;
    const p = uid ? (await api('/rest/v1/profiles?select=*&id=eq.' + encodeURIComponent(uid)).catch(() => []))[0] : null;
    if (!ortakKullanici(p || { adsoyad: user.name, rol: user.role === 'admin' ? 'admin' : '', birimler: user.units })) return;
  }
  // Biriminin bültende slaytı olmayan kullanıcı: menü açık kalır, yalnızca uyarı gösterilir.
  if (user.role !== 'admin' && !(user.units || []).some(n => SCH.units[n])) return bilgi('Bülteniniz bulunmamaktadır.');
  goster();
  const cfg = ((await getRows('_config').catch(() => ({})))._meta || {}).data || {};
  $('#week').value = cfg.week || isoWeek(); $('#range').value = cfg.range || '';
  const saveCfg = () => putRow('_meta', { week: $('#week').value.trim(), range: $('#range').value }, 'draft', '_config');
  if (user.role === 'admin') { $('#week').onchange = async () => { await saveCfg(); await load(); toast('Dönem kaydedildi'); }; }
  else { document.querySelectorAll('.adm').forEach(e => e.style.display = 'none'); $('#period').textContent = 'Dönem: ' + $('#week').value + ($('#range').value ? ' (' + $('#range').value + ')' : ''); }
  $('#save').onclick = () => save();
  $('#approve').onclick = () => save(rows[unit]?.status === 'approved' ? 'draft' : 'approved');
  $('#range').onchange = async () => { if (user.role !== 'admin') return; await saveCfg(); toast('Tarih kaydedildi'); };
  $('#export').style.display = user.role === 'admin' ? '' : 'none'; $('#export').onclick = exportPptx;
  $('#roll').style.display = user.role === 'admin' ? '' : 'none'; $('#roll').onclick = rollWeek;
  await load();
}
if (typeof document !== 'undefined') init();

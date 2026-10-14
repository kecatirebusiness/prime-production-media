/* Prime Production Media — firma electrónica in-house */
(() => {
  const API = 'https://script.google.com/macros/s/AKfycbwgIvMEAFoHu4sBKyPY2BFmHTTzC9WVK89kjC1vjbCH8VrgrIDUdK5Sdc0FZLtaB1BZ/exec';
  const C = window.CONTRATO, A = window.PRIME_ASSETS;
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fechaLarga = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${y}`; };
  const ahoraLargo = (d = new Date()) => d.toLocaleString('es-US', {dateStyle: 'long', timeStyle: 'short'});

  $('#logo').src = A.logo;
  const fav = document.createElement('link'); fav.rel = 'icon'; fav.href = A.logo; document.head.appendChild(fav);

  /* estado */
  const S = {dom: '', nom: C.cliente.rep, car: C.cliente.cargo, ini: '', email: '', token: '', verifiedAt: '', firma: '', modo: 'draw'};
  const F = {dom: $('#fDom'), nom: $('#fNom'), car: $('#fCar'), ini: $('#fIni'), email: $('#fEm')};
  F.nom.value = S.nom; F.car.value = S.car;
  try { const saved = JSON.parse(localStorage.getItem('ppm_' + C.doc) || '{}'); Object.keys(F).forEach((k) => { if (saved[k]) { F[k].value = saved[k]; S[k] = saved[k]; } }); } catch (e) {}

  const val = {
    dom: () => S.dom, email: () => S.email, nom: () => S.nom, car: () => S.car,
    fechaInicio: () => fechaLarga(S.ini),
  };
  const fill = (k, ph = '__________') => { const v = val[k](); return `<span class="fill ${v ? '' : 'empty'}" data-f="${k}">${esc(v || ph)}</span>`; };
  const segHTML = (segs) => segs.map((s) => {
    const html = esc(s.t).replace(/\{\{(\w+)\}\}/g, (_, k) => fill(k));
    return s.b ? `<b>${html}</b>` : html;
  }).join('');

  /* contrato en pantalla */
  function renderPaper() {
    const p = C.proveedor, c = C.cliente;
    let h = `<div class="ph"><div class="b">PRIME PRODUCTION MEDIA<i>.</i></div><div class="r">Contrato N.º ${C.doc}<br>Emitido el ${fechaLarga(C.emitido)}</div></div>
      <h2 class="t">${esc(C.titulo)}</h2><p class="st">${esc(C.subtitulo)}</p><p>${esc(C.intro)}</p>
      <div class="parties">
        <div class="party"><small>El Proveedor</small><b>${esc(p.nombre)}</b>${esc(p.detalle)}<br>Domicilio: ${esc(p.domicilio)}.<br>Representada por: ${esc(p.rep)}, ${esc(p.cargo)}.<br>Email: ${esc(p.email)}</div>
        <div class="party"><small>El Cliente</small><b>${esc(c.nombre)}</b>${esc(c.detalle)}<br>Domicilio: ${fill('dom')}<br>Representada por: ${fill('nom')}, ${fill('car')}.<br>Email: ${fill('email')}</div>
      </div><p>${esc(C.partes)}</p>`;
    for (const cl of C.clausulas) {
      h += `<section class="cl"><h3>${esc(cl.h)}</h3>`;
      for (const it of cl.items) {
        if (it.p) h += `<p>${segHTML(it.p)}</p>`;
        else if (it.ol) h += `<ol>${it.ol.map((li) => `<li>${segHTML(li)}</li>`).join('')}</ol>`;
        else if (it.table) h += `<table class="pagos"><tr><th>Pago</th><th>Vencimiento</th><th>Concepto</th><th>Monto</th></tr>${C.pagos.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}<tr class="tot"><td colspan="3">Total del Plazo Inicial</td><td>${C.pagosTotal}</td></tr></table>`;
      }
      h += `</section>`;
    }
    h += `<div class="sigs">
      <div class="sig"><small>Por el Proveedor</small><div class="img"><img src="${A.firma}" alt="Firma de Kevin Rodriguez"></div><b>${esc(p.nombre)}</b><br>${esc(p.rep)} · ${esc(p.cargo)}<br>Firmado electrónicamente el ${fechaLarga(C.emitido)}</div>
      <div class="sig"><small>Por el Cliente</small>${S.firma ? `<div class="img"><img src="${S.firma}" alt="Firma"></div>` : '<div class="ph2">Tu firma aparecerá aquí</div>'}<b>${esc(c.nombre)}</b><br>${fill('nom')} · ${fill('car')}<br>Fecha: ${S.firma ? 'al firmar' : '__________'}</div>
    </div>`;
    $('#paper').innerHTML = h;
  }
  function refreshFills() { $$('.fill').forEach((el) => { const v = val[el.dataset.f](); el.textContent = v || '__________'; el.classList.toggle('empty', !v); }); }
  renderPaper();

  Object.entries(F).forEach(([k, el]) => el.addEventListener('input', () => {
    S[k] = el.value.trim(); refreshFills();
    try { localStorage.setItem('ppm_' + C.doc, JSON.stringify(Object.fromEntries(Object.entries(F).map(([a, b]) => [a, b.value])))); } catch (e) {}
    if (k === 'email' && S.token) { S.token = ''; lock(2); lock(3); }
  }));

  /* pasos */
  const step = (n) => { ['#s1', '#s2', '#s3', '#s4'].forEach((s, i) => $(s).classList.toggle('on', i < n)); };
  const lock = (n) => $('#st' + n).classList.add('lock');
  const unlock = (n) => $('#st' + n).classList.remove('lock');
  const done = (n, d = true) => $('#st' + n).classList.toggle('done', d);
  const msg = (n, t, ok) => { const m = $('#m' + n); m.textContent = t || ''; m.className = 'msg ' + (t ? (ok ? 'ok' : 'err') : ''); };

  async function api(payload) {
    const r = await fetch(API, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({doc: C.doc, ...payload})});
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'Algo salió mal');
    return j;
  }

  $('#b1').addEventListener('click', () => {
    const miss = [];
    if (S.dom.length < 6) miss.push('domicilio'); if (!S.nom) miss.push('nombre'); if (!S.car) miss.push('cargo');
    if (!S.ini) miss.push('fecha de inicio');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(S.email)) miss.push('email válido');
    if (miss.length) return msg(1, 'Falta: ' + miss.join(', ') + '.');
    msg(1, 'Datos listos ✓', true); done(1); unlock(2); step(2);
    $('#st2').scrollIntoView({behavior: 'smooth', block: 'center'});
  });

  $('#bCode').addEventListener('click', async () => {
    const b = $('#bCode'); b.disabled = true; msg(2, 'Enviando…', true);
    try {
      await api({action: 'code', email: S.email, name: S.nom});
      msg(2, `Código enviado a ${S.email}. Revisa tu bandeja (y spam).`, true);
      $('#codeRow').hidden = false; $('#fCode').focus(); b.textContent = 'Reenviar código';
    } catch (e) { msg(2, e.message); }
    setTimeout(() => (b.disabled = false), 15000);
  });
  $('#fCode').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); if (e.target.value.length === 6) $('#bVer').click(); });
  $('#bVer').addEventListener('click', async () => {
    const code = $('#fCode').value; if (code.length !== 6) return msg(2, 'Escribe los 6 dígitos.');
    $('#bVer').disabled = true; msg(2, 'Verificando…', true);
    try {
      const j = await api({action: 'verify', email: S.email, code});
      S.token = j.token; S.verifiedAt = j.verifiedAt;
      msg(2, 'Email verificado ✓', true); done(2); unlock(3); step(3); resizePad();
      $('#st3').scrollIntoView({behavior: 'smooth', block: 'start'});
    } catch (e) { msg(2, e.message); }
    $('#bVer').disabled = false;
  });

  /* pad de firma */
  const cv = $('#cv'), ctx = cv.getContext('2d'); let drawing = false, dirty = false, last = null;
  function resizePad() {
    const r = cv.getBoundingClientRect(); if (!r.width) return;
    const dpr = Math.max(2, devicePixelRatio || 1); const old = dirty ? cv.toDataURL() : null;
    cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.scale(dpr, dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0A0A0A'; ctx.lineWidth = 2.6;
    if (old) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, r.width, r.height); im.src = old; }
  }
  addEventListener('resize', resizePad);
  const pt = (e) => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
  cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); drawing = true; last = pt(e); ctx.beginPath(); ctx.arc(last.x, last.y, 1.2, 0, 6.3); ctx.fill(); });
  cv.addEventListener('pointermove', (e) => {
    if (!drawing) return; const p = pt(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); const mx = (last.x + p.x) / 2, my = (last.y + p.y) / 2; ctx.quadraticCurveTo(last.x, last.y, mx, my); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p; if (!dirty) { dirty = true; $('#hint').hidden = true; } check();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => cv.addEventListener(t, () => (drawing = false)));
  $('#clr').addEventListener('click', () => { const r = cv.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); dirty = false; $('#hint').hidden = false; check(); });

  $$('.tabs button').forEach((b) => b.addEventListener('click', () => {
    S.modo = b.dataset.mode; $$('.tabs button').forEach((x) => x.classList.toggle('on', x === b));
    $('#pad').hidden = S.modo !== 'draw'; $('#typed').hidden = S.modo !== 'type';
    $('#typed').textContent = S.nom || 'Tu nombre'; if (S.modo === 'draw') resizePad(); check();
  }));
  function typedImage() {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 360; const x = c.getContext('2d');
    x.fillStyle = '#0A0A0A'; let size = 170; x.font = `${size}px 'Mrs Saint Delafield'`;
    while (x.measureText(S.nom).width > 1120 && size > 60) { size -= 6; x.font = `${size}px 'Mrs Saint Delafield'`; }
    x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText(S.nom, 600, 200); return c.toDataURL('image/png');
  }
  function trimmed() { // recorta el espacio vacío del lienzo
    const w = cv.width, h = cv.height, d = ctx.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const pad = 16; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w, x1 + pad); y1 = Math.min(h, y1 + pad);
    const o = document.createElement('canvas'); o.width = x1 - x0; o.height = y1 - y0; o.getContext('2d').drawImage(cv, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  }
  const ready = () => !!S.token && (S.modo === 'type' ? !!S.nom : dirty) && $('#cons').checked && $('#fListo').value.trim().toUpperCase() === 'LISTO';
  function check() { $('#bSign').disabled = !ready(); }
  $('#cons').addEventListener('change', check); $('#fListo').addEventListener('input', check);

  /* huella digital */
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const sha = async (data) => hex(await crypto.subtle.digest('SHA-256', typeof data === 'string' ? new TextEncoder().encode(data) : data));
  const campos = () => ({domicilio: S.dom, firmante: S.nom, cargo: S.car, email: S.email, fechaInicio: S.ini});

  /* PDF */
  const segPdf = (segs) => segs.map((s) => ({text: s.t.replace(/\{\{(\w+)\}\}/g, (_, k) => val[k]() || '__________'), bold: !!s.b}));
  function pdfDef(firmaCliente, audit) {
    const p = C.proveedor, c = C.cliente, B = '#0A0A0A';
    const body = [
      {columns: [{text: [{text: 'PRIME PRODUCTION MEDIA', bold: true, fontSize: 13}, {text: '.', bold: true, fontSize: 13, background: '#C6FF3D'}]}, {text: `Contrato N.º ${C.doc}\nEmitido el ${fechaLarga(C.emitido)}`, alignment: 'right', fontSize: 8, color: '#555'}]},
      {canvas: [{type: 'line', x1: 0, y1: 6, x2: 504, y2: 6, lineWidth: 2.5, lineColor: B}], margin: [0, 0, 0, 14]},
      {text: C.titulo, style: 'title'}, {text: C.subtitulo, color: '#555', margin: [0, 0, 0, 10]},
      {text: C.intro, margin: [0, 0, 0, 8]},
      {table: {widths: ['*', '*'], body: [[
        {stack: [{text: 'EL PROVEEDOR', style: 'k'}, {text: p.nombre, bold: true, margin: [0, 2, 0, 2]}, {text: `${p.detalle}\nDomicilio: ${p.domicilio}.\nRepresentada por: ${p.rep}, ${p.cargo}.\nEmail: ${p.email}`, fontSize: 9}], margin: [6, 6, 6, 6]},
        {stack: [{text: 'EL CLIENTE', style: 'k'}, {text: c.nombre, bold: true, margin: [0, 2, 0, 2]}, {text: `${c.detalle}\nDomicilio: ${S.dom}.\nRepresentada por: ${S.nom}, ${S.car}.\nEmail: ${S.email}`, fontSize: 9}], margin: [6, 6, 6, 6]},
      ]]}, layout: {hLineWidth: () => 1.2, vLineWidth: () => 1.2}, margin: [0, 2, 0, 8]},
      {text: C.partes, margin: [0, 0, 0, 4]},
    ];
    for (const cl of C.clausulas) {
      body.push({text: cl.h.toUpperCase(), style: 'h', headlineLevel: 1});
      for (const it of cl.items) {
        if (it.p) body.push({text: segPdf(it.p), margin: [0, 0, 0, 6]});
        else if (it.ol) body.push({ol: it.ol.map((li) => ({text: segPdf(li), margin: [0, 0, 0, 4]})), margin: [0, 0, 0, 4]});
        else if (it.table) body.push({table: {headerRows: 1, widths: [30, '*', '*', 80], body: [
          ['Pago', 'Vencimiento', 'Concepto', 'Monto'].map((t) => ({text: t, bold: true, color: '#fff', fillColor: B, fontSize: 8})),
          ...C.pagos.map((r) => r.map((x, i) => ({text: x, alignment: i === 3 ? 'right' : 'left'}))),
          [{text: 'Total del Plazo Inicial', colSpan: 3, bold: true, fillColor: '#F1FFD0'}, {}, {}, {text: C.pagosTotal, bold: true, alignment: 'right', fillColor: '#F1FFD0'}],
        ]}, fontSize: 9, margin: [0, 4, 0, 8], unbreakable: true});
      }
    }
    body.push({unbreakable: true, margin: [0, 18, 0, 0], columns: [
      {stack: [{text: 'POR EL PROVEEDOR', style: 'k'}, {image: A.firma, fit: [170, 56], margin: [0, 6, 0, 2]}, {canvas: [{type: 'line', x1: 0, y1: 0, x2: 230, y2: 0, lineWidth: 1}]}, {text: p.nombre, bold: true, margin: [0, 4, 0, 0]}, {text: `${p.rep} · ${p.cargo}`, fontSize: 9}, {text: `Firmado electrónicamente el ${fechaLarga(C.emitido)}`, fontSize: 8, color: '#555'}]},
      {stack: [{text: 'POR EL CLIENTE', style: 'k'}, {image: firmaCliente, fit: [170, 56], margin: [0, 6, 0, 2]}, {canvas: [{type: 'line', x1: 0, y1: 0, x2: 230, y2: 0, lineWidth: 1}]}, {text: c.nombre, bold: true, margin: [0, 4, 0, 0]}, {text: `${S.nom} · ${S.car}`, fontSize: 9}, {text: `Firmado electrónicamente el ${audit.firmadoLargo}`, fontSize: 8, color: '#555'}]},
    ]});
    // certificado de firma
    const r = (k, v) => [{text: k, color: '#555', fontSize: 8.5}, {text: v, fontSize: 8.5}];
    body.push({text: 'CERTIFICADO DE FIRMA ELECTRÓNICA', style: 'title', fontSize: 15, pageBreak: 'before'});
    body.push({text: 'Registro de auditoría generado por el sistema de firma electrónica de Prime Production Media LLC.', color: '#555', margin: [0, 0, 0, 10]});
    body.push({table: {widths: [150, '*'], body: [
      r('Documento', C.titulo), r('Número / versión', `${C.doc} · v${C.version}`),
      r('Huella del contenido (SHA-256)', audit.fingerprint),
      r('Emitido y firmado por el Proveedor', `${p.rep}, ${p.cargo} · ${p.nombre} · ${fechaLarga(C.emitido)}`),
      r('Firmante del Cliente', `${S.nom} · ${S.car} · ${c.nombre}`),
      r('Email verificado', `${S.email} (código de un solo uso enviado desde ${p.email})`),
      r('Email verificado el', new Date(S.verifiedAt).toLocaleString('es-US', {dateStyle: 'long', timeStyle: 'medium'}) + ' (hora del servidor)'),
      r('Firmado el', `${audit.firmadoLargo} · ${audit.firmadoISO}`),
      r('Zona horaria del firmante', audit.tz),
      r('Dirección IP', audit.ip || 'No disponible'),
      r('Dispositivo / navegador', audit.ua),
      r('Método de firma', S.modo === 'draw' ? 'Firma dibujada en pantalla' : 'Nombre escrito como firma'),
      r('Consentimiento', 'Aceptó firmar electrónicamente, la validez de su firma electrónica y recibir su copia por email.'),
      r('Confirmación', 'Escribió «LISTO» antes de firmar.'),
      r('Datos completados por el Cliente', `Domicilio: ${S.dom} · Fecha de inicio: ${fechaLarga(S.ini)}`),
    ]}, layout: {hLineColor: () => '#ddd', vLineColor: () => '#ddd'}});
    body.push({text: 'La copia en PDF se envía al email verificado del firmante y a Prime Production Media LLC. El email de confirmación incluye la huella SHA-256 del archivo PDF para verificar que no fue modificado. Firma electrónica conforme a la ley federal ESIGN (15 U.S.C. § 7001 y ss.) y a la Ley Uniforme de Transacciones Electrónicas de Florida (§ 668.50, Estatutos de Florida).', fontSize: 8, color: '#555', margin: [0, 10, 0, 0]});
    return {
      pageSize: 'LETTER', pageMargins: [54, 54, 54, 54], content: body,
      defaultStyle: {fontSize: 9.6, lineHeight: 1.25, color: B},
      styles: {title: {fontSize: 17, bold: true, margin: [0, 0, 0, 4]}, h: {fontSize: 9.6, bold: true, margin: [0, 10, 0, 4], characterSpacing: 0.4}, k: {fontSize: 7.5, bold: true, characterSpacing: 1}},
      footer: (cur, tot) => ({columns: [{text: `${C.doc} · Prime Production Media LLC`, fontSize: 7, color: '#888'}, {text: `Página ${cur} de ${tot}`, alignment: 'right', fontSize: 7, color: '#888'}], margin: [54, 16, 54, 0]}),
      pageBreakBefore: (node, after) => node.headlineLevel === 1 && after.length === 0,
      info: {title: `${C.doc} · ${C.titulo}`, author: 'Prime Production Media LLC', subject: `Contrato con ${C.cliente.nombre}`},
    };
  }
  const pdfBuffer = (def) => new Promise((res) => pdfMake.createPdf(def).getBuffer((b) => res(b)));
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const ov = (html) => { $('#ovBox').innerHTML = html; $('#ov').hidden = !html; };

  async function getIp() { try { const c = new AbortController(); setTimeout(() => c.abort(), 2500); const r = await fetch('https://api.ipify.org?format=json', {signal: c.signal}); return (await r.json()).ip; } catch (e) { return ''; } }

  $('#bSign').addEventListener('click', async () => {
    if (!ready()) return;
    $('#bSign').disabled = true; msg(3, '');
    ov('<div class="spin"></div><h2>Firmando…</h2><p>Generando tu contrato en PDF y enviando tu copia.</p>');
    try {
      if (document.fonts) await document.fonts.ready;
      const firmaImg = S.modo === 'draw' ? trimmed() : typedImage();
      S.firma = firmaImg; renderPaper();
      const now = new Date();
      const fingerprint = await sha(JSON.stringify({doc: C.doc, version: C.version, titulo: C.titulo, proveedor: C.proveedor, cliente: C.cliente, clausulas: C.clausulas, pagos: C.pagos, campos: campos()}));
      const audit = {fingerprint, firmadoISO: now.toISOString(), firmadoLargo: ahoraLargo(now), tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '', ip: await getIp(), ua: navigator.userAgent.slice(0, 240)};
      const buf = await pdfBuffer(pdfDef(firmaImg, audit));
      const pdfHash = await sha(buf);
      const res = await api({action: 'sign', token: S.token, pdf: b64(buf), pdfHash, fingerprint, signer: {name: S.nom, title: S.car, company: C.cliente.nombre}, fields: campos(), meta: {ip: audit.ip, ua: audit.ua, tz: audit.tz, clientTime: audit.firmadoISO, metodo: S.modo}});
      const url = URL.createObjectURL(new Blob([buf], {type: 'application/pdf'}));
      step(4); done(3);
      try { localStorage.removeItem('ppm_' + C.doc); } catch (e) {}
      ov(`<div class="done-ico">✓</div><h2>¡Contrato firmado!</h2><p>Enviamos tu copia en PDF a <b>${esc(S.email)}</b> desde contact@primeproductionmedia.com.</p>
        <a class="btn btn-g" href="${url}" download="${C.doc}-firmado.pdf" style="width:100%">Descargar mi copia (PDF)</a>
        <button class="btn btn-o" style="width:100%;margin-top:10px" onclick="document.getElementById('ov').hidden=true">Ver el contrato firmado</button>
        <p class="hash">Huella SHA-256 del PDF:<br>${res.hash}</p>`);
      setSigned({signedAt: res.signedAt, name: S.nom, email: S.email});
    } catch (e) {
      ov(''); msg(3, e.message || 'No se pudo firmar. Intenta de nuevo.'); $('#bSign').disabled = false;
    }
  });

  function setSigned(info) {
    $('#chip').textContent = 'Firmado ✓'; $('#firmar').hidden = true; $('#bar').classList.add('hide');
    $('#signedNote').hidden = false;
    $('#signedNote').innerHTML = `<b>Contrato firmado</b> por ${esc(info.name || '')} el ${esc(new Date(info.signedAt).toLocaleString('es-US', {dateStyle: 'long', timeStyle: 'short'}))}. La copia en PDF se envió al email del firmante y a Prime Production Media.`;
  }

  /* barra móvil: se oculta al llegar al panel de firma */
  new IntersectionObserver(([e]) => $('#bar').classList.toggle('hide', e.isIntersecting), {rootMargin: '0px 0px -30% 0px'}).observe($('#firmar'));

  /* ¿ya está firmado? */
  api({action: 'status'}).then((j) => { if (j.signed) setSigned(j.info); }).catch(() => {});
})();

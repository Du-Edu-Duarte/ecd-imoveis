// ECD Imóveis — página do imóvel com tour por cômodos, antes/depois, montagem de móveis e agendamento de visitas
// ECD Tecnologia · github.com/Du-Edu-Duarte
import { configureAuth, guard, authRoute, me } from './ecd-auth.js';
import { roomSVG } from './rooms.js';
configureAuth({ name: 'ECD Imóveis', tagline: 'Seus imóveis com tour por cômodo e visitas agendadas pelo WhatsApp.', bullets: ['Página bonita para cada imóvel', 'Antes e depois e montagem de móveis', 'Leads e visitas em um só lugar'], home: '#/' });

/* ---------------- utilidades ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (n = 8) => [...crypto.getRandomValues(new Uint8Array(n))].map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
const money = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: v % 1 ? 2 : 0 }).format(v || 0);
const parseMoney = v => { const s = String(v || '').replace(/[^\d,.-]/g, ''); if (!s) return 0; return s.includes(',') ? parseFloat(s.replace(/\./g, '').replace(',', '.')) : parseFloat(s.replace(/\.(?=\d{3})/g, '')); };
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
const fmtD = s => s ? s.split('-').reverse().join('/') : '';
const fmtDT = t => new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const phone = t => String(t || '').replace(/\D/g, '');
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 2600); }

/* ---------------- dados ---------------- */
const dbp = new Promise((res, rej) => { const r = indexedDB.open('ecd-imoveis', 1); r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('files'); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const idb = async (st, mode, fn) => { const d = await dbp; return new Promise((res, rej) => { const t = d.transaction(st, mode); const o = fn(t.objectStore(st)); t.oncomplete = () => res(o?.result); t.onerror = () => rej(t.error); }); };
let S = null;
const save = () => { clearTimeout(save._t); save._t = setTimeout(() => idb('kv', 'readwrite', s => s.put(S, 'state')), 120); };
const urls = new Map();
async function src(ref) { if (!ref) return ''; if (ref.svg) return roomSVG(ref.svg, ref.mob); if (ref.file) { if (urls.has(ref.file)) return urls.get(ref.file); const b = await idb('files', 'readonly', s => s.get(ref.file)); const u = b ? URL.createObjectURL(b) : ''; urls.set(ref.file, u); return u; } return ''; }
const imo = id => S.imoveis.find(i => i.id === id);
const STATUS = { disponivel: ['Disponível', 'b-ok'], reservado: ['Reservado', 'b-warn'], vendido: ['Vendido / alugado', 'b-mut'] };
const LSTATUS = { novo: ['Novo', 'b-info'], contatado: ['Contatado', 'b-warn'], visita: ['Visita marcada', 'b-ok'], proposta: ['Proposta', 'b-ok'], perdido: ['Não seguiu', 'b-mut'] };

/* ---------------- móveis para montar ---------------- */
const MOVEIS = {
  sofa: ['Sofá', '<rect x="6" y="22" width="88" height="36" rx="10" fill="#8b8580"/><rect x="2" y="34" width="16" height="30" rx="6" fill="#7c7671"/><rect x="82" y="34" width="16" height="30" rx="6" fill="#7c7671"/><rect x="16" y="40" width="68" height="20" rx="6" fill="#a39d98"/><rect x="10" y="62" width="4" height="6" fill="#555"/><rect x="86" y="62" width="4" height="6" fill="#555"/>', 2.2],
  poltrona: ['Poltrona', '<rect x="22" y="14" width="56" height="44" rx="12" fill="#c58b55"/><rect x="14" y="36" width="72" height="26" rx="10" fill="#d9a46c"/><rect x="20" y="62" width="5" height="12" fill="#5b3f26"/><rect x="75" y="62" width="5" height="12" fill="#5b3f26"/>', 1.1],
  cama: ['Cama', '<rect x="10" y="6" width="80" height="34" rx="6" fill="#8c7a66"/><rect x="4" y="36" width="92" height="30" rx="6" fill="#f2f0ec"/><rect x="4" y="50" width="92" height="18" rx="5" fill="#5f7d8f"/><rect x="16" y="28" width="28" height="12" rx="5" fill="#fff"/><rect x="56" y="28" width="28" height="12" rx="5" fill="#fff"/>', 2.4],
  mesa: ['Mesa', '<ellipse cx="50" cy="34" rx="44" ry="12" fill="#c9a77c"/><rect x="46" y="38" width="8" height="30" fill="#7a5a3a"/><ellipse cx="50" cy="70" rx="20" ry="4" fill="#7a5a3a"/>', 1.5],
  cadeira: ['Cadeira', '<rect x="30" y="10" width="40" height="34" rx="6" fill="#e9e4dc"/><rect x="26" y="42" width="48" height="10" rx="4" fill="#d3ccc0"/><rect x="30" y="52" width="4" height="22" fill="#555"/><rect x="66" y="52" width="4" height="22" fill="#555"/>', .6],
  tv: ['TV e rack', '<rect x="14" y="4" width="72" height="42" rx="3" fill="#20242a"/><rect x="18" y="8" width="64" height="34" fill="#2f3a44"/><rect x="6" y="50" width="88" height="20" rx="3" fill="#efe9df"/><line x1="50" y1="50" x2="50" y2="70" stroke="#d6ccbd" stroke-width="2"/>', 1.6],
  estante: ['Estante', '<rect x="20" y="2" width="60" height="72" fill="#b39a7c"/><g fill="#8c7a66"><rect x="24" y="22" width="52" height="3"/><rect x="24" y="44" width="52" height="3"/></g><rect x="28" y="8" width="8" height="14" fill="#5f7d8f"/><rect x="38" y="10" width="6" height="12" fill="#d9633f"/><rect x="56" y="30" width="14" height="14" fill="#6aa060"/><rect x="30" y="52" width="20" height="16" fill="#e8b04a"/>', 1.4],
  planta: ['Planta', '<path d="M38 52 h24 l-4 22 h-16 z" fill="#d9cbb8"/><path d="M50 52 C 30 40 28 18 42 4 C 40 24 46 36 50 52 Z" fill="#4f7d4a"/><path d="M50 52 C 70 40 74 20 62 8 C 62 26 56 38 50 52 Z" fill="#6aa060"/>', .7],
  tapete: ['Tapete', '<ellipse cx="50" cy="44" rx="48" ry="18" fill="#d9cfc1"/><ellipse cx="50" cy="44" rx="40" ry="13" fill="none" stroke="#c2b6a5" stroke-width="2"/>', 2.6],
  luminaria: ['Luminária', '<line x1="50" y1="24" x2="50" y2="70" stroke="#333" stroke-width="3"/><path d="M34 24 h32 l-6 -20 h-20 z" fill="#f2e6cf"/><ellipse cx="50" cy="71" rx="10" ry="3" fill="#333"/>', .6],
  quadro: ['Quadro', '<rect x="18" y="10" width="64" height="50" fill="#fff" stroke="#c9a77c" stroke-width="4"/><path d="M24 54 l18 -20 l12 12 l10 -14 l14 22 z" fill="#8fb3a8"/>', .9],
  geladeira: ['Geladeira', '<rect x="28" y="2" width="44" height="74" rx="5" fill="#d8dde0"/><line x1="28" y1="28" x2="72" y2="28" stroke="#b8bec3" stroke-width="2"/><rect x="64" y="10" width="3" height="12" fill="#9aa1a8"/><rect x="64" y="34" width="3" height="16" fill="#9aa1a8"/>', 1.2],
};
const movelImg = t => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 78"><ellipse cx="50" cy="74" rx="40" ry="4" fill="#000" opacity=".15"/>${MOVEIS[t][1]}</svg>`);

/* ---------------- modais ---------------- */
function modal(html, w = 600) { const md = $('#modal'); md.hidden = false; md.className = 'modal'; md.innerHTML = `<div class="box" style="width:min(${w}px,100%)">${html}</div>`; md.onclick = e => { if (e.target === md) close(); }; $$('[data-x]', md).forEach(b => b.onclick = close); return md; }
const close = () => { const md = $('#modal'); md.hidden = true; md.innerHTML = ''; md.onclick = null; };
function confirmBox(title, text, ok = 'Confirmar') { return new Promise(res => { const md = modal(`<h2 style="margin-bottom:8px">${esc(title)}</h2><p class="mut">${esc(text)}</p><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" data-a="n">Cancelar</button><button class="btn dark" data-a="y">${esc(ok)}</button></div>`, 440); md.onclick = e => { const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return; close(); res(a === 'y'); }; }); }
const pubURL = i => `${location.origin}${location.pathname}#/imovel/${i.id}`;

/* ---------------- painel do corretor ---------------- */
const view = () => $('#view');
async function Painel() {
  const leads = S.leads; const novos = leads.filter(l => l.status === 'novo').length; const visitas = leads.filter(l => l.data && l.data >= today() && l.status !== 'perdido').length;
  view().innerHTML = `<div class="head"><div><div class="eyebrow">Seus imóveis</div><h1>Cada imóvel com a sua vitrine.</h1><p class="mut" style="margin:6px 0 0">Página com tour por cômodo, antes e depois, montagem de móveis e agendamento de visitas pelo WhatsApp.</p></div><div class="row"><a class="btn" href="#/leads">Leads e visitas${novos ? ` <span class="badge b-info">${novos} novos</span>` : ''}</a><button class="btn primary" id="nI">+ Imóvel</button></div></div>
  <div class="kpis"><div class="card kpi ok"><small>Disponíveis</small><b>${S.imoveis.filter(i => i.status === 'disponivel').length}</b></div><div class="card kpi info"><small>Visitas agendadas</small><b>${visitas}</b></div><div class="card kpi warn"><small>Leads novos</small><b>${novos}</b></div><div class="card kpi"><small>Visualizações das páginas</small><b>${S.imoveis.reduce((a, i) => a + (i.views || 0), 0)}</b></div></div>
  <div class="imgrid">${S.imoveis.map(i => `<div class="card imc"><a href="#/imovel/${i.id}" class="cap"><img data-src="${i.id}" alt=""><span class="badge ${STATUS[i.status][1]}">${STATUS[i.status][0]}</span><span class="fin">${i.finalidade === 'aluguel' ? 'Aluguel' : 'Venda'}</span></a><div class="pad"><div class="price">${money(i.preco)}${i.finalidade === 'aluguel' ? '<small>/mês</small>' : ''}</div><b>${esc(i.titulo)}</b><div class="mut sm">${esc(i.bairro)}, ${esc(i.cidade)}</div>
    <div class="feats">${i.area ? `<span>📐 ${i.area} m²</span>` : ''}<span>🛏 ${i.quartos}</span><span>🛁 ${i.banheiros}</span><span>🚗 ${i.vagas}</span></div>
    <div class="row between sm mut" style="margin-top:8px"><span>👁 ${i.views || 0} visualizações</span><span>${S.leads.filter(l => l.imovel === i.id).length} leads</span></div>
    <div class="row" style="margin-top:12px"><a class="btn sm" href="#/imovel/${i.id}">Ver página</a><a class="btn sm" href="#/editar/${i.id}">Editar</a><button class="btn sm" data-cp="${i.id}">Copiar link</button></div></div></div>`).join('')}</div>`;
  for (const img of $$('img[data-src]')) { const i = imo(img.dataset.src); const c0 = i.comodos[i.capa || 0] || i.comodos[0]; img.src = await src(c0?.proj || c0?.orig); }
  $$('[data-cp]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(pubURL(imo(b.dataset.cp))); toast('Link do imóvel copiado'); } catch { toast(pubURL(imo(b.dataset.cp))); } });
  $('#nI').onclick = () => { const i = novoImovel(); S.imoveis.unshift(i); save(); location.hash = '#/editar/' + i.id; };
}
function novoImovel() { const u = me(); return { id: uid(), titulo: 'Novo imóvel', finalidade: 'venda', tipo: 'Apartamento', preco: 0, condominio: 0, iptu: 0, area: 0, quartos: 2, suites: 0, banheiros: 1, vagas: 1, bairro: '', cidade: '', descricao: '', diferenciais: [], status: 'disponivel', corretor: { nome: u?.nome || '', tel: '' }, comodos: [], views: 0, criadoEm: Date.now() }; }

/* ---------------- editor ---------------- */
async function Editar(id) {
  const i = imo(id); if (!i) return view().innerHTML = '<div class="card pad"><h2>Imóvel não encontrado</h2></div>';
  const KINDS = [['sala', 'Sala'], ['quarto', 'Quarto'], ['cozinha', 'Cozinha'], ['banheiro', 'Banheiro'], ['varanda', 'Varanda']];
  view().innerHTML = `<div class="head"><div><div class="eyebrow">Editar imóvel</div><h1>${esc(i.titulo)}</h1></div><div class="row"><a class="btn" href="#/">← Imóveis</a><a class="btn dark" href="#/imovel/${i.id}">Ver página</a></div></div>
  <div class="g2"><form id="fI" class="card pad formgrid">
    <label class="f full">Título do anúncio<input name="titulo" value="${esc(i.titulo)}" required></label>
    <label class="f">Finalidade<select name="finalidade"><option value="venda" ${i.finalidade === 'venda' ? 'selected' : ''}>Venda</option><option value="aluguel" ${i.finalidade === 'aluguel' ? 'selected' : ''}>Aluguel</option></select></label>
    <label class="f">Tipo<select name="tipo">${['Apartamento', 'Casa', 'Sobrado', 'Studio', 'Cobertura', 'Sala comercial', 'Terreno'].map(t => `<option ${i.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
    <label class="f">Preço (R$)<input name="preco" value="${i.preco ? String(i.preco).replace('.', ',') : ''}"></label>
    <label class="f">Situação<select name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${i.status === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></label>
    <label class="f">Condomínio (R$)<input name="condominio" value="${i.condominio || ''}"></label><label class="f">IPTU por mês (R$)<input name="iptu" value="${i.iptu || ''}"></label>
    <label class="f">Área (m²)<input name="area" type="number" value="${i.area}"></label><label class="f">Quartos<input name="quartos" type="number" min="0" value="${i.quartos}"></label>
    <label class="f">Suítes<input name="suites" type="number" min="0" value="${i.suites}"></label><label class="f">Banheiros<input name="banheiros" type="number" min="0" value="${i.banheiros}"></label>
    <label class="f">Vagas<input name="vagas" type="number" min="0" value="${i.vagas}"></label><label class="f">Bairro<input name="bairro" value="${esc(i.bairro)}"></label>
    <label class="f">Cidade<input name="cidade" value="${esc(i.cidade)}"></label><label class="f">Corretor<input name="cn" value="${esc(i.corretor.nome)}"></label>
    <label class="f">WhatsApp do corretor<input name="ct" value="${esc(i.corretor.tel)}" placeholder="(11) 90000-0000"></label>
    <label class="f full">Descrição<textarea name="descricao" rows="4">${esc(i.descricao)}</textarea></label>
    <label class="f full">Diferenciais (separe por vírgula)<input name="dif" value="${esc(i.diferenciais.join(', '))}" placeholder="Varanda gourmet, Piscina, Portaria 24h"></label>
    <div class="row full between"><button type="button" class="btn" id="delI">Excluir imóvel</button><button class="btn primary">Salvar dados</button></div></form>
  <div class="card pad"><div class="row between"><div><h2>Cômodos do tour</h2><p class="mut sm" style="margin:2px 0 0">Para cada cômodo: foto <b>original</b> (como está) e, se quiser, a foto do <b>projeto</b> (mobiliado / reformado).</p></div><button class="btn sm primary" id="nC">+ Cômodo</button></div>
    <div id="cms" style="margin-top:12px"></div></div></div>`;
  const drawC = async () => {
    $('#cms').innerHTML = i.comodos.map((c, k) => `<div class="cm" data-c="${c.id}"><div class="cm-imgs"><figure><img data-r="orig" alt=""><figcaption>Original</figcaption></figure><figure><img data-r="proj" alt=""><figcaption>Projeto</figcaption></figure></div><div style="flex:1;min-width:0"><input class="cm-n" value="${esc(c.nome)}"><input class="cm-d" value="${esc(c.desc || '')}" placeholder="Descrição curta (ex.: 18 m², sol da manhã)">
      <div class="row" style="gap:6px;margin-top:6px"><label class="btn sm">📷 Original<input type="file" accept="image/*" data-up="orig" hidden></label><label class="btn sm">📷 Projeto<input type="file" accept="image/*" data-up="proj" hidden></label>${c.proj ? '<button class="btn sm" data-np>Tirar projeto</button>' : ''}<button class="iconbtn" data-mv="-1" ${k ? '' : 'disabled'}>↑</button><button class="iconbtn" data-mv="1" ${k < i.comodos.length - 1 ? '' : 'disabled'}>↓</button><button class="btn sm" data-capa ${(i.capa || 0) === k ? 'disabled' : ''}>${(i.capa || 0) === k ? '★ Capa' : 'Usar como capa'}</button><button class="iconbtn" data-rm>✕</button></div></div></div>`).join('') || '<p class="mut">Adicione os cômodos do imóvel.</p>';
    for (const el of $$('.cm')) { const c = i.comodos.find(x => x.id === el.dataset.c); $('[data-r=orig]', el).src = await src(c.orig); const p = $('[data-r=proj]', el); if (c.proj) p.src = await src(c.proj); else p.closest('figure').classList.add('empty'); }
    $$('.cm').forEach(el => { const c = i.comodos.find(x => x.id === el.dataset.c); const k = i.comodos.indexOf(c);
      $('.cm-n', el).onchange = e => { c.nome = e.target.value; save(); }; $('.cm-d', el).onchange = e => { c.desc = e.target.value; save(); };
      $$('[data-up]', el).forEach(inp => inp.onchange = async () => { const f = inp.files[0]; if (!f) return; const fid = uid(); await idb('files', 'readwrite', s => s.put(f, fid)); c[inp.dataset.up] = { file: fid }; save(); drawC(); toast('Foto enviada'); });
      $('[data-capa]', el).onclick = () => { i.capa = k; save(); drawC(); toast('Capa do anúncio atualizada'); };
      const np = $('[data-np]', el); if (np) np.onclick = () => { c.proj = null; save(); drawC(); };
      $$('[data-mv]', el).forEach(b => b.onclick = () => { const j = k + +b.dataset.mv; [i.comodos[k], i.comodos[j]] = [i.comodos[j], i.comodos[k]]; save(); drawC(); });
      $('[data-rm]', el).onclick = async () => { if (await confirmBox('Tirar cômodo?', `"${c.nome}" sai do tour.`, 'Tirar')) { i.comodos = i.comodos.filter(x => x !== c); save(); drawC(); } }; });
  };
  drawC();
  $('#nC').onclick = () => { const md = modal(`<h2 style="margin-bottom:12px">Novo cômodo</h2><form id="fC" class="grid"><label class="f">Nome<input name="n" required placeholder="Ex.: Suíte master"></label><label class="f">Começar com<select name="k"><option value="">Vou enviar minhas fotos</option>${KINDS.map(([k, t]) => `<option value="${k}">Ilustração de exemplo: ${t}</option>`).join('')}</select></label><div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-x>Cancelar</button><button class="btn primary">Adicionar</button></div></form>`, 460); $('#fC').onsubmit = e => { e.preventDefault(); const k = e.target.k.value; i.comodos.push({ id: uid(), nome: e.target.n.value, desc: '', orig: k ? { svg: k, mob: false } : { svg: 'sala', mob: false }, proj: k ? { svg: k, mob: true } : null, layout: [] }); save(); close(); drawC(); }; };
  $('#fI').onsubmit = e => { e.preventDefault(); const f = e.target; Object.assign(i, { titulo: f.titulo.value, finalidade: f.finalidade.value, tipo: f.tipo.value, preco: parseMoney(f.preco.value), status: f.status.value, condominio: parseMoney(f.condominio.value), iptu: parseMoney(f.iptu.value), area: +f.area.value, quartos: +f.quartos.value, suites: +f.suites.value, banheiros: +f.banheiros.value, vagas: +f.vagas.value, bairro: f.bairro.value, cidade: f.cidade.value, descricao: f.descricao.value, diferenciais: f.dif.value.split(',').map(s => s.trim()).filter(Boolean), corretor: { nome: f.cn.value, tel: f.ct.value } }); save(); toast('Dados salvos'); $('.head h1').textContent = i.titulo; };
  $('#delI').onclick = async () => { if (await confirmBox('Excluir imóvel?', 'A página dele deixa de funcionar.', 'Excluir')) { S.imoveis = S.imoveis.filter(x => x !== i); save(); location.hash = '#/'; } };
}

/* ---------------- leads e visitas ---------------- */
function Leads() {
  const ls = S.leads.slice().sort((a, b) => (a.data || '9').localeCompare(b.data || '9') || b.at - a.at);
  view().innerHTML = `<div class="head"><div><div class="eyebrow">Leads e visitas</div><h1>Quem quer conhecer seus imóveis.</h1><p class="mut" style="margin:6px 0 0">Cada pedido de visita feito na página do imóvel chega aqui.</p></div><a class="btn" href="#/">← Imóveis</a></div>
  <div class="card" style="overflow:hidden">${ls.length ? `<table class="list"><thead><tr><th>Pessoa</th><th>Imóvel</th><th>Visita</th><th>Situação</th><th></th></tr></thead><tbody>${ls.map(l => { const i = imo(l.imovel); return `<tr style="cursor:default"><td class="doc-t">${esc(l.nome)}<small>${esc(l.tel)}${l.msg ? ' · 💬 ' + esc(l.msg) : ''}</small></td><td class="sm">${esc(i?.titulo || '—')}</td><td class="sm">${l.data ? `<b>${fmtD(l.data)}</b> · ${esc(l.periodo)}` : '<span class="mut">sem data</span>'}<div class="mut">pedido ${fmtDT(l.at)}</div></td><td><select class="sel" data-ls="${l.id}">${Object.entries(LSTATUS).map(([k, v]) => `<option value="${k}" ${l.status === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></td><td style="white-space:nowrap"><a class="btn sm wa" target="_blank" rel="noopener" href="https://wa.me/55${phone(l.tel)}?text=${encodeURIComponent(`Olá, ${l.nome.split(' ')[0]}! Aqui é ${me()?.nome?.split(' ')[0] || 'o corretor'}, sobre a visita ao imóvel "${i?.titulo || ''}".`)}">WhatsApp</a></td></tr>`; }).join('')}</tbody></table>` : '<div class="empty">Nenhum lead ainda. Compartilhe a página dos imóveis!</div>'}</div>`;
  $$('[data-ls]').forEach(s => s.onchange = () => { S.leads.find(l => l.id === s.dataset.ls).status = s.value; save(); toast('Situação atualizada'); });
}

/* ---------------- página pública do imóvel ---------------- */
async function Pagina(id) {
  const i = imo(id); if (!i) return view().innerHTML = '<div class="card pad" style="text-align:center"><h2>Imóvel não encontrado</h2><p class="mut">Este anúncio não está mais disponível.</p></div>';
  const vk = 'ecd-imv-' + id; try { if (!sessionStorage.getItem(vk)) { i.views = (i.views || 0) + 1; save(); sessionStorage.setItem(vk, '1'); } } catch {}
  let k = 0, mode = i.comodos[0]?.proj ? 'proj' : 'orig';
  const custo = i.finalidade === 'aluguel' ? i.preco + i.condominio + i.iptu : 0;
  view().innerHTML = `<div class="pg-imovel">
   <div class="tour card" id="tour"><div class="stage" id="stage"><img id="imgB" alt=""><div class="cmpwrap" id="cmpW" hidden><img id="imgA" alt=""></div><div class="cmpbar" id="cmpBar" hidden><span></span></div><div class="lay" id="lay"></div>
     <div class="modes"><span class="mut sm" style="color:#d9d2c3">Ver:</span><button data-m="orig">Original</button><button data-m="proj">Projeto</button><button data-m="cmp">Comparar</button><button data-m="mont">Montar</button></div>
     <button class="nav l" id="pv" aria-label="Cômodo anterior">‹</button><button class="nav r" id="nx" aria-label="Próximo cômodo">›</button><button class="fs" id="fs" title="Tela cheia">⛶</button>
     <div class="cap-room"><b id="cn"></b><span id="cd"></span></div></div>
     <div class="palette-m" id="pal" hidden>${Object.entries(MOVEIS).map(([t, [n]]) => `<button data-add="${t}" title="${n}"><img src="${movelImg(t)}" alt=""><span>${n}</span></button>`).join('')}<div class="row" style="gap:6px;margin-left:auto"><button class="btn sm" id="clr">Limpar</button><span class="mut sm" style="color:#cfc6b2">Arraste para mover · roda do mouse ou ⤡ para tamanho · duplo clique remove</span></div></div>
     <div class="thumbs-r" id="thr">${i.comodos.map((c, j) => `<button data-k="${j}"><img data-t="${j}" alt=""><span>${esc(c.nome)}</span></button>`).join('')}</div></div>
   <div class="g2" style="margin-top:18px"><div class="grid">
     <div class="card pad"><div class="row between" style="align-items:flex-start"><div><span class="badge ${STATUS[i.status][1]}">${STATUS[i.status][0]}</span><h1 style="margin-top:8px">${esc(i.titulo)}</h1><div class="mut" style="margin-top:4px">${esc(i.tipo)} · ${esc(i.bairro)}, ${esc(i.cidade)}</div></div><div style="text-align:right"><div class="price big">${money(i.preco)}${i.finalidade === 'aluguel' ? '<small>/mês</small>' : ''}</div><div class="mut sm">${i.condominio ? 'Condomínio ' + money(i.condominio) : ''}${i.iptu ? ' · IPTU ' + money(i.iptu) : ''}</div>${custo ? `<div class="sm"><b>Total por mês: ${money(custo)}</b></div>` : ''}</div></div>
       <div class="feats big">${i.area ? `<span><b>${i.area}</b> m²</span>` : ''}<span><b>${i.quartos}</b> quarto${i.quartos === 1 ? '' : 's'}${i.suites ? ` (${i.suites} suíte${i.suites > 1 ? 's' : ''})` : ''}</span><span><b>${i.banheiros}</b> banheiro${i.banheiros === 1 ? '' : 's'}</span><span><b>${i.vagas}</b> vaga${i.vagas === 1 ? '' : 's'}</span></div>
       <p style="margin:14px 0 0;white-space:pre-line">${esc(i.descricao)}</p>${i.diferenciais.length ? `<div class="chips" style="margin-top:14px">${i.diferenciais.map(d => `<span class="chip lg">✓ ${esc(d)}</span>`).join('')}</div>` : ''}</div>
     ${i.finalidade === 'venda' ? `<div class="card pad"><h2>Simule o financiamento</h2><div class="formgrid" style="margin-top:12px"><label class="f">Entrada (%)<input id="sE" type="number" min="10" max="90" value="20"></label><label class="f">Prazo (anos)<input id="sP" type="number" min="5" max="35" value="30"></label><label class="f">Juros ao ano (%)<input id="sJ" value="10,5"></label><div class="f"><span>Renda sugerida</span><b id="sR" style="font-size:18px"></b></div></div><div class="simres" id="sOut"></div><p class="mut sm" style="margin:8px 0 0">Simulação aproximada, sem seguros e taxas. Os valores reais dependem do banco.</p></div>` : ''}
   </div><div class="grid" style="align-self:start;position:sticky;top:84px">
     <div class="card pad"><h2>Agende uma visita</h2><p class="mut sm" style="margin:2px 0 12px">Escolha o dia e o período e fale direto com ${esc(i.corretor.nome.split(' ')[0] || 'o corretor')}.</p>
       <form id="fV" class="grid"><label class="f">Seu nome<input name="nome" required autocomplete="name"></label><label class="f">WhatsApp<input name="tel" required inputmode="tel" placeholder="(11) 90000-0000"></label><div class="formgrid"><label class="f">Dia<input name="data" type="date" min="${today()}" value="${addDays(today(), 2)}" required></label><label class="f">Período<select name="per"><option>Manhã</option><option selected>Tarde</option><option>Noite</option></select></label></div><label class="f">Mensagem (opcional)<input name="msg" placeholder="Ex.: aceita pet?"></label><button class="btn primary">Agendar pelo WhatsApp</button></form></div>
     <div class="card pad"><h3>Compartilhar</h3><div class="row" style="margin-top:8px"><a class="btn sm wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Olha este imóvel: ${i.titulo}\n${pubURL(i)}`)}">WhatsApp</a><button class="btn sm" id="cpL">Copiar link</button></div></div></div></div></div>`;
  const stage = $('#stage');
  const layKey = () => 'ecd-imv-lay-' + id + '-' + i.comodos[k].id;
  let layout = [];
  const loadLay = () => { try { layout = JSON.parse(localStorage.getItem(layKey()) || 'null') || []; } catch { layout = []; } if (!layout.length && i.comodos[k].layout?.length) layout = JSON.parse(JSON.stringify(i.comodos[k].layout)); };
  const saveLay = () => { try { localStorage.setItem(layKey(), JSON.stringify(layout)); } catch {} };
  const drawLay = () => { $('#lay').innerHTML = mode === 'mont' ? layout.map((m, j) => `<div class="mv" data-j="${j}" style="left:${m.x * 100}%;top:${m.y * 100}%;width:${m.s * 100}%;transform:translate(-50%,-50%) scaleX(${m.f ? -1 : 1})"><img src="${movelImg(m.t)}" alt="${MOVEIS[m.t][0]}"><span class="h">⤡</span></div>`).join('') : ''; };
  const show = async () => {
    const c = i.comodos[k]; if (!c) return; $('#cn').textContent = c.nome; $('#cd').textContent = c.desc || '';
    const hasP = !!c.proj; $$('[data-m]').forEach(b => { b.classList.toggle('on', b.dataset.m === mode); b.disabled = !hasP && (b.dataset.m === 'proj' || b.dataset.m === 'cmp'); });
    if (!hasP && (mode === 'proj' || mode === 'cmp')) mode = 'orig';
    $('#imgB').src = await src(mode === 'proj' ? c.proj : c.orig);
    $('#cmpW').hidden = $('#cmpBar').hidden = mode !== 'cmp'; if (mode === 'cmp') { $('#imgB').src = await src(c.proj); $('#imgA').src = await src(c.orig); setCmp(.5); }
    $('#pal').hidden = mode !== 'mont'; if (mode === 'mont') { $('#imgB').src = await src(c.orig); loadLay(); } drawLay();
    $$('#thr button').forEach((b, j) => b.classList.toggle('on', j === k));
  };
  const setCmp = p => { $('#cmpW').style.width = p * 100 + '%'; $('#cmpBar').style.left = p * 100 + '%'; $('#imgA').style.width = stage.clientWidth + 'px'; };
  for (const im of $$('[data-t]')) { const c = i.comodos[+im.dataset.t]; im.src = await src(c.proj || c.orig); }
  $$('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; show(); });
  $$('#thr button').forEach(b => b.onclick = () => { k = +b.dataset.k; show(); });
  $('#pv').onclick = () => { k = (k - 1 + i.comodos.length) % i.comodos.length; show(); }; $('#nx').onclick = () => { k = (k + 1) % i.comodos.length; show(); };
  $('#fs').onclick = () => { const t = $('#tour'); document.fullscreenElement ? document.exitFullscreen() : t.requestFullscreen?.().catch(() => t.classList.toggle('full')); };
  const onKey = e => { if (!document.body.contains(stage)) return removeEventListener('keydown', onKey); if (e.target.closest('input,select,textarea')) return; if (e.key === 'ArrowRight') $('#nx').click(); if (e.key === 'ArrowLeft') $('#pv').click(); }; addEventListener('keydown', onKey);
  // comparar: arrastar a barra
  stage.addEventListener('pointerdown', e => {
    const r = stage.getBoundingClientRect(); const rel = ev => [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
    if (mode === 'cmp' && !e.target.closest('button')) { const mv = ev => setCmp(Math.max(0, Math.min(1, rel(ev)[0]))); mv(e); const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); }; addEventListener('pointermove', mv); addEventListener('pointerup', up); return; }
    const el = e.target.closest('.mv'); if (mode !== 'mont' || !el) return; e.preventDefault(); const m = layout[+el.dataset.j]; const [sx, sy] = rel(e); const o = { ...m }; const rs = e.target.classList.contains('h');
    const mv = ev => { const [x, y] = rel(ev); if (rs) m.s = Math.max(.04, Math.min(.8, o.s + (x - sx) * 1.6)); else { m.x = Math.max(0, Math.min(1, o.x + x - sx)); m.y = Math.max(0, Math.min(1, o.y + y - sy)); } Object.assign(el.style, { left: m.x * 100 + '%', top: m.y * 100 + '%', width: m.s * 100 + '%' }); };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); saveLay(); }; addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  stage.addEventListener('wheel', e => { const el = e.target.closest('.mv'); if (mode !== 'mont' || !el) return; e.preventDefault(); const m = layout[+el.dataset.j]; m.s = Math.max(.04, Math.min(.8, m.s * (e.deltaY < 0 ? 1.08 : .92))); el.style.width = m.s * 100 + '%'; saveLay(); }, { passive: false });
  stage.addEventListener('dblclick', e => { const el = e.target.closest('.mv'); if (!el) return; layout.splice(+el.dataset.j, 1); saveLay(); drawLay(); });
  $$('[data-add]').forEach(b => b.onclick = () => { const t = b.dataset.add; layout.push({ t, x: .5, y: .68, s: .12 * MOVEIS[t][2] }); saveLay(); drawLay(); });
  $('#clr').onclick = () => { layout = []; saveLay(); drawLay(); };
  addEventListener('resize', () => mode === 'cmp' && setCmp(parseFloat($('#cmpW').style.width) / 100 || .5));
  // simulador
  const sim = () => { const out = $('#sOut'); if (!out) return; const E = +$('#sE').value / 100, n = +$('#sP').value * 12, j = Math.pow(1 + parseMoney($('#sJ').value) / 100, 1 / 12) - 1; const fin = i.preco * (1 - E); const price = j ? fin * j / (1 - Math.pow(1 + j, -n)) : fin / n; const sac1 = fin / n + fin * j, sacN = fin / n + (fin / n) * j;
    out.innerHTML = `<div><small>Entrada</small><b>${money(i.preco * E)}</b></div><div><small>Financiado</small><b>${money(fin)}</b></div><div><small>Parcela fixa (Price)</small><b>${money(price)}</b></div><div><small>SAC: 1ª → última</small><b>${money(sac1)} → ${money(sacN)}</b></div>`; $('#sR').textContent = money(Math.max(price, sac1) / .3); };
  ['sE', 'sP', 'sJ'].forEach(x => { const el = $('#' + x); if (el) el.oninput = sim; }); sim();
  // agendar
  $('#fV').onsubmit = e => { e.preventDefault(); const f = e.target; const l = { id: uid(), imovel: i.id, nome: f.nome.value.trim(), tel: f.tel.value.trim(), data: f.data.value, periodo: f.per.value, msg: f.msg.value.trim(), status: 'novo', at: Date.now() }; S.leads.push(l); save();
    const txt = `Olá${i.corretor.nome ? ', ' + i.corretor.nome.split(' ')[0] : ''}! Sou ${l.nome} e quero visitar o imóvel "${i.titulo}" (${i.bairro}) no dia ${fmtD(l.data)}, período da ${l.periodo.toLowerCase()}.${l.msg ? ' ' + l.msg : ''}\n${pubURL(i)}`;
    window.open(`https://wa.me/${phone(i.corretor.tel) ? '55' + phone(i.corretor.tel) : ''}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
    f.closest('.card').innerHTML = `<div style="text-align:center;padding:16px"><div style="font-size:44px">📅</div><h2>Pedido enviado!</h2><p class="mut">Visita para ${fmtD(l.data)} (${l.periodo.toLowerCase()}). ${esc(i.corretor.nome.split(' ')[0] || 'O corretor')} vai confirmar pelo WhatsApp.</p></div>`; };
  $('#cpL').onclick = async () => { try { await navigator.clipboard.writeText(pubURL(i)); toast('Link copiado'); } catch { toast(pubURL(i)); } };
  show();
}

/* ---------------- exemplos fictícios ---------------- */
function seed() {
  const c = (nome, kind, desc, proj = true) => ({ id: uid(), nome, desc, orig: { svg: kind, mob: false }, proj: proj ? { svg: kind, mob: true } : null, layout: [] });
  S = { v: 1, leads: [], imoveis: [
    { id: uid(), titulo: 'Apartamento com varanda gourmet perto do centro', finalidade: 'venda', tipo: 'Apartamento', preco: 489000, condominio: 620, iptu: 95, area: 68, quartos: 2, suites: 1, banheiros: 2, vagas: 1, bairro: 'Centro', cidade: 'Barueri/SP', descricao: 'Apartamento claro e bem ventilado, com varanda gourmet integrada à sala e sol da manhã.\nCondomínio com portaria 24h, academia e salão de festas. A 5 minutos da estação de trem.', diferenciais: ['Varanda gourmet', 'Portaria 24h', 'Academia', 'Aceita financiamento', 'Perto da estação'], status: 'disponivel', capa: 1, corretor: { nome: 'Eduardo Costa Duarte', tel: '' }, views: 214, criadoEm: Date.now(),
      comodos: [c('Sala de estar', 'sala', '22 m² · integrada à varanda'), c('Varanda gourmet', 'varanda', 'Vista livre, ponto para churrasqueira'), c('Cozinha', 'cozinha', 'Planejada, com área de serviço'), c('Suíte', 'quarto', '14 m² · armários embutidos'), c('Banheiro da suíte', 'banheiro', 'Box de vidro, ventilação natural')] },
    { id: uid(), titulo: 'Casa térrea com quintal em rua tranquila', finalidade: 'venda', tipo: 'Casa', preco: 395000, condominio: 0, iptu: 70, area: 110, quartos: 3, suites: 1, banheiros: 2, vagas: 2, bairro: 'Jardim Paraíso', cidade: 'Araçariguama/SP', descricao: 'Casa térrea em rua sem saída, com quintal amplo nos fundos e garagem para 2 carros. Pronta para morar.', diferenciais: ['Quintal', 'Rua sem saída', '2 vagas', 'Documentação ok'], status: 'disponivel', capa: 1, corretor: { nome: 'Eduardo Costa Duarte', tel: '' }, views: 97, criadoEm: Date.now(),
      comodos: [c('Sala', 'sala', 'Piso de madeira'), c('Quarto 1', 'quarto', 'Sol da tarde'), c('Cozinha', 'cozinha', 'Ampla, com copa'), c('Banheiro', 'banheiro', 'Reformado em 2025', false)] },
    { id: uid(), titulo: 'Studio mobiliado para alugar', finalidade: 'aluguel', tipo: 'Studio', preco: 2300, condominio: 480, iptu: 60, area: 32, quartos: 1, suites: 0, banheiros: 1, vagas: 0, bairro: 'Alphaville', cidade: 'Santana de Parnaíba/SP', descricao: 'Studio mobiliado, ideal para quem trabalha na região. Contas de água e gás inclusas no condomínio.', diferenciais: ['Mobiliado', 'Aceita pet', 'Lavanderia no prédio'], status: 'reservado', corretor: { nome: 'Eduardo Costa Duarte', tel: '' }, views: 156, criadoEm: Date.now(),
      comodos: [c('Ambiente integrado', 'sala', 'Sala e quarto no mesmo espaço'), c('Cozinha', 'cozinha', 'Compacta e equipada'), c('Banheiro', 'banheiro', '')] },
  ] };
  const i0 = S.imoveis[0].id, i1 = S.imoveis[1].id, i2 = S.imoveis[2].id;
  S.leads = [{ id: uid(), imovel: i0, nome: 'Mariana Torres', tel: '(11) 90000-1111', data: addDays(today(), 2), periodo: 'Tarde', msg: 'Aceita FGTS?', status: 'visita', at: Date.now() - 864e5 }, { id: uid(), imovel: i0, nome: 'Lucas Ferreira', tel: '(11) 90000-2222', data: addDays(today(), 4), periodo: 'Manhã', msg: '', status: 'novo', at: Date.now() - 36e5 * 3 }, { id: uid(), imovel: i1, nome: 'Família Gomes', tel: '(11) 90000-3333', data: addDays(today(), 1), periodo: 'Noite', msg: 'Tem espaço para 2 carros?', status: 'novo', at: Date.now() - 36e5 }, { id: uid(), imovel: i2, nome: 'Renato Alves', tel: '(11) 90000-4444', data: '', periodo: '', msg: 'Ainda disponível?', status: 'contatado', at: Date.now() - 2 * 864e5 }];
}

/* ---------------- roteador ---------------- */
async function route() {
  const h = location.hash.replace(/^#\/?/, '').split('?')[0].split('/');
  if (!guard(h[0], ['imovel'])) return;
  const pub = h[0] === 'imovel'; $('.top nav').style.display = me() ? '' : 'none'; $('.demo-bar').hidden = pub && !me(); document.body.classList.toggle('wide', pub);
  $('#modal').hidden = true; window.scrollTo(0, 0);
  try { if (authRoute(h[0])) return; if (pub) return Pagina(h[1]); if (h[0] === 'editar') return Editar(h[1]); if (h[0] === 'leads') return Leads(); Painel(); }
  catch (e) { console.error(e); view().innerHTML = `<div class="card pad"><h2>Algo deu errado</h2><p class="mut">${esc(e.message || e)}</p></div>`; }
}
$('#resetDemo').onclick = async () => { if (!(await confirmBox('Restaurar exemplos?', 'Apaga os imóveis e leads deste navegador e recoloca os exemplos fictícios.', 'Restaurar'))) return; seed(); await idb('kv', 'readwrite', s => s.put(S, 'state')); location.hash = '#/'; route(); };
window.addEventListener('hashchange', route);
(async () => { S = await idb('kv', 'readonly', s => s.get('state')); if (!S || S.v !== 1) { seed(); await idb('kv', 'readwrite', s => s.put(S, 'state')); } route(); })();

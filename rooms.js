// Ilustrações próprias dos cômodos (vazio e mobiliado), em SVG. Sem fotos de terceiros.
const W = 1200, H = 750, VX = 600, VY = 330;
const BW = { x1: 300, y1: 150, x2: 900, y2: 520 };
const P = {
  sala: { wall: '#ece6dc', side: '#e2dbcf', ceil: '#f6f3ee', floor: '#b98a5e', floor2: '#a77a50' },
  quarto: { wall: '#e3e7ea', side: '#d6dce0', ceil: '#f5f6f7', floor: '#c69c72', floor2: '#b38a61' },
  cozinha: { wall: '#eef0ee', side: '#e1e4e1', ceil: '#f7f8f7', floor: '#cfcac2', floor2: '#bdb7ae', tile: true },
  banheiro: { wall: '#e9eef0', side: '#dbe3e6', ceil: '#f7f9fa', floor: '#d5d2cc', floor2: '#c4c0b9', tile: true, wallTile: true },
  varanda: { wall: '#e8e1d6', side: '#ddd5c8', ceil: '#f4f1ec', floor: '#a9a39a', floor2: '#97918a', tile: true, open: true },
};
const poly = (pts, fill, extra = '') => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
function floorLines(c) {
  let s = '';
  if (c.tile) {
    for (let i = -6; i <= 18; i++) { const x = i * 100; s += `<line x1="${x}" y1="${H}" x2="${VX + (x - VX) * 0.0}" y2="${VY}" stroke="${c.floor2}" stroke-width="2" clip-path="url(#floor)"/>`; }
    [540, 575, 620, 680, 750].forEach(y => s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${c.floor2}" stroke-width="2" clip-path="url(#floor)"/>`);
  } else {
    for (let i = -10; i <= 22; i++) { const x = i * 60; s += `<line x1="${x}" y1="${H}" x2="${VX}" y2="${VY}" stroke="${c.floor2}" stroke-width="1.6" clip-path="url(#floor)" opacity=".8"/>`; }
    for (let k = 0; k < 40; k++) { const y = 525 + Math.pow(k / 40, 1.6) * 225, x = (k * 137) % W; s += `<line x1="${x}" y1="${y}" x2="${x + 40 + (k % 3) * 20}" y2="${y}" stroke="${c.floor2}" stroke-width="1.4" clip-path="url(#floor)" opacity=".6"/>`; }
  }
  return s;
}
function shell(kind) {
  const c = P[kind];
  let s = `<defs><clipPath id="floor"><polygon points="0,${H} ${W},${H} ${BW.x2},${BW.y2} ${BW.x1},${BW.y2}"/></clipPath>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc7e6"/><stop offset="1" stop-color="#e7f1f7"/></linearGradient>
    <linearGradient id="light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>`;
  s += poly([[0, 0], [W, 0], [BW.x2, BW.y1], [BW.x1, BW.y1]], c.ceil);
  s += poly([[0, 0], [BW.x1, BW.y1], [BW.x1, BW.y2], [0, H]], c.side);
  s += poly([[W, 0], [BW.x2, BW.y1], [BW.x2, BW.y2], [W, H]], c.side, 'opacity=".96"');
  s += `<rect x="${BW.x1}" y="${BW.y1}" width="${BW.x2 - BW.x1}" height="${BW.y2 - BW.y1}" fill="${c.wall}"/>`;
  if (c.wallTile) { for (let x = BW.x1; x < BW.x2; x += 50) s += `<line x1="${x}" y1="${BW.y1}" x2="${x}" y2="${BW.y2}" stroke="#d3dbde" stroke-width="1.5"/>`; for (let y = BW.y1; y < BW.y2; y += 50) s += `<line x1="${BW.x1}" y1="${y}" x2="${BW.x2}" y2="${y}" stroke="#d3dbde" stroke-width="1.5"/>`; }
  s += poly([[0, H], [W, H], [BW.x2, BW.y2], [BW.x1, BW.y2]], c.floor) + floorLines(c);
  // rodapé
  s += `<rect x="${BW.x1}" y="${BW.y2 - 10}" width="${BW.x2 - BW.x1}" height="10" fill="#fff" opacity=".85"/>`;
  s += poly([[0, H - 26], [BW.x1, BW.y2 - 10], [BW.x1, BW.y2], [0, H]], '#fff', 'opacity=".75"') + poly([[W, H - 26], [BW.x2, BW.y2 - 10], [BW.x2, BW.y2], [W, H]], '#fff', 'opacity=".7"');
  // janela / abertura
  if (c.open) {
    s += `<rect x="${BW.x1 + 20}" y="${BW.y1 + 20}" width="${BW.x2 - BW.x1 - 40}" height="${BW.y2 - BW.y1 - 30}" fill="url(#sky)"/>`;
    s += `<path d="M${BW.x1 + 20} ${BW.y2 - 120} q 80 -60 160 -20 t 160 -10 t 140 -30 t 100 20 V ${BW.y2 - 10} H ${BW.x1 + 20} Z" fill="#8fb38a" opacity=".8"/>`;
    for (let i = 0; i < 9; i++) s += `<rect x="${BW.x1 + 40 + i * 62}" y="${BW.y2 - 200 + (i % 3) * 18}" width="40" height="${190 - (i % 3) * 18}" fill="#b7c3cc" opacity=".55"/>`;
    s += `<rect x="${BW.x1 + 20}" y="${BW.y2 - 110}" width="${BW.x2 - BW.x1 - 40}" height="100" fill="#cfe6f2" opacity=".35" stroke="#9db4c0" stroke-width="3"/>`;
    s += `<line x1="${BW.x1 + 20}" y1="${BW.y2 - 110}" x2="${BW.x2 - 20}" y2="${BW.y2 - 110}" stroke="#6f7c84" stroke-width="6"/>`;
  } else if (kind !== 'banheiro') {
    const wx = kind === 'cozinha' ? 640 : 520, ww = kind === 'cozinha' ? 200 : 220;
    s += `<rect x="${wx}" y="200" width="${ww}" height="170" fill="url(#sky)" stroke="#fff" stroke-width="10"/><line x1="${wx + ww / 2}" y1="200" x2="${wx + ww / 2}" y2="370" stroke="#fff" stroke-width="6"/>`;
    s += `<rect x="${wx - 6}" y="370" width="${ww + 12}" height="10" fill="#fff"/>`;
    s += poly([[wx, 380], [wx + ww, 380], [wx + ww + 120, 640], [wx - 120, 640]], 'url(#light)', 'opacity=".55"');
  }
  // porta na parede direita
  if (!c.open) s += poly([[1010, 205], [1110, 150], [1110, 712], [1010, 600]], '#fff', 'opacity=".9"') + poly([[1022, 222], [1098, 180], [1098, 690], [1022, 588]], kind === 'banheiro' ? '#e2e7ea' : '#d9cbb8') + `<circle cx="1036" cy="410" r="6" fill="#8a7a66"/>`;
  // luminária de teto
  s += `<ellipse cx="${VX}" cy="70" rx="70" ry="10" fill="#fff" opacity=".9"/><ellipse cx="${VX}" cy="72" rx="40" ry="5" fill="#fff8e1"/>`;
  return s;
}
const box = (x, y, w, h, fill, r = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".18"/>`;
const plant = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">${shadow(0, 4, 38, 9)}<path d="M-26 -60 L26 -60 L20 0 L-20 0 Z" fill="#d9cbb8"/><path d="M0 -60 C -60 -110 -50 -170 -10 -200 C -20 -150 -5 -120 0 -60 Z" fill="#4f7d4a"/><path d="M0 -60 C 50 -100 70 -160 30 -190 C 30 -140 15 -110 0 -60 Z" fill="#5f9156"/><path d="M0 -60 C -20 -120 10 -170 0 -230 C 25 -170 15 -110 0 -60 Z" fill="#6aa060"/></g>`;
function furniture(kind) {
  let s = '';
  if (kind === 'sala') {
    s += `<rect x="440" y="215" width="70" height="90" fill="#c9a77c" stroke="#fff" stroke-width="6"/><rect x="450" y="225" width="50" height="70" fill="#8fb3a8"/>`;
    s += shadow(600, 690, 330, 40) + `<ellipse cx="600" cy="660" rx="300" ry="62" fill="#d9cfc1"/><ellipse cx="600" cy="660" rx="260" ry="48" fill="none" stroke="#c2b6a5" stroke-width="3"/>`;
    s += shadow(600, 545, 270, 22) + box(345, 395, 510, 120, '#8b8580', 18) + box(330, 440, 60, 105, '#7c7671', 14) + box(810, 440, 60, 105, '#7c7671', 14) + box(380, 455, 440, 80, '#9a948f', 12);
    s += box(395, 410, 135, 70, '#a8a29d', 14) + box(535, 410, 135, 70, '#a8a29d', 14) + box(675, 410, 135, 70, '#a8a29d', 14);
    s += `<rect x="420" y="425" width="62" height="52" rx="10" fill="#e8d6b4" transform="rotate(-8 451 451)"/><rect x="720" y="425" width="62" height="52" rx="10" fill="#6f8a64" transform="rotate(8 751 451)"/>`;
    s += shadow(600, 668, 95, 14) + `<ellipse cx="600" cy="612" rx="95" ry="24" fill="#f3efe9"/><rect x="595" y="615" width="10" height="50" fill="#a07850"/>${box(570, 590, 22, 22, '#6aa060', 11)}`;
    s += poly([[40, 470], [170, 500], [170, 640], [40, 640]], '#efe9df') + poly([[40, 470], [170, 500], [170, 512], [40, 482]], '#d6ccbd') + poly([[60, 330], [165, 365], [165, 470], [60, 445]], '#20242a') + poly([[66, 338], [159, 370], [159, 464], [66, 437]], '#2f3a44');
    s += plant(980, 640, 1.1) + `<line x1="880" y1="520" x2="880" y2="300" stroke="#3a3a3a" stroke-width="5"/><path d="M850 300 h60 l-12 -50 h-36 z" fill="#f2e6cf"/>${shadow(880, 524, 28, 6)}`;
  }
  if (kind === 'quarto') {
    s += `<rect x="470" y="200" width="260" height="110" fill="#d7c7b0" stroke="#fff" stroke-width="6"/><path d="M480 300 l70 -60 l50 40 l60 -55 l60 60 v15 h-240 z" fill="#9db7c9"/>`;
    s += shadow(600, 700, 300, 34) + box(370, 300, 460, 170, '#8c7a66', 14);
    s += poly([[360, 470], [840, 470], [920, 690], [280, 690]], '#f2f0ec') + poly([[280, 690], [920, 690], [920, 712], [280, 712]], '#dcd8d1');
    s += poly([[330, 560], [870, 560], [905, 660], [295, 660]], '#5f7d8f') + poly([[295, 660], [905, 660], [910, 690], [290, 690]], '#4f6b7c');
    s += box(410, 405, 170, 70, '#fff', 20) + box(620, 405, 170, 70, '#fff', 20) + box(470, 440, 260, 48, '#c9d6de', 16);
    s += shadow(300, 528, 55, 8) + box(250, 440, 100, 85, '#b39a7c', 6) + `<line x1="300" y1="440" x2="300" y2="380" stroke="#555" stroke-width="4"/><path d="M276 380 h48 l-10 -40 h-28 z" fill="#f5ead3"/>`;
    s += shadow(900, 528, 55, 8) + box(850, 440, 100, 85, '#b39a7c', 6) + plant(900, 440, .45);
    s += poly([[40, 140], [200, 190], [200, 640], [40, 700]], '#e9e2d6') + `<line x1="120" y1="166" x2="120" y2="670" stroke="#cfc4b3" stroke-width="3"/><circle cx="108" cy="420" r="5" fill="#9a8a74"/><circle cx="132" cy="420" r="5" fill="#9a8a74"/>`;
  }
  if (kind === 'cozinha') {
    s += box(330, 170, 290, 110, '#5f6f62', 4) + [0, 1, 2].map(i => `<line x1="${330 + i * 97 + 97}" y1="172" x2="${330 + i * 97 + 97}" y2="278" stroke="#4d5c50" stroke-width="3"/><rect x="${330 + i * 97 + 80}" y="255" width="10" height="4" fill="#cfd5cf"/>`).join('');
    s += box(320, 395, 560, 125, '#5f6f62', 4) + box(312, 382, 576, 18, '#e9e4dc', 3) + [0, 1, 2, 3, 4].map(i => `<line x1="${320 + i * 112}" y1="400" x2="${320 + i * 112}" y2="520" stroke="#4d5c50" stroke-width="3"/><rect x="${320 + i * 112 + 46}" y="410" width="20" height="4" fill="#cfd5cf"/>`).join('');
    s += box(690, 360, 80, 24, '#b9bec4', 4) + `<path d="M720 360 v-40 h30" stroke="#9aa1a8" stroke-width="7" fill="none"/>` + box(400, 368, 90, 16, '#2b2f33', 3);
    s += poly([[30, 120], [200, 175], [200, 600], [30, 680]], '#d8dde0') + poly([[30, 380], [200, 390], [200, 395], [30, 386]], '#b8bec3') + `<rect x="175" y="250" width="8" height="90" fill="#9aa1a8"/><rect x="175" y="420" width="8" height="90" fill="#9aa1a8"/>`;
    s += shadow(640, 715, 190, 24) + `<ellipse cx="640" cy="620" rx="190" ry="44" fill="#c9a77c"/><ellipse cx="640" cy="628" rx="190" ry="44" fill="#a7835a" opacity=".5"/><rect x="630" y="640" width="20" height="70" fill="#7a5a3a"/>`;
    [[440, 640], [840, 640], [560, 700], [720, 700]].forEach(([x, y]) => s += box(x - 32, y - 70, 64, 50, '#e9e4dc', 8) + box(x - 30, y - 22, 60, 16, '#d3ccc0', 5) + `<rect x="${x - 24}" y="${y - 8}" width="5" height="40" fill="#555"/><rect x="${x + 19}" y="${y - 8}" width="5" height="40" fill="#555"/>`);
    s += plant(560, 600, .35) + `<circle cx="700" cy="604" r="16" fill="#e8b04a"/><circle cx="722" cy="608" r="12" fill="#d9633f"/>`;
  }
  if (kind === 'banheiro') {
    s += box(380, 180, 220, 160, '#cfe0e8', 10) + `<rect x="380" y="180" width="220" height="160" rx="10" fill="none" stroke="#b9c3c8" stroke-width="6"/><path d="M400 200 l60 0 l-60 60 z" fill="#fff" opacity=".5"/>`;
    s += box(350, 380, 280, 120, '#8c7a66', 6) + box(340, 370, 300, 18, '#f4f4f2', 4) + `<ellipse cx="490" cy="372" rx="70" ry="9" fill="#e3e6e8"/><path d="M490 370 v-28 h22" stroke="#9aa1a8" stroke-width="6" fill="none"/><line x1="490" y1="400" x2="490" y2="495" stroke="#7a6a58" stroke-width="3"/>`;
    s += `<rect x="680" y="160" width="200" height="360" fill="#dff0f6" opacity=".55" stroke="#a9bcc4" stroke-width="5"/><circle cx="780" cy="190" r="18" fill="#9aa1a8"/><line x1="780" y1="208" x2="780" y2="240" stroke="#9aa1a8" stroke-width="4" stroke-dasharray="3 7"/>`;
    s += shadow(270, 700, 70, 12) + `<path d="M220 560 h100 v40 a50 40 0 0 1 -100 0 z" fill="#fafafa"/><rect x="225" y="470" width="90" height="95" rx="10" fill="#fafafa"/><ellipse cx="270" cy="600" rx="50" ry="14" fill="#e6e8ea"/>`;
    s += plant(560, 690, .5) + box(400, 600, 180, 60, '#9bb7c4', 16);
  }
  if (kind === 'varanda') {
    s += shadow(600, 700, 300, 30) + poly([[340, 560], [860, 560], [960, 700], [240, 700]], '#d8cbb6');
    [[430, 600], [770, 600]].forEach(([x, y]) => s += shadow(x, y + 60, 70, 12) + box(x - 70, y - 70, 140, 40, '#c08a54', 10) + box(x - 75, y - 34, 150, 50, '#d9a46c', 12) + `<rect x="${x - 66}" y="${y + 14}" width="8" height="42" fill="#6b4a2e"/><rect x="${x + 58}" y="${y + 14}" width="8" height="42" fill="#6b4a2e"/>` + box(x - 55, y - 60, 110, 34, '#f1e7d6', 10));
    s += shadow(600, 676, 60, 10) + `<ellipse cx="600" cy="640" rx="60" ry="16" fill="#2f3a44"/><rect x="595" y="642" width="10" height="34" fill="#2f3a44"/>` + `<circle cx="590" cy="630" r="10" fill="#fff"/>`;
    s += plant(250, 700, 1.1) + plant(960, 700, 1.2) + plant(140, 610, .7);
    s += `<path d="M310 160 q 290 60 580 0" stroke="#f4d58d" stroke-width="3" fill="none"/>` + [0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${330 + i * 90}" cy="${172 + Math.sin(i / 6 * Math.PI) * 26}" r="8" fill="#ffe7a3"/>`).join('');
  }
  return s;
}
const cache = {};
export function roomSVG(kind, furnished) {
  const k = kind + furnished; if (cache[k]) return cache[k];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${shell(kind)}${furnished ? furniture(kind) : ''}<rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
  return cache[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
export const ROOM_KINDS = Object.keys(P);

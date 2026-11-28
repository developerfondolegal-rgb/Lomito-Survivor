// ===============================================================
//  CARTAS DE RAZA "COLECCIONABLES" (v0.38) para el menú (src/scenes/MenuScene.js)
//  Marco dorado con rombos en las esquinas, placa con el nombre, ventana con
//  el perro sobre un fondo propio de cada raza, pergamino con frase y stats,
//  y placa del poder abajo. Solo es dibujo: no cambia nada de la partida.
//
//  Los fondos se dibujan con código en un canvas chico (1 píxel del canvas =
//  2 píxeles en pantalla, para que se vean pixelados). Para una raza nueva,
//  agrega su función en FONDOS_RAZA (si no tiene, usa la de 'quiltro').
// ===============================================================

// Letra de los nombres: Cinzel (Google Fonts, en index.html). Si no carga, una serif del equipo
const FUENTE_CARTA = 'Cinzel, Georgia, "Times New Roman", serif';
const FUENTE_FRASE = 'Georgia, "Times New Roman", serif';

const CARTA_COLORES = {
  borde: 0x120c06,        // borde oscuro de afuera
  oro: 0xd4a537,          // marco dorado
  oroClaro: 0xffe9a0,     // brillo del marco
  oroOscuro: 0x7a5414,    // sombra del marco
  placa: 0x1d1510,        // placas oscuras (nombre y poder)
  pergamino: 0xf1e3c0,    // fondo crema
  pergaminoSombra: 0xd9c49a
};

// ---------------- Fondos por raza ----------------
// Cada función recibe (ctx, ancho, alto) en píxeles del canvas chico. El perro
// queda abajo al centro: el suelo ocupa más o menos el último tercio.

// Cielo en franjas (estilo pixel): colores de arriba hacia abajo
function cieloFranjas(ctx, ancho, hasta, colores) {
  const alto = Math.ceil(hasta / colores.length);
  colores.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * alto, ancho, alto + 1); });
}

function rect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function circulo(ctx, color, cx, cy, r) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    const m = Math.floor(Math.sqrt(r * r - y * y));
    ctx.fillRect(Math.round(cx - m), Math.round(cy + y), m * 2 + 1, 1);
  }
}

const FONDOS_RAZA = {
  // Quiltro: plaza de barrio al atardecer, con poste de luz
  quiltro(ctx, w, h) {
    const suelo = Math.round(h * 0.68);
    cieloFranjas(ctx, w, suelo, ['#3b2a5c', '#6b3a6e', '#b0526a', '#e77d5a', '#f6b25e']);
    // edificios del barrio (siluetas) con ventanitas
    const casas = [[0, 14, 16], [15, 9, 12], [w - 26, 16, 14], [w - 13, 11, 13]];
    casas.forEach(([x, alto, ancho]) => {
      rect(ctx, '#2a1d3a', x, suelo - alto, ancho, alto);
      for (let vy = suelo - alto + 3; vy < suelo - 3; vy += 4) {
        for (let vx = x + 2; vx < x + ancho - 2; vx += 4) if ((vx + vy) % 3 !== 0) rect(ctx, '#f2c86b', vx, vy, 1, 1);
      }
    });
    // pastelones de la plaza
    rect(ctx, '#6f6259', 0, suelo, w, h - suelo);
    for (let x = 0; x < w; x += 6) rect(ctx, '#5a4e47', x, suelo, 1, h - suelo);
    rect(ctx, '#5a4e47', 0, suelo + Math.round((h - suelo) / 2), w, 1);
    // poste de luz con su halo
    const px = Math.round(w * 0.2);
    circulo(ctx, 'rgba(255,214,120,0.35)', px + 2, suelo - 20, 6);
    rect(ctx, '#1b1420', px, suelo - 20, 1, 20);
    rect(ctx, '#1b1420', px - 1, suelo - 21, 4, 1);
    rect(ctx, '#ffe08a', px + 1, suelo - 20, 2, 2);
    // banca
    rect(ctx, '#4a2e1c', w - 22, suelo + 2, 12, 2);
    rect(ctx, '#2e1c10', w - 21, suelo + 4, 1, 3);
    rect(ctx, '#2e1c10', w - 12, suelo + 4, 1, 3);
  },

  // Pitbull: callejón con muro de ladrillo y grafiti
  pitbull(ctx, w, h) {
    const suelo = Math.round(h * 0.72);
    cieloFranjas(ctx, w, 8, ['#2b1f3d', '#5a3352']);
    // muro de ladrillo
    rect(ctx, '#8a3b2a', 0, 6, w, suelo - 6);
    for (let y = 6, fila = 0; y < suelo; y += 3, fila++) {
      rect(ctx, '#5e2419', 0, y, w, 1);
      for (let x = (fila % 2) * 3; x < w; x += 6) rect(ctx, '#5e2419', x, y, 1, 3);
    }
    // ladrillos más claros sueltos
    [[5, 10], [20, 16], [w - 14, 12], [w - 30, 22]].forEach(([x, y]) => rect(ctx, '#a3523a', x, y, 4, 2));
    // grafiti: letras gordas de colores
    const gx = Math.round(w * 0.18);
    const gy = Math.round(suelo * 0.35);
    rect(ctx, '#2ec4d6', gx, gy, 3, 9); rect(ctx, '#2ec4d6', gx + 3, gy, 4, 3); rect(ctx, '#2ec4d6', gx + 3, gy + 4, 4, 2);
    rect(ctx, '#e84aa8', gx + 9, gy, 3, 9); rect(ctx, '#e84aa8', gx + 12, gy + 6, 4, 3);
    rect(ctx, '#f5d03b', gx + 18, gy + 1, 3, 8); rect(ctx, '#f5d03b', gx + 21, gy + 1, 3, 2); rect(ctx, '#f5d03b', gx + 21, gy + 7, 3, 2);
    rect(ctx, '#f5d03b', gx + 24, gy + 3, 1, 4);
    rect(ctx, '#ffffff', gx - 1, gy + 10, 27, 1); // subrayado
    // suelo de asfalto con charco
    rect(ctx, '#2a2a30', 0, suelo, w, h - suelo);
    rect(ctx, '#3a3a44', 0, suelo, w, 1);
    rect(ctx, '#4b5872', w - 24, suelo + 6, 12, 2);
    // basurero al lado
    rect(ctx, '#3d4a3a', w - 12, suelo - 9, 8, 9);
    rect(ctx, '#56664f', w - 13, suelo - 10, 10, 2);
  },

  // Galgo: carretera larga, con líneas de velocidad en el cielo
  galgo(ctx, w, h) {
    const horizonte = Math.round(h * 0.58);
    cieloFranjas(ctx, w, horizonte, ['#2f4b8a', '#4f6fb0', '#8a7fb8', '#e68e6a', '#f7c066']);
    // sol bajito en el horizonte
    circulo(ctx, '#ffe39a', Math.round(w * 0.78), horizonte - 2, 5);
    // líneas de velocidad
    [[4, 5, 20], [18, 10, 28], [2, 15, 14], [30, 19, 22], [10, 24, 18]].forEach(([x, y, largo]) => {
      if (y < horizonte - 3) rect(ctx, 'rgba(255,255,255,0.75)', (x * w) / 64, y, (largo * w) / 64, 1);
    });
    // cerros lejanos
    for (let x = 0; x < w; x++) {
      const a = Math.round(3 + 2 * Math.sin(x / 6) + Math.sin(x / 2.3));
      rect(ctx, '#4a3a5c', x, horizonte - a, 1, a);
    }
    // carretera
    rect(ctx, '#7a6a4a', 0, horizonte, w, h - horizonte); // berma
    const caminoY = horizonte + 3;
    rect(ctx, '#34343c', 0, caminoY, w, h - caminoY);
    rect(ctx, '#e8e8e8', 0, caminoY, w, 1);
    const centro = caminoY + Math.round((h - caminoY) / 2);
    for (let x = 0; x < w; x += 8) rect(ctx, '#f5d03b', x, centro, 4, 1);
  },

  // Beagle: potrero verde al atardecer, con un rastro de huellas (su nariz)
  beagle(ctx, w, h) {
    const suelo = Math.round(h * 0.62);
    cieloFranjas(ctx, w, suelo, ['#5a7fb5', '#94a9c9', '#efc98a', '#f2a65e']);
    // cerros verdes
    for (let x = 0; x < w; x++) {
      const a = Math.round(6 + 3 * Math.sin(x / 9 + 1) + 2 * Math.sin(x / 4));
      rect(ctx, '#4f7a3a', x, suelo - a, 1, a);
    }
    rect(ctx, '#6f9a45', 0, suelo, w, h - suelo);
    // pasto alto
    for (let x = 1; x < w; x += 3) rect(ctx, '#8bb95a', x, suelo + ((x * 7) % 5), 1, 2);
    // árbol a la izquierda
    rect(ctx, '#4a321e', 7, suelo - 9, 2, 9);
    circulo(ctx, '#3c6a2c', 8, suelo - 12, 5);
    // rastro de huellas hacia el perro
    const huellas = [[w - 6, h - 3], [w - 13, h - 6], [w - 20, h - 4], [w - 27, h - 7]];
    huellas.forEach(([x, y]) => {
      rect(ctx, '#4a6a2a', x, y, 2, 2);
      rect(ctx, '#4a6a2a', x - 1, y - 2, 1, 1); rect(ctx, '#4a6a2a', x + 1, y - 2, 1, 1); rect(ctx, '#4a6a2a', x + 2, y - 1, 1, 1);
    });
  },

  // Chow chow: atardecer naranjo con un sol grande detrás, como melena
  chowchow(ctx, w, h) {
    const suelo = Math.round(h * 0.7);
    cieloFranjas(ctx, w, suelo, ['#b8432a', '#d9602e', '#ef8a36', '#f7b04a']);
    const sx = Math.round(w / 2);
    const sy = suelo - 6;
    // rayos del sol (melena)
    ctx.fillStyle = 'rgba(255,214,110,0.55)';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      for (let r = 12; r < 22; r++) ctx.fillRect(Math.round(sx + Math.cos(a) * r), Math.round(sy + Math.sin(a) * r), 2, 2);
    }
    circulo(ctx, '#ffcf5a', sx, sy, 11);
    circulo(ctx, '#ffe48f', sx - 2, sy - 2, 6);
    // cerros oscuros
    for (let x = 0; x < w; x++) {
      const a = Math.round(4 + 2 * Math.sin(x / 7));
      rect(ctx, '#6a2a1c', x, suelo - a, 1, a);
    }
    rect(ctx, '#5a2418', 0, suelo, w, h - suelo);
    rect(ctx, '#7a3422', 0, suelo, w, 1);
  },

  // Gran danés: noche con luna grande y una sombra larga en el suelo
  grandanes(ctx, w, h) {
    const suelo = Math.round(h * 0.7);
    cieloFranjas(ctx, w, suelo, ['#0b1030', '#141c45', '#1f2a5a', '#2c3a6c']);
    // estrellas
    [[5, 4], [14, 9], [26, 3], [40, 7], [52, 12], [60, 4], [33, 14], [9, 15]].forEach(([x, y]) => {
      if ((x * w) / 64 < w && y < suelo - 4) rect(ctx, '#dfe6ff', (x * w) / 64, y, 1, 1);
    });
    // luna grande
    const lx = Math.round(w * 0.74);
    circulo(ctx, 'rgba(200,215,255,0.18)', lx, 12, 12);
    circulo(ctx, '#eef2ff', lx, 12, 9);
    rect(ctx, '#c9d2ee', lx - 3, 9, 2, 2); rect(ctx, '#c9d2ee', lx + 2, 14, 3, 2); rect(ctx, '#c9d2ee', lx - 1, 16, 1, 1);
    // suelo y la sombra larga hacia la izquierda (la luna está a la derecha)
    rect(ctx, '#1a2238', 0, suelo, w, h - suelo);
    rect(ctx, '#26304c', 0, suelo, w, 1);
    const cx = Math.round(w / 2);
    ctx.fillStyle = 'rgba(0,0,10,0.55)';
    for (let i = 0; i < cx - 2; i++) {
      const grosor = Math.max(1, Math.round(3 - i / 14));
      ctx.fillRect(cx - i, h - 5, 1, grosor);
    }
    // farol apagado
    rect(ctx, '#0d1224', 6, suelo - 18, 1, 18);
    rect(ctx, '#0d1224', 5, suelo - 19, 4, 1);
  }
};

// Textura del fondo de una raza para una ventana de ancho x alto (en pantalla)
function texturaFondoRaza(escena, razaId, ancho, alto) {
  const w = Math.max(8, Math.ceil(ancho / 2));
  const h = Math.max(8, Math.ceil(alto / 2));
  const clave = 'fondoRaza_' + razaId + '_' + w + 'x' + h;
  if (escena.textures.exists(clave)) return clave;
  const tex = escena.textures.createCanvas(clave, w, h);
  const ctx = tex.getContext();
  (FONDOS_RAZA[razaId] || FONDOS_RAZA.quiltro)(ctx, w, h);
  tex.refresh();
  return clave;
}

// ---------------- La carta ----------------

// Rombo dorado de las esquinas
function romboCarta(g, x, y, r) {
  g.fillStyle(CARTA_COLORES.borde, 1);
  g.fillTriangle(x - r - 1, y, x, y - r - 1, x + r + 1, y);
  g.fillTriangle(x - r - 1, y, x, y + r + 1, x + r + 1, y);
  g.fillStyle(CARTA_COLORES.oro, 1);
  g.fillTriangle(x - r, y, x, y - r, x + r, y);
  g.fillTriangle(x - r, y, x, y + r, x + r, y);
  g.fillStyle(CARTA_COLORES.oroClaro, 1);
  g.fillTriangle(x - r / 2, y, x, y - r / 2, x, y);
}

// Marco dorado grueso (brilla más con "encendido")
function marcoCarta(g, ancho, alto, s, encendido) {
  const C = CARTA_COLORES;
  const x = -ancho / 2;
  const y = -alto / 2;
  const grueso = Math.max(4, Math.round(6 * s));
  g.clear();
  if (encendido) { // halo
    g.fillStyle(0xffe08a, 0.28);
    g.fillRoundedRect(x - 5, y - 5, ancho + 10, alto + 10, 10);
  }
  g.fillStyle(C.borde, 1);
  g.fillRoundedRect(x - 2, y - 2, ancho + 4, alto + 4, 8);
  g.fillStyle(encendido ? 0xf0c24a : C.oro, 1);
  g.fillRoundedRect(x, y, ancho, alto, 7);
  // brillo arriba/izquierda y sombra abajo/derecha
  g.fillStyle(encendido ? 0xfff6cf : C.oroClaro, encendido ? 1 : 0.85);
  g.fillRect(x + 5, y + 1, ancho - 10, 2);
  g.fillRect(x + 1, y + 5, 2, alto - 10);
  g.fillStyle(C.oroOscuro, 0.9);
  g.fillRect(x + 5, y + alto - 3, ancho - 10, 2);
  g.fillRect(x + ancho - 3, y + 5, 2, alto - 10);
  // interior
  g.fillStyle(C.borde, 1);
  g.fillRect(x + grueso - 1, y + grueso - 1, ancho - 2 * grueso + 2, alto - 2 * grueso + 2);
  // rombos en las 4 esquinas
  const r = Math.max(4, Math.round(6 * s));
  const d = grueso / 2;
  romboCarta(g, x + d, y + d, r);
  romboCarta(g, x + ancho - d, y + d, r);
  romboCarta(g, x + d, y + alto - d, r);
  romboCarta(g, x + ancho - d, y + alto - d, r);
}

// Candado dibujado (raza bloqueada)
function candadoCarta(g, x, y, s) {
  const a = Math.round(26 * s);
  g.lineStyle(Math.max(3, Math.round(4 * s)), 0xb0b0b0, 1);
  g.strokeCircle(x, y - a * 0.45, a * 0.32);
  g.fillStyle(0x9e9e9e, 1);
  g.fillRoundedRect(x - a / 2, y - a * 0.4, a, a * 0.8, 3);
  g.fillStyle(0x424242, 1);
  g.fillRect(x - 2, y - a * 0.1, 4, a * 0.35);
}

// Crea una carta en (cx, cy) de ancho x alto. Devuelve { contenedor, cabe, ventana, fijar(bool) }.
// opciones: { bloqueada, alElegir }
// Si el contenido no cabe, primero se achica todo lo de adentro (letras y partes). Si aun así
// no cabe (en celular la letra tiene un mínimo, MOVIL.TEXTO_MINIMO), se achica la carta entera.
function crearCartaRaza(escena, cx, cy, ancho, alto, raza, opciones) {
  let carta = null;
  const probar = (k, s) => {
    if (carta) carta.contenedor.destroy();
    carta = armarCartaRaza(escena, cx, cy, ancho / k, alto / k, raza, opciones || {}, s);
    carta.contenedor.setScale(k);
    return carta.cabe;
  };
  let s = Math.min(1.15, ancho / 160);
  for (let i = 0; i < 4; i++, s *= 0.94) if (probar(1, s)) return carta;
  for (let k = 0.92; k > 0.5; k *= 0.95) if (probar(k, Math.min(1.15, ancho / k / 160))) return carta;
  return carta;
}

function armarCartaRaza(escena, cx, cy, ancho, alto, raza, op, s) {
  const C = CARTA_COLORES;
  const cfg = CONFIG.RAZAS[raza.id];
  const cont = escena.add.container(cx, cy);
  const marco = escena.add.graphics();
  cont.add(marco);
  marcoCarta(marco, ancho, alto, s, false);

  const grueso = Math.max(4, Math.round(6 * s));
  const izq = -ancho / 2 + grueso + 2;
  const der = ancho / 2 - grueso - 2;
  const anchoIn = der - izq;
  const arriba = -alto / 2 + grueso + 2;
  const abajo = alto / 2 - grueso - 2;
  const px = (n) => Math.max(8, Math.round(n * s)) + 'px';
  const g = escena.add.graphics();
  cont.add(g);
  const texto = (x, y, t, estilo) => {
    const obj = escena.add.text(x, y, t, { resolution: 2, ...estilo });
    cont.add(obj);
    return obj;
  };

  // 1) Placa del nombre
  const altoPlaca = Math.round(24 * s);
  g.fillStyle(C.placa, 1);
  g.fillRect(izq, arriba, anchoIn, altoPlaca);
  g.fillStyle(C.oro, 0.6);
  g.fillRect(izq, arriba + altoPlaca - 1, anchoIn, 1);
  const nombre = texto(0, arriba + altoPlaca / 2, raza.nombre.toUpperCase(), {
    fontFamily: FUENTE_CARTA, fontSize: px(14), color: '#f2cf63', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
  }).setOrigin(0.5);
  if (nombre.width > anchoIn - 6) nombre.setScale((anchoIn - 6) / nombre.width, 1); // nombres largos
  let y = arriba + altoPlaca + Math.round(4 * s);

  // 2) Abajo para arriba: placa del poder (alto según su texto)
  const espera = cfg.PODER_ESPERA_MS > 0 ? 'cada ' + (cfg.PODER_ESPERA_MS / 1000) + ' s' : 'pasivo';
  const padPoder = Math.round(5 * s);
  const tPoder = texto(0, 0, 'Poder · ' + sinTeclas(raza.poder) + ' · ' + espera, {
    fontFamily: FUENTE, fontSize: px(10.5), color: '#f2cf63', fontStyle: 'bold', align: 'center', wordWrap: { width: anchoIn - 8 }
  }).setOrigin(0.5, 0);
  const tPoderTexto = texto(0, 0, raza.poderTexto, {
    fontFamily: FUENTE, fontSize: px(10), color: '#f1e3c0', align: 'center', wordWrap: { width: anchoIn - 8 }
  }).setOrigin(0.5, 0);
  const altoPoder = padPoder * 2 + tPoder.height + 2 + tPoderTexto.height;
  const yPoder = abajo - altoPoder;
  tPoder.setY(yPoder + padPoder);
  tPoderTexto.setY(yPoder + padPoder + tPoder.height + 2);

  // 3) Pergamino: frase, línea dorada, stats y + / −
  const padP = Math.round(5 * s);
  const anchoTexto = anchoIn - padP * 2;
  const frase = texto(0, 0, raza.frase, {
    fontFamily: FUENTE_FRASE, fontSize: px(11), color: '#4a3420', fontStyle: 'italic', align: 'center', wordWrap: { width: anchoTexto }
  }).setOrigin(0.5, 0);
  const stats = [['VIDA', cfg.VIDA], ['VELOCIDAD', cfg.VELOCIDAD], ['MORDIDA', cfg.MORDIDA_DANO]];
  const numeros = stats.map(([, n]) => texto(0, 0, String(n), {
    fontFamily: FUENTE_CARTA, fontSize: px(16), color: '#2a1a0c', fontStyle: 'bold'
  }).setOrigin(0.5, 0));
  const etiquetas = stats.map(([t]) => texto(0, 0, t, {
    fontFamily: FUENTE, fontSize: px(7.5), color: '#7a5a30', fontStyle: 'bold'
  }).setOrigin(0.5, 0));
  const mas = texto(izq + padP, 0, '+ ' + raza.fortalezas, {
    fontFamily: FUENTE, fontSize: px(10), color: '#2f7a1c', fontStyle: 'bold', wordWrap: { width: anchoTexto }
  });
  const menos = texto(izq + padP, 0, '− ' + raza.debilidades, {
    fontFamily: FUENTE, fontSize: px(10), color: '#b0302a', fontStyle: 'bold', wordWrap: { width: anchoTexto }
  });
  const sep = Math.round(4 * s);
  const altoStats = numeros[0].height + etiquetas[0].height;
  const altoPergamino = padP + frase.height + sep + 1 + sep + altoStats + sep + mas.height + 2 + menos.height + padP;
  const yPergamino = yPoder - Math.round(3 * s) - altoPergamino;

  // 4) Ventana del perro: lo que sobra en el medio
  const yVentana = y;
  const altoVentana = yPergamino - Math.round(4 * s) - yVentana;
  const cabe = altoVentana >= 70; // el perro (64 px) tiene que caber

  // Dibujo de los fondos de las partes
  g.fillStyle(C.pergamino, 1);
  g.fillRect(izq, yPergamino, anchoIn, altoPergamino);
  g.fillStyle(C.pergaminoSombra, 1);
  g.fillRect(izq, yPergamino + altoPergamino - 2, anchoIn, 2);
  g.fillStyle(C.placa, 1);
  g.fillRect(izq, yPoder, anchoIn, altoPoder);
  g.fillStyle(C.oro, 0.6);
  g.fillRect(izq, yPoder, anchoIn, 1);

  // Posición de los textos del pergamino
  let yp = yPergamino + padP;
  frase.setY(yp);
  yp += frase.height + sep;
  g.fillStyle(C.oro, 1);
  g.fillRect(izq + anchoIn * 0.15, yp, anchoIn * 0.7, 1);
  g.fillStyle(C.oroClaro, 1);
  g.fillRect(0 - 2, yp - 1, 4, 3); // puntito al centro de la línea
  yp += 1 + sep;
  const anchoColumna = anchoIn / 3 - 4;
  numeros.forEach((t, i) => {
    const x = izq + (anchoIn * (i + 0.5)) / 3;
    t.setPosition(x, yp);
    etiquetas[i].setPosition(x, yp + t.height - 2);
    // en celular la letra mínima puede hacer que "VELOCIDAD" no quepa en su columna
    if (etiquetas[i].width > anchoColumna) etiquetas[i].setScale(anchoColumna / etiquetas[i].width, 1);
  });
  // separadores de las columnas
  g.fillStyle(C.pergaminoSombra, 1);
  g.fillRect(izq + anchoIn / 3, yp + 2, 1, altoStats - 4);
  g.fillRect(izq + (anchoIn * 2) / 3, yp + 2, 1, altoStats - 4);
  yp += altoStats + sep;
  mas.setY(yp);
  menos.setY(yp + mas.height + 2);

  // Ventana: fondo de la raza, marco dorado fino y el perro animado (idle)
  let perro = null;
  if (cabe) {
    const clave = texturaFondoRaza(escena, raza.id, anchoIn - 4, altoVentana - 4);
    const fondo = escena.add.image(0, yVentana + 2 + (altoVentana - 4) / 2, clave).setScale(2);
    fondo.setCrop(0, 0, Math.ceil((anchoIn - 4) / 2), Math.ceil((altoVentana - 4) / 2));
    cont.add(fondo);
    const marcoV = escena.add.graphics();
    marcoV.lineStyle(2, C.oro, 1);
    marcoV.strokeRect(izq + 1, yVentana + 1, anchoIn - 2, altoVentana - 2);
    marcoV.lineStyle(1, C.oroClaro, 0.6);
    marcoV.strokeRect(izq + 3, yVentana + 3, anchoIn - 6, altoVentana - 6);
    cont.add(marcoV);
    perro = dibujarPerro(escena, 0, yVentana + altoVentana - 4 - 30, raza.id); // patas cerca del borde de abajo
    cont.add(perro);
  }

  // Raza bloqueada: gris, oscura y con candado
  if (op.bloqueada) {
    cont.list.forEach((o) => { if (o.setTint) o.setTint(0x8a8a8a); });
    const velo = escena.add.graphics();
    velo.fillStyle(0x000000, 0.55);
    velo.fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 7);
    candadoCarta(velo, 0, yVentana + altoVentana / 2, s);
    cont.add(velo);
    if (perro) perro.anims.pause();
  }

  // Clic / toque y mouse encima
  const zona = escena.add.zone(0, 0, ancho, alto).setInteractive({ useHandCursor: !op.bloqueada });
  cont.add(zona);
  let encendida = false;
  let fija = false; // elegida (cooperativo): queda encendida
  const ponerEncendida = (si) => {
    if (op.bloqueada || si === encendida) return;
    encendida = si;
    marcoCarta(marco, ancho, alto, s, si);
    escena.tweens.killTweensOf(cont);
    escena.tweens.add({ targets: cont, y: cy - (si ? Math.round(6 * s) : 0), duration: 120, ease: 'Quad.easeOut' });
  };
  zona.on('pointerover', () => ponerEncendida(true));
  zona.on('pointerout', () => { if (!fija) ponerEncendida(false); });
  zona.on('pointerdown', () => { if (!op.bloqueada && op.alElegir) op.alElegir(); });

  return {
    contenedor: cont,
    cabe,
    ventana: { izq, arriba: yVentana, ancho: anchoIn },
    fijar(si) { fija = si; ponerEncendida(si); }
  };
}

// Cinzel se pide a Google Fonts (index.html) sin frenar la carga del juego. Si todavía no
// llegó cuando se dibujan las cartas, se espera un poco y se llama alCargar una vez
// (para redibujarlas). Sin internet nunca llega y quedan con la serif de respaldo.
let fuenteCartaLista = false;
function esperarFuenteCarta(escena, alCargar) {
  if (fuenteCartaLista || !document.fonts || !document.fonts.load) return;
  let intentos = 0;
  let activa = true;
  escena.events.once('shutdown', () => { activa = false; });
  const probar = () => {
    if (!activa) return;
    document.fonts.load('bold 16px Cinzel').then((caras) => {
      if (!activa) return;
      if (caras && caras.length) {
        fuenteCartaLista = true;
        alCargar();
      } else if (++intentos < 8) {
        setTimeout(probar, 1000); // la hoja de estilos de la letra todavía no llega
      }
    }).catch(() => {});
  };
  probar();
}

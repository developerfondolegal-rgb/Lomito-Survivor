// ===============================================================
//  EL MAPA: motor común y LA PLAZA
//  Aquí se dibuja el mapa en pixel art, sin archivos de imagen, y se
//  decide dónde va cada cosa. La lista de mapas (Plaza, Terminal de
//  buses, Feria libre), sus colores y sus dibujos están en src/mapas.js.
//
//  Las cantidades (árboles, bancas, faroles...) y el tamaño de cada mapa
//  se ajustan en src/config.js (sección MAPAS). La luz, la comida y el
//  agua también están en src/config.js.
//
//  Los mapas siempre salen igual mientras MAPA_SEMILLA (config.js) sea
//  la misma. Si cambias ese texto, las cosas cambian de lugar.
//
//  Cómo está armada la plaza (de afuera hacia adentro):
//   - Una calle de asfalto en los 4 bordes, con autos estacionados.
//   - Vereda y caminos de baldosas en forma de cruz.
//   - 4 prados de pasto, con senderos de tierra.
//   - Una pileta en el centro.
// ===============================================================

// Tamaño de los choques de cada obstáculo (en píxeles de pantalla)
const CHOQUE_ARBOL = 30;      // radio del círculo del tronco y la copa
const CHOQUE_BASURERO = 12;   // radio del basurero
const CHOQUE_BANCA = { ANCHO: 60, ALTO: 24 };
const CHOQUE_AUTO = { ANCHO: 42, ALTO: 66 };
const ANCHO_SENDERO = 54;     // ancho de los senderos de tierra

// Dibujos chicos que usan todos los mapas (mismo formato que src/sprites.js:
// cada letra es un píxel, "." es transparente, K es el borde negro)
const SPRITES_PLAZA = {
  // Banca de madera vista desde arriba. M/m = tablas, F = fierro de los lados
  banca: {
    colores: { M: 0x8d5a34, m: 0x5e3b20, F: 0x3a3a3a },
    cuadros: [[
      'KKKKKKKKKKKKKKKKKKKK',
      'KFMMMMMMMMMMMMMMMMFK',
      'KFmmmmmmmmmmmmmmmmFK',
      'KFMMMMMMMMMMMMMMMMFK',
      'KFmmmmmmmmmmmmmmmmFK',
      'KFMMMMMMMMMMMMMMMMFK',
      'KFmmmmmmmmmmmmmmmmFK',
      'KKKKKKKKKKKKKKKKKKKK'
    ]]
  },

  // Basurero verde visto desde arriba (con basura adentro)
  basurero: {
    colores: { G: 0x2e7d32, g: 0x1b4d1e, Y: 0xb0a070 },
    cuadros: [[
      '..KKKK..',
      '.KGGGGK.',
      'KGgYggGK',
      'KGggYgGK',
      'KGgYggGK',
      'KGgggYGK',
      '.KGGGGK.',
      '..KKKK..'
    ]]
  },

  // Farol visto desde arriba: la ampolleta encendida
  farol: {
    colores: { Y: 0xffd54f, A: 0xfff8e1 },
    cuadros: [[
      '..KKK..',
      '.KYYYK.',
      'KYAAAYK',
      'KYAAAYK',
      'KYAAAYK',
      '.KYYYK.',
      '..KKK..'
    ]]
  },

  // Restos de sopaipilla (comida)
  sopaipilla: {
    colores: { O: 0xe0a040, o: 0xa86a20 },
    cuadros: [[
      '..KKK..',
      '.KOOOK.',
      'KOoOOOK',
      'KOOOoOK',
      'KOoOOOK',
      '.KOOOK.',
      '..KKK..'
    ]]
  },

  // Pan marraqueta (comida)
  pan: {
    colores: { P: 0xd9a066, p: 0xf2c98a },
    cuadros: [[
      '.KKK.KKK.',
      'KPPPKPPPK',
      'KPpPPPpPK',
      'KPPPKPPPK',
      '.KKK.KKK.'
    ]]
  }
};

// Auto estacionado visto desde arriba (el frente mira hacia arriba).
// C = carrocería, c = techo, V = vidrios, L = focos, R = luces traseras
// (los colores de cada auto están en la paleta de la plaza, src/mapas.js)
const DIBUJO_AUTO = [
  '...KKKKKKKK...',
  '..KCCCCCCCCK..',
  '.KCLCCCCCCLCK.',
  '.KCCCCCCCCCCK.',
  '.KCCCCCCCCCCK.',
  'KKCKKKKKKKKCKK',
  '.KCKVVVVVVKCK.',
  '.KCKVVVVVVKCK.',
  '.KCKKKKKKKKCK.',
  '.KCccccccccCK.',
  '.KCccccccccCK.',
  '.KCccccccccCK.',
  '.KCccccccccCK.',
  '.KCccccccccCK.',
  '.KCKKKKKKKKCK.',
  '.KCKVVVVVVKCK.',
  '.KCKKKKKKKKCK.',
  '.KCCCCCCCCCCK.',
  '.KCCCCCCCCCCK.',
  '.KRCCCCCCCCRK.',
  '..KCCCCCCCCK..',
  '...KKKKKKKK...'
];

// ===============================================================
//  De aquí para abajo está el código que arma los mapas.
// ===============================================================

// Crea las imágenes que comparten todos los mapas (solo la primera vez)
function crearTexturasComunes(escena) {
  Object.keys(SPRITES_PLAZA).forEach((clave) => {
    if (!escena.textures.exists(clave)) crearTexturaPixel(escena, clave, SPRITES_PLAZA[clave]);
  });
}

// Baldosa, pasto, asfalto, tierra...: un cuadrado de 16x16 con puntitos al azar.
// colores = [normal, claro, oscuro]; claro y oscuro salen con probabilidad pClaro y pOscuro.
// junta (opcional): color de las junturas cada 8 píxeles (para baldosas).
function tileRuido(escena, clave, colores, pClaro, pOscuro, junta) {
  if (escena.textures.exists(clave)) return;
  const rnd = new Phaser.Math.RandomDataGenerator([clave]);
  texturaDibujada(escena, clave, 16, 16, (punto) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = rnd.frac();
        let color = r < pClaro ? colores[1] : r < pClaro + pOscuro ? colores[2] : colores[0];
        if (junta !== undefined && (x % 8 === 0 || y % 8 === 0)) color = junta;
        punto(x, y, color);
      }
    }
  });
}

// Imágenes propias de la plaza (solo la primera vez). "p" es su paleta (src/mapas.js)
function crearTexturasPlaza(escena, p) {
  p.autos.forEach((c, i) => {
    if (escena.textures.exists('auto_' + i)) return;
    crearTexturaPixel(escena, 'auto_' + i, {
      colores: { C: c[0], c: c[1], V: 0x37557a, L: 0xfff3b0, R: 0xff4040 },
      cuadros: [DIBUJO_AUTO]
    });
  });

  tileRuido(escena, 'tile_baldosa', p.baldosa, 0.12, 0, p.junta);
  tileRuido(escena, 'tile_pasto', p.pasto, 0.12, 0.12);
  tileRuido(escena, 'tile_tierra', p.tierra, 0.08, 0.12);
  tileRuido(escena, 'tile_asfalto', p.asfalto, 0.1, 0.1);
  if (escena.textures.exists('arbol')) return;
  const rnd = new Phaser.Math.RandomDataGenerator(['texturas']);

  // Árbol visto desde arriba: copa redonda con luces y sombras
  const a = p.arbol;
  texturaDibujada(escena, 'arbol', 29, 29, (punto) => {
    const c = 14;
    for (let y = 0; y < 29; y++) {
      for (let x = 0; x < 29; x++) {
        // borde un poco irregular para que parezca follaje
        const d = Math.sqrt((x - c) * (x - c) + (y - c) * (y - c)) + rnd.frac() * 1.2;
        if (d > 14.5) continue;
        let color = a[0];
        if (d > 13.3) color = a[1];                                      // borde
        else if (x + y < 22 && rnd.frac() < 0.45) color = a[2];          // luz (arriba izquierda)
        else if (x + y > 34 && rnd.frac() < 0.55) color = a[3];          // sombra (abajo derecha)
        else if (rnd.frac() < 0.1) color = a[4];
        punto(x, y, color);
      }
    }
  });

  // Pileta: borde de piedra, agua con brillos y el chorro al centro
  const r = Math.ceil(CONFIG.PILETA_RADIO / ESCALA_PIXEL);
  const lado = r * 2 + 1;
  texturaDibujada(escena, 'pileta', lado, lado, (punto) => {
    for (let y = 0; y < lado; y++) {
      for (let x = 0; x < lado; x++) {
        const d = Math.sqrt((x - r) * (x - r) + (y - r) * (y - r));
        if (d > r + 0.4) continue;
        let color;
        if (d > r - 0.8) color = 0x3a3a3a;                                   // borde oscuro
        else if (d > r - 4) color = rnd.frac() < 0.2 ? 0x8a8a8a : 0xa3a3a3;  // piedra
        else if (d < 3) color = 0xd6ecff;                                    // chorro de agua
        else if (d < 5) color = 0x8a8a8a;                                    // base del chorro
        else color = rnd.frac() < 0.07 ? 0x5f95d6 : (rnd.frac() < 0.15 ? 0x173f73 : 0x1e4e8c); // agua
        punto(x, y, color);
      }
    }
  });
}

// Crea una imagen pintando píxel por píxel con la función "dibujar"
function texturaDibujada(escena, clave, ancho, alto, dibujar) {
  const textura = escena.textures.createCanvas(clave, ancho, alto);
  const ctx = textura.getContext();
  dibujar((x, y, color) => {
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(x, y, 1, 1);
  });
  textura.refresh();
}

// ¿El punto (x, y) está a más de "margen" píxeles de todos los obstáculos?
// (y también del borde del mapa, salvo que ignorarBorde sea true)
function puntoLibre(solidos, x, y, margen, ignorarBorde) {
  if (!ignorarBorde && (x < margen || y < margen || x > CONFIG.MAPA_ANCHO - margen || y > CONFIG.MAPA_ALTO - margen)) return false;
  for (const s of solidos) {
    let d;
    if (s.forma === 'circulo') {
      d = Math.sqrt((x - s.x) * (x - s.x) + (y - s.y) * (y - s.y)) - s.r;
    } else {
      const dx = Math.max(Math.abs(x - s.x) - s.w / 2, 0);
      const dy = Math.max(Math.abs(y - s.y) - s.h / 2, 0);
      d = Math.sqrt(dx * dx + dy * dy);
    }
    if (d < margen) return false;
  }
  return true;
}

// Lo que tiene todo mapa al generarse (cada mapa agrega lo suyo):
//  centro, inicio (donde aparece el perro), pileta (null si no tiene),
//  suelos (rectángulos pintados en el suelo), solidos (choques),
//  faroles (luces), basureros (sueltan comida), adornos (dibujos)
function mapaVacio(cx, cy, inicio) {
  return {
    centro: { x: cx, y: cy }, inicio, pileta: null,
    suelos: [], solidos: [], faroles: [], basureros: [], adornos: []
  };
}

// Pone una banca (con su choque) si hay lugar. Devuelve la banca o null.
function ponerBanca(mapa, x, y, horizontal, margenFaroles) {
  if (!puntoLibre(mapa.solidos, x, y, CHOQUE_BANCA.ANCHO / 2 + 40)) return null;
  if (!mapa.faroles.every((f) => Phaser.Math.Distance.Between(x, y, f.x, f.y) > margenFaroles)) return null;
  if (Phaser.Math.Distance.Between(x, y, mapa.inicio.x, mapa.inicio.y) < 130) return null;
  const w = horizontal ? CHOQUE_BANCA.ANCHO : CHOQUE_BANCA.ALTO;
  const h = horizontal ? CHOQUE_BANCA.ALTO : CHOQUE_BANCA.ANCHO;
  const banca = { forma: 'rect', x, y, w, h, tipo: 'banca', horizontal };
  mapa.solidos.push(banca);
  mapa.adornos.push({ clave: 'banca', x, y, angulo: horizontal ? 0 : 90, profundidad: 2 });
  return banca;
}

// Pone "cantidad" basureros al lado de las bancas
function ponerBasureros(mapa, bancas, cantidad, rnd) {
  for (let intento = 0; intento < cantidad * 40 && mapa.basureros.length < cantidad; intento++) {
    if (bancas.length === 0) break;
    const b = rnd.pick(bancas);
    const lado = rnd.pick([-1, 1]);
    const x = b.horizontal ? b.x + lado * (CHOQUE_BANCA.ANCHO / 2 + 26) : b.x;
    const y = b.horizontal ? b.y : b.y + lado * (CHOQUE_BANCA.ANCHO / 2 + 26);
    if (!puntoLibre(mapa.solidos, x, y, CHOQUE_BASURERO + 10)) continue;
    if (!mapa.faroles.every((f) => Phaser.Math.Distance.Between(x, y, f.x, f.y) > 30)) continue;
    mapa.solidos.push({ forma: 'circulo', x, y, r: CHOQUE_BASURERO, tipo: 'basurero' });
    mapa.basureros.push({ x, y });
    mapa.adornos.push({ clave: 'basurero', x, y, profundidad: 2 });
  }
}

// Pone los primeros "cantidad" faroles de la lista de lugares
function ponerFaroles(mapa, lugares, cantidad) {
  lugares.slice(0, cantidad).forEach((f) => {
    mapa.faroles.push({ x: f.x, y: f.y });
    mapa.adornos.push({ clave: 'farol', x: f.x, y: f.y, profundidad: 2 });
  });
}

// ---------------- La plaza ----------------

// Decide dónde va cada cosa de la plaza (siempre igual con la misma semilla)
function generarPlaza() {
  const cfg = CONFIG.MAPAS.plaza;
  const rnd = new Phaser.Math.RandomDataGenerator([String(CONFIG.MAPA_SEMILLA)]);
  const A = cfg.ANCHO;
  const H = cfg.ALTO;
  const cx = A / 2;
  const cy = H / 2;
  const P = CONFIG.PASILLO_ANCHO / 2;    // mitad del ancho de los caminos en cruz
  const calle = CONFIG.CALLE_ANCHO;
  const borde = calle + 120;             // donde empiezan los prados (después de la vereda)

  const plaza = mapaVacio(cx, cy, { x: cx, y: cy + CONFIG.PILETA_RADIO + 200 });
  plaza.pastos = [];
  plaza.senderos = [];
  const reservado = (x, y, margen) =>
    Phaser.Math.Distance.Between(x, y, plaza.inicio.x, plaza.inicio.y) < 90 + margen;
  const lejosDeFaroles = (x, y, margen) =>
    plaza.faroles.every((f) => Phaser.Math.Distance.Between(x, y, f.x, f.y) > margen);
  const sobreSendero = (x, y, margen) => plaza.senderos.some((s) =>
    x > s.x - margen && x < s.x + s.w + margen && y > s.y - margen && y < s.y + s.h + margen);

  // Pileta en el centro
  plaza.pileta = { x: cx, y: cy, r: CONFIG.PILETA_RADIO };
  plaza.solidos.push({ forma: 'circulo', x: cx, y: cy, r: CONFIG.PILETA_RADIO, tipo: 'pileta' });
  plaza.adornos.push({ clave: 'pileta', x: cx, y: cy, profundidad: 1 });

  // 4 prados de pasto (uno en cada esquina de la cruz) con senderos de tierra
  const tramosX = [[borde, cx - P], [cx + P, A - borde]];
  const tramosY = [[borde, cy - P], [cy + P, H - borde]];
  tramosX.forEach(([x0, x1]) => {
    tramosY.forEach(([y0, y1]) => {
      const prado = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      plaza.pastos.push(prado);
      for (let i = 0; i < cfg.SENDEROS_POR_PRADO; i++) {
        if (rnd.frac() < 0.5) {
          const y = y0 + rnd.between(150, prado.h - 150 - ANCHO_SENDERO);
          plaza.senderos.push({ x: x0, y, w: prado.w, h: ANCHO_SENDERO });
        } else {
          const x = x0 + rnd.between(150, prado.w - 150 - ANCHO_SENDERO);
          plaza.senderos.push({ x, y: y0, w: ANCHO_SENDERO, h: prado.h });
        }
      }
    });
  });

  // Punto sobre uno de los 4 brazos de la cruz: "s" es la distancia al centro
  // y "lado" (-1 o 1) en qué orilla del camino. Devuelve también si el brazo es horizontal.
  const puntoEnBrazo = (brazo, s, lado, orilla) => {
    if (brazo === 0) return { x: cx + s, y: cy + lado * orilla, horizontal: true };  // este
    if (brazo === 1) return { x: cx - s, y: cy + lado * orilla, horizontal: true };  // oeste
    if (brazo === 2) return { x: cx + lado * orilla, y: cy - s, horizontal: false }; // norte
    return { x: cx + lado * orilla, y: cy + s, horizontal: false };                  // sur
  };
  const largoBrazo = Math.min(cx, cy) - borde; // del centro hasta donde termina la cruz

  // Faroles: primero 4 alrededor de la pileta, después a lo largo de los caminos y senderos
  const puestos = [];
  for (let i = 0; i < 4; i++) {
    const ang = Math.PI / 4 + (i * Math.PI) / 2;
    const d = CONFIG.PILETA_RADIO + 70;
    puestos.push({ x: cx + Math.cos(ang) * d, y: cy + Math.sin(ang) * d });
  }
  const otros = [];
  for (let brazo = 0; brazo < 4; brazo++) {
    for (let s = 450; s < largoBrazo - 60; s += cfg.FAROL_CADA) {
      [-1, 1].forEach((lado) => otros.push(puntoEnBrazo(brazo, s, lado, P - 12)));
    }
  }
  plaza.senderos.forEach((s) => {
    const horizontal = s.w > s.h;
    const largo = horizontal ? s.w : s.h;
    for (let d = cfg.FAROL_CADA / 2; d < largo; d += cfg.FAROL_CADA) {
      otros.push(horizontal ? { x: s.x + d, y: s.y - 14 } : { x: s.x - 14, y: s.y + d });
    }
  });
  puestos.push(...rnd.shuffle(otros));
  ponerFaroles(plaza, puestos, cfg.FAROLES);

  // Bancas: a la orilla de los caminos, mirando hacia el camino
  const bancas = [];
  for (let intento = 0; intento < cfg.BANCAS * 40 && bancas.length < cfg.BANCAS; intento++) {
    const p = puntoEnBrazo(rnd.between(0, 3), rnd.between(320, largoBrazo - 40), rnd.pick([-1, 1]), P - 40);
    const banca = ponerBanca(plaza, p.x, p.y, p.horizontal, 50);
    if (banca) bancas.push(banca);
  }

  // Basureros: al lado de una banca
  ponerBasureros(plaza, bancas, cfg.BASUREROS, rnd);

  // Árboles: en los prados, sin tapar los senderos
  let arboles = 0;
  for (let intento = 0; intento < cfg.ARBOLES * 40 && arboles < cfg.ARBOLES; intento++) {
    const prado = rnd.pick(plaza.pastos);
    const x = rnd.between(prado.x + 50, prado.x + prado.w - 50);
    const y = rnd.between(prado.y + 50, prado.y + prado.h - 50);
    if (sobreSendero(x, y, CHOQUE_ARBOL + 10)) continue;
    if (!puntoLibre(plaza.solidos, x, y, CHOQUE_ARBOL + 60)) continue;
    if (!lejosDeFaroles(x, y, CHOQUE_ARBOL + 30) || reservado(x, y, CHOQUE_ARBOL)) continue;
    plaza.solidos.push({ forma: 'circulo', x, y, r: CHOQUE_ARBOL, tipo: 'arbol' });
    plaza.adornos.push({ clave: 'arbol', x, y, angulo: rnd.pick([0, 90, 180, 270]), profundidad: 11 });
    arboles++;
  }

  // Autos estacionados en la calle de los bordes
  const coloresAutos = buscarMapa('plaza').paleta.autos.length;
  let autos = 0;
  for (let intento = 0; intento < cfg.AUTOS * 40 && autos < cfg.AUTOS; intento++) {
    const borde4 = rnd.between(0, 3); // 0 arriba, 1 abajo, 2 izquierda, 3 derecha
    const largo = rnd.between(220, (borde4 < 2 ? A : H) - 220);
    const pegado = 55; // distancia del auto al borde del mapa
    let x, y, angulo;
    if (borde4 === 0) { x = largo; y = pegado; angulo = 90; }
    else if (borde4 === 1) { x = largo; y = H - pegado; angulo = 270; }
    else if (borde4 === 2) { x = pegado; y = largo; angulo = 180; }
    else { x = A - pegado; y = largo; angulo = 0; }
    const horizontal = borde4 < 2;
    const w = horizontal ? CHOQUE_AUTO.ALTO : CHOQUE_AUTO.ANCHO;
    const h = horizontal ? CHOQUE_AUTO.ANCHO : CHOQUE_AUTO.ALTO;
    if (!puntoLibre(plaza.solidos, x, y, CHOQUE_AUTO.ALTO / 2 + 25, true)) continue; // los autos van pegados al borde
    plaza.solidos.push({ forma: 'rect', x, y, w, h, tipo: 'auto' });
    plaza.adornos.push({ clave: 'auto_' + rnd.between(0, coloresAutos - 1), x, y, angulo, profundidad: 2 });
    autos++;
  }

  return plaza;
}

// Pinta el suelo de la plaza (calle, baldosas, pasto y tierra). "h" son las herramientas de pintarSueloMapa
function pintarSueloPlaza(h, plaza, p) {
  const A = CONFIG.MAPA_ANCHO;
  const H = CONFIG.MAPA_ALTO;
  const calle = CONFIG.CALLE_ANCHO;
  const E = ESCALA_PIXEL;

  h.rect({ x: 0, y: 0, w: A, h: H }, h.patron('tile_asfalto'));                              // calle
  h.rect({ x: calle, y: calle, w: A - calle * 2, h: H - calle * 2 }, h.patron('tile_baldosa')); // vereda y caminos
  h.borde({ x: calle, y: calle, w: A - calle * 2, h: H - calle * 2 }, p.solera);              // solera

  // Línea amarilla punteada al medio de la calle
  const ctx = h.ctx;
  ctx.fillStyle = p.lineaCalle;
  const m = Math.round(calle / 2 / E);
  const fin = Math.round(Math.max(A, H) / E);
  for (let i = 0; i < fin; i += 12) {
    ctx.fillRect(i, m, 6, 1); ctx.fillRect(i, Math.round(H / E) - m, 6, 1);
    ctx.fillRect(m, i, 1, 6); ctx.fillRect(Math.round(A / E) - m, i, 1, 6);
  }

  plaza.pastos.forEach((r) => { h.rect(r, h.patron('tile_pasto')); h.borde(r, p.bordePasto); });
  plaza.senderos.forEach((r) => h.rect(r, h.patron('tile_tierra')));
}

// ---------------- Armar cualquier mapa ----------------

// Pinta el suelo de todo el mapa en una sola imagen. Se pinta en tamaño chico y se agranda x3.
// Solo se guarda el suelo del mapa actual (los otros se borran para no gastar memoria en el celular).
function pintarSueloMapa(escena, def, mapa) {
  const E = ESCALA_PIXEL;
  const clave = 'suelo_' + def.id;
  escena.textures.getTextureKeys().forEach((k) => {
    if (k.indexOf('suelo_') === 0 && k !== clave) escena.textures.remove(k);
  });
  if (!escena.textures.exists(clave)) {
    const textura = escena.textures.createCanvas(clave, Math.ceil(CONFIG.MAPA_ANCHO / E), Math.ceil(CONFIG.MAPA_ALTO / E));
    const ctx = textura.getContext();
    const h = {
      ctx,
      patron: (tile) => ctx.createPattern(escena.textures.get(tile).getSourceImage(), 'repeat'),
      rect: (r, relleno) => {
        ctx.fillStyle = relleno;
        ctx.fillRect(Math.round(r.x / E), Math.round(r.y / E), Math.round(r.w / E), Math.round(r.h / E));
      },
      borde: (r, color) => {
        const x = Math.round(r.x / E), y = Math.round(r.y / E), w = Math.round(r.w / E), hh = Math.round(r.h / E);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + hh - 1, w, 1);
        ctx.fillRect(x, y, 1, hh); ctx.fillRect(x + w - 1, y, 1, hh);
      }
    };
    def.pintarSuelo(h, mapa, def.paleta);
    textura.refresh();
  }
  escena.add.image(0, 0, clave).setOrigin(0).setScale(E).setDepth(0);
}

// Arma el mapa completo en la escena: suelo, adornos y obstáculos sólidos.
// mapaId: id de src/mapas.js ('plaza', 'terminal', 'feria').
// (Se llama "plaza" en el resto del código por costumbre: es el mapa que se esté jugando.)
// Devuelve el mapa con:
//   obstaculos: grupo de física (para los choques)
//   libre(x, y, margen): true si no hay obstáculos cerca
//   buscarLibre(x, y, margen): el punto libre más cercano
// ---------------------------------------------------------------
// v0.48 (Plaza renovada FASE 2): cómo rodean los enemigos los objetos grandes.
// Solo se activa en la plaza nueva (plaza.rodeoAgrupado); Terminal y Feria siguen igual.
//  - Un objeto hecho de varios círculos pegados (el kiosko) se rodea como una
//    sola "cápsula": así los enemigos no se meten en las muescas entre círculos.
//  - Si al rodear tocan otro obstáculo, giran alrededor del grupo (glorieta + bancas).
//  - Recuerdan por qué lado iban un rato, para no ir y volver frente a una pared larga.
// ---------------------------------------------------------------
// Va ANTES de crear los choques. Un objeto de círculos pegados (el kiosko) queda como
// "cápsula", y entre cada par de círculos se agregan 3 círculos de relleno: sin eso
// quedaban muescas en V de casi 40 px donde el perro se quedaba pegado al ir en diagonal.
function rellenarMuescas(plaza) {
  if (typeof PZ_OBJETOS === 'undefined') return;
  plaza.adornos.forEach((a) => {
    const def = PZ_OBJETOS[a.clave];
    if (!def || !def.choque) return;
    const ch = typeof pzChoqueGirado === 'function' ? pzChoqueGirado(def.choque, a.angulo || 0) : def.choque; // igual que plaza_generar.js
    if (!ch || ch.forma !== 'circulos' || ch.lista.length < 2) return;
    const L = ch.lista;
    for (let i = 1; i < L.length; i++) {   // solo si los círculos se tocan (el columpio no: sus postes están separados)
      if (Math.hypot(L[i].dx - L[i - 1].dx, L[i].dy - L[i - 1].dy) > L[i].r + L[i - 1].r) return;
    }
    const capsula = {
      x: a.x, y: a.y,
      ax: a.x + L[0].dx, ay: a.y + L[0].dy,
      bx: a.x + L[L.length - 1].dx, by: a.y + L[L.length - 1].dy
    };
    plaza.solidos.forEach((s) => {
      if (L.some((c) => Math.abs(s.x - (a.x + c.dx)) < 1 && Math.abs(s.y - (a.y + c.dy)) < 1)) s.capsula = capsula;
    });
    for (let i = 1; i < L.length; i++) {
      for (const t of [0.25, 0.5, 0.75]) {
        plaza.solidos.push({
          forma: 'circulo', tipo: a.tipo, capsula,
          x: a.x + L[i - 1].dx + (L[i].dx - L[i - 1].dx) * t,
          y: a.y + L[i - 1].dy + (L[i].dy - L[i - 1].dy) * t,
          r: Math.min(L[i].r, L[i - 1].r)
        });
      }
    }
  });
}

// Va DESPUÉS de crear los choques
function marcarRodeoAgrupado(plaza) {
  plaza.rodeoAgrupado = true;
  plaza.obstaculos.getChildren().forEach((z) => {
    if (z.solido.capsula) z.capsula = z.solido.capsula;
  });
}

// Punto alrededor del cual se gira: el centro, o el punto más cercano del eje de una cápsula
function puntoDeRodeo(o, x, y) {
  if (o.ax === undefined) return o;
  const vx = o.bx - o.ax;
  const vy = o.by - o.ay;
  const t = Phaser.Math.Clamp(((x - o.ax) * vx + (y - o.ay) * vy) / (vx * vx + vy * vy), 0, 1);
  return { x: o.ax + vx * t, y: o.ay + vy * t };
}

// Igual que chocarObstaculo (GameScene.js), pero con cápsulas, grupos y memoria del lado
function chocarObstaculoAgrupado(escena, enemigo, zona, ahora) {
  const pieza = zona.capsula || zona;
  if (ahora >= enemigo.rodeandoHasta || !enemigo.rodeoGrupo) {
    const m = enemigo.rodeoMemoria;
    if (m && m.pieza === pieza && ahora < m.hasta) {
      enemigo.rodeoLado = m.lado; // vuelve a chocar con lo mismo: sigue por el mismo lado
    } else {
      const p = puntoDeRodeo(pieza, enemigo.x, enemigo.y);
      const desde = Phaser.Math.Angle.Between(p.x, p.y, enemigo.x, enemigo.y);
      const perro = perroMasCercano(escena, enemigo.x, enemigo.y);
      const directo = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, perro.x, perro.y);
      enemigo.rodeoLado = Math.cos(desde + Math.PI / 2 - directo) >= Math.cos(desde - Math.PI / 2 - directo) ? 1 : -1;
    }
    enemigo.rodeoGrupo = [pieza];
    enemigo.rodeoCentro = pieza;
    enemigo.rodeoInicio = ahora;
    enemigo.rodeoX = enemigo.x;
    enemigo.rodeoY = enemigo.y;
  } else {
    if (enemigo.rodeoGrupo.indexOf(pieza) < 0) {   // tocó otro obstáculo mientras rodeaba: gira alrededor del grupo
      enemigo.rodeoGrupo.push(pieza);
      if (enemigo.rodeoGrupo.length > 4) enemigo.rodeoGrupo.shift();
      const n = enemigo.rodeoGrupo.length;
      enemigo.rodeoCentro = {
        x: enemigo.rodeoGrupo.reduce((s, z) => s + z.x, 0) / n,
        y: enemigo.rodeoGrupo.reduce((s, z) => s + z.y, 0) / n
      };
    }
    if (ahora - enemigo.rodeoInicio > 1000) {      // cada segundo: si casi no avanzó, prueba el otro lado
      if (Phaser.Math.Distance.Between(enemigo.x, enemigo.y, enemigo.rodeoX, enemigo.rodeoY) < 25) enemigo.rodeoLado *= -1;
      enemigo.rodeoInicio = ahora;
      enemigo.rodeoX = enemigo.x;
      enemigo.rodeoY = enemigo.y;
    }
  }
  enemigo.rodeoMemoria = { pieza: enemigo.rodeoGrupo[0], lado: enemigo.rodeoLado, hasta: ahora + 2500 };
  enemigo.rodeoObstaculo = enemigo.rodeoCentro;
  enemigo.rodeandoHasta = ahora + CONFIG.RODEO_MS;
}

// ---------------------------------------------------------------
// v0.48: "mapa de caminos" de la plaza renovada (solo ahí; Terminal y Feria no lo usan).
// Una cuadrícula de 16 px marca por dónde se puede pasar. Cada 300 ms se calcula, desde
// el perro, cuántos pasos faltan para llegar a cada casilla cercana. Un enemigo que no ve
// al perro en línea recta sigue las casillas que acercan; así sale de rincones como el
// pasillo entre la glorieta y sus bancas. Hay un mapa por tamaño de enemigo (el jefe no
// cabe por donde pasa un perro rival); el de los chicos se hace al cargar y los otros
// recién cuando aparece un enemigo de ese tamaño.
// ---------------------------------------------------------------
const CAMPO = { CASILLA: 16, MARGENES: [13, 20, 28, 40, 56], CADA_MS: 300, ALCANCE: 130, MIRAR: 6 };

function crearCampoCaminos(plaza, m) {
  const C = CAMPO.CASILLA;
  const cols = Math.ceil(CONFIG.MAPA_ANCHO / C);
  const filas = Math.ceil(CONFIG.MAPA_ALTO / C);
  const bloq = new Uint8Array(cols * filas);
  plaza.solidos.forEach((s) => {   // solo revisa las casillas cerca de cada obstáculo
    const ex = (s.forma === 'circulo' ? s.r : s.w / 2) + m;
    const ey = (s.forma === 'circulo' ? s.r : s.h / 2) + m;
    const c0 = Math.max(0, Math.floor((s.x - ex) / C)), c1 = Math.min(cols - 1, Math.floor((s.x + ex) / C));
    const f0 = Math.max(0, Math.floor((s.y - ey) / C)), f1 = Math.min(filas - 1, Math.floor((s.y + ey) / C));
    for (let f = f0; f <= f1; f++) {
      for (let c = c0; c <= c1; c++) {
        if (!bloq[f * cols + c] && !puntoLibre([s], c * C + C / 2, f * C + C / 2, m, true)) bloq[f * cols + c] = 1;
      }
    }
  });
  plaza.campos[m] = { cols, filas, bloq, dist: new Int16Array(cols * filas).fill(-1), visitadas: [], hasta: -1 };
  return plaza.campos[m];
}

// Recalcula los pasos desde el perro (o los dos perros en cooperativo)
function actualizarCampo(escena, k, ahora) {
  if (ahora < k.hasta) return;
  k.hasta = ahora + CAMPO.CADA_MS;
  const C = CAMPO.CASILLA;
  k.visitadas.forEach((i) => { k.dist[i] = -1; });
  const cola = [];
  const perros = escena.jugador2 ? escena.perrosCoop.filter((p) => !p.caido) : [escena.perro];
  perros.forEach((p) => {
    const c = Phaser.Math.Clamp(Math.floor(p.x / C), 0, k.cols - 1);
    const f = Phaser.Math.Clamp(Math.floor(p.y / C), 0, k.filas - 1);
    const i = f * k.cols + c;
    if (k.dist[i] < 0) { k.dist[i] = 0; cola.push(i); }
  });
  for (let q = 0; q < cola.length; q++) {
    const i = cola[q];
    const d = k.dist[i] + 1;
    if (d > CAMPO.ALCANCE) continue;
    const c = i % k.cols;
    const vecinos = [c > 0 ? i - 1 : -1, c < k.cols - 1 ? i + 1 : -1, i - k.cols, i + k.cols];
    for (const v of vecinos) {
      if (v < 0 || v >= k.dist.length || k.bloq[v] || k.dist[v] >= 0) continue;
      k.dist[v] = d;
      cola.push(v);
    }
  }
  k.visitadas = cola;
}

// ¿Hay camino libre en línea recta entre dos puntos?
function campoLineaLibre(k, x1, y1, x2, y2) {
  const C = CAMPO.CASILLA;
  const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 10);
  for (let s = 1; s < n; s++) {
    const c = Math.floor((x1 + (x2 - x1) * s / n) / C);
    const f = Math.floor((y1 + (y2 - y1) * s / n) / C);
    if (c < 0 || f < 0 || c >= k.cols || f >= k.filas || k.bloq[f * k.cols + c]) return false;
  }
  return true;
}

// Ángulo para un enemigo chico, o null si debe usar la forma de siempre
function anguloPorCampo(escena, enemigo, ahora) {
  const m = CAMPO.MARGENES.find((v) => v >= enemigo.radio - 3);
  if (m === undefined) return null; // más grande que todo: rodea como antes
  if (enemigo.campoHasta > ahora) return enemigo.campoAngulo;
  enemigo.campoHasta = ahora + 120;
  const plaza = escena.plaza;
  const k = plaza.campos[m] || crearCampoCaminos(plaza, m);
  actualizarCampo(escena, k, ahora);
  const C = CAMPO.CASILLA;
  const perro = perroMasCercano(escena, enemigo.x, enemigo.y);
  let angulo = null;
  if (campoLineaLibre(k, enemigo.x, enemigo.y, perro.x, perro.y)) {
    angulo = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, perro.x, perro.y);
  } else {
    const c0 = Math.floor(enemigo.x / C);
    const f0 = Math.floor(enemigo.y / C);
    const libre = (c, f) => c >= 0 && f >= 0 && c < k.cols && f < k.filas && !k.bloq[f * k.cols + c];
    const pasos = (c, f) => (libre(c, f) ? k.dist[f * k.cols + c] : -1);
    // Casilla de partida: la propia, o la mejor de alrededor si está pegado a un obstáculo
    let mc = -1, mf = -1, md = 1e9;
    for (let anillo = 0; anillo <= 3 && mc < 0; anillo++) {
      for (let f = f0 - anillo; f <= f0 + anillo; f++) {
        for (let c = c0 - anillo; c <= c0 + anillo; c++) {
          if (Math.max(Math.abs(c - c0), Math.abs(f - f0)) !== anillo) continue;
          const d = pasos(c, f);
          if (d >= 0 && d < md) { md = d; mc = c; mf = f; }
        }
      }
    }
    if (mc >= 0) {
      // Baja unos pasos por el camino y apunta al más lejano que se ve en línea recta
      // (se ve más suave que ir casilla por casilla, sin cortar esquinas de autos o bancas)
      const camino = [[mc, mf]];
      for (let s = 0; s < CAMPO.MIRAR; s++) {
        let bc = mc, bf = mf, bd = pasos(mc, mf);
        for (let df = -1; df <= 1; df++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (!dc && !df) continue;
            if (dc && df && (!libre(mc + dc, mf) || !libre(mc, mf + df))) continue; // no corta esquinas
            const d = pasos(mc + dc, mf + df);
            if (d >= 0 && d < bd) { bd = d; bc = mc + dc; bf = mf + df; }
          }
        }
        if (bc === mc && bf === mf) break;
        mc = bc; mf = bf;
        camino.push([mc, mf]);
      }
      let meta = camino[Math.min(1, camino.length - 1)];
      for (let s = camino.length - 1; s > 1; s--) {
        const [c, f] = camino[s];
        if (campoLineaLibre(k, enemigo.x, enemigo.y, c * C + C / 2, f * C + C / 2)) { meta = camino[s]; break; }
      }
      angulo = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, meta[0] * C + C / 2, meta[1] * C + C / 2);
    }
  }
  enemigo.campoAngulo = angulo;
  return angulo;
}

function crearPlaza(escena, mapaId) {
  const def = buscarMapa(mapaId);
  aplicarTamanoMapa(def.id);
  crearTexturasComunes(escena);
  def.crearTexturas(escena, def.paleta);
  const plaza = def.generar();
  plaza.id = def.id;
  pintarSueloMapa(escena, def, plaza);

  plaza.adornos.forEach((a) => {
    a.imagen = escena.add.image(a.x, a.y, a.clave).setScale(ESCALA_PIXEL).setAngle(a.angulo || 0).setDepth(a.profundidad);
  });
  if (plaza.cables && typeof pzCrearCables === 'function') pzCrearCables(escena, plaza); // Plaza renovada FASE 2: cables entre postes

  if (plaza.cables) rellenarMuescas(plaza); // Plaza renovada FASE 2: el kiosko sin muescas

  // Choques: figuras invisibles con la forma de cada obstáculo
  plaza.obstaculos = escena.physics.add.staticGroup();
  plaza.solidos.forEach((s) => {
    const circulo = s.forma === 'circulo';
    const zona = escena.add.zone(s.x, s.y, circulo ? s.r * 2 : s.w, circulo ? s.r * 2 : s.h);
    plaza.obstaculos.add(zona);
    if (circulo) zona.body.setCircle(s.r);
    zona.solido = s;
  });
  if (plaza.cables) { // Plaza renovada FASE 2: los enemigos rodean bien el kiosko y la glorieta
    marcarRodeoAgrupado(plaza);
    plaza.campos = {};
    crearCampoCaminos(plaza, CAMPO.MARGENES[0]); // el de los enemigos chicos (los otros, cuando hagan falta)
  }

  plaza.libre = (x, y, margen) => puntoLibre(plaza.solidos, x, y, margen);

  // Busca en círculos cada vez más grandes alrededor de (x, y)
  plaza.buscarLibre = (x, y, margen) => {
    if (plaza.libre(x, y, margen)) return { x, y };
    for (let d = 20; d <= 400; d += 20) {
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const px = x + Math.cos(ang) * d;
        const py = y + Math.sin(ang) * d;
        if (plaza.libre(px, py, margen)) return { x: px, y: py };
      }
    }
    return { x, y };
  };

  return plaza;
}

// ---------------- Luz y oscuridad ----------------

// Imagen de una luz: círculo con bordes en escalones (estilo 8 bits).
// Se usa para "borrar" la oscuridad.
function texturaLuz(escena, radio) {
  const r = Math.ceil(radio / ESCALA_PIXEL);
  const clave = 'luz_' + r;
  if (escena.textures.exists(clave)) return clave;
  const lado = r * 2 + 1;
  const textura = escena.textures.createCanvas(clave, lado, lado);
  const ctx = textura.getContext();
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const d = Math.sqrt((x - r) * (x - r) + (y - r) * (y - r)) / r;
      if (d > 1) continue;
      const fuerza = d < 0.6 ? 1 : d < 0.8 ? 0.7 : d < 0.93 ? 0.4 : 0.15;
      ctx.fillStyle = 'rgba(255,255,255,' + fuerza + ')';
      ctx.fillRect(x, y, 1, 1);
    }
  }
  textura.refresh();
  return clave;
}

// Capa oscura encima del mapa (debajo de la pantalla de vida y nivel)
function crearOscuridad(escena) {
  if (!(CONFIG.OSCURIDAD > 0)) return null;
  const capa = escena.add.renderTexture(0, 0, escena.scale.width, escena.scale.height)
    .setOrigin(0).setScrollFactor(0).setDepth(800);
  const luz = (radio) => escena.make.image({ x: 0, y: 0, key: texturaLuz(escena, radio), add: false })
    .setScale(ESCALA_PIXEL);
  return { capa, luzFarol: luz(CONFIG.LUZ_FAROL_RADIO), luzPerro: luz(CONFIG.LUZ_PERRO_RADIO) };
}

// Se llama en cada cuadro: oscurece todo y "abre" las luces visibles.
// "alfa" (opcional): qué tan oscuro (si no se da, usa OSCURIDAD de config.js).
// "luces" (opcional): otros puntos con luz, por ejemplo el jefe ({ x, y }).
function actualizarOscuridad(escena, oscuridad, plaza, perro, alfa, luces) {
  if (!oscuridad) return;
  const cam = escena.cameras.main;
  const w = escena.scale.width;
  const h = escena.scale.height;
  const R = CONFIG.LUZ_FAROL_RADIO;
  const capa = oscuridad.capa;

  capa.clear();
  const nivel = alfa === undefined ? CONFIG.OSCURIDAD : alfa;
  if (nivel <= 0) return; // de día: sin oscuridad
  capa.fill(0x05081a, nivel);
  (luces || []).forEach((l) => capa.erase(oscuridad.luzPerro, l.x - cam.scrollX, l.y - cam.scrollY));
  plaza.faroles.forEach((f) => {
    if (f.bajo) return; // FASE 3: farol parpadeando (src/plaza_vida.js)
    const sx = f.x - cam.scrollX;
    const sy = f.y - cam.scrollY;
    if (sx < -R || sy < -R || sx > w + R || sy > h + R) return; // fuera de pantalla
    capa.erase(oscuridad.luzFarol, sx, sy);
  });
  capa.erase(oscuridad.luzPerro, perro.x - cam.scrollX, perro.y - cam.scrollY);
}

// ===============================================================
//  LA PLAZA (el mapa)
//  Aquí se dibuja la plaza de noche en pixel art, sin archivos de
//  imagen, y se decide dónde va cada cosa.
//
//  Las cantidades (árboles, bancas, faroles...), la luz, la comida
//  y el agua se ajustan en src/config.js (sección PLAZA).
//
//  La plaza siempre sale igual mientras MAPA_SEMILLA (config.js) sea
//  la misma. Si cambias ese texto, las cosas cambian de lugar.
//
//  Cómo está armada (de afuera hacia adentro):
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

// Dibujos chicos de la plaza (mismo formato que src/sprites.js:
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

// Colores de los autos: [carrocería, techo]
const COLORES_AUTOS = [
  [0xb3261e, 0x7a1813], // rojo
  [0x1f4e9c, 0x153566], // azul
  [0xd8d8d8, 0xa8a8a8], // blanco
  [0xe0b000, 0x9c7a00]  // amarillo
];

// ===============================================================
//  De aquí para abajo está el código que arma la plaza.
// ===============================================================

// Crea todas las imágenes de la plaza (solo la primera vez)
function crearTexturasPlaza(escena) {
  if (escena.textures.exists('tile_baldosa')) return;
  const rnd = new Phaser.Math.RandomDataGenerator(['texturas']);

  Object.keys(SPRITES_PLAZA).forEach((clave) => crearTexturaPixel(escena, clave, SPRITES_PLAZA[clave]));

  COLORES_AUTOS.forEach((c, i) => {
    crearTexturaPixel(escena, 'auto_' + i, {
      colores: { C: c[0], c: c[1], V: 0x37557a, L: 0xfff3b0, R: 0xff4040 },
      cuadros: [DIBUJO_AUTO]
    });
  });

  // Baldosas de 16x16 con junturas oscuras y puntitos
  texturaDibujada(escena, 'tile_baldosa', 16, 16, (punto) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        let color = rnd.frac() < 0.12 ? 0x5f5c58 : 0x6b6864;
        if (x % 8 === 0 || y % 8 === 0) color = 0x4a4744;
        punto(x, y, color);
      }
    }
  });

  // Pasto con hojitas claras y oscuras
  texturaDibujada(escena, 'tile_pasto', 16, 16, (punto) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = rnd.frac();
        punto(x, y, r < 0.12 ? 0x3d7234 : r < 0.24 ? 0x23461f : 0x2f5a2a);
      }
    }
  });

  // Tierra con piedritas
  texturaDibujada(escena, 'tile_tierra', 16, 16, (punto) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = rnd.frac();
        punto(x, y, r < 0.08 ? 0x8a6a4a : r < 0.2 ? 0x5a4129 : 0x6b4f35);
      }
    }
  });

  // Asfalto de la calle
  texturaDibujada(escena, 'tile_asfalto', 16, 16, (punto) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = rnd.frac();
        punto(x, y, r < 0.1 ? 0x37373b : r < 0.2 ? 0x222225 : 0x2c2c30);
      }
    }
  });

  // Árbol visto desde arriba: copa redonda con luces y sombras
  texturaDibujada(escena, 'arbol', 29, 29, (punto) => {
    const c = 14;
    for (let y = 0; y < 29; y++) {
      for (let x = 0; x < 29; x++) {
        // borde un poco irregular para que parezca follaje
        const d = Math.sqrt((x - c) * (x - c) + (y - c) * (y - c)) + rnd.frac() * 1.2;
        if (d > 14.5) continue;
        let color = 0x2e6b30;
        if (d > 13.3) color = 0x0f2a14;                                  // borde
        else if (x + y < 22 && rnd.frac() < 0.45) color = 0x4a8f3c;      // luz (arriba izquierda)
        else if (x + y > 34 && rnd.frac() < 0.55) color = 0x1f4d22;      // sombra (abajo derecha)
        else if (rnd.frac() < 0.1) color = 0x24572a;
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

// Decide dónde va cada cosa (siempre igual con la misma semilla)
function generarPlaza() {
  const rnd = new Phaser.Math.RandomDataGenerator([String(CONFIG.MAPA_SEMILLA)]);
  const A = CONFIG.MAPA_ANCHO;
  const H = CONFIG.MAPA_ALTO;
  const cx = A / 2;
  const cy = H / 2;
  const P = CONFIG.PASILLO_ANCHO / 2;    // mitad del ancho de los caminos en cruz
  const calle = CONFIG.CALLE_ANCHO;
  const borde = calle + 120;             // donde empiezan los prados (después de la vereda)

  const plaza = {
    centro: { x: cx, y: cy },
    inicio: { x: cx, y: cy + CONFIG.PILETA_RADIO + 200 }, // donde aparece el perro
    pastos: [], senderos: [], solidos: [], faroles: [], basureros: [], adornos: []
  };
  const reservado = (x, y, margen) =>
    Phaser.Math.Distance.Between(x, y, plaza.inicio.x, plaza.inicio.y) < 90 + margen;
  const lejosDeFaroles = (x, y, margen) =>
    plaza.faroles.every((f) => Phaser.Math.Distance.Between(x, y, f.x, f.y) > margen);
  const sobreSendero = (x, y, margen) => plaza.senderos.some((s) =>
    x > s.x - margen && x < s.x + s.w + margen && y > s.y - margen && y < s.y + s.h + margen);

  // Pileta en el centro
  plaza.solidos.push({ forma: 'circulo', x: cx, y: cy, r: CONFIG.PILETA_RADIO, tipo: 'pileta' });
  plaza.adornos.push({ clave: 'pileta', x: cx, y: cy, profundidad: 1 });

  // 4 prados de pasto (uno en cada esquina de la cruz) con senderos de tierra
  const tramosX = [[borde, cx - P], [cx + P, A - borde]];
  const tramosY = [[borde, cy - P], [cy + P, H - borde]];
  tramosX.forEach(([x0, x1]) => {
    tramosY.forEach(([y0, y1]) => {
      const prado = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      plaza.pastos.push(prado);
      for (let i = 0; i < CONFIG.SENDEROS_POR_PRADO; i++) {
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

  // Faroles: primero 4 alrededor de la pileta, después a lo largo de los caminos
  const puestos = [];
  for (let i = 0; i < 4; i++) {
    const ang = Math.PI / 4 + (i * Math.PI) / 2;
    const d = CONFIG.PILETA_RADIO + 70;
    puestos.push({ x: cx + Math.cos(ang) * d, y: cy + Math.sin(ang) * d });
  }
  const puestosCaminos = [];
  for (let brazo = 0; brazo < 4; brazo++) {
    [450, 800, 1150].forEach((s) => {
      [-1, 1].forEach((lado) => puestosCaminos.push(puntoEnBrazo(brazo, s, lado, P - 12)));
    });
  }
  puestos.push(...rnd.shuffle(puestosCaminos));
  puestos.slice(0, CONFIG.FAROLES).forEach((f) => {
    plaza.faroles.push({ x: f.x, y: f.y });
    plaza.adornos.push({ clave: 'farol', x: f.x, y: f.y, profundidad: 2 });
  });

  // Bancas: a la orilla de los caminos, mirando hacia el camino
  const bancas = [];
  for (let intento = 0; intento < CONFIG.BANCAS * 40 && bancas.length < CONFIG.BANCAS; intento++) {
    const p = puntoEnBrazo(rnd.between(0, 3), rnd.between(320, cx - borde - 40), rnd.pick([-1, 1]), P - 40);
    const w = p.horizontal ? CHOQUE_BANCA.ANCHO : CHOQUE_BANCA.ALTO;
    const h = p.horizontal ? CHOQUE_BANCA.ALTO : CHOQUE_BANCA.ANCHO;
    if (!puntoLibre(plaza.solidos, p.x, p.y, CHOQUE_BANCA.ANCHO / 2 + 40)) continue;
    if (!lejosDeFaroles(p.x, p.y, 50) || reservado(p.x, p.y, 40)) continue;
    const banca = { forma: 'rect', x: p.x, y: p.y, w, h, tipo: 'banca', horizontal: p.horizontal };
    bancas.push(banca);
    plaza.solidos.push(banca);
    plaza.adornos.push({ clave: 'banca', x: p.x, y: p.y, angulo: p.horizontal ? 0 : 90, profundidad: 2 });
  }

  // Basureros: al lado de una banca
  for (let intento = 0; intento < CONFIG.BASUREROS * 40 && plaza.basureros.length < CONFIG.BASUREROS; intento++) {
    if (bancas.length === 0) break;
    const b = rnd.pick(bancas);
    const lado = rnd.pick([-1, 1]);
    const x = b.horizontal ? b.x + lado * (CHOQUE_BANCA.ANCHO / 2 + 26) : b.x;
    const y = b.horizontal ? b.y : b.y + lado * (CHOQUE_BANCA.ANCHO / 2 + 26);
    if (!puntoLibre(plaza.solidos, x, y, CHOQUE_BASURERO + 10) || !lejosDeFaroles(x, y, 30)) continue;
    plaza.solidos.push({ forma: 'circulo', x, y, r: CHOQUE_BASURERO, tipo: 'basurero' });
    plaza.basureros.push({ x, y });
    plaza.adornos.push({ clave: 'basurero', x, y, profundidad: 2 });
  }

  // Árboles: en los prados, sin tapar los senderos
  let arboles = 0;
  for (let intento = 0; intento < CONFIG.ARBOLES * 40 && arboles < CONFIG.ARBOLES; intento++) {
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
  let autos = 0;
  for (let intento = 0; intento < CONFIG.AUTOS * 40 && autos < CONFIG.AUTOS; intento++) {
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
    plaza.adornos.push({ clave: 'auto_' + rnd.between(0, COLORES_AUTOS.length - 1), x, y, angulo, profundidad: 2 });
    autos++;
  }

  return plaza;
}

// Pinta el suelo de toda la plaza en una sola imagen (calle, baldosas,
// pasto y tierra). Se pinta en tamaño chico y se agranda x3.
function dibujarSueloPlaza(escena, plaza) {
  const E = ESCALA_PIXEL;
  const clave = 'suelo_plaza';
  if (!escena.textures.exists(clave)) {
    const textura = escena.textures.createCanvas(clave, Math.ceil(CONFIG.MAPA_ANCHO / E), Math.ceil(CONFIG.MAPA_ALTO / E));
    const ctx = textura.getContext();
    const rect = (r, relleno) => {
      ctx.fillStyle = relleno;
      ctx.fillRect(Math.round(r.x / E), Math.round(r.y / E), Math.round(r.w / E), Math.round(r.h / E));
    };
    const patron = (tile) => ctx.createPattern(escena.textures.get(tile).getSourceImage(), 'repeat');
    const borde = (r, color) => {
      const x = Math.round(r.x / E), y = Math.round(r.y / E), w = Math.round(r.w / E), h = Math.round(r.h / E);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
      ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
    };

    const A = CONFIG.MAPA_ANCHO;
    const H = CONFIG.MAPA_ALTO;
    const calle = CONFIG.CALLE_ANCHO;

    rect({ x: 0, y: 0, w: A, h: H }, patron('tile_asfalto'));                              // calle
    rect({ x: calle, y: calle, w: A - calle * 2, h: H - calle * 2 }, patron('tile_baldosa')); // vereda y caminos
    borde({ x: calle, y: calle, w: A - calle * 2, h: H - calle * 2 }, '#9a9a9a');            // solera

    // Línea amarilla punteada al medio de la calle
    ctx.fillStyle = '#8a7a2a';
    const m = Math.round(calle / 2 / E);
    const fin = Math.round(A / E);
    for (let i = 0; i < fin; i += 12) {
      ctx.fillRect(i, m, 6, 1); ctx.fillRect(i, Math.round(H / E) - m, 6, 1);
      ctx.fillRect(m, i, 1, 6); ctx.fillRect(Math.round(A / E) - m, i, 1, 6);
    }

    plaza.pastos.forEach((r) => { rect(r, patron('tile_pasto')); borde(r, '#1a3517'); });
    plaza.senderos.forEach((r) => rect(r, patron('tile_tierra')));
    textura.refresh();
  }
  escena.add.image(0, 0, clave).setOrigin(0).setScale(E).setDepth(0);
}

// Arma la plaza completa en la escena: suelo, adornos y obstáculos sólidos.
// Devuelve la plaza con:
//   obstaculos: grupo de física (para los choques)
//   libre(x, y, margen): true si no hay obstáculos cerca
//   buscarLibre(x, y, margen): el punto libre más cercano
function crearPlaza(escena) {
  crearTexturasPlaza(escena);
  const plaza = generarPlaza();
  dibujarSueloPlaza(escena, plaza);

  plaza.adornos.forEach((a) => {
    escena.add.image(a.x, a.y, a.clave).setScale(ESCALA_PIXEL).setAngle(a.angulo || 0).setDepth(a.profundidad);
  });

  // Choques: figuras invisibles con la forma de cada obstáculo
  plaza.obstaculos = escena.physics.add.staticGroup();
  plaza.solidos.forEach((s) => {
    const circulo = s.forma === 'circulo';
    const zona = escena.add.zone(s.x, s.y, circulo ? s.r * 2 : s.w, circulo ? s.r * 2 : s.h);
    plaza.obstaculos.add(zona);
    if (circulo) zona.body.setCircle(s.r);
    zona.solido = s;
  });

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

// Capa oscura encima de la plaza (debajo de la pantalla de vida y nivel)
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
    const sx = f.x - cam.scrollX;
    const sy = f.y - cam.scrollY;
    if (sx < -R || sy < -R || sx > w + R || sy > h + R) return; // fuera de pantalla
    capa.erase(oscuridad.luzFarol, sx, sy);
  });
  capa.erase(oscuridad.luzPerro, perro.x - cam.scrollX, perro.y - cam.scrollY);
}

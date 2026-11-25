// ===============================================================
//  PORTADA: la escena animada de la pantalla de bienvenida
//  (src/scenes/BienvenidaScene.js): una calle de noche con faroles,
//  basureros, edificios con ventanas, estrellas y luna, y dos perros:
//  un chow chow (izquierda) y un shar pei (derecha).
//
//  Los perros son pixel art hecho en código, con las mismas reglas que
//  los dibujos de src/sprites.js: grillas de letras, borde K casi negro,
//  C/c/L = color, sombra y luz. Aquí las grillas se ARMAN con formas
//  (óvalos y rectángulos), se les pone el borde K solo y después se
//  agregan los detalles (ojos, arrugas, lengua...). Cada cuadro de la
//  animación se arma igual, así todos calzan.
//
//  Los números (tamaño, posiciones, velocidades) están en src/config.js,
//  sección PORTADA.
// ===============================================================

// Colores de cada perro (formato 0xRRGGBB). K y W vienen de COLORES_COMUNES (src/sprites.js)
const COLORES_CHOW = {
  N: 0x241d1b, // pelo negro
  n: 0x4a362a, // reflejos café oscuro
  h: 0x6e4b31, // brillo café (bordes con luz)
  T: 0x3b2d26, // cola (un poco más café para que se separe del lomo)
  O: 0xd9a86c, // ojo cerrado y contento (rayita clara)
  P: 0x6a58b4, // lengua morada-azulada
  p: 0x9688d6  // brillo de la lengua
};
const COLORES_SHARPEI = {
  C: 0xd29a5c, // canela / dorado
  c: 0x9c6a35, // arrugas y sombra
  L: 0xeabf88, // luz
  Z: 0xb3736a, // nariz rosada-café
  M: 0x7a4a2a  // boca
};

// ---------------------------------------------------------------
//  Lienzo de pixel art: grilla de letras ('.' = vacío)
// ---------------------------------------------------------------
function lienzoPixel(ancho, alto) {
  const m = [];
  for (let y = 0; y < alto; y++) m.push(new Array(ancho).fill('.'));
  const dentro = (x, y) => x >= 0 && y >= 0 && x < ancho && y < alto;
  const L = {
    ancho, alto,
    pon(x, y, letra) {
      x = Math.round(x); y = Math.round(y);
      if (dentro(x, y)) m[y][x] = letra;
    },
    ver(x, y) {
      x = Math.round(x); y = Math.round(y);
      return dentro(x, y) ? m[y][x] : '.';
    },
    rect(x, y, w, h, letra) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) L.pon(i, j, letra);
    },
    elipse(cx, cy, rx, ry, letra) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          if (dx * dx + dy * dy <= 1.0001) L.pon(x, y, letra);
        }
      }
    },
    // Línea de cuadritos de (x0, y0) a (x1, y1)
    linea(x0, y0, x1, y1, letra) {
      const pasos = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let k = 0; k <= pasos; k++) L.pon(x0 + (x1 - x0) * k / pasos, y0 + (y1 - y0) * k / pasos, letra);
    },
    // Cambia una letra por otra solo donde ya hay esa letra
    cambiar(x, y, de, a) { if (L.ver(x, y) === de) L.pon(x, y, a); },
    // Borde K alrededor de todo lo pintado (como en los sprites del juego)
    contorno() {
      const nuevos = [];
      for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ancho; x++) {
          if (m[y][x] !== '.') continue;
          const vecino = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => {
            const v = L.ver(x + a, y + b);
            return v !== '.' && v !== 'K';
          });
          if (vecino) nuevos.push([x, y]);
        }
      }
      nuevos.forEach(([x, y]) => { m[y][x] = 'K'; });
    },
    // Luz en los bordes de arriba: cada cuadrito de "base" que tiene borde K encima pasa a "luz"
    luzArriba(base, luz) {
      for (let y = 1; y < alto; y++) {
        for (let x = 0; x < ancho; x++) {
          if (m[y][x] === base && m[y - 1][x] === 'K') m[y][x] = luz;
        }
      }
    },
    filas() { return m.map((fila) => fila.join('')); }
  };
  return L;
}

// ---------------------------------------------------------------
//  CHOW CHOW: cuerpo de lado mirando a la derecha y cabeza de frente
//  (melena de león alrededor de la cara). 40 x 27 cuadritos.
//  cola: 0 a 3 (posición del meneo) · lengua: 0 = corta, 1 = larga (jadeo)
//  La lengua está SIEMPRE afuera: al jadear solo se alarga y se acorta.
// ---------------------------------------------------------------
const MELENA_CHOW = { x: 29, y: 10, r: 8.5 };  // centro y radio de la melena
const CARA_CHOW = { x: 29, y: 10.5, rx: 5.2, ry: 4.8 }; // la cara negra, dentro de la melena

function dibujoChow(cola, lengua) {
  const L = lienzoPixel(40, 27);
  const meneo = [-1, 0, 1, 0][cola % 4];
  const M = MELENA_CHOW;
  const C = CARA_CHOW;

  // Cola plumosa enroscada sobre el lomo: círculos en espiral desde el anca
  // (la punta se mueve más que la base al menear)
  const espiral = [[8, 10, 2.6], [7.5, 7.2, 2.8], [9.5, 4.8, 2.8], [12.5, 4, 2.6], [15, 5.2, 2.3], [15.5, 7.6, 1.8]];
  espiral.forEach(([cx, cy, r]) => L.elipse(cx + meneo * (11 - cy) / 5, cy, r, r, 'T'));

  // Patas cortas y gruesas (las de atrás, más oscuras)
  L.rect(13, 20, 3, 6, 'n');
  L.rect(29, 20, 3, 6, 'n');
  L.rect(8, 19, 4, 7, 'N');
  L.rect(24, 19, 4, 7, 'N');

  // Cuerpo, "pantalones" peludos y pecho
  L.elipse(18, 15, 10.5, 5.5, 'N');
  L.elipse(9.5, 16, 4.5, 5, 'N');
  L.elipse(26, 16, 5, 5.5, 'N');

  // Orejitas chicas y redondeadas (arriba de la melena, a cada lado)
  L.elipse(23.5, 2.2, 1.7, 1.7, 'N');
  L.elipse(34.5, 2.2, 1.7, 1.7, 'N');

  // Melena de león: círculo grande café con mechones en el borde
  L.elipse(M.x, M.y, M.r, M.r, 'n');
  for (let a = 0; a < 360; a += 20) {
    const r = Phaser.Math.DegToRad(a);
    L.pon(M.x + Math.cos(r) * (M.r + 1), M.y + Math.sin(r) * (M.r + 1), 'n');
  }

  L.contorno();

  // ---- Detalles ----
  // Mechones más oscuros en la melena (rayitas desde la cara hacia afuera)
  for (let y = 0; y < 27; y++) {
    for (let x = 0; x < 40; x++) {
      const ang = Math.round(Math.atan2(y - M.y, x - M.x) / (Math.PI / 8));
      if (Math.hypot(x - M.x, y - M.y) > C.rx + 1.5 && ang % 3 === 0) L.cambiar(x, y, 'n', 'N');
    }
  }
  // Pelo del cuerpo y de la cola: rayitas cortas
  for (let y = 0; y < 27; y++) {
    for (let x = 0; x < 40; x++) {
      if (y % 3 === 0 && (x + y) % 7 < 2) L.cambiar(x, y, 'N', 'n');
      if ((x + y * 2) % 5 === 0) L.cambiar(x, y, 'T', 'n');
    }
  }
  L.luzArriba('N', 'h');          // reflejos café donde le da la luz (arriba)
  L.luzArriba('n', 'h');
  L.luzArriba('T', 'h');

  // Cara negra al centro de la melena
  L.elipse(C.x, C.y, C.rx, C.ry, 'N');
  // Orejas por dentro
  L.pon(23.5, 2.5, 'h'); L.pon(34.5, 2.5, 'h');
  // Ojitos cerrados y contentos (arquitos claros)
  [[25, 9], [31, 9]].forEach(([x, y]) => {
    L.pon(x, y, 'O'); L.pon(x + 1, y - 1, 'O'); L.pon(x + 2, y, 'O');
  });
  // Hocico corto (un poco más claro) y nariz negra brillante
  L.elipse(29, 13, 2.6, 1.6, 'n');
  L.rect(28, 11, 3, 2, 'K');
  L.pon(28, 11, 'h');
  // Boca abierta y lengua morada-azulada colgando (siempre afuera; jadeando se alarga)
  L.pon(27, 14, 'K'); L.pon(31, 14, 'K');
  const largo = lengua ? 6 : 5;
  for (let k = 0; k < largo; k++) {
    const ancho = k === largo - 1 ? 1 : 3;
    for (let x = 0; x < ancho; x++) L.pon(28 + x + (ancho === 1 ? 1 : 0), 14 + k, 'P');
  }
  // borde de la lengua (para que se note sobre el pelo)
  for (let k = 0; k <= largo; k++) {
    [27, 31].forEach((x) => { if (L.ver(x, 14 + k) !== 'P') L.pon(x, 14 + k, 'K'); });
  }
  L.pon(28, 14 + largo - 1, 'K'); L.pon(30, 14 + largo - 1, 'K'); L.pon(29, 14 + largo, 'K');
  L.pon(28, 15, 'p'); L.pon(28, 16, 'p');   // brillo
  L.pon(29, 15, 'K');                        // rayita del medio de la lengua
  return L.filas();
}

// ---------------------------------------------------------------
//  SHAR PEI (mira a la izquierda). 44 x 36 cuadritos.
//  respira: 0 = abajo, 1 = arriba (todo menos las patas sube 1)
//  ojo: 0 = abierto, 1 = cerrado (parpadeo)
// ---------------------------------------------------------------
const BOCA_SHARPEI = { x: 3, y: 19 }; // comisura de la boca (de ahí cuelga la baba)

function dibujoSharpei(respira, ojo) {
  const L = lienzoPixel(44, 36);
  const d = respira ? -1 : 0;
  const o = 2; // corre todo 2 cuadritos a la derecha (espacio para el borde)

  // Patas gruesas (no se mueven al respirar)
  L.rect(o + 30, 28, 3, 6, 'c');
  L.rect(o + 11, 28, 3, 6, 'c');
  L.rect(o + 26, 27, 4, 7, 'C');
  L.rect(o + 6, 27, 4, 7, 'C');

  // Colita enroscada arriba
  L.elipse(o + 36, 15 + d, 2.2, 2.2, 'C');
  L.elipse(o + 34.5, 17 + d, 2, 2, 'C');

  // Cuerpo y cuello lleno de pliegues
  L.elipse(o + 22, 22 + d, 13, 7, 'C');
  L.elipse(o + 12, 19 + d, 6.5, 7.5, 'C');

  // Cabeza grande y cuadrada
  L.elipse(o + 11, 11 + d, 9, 8, 'C');
  L.rect(o + 4, 6 + d, 14, 10, 'C');

  // Hocico ancho tipo hipopótamo (abultado)
  L.elipse(o + 4, 15 + d, 5, 4.5, 'L');
  L.elipse(o + 8, 16 + d, 3.5, 3.5, 'L');

  L.contorno();

  // ---- Detalles ----
  L.luzArriba('C', 'L');

  // Orejita chica doblada hacia adelante
  L.rect(o + 14, 4 + d, 4, 2, 'c');
  L.pon(o + 14, 6 + d, 'c'); L.pon(o + 15, 6 + d, 'c');
  L.linea(o + 13, 7 + d, o + 16, 7 + d, 'K');
  L.pon(o + 18, 5 + d, 'K'); L.pon(o + 17, 6 + d, 'K');

  // Muchas arrugas en la frente (curvas, como un acordeón)
  const arco = (x0, x1, y, alto) => {
    const mitad = Math.round((x0 + x1) / 2);
    L.linea(o + x0, y + alto + d, o + mitad, y + d, 'c');
    L.linea(o + mitad, y + d, o + x1, y + alto + d, 'c');
  };
  arco(5, 14, 3, 1);
  arco(4, 14, 5, 1);
  arco(4, 9, 7, 1);
  arco(11, 15, 7, 1);
  // Arrugas de la cara (alrededor del ojo y sobre el hocico)
  L.linea(o + 6, 12 + d, o + 9, 13 + d, 'c');
  L.linea(o + 12, 11 + d, o + 15, 13 + d, 'c');
  L.linea(o + 10, 14 + d, o + 13, 16 + d, 'c');

  // Ojo caído y tierno (párpado que baja hacia afuera)
  if (ojo) {
    L.linea(o + 7, 10 + d, o + 10, 10 + d, 'K');      // cerrado: una rayita
  } else {
    L.pon(o + 8, 10 + d, 'K'); L.pon(o + 9, 10 + d, 'K');
    L.pon(o + 8, 11 + d, 'K'); L.pon(o + 9, 11 + d, 'W');
    L.pon(o + 7, 9 + d, 'c'); L.pon(o + 8, 9 + d, 'c'); L.pon(o + 9, 9 + d, 'c');
  }
  L.pon(o + 10, 10 + d, 'c'); L.pon(o + 10, 11 + d, 'c');  // el párpado cae hacia afuera

  // Nariz rosada-café grande en la punta del hocico
  L.rect(o - 1, 11 + d, 3, 2, 'Z');
  L.pon(o - 1, 11 + d, 'L');
  L.pon(o, 13 + d, 'K');

  // Boca y belfos (labios caídos)
  L.linea(o, 16 + d, o + 7, 17 + d, 'M');
  L.linea(o + 1, 18 + d, o + 7, 19 + d, 'c');

  // Pliegues gruesos del cuello (papada en capas) y uno en el hombro
  arco(8, 16, 19, -1);
  arco(7, 17, 21, -1);
  arco(8, 16, 23, -1);
  L.linea(o + 18, 18 + d, o + 19, 23 + d, 'c');
  L.linea(o + 33, 18 + d, o + 33, 21 + d, 'c');
  return L.filas();
}

// Crea las texturas de los dos perros (solo la primera vez)
function crearTexturasPortada(escena) {
  if (!escena.textures.exists('portada_chow')) {
    const cuadros = [];
    for (let lengua = 0; lengua < 2; lengua++) for (let cola = 0; cola < 4; cola++) cuadros.push(dibujoChow(cola, lengua));
    crearTexturaPixel(escena, 'portada_chow', { colores: COLORES_CHOW, cuadros });
  }
  if (!escena.textures.exists('portada_sharpei')) {
    const cuadros = [];
    for (let ojo = 0; ojo < 2; ojo++) for (let respira = 0; respira < 2; respira++) cuadros.push(dibujoSharpei(respira, ojo));
    crearTexturaPixel(escena, 'portada_sharpei', { colores: COLORES_SHARPEI, cuadros });
  }
}

// ---------------------------------------------------------------
//  La portada completa. Devuelve un objeto con actualizar(tiempo) y
//  los datos de los perros (para poner el "¡Guau!" encima).
// ---------------------------------------------------------------
function crearPortada(escena) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const h = escena.scale.height;
  const suelo = Math.round(h * P.VEREDA_Y);   // donde están las patas de los perros
  const azar = new Phaser.Math.RandomDataGenerator(['portada']);

  dibujarCieloPortada(escena, suelo, azar);
  dibujarEdificiosPortada(escena, suelo, azar);
  dibujarCallePortada(escena, suelo);
  crearFarolesPortada(escena, suelo);
  dibujarBasurerosPortada(escena, suelo);

  // Los perros (con su sombra)
  crearTexturasPortada(escena);
  const px = P.PIXEL;
  const sombra = escena.add.graphics();
  const chow = escena.add.sprite(Math.round(w * P.CHOW_X), suelo, 'portada_chow', 0)
    .setOrigin(0.5, 1).setScale(px);
  const sharpei = escena.add.sprite(Math.round(w * P.SHARPEI_X), suelo, 'portada_sharpei', 0)
    .setOrigin(0.5, 1).setScale(px);
  // el shar pei tiene una fila vacía abajo: se baja 1 cuadrito para que las patas toquen la vereda
  sharpei.y += px;
  sombra.fillStyle(0x000000, 0.35);
  sombra.fillEllipse(chow.x, suelo, chow.displayWidth * 0.8, px * 3);
  sombra.fillEllipse(sharpei.x, suelo, sharpei.displayWidth * 0.8, px * 3);

  const baba = escena.add.graphics();
  const portada = {
    chow, sharpei, suelo,
    proximoParpadeo: 0,
    parpadeoHasta: 0,
    actualizar(tiempo) {
      // Chow chow: mueve la cola y jadea (la lengua nunca se mete del todo)
      const cola = Math.floor(tiempo / P.COLA_MS) % 4;
      const lengua = Math.floor(tiempo / P.JADEO_MS) % 2;
      chow.setFrame(lengua * 4 + cola);

      // Shar pei: respira y parpadea cada tanto
      const respira = Math.sin(tiempo / P.RESPIRA_MS * Math.PI * 2) > 0 ? 1 : 0;
      if (this.proximoParpadeo === 0) this.proximoParpadeo = tiempo + Phaser.Math.Between(P.PARPADEO_CADA_MS[0], P.PARPADEO_CADA_MS[1]);
      if (tiempo >= this.proximoParpadeo) {
        this.parpadeoHasta = tiempo + P.PARPADEO_DURA_MS;
        this.proximoParpadeo = tiempo + Phaser.Math.Between(P.PARPADEO_CADA_MS[0], P.PARPADEO_CADA_MS[1]);
      }
      const ojo = tiempo < this.parpadeoHasta ? 1 : 0;
      sharpei.setFrame(ojo * 2 + respira);

      // Hilo de baba que cuelga de la boca del shar pei y se balancea
      dibujarBaba(baba, sharpei, respira, tiempo, px);
    }
  };
  return portada;
}

// Hilo de baba: una cadenita de cuadritos que cuelga de la comisura y se mece (péndulo suave)
function dibujarBaba(g, sharpei, respira, tiempo, px) {
  const P = CONFIG.PORTADA;
  g.clear();
  const izq = sharpei.x - sharpei.displayWidth / 2;
  const arriba = sharpei.y - sharpei.displayHeight;
  const x0 = izq + BOCA_SHARPEI.x * px;
  const y0 = arriba + (BOCA_SHARPEI.y - respira) * px;
  // el largo cambia un poquito (se estira y se encoge)
  const largo = P.BABA_LARGO + Math.round(Math.sin(tiempo / (P.BABA_VAIVEN_MS * 1.7)) * 0.8);
  const angulo = Math.sin(tiempo / P.BABA_VAIVEN_MS * Math.PI * 2) * P.BABA_ANGULO;
  for (let k = 0; k < largo; k++) {
    const t = (k + 1) / largo;
    const x = Math.round((x0 + Math.sin(angulo) * k * px * t) / px) * px;
    const y = y0 + k * px;
    g.fillStyle(0xd8eefc, k === largo - 1 ? 0.95 : 0.7).fillRect(x - px / 2, y, px, px);
  }
  // gotita en la punta, más gordita
  const xf = Math.round((x0 + Math.sin(angulo) * (largo - 1) * px) / px) * px;
  g.fillStyle(0xffffff, 0.9).fillRect(xf - px / 2, y0 + largo * px, px, px * 0.8);
}

// ---------------------------------------------------------------
//  FONDO: cielo, estrellas, luna, edificios, calle, faroles y basureros
// ---------------------------------------------------------------

function dibujarCieloPortada(escena, suelo, azar) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const g = escena.add.graphics();
  g.fillGradientStyle(0x060a22, 0x060a22, 0x1c2754, 0x1c2754, 1).fillRect(0, 0, w, suelo);
  for (let i = 0; i < P.ESTRELLAS; i++) {
    g.fillStyle(0xffffff, azar.realInRange(0.3, 0.9)).fillRect(azar.between(0, w), azar.between(0, suelo - 160), 2, 2);
  }
  // Estrellas que brillan (crecen un poco y se apagan)
  for (let i = 0; i < P.ESTRELLAS_BRILLAN; i++) {
    const s = escena.add.rectangle(azar.between(20, w - 20), azar.between(10, suelo - 180), 3, 3, 0xfff8e1);
    escena.tweens.add({
      targets: s, alpha: 0.1, scale: 0.6, duration: azar.between(P.ESTRELLA_MS[0], P.ESTRELLA_MS[1]),
      yoyo: true, repeat: -1, delay: azar.between(0, 1500), ease: 'Sine.easeInOut'
    });
  }
  // Luna en pixel art
  const lx = Math.round(w * P.LUNA_X);
  const ly = P.LUNA_Y + margenExtra() / 2;
  g.fillStyle(0xfff3c4, 0.08).fillCircle(lx + 3, ly, 64);
  g.fillStyle(0xfff3c4, 1);
  [[-2, 3], [-3, 4], [-4, 4], [-4, 4], [-4, 4], [-4, 4], [-3, 4], [-2, 3]].forEach(([a, b], fila) => {
    g.fillRect(lx + a * 6, ly + (fila - 4) * 6, (b - a) * 6, 6);
  });
  g.fillStyle(0xe6d79a, 1).fillRect(lx - 12, ly - 12, 6, 6).fillRect(lx + 6, ly + 6, 12, 6).fillRect(lx - 6, ly + 12, 6, 6);
}

// Edificios con ventanas; algunas ventanas se prenden y apagan solas
function dibujarEdificiosPortada(escena, suelo, azar) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const g = escena.add.graphics();
  const base = suelo - 6;
  const ventanasQueCambian = [];
  const colores = [0x141a36, 0x10152e, 0x181d3a];
  let x = -10;
  let n = 0;
  while (x < w) {
    const ancho = azar.between(70, 130);
    const alto = azar.between(P.EDIFICIO_ALTO[0], P.EDIFICIO_ALTO[1]);
    const color = colores[n++ % colores.length];
    g.fillStyle(color, 1).fillRect(x, base - alto, ancho, alto);
    g.fillStyle(0x0b0f24, 1).fillRect(x, base - alto, ancho, 4);           // cornisa
    if (azar.frac() < 0.4) g.fillRect(x + ancho / 2 - 4, base - alto - 14, 8, 14); // antena / chimenea
    // Ventanas en grilla
    for (let vy = base - alto + 14; vy < base - 22; vy += 20) {
      for (let vx = x + 10; vx < x + ancho - 14; vx += 18) {
        const prendida = azar.frac() < 0.3;
        g.fillStyle(prendida ? 0xffd27a : 0x0a0d1f, prendida ? 0.85 : 1).fillRect(vx, vy, 8, 10);
        if (!prendida && azar.frac() < 0.08) ventanasQueCambian.push({ x: vx, y: vy });
      }
    }
    x += ancho + azar.between(0, 8);
  }
  // Ventanas que se prenden y apagan (cada una a su ritmo)
  ventanasQueCambian.slice(0, P.VENTANAS_QUE_CAMBIAN).forEach((v) => {
    const r = escena.add.rectangle(v.x, v.y, 8, 10, 0xffd27a).setOrigin(0).setAlpha(0);
    const cambiar = () => {
      const prender = r.alpha < 0.5;
      r.setAlpha(prender ? 0.85 : 0);
      escena.time.delayedCall(Phaser.Math.Between(P.VENTANA_MS[0], P.VENTANA_MS[1]), cambiar);
    };
    escena.time.delayedCall(Phaser.Math.Between(0, P.VENTANA_MS[1]), cambiar);
  });
}

// Vereda (donde están los perros), solera y calle con línea pintada
function dibujarCallePortada(escena, suelo) {
  const w = escena.scale.width;
  const h = escena.scale.height;
  const g = escena.add.graphics();
  const veredaArriba = suelo - 30;
  // Vereda de baldosas
  g.fillStyle(0x4a4a5a, 1).fillRect(0, veredaArriba, w, suelo + 22 - veredaArriba);
  g.fillStyle(0x3a3a48, 1);
  for (let bx = 0; bx < w; bx += 40) g.fillRect(bx, veredaArriba, 2, suelo + 22 - veredaArriba);
  g.fillRect(0, veredaArriba, w, 2).fillRect(0, suelo - 4, w, 2);
  // Solera
  g.fillStyle(0x9a9a9a, 1).fillRect(0, suelo + 22, w, 6);
  g.fillStyle(0x6b6b6b, 1).fillRect(0, suelo + 28, w, 3);
  // Calle de asfalto con línea segmentada
  g.fillStyle(0x23232a, 1).fillRect(0, suelo + 31, w, h - suelo - 31);
  g.fillStyle(0x2c2c34, 1);
  const azar = new Phaser.Math.RandomDataGenerator(['calle']);
  for (let i = 0; i < 70; i++) g.fillRect(azar.between(0, w), azar.between(suelo + 34, h - 4), 4, 4);
  g.fillStyle(0xc9a83a, 0.8);
  const yLinea = h - 16; // abajo de todo, para no pasar por detrás del texto "Toca o presiona..." (PC y celular)
  for (let lx = 10; lx < w; lx += 64) g.fillRect(lx, yLinea, 34, 5);
}

// Faroles con luz que titila (uno anda medio malo)
function crearFarolesPortada(escena, suelo) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  P.FAROLES_X.forEach((fraccion, i) => {
    const x = Math.round(w * fraccion);
    const pie = suelo - 26;
    const arriba = pie - P.FAROL_ALTO;
    const luz = escena.add.graphics();
    [[90, 0.06], [60, 0.08], [36, 0.12]].forEach(([r, a]) => luz.fillStyle(0xffd27a, a).fillCircle(x, arriba + 10, r));
    luz.fillStyle(0xffd27a, 0.12).fillEllipse(x, suelo - 8, 190, 34);
    const poste = escena.add.graphics();
    poste.fillStyle(0x22222c, 1).fillRect(x - 3, arriba + 16, 6, pie - arriba - 16);
    poste.fillRect(x - 8, pie - 6, 16, 8);
    poste.fillRect(x - 10, arriba - 6, 20, 6).fillRect(x - 6, arriba + 12, 12, 6);
    const ampolleta = escena.add.rectangle(x, arriba + 6, 14, 12, 0xffe9a8);
    titilarPortada(escena, [luz, ampolleta], i === P.FAROL_MALO);
  });
}

function titilarPortada(escena, objetos, malo) {
  const P = CONFIG.PORTADA;
  const rango = malo ? P.FAROL_MALO_MS : P.FAROL_TITILA_MS;
  escena.time.delayedCall(Phaser.Math.Between(rango[0], rango[1]), () => {
    const veces = malo ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(1, 2);
    let t = 0;
    for (let k = 0; k < veces; k++) {
      escena.time.delayedCall(t, () => objetos.forEach((o) => o.setAlpha(Phaser.Math.FloatBetween(0.15, 0.5))));
      t += Phaser.Math.Between(50, 110);
      escena.time.delayedCall(t, () => objetos.forEach((o) => o.setAlpha(1)));
      t += Phaser.Math.Between(60, 140);
    }
    escena.time.delayedCall(t, () => titilarPortada(escena, objetos, malo));
  });
}

// Basureros verdes (como los del juego) sobre la vereda
function dibujarBasurerosPortada(escena, suelo) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const g = escena.add.graphics();
  P.BASUREROS_X.forEach((fraccion) => {
    const x = Math.round(w * fraccion);
    const y = suelo - 8;
    g.fillStyle(0x1b1b1b, 1).fillRect(x - 16, y - 46, 32, 48);   // borde
    g.fillStyle(0x2e7d32, 1).fillRect(x - 13, y - 40, 26, 39);   // tarro
    g.fillStyle(0x1b5e20, 1).fillRect(x - 13, y - 40, 5, 39).fillRect(x + 4, y - 40, 3, 39); // franjas
    g.fillStyle(0x43a047, 1).fillRect(x - 16, y - 46, 32, 6);    // tapa
    g.fillStyle(0x1b1b1b, 1).fillRect(x - 5, y - 50, 10, 4);     // manilla
    g.fillStyle(0xc68642, 1).fillRect(x + 6, y - 50, 6, 4);      // algo que se asoma
  });
}

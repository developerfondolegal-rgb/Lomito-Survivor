// ===============================================================
//  SPRITES EN PIXEL ART (estilo 8 bits)
//  Aquí se dibujan todos los personajes, sin archivos de imagen.
//
//  Cómo funciona:
//   - Cada sprite es una cuadrícula de letras (16 x 16 para los
//     personajes). Cada letra es un píxel de un color.
//   - El punto "." es transparente (no se pinta nada).
//   - Los colores de cada letra están en "colores" (formato 0xRRGGBB).
//     Si una letra no está en "colores" del sprite, se busca en
//     COLORES_COMUNES (más abajo).
//   - "cuadros" tiene 2 dibujos: el juego los alterna para que el
//     personaje camine. Los personajes miran hacia la DERECHA; cuando
//     caminan a la izquierda el juego los da vuelta solo.
//   - "animacion": cuántos cuadros por segundo (más alto = pasos más rápidos).
//
//  Para editar un sprite:
//   1. Abre este archivo con el Bloc de notas.
//   2. Cambia letras dentro de las comillas. Cada fila debe tener la
//      misma cantidad de letras (16). Si una fila queda más corta o
//      más larga, el juego avisa en la consola (tecla F12).
//   3. Guarda y recarga el juego (F5).
//
//  Importante: el tamaño de los choques NO depende del dibujo, sino de
//  RADIO en src/config.js. Cambiar un dibujo no cambia la dificultad.
// ===============================================================

// Cuánto se agranda cada píxel en pantalla (3 = cada píxel mide 3x3)
const ESCALA_PIXEL = 3;

// Colores que pueden usar todos los sprites
const COLORES_COMUNES = {
  K: 0x1b1b1b, // borde casi negro (y ojos)
  W: 0xffffff, // blanco
  R: 0xd84343  // rojo (nariz del borracho)
};

const SPRITES = {
  // ---------------------------------------------------------------
  //  PERROS (las razas). El nombre debe ser igual al id de la raza.
  //  C = color principal, c = sombra, L = color claro (guata, hocico)
  // ---------------------------------------------------------------

  // Quiltro: mestizo café, orejas caídas y cola parada
  quiltro: {
    colores: { C: 0x8b5a2b, c: 0x5e3a1a, L: 0xc8935a },
    animacion: 7,
    cuadros: [
      [
        '................',
        '................',
        '................',
        '..K........KK...',
        '.KCK......KccK..',
        '.KCK.....KCCCCK.',
        '..KCK....KCKCCCK',
        '..KCK....KCCCLLK',
        '...KCKKKKKCCCKK.',
        '...KCCCCCCCCCK..',
        '...KCCCCCCCCCK..',
        '...KcLLLLLLLcK..',
        '...KCK.....KCK..',
        '..KCK.......KCK.',
        '..KK........KK..',
        '................'
      ],
      [
        '................',
        '................',
        '................',
        '..K........KK...',
        '.KCK......KccK..',
        '.KCK.....KCCCCK.',
        '..KCK....KCKCCCK',
        '..KCK....KCCCLLK',
        '...KCKKKKKCCCKK.',
        '...KCCCCCCCCCK..',
        '...KCCCCCCCCCK..',
        '...KcLLLLLLLcK..',
        '....KCK..KCK....',
        '....KCK..KCK....',
        '....KK...KK.....',
        '................'
      ]
    ]
  },

  // Pitbull: gris azulado, ancho y musculoso, cabeza grande, pecho blanco
  pitbull: {
    colores: { C: 0x6b7f99, c: 0x4a5a70, L: 0x9fb0c6 },
    animacion: 6,
    cuadros: [
      [
        '................',
        '................',
        '..........KKK...',
        '.........KcCCK..',
        '........KCCCCCKK',
        '........KCKCCCCK',
        '.K......KCCCCLLK',
        '.KK.....KCCCCCK.',
        '..KKKKKKKCCCCCK.',
        '..KCCCCCCCCWWCK.',
        '..KCCCCCCCCWWCK.',
        '..KCCCCCCCCWWK..',
        '..KcCCCCCCCCcK..',
        '..KCCK....KCCK..',
        '.KCCK......KCCK.',
        '.KKK........KKK.'
      ],
      [
        '................',
        '................',
        '..........KKK...',
        '.........KcCCK..',
        '........KCCCCCKK',
        '........KCKCCCCK',
        '.K......KCCCCLLK',
        '.KK.....KCCCCCK.',
        '..KKKKKKKCCCCCK.',
        '..KCCCCCCCCWWCK.',
        '..KCCCCCCCCWWCK.',
        '..KCCCCCCCCWWK..',
        '..KcCCCCCCCCcK..',
        '...KCCK..KCCK...',
        '...KCCK..KCCK...',
        '...KKK...KKK....'
      ]
    ]
  },

  // Galgo: beige, muy delgado, patas largas, hocico largo y cintura fina
  galgo: {
    colores: { C: 0xe8d5b0, c: 0xb89f74, L: 0xfff3dc },
    animacion: 9,
    cuadros: [
      [
        '................',
        '................',
        '................',
        '...........KK...',
        '..........KCcK..',
        '.........KCKCCKK',
        '.........KCCCCCK',
        '.........KCCKKK.',
        '..KKKKKKKCCK....',
        '..KCCCCCCCCCK...',
        '.KK.KCCCCLLLK...',
        '.K...KKKKKLLK...',
        '.K...KCK...KCK..',
        '....KCK.....KCK.',
        '...KCK.......KCK',
        '...KK........KK.'
      ],
      [
        '................',
        '................',
        '................',
        '...........KK...',
        '..........KCcK..',
        '.........KCKCCKK',
        '.........KCCCCCK',
        '.........KCCKKK.',
        '..KKKKKKKCCK....',
        '..KCCCCCCCCCK...',
        '.KK.KCCCCLLLK...',
        '.K...KKKKKLLK...',
        '.K....KCK.KCK...',
        '......KCK.KCK...',
        '......KCK.KCK...',
        '......KK..KK....'
      ]
    ]
  },

  // Beagle: blanco con manchas café y lomo negro (tricolor), orejas largas
  // B = blanco, C = café, c = café oscuro (orejas), N = negro
  beagle: {
    colores: { B: 0xf5f5f0, C: 0x8b5a2b, c: 0x5e3a1a, N: 0x2a2a2a },
    animacion: 8,
    cuadros: [
      [
        '................',
        '................',
        '................',
        '..B.............',
        '.KBK......KKKK..',
        '.KNK.....KCCCCK.',
        '.KNK....KcCCKBBK',
        '..KNK...KcCBBBBK',
        '...KNKKKKcKBBKK.',
        '...KNNNNNBBBBK..',
        '...KCNNNCBBBBK..',
        '...KBBBBBBBBBK..',
        '...KBK.....KBK..',
        '..KBK.......KBK.',
        '..KK........KK..',
        '................'
      ],
      [
        '................',
        '................',
        '................',
        '..B.............',
        '.KBK......KKKK..',
        '.KNK.....KCCCCK.',
        '.KNK....KcCCKBBK',
        '..KNK...KcCBBBBK',
        '...KNKKKKcKBBKK.',
        '...KNNNNNBBBBK..',
        '...KCNNNCBBBBK..',
        '...KBBBBBBBBBK..',
        '....KBK..KBK....',
        '....KBK..KBK....',
        '....KK...KK.....',
        '................'
      ]
    ]
  },

  // ---------------------------------------------------------------
  //  ENEMIGOS. El nombre debe ser igual al id del enemigo.
  // ---------------------------------------------------------------

  // Perro rival: rojizo, orejas paradas, ojo blanco y colmillo
  rival: {
    colores: { C: 0xc0392b, c: 0x7f1f16, L: 0xe57360 },
    animacion: 7,
    cuadros: [
      [
        '................',
        '................',
        '................',
        '..K.......K.K...',
        '.KCK.....KCKCK..',
        '.KCK.....KCCCCK.',
        '..KCK....KCWCCCK',
        '..KCK....KCCCKWK',
        '...KCKKKKKCCCKK.',
        '...KCCCCCCCCCK..',
        '...KCCCCCCCCCK..',
        '...KcLLLLLLLcK..',
        '...KcK.....KcK..',
        '..KcK.......KcK.',
        '..KK........KK..',
        '................'
      ],
      [
        '................',
        '................',
        '................',
        '..K.......K.K...',
        '.KCK.....KCKCK..',
        '.KCK.....KCCCCK.',
        '..KCK....KCWCCCK',
        '..KCK....KCCCKWK',
        '...KCKKKKKCCCKK.',
        '...KCCCCCCCCCK..',
        '...KCCCCCCCCCK..',
        '...KcLLLLLLLcK..',
        '....KcK..KcK....',
        '....KcK..KcK....',
        '....KK...KK.....',
        '................'
      ]
    ]
  },

  // Manada: perritos rojizos chicos (dibujo pequeño al centro)
  manada: {
    colores: { C: 0xe8604c, c: 0xa33a2a, L: 0xffa38f },
    animacion: 10,
    cuadros: [
      [
        '................',
        '................',
        '................',
        '................',
        '................',
        '..........KK....',
        '...K.....KccK...',
        '...KK....KCKCK..',
        '....KKKKKKCCCK..',
        '....KCCCCCCCK...',
        '....KLLLLLLK....',
        '...KK.....KK....',
        '................',
        '................',
        '................',
        '................'
      ],
      [
        '................',
        '................',
        '................',
        '................',
        '................',
        '..........KK....',
        '...K.....KccK...',
        '...KK....KCKCK..',
        '....KKKKKKCCCK..',
        '....KCCCCCCCK...',
        '....KLLLLLLK....',
        '.....KK..KK.....',
        '................',
        '................',
        '................',
        '................'
      ]
    ]
  },

  // Borracho: persona con camisa naranja, nariz roja y botella verde
  // S = piel, s = barba, H = pelo, C = camisa, c = sombra, P = pantalón,
  // B = botella, b = brillo de la botella
  borracho: {
    colores: {
      S: 0xe0ac69, s: 0x9c7a55, H: 0x4a3222, C: 0xff9800, c: 0xc26f00,
      P: 0x3b4a6b, B: 0x2e7d32, b: 0x81c784
    },
    animacion: 4,
    cuadros: [
      [
        '.....KKKK.......',
        '....KHHHHK......',
        '....KHSSSK......',
        '....KSSKSK......',
        '....KSSSSRK..KK.',
        '....KsSSSK...KbK',
        '...KKCCCCKK.KBBK',
        '..KCCCCCCCSSKBBK',
        '..KCCCCcCK..KBBK',
        '..KcCCCcCK...KK.',
        '...KCCCCK.......',
        '...KPPPPK.......',
        '..KPPKKPPK......',
        '..KPK..KPK......',
        '.KPK....KPK.....',
        '.KKK....KKKK....'
      ],
      [
        '.....KKKK.......',
        '....KHHHHK......',
        '....KHSSSK......',
        '....KSSKSK......',
        '....KSSSSRK..KK.',
        '....KsSSSK...KbK',
        '...KKCCCCKK.KBBK',
        '..KCCCCCCCSSKBBK',
        '..KCCCCcCK..KBBK',
        '..KcCCCcCK...KK.',
        '...KCCCCK.......',
        '...KPPPPK.......',
        '...KPPPPK.......',
        '....KPPK........',
        '....KPPK........',
        '....KKKKK.......'
      ]
    ]
  },

  // Drogadicto: persona encorvada con polerón verde pálido y capucha
  // G = polerón, g = sombra, S = piel pálida, P = pantalón
  drogadicto: {
    colores: { G: 0xa5d6a7, g: 0x6f9f71, S: 0xd7e8c0, P: 0x5d5d5d },
    animacion: 5,
    cuadros: [
      [
        '................',
        '................',
        '...KKKK.........',
        '..KGGGGKK.......',
        '.KGGGGGGGKKK....',
        '.KGGGGGGKSSSK...',
        '.KGGGGGGKSKSSK..',
        '.KGGGGGGGKSSK...',
        '..KGGGGGGGKK....',
        '..KgGGGGGGSK....',
        '...KgGGGGKSK....',
        '...KGGGGGK......',
        '...KPPPPPK......',
        '..KPPK.KPPK.....',
        '..KPK...KPK.....',
        '.KKK....KKKK....'
      ],
      [
        '................',
        '................',
        '...KKKK.........',
        '..KGGGGKK.......',
        '.KGGGGGGGKKK....',
        '.KGGGGGGKSSSK...',
        '.KGGGGGGKSKSSK..',
        '.KGGGGGGGKSSK...',
        '..KGGGGGGGKK....',
        '..KgGGGGGGSK....',
        '...KgGGGGKSK....',
        '...KGGGGGK......',
        '...KPPPPPK......',
        '....KPPPK.......',
        '....KPPK........',
        '....KKKKK.......'
      ]
    ]
  },

  // Perrera: persona con uniforme azul, gorra, placa amarilla y un
  // palo con lazo para atrapar perros
  // U = uniforme, u = sombra, H = gorra, S = piel, Y = placa,
  // M = palo de madera, L = lazo (cuerda)
  perrera: {
    colores: {
      U: 0x1e63c8, u: 0x123f80, H: 0x0d2a5c, S: 0xe0ac69, Y: 0xf2d64b,
      M: 0x8d6e63, L: 0xe0d6c8
    },
    animacion: 6,
    cuadros: [
      [
        '.....KKKKK......',
        '....KHHHHHK.....',
        '....KHHHHHHKK...',
        '....KSSSSSK..LL.',
        '....KSSSKSK.L..L',
        '....KSSSSK..L..L',
        '...KKUUUUKK..LL.',
        '..KUUYUUUUK.M...',
        '..KUUUUUUUSM....',
        '..KuUUUUUUK.....',
        '...KUUUUUK......',
        '...KuuuuuK......',
        '..KUUKKUUK......',
        '..KUK..KUK......',
        '.KUK....KUK.....',
        '.KKK....KKKK....'
      ],
      [
        '.....KKKKK......',
        '....KHHHHHK.....',
        '....KHHHHHHKK...',
        '....KSSSSSK..LL.',
        '....KSSSKSK.L..L',
        '....KSSSSK..L..L',
        '...KKUUUUKK..LL.',
        '..KUUYUUUUK.M...',
        '..KUUUUUUUSM....',
        '..KuUUUUUUK.....',
        '...KUUUUUK......',
        '...KuuuuuK......',
        '...KUUUUK.......',
        '....KUUK........',
        '....KUUK........',
        '....KKKKK.......'
      ]
    ]
  },

  // ---------------------------------------------------------------
  //  OBJETOS Y EFECTOS (dibujos más chicos, con 1 solo cuadro)
  // ---------------------------------------------------------------

  // Hueso (experiencia). Y = hueso, D = borde
  hueso: {
    colores: { Y: 0xf2d64b, D: 0x8a6d00 },
    cuadros: [
      [
        '.DD...DD.',
        'DYYDDDYYD',
        '.DYYYYYD.',
        'DYYDDDYYD',
        '.DD...DD.'
      ]
    ]
  },

  // Mordida: unos dientes que se cierran sobre el enemigo
  // (se pinta amarilla y más grande con la Mandíbula de hierro)
  mordida: {
    colores: {},
    cuadros: [
      [
        '..WWWWW..',
        '.WWWWWWW.',
        'WW.W.W.WW',
        'W.......W',
        'WW.W.W.WW',
        '.WWWWWWW.',
        '..WWWWW..'
      ]
    ]
  }
};

// Si una raza o enemigo nuevo no tiene dibujo aquí, se usa este
// dibujo pintado con el COLOR que tenga en src/config.js
const SPRITE_PERRO_POR_DEFECTO = 'galgo';
const SPRITE_ENEMIGO_POR_DEFECTO = 'rival';

// ===============================================================
//  De aquí para abajo está el código que convierte los dibujos en
//  imágenes para el juego. No hace falta tocarlo para editar sprites.
// ===============================================================

// Crea las imágenes y animaciones de todos los sprites (solo la primera vez)
function crearSprites(escena) {
  Object.keys(SPRITES).forEach((clave) => {
    const sprite = SPRITES[clave];
    if (!escena.textures.exists(clave)) crearTexturaPixel(escena, clave, sprite);
    const animacion = clave + '_caminar';
    if (sprite.cuadros.length > 1 && !escena.anims.exists(animacion)) {
      escena.anims.create({
        key: animacion,
        frames: sprite.cuadros.map((_, i) => ({ key: clave, frame: i })),
        frameRate: sprite.animacion || 6,
        repeat: -1
      });
    }
  });
}

// Pinta los cuadros de un sprite, uno al lado del otro, en una sola imagen
function crearTexturaPixel(escena, clave, sprite) {
  const cuadros = sprite.cuadros;
  const alto = cuadros[0].length;
  const ancho = cuadros[0][0].length;
  const textura = escena.textures.createCanvas(clave, ancho * cuadros.length, alto);
  const ctx = textura.getContext();

  cuadros.forEach((filas, n) => {
    if (filas.length !== alto) {
      console.warn('Sprite "' + clave + '", cuadro ' + (n + 1) + ': tiene ' + filas.length + ' filas y debería tener ' + alto);
    }
    filas.forEach((fila, y) => {
      if (fila.length !== ancho) {
        console.warn('Sprite "' + clave + '", cuadro ' + (n + 1) + ', fila ' + (y + 1) + ': tiene ' + fila.length + ' letras y debería tener ' + ancho);
      }
      for (let x = 0; x < Math.min(fila.length, ancho); x++) {
        const letra = fila[x];
        if (letra === '.' || letra === ' ') continue;
        let color = sprite.colores[letra];
        if (color === undefined) color = COLORES_COMUNES[letra];
        if (color === undefined) {
          console.warn('Sprite "' + clave + '": la letra "' + letra + '" no tiene color');
          continue;
        }
        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.fillRect(n * ancho + x, y, 1, 1);
      }
    });
    textura.add(n, 0, n * ancho, 0, ancho, alto);
  });
  textura.refresh();
}

// Pone un sprite en la escena, agrandado y en su primer cuadro
function agregarSprite(escena, x, y, clave) {
  return escena.add.sprite(x, y, clave, 0).setScale(ESCALA_PIXEL);
}

// Devuelve el nombre del dibujo a usar (o el de por defecto si no existe)
function claveSprite(id, porDefecto) {
  return SPRITES[id] ? id : porDefecto;
}

// Choque circular de "radio" píxeles en pantalla, centrado en el sprite.
// (Phaser agranda el choque junto con el sprite, por eso se divide por la escala)
function ponerChoqueCircular(sprite, radio) {
  const r = radio / sprite.scaleX;
  sprite.body.setCircle(r, sprite.width / 2 - r, sprite.height / 2 - r);
}

// Anima el caminar según la velocidad y da vuelta el sprite hacia donde va
function animarCaminar(sprite, vx, vy) {
  const animacion = sprite.texture.key + '_caminar';
  if (vx * vx + vy * vy > 25) {
    if (sprite.scene.anims.exists(animacion)) sprite.anims.play(animacion, true);
    if (vx < -5) sprite.setFlipX(true);
    else if (vx > 5) sprite.setFlipX(false);
  } else if (sprite.anims.isPlaying) {
    sprite.anims.stop();
    sprite.setFrame(0);
  }
}

// Imagen de la onda del Ladrido: un anillo pixelado del radio pedido.
// Se crea una sola vez por cada tamaño.
function texturaOnda(escena, radio) {
  const r = Math.ceil(radio / ESCALA_PIXEL);
  const clave = 'onda_' + r;
  if (escena.textures.exists(clave)) return clave;

  const lado = r * 2 + 1;
  const textura = escena.textures.createCanvas(clave, lado, lado);
  const ctx = textura.getContext();
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const d = Math.sqrt((x - r) * (x - r) + (y - r) * (y - r));
      if (d > r + 0.5) continue;
      if (d > r - 1) ctx.fillStyle = 'rgba(255,255,255,0.95)';                         // borde
      else if (d > r - 3 && (x + y) % 2 === 0) ctx.fillStyle = 'rgba(255,255,255,0.5)'; // borde punteado
      else ctx.fillStyle = 'rgba(255,255,255,0.12)';                                   // relleno suave
      ctx.fillRect(x, y, 1, 1);
    }
  }
  textura.refresh();
  return clave;
}

// Borde blanco de 1 píxel alrededor de un dibujo (por fuera de su silueta).
// Se pinta de otro color con setTint: dorado en los enemigos élite y del
// color de la rareza en los objetos. Tiene los mismos cuadros que el dibujo
// original, pero cada cuadro es 2 píxeles más ancho y más alto.
function texturaBorde(escena, clave) {
  const claveBorde = 'borde_' + clave;
  if (escena.textures.exists(claveBorde)) return claveBorde;
  const original = escena.textures.get(clave);
  const fuente = original.getSourceImage();
  const nombres = original.getFrameNames().sort((a, b) => Number(a) - Number(b));
  const ctxFuente = fuente.getContext('2d');
  const datos = ctxFuente.getImageData(0, 0, fuente.width, fuente.height);
  const lleno = (x, y) => x >= 0 && y >= 0 && x < fuente.width && y < fuente.height &&
    datos.data[(y * fuente.width + x) * 4 + 3] > 0;

  const cuadros = nombres.length > 0 ? nombres.map((n) => original.get(n)) : [original.get()];
  const ancho = cuadros[0].width + 2;
  const alto = cuadros[0].height + 2;
  const textura = escena.textures.createCanvas(claveBorde, ancho * cuadros.length, alto);
  const ctx = textura.getContext();
  ctx.fillStyle = '#ffffff';

  cuadros.forEach((cuadro, i) => {
    for (let y = -1; y <= cuadro.height; y++) {
      for (let x = -1; x <= cuadro.width; x++) {
        const dentro = x >= 0 && y >= 0 && x < cuadro.width && y < cuadro.height;
        if (dentro && lleno(cuadro.cutX + x, cuadro.cutY + y)) continue;
        // ¿tiene un píxel del dibujo al lado (arriba, abajo o a los lados)?
        const vecino = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const vx = x + dx;
          const vy = y + dy;
          return vx >= 0 && vy >= 0 && vx < cuadro.width && vy < cuadro.height &&
            lleno(cuadro.cutX + vx, cuadro.cutY + vy);
        });
        if (vecino) ctx.fillRect(i * ancho + x + 1, y + 1, 1, 1);
      }
    }
    textura.add(nombres.length > 0 ? nombres[i] : i, 0, i * ancho, 0, ancho, alto);
  });
  textura.refresh();
  return claveBorde;
}

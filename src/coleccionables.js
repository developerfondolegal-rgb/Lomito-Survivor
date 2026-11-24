// ===============================================================
//  ULTRA RAROS COLECCIONABLES (nombres, frases, dibujos y guardado)
//  Los ultra raros son la rareza más difícil (brillo arcoíris). No van
//  al inventario: se guardan en el navegador para siempre y dan un
//  bonus permanente en todas las partidas, con cualquier raza.
//  Cada uno sube del nivel 1 al 5 juntando copias.
//
//  Los números (probabilidades, copias por nivel y bonus) están en
//  src/config.js, en la sección "ULTRA RAROS".
//  Lo usan src/scenes/GameScene.js (el juego), src/scenes/AlbumScene.js
//  (el álbum de la pantalla de inicio) y src/pausa.js (pestaña "Colección").
//
//  Para agregar un coleccionable nuevo:
//   1. Copia un bloque de COLECCIONABLES (aquí abajo) y cambia "id" por
//      un nombre nuevo sin espacios ni tildes. En "mapa" pon el mapa
//      donde se encuentra (por ahora solo existe 'plaza').
//   2. Copia un dibujo en SPRITES_COLECCIONABLES con ese mismo id.
//   3. En src/config.js, dentro de COLECCIONABLES, copia un bloque con ese id.
//   4. Lo que HACE se programa en src/scenes/GameScene.js (busca
//      "bonusColeccion"). Sin eso, se puede juntar y subir de nivel,
//      pero no hace nada.
// ===============================================================

// La rareza ultra rara (va por encima de Legendario)
const RAREZA_ULTRA = { id: 'ultra', nombre: 'Ultra raro', colorTexto: '#f8bbd0' };

// Un coleccionable por cada cosa perdida de la plaza.
//  mapa: en qué mapa se puede encontrar
//  bonus: texto de lo que da en un nivel (c = sus números de config.js)
const COLECCIONABLES = [
  { id: 'chalequito', mapa: 'plaza', nombre: 'Chalequito reflectante',
    frase: '«Para que los autos te vean... y los malos no tanto.»',
    bonus: (c, n) => 'Enemigos aparecen ' + Math.round(c.APARECE_LEJOS * n) + ' px más lejos · −' +
      porcentajeCol(c.MENOS_DANO_EMBESTIDA * n) + ' daño de embestidas' },
  { id: 'sweater', mapa: 'plaza', nombre: 'Sweater tejido a mano',
    frase: '«Lo tejió una abuelita. Pica un poquito.»',
    bonus: (c, n) => '+' + Math.round(c.VIDA * n) + ' vida máxima · recuperas 1 de vida cada ' +
      numeroCol(c.CURA_CADA_MS / n / 1000) + ' s' },
  { id: 'peluche', mapa: 'plaza', nombre: 'Peluche de zombie',
    frase: '«Da miedo, pero abraza rico.»',
    bonus: (c, n) => 'Un zombie gira a tu lado y hace ' + numeroCol(c.DANO * n) + ' de daño al tocar' },
  { id: 'mantita', mapa: 'plaza', nombre: 'Mantita cuadrillé',
    frase: '«Huele a picnic de domingo.»',
    bonus: (c, n) => 'Zona segura: 1 de vida cada ' + numeroCol(c.SEGURA_CURA_CADA_MS / n / 1000) +
      ' s · la pileta cura ' + porcentajeCol(c.PILETA_RAPIDEZ * n) + ' más rápido' },
  { id: 'capa', mapa: 'plaza', nombre: 'Capa de superhéroe',
    frase: '«No vuela, pero se siente como si sí.»',
    bonus: (c, n) => '+' + porcentajeCol(c.VELOCIDAD * n) + ' velocidad · el poder se recarga ' +
      porcentajeCol(c.RECARGA * n) + ' más rápido' },
  { id: 'antifaz', mapa: 'plaza', nombre: 'Antifaz',
    frase: '«Nadie sabrá que eres un perrito... excepto todos.»',
    bonus: (c, n) => porcentajeCol(c.ESQUIVAR * n) + ' de probabilidad de esquivar un golpe' },
  { id: 'antipulgas', mapa: 'plaza', nombre: 'Collar antipulgas',
    frase: '«Adiós, comezón. Hola, dignidad.»',
    bonus: (c, n) => '−' + porcentajeCol(c.MENOS_DANO * n) + ' daño de la manada y de los perros rivales' },
  { id: 'lentes', mapa: 'plaza', nombre: 'Lentes',
    frase: '«Ahora ve los huesos desde lejos. Y se ve intelectual.»',
    bonus: (c, n) => '+' + Math.round(c.ALCANCE * n) + ' alcance de mordida · +' + Math.round(c.IMAN * n) + ' imán de huesos' },
  { id: 'zapatilla', mapa: 'plaza', nombre: 'Zapatilla perdida',
    frase: '«Nadie la reclamó. Ahora es tuya. Huele a gloria.»',
    bonus: (c, n) => 'La comida cura +' + Math.round(c.COMIDA_CURA * n) + ' de vida' },
  { id: 'panuelo', mapa: 'plaza', nombre: 'Pañuelo rojo',
    frase: '«Estilo vaquero, mordida de forajido.»',
    bonus: (c, n) => porcentajeCol(c.CRITICO * n) + ' de mordida crítica (hace el doble de daño)' },
  { id: 'cascabel', mapa: 'plaza', nombre: 'Cascabel',
    frase: '«Tilín, tilín: cada paso es una fiesta.»',
    bonus: (c, n) => '+' + porcentajeCol(c.XP_EXTRA * n) + ' experiencia por hueso' },
  { id: 'gorro', mapa: 'plaza', nombre: 'Gorro de lana',
    frase: '«Orejas calentitas, patas valientes.»',
    bonus: (c, n) => 'El barro te frena ' + porcentajeCol(Math.min(1, c.MENOS_LENTITUD * n)) +
      ' menos y la Perrera te atrapa menos rato' }
];

// ---------------------------------------------------------------
//  DIBUJOS (16 x 16, mismo formato que src/sprites.js)
//  "." es transparente. K = borde negro, W = blanco (de COLORES_COMUNES).
// ---------------------------------------------------------------
const SPRITES_COLECCIONABLES = {
  // Chalequito reflectante: naranjo con franjas plateadas
  chalequito: {
    colores: { O: 0xff7a1a, o: 0xc85a10, S: 0xe8f4f4 },
    cuadros: [[
      '................',
      '...KKK....KKK...',
      '...KOK....KOK...',
      '...KOK....KOK...',
      '..KOOOKKKKOOOK..',
      '.KOOOOOKKOOOOOK.',
      '.KOOOOOKKOOOOOK.',
      '.KSSSSSKKSSSSSK.',
      '.KOOOOOKKOOOOOK.',
      '.KOOOOOKKOOOOOK.',
      '.KSSSSSKKSSSSSK.',
      '.KOOOOOKKOOOOOK.',
      '.KoooooKKoooooK.',
      '.KKKKKKKKKKKKKK.',
      '................',
      '................'
    ]]
  },

  // Sweater tejido a mano: rojo con dibujitos crema
  sweater: {
    colores: { R: 0xd84343, r: 0x9e2a2a, Y: 0xf3e5c0 },
    cuadros: [[
      '................',
      '.....KKKKKK.....',
      '..KKKRYYYYRKKK..',
      '.KRRRRRRRRRRRRK.',
      'KRRRRYRRRRYRRRRK',
      'KRRRYRYRRYRYRRRK',
      'KRRKRRRRRRRRKRRK',
      'KRRKRRRRRRRRKRRK',
      'KRRKRYRRRRYRKRRK',
      'KRRKRRYRRYRRKRRK',
      'KRRKRRRRRRRRKRRK',
      'KYYKRRRRRRRRKYYK',
      'KKKKYYYYYYYYKKKK',
      '...KrrrrrrrrK...',
      '...KKKKKKKKKK...',
      '................'
    ]]
  },

  // Peluche de zombie: osito verde con ojos de cruz y polera azul
  peluche: {
    colores: { G: 0x8bc34a, g: 0x558b2f, B: 0x5c6bc0 },
    cuadros: [[
      '................',
      '..KKK......KKK..',
      '..KGGK....KGGK..',
      '..KGKKKKKKKKGK..',
      '...KGGGGGGGGK...',
      '..KGWKGGGGKWGK..',
      '..KGKWGGGGWKGK..',
      '..KGGGGGGGGGGK..',
      '..KGGKgKgKgGGK..',
      '...KKGGGGGGKK...',
      '..KBBKKKKKKBBK..',
      '.KGKBBBBBBBBKGK.',
      '.KGKBBBgBBBBKGK.',
      '..KKBBBBBBBBKK..',
      '...KGGK..KGGK...',
      '...KKKK..KKKK...'
    ]]
  },

  // Mantita cuadrillé: manta de picnic roja y blanca, doblada
  mantita: {
    colores: { R: 0xe53935, r: 0x9e2a2a, P: 0xf48fb1 },
    cuadros: [[
      '................',
      '................',
      '.KKKKKKKKKKKKKK.',
      '.KRRPPRRPPRRPPK.',
      '.KRRPPRRPPRRPPK.',
      '.KPPWWPPWWPPWWK.',
      '.KPPWWPPWWPPWWK.',
      '.KRRPPRRPPRRPPK.',
      '.KRRPPRRPPRRPPK.',
      '.KPPWWPPWWPPWWK.',
      '.KPPWWPPWWPPWWK.',
      '.KrrrrrrrrrrrrK.',
      '.KKKKKKKKKKKKKK.',
      '..K..K..K..K....',
      '................',
      '................'
    ]]
  },

  // Capa de superhéroe: roja con broche dorado y una estrellita
  capa: {
    colores: { R: 0xe53935, r: 0xa31f1f, Y: 0xffd54f },
    cuadros: [[
      '................',
      '.....KKKKKK.....',
      '....KYKKKKYK....',
      '...KRRRRRRRRK...',
      '...KRRRRRRRRK...',
      '..KRRRRYYRRRRK..',
      '..KRRRRRRRRRRK..',
      '..KRRRrRRrRRRK..',
      '.KRRRRrRRrRRRRK.',
      '.KRRRRrRRrRRRRK.',
      '.KRRRrRRRRrRRRK.',
      'KRRRRrRRRRrRRRRK',
      'KRRRrRRRRRRrRRRK',
      'KrRrRRrRRrRRrRrK',
      '.KK.KKK.KKK.KKK.',
      '................'
    ]]
  },

  // Antifaz: antifaz azul oscuro con dos agujeros
  antifaz: {
    colores: { N: 0x37474f, n: 0x263238 },
    cuadros: [[
      '................',
      '................',
      '................',
      '................',
      '.KKKK......KKKK.',
      'KNNNNKKKKKKNNNNK',
      'KNNNNNNNNNNNNNNK',
      'KNKKKKNNNNKKKKNK',
      'KNKWWKNNNNKWWKNK',
      'KNKKKKNNNNKKKKNK',
      'KnNNNNNKKNNNNNnK',
      '.KnnnnK..KnnnnK.',
      '..KKKK....KKKK..',
      '................',
      '................',
      '................'
    ]]
  },

  // Collar antipulgas: collar verde agua con plaquita y una cruz
  antipulgas: {
    colores: { A: 0x26a69a, a: 0x00796b, S: 0xd0d8e0 },
    cuadros: [[
      '................',
      '.....KKKKKK.....',
      '...KKAAAAAAKK...',
      '..KAAaaaaaaAAK..',
      '.KAaKKKKKKKKaAK.',
      '.KAK........KAK.',
      'KAaK........KaAK',
      'KAaK........KaAK',
      'KAaK........KaAK',
      '.KAK........KAK.',
      '.KAaKKKKKKKKaAK.',
      '..KAAaaaaaaAAK..',
      '...KKAAKKAAKK...',
      '.....KSSWSSK....',
      '.....KSWWWSK....',
      '.....KKKKKKK....'
    ]]
  },

  // Lentes: dos cristales celestes con brillo
  lentes: {
    colores: { L: 0xb3e5fc },
    cuadros: [[
      '................',
      '................',
      '................',
      '................',
      '................',
      '.KKKKK....KKKKK.',
      'KKLLLKK..KKLLLKK',
      'KLWLLLKKKKLWLLLK',
      'KLLWLLK..KLLWLLK',
      'KLLLLLK..KLLLLLK',
      'KKLLLKK..KKLLLKK',
      '.KKKKK....KKKKK.',
      '................',
      '................',
      '................',
      '................'
    ]]
  },

  // Zapatilla perdida: zapatilla azul con cordones y franja roja
  zapatilla: {
    colores: { B: 0x42a5f5, R: 0xe53935 },
    cuadros: [[
      '................',
      '................',
      '................',
      '................',
      '.....KKKK.......',
      '....KBBBBK......',
      '....KBWBWBK.....',
      '...KBBWBWBBK....',
      '..KBBBBBBBBBKK..',
      '.KBBRRRBBBBBBBK.',
      'KBBBBBRRRBBBBBBK',
      'KWWWWWWWWWWWWWWK',
      '.KKKKKKKKKKKKKK.',
      '................',
      '................',
      '................'
    ]]
  },

  // Pañuelo rojo: pañuelo de vaquero con puntitos blancos
  panuelo: {
    colores: { R: 0xe53935, r: 0x9e2a2a },
    cuadros: [[
      '................',
      '................',
      '................',
      'KKKKKKKKKKKKKKKK',
      'KRRRRWRRRRRWRRRK',
      '.KRRRRRRWRRRRRK.',
      '..KRWRRRRRRWRK..',
      '...KRRRRWRRRK...',
      '....KRRRRRRK....',
      '.....KRWRRK.....',
      '......KrrK......',
      '.......KK.......',
      '................',
      '................',
      '................',
      '................'
    ]]
  },

  // Cascabel: campanita dorada con cinta roja
  cascabel: {
    colores: { Y: 0xffc107, y: 0xc79100, R: 0xe53935 },
    cuadros: [[
      '................',
      '.......KK.......',
      '......KRRK......',
      '.....KKKKKK.....',
      '....KYYYYYYK....',
      '...KYWWYYYYyK...',
      '..KYWYYYYYYYyK..',
      '..KYYYYYYYYYyK..',
      '..KYYYYYYYYyyK..',
      '..KKKKKKKKKKKK..',
      '..KyYYYKKYYYyK..',
      '...KyyyKKyyyK...',
      '....KKKKKKKK....',
      '................',
      '................',
      '................'
    ]]
  },

  // Gorro de lana: verde con pompón blanco y una franja amarilla
  gorro: {
    colores: { G: 0x66bb6a, g: 0x388e3c, Y: 0xffd54f },
    cuadros: [[
      '................',
      '......KKKK......',
      '.....KWWWWK.....',
      '.....KWWWWK.....',
      '.....KKKKKK.....',
      '....KGGGGGGK....',
      '...KGGGGGGGGK...',
      '..KGGGGGGGGGGK..',
      '..KYYYYYYYYYYK..',
      '..KGGGGGGGGGGK..',
      '.KKKKKKKKKKKKKK.',
      '.KgGgGgGgGgGgGK.',
      '.KgGgGgGgGgGgGK.',
      '.KKKKKKKKKKKKKK.',
      '................',
      '................'
    ]]
  }
};

// ===============================================================
//  De aquí para abajo está el código. No hace falta tocarlo para
//  cambiar nombres, frases, dibujos o números.
// ===============================================================

// ---------------- Textos ----------------

function numeroCol(n) {
  return String(Math.round(n * 10) / 10).replace('.', ',');
}
function porcentajeCol(x) {
  return Math.round(x * 100) + '%';
}
function buscarColeccionable(id) {
  return COLECCIONABLES.find((c) => c.id === id) || { id, mapa: 'plaza', nombre: id, frase: '', bonus: () => '' };
}
// Solo los que tienen textos (aquí) y números (config.js)
function listaColeccionables(mapa) {
  return COLECCIONABLES.filter((c) => CONFIG.COLECCIONABLES[c.id] && (!mapa || c.mapa === mapa));
}
function claveColeccionable(id) {
  return 'col_' + id;
}
// Texto del bonus en un nivel (si el nivel es 0, muestra el del nivel 1)
function textoBonusColeccionable(id, nivel) {
  const datos = buscarColeccionable(id);
  const cfg = CONFIG.COLECCIONABLES[id] || {};
  return datos.bonus(cfg, Math.max(1, nivel));
}

// Color del arcoíris que va cambiando con el tiempo (formato 0xRRGGBB)
function colorArcoiris(ms, fase) {
  const h = ((ms / 1400) + (fase || 0)) % 1;
  return Phaser.Display.Color.HSVToRGB(h, 0.55, 1).color;
}
function colorTextoCol(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

// Crea las imágenes de los coleccionables (solo la primera vez)
function crearTexturasColeccionables(escena) {
  Object.keys(SPRITES_COLECCIONABLES).forEach((id) => {
    const clave = claveColeccionable(id);
    if (!escena.textures.exists(clave)) crearTexturaPixel(escena, clave, SPRITES_COLECCIONABLES[id]);
  });
  texturaBrillo(escena); // el brillo redondo de src/objetos.js
}

// ---------------- Guardado en el navegador (localStorage) ----------------
// Se guarda solo cuántas copias tienes de cada uno: { version: 1, copias: { sweater: 3, ... } }
// El nivel se calcula con COLECCION_COPIAS, así si cambias esos números
// tus niveles se recalculan solos.

let COLECCION_EN_MEMORIA = null;

function datosColeccion() {
  if (COLECCION_EN_MEMORIA) return COLECCION_EN_MEMORIA;
  let datos = null;
  try {
    const texto = window.localStorage.getItem(CONFIG.COLECCION_GUARDADO);
    if (texto) datos = JSON.parse(texto);
  } catch (e) {
    datos = null; // el navegador no deja guardar o el guardado está roto: se empieza de cero
  }
  if (!datos || typeof datos !== 'object' || !datos.copias || typeof datos.copias !== 'object') {
    datos = { version: 1, copias: {} };
  }
  COLECCION_EN_MEMORIA = datos;
  return datos;
}

function guardarColeccion() {
  try {
    window.localStorage.setItem(CONFIG.COLECCION_GUARDADO, JSON.stringify(datosColeccion()));
    return true;
  } catch (e) {
    console.warn('No se pudo guardar la colección en el navegador:', e);
    return false;
  }
}

function borrarColeccion() {
  COLECCION_EN_MEMORIA = { version: 1, copias: {} };
  try {
    window.localStorage.removeItem(CONFIG.COLECCION_GUARDADO);
  } catch (e) {
    console.warn('No se pudo borrar la colección del navegador:', e);
  }
}

function copiasColeccionable(id) {
  const n = Number(datosColeccion().copias[id]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function nivelMaximoColeccion() {
  return CONFIG.COLECCION_COPIAS.length;
}

// Con cierta cantidad de copias: en qué nivel está y cuánto falta para el siguiente
//  progreso: copias juntadas para el siguiente nivel   necesita: copias que pide ese nivel
function infoPorCopias(copias) {
  const pasos = CONFIG.COLECCION_COPIAS;
  let nivel = 0;
  let usadas = 0;
  while (nivel < pasos.length && copias >= usadas + pasos[nivel]) {
    usadas += pasos[nivel];
    nivel++;
  }
  const max = nivel >= pasos.length;
  return { copias, nivel, max, progreso: max ? 0 : copias - usadas, necesita: max ? 0 : pasos[nivel] };
}

function infoColeccionable(id) {
  return infoPorCopias(copiasColeccionable(id));
}

function nivelColeccionable(id) {
  return infoColeccionable(id).nivel;
}

// Bonus de un coleccionable: su número de config.js por su nivel (0 si no lo tienes)
function bonusColeccion(id, clave) {
  const cfg = CONFIG.COLECCIONABLES[id];
  if (!cfg || typeof cfg[clave] !== 'number') return 0;
  return nivelColeccionable(id) * cfg[clave];
}

function cuantosEncontrados(mapa) {
  return listaColeccionables(mapa).filter((c) => copiasColeccionable(c.id) > 0).length;
}

// ---------------- En la partida ----------------

// Se llama al empezar la partida (después de crear al perro)
function iniciarColeccionables(escena) {
  crearTexturasColeccionables(escena);
  escena.mapaId = escena.mapaId || 'plaza';
  escena.ultrasSuelo = [];      // ultra raros tirados en el suelo
  escena.ultrasPartida = [];    // los que recogiste en esta partida (para el Game Over)
  escena.esperaSweater = 0;
  escena.esperaMantita = 0;
  escena.peluche = null;
  crearPeluche(escena);
}

// Peluche de zombie: compañero que gira alrededor del perro
function crearPeluche(escena) {
  if (escena.peluche || nivelColeccionable('peluche') <= 0) return;
  escena.peluche = escena.add.image(escena.perro.x, escena.perro.y, claveColeccionable('peluche'), 0)
    .setScale(2).setDepth(9);
}

// Se llama en cada cuadro
function actualizarColeccionables(escena, delta) {
  const ahora = escena.tiempoSobrevivido;
  const perro = escena.perro;

  // Ultra raros en el suelo: brillo arcoíris, chispitas y recogerlos al pasar
  const alcance = escena.base.RADIO + CONFIG.ULTRA_RECOGER;
  escena.ultrasSuelo = escena.ultrasSuelo.filter((u) => {
    if (!u.active) return false;
    if (Phaser.Math.Distance.Between(perro.x, perro.y, u.x, u.y) <= alcance) {
      const id = u.coleccionableId;
      u.destroy();
      recogerUltra(escena, id);
      return false;
    }
    const color = colorArcoiris(ahora, u.fase);
    u.brillo.setTint(color);
    u.borde.setTint(color);
    if (ahora >= u.proximaChispa) {
      u.proximaChispa = ahora + Phaser.Math.Between(120, 300);
      const chispa = escena.add.image(u.x + Phaser.Math.Between(-24, 24), u.y + Phaser.Math.Between(-26, 16), 'chispa', 0)
        .setScale(2).setTint(colorArcoiris(ahora, u.fase + 0.5)).setDepth(806);
      escena.tweens.add({ targets: chispa, alpha: 0, scale: 0.5, y: chispa.y - 10, duration: 600, onComplete: () => chispa.destroy() });
    }
    return true;
  });

  // Sweater tejido a mano: recupera 1 de vida cada cierto tiempo
  const sweater = nivelColeccionable('sweater');
  if (sweater > 0) {
    escena.esperaSweater += delta;
    if (escena.esperaSweater >= CONFIG.COLECCIONABLES.sweater.CURA_CADA_MS / sweater / escena.multiplicadorRegeneracion()) {
      escena.esperaSweater = 0;
      escena.vida = Math.min(escena.vidaMax, escena.vida + 1);
    }
  }

  // Mantita cuadrillé: la Zona segura cura
  const mantita = nivelColeccionable('mantita');
  if (mantita > 0 && escena.efectoZona && escena.efectoZona.segura && escena.vida < escena.vidaMax) {
    escena.esperaMantita += delta;
    if (escena.esperaMantita >= CONFIG.COLECCIONABLES.mantita.SEGURA_CURA_CADA_MS / mantita) {
      escena.esperaMantita = 0;
      escena.curar(1, '#a5d6a7');
    }
  } else {
    escena.esperaMantita = 0;
  }

  moverPeluche(escena);
}

function moverPeluche(escena) {
  const p = escena.peluche;
  if (!p) return;
  const c = CONFIG.COLECCIONABLES.peluche;
  const ahora = escena.tiempoSobrevivido;
  const angulo = (ahora / c.VUELTA_MS) * Math.PI * 2;
  p.setPosition(escena.perro.x + Math.cos(angulo) * c.ORBITA_RADIO, escena.perro.y + Math.sin(angulo) * c.ORBITA_RADIO);
  p.setFlipX(Math.sin(angulo) > 0); // mira hacia donde va
  p.setAngle(Math.sin(ahora / 120) * 8); // se bambolea

  // No ataca en la Zona de miedo, en el desafío "Sin morder" ni al amanecer
  const puede = escena.puedeAtacar() && !escena.amaneciendo;
  p.setAlpha(puede ? 1 : 0.45);
  if (!puede) return;

  const dano = c.DANO * nivelColeccionable('peluche');
  escena.enemigos.getChildren().slice().forEach((e) => {
    if (!e.active || e.espantado || ahora < (e.pelucheHasta || 0)) return;
    if (Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y) > c.RADIO + e.radio) return;
    e.pelucheHasta = ahora + c.GOLPE_CADA_MS;
    escena.danarEnemigo(e, dano);
  });
}

// Elige un coleccionable al azar del mapa
function sortearColeccionable(mapa) {
  const lista = listaColeccionables(mapa);
  return lista.length > 0 ? Phaser.Math.RND.pick(lista) : null;
}

// Un enemigo murió: a veces suelta un ultra raro (élites y jefe, más seguido)
function sorteoUltraAlDerrotar(escena, enemigo) {
  let p = CONFIG.ULTRA_PROBABILIDAD_ENEMIGO;
  if (enemigo.esJefe) p = CONFIG.ULTRA_PROBABILIDAD_JEFE;
  else if (enemigo.elite) p = CONFIG.ULTRA_PROBABILIDAD_ELITE;
  if (Math.random() < p) soltarUltra(escena, enemigo.x, enemigo.y);
}

// Deja un ultra raro en el suelo con brillo arcoíris.
// Si id es null, se elige uno al azar del mapa.
function soltarUltra(escena, x, y, id) {
  const datos = id ? buscarColeccionable(id) : sortearColeccionable(escena.mapaId);
  if (!datos) return null;
  if (!escena.plaza.libre(x, y, 8)) {
    const lugar = escena.plaza.buscarLibre(x, y, 12);
    x = lugar.x;
    y = lugar.y;
  }
  const clave = claveColeccionable(datos.id);
  const brillo = escena.add.image(0, 0, 'brillo_objeto').setScale(ESCALA_PIXEL * 1.4);
  const borde = escena.add.image(0, 0, texturaBorde(escena, clave), 0).setScale(2);
  const icono = escena.add.image(0, 0, clave, 0).setScale(2);
  const cosa = escena.add.container(x, y, [brillo, borde, icono]).setDepth(805);
  cosa.coleccionableId = datos.id;
  cosa.brillo = brillo;
  cosa.borde = borde;
  cosa.fase = Math.random();
  cosa.proximaChispa = 0;
  cosa.once('destroy', () => escena.tweens.killTweensOf([brillo, borde, icono]));
  escena.tweens.add({ targets: [borde, icono], y: -5, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  escena.tweens.add({ targets: brillo, alpha: 0.45, scale: ESCALA_PIXEL * 1.8, duration: 380, yoyo: true, repeat: -1 });
  escena.ultrasSuelo.push(cosa);
  escena.mostrarAviso('✦ ¡Cayó un ULTRA RARO! ✦', RAREZA_ULTRA.colorTexto);
  return cosa;
}

// Recoger un ultra raro: suma una copia, guarda y avisa en grande.
// El bonus se aplica al tiro. Devuelve el nombre.
function recogerUltra(escena, id) {
  const datos = buscarColeccionable(id);
  const antes = infoColeccionable(id);
  datosColeccion().copias[id] = antes.copias + 1;
  guardarColeccion();
  const despues = infoColeccionable(id);
  const subio = despues.nivel > antes.nivel;

  // Sweater: la vida máxima extra se nota al tiro (y te cura lo mismo)
  if (id === 'sweater' && subio) {
    const extra = (despues.nivel - antes.nivel) * CONFIG.COLECCIONABLES.sweater.VIDA;
    escena.vidaMax += extra;
    escena.vida = Math.min(escena.vidaMax, escena.vida + extra);
  }
  if (id === 'peluche') crearPeluche(escena);
  escena.ultrasPartida.push(id);

  let estado;
  if (antes.copias === 0) estado = '¡Nuevo!';
  else if (antes.max) estado = 'Copia extra (ya está en nivel máximo)';
  else estado = 'Copia ' + (antes.progreso + 1) + '/' + antes.necesita;

  let nivel = 'Nivel ' + despues.nivel + (despues.max ? ' (MAX)' : '') + ': ' + textoBonusColeccionable(id, despues.nivel);
  if (subio && antes.copias > 0) nivel = '¡Sube a nivel ' + despues.nivel + '! ' + textoBonusColeccionable(id, despues.nivel);

  mostrarAvisoUltra(escena, datos, estado, nivel);
  return datos.nombre;
}

// Aviso grande especial con brillo arcoíris al recoger un ultra raro
function mostrarAvisoUltra(escena, datos, estado, nivel) {
  if (escena.capaAvisoUltra) escena.capaAvisoUltra.forEach((o) => { escena.tweens.killTweensOf(o); o.destroy(); });
  const w = escena.scale.width;
  const cx = w / 2;
  const arriba = escena.scale.height / 2 - 40;
  const ancho = 560;
  const alto = 214;

  const marco = escena.add.graphics();
  const brillo = escena.add.image(cx, arriba + 64, 'brillo_objeto').setScale(ESCALA_PIXEL * 2.6);
  const icono = escena.add.image(cx, arriba + 64, claveColeccionable(datos.id), 0).setScale(4);
  const estilo = (tam, color, extra) => ({
    fontFamily: FUENTE, fontSize: tam + 'px', color, stroke: '#000000', strokeThickness: 4, align: 'center',
    wordWrap: { width: ancho - 30 }, ...extra
  });
  const etiqueta = escena.add.text(cx, arriba + 16, '✦ ULTRA RARO ✦', estilo(16, '#ffffff', { fontStyle: 'bold' })).setOrigin(0.5);
  const nombre = escena.add.text(cx, arriba + 118, datos.nombre, estilo(30, '#ffffff', { fontStyle: 'bold' })).setOrigin(0.5);
  const textoEstado = escena.add.text(cx, arriba + 150, estado, estilo(20, '#ffe082', { fontStyle: 'bold' })).setOrigin(0.5);
  const textoNivel = escena.add.text(cx, arriba + 175, nivel, estilo(14, '#c5e1a5')).setOrigin(0.5);
  const frase = escena.add.text(cx, arriba + 198, datos.frase, estilo(13, '#e0e0e0', { fontStyle: 'italic', strokeThickness: 3 })).setOrigin(0.5);

  const capa = [marco, brillo, icono, etiqueta, nombre, textoEstado, textoNivel, frase];
  capa.forEach((o) => o.setScrollFactor(0).setDepth(1700));
  escena.capaAvisoUltra = capa;

  // Todo cambia de color como un arcoíris
  const pintar = (t) => {
    const color = colorArcoiris(t, 0);
    marco.clear();
    marco.fillStyle(0x000000, 0.7);
    marco.fillRect(cx - ancho / 2, arriba, ancho, alto + 4);
    marco.lineStyle(4, color, 1);
    marco.strokeRect(cx - ancho / 2, arriba, ancho, alto + 4);
    brillo.setTint(color);
    nombre.setColor(colorTextoCol(colorArcoiris(t, 0.5)));
    etiqueta.setColor(colorTextoCol(colorArcoiris(t, 0.25)));
  };
  pintar(0);
  const contador = escena.tweens.addCounter({
    from: 0, to: 1400, duration: 1400, repeat: -1,
    onUpdate: (tw) => { if (marco.active) pintar(tw.getValue()); }
  });
  marco.once('destroy', () => contador.remove());

  icono.setScale(1);
  escena.tweens.add({ targets: icono, scale: 4, duration: 400, ease: 'Back.easeOut' });
  escena.tweens.add({ targets: brillo, alpha: 0.5, duration: 300, yoyo: true, repeat: -1 });
  escena.tweens.add({
    targets: capa, alpha: 0, delay: 3200, duration: 700,
    onComplete: () => {
      capa.forEach((o) => o.destroy());
      if (escena.capaAvisoUltra === capa) escena.capaAvisoUltra = null;
    }
  });
  escena.cameras.main.flash(250, 255, 255, 255);
}

// Desafíos que siempre dan un ultra raro (CONFIG.ULTRA_DESAFIOS).
// Va directo a la colección. Devuelve el texto de la recompensa o ''.
function ultraPorDesafio(escena, desafioId) {
  if (!(CONFIG.ULTRA_DESAFIOS || []).includes(desafioId)) return '';
  const datos = sortearColeccionable(escena.mapaId);
  if (!datos) return '';
  recogerUltra(escena, datos.id);
  return datos.nombre + ' (ultra raro)';
}

// Modo de prueba (tecla C): un ultra raro al azar cerca del perro
function pruebaUltra(escena) {
  const angulo = Math.random() * Math.PI * 2;
  const x = Phaser.Math.Clamp(escena.perro.x + Math.cos(angulo) * 90, 20, CONFIG.MAPA_ANCHO - 20);
  const y = Phaser.Math.Clamp(escena.perro.y + Math.sin(angulo) * 90, 20, CONFIG.MAPA_ALTO - 20);
  soltarUltra(escena, x, y, null);
}

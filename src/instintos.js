// Lista de instintos (mejoras) que aparecen como cartas al subir de nivel.
// Los números de cada instinto están en src/config.js
const INSTINTOS = [
  { id: 'mordidaRapida', nombre: 'Mordida rápida', frase: 'Muerdes más seguido.' },
  { id: 'colmillos',     nombre: 'Colmillos',      frase: 'Cada mordida hace más daño.' },
  { id: 'patasLigeras',  nombre: 'Patas ligeras',  frase: 'Corres más rápido.' },
  { id: 'pellejoDuro',   nombre: 'Pellejo duro',   frase: 'Más vida máxima y te curas un poco.' },
  { id: 'olfato',        nombre: 'Olfato',         frase: 'Atraes los huesos desde más lejos.' },
  { id: 'ladrido',       nombre: 'Ladrido',        frase: 'Un ladrido que daña y empuja a los enemigos cercanos.', ataque: true },
  // Ataques secundarios nuevos (sus números están en src/config.js, sección ATAQUES)
  { id: 'rasguno',       nombre: 'Rasguño',        frase: 'Zarpazo en abanico al enemigo más cercano.', ataque: true },
  { id: 'escarbar',      nombre: 'Escarbar',       frase: 'Lanzas terrones que dañan y frenan enemigos.', ataque: true },
  // v0.24: ataques nuevos (código en src/ataques_nuevos.js, números en config.js > ATAQUES)
  { id: 'patada',        nombre: 'Patada trasera', frase: 'Pateas hacia atrás y empujas a los que te persiguen.', ataque: true },
  { id: 'caca',          nombre: 'Tirar caca',     frase: 'Lanzas caca en arco: la mancha daña y frena.', ataque: true },
  { id: 'meada',         nombre: 'Meada',          frase: 'Dejas charcos al caminar que dañan al pisarlos.', ataque: true },
  { id: 'ladridoFuerte', nombre: 'Ladrido fuerte', frase: 'Onda en círculo que daña y aturde. No empuja.', ataque: true },
  { id: 'hedor',         nombre: 'Hedor',          frase: 'Aura de olor siempre activa que daña a los de cerca.', ataque: true },
  // v0.24: mejoras de stats (números en config.js > MEJORAS)
  { id: 'enfriamiento',  nombre: 'Lomo ágil',      frase: 'Tus ataques se recargan más rápido (no la mordida).' },
  { id: 'regeneracion',  nombre: 'Lengüetazo',     frase: 'Te curas poquito a poco, todo el rato.' },
  { id: 'armadura',      nombre: 'Pelaje grueso',  frase: 'Recibes menos daño de todo.' },
  { id: 'suerte',        nombre: 'Pata de conejo', frase: 'Los objetos salen de mejor rareza.' }
];

// true si el instinto es un ataque (ocupa un espacio de ataque: CONFIG.ATAQUES.ESPACIOS_MAX)
function esInstintoAtaque(id) {
  const inst = INSTINTOS.find((i) => i.id === id);
  return !!(inst && inst.ataque);
}

// ---------------------------------------------------------------
//  ÍCONOS DE LOS INSTINTOS (se ven en el menú de pausa)
//  Cuadrícula de 12 x 12, mismo formato que src/sprites.js:
//  cada letra es un color, "." es transparente.
//  K = borde negro, W = blanco y R = rojo sirven para todos.
// ---------------------------------------------------------------
const SPRITES_INSTINTOS = {
  // Mordida rápida: dientes con rayas de velocidad (Y)
  mordidaRapida: {
    colores: { Y: 0xf2d64b },
    cuadros: [[
      '............',
      '...KKKKKKKKK',
      'YY.KWWWWWWWK',
      '...KWKWKWKWK',
      '....K.K.K.K.',
      '............',
      'YYY.........',
      '....K.K.K.K.',
      '...KWKWKWKWK',
      'YY.KWWWWWWWK',
      '...KKKKKKKKK',
      '............'
    ]]
  },
  // Colmillos: un colmillo grande con una gotita roja
  colmillos: {
    colores: { s: 0xbdbdbd },
    cuadros: [[
      '............',
      '..KKKKKKKK..',
      '..KWWWWWsK..',
      '..KWWWWWsK..',
      '...KWWWsK...',
      '...KWWWsK...',
      '...KWWWsK...',
      '....KWsK....',
      '....KWsK....',
      '.....KK.....',
      '.....RR.....',
      '............'
    ]]
  },
  // Patas ligeras: huella con rayas de velocidad (Y)
  patasLigeras: {
    colores: { P: 0xffb74d, Y: 0xf2d64b },
    cuadros: [[
      '............',
      '.....PP.PP..',
      '.....PP.PP..',
      '...PP.....PP',
      'YY.PP.....PP',
      '......PPP...',
      'YYY..PPPPP..',
      '....PPPPPPP.',
      'YY..PPPPPPP.',
      '.....PPPPP..',
      '............',
      '............'
    ]]
  },
  // Pellejo duro: escudo de cuero (C = cuero, c = brillo)
  pellejoDuro: {
    colores: { C: 0x8b5a2b, c: 0xc8935a },
    cuadros: [[
      '............',
      '.KKKKKKKKKK.',
      '.KCCCCCCCCK.',
      '.KCcCCCCCCK.',
      '.KCcCCCCCCK.',
      '.KCCCCCCCCK.',
      '.KCCCCCCCCK.',
      '..KCCCCCCK..',
      '..KCCCCCCK..',
      '...KCCCCK...',
      '....KCCK....',
      '.....KK.....'
    ]]
  },
  // Olfato: nariz de perro olfateando (N = nariz, n = brillo, B = olor)
  olfato: {
    colores: { N: 0x8d6e63, n: 0xd7ccc8, B: 0x81d4fa },
    cuadros: [[
      '............',
      '............',
      'B...KKKKKK..',
      '.B.KNNNNNNK.',
      '..KNnNNNNNNK',
      'B.KNNNNNNNNK',
      '.BKNKKNNKKNK',
      '..KNKKNNKKNK',
      'B..KNNNNNNK.',
      '....KKKKKK..',
      '............',
      '............'
    ]]
  },
  // Ladrido: ondas de sonido
  ladrido: {
    colores: {},
    cuadros: [[
      '............',
      '......W.....',
      '...W...W....',
      '....W...W...',
      'W...W....W..',
      '.W...W...W..',
      '.W...W...W..',
      'W...W....W..',
      '....W...W...',
      '...W...W....',
      '......W.....',
      '............'
    ]]
  },
  // Rasguño: tres garras en diagonal (R = punta roja)
  rasguno: {
    colores: {},
    cuadros: [[
      '..........R.',
      '......R..W..',
      '..R..W..W...',
      '..W..W..W...',
      '.W..W..W....',
      '.W..W..W....',
      '.W..W..W....',
      'W..W..W.....',
      'W..W..W.....',
      'W..W........',
      '...W........',
      '............'
    ]]
  },
  // Escarbar: montón de tierra con terrones saltando (T = tierra, t = tierra oscura)
  escarbar: {
    colores: { T: 0x8d6e63, t: 0x5d4037 },
    cuadros: [[
      '..t......t..',
      '.tt..t...tt.',
      '.....tt.....',
      '..t.........',
      '............',
      '............',
      '.....TT.....',
      '...TTTTTT...',
      '..TTtTTTTT..',
      '.TTTTTTtTTT.',
      'TTtTTTTTTTtT',
      'KKKKKKKKKKKK'
    ]]
  },

  // ---- v0.24 ----
  // Patada trasera: pata trasera pateando con rayas de golpe (P = pata, p = almohadilla, Y = golpe)
  patada: {
    colores: { P: 0xc8935a, p: 0x8b5a2b, Y: 0xf2d64b },
    cuadros: [[
      '............',
      '.KKKK.......',
      '.KPPK.......',
      '.KPPK.......',
      '..KPPK......',
      '...KPPK...Y.',
      '....KPPKKK..',
      '.....KPPPPKY',
      '.....KpPpPK.',
      '......KKKK.Y',
      '..........Y.',
      '............'
    ]]
  },
  // Tirar caca: la clásica caca de tres pisos (C = café, c = oscuro)
  caca: {
    colores: { C: 0x795548, c: 0x4e342e },
    cuadros: [[
      '.....K......',
      '....KCK.....',
      '....KCK.....',
      '...KCWCK....',
      '...KCCcK....',
      '..KCWCCCK...',
      '..KCCCCcK...',
      '.KCWCCCCCK..',
      'KCCCCCCCccK.',
      'KcCCCCCCCcK.',
      '.KKKKKKKKK..',
      '............'
    ]]
  },
  // Meada: gota amarilla sobre un charco (Y = pichí, y = brillo)
  meada: {
    colores: { Y: 0xf2d64b, y: 0xfff59d },
    cuadros: [[
      '.....K......',
      '....KYK.....',
      '...KYyYK....',
      '...KYyYK....',
      '..KYYyYYK...',
      '..KYYYYYK...',
      '...KYYYK....',
      '....KKK.....',
      '............',
      '..KKKKKKKK..',
      '.KYYyYYYYYK.',
      '..KKKKKKKK..'
    ]]
  },
  // Ladrido fuerte: hocico con la boca abierta y ondas rojas (N = hocico)
  ladridoFuerte: {
    colores: { N: 0x8d6e63 },
    cuadros: [[
      '........R...',
      'KKKK.....R..',
      'KNNNK..R..R.',
      'KNNNNK..R.R.',
      'KNKKKK..R..R',
      'KNWWW...R..R',
      'KNKKKK..R..R',
      'KNNNNK..R.R.',
      'KNNNK..R..R.',
      'KKKK.....R..',
      '........R...',
      '............'
    ]]
  },
  // Hedor: nube verde con moscas (G = verde, g = verde oscuro)
  hedor: {
    colores: { G: 0x9ccc65, g: 0x558b2f },
    cuadros: [[
      '.K.......K..',
      '............',
      '....GGG.....',
      '..GGGGGGG...',
      '.GGgGGGGGG..',
      'GGGGGGgGGGG.',
      'GgGGGGGGGgG.',
      '.GGGgGGGGG..',
      '..GGGGGGG.K.',
      '....GGG.....',
      '.K..........',
      '............'
    ]]
  },
  // Lomo ágil: reloj de arena con rayas de velocidad (Y = arena, B = vidrio)
  enfriamiento: {
    colores: { Y: 0xf2d64b, B: 0x90caf9 },
    cuadros: [[
      '..KKKKKKKK..',
      '..KBBBBBBK..',
      '...KYYYYK...',
      'YY..KYYK....',
      '.....KK.....',
      'YYY..KK.....',
      '....KBBK....',
      'YY.KBBYBK...',
      '..KBYYYYBK..',
      '..KYYYYYYK..',
      '..KKKKKKKK..',
      '............'
    ]]
  },
  // Lengüetazo: lengua rosada con un corazón (L = lengua, l = línea)
  regeneracion: {
    colores: { L: 0xf48fb1, l: 0xc2185b },
    cuadros: [[
      '.RR.RR......',
      'RRRRRRR.....',
      'RRRRRRR.....',
      '.RRRRR......',
      '..RRR.......',
      '...R.KKKKK..',
      '....KLLLLLK.',
      '....KLLlLLK.',
      '....KLLlLLK.',
      '....KLLlLLK.',
      '.....KLLLK..',
      '......KKK...'
    ]]
  },
  // Pelaje grueso: escudo de pelo con mechones (F = pelo, f = sombra)
  armadura: {
    colores: { F: 0xbdbdbd, f: 0x757575 },
    cuadros: [[
      '............',
      '.KKKKKKKKKK.',
      '.KFfFfFfFFK.',
      '.KFFfFFfFFK.',
      '.KfFFFfFFfK.',
      '.KFFfFFFfFK.',
      '.KFfFFfFFFK.',
      '..KFFfFFfK..',
      '..KFfFFfFK..',
      '...KFFfFK...',
      '....KFFK....',
      '.....KK.....'
    ]]
  },
  // Pata de conejo: trébol de cuatro hojas (G = verde, g = oscuro)
  suerte: {
    colores: { G: 0x66bb6a, g: 0x2e7d32 },
    cuadros: [[
      '............',
      '..GGG..GGG..',
      '.GGGGGGGGGG.',
      '.GGgGGGGgGG.',
      '..GGGggGGG..',
      '....GggG....',
      '..GGGggGGG..',
      '.GGgGGGGgGG.',
      '.GGGGGGGGGG.',
      '..GGG.gGGG..',
      '......g.....',
      '.....g......'
    ]]
  }
};

// Crea las imágenes de los íconos (solo la primera vez).
// Se llaman "instinto_" + id para no chocar con otros dibujos.
function crearTexturasInstintos(escena) {
  Object.keys(SPRITES_INSTINTOS).forEach((id) => {
    const clave = 'instinto_' + id;
    if (!escena.textures.exists(clave)) crearTexturaPixel(escena, clave, SPRITES_INSTINTOS[id]);
  });
}

// Lista de instintos (mejoras) que aparecen como cartas al subir de nivel.
// Los números de cada instinto están en src/config.js
const INSTINTOS = [
  { id: 'mordidaRapida', nombre: 'Mordida rápida', frase: 'Muerdes más seguido.' },
  { id: 'colmillos',     nombre: 'Colmillos',      frase: 'Cada mordida hace más daño.' },
  { id: 'patasLigeras',  nombre: 'Patas ligeras',  frase: 'Corres más rápido.' },
  { id: 'pellejoDuro',   nombre: 'Pellejo duro',   frase: 'Más vida máxima y te curas un poco.' },
  { id: 'olfato',        nombre: 'Olfato',         frase: 'Atraes los huesos desde más lejos.' },
  { id: 'ladrido',       nombre: 'Ladrido',        frase: 'Un ladrido que daña y empuja a los enemigos cercanos.' },
  // Ataques secundarios nuevos (sus números están en src/config.js, sección ATAQUES)
  { id: 'rasguno',       nombre: 'Rasguño',        frase: 'Zarpazo en abanico al enemigo más cercano.' },
  { id: 'escarbar',      nombre: 'Escarbar',       frase: 'Lanzas terrones que dañan y frenan enemigos.' }
];

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

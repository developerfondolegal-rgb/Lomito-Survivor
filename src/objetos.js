// ===============================================================
//  OBJETOS, RAREZAS Y FUSIONES (nombres, frases y dibujos)
//  Los números (probabilidades, efectos, fusiones y élites) están
//  en src/config.js, en la sección "OBJETOS".
//
//  Para agregar un objeto nuevo:
//   1. Copia un bloque de OBJETOS (aquí abajo) y cambia "id" por un
//      nombre nuevo sin espacios ni tildes (por ejemplo: 'chaleco').
//   2. Copia su dibujo en SPRITES_OBJETOS con ese mismo id.
//   3. En src/config.js, dentro de OBJETOS, copia un bloque con ese id.
//   4. Lo que HACE el objeto se programa en src/scenes/GameScene.js
//      (busca "efectos de los objetos"). Sin eso, el objeto se puede
//      recoger y subir de nivel, pero no hace nada.
// ===============================================================

// Rarezas, de la más común a la más rara (el orden importa: "raro o mejor"
// significa raro, épico o legendario). Cuánto sube cada una y qué tan
// seguido sale están en src/config.js (RAREZAS).
//  color: color del brillo (formato 0xRRGGBB)
//  colorTexto: el mismo color para los textos (formato '#RRGGBB')
//  destella: true = el objeto parpadea y suelta chispitas en el suelo
const RAREZAS = [
  { id: 'comun',      nombre: 'Común',      color: 0xffffff, colorTexto: '#ffffff', destella: false },
  { id: 'raro',       nombre: 'Raro',       color: 0x42a5f5, colorTexto: '#64b5f6', destella: true },
  { id: 'epico',      nombre: 'Épico',      color: 0xab47bc, colorTexto: '#ce93d8', destella: true },
  { id: 'legendario', nombre: 'Legendario', color: 0xffc107, colorTexto: '#ffd54f', destella: true }
];

// Objetos pasivos (funcionan solos, sin apretar nada).
// El orden de esta lista es el orden en que salen en el Game Over.
const OBJETOS = [
  { id: 'collar',  nombre: 'Collar viejo',            frase: 'Recibes menos daño.' },
  { id: 'pelota',  nombre: 'Pelota mordida',          frase: 'Corres más rápido.' },
  { id: 'caracu',  nombre: 'Hueso de caracú',         frase: 'Recuperas vida de a poco.' },
  { id: 'placa',   nombre: 'Placa de identificación', frase: 'Cada hueso da más experiencia.' },
  { id: 'frazada', nombre: 'Frazada',                 frase: 'Más vida máxima.' }
];

// Fusiones: si el INSTINTO está en su nivel máximo (5) y el OBJETO también
// (3), al subir de nivel aparece una carta dorada que los fusiona.
//  instinto: id de src/instintos.js    objeto: id de OBJETOS (arriba)
// Los números de cada fusión están en src/config.js (FUSIONES).
const FUSIONES = [
  { id: 'frenesi',   nombre: 'Frenesí',        instinto: 'mordidaRapida', objeto: 'collar',
    frase: 'Mordida muy rápida que golpea a 2 enemigos a la vez.' },
  { id: 'aullido',   nombre: 'Aullido',        instinto: 'ladrido',       objeto: 'placa',
    frase: 'Ladrido más grande que además hace huir a los enemigos.' },
  { id: 'estampida', nombre: 'Estampida',      instinto: 'patasLigeras',  objeto: 'pelota',
    frase: 'Al moverte dejas un rastro de huellas que daña.' },
  { id: 'cuero',     nombre: 'Cuero de calle', instinto: 'pellejoDuro',   objeto: 'frazada',
    frase: 'Después de cada golpe, recibes la mitad de daño un rato.' }
];

// ---------------------------------------------------------------
//  DIBUJOS DE LOS OBJETOS (16 x 16, mismo formato que src/sprites.js)
//  "." es transparente. K = borde negro, W = blanco (de COLORES_COMUNES).
//  El brillo de color de la rareza se agrega solo alrededor.
// ---------------------------------------------------------------
const SPRITES_OBJETOS = {
  // Collar viejo: correa de cuero café con hebilla y una plaquita
  // C = cuero, c = cuero oscuro, S = hebilla, Y = plaquita
  collar: {
    colores: { C: 0x8b5a2b, c: 0x5e3a1a, S: 0xc0c0c0, Y: 0xf2d64b },
    cuadros: [
      [
        '................',
        '.....KKKKKK.....',
        '...KKCCCCCCKK...',
        '..KCCccccccCCK..',
        '.KCcKKKKKKKKcCK.',
        '.KCK........KCK.',
        'KCcK........KcCK',
        'KCcK........KcCK',
        'KCcK........KcCK',
        '.KCK........KCK.',
        '.KCcKKKKKKKKcCK.',
        '..KCCcSSSScCCK..',
        '...KKKSKKSKKK...',
        '.......KK.......',
        '......KYYK......',
        '.......KK.......'
      ]
    ]
  },

  // Pelota mordida: pelota de tenis con la costura blanca y marcas de dientes
  // G = verde amarillo, g = sombra
  pelota: {
    colores: { G: 0xc6e03a, g: 0x8fa82a },
    cuadros: [
      [
        '................',
        '.....KKKKKK.....',
        '...KKGGGGGGKK...',
        '..KGGGGGGGGGGK..',
        '.KGWWGGGGGGKGGK.',
        '.KGGGWWGGGGGGGK.',
        'KGGGGGGWGGGGGKGK',
        'KGGGGGGWGGGGGGGK',
        'KgGGGGGGWGGGGKGK',
        'KgGGGGGGWGGGGGGK',
        '.KgGGGGGGWWGKGK.',
        '.KggGGGGGGGWWGK.',
        '..KggGGGGGGGGK..',
        '...KKgGGGGGKK...',
        '.....KKKKKK.....',
        '................'
      ]
    ]
  },

  // Hueso de caracú: hueso cortado, con el tuétano (caracú) al centro
  // B = hueso, b = sombra, M = tuétano, m = brillo del tuétano
  caracu: {
    colores: { B: 0xf3e5c0, b: 0xc9b68a, M: 0xa0522d, m: 0xd2783c },
    cuadros: [
      [
        '................',
        '.....KKKKKK.....',
        '...KKBBBBBBKK...',
        '..KBBBBBBBBBBK..',
        '.KBBBBKKKKBBBBK.',
        '.KBBBKMMMMKBBBK.',
        'KBBBKMmmMMMKBBBK',
        'KBBBKMmMMMMKBBbK',
        'KBBBKMMMMMMKBBbK',
        'KBBBKMMMMMMKBbbK',
        '.KBBBKMMMMKBbbK.',
        '.KBBBBKKKKBbbbK.',
        '..KBBBBBBbbbbK..',
        '...KKBbbbbbKK...',
        '.....KKKKKK.....',
        '................'
      ]
    ]
  },

  // Placa de identificación: plaquita de metal con su argolla y algo escrito
  // S = metal, s = sombra, k = letras grabadas
  placa: {
    colores: { S: 0xd0d8e0, s: 0x8a96a3, k: 0x55606b },
    cuadros: [
      [
        '................',
        '.......KK.......',
        '......K..K......',
        '......K..K......',
        '.......KK.......',
        '.....KKKKKK.....',
        '....KSSSSSSK....',
        '...KSWSSSSSsK...',
        '...KSSkkkkSsK...',
        '...KSSSSSSSsK...',
        '...KSSkkkSSsK...',
        '...KSSSSSSssK...',
        '....KSSSSssK....',
        '.....KKKKKK.....',
        '................',
        '................'
      ]
    ]
  },

  // Frazada: frazada doblada, roja con rayas crema
  // A = rojo, a = doblez oscuro, Y = rayas
  frazada: {
    colores: { A: 0xc0392b, a: 0x8e2a20, Y: 0xf3e5c0 },
    cuadros: [
      [
        '................',
        '................',
        '..KKKKKKKKKKKK..',
        '.KAAYAAAAYAAAAK.',
        '.KAAYAAAAYAAAAK.',
        '.KYYYYYYYYYYYYK.',
        '.KAAYAAAAYAAAAK.',
        '.KaaaaaaaaaaaaK.',
        '.KKKKKKKKKKKKKK.',
        '.KAAYAAAAYAAAAK.',
        '.KAAYAAAAYAAAAK.',
        '.KYYYYYYYYYYYYK.',
        '.KAAYAAAAYAAAAK.',
        '.KaaaaaaaaaaaaK.',
        '..KKKKKKKKKKKK..',
        '................'
      ]
    ]
  },

  // Huella del rastro de la Estampida (dibujo chico)
  huella: {
    colores: { P: 0xffb74d },
    cuadros: [
      [
        '..P.P..',
        'P.....P',
        '..PPP..',
        '.PPPPP.',
        '.PPPPP.',
        '..PPP..'
      ]
    ]
  },

  // Chispita que sueltan los objetos raros o mejores (dibujo chico)
  chispa: {
    colores: {},
    cuadros: [
      [
        '..W..',
        '..W..',
        'WWWWW',
        '..W..',
        '..W..'
      ]
    ]
  }
};

// ===============================================================
//  De aquí para abajo está el código que prepara las imágenes.
//  No hace falta tocarlo para cambiar nombres, dibujos o números.
// ===============================================================

// Crea las imágenes de los objetos y el brillo (solo la primera vez)
function crearTexturasObjetos(escena) {
  Object.keys(SPRITES_OBJETOS).forEach((clave) => {
    if (!escena.textures.exists(clave)) crearTexturaPixel(escena, clave, SPRITES_OBJETOS[clave]);
  });
  texturaBrillo(escena);
}

// Brillo redondo pixelado (blanco: se pinta del color de la rareza)
function texturaBrillo(escena) {
  const clave = 'brillo_objeto';
  if (escena.textures.exists(clave)) return clave;
  const r = 12;
  const lado = r * 2 + 1;
  const textura = escena.textures.createCanvas(clave, lado, lado);
  const ctx = textura.getContext();
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const d = Math.sqrt((x - r) * (x - r) + (y - r) * (y - r)) / r;
      if (d > 1) continue;
      const alfa = Math.round((1 - d) * 4) / 4 * 0.6; // por escalones, estilo 8 bits
      if (alfa <= 0) continue;
      ctx.fillStyle = 'rgba(255,255,255,' + alfa + ')';
      ctx.fillRect(x, y, 1, 1);
    }
  }
  textura.refresh();
  return clave;
}

// Busca el texto de una rareza, objeto o fusión por su id
function buscarRareza(id) {
  return RAREZAS.find((r) => r.id === id) || RAREZAS[0];
}
function buscarObjeto(id) {
  return OBJETOS.find((o) => o.id === id) || { id, nombre: id, frase: '' };
}

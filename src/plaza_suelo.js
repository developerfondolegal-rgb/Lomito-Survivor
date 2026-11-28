// ===============================================================
//  LA PLAZA RENOVADA - FASE 1: EL SUELO
//  (archivo nuevo, script clásico; solo define constantes y funciones)
//
//  Qué trae:
//   - PZ_TILES: los cuadros de suelo de 16 x 16 en el MISMO formato que los
//     sprites del juego ({ colores, cuadros }, cada letra es un píxel).
//     Cada "cuadro" de un tile es una variante.
//   - PZ_SUELO: el diseño del suelo de la plaza nueva (caminos curvos,
//     claros, areneros, paseo, estacionamiento). Coordenadas en píxeles de
//     MUNDO pensadas para un mapa de 6000 x 6000 (CONFIG.MAPAS.plaza); si el
//     mapa cambia de tamaño se escalan solas (pzEscalaX / pzEscalaY).
//   - pintarSueloPlazaNueva(h, mapa, p): reemplaza a pintarSueloPlaza. Pinta
//     TODO el suelo en el mismo lienzo único de pintarSueloMapa (2000 x 2000
//     que se agranda x3). Usa getImageData/putImageData una sola vez.
//   - pzSobreSuelo(x, y, margen): ¿el punto cae sobre un camino, claro,
//     baldosa o asfalto? (lo usa el generador para no poner árboles encima)
//
//  No toca la Terminal ni la Feria: solo lo usa la entrada 'plaza' de MAPAS.
// ===============================================================

// Tiles de 16 x 16 (mismo formato que SPRITES: colores + cuadros; cada cuadro es una variante)
const PZ_TILES = {
  // 4 tonos, de oscuro a claro. El pintor elige el tono con un ruido grande (manchas) y tramado.
  pasto: {
    colores: { a: 0x18361d, b: 0x1f4323, c: 0x27502a, d: 0x2f5e30, e: 0x356433, f: 0x3a6d37, g: 0x41743c, h: 0x477e41, i: 0x55884a, j: 0x5c9450, l: 0x6b4a20, m: 0x8a5a24 },
    cuadros: [
    [
      'abbbbbabaaaaaaaa',
      'bbcbbbbbaaaaaaaa',
      'bbbbbbababaaaaaa',
      'bbbbbbbbbbaabaab',
      'bbbcbbbbabababab',
      'cbcbbbbbbbbbbbfb',
      'bfbbbbabbbbbbebe',
      'ebebbbbbbbcbcbbb',
      'bbbbfaabbbbbbbbb',
      'bbbebebabbcbbabb',
      'bbbbaaabbcbbbbaa',
      'bbbbbaabbbcbbbba',
      'bbbbaaabbbbbbbab',
      'bbbbbbbbbbbbbabb',
      'ababbbbbbbbbbbml',
      'bbbbbbbabbbabbba'
    ],
    [
      'ccbbbbbbbcbcbcbc',
      'cccccbcbcccccccc',
      'ccccccbbbcccbcbc',
      'cccccccccccccbcc',
      'lbbcccccccccbbbm',
      'bbcccccccccccbbb',
      'bbbbccccccccbbbb',
      'bccbcccccccbcbcb',
      'bbccbbbcccbcbbbh',
      'gccbcbbbbbcccbgb',
      'bghcbbbbbcbccbbg',
      'cgbgbbbbcccbcccb',
      'bbbbaaabbcccbbbc',
      'cbbbbabbbbcccbcb',
      'bbbbaaabbcccccbb',
      'cccbbbbbcccccccb'
    ],
    [
      'cccccccdcddibicc',
      'ccccccdcdddccccc',
      'ccbcccccddddccbc',
      'ccccccdcdddddccc',
      'cccccccccdddcccc',
      'ccdcccccdddddccd',
      'cdccccjccdddcccd',
      'ddddcibiccdcdcdd',
      'cddccccccccccccc',
      'dddccccccbcbcccc',
      'ddddcccbbbbbcccc',
      'dddddccbccccccdc',
      'ddddcccccccdcdcd',
      'djdddcccdcdddcdd',
      'ibidcdcccddddddd',
      'dcdcdcddddddjddc'
    ],
    [
      'ddcdddjhccccdddd',
      'ddjddigbgcddddfd',
      'dibidddccdcddddf',
      'dddddddcdcddddfd',
      'dfdmldcdcccddddf',
      'fffddcdcccdddddd',
      'dffdddcdcdcddddf',
      'fffddddcdddddddf',
      'dfddddcdddcddddf',
      'fddddddddddddddd',
      'ddddddddddcddddd',
      'fdddfddddddcdddd',
      'dddddfddddcdcccd',
      'ddddffffdcdcccdd',
      'dddddfdfddcccccd',
      'ddddffdddcccdcdc'
    ]
    ]
  },
  // Flores (2 variantes; "." = transparente, se ve el pasto de abajo). Van en manchas.
  pasto_flores: {
    colores: { a: 0x1f4323, b: 0xc79be0, c: 0xe8e4d8, d: 0xf08aa8, e: 0xf2d65a },
    cuadros: [
    [
      '................',
      '................',
      '................',
      '................',
      '....e...........',
      '....a.e.........',
      '......a.........',
      '.....e..........',
      '.....a..........',
      '................',
      '................',
      '............c...',
      '............ac..',
      '.............c..',
      '.............a..',
      '................'
    ],
    [
      '.......a..d...a.',
      '........d.ad....',
      '........a..d....',
      '...........a....',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '..........b..bb.',
      '.......d..a..aa.'
    ]
    ]
  },
  // Tierra / maicillo de los caminos (4 variantes, con piedritas).
  tierra: {
    colores: { a: 0x5e4630, b: 0x7a5f40, c: 0x94784f, d: 0xab9061, e: 0xc2a874, f: 0xd6c08c },
    cuadros: [
    [
      'abababbcbbbbbbbb',
      'bbbbbbcbcccccbbf',
      'abbbbbbcccccbbbb',
      'bfbbbbbbcccbcbbb',
      'abababbbbbbcbbbb',
      'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      'fccbbbbbbbbbbbbb',
      'babcbbbbbbbbabbb',
      'cccccbcbceebbbbb',
      'ccccccccbeeabbbb',
      'cbcccccbbbabbbbb',
      'bbbbfbbbbbbbabbb',
      'bbbbbabbbbbbbbbb',
      'bbabbbbbbbbbbbbb',
      'bbbfbbbbbbbbbbbb'
    ],
    [
      'bbbcbcbeebabbcbc',
      'cbccccceeabbbccc',
      'ccbcbcbbababbccc',
      'cfccccbbbbbbcccc',
      'cfacbcccbcbccccc',
      'ccaccbcccfcccbcc',
      'ccccbcbcccaccccc',
      'cccbcccccccccccc',
      'cccbbbbbbccccccc',
      'cccbbbbbcccccccb',
      'bcbfbbbbbbbcccbc',
      'cbcbabbbcbcbcccf',
      'abbbbbbcbbbbbcbb',
      'bbbbcbccbbbbbbcb',
      'bbbbccccbbabbcbb',
      'cbcbcccbbbbbbbcb'
    ],
    [
      'bbbcccccbbbcccbc',
      'bbbccccccbcccbcf',
      'acbcccccbbbbbbbc',
      'cbcbcccccbbbcccb',
      'bcccbcbbbbbbbcbc',
      'ccccbbbbbbbbcccc',
      'ccfcbbbbbbbccccc',
      'cccabbbbcccccccc',
      'bcbbbbbbcccccccc',
      'cbfbbbccccdcdccc',
      'cbbabccccfcdcdcc',
      'cbbbbbccddacdcdc',
      'cbbbbccccccaddcc',
      'cbcbcbccccccdccc',
      'bcbbbccccccccccc',
      'cbbbcccccccccccc'
    ],
    [
      'bccccdddcccaccfc',
      'cbccccddcccccdda',
      'cccccdcdcccccdcd',
      'ccccccdcdcdcdddc',
      'cccccccccdcddddc',
      'dcdcccccdddddddd',
      'ccccccbccdddddcd',
      'ccccccccddddfcdc',
      'ccbccccccdcdcacc',
      'cccbccccdcdcdccc',
      'cccccccccccccccc',
      'ccccccccdccccbcc',
      'bccccccfccccbcbf',
      'acdcdcdcaccbcbcc',
      'cccdcdccccbcbcbc',
      'ccccdddcccfbcccc'
    ]
    ]
  },
  // Maicillo claro del claro central (3 variantes).
  maicillo: {
    colores: { a: 0x8f7650, b: 0xa78b5e, c: 0xbca06c, d: 0xcfb37c, e: 0xdfc48e, f: 0xecd6a4 },
    cuadros: [
    [
      'abbcccccccbcbbbc',
      'cccccccccccbbbcc',
      'bcbbbcccccbbbcbc',
      'cccfcccccbbbbbcb',
      'bbbcacccbbbcbbbc',
      'cbcccccbcbcbcccb',
      'bcbcccbcbbbbbccc',
      'cfcccccbbbcbcccc',
      'bcabbcbcbbbccccc',
      'cccccbbbcbcccccc',
      'ccbcbbbbbcbccccc',
      'cbcbccfbbbbccccc',
      'bcbbbcbabcbbcccc',
      'cbcfcbcbcbbbcccc',
      'cccbacbbbcbccccc',
      'cccbcccbcbbbcccf'
    ],
    [
      'cccdcccfbcbcfcbc',
      'ccdcccccabcbcacc',
      'cdcdccccbcbbbccc',
      'ccdcdddccbbccbcc',
      'cdddddccbbbbbccd',
      'ccdddddccbbbcccc',
      'cccdddccbbbbbccc',
      'ccccddfccbbbcccc',
      'bcbccfcabbbbbccc',
      'cbccccaccccbcccc',
      'bcccccccccbccccc',
      'cccccccccbcbcccc',
      'bcbcbcccbcbbbccc',
      'cccccccccbbfbccc',
      'ccccccccbcbbacbc',
      'ccdccccbcbcbcbcc'
    ],
    [
      'ccbcbcbccccdcccc',
      'cccccccccdddfccc',
      'fcbcbccccdddcacc',
      'caccccccdcdddcdf',
      'accbbccccdcdddcc',
      'ccccbbccdcddddee',
      'acccbcbfccddcdee',
      'ccccccccacdcddda',
      'ccccbccccccccccc',
      'dcdccccccccccccc',
      'ccccccccccbccccc',
      'dccccccccbcccccc',
      'cccccccfbbbccccd',
      'ccccccccabcccccc',
      'ccbcbcbcbccccdcc',
      'cccccccccccccccc'
    ]
    ]
  },
  // Arena de los areneros (2 variantes).
  arena: {
    colores: { a: 0x9c8a5c, b: 0xb8a470, c: 0xcdb984 },
    cuadros: [
    [
      'bbbbbbbbbbbbabbb',
      'bbbbbbbbbbbbbbbb',
      'ababbbbbabaaabab',
      'bbbbbbbbbabbbabb',
      'abbbbbababababab',
      'bbbbbbbbbbabbaba',
      'bbbbbbbbbbbbabab',
      'bbcbbbbbbbbbbbbb',
      'bbbcbbbbbbbbabbb',
      'cbcccbcbcbbbbbbb',
      'bcccccbcbbbbbbbb',
      'cccccccccbbbcbcb',
      'bcccccbcbbbbbbbc',
      'cbccccccbbcbbbcb',
      'bcbcbcbcbcbbabbb',
      'bccccbbbbbbbbbab'
    ],
    [
      'bbbcccccbcbbbcbc',
      'cbccccabcbbbbbcb',
      'bcbcccccbcbbbbbb',
      'cacccccbcbbbbbbb',
      'baccccbcbbbbbbbb',
      'cbccccccbbcbbbcc',
      'bcccbccbbcbbbbbb',
      'cccccccccbcbcbcb',
      'bbbcbcccbbbbbbbb',
      'cbcccccbcbcbcccc',
      'bcbcbcbcccbcccbb',
      'cccccccbcccccccc',
      'bcbcbcbcccbcccbc',
      'cccbcccbcccccccc',
      'ccbcccbcccbccccc',
      'cccbcccccccbcccb'
    ]
    ]
  },
  // Baldosa de vereda y paseo (2 variantes), junta cada 8 px como hoy.
  baldosa: {
    colores: { a: 0x403e3b, b: 0x55534f, c: 0x62605b, d: 0x6f6c67 },
    cuadros: [
    [
      'aaaaaaaaaaaaaaaa',
      'abbbcbccaccccbcb',
      'acbbbbbcacccbcbb',
      'accbcbbbaccccbbb',
      'acccbbbbabbbbbbb',
      'accccbbbabcbbbbb',
      'acccbbbbacbbbbbc',
      'accccbcbabcbbbcb',
      'aaaaaaaaaaaaaaaa',
      'abcccccbabcbbbbb',
      'acbcccccacbcbbbb',
      'abcbccccacbbbbbb',
      'abbcbbbbabbbbbbb',
      'abcbcbbbabbbbbbb',
      'abbbbbbbabbbbbbb',
      'abbbbbbbabbbbbbb'
    ],
    [
      'aaaaaaaaaaaaaaaa',
      'acccccccacccccdc',
      'acccccaaaccccccc',
      'acccccccaacccccc',
      'acccccbcabacbccc',
      'accccbcbabbbcbcc',
      'acccbbbbabbbbbbc',
      'accccbbbabcbccbb',
      'aaaaaaaaaaaaaaaa',
      'accccbccaccbbbcb',
      'acccbcbcacbcbcbc',
      'accccbccabbbcccb',
      'acccbcccabbbbcbc',
      'accccccbabbbcbcc',
      'acbcccbbacbbbccc',
      'acccccccaccccccc'
    ]
    ]
  },
  // Asfalto de la calle y el estacionamiento (2 variantes).
  asfalto: {
    colores: { a: 0x1f1f24, b: 0x26262c, c: 0x2e2e35, d: 0x3a3a42 },
    cuadros: [
    [
      'aaaaabbbaabbbbab',
      'badaabbbbacbbbbb',
      'abbbbbbbbbbbabbb',
      'bbcbbbbabbbbbbbb',
      'bbbbbbbbabaabbaa',
      'bbcbbbbabaaabbba',
      'abbbabbbaaaaabaa',
      'bbbaaabbbabababa',
      'abbbbbbbababaaaa',
      'aabdbabbbabbbbba',
      'abbbaaabaaabbbbb',
      'bbbbaaaaaabbbbbb',
      'bbabaaaaaabcbbab',
      'bbbbbabbbabbbbba',
      'bbdbabbbaaaaabad',
      'bbbbbbcbaaaabbba'
    ],
    [
      'aaaaaaababbaaaaa',
      'aaaabababbaaaaaa',
      'abaabbaabbaaaaaa',
      'bbaabbaabbaaaaaa',
      'bbaaaaabbbabaaaa',
      'bbaaaabdbabaaaaa',
      'aaaaaaabaaaaaaaa',
      'babaaaaaaaaaadba',
      'bbbbabaaaabbbbab',
      'bbbbbabaaabbdbaa',
      'abbbbbabbbabaaaa',
      'babbbabbbbbabaaa',
      'aaaaaaabbbababaa',
      'aaaaaabbbbbbbbda',
      'aaaaababbbbaaaab',
      'baaababbbbbaaaba'
    ]
    ]
  },
  // Orilla pasto-tierra. Cuadro 0 = lado tierra (oscuro), cuadro 1 = lado pasto (claro).
  borde: {
    colores: { a: 0x27502a, b: 0x2f5e30, c: 0x3a6d37, d: 0x443223, e: 0x477e41, f: 0x58442e, g: 0x6b5639 },
    cuadros: [
    [
      'dffafffgffffffff',
      'ffffffffggggfffd',
      'dffffffgfgfgffff',
      'ffafgfffgggfffff',
      'fgfafffffgggffff',
      'gfgggfgggggfffff',
      'fgggfgfgfgffffff',
      'gggggggfgfffffff',
      'fgggfffgffffdfff',
      'gggfgfgffffffaff',
      'fffgfgffafffffff',
      'gfgagggfffffffff',
      'ffffggggfafffffa',
      'fffgggggffffffff',
      'fffffgggffdffaff',
      'ffffgggfgfffafff'
    ],
    [
      'bbbcbcccbcbccccc',
      'bccccceccbcbcbcb',
      'bcbcccccbcbbbcbc',
      'cccccccccbbbcccb',
      'bcbcccccbcbcbccc',
      'cccccccccbccccec',
      'ccccccccbbbccecc',
      'ecccecccccccceec',
      'ccccccccbbcccccc',
      'cceccccccbcccccc',
      'ceccccccccbccccc',
      'cccccccccccccccc',
      'ccccbccccccecccc',
      'cccccbcccceceeee',
      'ccccccbccccccecc',
      'cccccbcccccccccc'
    ]
    ]
  }
};

// Códigos de suelo (uno por píxel de dibujo)
const PZ_T = { PASTO: 0, TIERRA: 2, MAICILLO: 3, ARENA: 4, BALDOSA: 5, ASFALTO: 6, BORDE_TIERRA: 7, BORDE_PASTO: 8 };

// ---------------------------------------------------------------
//  Diseño del suelo (mapa de 6000 x 6000; centro de la pileta = 3000, 3000)
//  caminos: líneas de maicillo con ancho (px de mundo). Bordes irregulares.
//  claros:  elipses o rectángulos redondeados (tipo: tierra, maicillo, arena).
//  baldosas / asfaltos: rectángulos (paseo de baldosas y estacionamiento).
// ---------------------------------------------------------------
const PZ_SUELO = {
  VEREDA: 120,
  BORDE_RUIDO: 15,
  FLORES_UMBRAL: 0.68,
  caminos: [
    {
      puntos: [[280, 2850], [800, 2870], [1400, 2790], [1890, 2730], [2160, 2700], [2520, 2655], [2910, 2625], [3270, 2580], [3600, 2520], [3696, 2505]],
      ancho: 72
    },
    {
      puntos: [[3840, 2493], [4400, 2470], [5000, 2530], [5720, 2510]],
      ancho: 66
    },
    {
      puntos: [[3330, 280], [3324, 1000], [3318, 1800], [3306, 2385], [3285, 2589]],
      ancho: 42
    },
    {
      puntos: [[3330, 3195], [3480, 3375], [3600, 3615], [3780, 4300], [3720, 5000], [3700, 5720]],
      ancho: 48
    },
    {
      puntos: [[2520, 3075], [2400, 3105], [2310, 3150]],
      ancho: 42
    },
    {
      puntos: [[2874, 3291], [2900, 3765], [2820, 4600], [2880, 5720]],
      ancho: 54
    },
    {
      puntos: [[2640, 3261], [2520, 3465], [1920, 3885], [1020, 4155], [280, 4300]],
      ancho: 48
    },
    {
      puntos: [[3840, 3645], [4620, 3765], [5720, 3700]],
      ancho: 48
    },
    {
      puntos: [[330, 330], [5670, 330], [5670, 5670], [330, 5670], [330, 330]],
      ancho: 42
    },
    {
      puntos: [[1250, 330], [1250, 1060]],
      ancho: 42
    },
    {
      puntos: [[1250, 1440], [1260, 2000], [1240, 2800]],
      ancho: 48
    },
    {
      puntos: [[4750, 330], [4750, 1130]],
      ancho: 42
    },
    {
      puntos: [[4750, 1470], [4760, 2000], [4740, 2500]],
      ancho: 48
    },
    {
      puntos: [[1250, 4560], [1200, 4300], [1100, 4180]],
      ancho: 48
    },
    {
      puntos: [[1250, 4940], [1250, 5670]],
      ancho: 42
    },
    {
      puntos: [[4750, 4540], [4745, 4100], [4730, 3740]],
      ancho: 48
    },
    {
      puntos: [[4750, 4960], [4750, 5670]],
      ancho: 42
    }
  ],
  claros: [
    {
      nombre: 'claro central',
      tipo: 'maicillo',
      forma: 'elipse',
      x: 2910,
      y: 2991,
      rx: 456,
      ry: 318
    },
    {
      nombre: 'óvalo picnic',
      tipo: 'tierra',
      forma: 'elipse',
      x: 2295,
      y: 3159,
      rx: 108,
      ry: 174
    },
    {
      nombre: 'piso del kiosko',
      tipo: 'tierra',
      forma: 'elipse',
      x: 2445,
      y: 2433,
      rx: 310,
      ry: 150,
      angulo: -18
    },
    {
      nombre: 'arenero este',
      tipo: 'arena',
      forma: 'rect',
      x: 3459,
      y: 2892,
      w: 270,
      h: 198,
      radio: 30
    },
    {
      nombre: 'arenero suroeste',
      tipo: 'arena',
      forma: 'elipse',
      x: 2700,
      y: 3240,
      rx: 150,
      ry: 66
    },
    {
      nombre: 'cancha (NO)',
      tipo: 'tierra',
      forma: 'rect',
      x: 1250,
      y: 1250,
      w: 552,
      h: 372,
      radio: 60
    },
    {
      nombre: 'juegos (NE)',
      tipo: 'arena',
      forma: 'elipse',
      x: 4750,
      y: 1300,
      rx: 210,
      ry: 165
    },
    {
      nombre: 'picnic (SO)',
      tipo: 'tierra',
      forma: 'elipse',
      x: 1250,
      y: 4750,
      rx: 240,
      ry: 192
    },
    {
      nombre: 'jardín (SE)',
      tipo: 'maicillo',
      forma: 'elipse',
      x: 4750,
      y: 4750,
      rx: 210,
      ry: 210
    }
  ],
  baldosas: [
    {
      nombre: 'paseo de baldosas',
      x: 3696,
      y: 280,
      w: 144,
      h: 5440
    },
    {
      nombre: 'vereda del estacionamiento',
      x: 1902,
      y: 280,
      w: 192,
      h: 2340
    }
  ],
  asfaltos: [
    {
      nombre: 'estacionamiento',
      x: 1920,
      y: 160,
      w: 156,
      h: 2442
    }
  ],
  lineas: [
    {
      x: 1929,
      y: 1845,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 1845,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 1923,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 1923,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 2001,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 2001,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 2079,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 2079,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 2157,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 2157,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 2235,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 2235,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 2313,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 2313,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 2391,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 2391,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 2469,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 2469,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 1929,
      y: 2547,
      w: 39,
      h: 3,
      color: '#a19c86'
    },
    {
      x: 2031,
      y: 2547,
      w: 39,
      h: 3,
      color: '#a19c86'
    }
  ]
};

// ---------------- utilidades ----------------
function pzEscalaX() { return CONFIG.MAPA_ANCHO / 6000; }
function pzEscalaY() { return CONFIG.MAPA_ALTO / 6000; }

// Número 0..1 siempre igual para (x, y, semilla)
function pzHash(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Ruido suave (manchas) de tamaño "celda"
function pzRuido(x, y, celda, s) {
  const fx = x / celda, fy = y / celda;
  const ix = Math.floor(fx), iy = Math.floor(fy);
  const tx = fx - ix, ty = fy - iy;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = pzHash(ix, iy, s), b = pzHash(ix + 1, iy, s), c = pzHash(ix, iy + 1, s), d = pzHash(ix + 1, iy + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

// Semilla numérica a partir de CONFIG.MAPA_SEMILLA (texto)
function pzSemilla() {
  const t = String(CONFIG.MAPA_SEMILLA) + '_plaza';
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  return (h >>> 0) % 100000;
}

// Distancia de (px, py) al segmento a-b
function pzDistSegmento(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + dx * t - px, qy = ay + dy * t - py;
  return Math.sqrt(qx * qx + qy * qy);
}

// "Cuánto está adentro" de un claro: < 0 adentro, > 0 afuera (en px de mundo)
function pzDentroClaro(c, x, y) {
  const sx = pzEscalaX(), sy = pzEscalaY();
  const cx = c.x * sx, cy = c.y * sy;
  if (c.forma === 'rect') {
    const hw = c.w * sx / 2, hh = c.h * sy / 2, r = c.radio || 0;
    const qx = Math.abs(x - cx) - hw + r, qy = Math.abs(y - cy) - hh + r;
    return Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) + Math.min(Math.max(qx, qy), 0) - r;
  }
  let dx = x - cx, dy = y - cy;
  if (c.angulo) {
    const a = -c.angulo * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const u = dx * ca - dy * sa, w = dx * sa + dy * ca;
    dx = u; dy = w;
  }
  const rx = c.rx * sx, ry = c.ry * sy;
  const d = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
  return (d - 1) * Math.min(rx, ry);
}

// ¿(x, y) cae sobre un camino, claro, baldosa o asfalto? (margen en px de mundo, sin ruido)
function pzSobreSuelo(x, y, margen) {
  const S = PZ_SUELO, sx = pzEscalaX(), sy = pzEscalaY();
  const A = CONFIG.MAPA_ANCHO, H = CONFIG.MAPA_ALTO, borde = CONFIG.CALLE_ANCHO + S.VEREDA;
  if (x < borde + margen || y < borde + margen || x > A - borde - margen || y > H - borde - margen) return true;
  for (const c of S.caminos) {
    const p = c.puntos;
    for (let i = 0; i < p.length - 1; i++) {
      if (pzDistSegmento(x, y, p[i][0] * sx, p[i][1] * sy, p[i + 1][0] * sx, p[i + 1][1] * sy) < c.ancho / 2 + margen) return true;
    }
  }
  for (const c of S.claros) if (pzDentroClaro(c, x, y) < margen) return true;
  for (const r of S.baldosas.concat(S.asfaltos)) {
    if (x > r.x * sx - margen && x < (r.x + r.w) * sx + margen && y > r.y * sy - margen && y < (r.y + r.h) * sy + margen) return true;
  }
  return false;
}

// Pasa los cuadros de un tile a colores RGB listos para copiar
function pzPrepararTile(def) {
  // 4 canales: r, g, b y "hay color" (0 = transparente, '.' o ' ')
  return def.cuadros.map((filas) => {
    const rgb = new Uint8Array(16 * 16 * 4);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const letra = filas[y][x];
        const i = (y * 16 + x) * 4;
        if (letra === '.' || letra === ' ') continue;
        let c = def.colores[letra];
        if (c === undefined && typeof COLORES_COMUNES !== 'undefined') c = COLORES_COMUNES[letra];
        if (c === undefined) c = 0xff00ff;
        rgb[i] = (c >> 16) & 255; rgb[i + 1] = (c >> 8) & 255; rgb[i + 2] = c & 255; rgb[i + 3] = 255;
      }
    }
    return rgb;
  });
}

// Copia un dibujo de letras ({ colores, cuadros }) dentro de la imagen del suelo
// (para los "calcos": canteros, flores, líneas de la cancha). x, y = centro en px de mundo
function pzEstampar(img, W, H, sprite, x, y, cuadro) {
  const E = ESCALA_PIXEL;
  const filas = sprite.cuadros[cuadro || 0];
  const h = filas.length, w = filas[0].length;
  const x0 = Math.round(x / E - w / 2), y0 = Math.round(y / E - h / 2);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const letra = filas[j][i];
      if (letra === '.' || letra === ' ') continue;
      let c = sprite.colores[letra];
      if (c === undefined) c = COLORES_COMUNES[letra];
      if (c === undefined) continue;
      const X = x0 + i, Y = y0 + j;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const k = (Y * W + X) * 4;
      img[k] = (c >> 16) & 255; img[k + 1] = (c >> 8) & 255; img[k + 2] = c & 255;
    }
  }
}

// Oscurece una elipse del suelo (sombras horneadas: no cuestan nada en la partida)
// x, y en px de mundo; dx, dy, rx, ry en px de DIBUJO
function pzSombra(img, W, H, x, y, s) {
  const E = ESCALA_PIXEL;
  const cx = x / E + s.dx, cy = y / E + s.dy;
  const fuerza = s.fuerza || 0.42;
  for (let Y = Math.floor(cy - s.ry); Y <= Math.ceil(cy + s.ry); Y++) {
    for (let X = Math.floor(cx - s.rx); X <= Math.ceil(cx + s.rx); X++) {
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const d = ((X - cx) / s.rx) ** 2 + ((Y - cy) / s.ry) ** 2;
      if (d > 1) continue;
      // borde tramado (estilo 8 bits)
      if (d > 0.7 && ((X + Y) & 1)) continue;
      const k = (Y * W + X) * 4, f = 1 - fuerza;
      img[k] = img[k] * f; img[k + 1] = img[k + 1] * f; img[k + 2] = img[k + 2] * f;
    }
  }
}

// ---------------- pintar todo el suelo ----------------
// Reemplaza a pintarSueloPlaza: misma firma (h, mapa, p) que usa pintarSueloMapa.
// mapa.sombras, mapa.calcos y mapa.cables (opcionales) los pone el generador.
function pintarSueloPlazaNueva(h, mapa, p) {
  const E = ESCALA_PIXEL;
  const ctx = h.ctx;
  const W = ctx.canvas.width, H = ctx.canvas.height;     // 2000 x 2000 en la plaza
  const S = PZ_SUELO, sx = pzEscalaX(), sy = pzEscalaY();
  const sem = pzSemilla();
  const T = PZ_T;
  const terr = new Uint8Array(W * H);                     // todo empieza en PASTO (0)
  const calle = Math.round(CONFIG.CALLE_ANCHO / E);
  const vereda = Math.round((CONFIG.CALLE_ANCHO + S.VEREDA) / E);
  const AMP = S.BORDE_RUIDO / E;                          // qué tan irregular es la orilla

  const marcar = (X, Y, tipo) => { terr[Y * W + X] = tipo; };
  const ruidoBorde = (X, Y) => (pzRuido(X, Y, 7, sem + 11) * 0.65 + pzRuido(X, Y, 2.5, sem + 12) * 0.35 - 0.5) * 2 * AMP;

  // 1) calle y vereda (igual que hoy)
  for (let Y = 0; Y < H; Y++) {
    for (let X = 0; X < W; X++) {
      if (X < calle || Y < calle || X >= W - calle || Y >= H - calle) terr[Y * W + X] = T.ASFALTO;
      else if (X < vereda || Y < vereda || X >= W - vereda || Y >= H - vereda) terr[Y * W + X] = T.BALDOSA;
    }
  }
  // 2) caminos de tierra (orilla irregular)
  S.caminos.forEach((c) => {
    const pts = c.puntos.map((q) => [q[0] * sx / E, q[1] * sy / E]);
    const r = c.ancho / E / 2;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const x0 = Math.max(vereda, Math.floor(Math.min(ax, bx) - r - AMP - 1)), x1 = Math.min(W - vereda - 1, Math.ceil(Math.max(ax, bx) + r + AMP + 1));
      const y0 = Math.max(vereda, Math.floor(Math.min(ay, by) - r - AMP - 1)), y1 = Math.min(H - vereda - 1, Math.ceil(Math.max(ay, by) + r + AMP + 1));
      for (let Y = y0; Y <= y1; Y++) {
        for (let X = x0; X <= x1; X++) {
          if (terr[Y * W + X] !== T.PASTO) continue;
          if (pzDistSegmento(X, Y, ax, ay, bx, by) - r < ruidoBorde(X, Y)) marcar(X, Y, T.TIERRA);
        }
      }
    }
  });
  // 3) claros (tierra, maicillo, arena)
  const tipoClaro = { tierra: T.TIERRA, maicillo: T.MAICILLO, arena: T.ARENA };
  S.claros.forEach((c) => {
    const rmax = (c.forma === 'rect' ? Math.max(c.w * sx, c.h * sy) / 2 + 10 : Math.max(c.rx * sx, c.ry * sy)) / E + AMP + 2;
    const cx = c.x * sx / E, cy = c.y * sy / E;
    for (let Y = Math.max(vereda, Math.floor(cy - rmax)); Y <= Math.min(H - vereda - 1, cy + rmax); Y++) {
      for (let X = Math.max(vereda, Math.floor(cx - rmax)); X <= Math.min(W - vereda - 1, cx + rmax); X++) {
        if (pzDentroClaro(c, X * E, Y * E) / E < ruidoBorde(X, Y)) marcar(X, Y, tipoClaro[c.tipo]);
      }
    }
  });
  // 4) paseo de baldosas y estacionamiento (bordes rectos)
  const rect = (r, tipo) => {
    for (let Y = Math.max(0, Math.round(r.y * sy / E)); Y < Math.min(H, Math.round((r.y + r.h) * sy / E)); Y++) {
      for (let X = Math.max(0, Math.round(r.x * sx / E)); X < Math.min(W, Math.round((r.x + r.w) * sx / E)); X++) marcar(X, Y, tipo);
    }
  };
  S.baldosas.forEach((r) => rect(r, T.BALDOSA));
  S.asfaltos.forEach((r) => rect(r, T.ASFALTO));

  // 5) orillas: tierra oscura pegada al pasto y pasto crecido sobre la tierra
  const esSuelto = (t) => t === T.TIERRA || t === T.MAICILLO || t === T.ARENA;
  for (let Y = 1; Y < H - 1; Y++) {
    for (let X = 1; X < W - 1; X++) {
      const i = Y * W + X, t = terr[i];
      if (esSuelto(t)) {
        if (terr[i - 1] === T.PASTO || terr[i + 1] === T.PASTO || terr[i - W] === T.PASTO || terr[i + W] === T.PASTO) terr[i] = T.BORDE_TIERRA;
      } else if (t === T.PASTO) {
        const n = terr[i - 1], s2 = terr[i + 1], a = terr[i - W], b = terr[i + W];
        if ((esSuelto(n) || esSuelto(s2) || esSuelto(a) || esSuelto(b)) && pzHash(X, Y, sem + 3) < 0.55) terr[i] = T.BORDE_PASTO;
      }
    }
  }

  // 6) pintar cada píxel con su tile (variante según ruido y celda)
  const tiles = {};
  Object.keys(PZ_TILES).forEach((k) => { tiles[k] = pzPrepararTile(PZ_TILES[k]); });
  const datos = ctx.createImageData(W, H);
  const img = datos.data;
  const nP = tiles.pasto.length;
  // ruido grande precalculado cada 4 px (más rápido en celular)
  const GW = (W >> 2) + 1, GH = (H >> 2) + 1;
  const tono = new Float32Array(GW * GH);
  for (let j = 0; j < GH; j++) {
    for (let i = 0; i < GW; i++) tono[j * GW + i] = pzRuido(i * 4, j * 4, 90, sem + 1) * 0.7 + pzRuido(i * 4, j * 4, 30, sem + 2) * 0.3;
  }
  const flores = new Uint8Array(((W >> 4) + 1) * ((H >> 4) + 1));
  const FW = (W >> 4) + 1;
  for (let j = 0; j <= H >> 4; j++) {
    for (let i = 0; i < FW; i++) flores[j * FW + i] = pzRuido(i * 16, j * 16, 45, sem + 5) > S.FLORES_UMBRAL && pzHash(i, j, sem + 6) < 0.45 ? 1 : 0;
  }
  for (let Y = 0; Y < H; Y++) {
    for (let X = 0; X < W; X++) {
      const i = Y * W + X, t = terr[i];
      const cxl = X >> 4, cyl = Y >> 4;
      const hc = pzHash(cxl, cyl, sem + 21);                 // azar de la celda de 16 x 16
      const ox = (hc * 16) | 0, oy = ((hc * 256) | 0) & 15;  // corrimiento para que no se note la repetición
      let lx = (X + ox) & 15, ly = (Y + oy) & 15;
      // tono: manchas grandes + tramado en los límites (así no se notan cuadrados de 16 x 16)
      const n = tono[(Y >> 2) * GW + (X >> 2)];
      const tr = (((X & 3) * 4 + (Y & 3)) * 7 % 16) / 16 - 0.5;
      const elegir = (lista) => lista[Math.max(0, Math.min(lista.length - 1, Math.floor(n * lista.length * 1.25 - lista.length * 0.12 + tr * 0.9)))];
      let rgb, encima = null;
      if (t === T.PASTO) {
        rgb = elegir(tiles.pasto);
        if (flores[cyl * FW + cxl]) encima = tiles.pasto_flores[(hc * tiles.pasto_flores.length) | 0];
      } else if (t === T.BORDE_PASTO) rgb = tiles.borde[1];
      else if (t === T.TIERRA) rgb = elegir(tiles.tierra);
      else if (t === T.MAICILLO) rgb = elegir(tiles.maicillo);
      else if (t === T.ARENA) rgb = elegir(tiles.arena);
      else if (t === T.BORDE_TIERRA) rgb = tiles.borde[0];
      else if (t === T.BALDOSA) { rgb = tiles.baldosa[hc < 0.85 ? 0 : 1]; lx = X & 15; ly = Y & 15; }  // las juntas deben calzar
      else rgb = tiles.asfalto[(hc * tiles.asfalto.length) | 0];
      let k = (ly * 16 + lx) * 4;
      if (encima && encima[((Y & 15) * 16 + (X & 15)) * 4 + 3]) { rgb = encima; k = ((Y & 15) * 16 + (X & 15)) * 4; }
      const o = i * 4;
      img[o] = rgb[k]; img[o + 1] = rgb[k + 1]; img[o + 2] = rgb[k + 2]; img[o + 3] = 255;
    }
  }

  // 7) líneas: solera, línea amarilla de la calle, líneas del estacionamiento
  const punto = (X, Y, c) => {
    if (X < 0 || Y < 0 || X >= W || Y >= H) return;
    const o = (Y * W + X) * 4; img[o] = (c >> 16) & 255; img[o + 1] = (c >> 8) & 255; img[o + 2] = c & 255;
  };
  const hexA = (s) => parseInt(String(s).replace('#', ''), 16);
  const solera = hexA(p.solera || '#9a9a9a'), linea = hexA(p.lineaCalle || '#8a7a2a');
  for (let k = calle; k < W - calle; k++) { punto(k, calle, solera); punto(k, H - calle - 1, solera); }
  for (let k = calle; k < H - calle; k++) { punto(calle, k, solera); punto(W - calle - 1, k, solera); }
  const m = Math.round(calle / 2);
  for (let k = 0; k < Math.max(W, H); k += 12) {
    for (let d = 0; d < 6; d++) { punto(k + d, m, linea); punto(k + d, H - m, linea); punto(m, k + d, linea); punto(W - m, k + d, linea); }
  }
  S.asfaltos.forEach((r) => {      // solera alrededor del estacionamiento
    const x0 = Math.round(r.x * sx / E), y0 = Math.round(r.y * sy / E), x1 = Math.round((r.x + r.w) * sx / E) - 1, y1 = Math.round((r.y + r.h) * sy / E) - 1;
    for (let X = x0; X <= x1; X++) { if (y0 > calle) punto(X, y0, solera); punto(X, y1, solera); }
    for (let Y = Math.max(y0, calle); Y <= y1; Y++) { punto(x0, Y, solera); punto(x1, Y, solera); }
  });
  (S.lineas || []).forEach((l) => {
    const c = hexA(l.color);
    for (let Y = Math.round(l.y * sy / E); Y < Math.round((l.y + l.h) * sy / E); Y++) {
      for (let X = Math.round(l.x * sx / E); X < Math.round((l.x + l.w) * sx / E); X++) punto(X, Y, c);
    }
  });

  // 8) lo que pone el generador: sombras, sombras de cables y calcos
  (mapa.sombras || []).forEach((s) => pzSombra(img, W, H, s.x, s.y, s));
  (mapa.cables || []).forEach((c) => {
    const ax = c.a.x / E + 4, ay = c.a.y / E + 7, bx = c.b.x / E + 4, by = c.b.y / E + 7;
    const n = Math.ceil(Math.hypot(bx - ax, by - ay));
    for (let k = 0; k <= n; k++) {
      const u = k / n, X = Math.round(ax + (bx - ax) * u), Y = Math.round(ay + (by - ay) * u + Math.sin(u * Math.PI) * (c.comba || 3));
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const o = (Y * W + X) * 4; img[o] *= 0.72; img[o + 1] *= 0.72; img[o + 2] *= 0.72;
    }
  });
  if (typeof PZ_OBJETOS !== 'undefined') {
    (mapa.calcos || []).forEach((c) => { if (PZ_OBJETOS[c.clave]) pzEstampar(img, W, H, PZ_OBJETOS[c.clave], c.x, c.y, c.cuadro); });
  }
  ctx.putImageData(datos, 0, 0);
}

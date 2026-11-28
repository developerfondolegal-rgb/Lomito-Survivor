// ===============================================================
//  LA PLAZA RENOVADA - FASE 2: LOS OBJETOS (props)
//  (archivo nuevo, script clásico)
//
//  PZ_OBJETOS: cada objeto en el MISMO formato que SPRITES_PLAZA
//  ({ colores, cuadros }, "." transparente, K = borde negro común) y además:
//    nombre:      para qué es
//    tamano:      tamaño del dibujo
//    profundidad: depth sugerida (hoy: suelo 0, pileta 1, bancas 2, perro 10, árboles 11)
//    choque:      choque sugerido en px de MUNDO, centrado en el objeto:
//                   { forma: 'circulo', r } | { forma: 'rect', w, h, dx?, dy? }
//                   | { forma: 'circulos', lista: [{ dx, dy, r }] }   (el kiosko y el columpio)
//                   null = no choca (se puede pasar por encima)
//    sombra:      sombra que se HORNEA en el suelo (px de DIBUJO, relativa al centro)
//    enSuelo:     true = no es un objeto: se pinta dentro del suelo (canteros, flores, cancha)
//  Todas las claves empiezan con "pz_" para no chocar con SPRITES_PLAZA
//  (banca, basurero, farol...), que siguen usando la Terminal y la Feria.
//  Al cargar este archivo, generarPlazaNueva (FASE 1) usa estos dibujos solo.
// ===============================================================

const PZ_OBJETOS = {
  pz_arbol_g: {
    colores: { a: 0x10301c, b: 0x16261c, c: 0x184626, d: 0x215c2c, e: 0x2d7332, f: 0x41893a, g: 0x64a446, h: 0x9cc85a },
    nombre: 'Árbol grande',
    profundidad: 11,
    choque: {
      forma: 'circulo',
      r: 30
    },
    sombra: {
      dx: 8,
      dy: 10,
      rx: 20,
      ry: 16,
      fuerza: 0.45
    },
    tamano: '43 x 43 px de dibujo (129 x 129 en pantalla)',
    cuadros: [
    [
      '...........................................',
      '.................bbbbbbbbbb................',
      '...............bbfffffeeeeebb..............',
      '..............bfffgffeeefefffbb............',
      '.............bffhffgfeeeefffeeeb...........',
      '..........bbbfgggggggfeefefffeedb..........',
      '........bbfffgggfgfgfgffefefeedddb.........',
      '.......bffffghhggfgfggggfeeefeedeb.........',
      '......bfffghggggggfffgggfeeeeededdb........',
      '......bfgghggggghgghgggggeeeeeeeedeb.......',
      '.....bfgghghggggggfffgggfeeededeeedeb......',
      '.....bhggghggggggggfgggggeedeeeeeeeeeb.....',
      '....bhggggggggggfffffgggfffedededeeedeb....',
      '....bhhghggggggffffhgfgfffffeeedeeeeeeb....',
      '....bhggggggggghffffffffefefhedddeeededb...',
      '....bhhggggggggghhfffffffheehfedeeeeeddb...',
      '....bhggfgggfgfgghffefefeeeeeedddededddb...',
      '....bggggfgfgfghggfffefeeeeeeedddddddddcb..',
      '.....bfgfffffgggghfeefefeeeeeeddddcddddcb..',
      '....begggfffgghggffefffefeeefddddcccdddcb..',
      '....beeffffgfgggffeeefefeeeeedddcccccdcb...',
      '....befeffgggghffffefffffefedddddcccdcdb...',
      '...beeeeegggggffffefefefffedcdddddcccdcb...',
      '...beeeeefgggfhffefefefeeeeddddddccccccb...',
      '...bdededfffffefeeeeeeeeddddddcdcccccccb...',
      '....bdedeefefefeeeeeeeeedddddddccccccccb...',
      '....bededeefeeeeeeeeeeedddddddccccacacab...',
      '....beeeeefffefffffeheeddddcdcdccccacab....',
      '.....beeeeefehefffeeeeddddccccccccaaaab....',
      '......beeefefefffffeeddddddccccccccaab.....',
      '.......beeeeeedfefddddddddccccccccccb......',
      '........beeeeeeddddddddddddccccccccb.......',
      '........bdddddddddddddcdcdccacacacb........',
      '.........bdddddddddddcccdcdccacacb.........',
      '..........bbcccccddddccccdccacabb..........',
      '............bcdcdcdddcccccccccb............',
      '.............bbdccccccccacccbb.............',
      '...............bbbbbcccbbbbb...............',
      '....................bbb....................',
      '...........................................',
      '...........................................',
      '...........................................',
      '...........................................'
    ]
    ]
  },
  pz_arbol_m: {
    colores: { a: 0x10301c, b: 0x16261c, c: 0x184626, d: 0x215c2c, e: 0x2d7332, f: 0x41893a, g: 0x64a446, h: 0x9cc85a },
    nombre: 'Árbol mediano',
    profundidad: 11,
    choque: {
      forma: 'circulo',
      r: 26
    },
    sombra: {
      dx: 7,
      dy: 8,
      rx: 16,
      ry: 13,
      fuerza: 0.45
    },
    tamano: '35 x 35 px de dibujo (105 x 105 en pantalla)',
    cuadros: [
    [
      '...................................',
      '...................................',
      '...................................',
      '............bbbbbb.................',
      '...........bghgfefbbb..............',
      '..........bggggggefffbbb...........',
      '.........bfgggggfgeeefeeb..........',
      '........bggfggggggfefefeebb........',
      '......bbggggfffgggeeeeeedddb.......',
      '.....bhhhggggfggggfeeeedddddb......',
      '....bgggghggfffgggeeeedddddddb.....',
      '...bhghghggggfffgeeeedddddddeb.....',
      '...bggghggfghghfdeddddddddddddb....',
      '...bhghggfffhhhfddhdddddededddb....',
      '..bhggggffffffffhddddddddeddddcb...',
      '..bfhggffffffhfeeeheedddeddddddb...',
      '...bggffffhfeeeeeefeeeddddddcdccb..',
      '...bfggffffffefeeefeeddddddddcccb..',
      '...bfgffffffffeeefeeddddddddccacb..',
      '...bffgfgffffffefefdeddddddddccb...',
      '...beffgffffefefeeedddcdcdcdccab...',
      '...bfefggffehefeheeddddcccccdccb...',
      '....bfefefeeeeeeeeddddccccccccb....',
      '....befeeeedddddeddddcccccccdcb....',
      '.....beeeeddddddddddccccccccccb....',
      '......beededdddddcdcdcdcccccccb....',
      '.......beeddddddddcdcdcccccccb.....',
      '........bbdddddddddcdddccccccb.....',
      '..........bdcdddddcdcdccaaacb......',
      '...........bbbdddcdcccdccaab.......',
      '..............bbbbbbccccabb........',
      '....................bbbbb..........',
      '...................................',
      '...................................',
      '...................................'
    ]
    ]
  },
  pz_arbol_c: {
    colores: { a: 0x16261c, b: 0x184626, c: 0x215c2c, d: 0x2d7332, e: 0x41893a, f: 0x64a446, g: 0x9cc85a },
    nombre: 'Árbol chico',
    profundidad: 11,
    choque: {
      forma: 'circulo',
      r: 22
    },
    sombra: {
      dx: 5,
      dy: 7,
      rx: 13,
      ry: 11,
      fuerza: 0.45
    },
    tamano: '27 x 27 px de dibujo (81 x 81 en pantalla)',
    cuadros: [
    [
      '...........................',
      '.........aaaa..............',
      '.......aaeefeaa............',
      '......aeffgffgfaaa.........',
      '.....aeefgffefefeda........',
      '.....aeegfgffeeeeddaa......',
      '....aeeefgffeeeeeeddca.....',
      '....aeeegggfeeeegeedda.....',
      '....aeegffffeedededdcca....',
      '...aeeedefffededgdeddcca...',
      '..aeeedddggfeeddddddddca...',
      '..aeeedddefeeeedddeddcca...',
      '..aeeeddgfeeeededecdccca...',
      '..aeeeeeeefeeeeeeedcdcca...',
      '...adededeegddgedeccccca...',
      '...adddddeedddddddccccca...',
      '...acdddcdddcccdccbbbcca...',
      '...adcdddcgddcddcbbbbbca...',
      '....addddcbcbcbcbcbbbba....',
      '.....adddccbcbcccbbbbba....',
      '.....acdccbcbbbcbbbbba.....',
      '......accccccbbbbbcbba.....',
      '.......abcccbbbbbbbaa......',
      '........accccbbbbaa........',
      '.........aacbbbba..........',
      '...........aaaaa...........',
      '...........................'
    ]
    ]
  },
  pz_arbusto_g: {
    colores: { a: 0x0e2614, b: 0x14361c, c: 0x1d4a25, d: 0x2a6230, e: 0x3c7d3a },
    nombre: 'Arbusto grande (sin choque; brilla en la FASE 3)',
    profundidad: 2,
    choque: null,
    sombra: {
      dx: 2,
      dy: 3,
      rx: 9,
      ry: 6,
      fuerza: 0.4
    },
    tamano: '23 x 23 px de dibujo (69 x 69 en pantalla)',
    cuadros: [
    [
      '.......................',
      '.......................',
      '.......................',
      '.......................',
      '.......................',
      '.............aa........',
      '.........aaaaeeaa......',
      '......aaaeedeeedca.....',
      '.....adededdddccbca....',
      '.....aededdddddcccca...',
      '....aeeededdddddccba...',
      '...aedeeedddeddddcca...',
      '...adddddddddddcbcba...',
      '...adddddddddddccba....',
      '...adeddddcdccccbba....',
      '...aededdcdccccbba.....',
      '....adddccccccaaa......',
      '.....adddcccda.........',
      '......aaddcaa..........',
      '........aaa............',
      '.......................',
      '.......................',
      '.......................'
    ]
    ]
  },
  pz_arbusto_c: {
    colores: { a: 0x0e2614, b: 0x14361c, c: 0x1d4a25, d: 0x2a6230, e: 0x3c7d3a },
    nombre: 'Arbusto chico (sin choque)',
    profundidad: 2,
    choque: null,
    sombra: {
      dx: 2,
      dy: 2,
      rx: 6,
      ry: 4,
      fuerza: 0.4
    },
    tamano: '15 x 15 px de dibujo (45 x 45 en pantalla)',
    cuadros: [
    [
      '...............',
      '...............',
      '.....aaa.......',
      '....adedaa.....',
      '...addddda.....',
      '...aeddddda....',
      '..aeddddcca....',
      '..adeddcca.....',
      '..adddccba.....',
      '..acdddcca.....',
      '...aaaccca.....',
      '......aaa......',
      '...............',
      '...............',
      '...............'
    ]
    ]
  },
  pz_banca: {
    colores: { a: 0x3a3d44, b: 0x4a2e18, c: 0x5b616b, d: 0x6b4425, e: 0x8a5a31, f: 0xa8743f },
    nombre: 'Banca (horizontal; se gira 90 como hoy)',
    profundidad: 2,
    choque: {
      forma: 'rect',
      w: 60,
      h: 24
    },
    sombra: {
      dx: 2,
      dy: 3,
      rx: 11,
      ry: 4,
      fuerza: 0.35
    },
    tamano: '22 x 8 px de dibujo (66 x 24 en pantalla)',
    cuadros: [
    [
      'KKKKKKKKKKKKKKKKKKKKKK',
      'KaaffffffffffffffffaaK',
      'KccdbddddddddddddddccK',
      'KaaeeebeeeeeeeeeeeeaaK',
      'KccdddddbddddddddddccK',
      'KaaeeeeeeebeeeeeeeeaaK',
      'KcceeeeeeeeebeeeeeeccK',
      'KKKKKKKKKKKKKKKKKKKKKK'
    ]
    ]
  },
  pz_mesa: {
    colores: { a: 0x3a3d44, b: 0x4a2e18, c: 0x5b616b, d: 0x6b4425, e: 0x8a5a31, f: 0xa8743f },
    nombre: 'Mesa de picnic con dos bancas',
    profundidad: 2,
    choque: {
      forma: 'rect',
      w: 66,
      h: 60
    },
    sombra: {
      dx: 2,
      dy: 3,
      rx: 12,
      ry: 11,
      fuerza: 0.35
    },
    tamano: '24 x 22 px de dibujo (72 x 66 en pantalla)',
    cuadros: [
    [
      '.KKKKKKKKKKKKKKKKKKKKKK.',
      '.KaaffffffffffffffffaaK.',
      '.KccdbddddddddddddddccK.',
      '.KaaeeebeeeeeeeeeeeeaaK.',
      '.KccdddddbddddddddddccK.',
      '.KaaeeeeeeebeeeeeeeeaaK.',
      'KKKKKKKKKKKKKKKKKKKKKKKK',
      'KfffffffffdffffffffffffK',
      'KeeeeedeeeeeeeeeeeeeeeeK',
      'KedeeeeeeeeeeeeeeeeeedeK',
      'KffffffffffffffffdfffffK',
      'KeeeeeeeeeeeedeeeeeeeeeK',
      'KeeeeeeeedeeeeeeeeeeeeeK',
      'KffffdfffffffffffffffffK',
      'KdeeeeeeeeeeeeeeeeeedeeK',
      'KKKKKKKKKKKKKKKKKKKKKKKK',
      '.KccdbddddddddddddddccK.',
      '.KaaeeebeeeeeeeeeeeeaaK.',
      '.KccdddddbddddddddddccK.',
      '.KaaeeeeeeebeeeeeeeeaaK.',
      '.KcceeeeeeeeebeeeeeeccK.',
      '.KKKKKKKKKKKKKKKKKKKKKK.'
    ]
    ]
  },
  pz_basurero: {
    colores: { a: 0x1b4d1e, b: 0x2e7d32, c: 0x43a047, d: 0xb0a070 },
    nombre: 'Basurero (suelta comida, como hoy)',
    profundidad: 2,
    choque: {
      forma: 'circulo',
      r: 12
    },
    sombra: {
      dx: 2,
      dy: 2,
      rx: 4,
      ry: 3,
      fuerza: 0.4
    },
    tamano: '9 x 9 px de dibujo (27 x 27 en pantalla)',
    cuadros: [
    [
      '...KKK...',
      '.KKcccKK.',
      '.KcdaabK.',
      'KcdaadabK',
      'KcaadaabK',
      'KcadaadbK',
      '.KbaadbK.',
      '.KKbbbKK.',
      '...KKK...'
    ]
    ]
  },
  pz_farol: {
    colores: { a: 0xffd54f, b: 0xfffbe0 },
    nombre: 'Farol (su luz la pone actualizarOscuridad, como hoy)',
    profundidad: 2,
    choque: null,
    sombra: {
      dx: 3,
      dy: 4,
      rx: 3,
      ry: 2,
      fuerza: 0.5
    },
    tamano: '7 x 7 px de dibujo (21 x 21 en pantalla)',
    cuadros: [
    [
      '.......',
      '..KKK..',
      '.KabaK.',
      '.KbbbK.',
      '.KabaK.',
      '..KKK..',
      '.......'
    ]
    ]
  },
  pz_farol_g: {
    colores: { a: 0xffd54f, b: 0xfffbe0 },
    nombre: 'Farol grande (los 4 de la pileta)',
    profundidad: 2,
    choque: null,
    sombra: {
      dx: 3,
      dy: 4,
      rx: 3,
      ry: 3,
      fuerza: 0.5
    },
    tamano: '9 x 9 px de dibujo (27 x 27 en pantalla)',
    cuadros: [
    [
      '.........',
      '...KKK...',
      '..KaaaK..',
      '.KabbbaK.',
      '.KabbbaK.',
      '.KabbbaK.',
      '..KaaaK..',
      '...KKK...',
      '.........'
    ]
    ]
  },
  pz_poste: {
    colores: { a: 0x4a2e18, b: 0x8a5a31, c: 0xa8743f, d: 0xc8d0d8 },
    nombre: 'Poste de luz con cruceta',
    profundidad: 12,
    choque: null,
    sombra: {
      dx: 4,
      dy: 6,
      rx: 2,
      ry: 2,
      fuerza: 0.45
    },
    tamano: '11 x 5 px de dibujo (33 x 15 en pantalla)',
    cuadros: [
    [
      '....KKK....',
      '.d.KccbK.d.',
      'KaaKcbbKaaK',
      '...KbbbK...',
      '....KKK....'
    ]
    ]
  },
  pz_columpio: {
    colores: { a: 0x2c3e50, b: 0x8a919c, c: 0xc0392b, d: 0xe74c3c },
    nombre: 'Columpio (la barra va encima del perro)',
    profundidad: 11,
    choque: {
      forma: 'circulos',
      lista: [
        {
          dx: -90,
          dy: -15,
          r: 12
        },
        {
          dx: 90,
          dy: -15,
          r: 12
        }
      ]
    },
    sombra: {
      dx: 3,
      dy: 6,
      rx: 31,
      ry: 2,
      fuerza: 0.3
    },
    tamano: '65 x 16 px de dibujo (195 x 48 en pantalla)',
    cuadros: [
    [
      '.KcK.........................................................KcK.',
      '.KcK.........................................................KcK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KcK...........b.....b.......b.....b.......b.....b...........KcK.',
      '.KcK...........b.....b.....................b.....b...........KcK.',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.....................KKKKKKK...............',
      '...............KKKKKKK.......b.....b.......KaaaaaK...............',
      '...............KaaaaaK.......b.....b.......KKKKKKK...............',
      '...............KKKKKKK.......KKKKKKK.............................',
      '.............................KaaaaaK.............................'
    ]
    ]
  },
  pz_resbalin: {
    colores: { a: 0x3a3d44, b: 0x5b616b, c: 0xd4a017, d: 0xf1c40f },
    nombre: 'Resbalín',
    profundidad: 2,
    choque: {
      forma: 'rect',
      w: 24,
      h: 84
    },
    sombra: {
      dx: 3,
      dy: 3,
      rx: 5,
      ry: 14,
      fuerza: 0.35
    },
    tamano: '9 x 29 px de dibujo (27 x 87 en pantalla)',
    cuadros: [
    [
      'KKKKKKKKK',
      'KbbbbbbbK',
      'KaaaaaaaK',
      'KbbbbbbbK',
      'KaaaaaaaK',
      'KbbbbbbbK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KccdddccK',
      'KKKKKKKKK'
    ]
    ]
  },
  pz_subebaja: {
    colores: { a: 0x5b616b, b: 0xe0709e, c: 0xf4a2c2 },
    nombre: 'Sube y baja',
    profundidad: 2,
    choque: {
      forma: 'circulo',
      r: 10
    },
    sombra: {
      dx: 2,
      dy: 4,
      rx: 20,
      ry: 6,
      fuerza: 0.3
    },
    tamano: '45 x 19 px de dibujo (135 x 57 en pantalla)',
    cuadros: [
    [
      '..K..........................................',
      '..KK.........................................',
      '..KcKKK......................................',
      '..KKcccKKK...................................',
      '..K.KKKcccKKK................................',
      '.......KKKcc.KK..............................',
      '..........KKKccKKK...........................',
      '.............KKcccKKKKKKK....................',
      '...............KKKccKaaaK....................',
      '..................KKKaaaKKK..................',
      '....................KaaaKbbKKK...............',
      '....................KKKKKKKbbbKK.............',
      '...........................KKKbbbKK..........',
      '..............................KK.bbKKK.......',
      '................................KKKbbbKKK.K..',
      '...................................KKKbbbKK..',
      '......................................KKKbK..',
      '.........................................KK..',
      '..........................................K..'
    ]
    ]
  },
  pz_caballito_a: {
    colores: { a: 0xc08a10, b: 0xf0c030 },
    nombre: 'Caballito de resorte amarillo',
    profundidad: 2,
    choque: {
      forma: 'circulo',
      r: 12
    },
    sombra: {
      dx: 2,
      dy: 3,
      rx: 5,
      ry: 3,
      fuerza: 0.35
    },
    tamano: '9 x 7 px de dibujo (27 x 21 en pantalla)',
    cuadros: [
    [
      '..KK.....',
      '.KbbK....',
      'KbbbbKKK.',
      '.KaaaaaK.',
      '..KaaaaK.',
      '..K.K.K..',
      '.........'
    ]
    ]
  },
  pz_caballito_r: {
    colores: { a: 0x9c1c18, b: 0xe2584a },
    nombre: 'Caballito de resorte rojo',
    profundidad: 2,
    choque: {
      forma: 'circulo',
      r: 12
    },
    sombra: {
      dx: 2,
      dy: 3,
      rx: 5,
      ry: 3,
      fuerza: 0.35
    },
    tamano: '9 x 7 px de dibujo (27 x 21 en pantalla)',
    cuadros: [
    [
      '..KK.....',
      '.KbbK....',
      'KbbbbKKK.',
      '.KaaaaaK.',
      '..KaaaaK.',
      '..K.K.K..',
      '.........'
    ]
    ]
  },
  pz_carrito: {
    colores: { a: 0x9c1c18, b: 0xc8322a, c: 0xf4f0e6 },
    nombre: 'Carrito de sopaipillas con quitasol',
    profundidad: 11,
    choque: {
      forma: 'rect',
      w: 54,
      h: 36,
      dx: 3,
      dy: 9
    },
    sombra: {
      dx: 4,
      dy: 5,
      rx: 12,
      ry: 8,
      fuerza: 0.4
    },
    tamano: '24 x 24 px de dibujo (72 x 72 en pantalla)',
    cuadros: [
    [
      '.........K..............',
      '.....KKbbcccKK..........',
      '....KbbbbcccccK.........',
      '...KbbbbbccccccK........',
      '..KcbbbbbcccccbbK.......',
      '.KcccbbbbccccbbbbK......',
      '.KccccbbbcccbbbbbK......',
      '.ccccccbbccbbbbbbb......',
      '.cccccccbKbbbbbbbb......',
      'KcccccccKKKcccccccK.....',
      '.bbbbbbbbKbcccccccKKKKK.',
      '.bbbbbbbccbbccccccccccK.',
      '.KbbbbbcccbbbccccKccccK.',
      '.KbbbbccccbbbbcccKccccK.',
      '..KbbcccccbbbbbcKabbbaK.',
      '...KccccccbbbbbKbabbbaK.',
      '....KcccccbbbbKbbabbbaK.',
      '....KKKcccbbKKbbbabbbaK.',
      '....KabbbKbbbabbbabbbaK.',
      '....KabbbabbbabbbabbbaK.',
      '....KKKKKKKKKKKKKKKKKKK.',
      '......K............K....',
      '......K............K....',
      '........................'
    ]
    ]
  },
  pz_letrero: {
    colores: { a: 0x1e5b3a, b: 0x2e7a4e, c: 0xe8e0c0 },
    nombre: 'Letrero de la plaza',
    profundidad: 2,
    choque: {
      forma: 'rect',
      w: 60,
      h: 24
    },
    sombra: {
      dx: 3,
      dy: 3,
      rx: 10,
      ry: 4,
      fuerza: 0.35
    },
    tamano: '21 x 9 px de dibujo (63 x 27 en pantalla)',
    cuadros: [
    [
      'KKKKKKKKKKKKKKKKKKKKK',
      'KbbbbbbbbbbbbbbbbbbbK',
      'KaaaaaaaaaaaaaaaaaaaK',
      'KaaaaaaaaaaaaaaaaaaaK',
      'KaacacacacacacacacaaK',
      'KaaaaaaaaaaaaaaaaaaaK',
      'KaaaaaaaaaaaaaaaaaaaK',
      'KbbbbbbbbbbbbbbbbbbbK',
      'KKKKKKKKKKKKKKKKKKKKK'
    ]
    ]
  },
  pz_grifo: {
    colores: { a: 0xc08a10, b: 0xf0c030, c: 0xffe27a },
    nombre: 'Grifo',
    profundidad: 2,
    choque: {
      forma: 'circulo',
      r: 9
    },
    sombra: {
      dx: 2,
      dy: 2,
      rx: 3,
      ry: 2,
      fuerza: 0.4
    },
    tamano: '7 x 7 px de dibujo (21 x 21 en pantalla)',
    cuadros: [
    [
      '..KKK..',
      '.KcccK.',
      'KcccbbK',
      'KccabbK',
      'KcbbbbK',
      '.KbbbK.',
      '..KKK..'
    ]
    ]
  },
  pz_cantero: {
    colores: { a: 0x2a6230, b: 0x3c7d3a, c: 0x56664f, d: 0x5da04a, e: 0x5e4630, f: 0x6f8364, g: 0xc79be0, h: 0xe8e4d8, i: 0xf08aa8, j: 0xf2d65a },
    nombre: 'Cantero de flores (se pinta en el suelo)',
    enSuelo: true,
    choque: null,
    tamano: '23 x 15 px de dibujo (69 x 45 en pantalla)',
    cuadros: [
    [
      '.......................',
      '.......fcfcfcfcf.......',
      '.....cfceeeeeeacfc.....',
      '...fcaaebeeebaaaaecf...',
      '..fceaiaaeageeiebaecf..',
      '..ceadaaheeiegaheaeec..',
      '.cfejaeeeaeiaejbeeeafc.',
      '.fcaeeeehgaaaaeeaaeacf.',
      '.cfaaeeejdadeejaeehafc.',
      '..ceeeeeaehejaejajaec..',
      '..fceedeeaaeeeeeiaecf..',
      '...fceaeaeaagggeeacf...',
      '.....cfcaaeaaaacfc.....',
      '.......fcfcfcfcf.......',
      '.......................'
    ]
    ]
  },
  pz_flores_0: {
    colores: { a: 0x1f4323, b: 0xe8e4d8 },
    nombre: 'Florcitas sueltas (se pintan en el suelo)',
    enSuelo: true,
    choque: null,
    tamano: '7 x 7 px de dibujo (21 x 21 en pantalla)',
    cuadros: [
    [
      '.......',
      '.......',
      '.......',
      '.b..b..',
      '.a..ab.',
      '....aa.',
      '.......'
    ]
    ]
  },
  pz_flores_1: {
    colores: { a: 0x1f4323, b: 0xf2d65a },
    nombre: 'Florcitas sueltas (se pintan en el suelo)',
    enSuelo: true,
    choque: null,
    tamano: '7 x 7 px de dibujo (21 x 21 en pantalla)',
    cuadros: [
    [
      '.......',
      '.......',
      '....b..',
      '.b..a..',
      '.b..b..',
      '.ab.a..',
      '..a....'
    ]
    ]
  },
  pz_flores_2: {
    colores: { a: 0x1f4323, b: 0xc79be0 },
    nombre: 'Florcitas sueltas (se pintan en el suelo)',
    enSuelo: true,
    choque: null,
    tamano: '7 x 7 px de dibujo (21 x 21 en pantalla)',
    cuadros: [
    [
      '.......',
      '.b.....',
      '.a.....',
      '.bb....',
      '.aa....',
      '..bb...',
      '..aa...'
    ]
    ]
  },
  pz_flores_3: {
    colores: { a: 0x1f4323, b: 0xf08aa8 },
    nombre: 'Florcitas sueltas (se pintan en el suelo)',
    enSuelo: true,
    choque: null,
    tamano: '7 x 7 px de dibujo (21 x 21 en pantalla)',
    cuadros: [
    [
      '.......',
      '.......',
      '.....b.',
      '.....a.',
      '.......',
      '.bbbb..',
      '.aaaa..'
    ]
    ]
  },
  pz_kiosko: {
    colores: { a: 0xe6c878, b: 0xa9d6ea, c: 0x98c1d3, d: 0xd1ad5a, e: 0x7db6d2, f: 0x5a90ae, g: 0xb08c42, h: 0x7f6e42, i: 0x4a768f, j: 0x3c6b86, l: 0x8a6a2e, m: 0x735f32, n: 0x6e5525, o: 0x31586e, p: 0x614d24, q: 0x483c21, s: 0x3f341b, t: 0x352a14, u: 0x2a200e, v: 0x262114, x: 0x231d0f, y: 0x211a0b, z: 0x1d170b, A: 0x171208, B: 0x15120b, C: 0x131008, D: 0x120e06, E: 0x100d06, F: 0x0d0a04, G: 0x0c0a06, H: 0x0b0905, I: 0x0a0803, J: 0x090703, L: 0x070502, M: 0x060402 },
    nombre: 'Kiosko techado (techo celeste, piso de madera)',
    profundidad: 11,
    choque: {
      forma: 'circulos',
      lista: [
        {
          dx: -171,
          dy: 38,
          r: 66
        },
        {
          dx: -57,
          dy: 1,
          r: 66
        },
        {
          dx: 57,
          dy: -37,
          r: 66
        },
        {
          dx: 171,
          dy: -74,
          r: 66
        }
      ]
    },
    sombra: {
      dx: 6,
      dy: 10,
      rx: 92,
      ry: 34,
      fuerza: 0.25
    },
    tamano: '200 x 110 px de dibujo (600 x 330 en pantalla)',
    cuadros: [
    [
      '........................................................................................................................................................................................................',
      '........................................................................................................................................................................................................',
      '........................................................................................................................................................................................................',
      '.........................................................................................................................................................................KK.............................',
      '......................................................................................................................................................................KKKKK.............................',
      '...................................................................................................................................................................KKKffcKK.............................',
      '................................................................................................................................................................KKKfffffcfKK............................',
      '.............................................................................................................................................................KKKKfcfffffceKK............................',
      '..........................................................................................................................................................KKKfffffcfffeeecKK............................',
      '.......................................................................................................................................................KKKffcfffffeceeeeeceKK...........................',
      '...................................................................................................................................................KKKKKfffffcfeeeeceeeeeceKK...........................',
      '.................................................................................................................................................KKKfffcfffffceeeeeceeeeeecKK...........................',
      '.............................................................................................................................................KKKfcfffffcfeeeeceeeeeeceeeeecKKK..........................',
      '.........................................................................................................................................nKKKKfffcfffeeceeeeeeceeeeeceeeeeceKK..........................',
      '................................................................................................................................nnnnnnnKKKKKfffffcffeeeeceeeeeceeeeeceeeeeecKK..........................',
      '..........................................................................................................................nnnnnnnnnnKKKffffcfffeeeceeeeeceeeeeceeeeeeceeeeeceKK.........................',
      '....................................................................................................................nnnnnnnnnddddKKKKcffffffceeeeeceeeeeceeeeeeceeeeeceeeeeceKK.........................',
      '...............................................................................................................nnnnnnnndddddldKKKKKfffcffffeceeeeeceeeeeeceeeeeceeeeeceeeeeecKKIII......................',
      '...........................................................................................................nnnnnnngddddddddKKKffcfffffceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeecKKKDIyn....................',
      '.......................................................................................................nnnnnngggddddddddKKKfffffcffeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceKKMIDnnn..................',
      '....................................................................................................nnnnnggglddddddddKKKKfcfffffceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeccKKBEInnnnn................',
      '................................................................................................nnnnngggggddddddddKKKfffffcffeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecceeeeecKKKEztnnnnn...............',
      '.............................................................................................nnnnngggggddddddddKKKffcfffffeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceKKEEzddnnnnn.............',
      '..........................................................................................nnnnngggggddlddddKKKKKfffffcfeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeccKKCCCdddnnnnn............',
      '.......................................................................................nnnnggggggdddddlddKKKfffcfffffceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeebbbKKKxHmddddnnnn...........',
      '....................................................................................nnnngggggddddddddKKKfcfffffcfeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceebbbbbKKCCslddddnnnn..........',
      '..................................................................................nnnnlgggddddddddKKKKKffcffffeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeebbbbbbbbbbKKCHHldddddnnnn.........',
      '...............................................................................nnnnggglddddddddKKKfcfffffcffeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeecbbbbbbbbffffiKKKxxsldaaannnn.........',
      '............................................................................nnnnggggddddddddKKKffffcfffeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeeceeeebbbbbbbfifffffifKKCCqaaaaaannnn........',
      '..........................................................................nnnngggddddddddKKKKKffffffceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecbbbbbbbbbfffifffffiiKKBBGaaaaaagnnnn.......',
      '........................................................................nnngggddldddddKKKffffccffffeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceebbbbbbbbfifffffiifffffiKKKBBhaaggggnnnn.......',
      '......................................................................nnnggdddddlddKKKfcfffffcceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeecbbbbbbbffffiffffffifffffifKKBBtgggggggnnn.......',
      '...................................................................nnnngddddddddKKKKfffccffeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceebbbbbbbbbfffffffifffffifffffifKKEJEgggggddnnnn......',
      '.................................................................nnnnddddddddKKKffcfffffceeeeecceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeebbbbbbbbfffffifffffifffffiffffffiKKzEEpgdlddddnnn......',
      '...............................................................nnnndddddddKKKfffffcffeeeceeeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceebbbbbbbbffifffffifffffiffffffifffffifKKECsddlddddnnn......',
      '.............................................................nnnndddddKKKKffcfffffceeeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecbbbbbbbbffffifffffiifffffifffffifffffifKKCCCddlddddnnn......',
      '...........................................................nnnndddddKKKKffffcfffeeeceeeeeceeeeecceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeecbbbbbbbbbffifffffiifffffifffffifffffiifffffiKKKxHmddddddnnn......',
      '.........................................................nnnnddddKKKffcfffffeceeeeeceeeeeceeeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeebbbbbbbifffffiifffffifffffifffffiifffffifffffifKKCCsddddddnnn......',
      '........................................................nnnddKKKKffffffcfeeeeceeeeeceeeeecceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceebbbbbbbbffifffffifffffifffffiffffffifffffifffffifKKCHxddddaannn......',
      '......................................................nnndKKKKKffcfffffceeeeeceeeeecceeeeeceeeeecceeeeeceeeeeceeeeeeceeeeeceeebbbbbbbbfbfffffifffffiffffffffffffifffffifffffiffffffiKKKHCmaaaaannn......',
      '....................................................nnnKKKfcfffffcffeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeeeceeeeeceeeeecbbbbbbbbffffifffffiffffffffffffifffffifffffiffffffifffffifKKBBqaaaaannn......',
      '..................................................nnKKKffffcfffeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeeeceeeeeceeeeeceeeebbbbbbbbifffffifffffiifffffifffffifffffiffffffifffffifffffifKKBvBaaaalnnn......',
      '.................................................KKKKKfffffcfeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeecceeeeeceeeeeceeeeeebbbbbbbbffffifffffiifffffifffffifffffiffffffifffffifffffiffffffiKKGBGaggggnnn......',
      '..............................................KKKffffcfffefeceeeeeceeeeeceeeeeeeeeeeeceeeeeceeeeeeceeeeeceeeeeeceebbbbbbbbfifffffiifffffifffffifffffiifffffifffffifffffiffffffifffffoKKKEEtggggnnn......',
      '...........................................KKKfcffffffceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeeeeeeeceeeeeeceeeeecbbbbbbbfffffifffffifffffifffffiifffffifffffifffffiffffffifffffifjjjjojKKEEzgggnnn.......',
      '........................................KKKKffffcffeeeceeeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeecceeeeeceebbbbbbbbbfifffffifffffifffffiifffffifffffifffffiffffffifffffifffjjojjjjjKKKKEJEmddnnn.......',
      '.....................................KKKffcfffffceeeeeceeeeecceeeeeceeeeeceeeeecceeeeeceeeeeceeeeecceeeeebbbbbbbbfffffifffffiffffffffffffifffffifffffiffffffifffffifffffiffjjjjojKKKKKKKKFCsddnn........',
      '..................................KKKfffffcffeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeeceeeeecceeeeeceeebbbbbbfffifffffiffffffffffffifffffifffffiffffffifffffifffffifffjjjojjjjjoKKKKKCCCxFCxdnnn........',
      '..............................KKKKKfcfffffceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeebbbbbbbbbffffiffffffifffffifffffifffffiffffffifffffifffffiffffffojjjjjojKKKKKKKHxxCHCHLCCmnnn........',
      '............................KKKfffffcfffeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeecebbbbbbbbfffifffffiifffffifffffifffffiifffffifffffifffffiffffffiffffjojjjjKKKKKKKHxCCKKKxCCxCCynn.........',
      '........................KKKKffcfffffeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeeeeeeeceeeeeceeeeecbbbbbbifffffiifffffifffffifffffiifffffifffffifffffiffffffifffffojjjjjojjjKKKKKCCCHCCHKKKCCCCxCDnn.........',
      '.....................KKKKKfffffceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeeeeeeeceeeeeceeeeecebbbbbbbbbbfiifffffifffffifffffiifffffifffffifffffiifffffifffffiffjjjojjjjKKKKKKKHxxHxCCCCCKKKCCHCHIIn..........',
      '..................KKKKfffcfffffceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeceeeebbbbbbbbifffffiifffffiffffffifffffifffffifffffiffffffifffffifffffijjjjjjoKKKKKKKCCHCHCHxCCxCCFCCCxCBvMI...........',
      '.................KfcfffffcfeeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeeceeeeecceeeeecebbbbbbbfffiffffffiffffffifffffifffffifffffiffffffifffffifffffiffjjjjojjjjKKKKKKFCCCxCCxCCHCHCCHCFCBBBBDMD...........',
      '.................KKcfffeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeeceeeeecceeeeeceeebbbbbbbbbbfffffifffffiifffffifffffiffffffffffffifffffifffffifffffjojjjjjoKKKKKKKCCHFCHCCCCxHxxHxCCCBvGBBGIMI............',
      '..................KcffeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeeeecbbbbbbbbffffifffffifffffiifffffiffffffifffffifffffifffffiffffffifjjjjojjjKKKKKKCxCCCCCFxCCCHCHCHCCxBBvBBBBBIDD.............',
      '..................KeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeebbbbbbbbfifffffifffffiffffffifffffiifffffifffffifffffiffffffifffffojjjjjojKKKKKKHCHCCCCxCCCCCxHxxHxFGGBGBBBBvEIDy.............',
      '..................KeceeeeeceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecebbbbbbbbfffifffffiffffffifffffiifffffifffffifffffiifffffifffffijjjjjojjjKKKKKKCxHxxCCCCHCCHCCHxCCCBBvBFvBBBEJEzynn..............',
      '...................KceeeeeeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeeeeeebbbbbbbbfifffffiffffffifffffifffffiifffffifffffiifffffifffffiffffjoojjjjKKKKKKKCCHCCCCCCxFCxCCCCxHCBGBBGBBFBzEEttgnnn...............',
      '...................KeceeeeeceeeeeceeeeeeceeeeeceeeeeceeeeecceeeeebbbbbbbbffffiffffffifffffifffffiffffffifffffiifffffifffffifffffiffjjjjojjjKKKKKKCCCxHxCHCCHHFCCxCCxBBBBBvBBBEJEztgggnnn................',
      '...................KeceeeeeceeeeeeceeeeeceeeeeceeeeecceeeeeceeebbbbbbbbiffffffifffffifffffiffffffifffffiifffffifffffifffffifffjjjojjjjKoKKKKKFCHCxHxCCCCCxCCxCLCGGBBGvvGvBEEEtpgggggnnn.................',
      '....................KceeeeeeceeeeeceeeeeceeeeecceeeeeceeeebbbbbbbbbbffffifffffifffffiffffffifffffifffffiifffffifffffiffffffojjjjjojKKKKKKKCCxFCCCCHCCHCCCCCCCvBBvBBBBGBLFEzpgggggddnnn..................',
      '....................KeceeeeeceeeeeceeeeecceeeeeceeeeecebbbbbbbbfffifffffifffffiifffffifffffifffffiffffffifffffiffffffifffjjojjjjjKKKKKKCHCCCCxFCxCCCCCxCHCBGBGBBvGvvJzEtqgggggddddnnn...................',
      '....................KeceeeeeceeeeeeceeeeeceeeeeceeeeecbbbbbbbfffffifffffiffffffifffffifffffiffffffifffffiifffffifffffojjjjjojKKKKKKKCCxCCCCHCHHCxHxxHxCFBBvBBvGBGEJEtpgglggddddddnnn....................',
      '.....................KceeeeeeceeeeeceeeeeceeeeeecbbbbbbbbfbfifffffiffffffifffffifffffiffffffifffffifffffiifffffiffjjjojjjjKKKKKKKCCxCKKKCCxCCxCCHCHCGBBBABBBBBEzzzggggggddddddddnnn.....................',
      '.....................KeceeeeeceeeeeceeeeeeeeeebbbbbbbbifffffiffffffifffffifffffiffffffifffffifffffiffffffifffffiojjjjjoKKKKKKKCCCCHCCKKKCCCCCxHxxGvBBBBGFBGEEEtpgggggddddddddddnnn......................',
      '.....................KeceeeeeceeeeeeceeeeecebbbbbbbfffiffffffifffffifffffiffffffifffffifffffiffffffifffffiifjjjjojjjjKKKKKKCCxHxxCCCCKKKLCCHCHBBBBvBBvBBEEztgggggdldddddddddddnnn.......................',
      '....................nnKceeeeeeceeeeeceeebbbbbbbbbifffffifffffifffffiffffffifffffifffffiffffffifffffifffffoojjjjjoKKKKKKKCCCHCHCHCCxCCxCCFCxGvvGBBGGBGEzEtgggggddddlddddddddddnnn........................',
      '....................nnKcceeeeeceeeeecbbbbbbbbffffifffffifffffiffffffifffffifffffiffffffifffffifffffifffjjjojjjKKKKKKKCCFCCxHxxHxCHHCHCCHBvBBBBBvBBAEztpggggdddddddldddddddddnnn.........................',
      '...................nnnKeceeeeeceeeebbbbbbbfifffffifffffiifffffifffffifffffiffffffifffffifffffifffffjojjjjjojKKKKKKCCCHCCLCCCCCCxCCxCCBBBBBGBBGBEEzugggggdddddddddddddddddddnnn..........................',
      '..................nnnaaKceeeeecbbbbbbbbbfffifffffiifffffifffffifffffiffffffifffffifffffiffffffijjjjjojjjKKKKKKCxCxCCCCCxHxCHCCHHCCBvBBvBBBBEzJttgglggddddddddddddddddddddnnn............................',
      '..................nnnggKeceebbbbbbbbfifffffiffffffifffffifffffiffffffifffffifffffiffffffifffffojjjjjKKKKKKKHCCHHCHCxCCxCCCCCxCCvBGFGGBBGzzJttgggggddddddddddlddddddddaaannn.............................',
      '.................nnngggKecbbbbbbbfffffffffffifffffifffffiffffffifffffifffffiffffffifffffijfjjjojjjjKKKKKCCCCxCCxCCCHHCCHCxHxBBBBvBFvBEEEztgggggdddddddddddddldddddaaaaannn..............................',
      '.................nnngggdKbbbbbbfffffffifffffifffffiffffffifffffifffffiffffffifffffifffjjojjjjjKKKKKKKHCCHCCCCCCCxCFxCCCCBBGBBGBBBBEEEtpggggglddddddddddddddddldaaaaaannn................................',
      '................nnngddddKbbfffffifffffifffffiffffffifffffifffffiffffffifffffifffffifjjjjjojKKKKKKKCxCCCCCxCHCCHCHCFxHvvGvBBBBBvEJEttgggggdddldddddddddddddddaaaaaaaannn.................................',
      '................nnndddddKfifffffifffffiifffffifffffifffffiffffffifffffifffffifffjjjojjjjjoKKKKKCHLCCHxxCCCCCCxCCxHBGBGBGvBBvFEEtpgggggddddddlldddddddddddaaaaaaaaaann...................................',
      '...............nnndddddddKifffffiifffffifffffifffffiffffffifffffifffffiffffffojjjjjojKKKKKKKCxCCxCFCCHCHCCHxCCCBvGvvGvBBGEJEupgggggdddddddddddddddddddlaaaaaaaaagnnn....................................',
      '...............nnndddddddKiifffffifffffifffffiifffffifffffifffffiffffffiffjjjojjjjKKKKKKKCCHCCCCxHxxHxCCCCCCFGBBGBBBBvEEztpglgggdddddddddddddddddddaaaalaaaaagggnn......................................',
      '...............nnndddddddKfifffffifffffiffffffifffffifffffiffffffifffffijjjjjojjKKKKKKCCCCxCCCHCHCHCCxCCxBBBFBBvBBBJEEtpgggggdddddddddldddddddddaaaaaaalaaggggnnn.......................................',
      '...............nnnddddddaaKifffffiffffffifffffifffffiffffffifffffiffjjjojjjjKKKKKKKCHxCxCCCCCxHxxHxCHHBGBBBBABBBEEztgggggdddddddddddddlddddddaaaaaaaaaagggggnnn.........................................',
      '..............nnnddddalaaaKfffffffifffffifffffiffffffifffffifffffojjjjjjoKKKKKKKxHxCCKKKCCHCACCCCCxBBvBBBBGBFJEzzggggglddddddddddddddddlddaaaaaaaaaggggggggnnn..........................................',
      '..............nnndaaaaalaaKfifffffifffffiffffffifffffifffffifffjjjojjjjKKKKKKCCCCCxCCKKKCCCCFHCCGBBBBBvBBvEEztgggggdddlddddddddddddddddaaaaaaaaaglgggggggnnn............................................',
      '..............nnnaaaaaalaggKifffffiffffffifffffifffffifffffjojjjjjojKKKKKKxLACHCCHHCHKKKCxCCFBBvGvBGBBLJEztgggggdddddddlddddddddddddaaaaaaaaagggglgggggnnn..............................................',
      '..............nnnaaaaagggggKiifffffifffffifffffiffffffijjjjjojjjKKKKKKCCCxCCFCCxCCxCCCHHCCGBvGvBBBBEzEApgggggddddddddddddddddddddaaaaaaaaaggggggglggdnnnn...............................................',
      '..............nnnaaggggggggKfifffffifffffiffffffifffffojjjjjoKKKKKKKCCCHCCHCFCCCCCCxCCxBBBBBBGBBJEEztglgggdddddddddddddddddddaaaalaaaaaggggggggggddnnnn.................................................',
      '..............nnnlgggggggddKKifffffiffffffifffffijjjjjojjjjKKKKKCCCxCCxCCCCCxHCCHCCHBBAGvvGvBEEEtpgggggdddddddddddddddddddaaaaaaalaaggggggggggdddnnnn...................................................',
      '..............nnnlggggddddddKiffffffifffffifffjjojjjjjKKKKKKKCCCCHCHHCxHxxHxCCCCBvBBBBLBGGEzEzpgggggdddddddddddddldddddaaaaaaaaaagggggggggglddddnnn.....................................................',
      '..............nnnngdddddddddKfifffffifffffiffjjjjojKKKKKKKCCCCCCxCCxCCLCHCHCCBvBBBBBBvBEzEttgggggddddddddddddddddlddaaaaaaaaaaggggggggggdddldnnnn.......................................................',
      '..............nnnndddddddddlKKifffffifffjjjojjjjjoKKKKKCHCHCCCCCCCCxHxAHxCBBBGBBGBBBEEEtpgggggddlddddddddddddddddaaaaaaaaaalgggggggggddddddnnnn.........................................................',
      '...............nnndddddddddldKiffffffojjjjjojKKKKKKKHxAHxCCCCCCCHCCHCCFBvBBvBBBBBEzJtpgggggddddddlddddddddddddaaaaaaaaaaggglgggggddddddddnnnn...........................................................',
      '...............nnnndddddddddlKfifffjjojjjjKKKKKKKHCHCHFHxCCxCCCCCCxCBBBGGBGBBBEzFtpgggggdddddddddddddddddddlaaaaaaaaagggggglggdddddddddnnn..............................................................',
      '...............nnnndddddddaaaKfojjjjjojjKKKKKKCCxHxxHxFCHCHCCHCxCBBBBvGvvGvEEEtpllggddddddddddddddddddddaaalaaaaaagggggggggddddddddddnnn................................................................',
      '................nnnndddaaaaaaaKojjjjKKKKKKKCCHCCCCCCCxCCxCCCCCBBLBBGBBBBEEztgggggddddddddddddddddddddaaaaaalaaagggggggggddddddddddnnnn..................................................................',
      '................nnnnalaaaaaaaaKjoKKKKKKExCCCCCCxHCCCHHCCCxCBvBBBFBvGvEJztpggggdddddddddddddlddddddaaaaaaaaagggggggggglddddddddddnnn.....................................................................',
      '.................nnnnalaaaagggKKKKKKKHCHCxCCxCCCFCxHxxHCBGGBBGvvGAEEztgggggddddddddddddddddldddaaaaaaaaaggggggggggdddldddddddnnnn.......................................................................',
      '..................nnnnlagggggggKKKxCCxKKKHHCCHCxLxCCCBBvBBvBBBJJEztgggggddlddddddddddddddddlaaaaaaaaalgggggggggdddddddldddnnnn..........................................................................',
      '...................nnnngggggggddldsCCCKKKxCCCCCCLFBGBBBBBBBzEEttgggggddddddldddddddddddddaaaaaaaaaggglggggggdddddddddddnnnnn............................................................................',
      '....................nnnngggdddddldmCHCKKKxHxxHxBBBBBvBGBEJFztgggggdddddddddldddddddddlaaaaaaaaagggggglgggdddddddddddnnnnn...............................................................................',
      '.....................nnnndddddddlddCxCCxCHCHBGBBBvBBBEEEtpglgggdddddddddddddddddddaaalaaaaaaggggggggggdddddddddldnnnnn..................................................................................',
      '......................nnnnnddddddddsCCCCvBFvBBBBGBEJEttggggldddddddddddddddddddaaaaaalaaaggggggggggdddddddddddnnnnn.....................................................................................',
      '.......................nnnnnnddddddmCBGBBBFvGvvJzEtpgggggddddddddddddlddddddaaaaaaaaaaggggggggggddddddddddnnnnnn........................................................................................',
      '.........................nnnnnddddaaBvBBBGBLEJEtpgggggdddddddddddddddldddaaaaaaaaaaggggggggggddldddddddnnnnn............................................................................................',
      '...........................nnnnnnaaaqBBBvJzzzggggggddldddddddddddddddlaaaaaaaaaagggggggggdddddddldnnnnnn................................................................................................',
      '.............................nnnnnnahBJzEtpgggggdddddldddddddddddddaaaaaaaaaagglggggggddddddddnnnnnnn...................................................................................................',
      '...............................nnnnnnDypggggdddddddddlddddddddddaaaaaaaaaagggggllggddddddnnnnnnn........................................................................................................',
      '..................................nnnnnnnnnddddddddddddddddddaalaaaaaaagggggggggddnnnnnnnnn.............................................................................................................',
      '......................................nnnnnnnnnnnnddddddddaaaaalaaagggggggnnnnnnnnnnnn..................................................................................................................',
      '...........................................nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn.........................................................................................................................',
      '....................................................nnnnnnnnnnnnnnnn....................................................................................................................................',
      '........................................................................................................................................................................................................'
    ]
    ]
  },
  pz_pileta: {
    colores: { a: 0x0d3d4a, b: 0x11596a, c: 0x178093, d: 0x22a7b5, e: 0x313b2e, f: 0x3d4a3a, g: 0x45523f, h: 0x4fd0d2, i: 0x56664f, j: 0x596950, l: 0x6f8364, m: 0x728365, n: 0x8a9a86, o: 0x8ea47e, p: 0x9ff6ef, q: 0xa8f0ea, s: 0xb8c4b0, t: 0xd8fff8, u: 0xdfe8d8 },
    nombre: 'Pileta con estatua de perrito (mismo tamaño que hoy: radio 108)',
    profundidad: 1,
    choque: {
      forma: 'circulo',
      r: 108
    },
    sombra: {
      dx: 3,
      dy: 4,
      rx: 37,
      ry: 37,
      fuerza: 0.3
    },
    tamano: '73 x 73 px de dibujo (219 x 219 en pantalla)',
    cuadros: [
    [
      '...............................KKKKKKKKKKK...............................',
      '...........................KKKKKKmmmmmmmKKKKKK...........................',
      '........................KKKjjjjjjooolllomjjjjjKKK........................',
      '.....................KKKjjjjllllllllllllolllljjjjKKK.....................',
      '...................KKKjjllllllllllllllllllllllllljjKKK...................',
      '.................KKKjjlloollllllllllallllllllllllllggKKK.................',
      '................KKjjllllooollaaaaaaadaaaaaaalllliiiiiggKK................',
      '...............KKmllllllooaaadddddddddddddddaaaiiiiiiiigKK...............',
      '.............KKmjllllllaaaddcdcdcdddcdcdcdddcdcaaaiiliiiggKK.............',
      '............KKmjlllllaacdddddcdcdcdddcdddddddcdcdcaalliiiggKK............',
      '...........KKmolllllaacdddddcdchhhhhhhhhhhcdcdcdcdcaaliiiifeKK...........',
      '..........KKmooollaadcccdddhhhhhhhhhhhhhhhhhhhdcdddddaaiiiifeKK..........',
      '.........KKjlllooacdccccchhhhhhccdddcdcdcdhhhhhhcdddddcaiiiifeKK.........',
      '........KKjlllloaddddcdhhhhcdcccccdddddddcdcdchhhhdddddcaiiiffeKK........',
      '........KjllllladdddchhhhdcccccccdcdddcdcdcccdcdhhhhddcccaiiiiigK........',
      '.......KmjllllacddddhhhcdddcccccdcdcdddcdcdcdcdcdchhhddcdcaiiiiggK.......',
      '......KKmllloaccccdhhhcdcdccccccpcppcppdpcccccccccchhhcdcccaillljKK......',
      '.....KKmooooaddcdchhhcdcdcdccpdpdcdcdcdcdpdpccccccdchhhcccccailllgKK.....',
      '.....KmooooacdcddhhhcccccdccpccdcdcccccdcdccpccccccddhhhcccccailllgK.....',
      '....KKmooooadcddqhhcccccdppcccdcdddcccccdcccccppccddddhhhcccdaiilljKK....',
      '....KmooooadccchhhcccccpcccccccccdcccccccccccccccpcdcdchhhcdcdaiiiigK....',
      '...KKmoooaaddchhhcdcdccpdcdccccccchhhdhcccccccdccpccdcddhhhdddaafffeKK...',
      '...KjloooaddcdhhcccdcccccdccccdddhhhdddddhdccdcccccccccddhhdddcaffffeK...',
      '...KjlooaddddhhcdcddppccdcctcdhdhhcccccdhdhhdddccccppcdcddhhdddcafffeK...',
      '..KjloooadddchhdcdcdcccccccddddcccccccccccdhhhcdcccccccccdhhddcdaffffeK..',
      '..KjooooaddchhdddddpdcdcccdddcccccccctcccccthhhcccccdpccccdhhddcaffffeK..',
      '..KmoooaddddhhcccdcpcdcccdddccccccppcppcccccchhhcccddpccccchhdcdcafffeK..',
      '.KmmoooadddhhcccdcdddddchddccccppcccctccppcccchhhcdcdddccccchhdddaiifeeK.',
      '.KmooolacddhdcccccpdcdccddccccccccccccccccccccchdccdcdpcccccdhcddaiiifeK.',
      '.KmoooaddddhhccccpdcdcchhccccpccccKKKKKccccpcccchhdcdcdpdcdchhddddaiffeK.',
      '.KmoooadcdchhdccccccccdddcccccbcKooollllKcccccccdhdccdcdcdcdhhcccdafffeK.',
      'KKjoooacdchhdddccpccccddcccpcccKooollllllKcctpcctdhcccdpdddcdhhcdcafffeKK',
      'KKjlooadccdhcdccpcccccddcccpccKoKKllllKKliKccpcccddccccdpdcdchdcccafffeKK',
      'KglllladdchhdddcccdcccddccccccoKssKllKnuKiiccccccdhcccdddcdcchhcdcaffffeK',
      'KglllladccdhcdccpccdchdcccpccKoKsssKKnnnKiiKccpcccdhcccdpdccchhdddaffffeK',
      'KglllladdchhdddcpcdcdhhcdcpccKoKsussnnnuKiiKccpccchdccdcpcccdhhdddaffffeK',
      'KjlllacdcchhccccccccchhtcccccKllKssnnnnnKiiKccccccdhcccdccccchhdddcafffeK',
      'KjllllacdchhccdcpcccchhcdcpccKllKsnnnnnnKiiKccpccchdccdcpcccdhhdddaffffeK',
      'KjlllladcdhhcdcdpdccchhdcdpccKlllKnnnnKiiiiKccptccthcccdpcccchhdddaffffeK',
      'KgllolacddhhdddcdcdcdchhdccccclllKnKiKnKiiicccccchhcccdcdddcdhhdddaffffeK',
      'KKjoolaccdhhddcdpccdcchhcccpccKlliKiiiKiiiKccpccchdccccdpdcdchhdcdaiffeKK',
      'KKjlolacddqhdddddpdcdthhcccpcccKiiiiiiiiiKcctpcccdhcdcdpdddddhhdddaiffeKK',
      '.KjllladdddhhdcdddcdccdhdcccccccKiiiiiiiKcccccccdhdccdcdcdcchhcdddaiffeK.',
      '.KjllladdddhhcdddpdcdccdhccccpccccKKKKKccccpcccchhdcdddpdcdchhddddaffigK.',
      '.KjlilladddhhccdcdpdccccddccccccccccccccccccccchdccdcdpdcdcdhhdddafffigK.',
      '.KjgiiladddhhcccdcdddccchdhccccppcccccccppccdchhhcccdcdcddddhhdddafffegK.',
      '..KgiiladdddhhcccdcpccccchdhccccccppcppccccdchhhcccccpcccddhhddddafffeK..',
      '..KjiilladddhhccccdpdccccchhhcccccdcccccccdchhhcccccdpcccddhhdddaffffeK..',
      '..KjlliiadddchhcccccccccccchdhdccccccccccchhhhctcccdcccccchhcccdaffffeK..',
      '...KjliiaddddhhcccccppccccdcdhhdhhdccccthhhhdcdcdcdppccccchhccddafffeK...',
      '...KjliiiaddddhhcccccccccccdcddhdhdhdddhhhhdcdcccdcdcdccchdccdcaffffeK...',
      '...KKgiiiaadddhhhcccccdpccccdddccchddddcccdddcccdpdddddchhhcddaafffeKK...',
      '....KgiiiladdddhhhcccccpcccccdcccccccccccccdcccccpcdcdchhhcdddaffffeK....',
      '....KKgiiiladdddhhhcccdccppcdcdccccccctcccdddcppdcdcdchhhcdcdaffffeKK....',
      '.....KgiiiiacdccchdhccccccccpdcccccccccccccdpcccccccchhhcdcddaffffeK.....',
      '.....KKgiiiiacccdchhhcccdcdcdpdpdccccccccpdpdccccccchhhcdcdcaffffeKK.....',
      '......KKgiiiiaccccchhhcdcdcdcccdpcppcppcpccdccccccchhhcdcccaffffeKK......',
      '.......KggiiiiacdcddhhhddddcdcdcdcdcccdcdcdcdccccchhhddcdcaffffeeK.......',
      '........KgiiiiiadddddhhhhdddcdcccdcdcccdddccccccdhhhddcccafffffeK........',
      '........KKgiiiiiaddddddhqhhcdcdcdddddcdddddcdchhhhdddddcafffffeKK........',
      '.........KKgiffiiadddddddhhhhhhdcdddcccdcdhhdhhhcdcdcccafffffeKK.........',
      '..........KKgfffiiaadddddddhhhhhhhhhhhhhhhhhhhdcdddcdaafffffeKK..........',
      '...........KKefffiiiaaddddcccdchhhhhhhhhhhcccccddddaaffffffeKK...........',
      '............KKeefffiiaaddcdcdcdcdddddddddcdcccddddaafffffeeKK............',
      '.............KKeefffiiiaaacccccdcdcdcdddcdcccccaaaffffffeeKK.............',
      '...............KKeffiiiiffaaacdcdcdddddddcdcaaaffffffffeKK...............',
      '................KKggiiiffffffaaaaaaadaaaaaaafffffffffeeKK................',
      '.................KKKggffffffffffffffaiiffffffffffffeeKKK.................',
      '...................KKKeeiiiffffffffffiiffffffffffeeKKK...................',
      '.....................KKKgggefffffffffffffffffeeeeKKK.....................',
      '........................KKKeeeegefffffffeeggggKKK........................',
      '...........................KKKKKKeeeeeeeKKKKKK...........................',
      '...............................KKKKKKKKKKK...............................'
    ]
    ]
  },
  pz_glorieta: {
    colores: { a: 0x6b2e1a, b: 0x7e361e, c: 0x833a20, d: 0x9a4426, e: 0x9a4728, f: 0xaa5631, g: 0xb5532f, h: 0xc8653a, i: 0xe0b050 },
    nombre: 'Glorieta de techo octogonal',
    profundidad: 11,
    choque: {
      forma: 'circulo',
      r: 57
    },
    sombra: {
      dx: 5,
      dy: 7,
      rx: 20,
      ry: 18,
      fuerza: 0.4
    },
    tamano: '41 x 41 px de dibujo (123 x 123 en pantalla)',
    cuadros: [
    [
      '.........................................',
      '............KKKKKKKKKKKKKKKKK............',
      '...........KdhhhhhhhhhhhhhhhbK...........',
      '..........KddhhhhhhhhhhhhhhhbbK..........',
      '.........KddddhhhhhhhhhhhhhbbbbK.........',
      '........KddddcfffffffffffffabbbbK........',
      '.......KddddcddhhhhhhhhhhhbbabbbbK.......',
      '......KddddcdddhhhhhhhhhhhbbbabbbbK......',
      '.....KddddcdddddhhhhhhhhhbbbbbabbbbK.....',
      '....KddddcddddddhhhhhhhhhbbbbbbabbbbK....',
      '...KddddcddddddcfffffffffabbbbbbabbbbK...',
      '..KddddcddddddcddhhhhhhhbbabbbbbbabbbbK..',
      '.KddddcddddddcdddhhhhhhhbbbabbbbbbabbbbK.',
      '.KggdcddddddcdddddhhhhhbbbbbabbbbbbabggK.',
      '.KgggedddddcddddddhhhhhbbbbbbabbbbbegggK.',
      '.KgggegggdcddddddcfffffabbbbbbabbggegggK.',
      '.KgggeggggedddddcddhhhbbabbbbbeggggegggK.',
      '.KgggeggggeggddcdddhhhbbbabbggeggggegggK.',
      '.KgggeggggeggggeddddibbbbeggggeggggegggK.',
      '.KgggeggggeggggeggdiiibggeggggeggggegggK.',
      '.KgggeggggeggggeggiiiiiggeggggeggggegggK.',
      '.KgggeggggeggggeggbiiidggeggggeggggegggK.',
      '.KgggeggggeggggebbbbiddddeggggeggggegggK.',
      '.KgggeggggeggbbabbbhhhdddcddggeggggegggK.',
      '.KgggeggggebbbbbabbhhhddcdddddeggggegggK.',
      '.KgggeggbbabbbbbbafffffcddddddcddggegggK.',
      '.KgggebbbbbabbbbbbhhhhhddddddcdddddegggK.',
      '.KggbabbbbbbabbbbbhhhhhdddddcddddddcdggK.',
      '.KbbbbabbbbbbabbbhhhhhhhdddcddddddcddddK.',
      '..KbbbbabbbbbbabbhhhhhhhddcddddddcddddK..',
      '...KbbbbabbbbbbafffffffffcddddddcddddK...',
      '....KbbbbabbbbbbhhhhhhhhhddddddcddddK....',
      '.....KbbbbabbbbbhhhhhhhhhdddddcddddK.....',
      '......KbbbbabbbhhhhhhhhhhhdddcddddK......',
      '.......KbbbbabbhhhhhhhhhhhddcddddK.......',
      '........KbbbbafffffffffffffcddddK........',
      '.........KbbbbhhhhhhhhhhhhhddddK.........',
      '..........KbbhhhhhhhhhhhhhhhddK..........',
      '...........KbhhhhhhhhhhhhhhhdK...........',
      '............KKKKKKKKKKKKKKKKK............',
      '.........................................'
    ]
    ]
  },
  pz_arco: {
    colores: { a: 0xc8c8c8, b: 0xf4f0e6 },
    nombre: 'Arco de fútbol (sin choque)',
    profundidad: 2,
    choque: null,
    tamano: '5 x 21 px de dibujo (15 x 63 en pantalla)',
    cuadros: [
    [
      'bbbbb',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'Kb.a.',
      'Kb...',
      'bbbbb'
    ]
    ]
  },
  pz_cancha_lineas: {
    colores: { a: 0xd8d0b4 },
    nombre: 'Líneas de la cancha (se pintan en el suelo)',
    enSuelo: true,
    choque: null,
    tamano: '160 x 96 px de dibujo (480 x 288 en pantalla)',
    cuadros: [
    [
      '................................................................................................................................................................',
      '................................................................................................................................................................',
      '..aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..aaaaaaaaaaaaaaaaa.............................................................a.............................................................aaaaaaaaaaaaaaaaa.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a..........................................................aaaaaaa..........................................................a...............a.',
      '..a...............a........................................................aa...a...aa........................................................a...............a.',
      '..a...............a......................................................aa.....a.....aa......................................................a...............a.',
      '..a...............a.....................................................a.......a.......a.....................................................a...............a.',
      '..a...............a....................................................aa.......a.......aa....................................................a...............a.',
      '..a...............a...................................................a.........a.........a...................................................a...............a.',
      '..a...............a...................................................a.........a.........a...................................................a...............a.',
      '..a...............a..................................................a..........a..........a..................................................a...............a.',
      '..a...............a..................................................a..........a..........a..................................................a...............a.',
      '..a...............a.................................................a...........a...........a.................................................a...............a.',
      '..a...............a.................................................a...........a...........a.................................................a...............a.',
      '..a...............a.................................................a...........a...........a.................................................a...............a.',
      '..a...............a.................................................a...........a...........a.................................................a...............a.',
      '..a...............a.................................................a...........a...........a.................................................a...............a.',
      '..a...............a.................................................a...........a...........a.................................................a...............a.',
      '..a...............a.................................................a...........a...........a.................................................a...............a.',
      '..a...............a..................................................a..........a..........a..................................................a...............a.',
      '..a...............a..................................................a..........a..........a..................................................a...............a.',
      '..a...............a...................................................a.........a.........a...................................................a...............a.',
      '..a...............a...................................................a.........a.........a...................................................a...............a.',
      '..a...............a....................................................aa.......a.......aa....................................................a...............a.',
      '..a...............a.....................................................a.......a.......a.....................................................a...............a.',
      '..a...............a......................................................aa.....a.....aa......................................................a...............a.',
      '..a...............a........................................................aa...a...aa........................................................a...............a.',
      '..a...............a..........................................................aaaaaaa..........................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..a...............a.............................................................a.............................................................a...............a.',
      '..aaaaaaaaaaaaaaaaa.............................................................a.............................................................aaaaaaaaaaaaaaaaa.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..a.............................................................................a.............................................................................a.',
      '..aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.',
      '................................................................................................................................................................'
    ]
    ]
  }
};

// Auto visto desde arriba, 14 x 22 (frente hacia ARRIBA, igual que DIBUJO_AUTO).
// C = carrocería, c = techo, D = brillo, V = vidrio, v = reflejo, L = focos, R = luces traseras, N = ruedas
const PZ_DIBUJO_AUTO = [
  '..KKKKKKKKKK..',
  '.KCLCCCCCCLCK.',
  'KCCCCCCCCCCCCK',
  'KCCCCCCCCCCCCK',
  'KCDDDDDDDDDDCK',
  'KCKVVVVVVVVKCK',
  'KCKVvVVVVVVKCK',
  'KcKVVvVVVVVKcK',
  'KcKKKKKKKKKKcK',
  'KccccccccccccK',
  'KcccDDDDDcccKK',
  'KccccccccccccK',
  'KccccccccccccK',
  'KcKKKKKKKKKKcK',
  'KcKVVVVVVVVKcK',
  'KCKVvVVVVVVKCK',
  'KCKKKKKKKKKKCK',
  'KCCCCCCCCCCCCK',
  'KCCCCCCCCCCCCK',
  'NCRCCCCCCCCRCN',
  '.KCCCCCCCCCCK.',
  '..KKKKKKKKKK..'
];
// Colores de los autos [carrocería, techo, brillo] (los mismos 4 de la paleta de la plaza + un brillo)
const PZ_COLORES_AUTOS = [
  [0xb3261e, 0x7a1813, 0xe0584a],
  [0x1f4e9c, 0x153566, 0x4f7fcf],
  [0xd8d8d8, 0xa8a8a8, 0xf4f4f4],
  [0xe0b000, 0x9c7a00, 0xf4d040]
];


// Los 4 autos nuevos (pz_auto_0 ... pz_auto_3), con el mismo choque que hoy (CHOQUE_AUTO 42 x 66)
PZ_COLORES_AUTOS.forEach((c, i) => {
  PZ_OBJETOS['pz_auto_' + i] = {
    nombre: 'Auto estacionado ' + i,
    colores: { C: c[0], c: c[1], D: c[2], V: 0x2a4a6a, v: 0x6f9ac0, L: 0xfff3b0, R: 0xff4040, N: 0x111111 },
    cuadros: [PZ_DIBUJO_AUTO],
    choque: { forma: 'rect', w: 42, h: 66 },
    profundidad: 2
  };
});

// Crea las texturas nuevas (solo la primera vez). Si está la FASE 3
// (PZ_VIDA_SPRITES), usa su versión con más cuadros para los objetos animados.
function crearTexturasPlazaNueva(escena) {
  const vida = (typeof PZ_VIDA_SPRITES !== 'undefined') ? PZ_VIDA_SPRITES : {};
  Object.keys(PZ_OBJETOS).forEach((k) => {
    if (!escena.textures.exists(k)) crearTexturaPixel(escena, k, vida[k] || PZ_OBJETOS[k]);
  });
  Object.keys(vida).forEach((k) => {
    if (!escena.textures.exists(k)) crearTexturaPixel(escena, k, vida[k]);
  });
}

// Cables entre postes: una imagen chica por cable (pixelada, depth 12 = encima del perro).
// Su sombra ya va horneada en el suelo (pintarSueloPlazaNueva).
function pzCrearCables(escena, mapa) {
  const E = ESCALA_PIXEL;
  (mapa.cables || []).forEach((c) => {
    const ax = Math.round(c.a.x / E), ay = Math.round(c.a.y / E), bx = Math.round(c.b.x / E), by = Math.round(c.b.y / E);
    const comba = c.comba || 3;
    const x0 = Math.min(ax, bx) - 1, y0 = Math.min(ay, by) - 1;
    const w = Math.abs(bx - ax) + 3, h = Math.abs(by - ay) + comba + 3;
    const clave = 'pz_cable_' + ax + '_' + ay + '_' + bx + '_' + by;
    if (!escena.textures.exists(clave)) {
      const t = escena.textures.createCanvas(clave, w, h);
      const ctx = t.getContext();
      ctx.fillStyle = '#0c0b0e';
      const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 1.3) + 1;
      for (let k = 0; k <= n; k++) {
        const u = k / n;
        ctx.fillRect(Math.round(ax + (bx - ax) * u - x0), Math.round(ay + (by - ay) * u + Math.sin(u * Math.PI) * comba - y0), 1, 1);
      }
      t.refresh();
    }
    escena.add.image(x0 * E, y0 * E, clave).setOrigin(0).setScale(E).setDepth(12).setAlpha(0.9);
  });
}

// ===============================================================
//  LA PLAZA RENOVADA - FASE 4: ZONAS ESPECIALES CON AURA
//  (archivo nuevo, script clásico)
//
//  Las zonas siguen apareciendo AL AZAR como hoy (src/zonas.js). Esto solo
//  cambia cómo se ven y agrega la zona de CURACIÓN (mecánica nueva).
//
//  - PZ_ZONAS_ICONOS: íconos de 12 x 12, 2 cuadros (normal / brillo).
//  - PZ_ZONAS_ESTILO: colores de cada aura.
//  - crearTexturaAuraZona(escena, tipo, radio): textura con 12 cuadros:
//      0-3  = aura pulsando (relleno suave, borde brillante, chispitas girando)
//      4-11 = cuenta regresiva: el borde se va apagando como un reloj
//             (4 = lleno ... 11 = queda 1/8)
//    Se dibuja con el radio REAL de CONFIG.ZONAS[tipo].RADIO, así calza siempre.
//  - crearTexturaAvisoZona(escena, radio): anillo punteado que gira (4 cuadros,
//    blanco: se tiñe con setTint del color de la zona). Avisa dónde va a salir.
// ===============================================================

// Íconos de 12 x 12, 2 cuadros (normal / brillo). Mismo formato que SPRITES_ZONAS.
const PZ_ZONAS_ICONOS = {
  miedo: {
    colores: { M: 0xb065ff, B: 0xe2c4ff },
    cuadros: [
      [
        '...KKKKKK...',
        '..KMMMMMMK..',
        '.KMMMMMMMMK.',
        '.KMWKMMWKMK.',
        '.KMWKMMWKMK.',
        '.KMMMMMMMMK.',
        '.KMMMKKMMMK.',
        '.KMMMMMMMMK.',
        '.KMMMMMMMMK.',
        '.KMKMMKMMKK.',
        '..K.KK.KK...',
        '............'
      ],
      [
        '...KKKKKK...',
        '..KBBBBBBK..',
        '.KBBBBBBBBK.',
        '.KBWKBBWKBK.',
        '.KBWKBBWKBK.',
        '.KBBBBBBBBK.',
        '.KBBBKKBBBK.',
        '.KBBBBBBBBK.',
        '.KBBBBBBBBK.',
        '.KBKBBKBBKK.',
        '..K.KK.KK...',
        '............'
      ]
    ]
  },
  peligro: {
    colores: { R: 0xff4a3d, B: 0xffb0a8 },
    cuadros: [
      [
        '............',
        '...K....K...',
        '..KRK..KRK..',
        '..KRRKKRRK..',
        '.KRRRRRRRRK.',
        'KRWWRRRRWWRK',
        'KRWKRRRRKWRK',
        'KRRRRRRRRRRK',
        '.KRRKRRKRRK.',
        '.KRK.KK.KRK.',
        '..K......K..',
        '............'
      ],
      [
        '............',
        '...K....K...',
        '..KBK..KBK..',
        '..KBBKKBBK..',
        '.KBBBBBBBBK.',
        'KBWWBBBBWWBK',
        'KBWKBBBBKWBK',
        'KBBBBBBBBBBK',
        '.KBBKBBKBBK.',
        '.KBK.KK.KBK.',
        '..K......K..',
        '............'
      ]
    ]
  },
  barro: {
    colores: { O: 0xff9a1f, B: 0xffd29a },
    cuadros: [
      [
        '.....KK.....',
        '....KOOK....',
        '...KOOOOK...',
        '..KOOOOOOK..',
        '.KOOOOOOOOK.',
        'KKKKOOOOKKKK',
        '...KOOOOK...',
        '...KOOOOK...',
        '...KOOOOK...',
        '...KKKKKK...',
        '............',
        '............'
      ],
      [
        '.....KK.....',
        '....KBBK....',
        '...KBBBBK...',
        '..KBBBBBBK..',
        '.KBBBBBBBBK.',
        'KKKKBBBBKKKK',
        '...KBBBBK...',
        '...KBBBBK...',
        '...KBBBBK...',
        '...KKKKKK...',
        '............',
        '............'
      ]
    ]
  },
  segura: {
    colores: { S: 0x4fc3f7, B: 0xc8f0ff },
    cuadros: [
      [
        '.KKKKKKKKKK.',
        '.KSSSSSSSSK.',
        '.KSSSWWSSSK.',
        '.KSSWWWWSSK.',
        '.KSSSWWSSSK.',
        '.KSSSWWSSSK.',
        '..KSSSSSSK..',
        '..KSSSSSSK..',
        '...KSSSSK...',
        '....KSSK....',
        '.....KK.....',
        '............'
      ],
      [
        '.KKKKKKKKKK.',
        '.KBBBBBBBBK.',
        '.KBBBWWBBBK.',
        '.KBBWWWWBBK.',
        '.KBBBWWBBBK.',
        '.KBBBWWBBBK.',
        '..KBBBBBBK..',
        '..KBBBBBBK..',
        '...KBBBBK...',
        '....KBBK....',
        '.....KK.....',
        '............'
      ]
    ]
  },
  curacion: {
    colores: { B: 0xc8ffcc },
    cuadros: [
      [
        '....KKKK....',
        '....KWWK....',
        '....KWWK....',
        'KKKKKWWKKKKK',
        'KWWWWWWWWWWK',
        'KWWWWWWWWWWK',
        'KKKKKWWKKKKK',
        '....KWWK....',
        '....KWWK....',
        '....KKKK....',
        '............',
        '............'
      ],
      [
        '....KKKK....',
        '....KBBK....',
        '....KBBK....',
        'KKKKKBBKKKKK',
        'KBBBBBBBBBBK',
        'KBBBBBBBBBBK',
        'KKKKKBBKKKKK',
        '....KBBK....',
        '....KBBK....',
        '....KKKK....',
        '............',
        '............'
      ]
    ]
  }
};

// Colores del aura de cada zona (color = borde y relleno, claro = brillo)
const PZ_ZONAS_ESTILO = {
  miedo: { color: 0xb065ff, claro: 0xe2c4ff },
  peligro: { color: 0xff4a3d, claro: 0xffb0a8 },
  barro: { color: 0xff9a1f, claro: 0xffd29a },
  segura: { color: 0x4fc3f7, claro: 0xc8f0ff },
  curacion: { color: 0x5fe36a, claro: 0xc8ffcc }
};


// La zona nueva (agregar a la lista ZONAS de src/zonas.js)
const PZ_ZONA_CURACION = { id: 'curacion', nombre: 'Zona de curación', color: 0x5fe36a, colorTexto: '#a8f5ae', frase: 'Recuperas vida de a poco' };

// Números sugeridos (copiar a src/config.js). La curación es mecánica NUEVA: hay que probarla.
const PZ_ZONAS_SUGERIDO = {
  curacion: { RADIO: 120, PESO: 1, CURA: 2, CURA_CADA_MS: 1000 },
  ZONA_AVISO_MS: 900,           // cuánto se ve el anillo de aviso antes de que la zona aparezca
  AURA_CUADRO_MS: 160           // cuánto dura cada cuadro del pulso
};

function pzColorCss(c, a) {
  return 'rgba(' + ((c >> 16) & 255) + ',' + ((c >> 8) & 255) + ',' + (c & 255) + ',' + a + ')';
}

// Textura del aura. Clave: 'pz_aura_<tipo>_<r>'. Se ve con setScale(ESCALA_PIXEL).
function crearTexturaAuraZona(escena, tipo, radioMundo) {
  const E = ESCALA_PIXEL;
  const r = Math.round(radioMundo / E);
  const clave = 'pz_aura_' + tipo + '_' + r;
  if (escena.textures.exists(clave)) return clave;
  const est = PZ_ZONAS_ESTILO[tipo] || { color: 0xffffff, claro: 0xffffff };
  const lado = r * 2 + 11, c = Math.floor(lado / 2);
  const t = escena.textures.createCanvas(clave, lado * 12, lado);
  const ctx = t.getContext();
  for (let f = 0; f < 12; f++) {
    const ox = f * lado;
    const pulso = f < 4 ? Math.sin(f / 4 * Math.PI * 2) : 0;
    const rr = r + (f < 4 ? Math.round(pulso) : 0);
    const queda = f < 4 ? 1 : (12 - f) / 8;      // parte del borde que sigue prendida
    for (let y = 0; y < lado; y++) {
      for (let x = 0; x < lado; x++) {
        const dx = x - c, dy = y - c, d = Math.sqrt(dx * dx + dy * dy);
        let a = 0, col = est.color;
        if (d <= rr - 1.5) {                         // relleno suave con tramado
          a = 0.13 + 0.15 * Math.pow(d / rr, 3) + ((x + y) & 1 ? 0.03 : 0) + 0.02 * pulso;
        } else if (d <= rr + 0.5) {                  // borde de 2 px: claro adentro, color afuera
          const ang = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);   // 0 = arriba, sentido horario
          const prendido = ang <= queda;             // lo apagado crece desde las 12 hacia atrás
          const adentro = d <= rr - 0.5;
          a = prendido ? (adentro ? 0.9 : 1) : 0.28; col = prendido && adentro ? est.claro : est.color;
        } else if (d <= rr + 4) {                    // resplandor hacia afuera
          a = 0.32 * (1 - (d - rr - 0.5) / 3.5) * (f < 4 ? 0.85 + 0.15 * pulso : 0.6);
        }
        if (a > 0) { ctx.fillStyle = pzColorCss(col, Math.min(1, a).toFixed(3)); ctx.fillRect(ox + x, y, 1, 1); }
      }
    }
    if (f < 4) {                                     // chispitas que giran por el borde
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6 + f / 24) * Math.PI * 2;
        ctx.fillRect(ox + Math.round(c + Math.cos(a) * rr), Math.round(c + Math.sin(a) * rr), 1, 1);
      }
    }
  }
  for (let f = 0; f < 12; f++) t.add(f, 0, f * lado, 0, lado, lado);
  t.refresh();
  return clave;
}

// Anillo de aviso (punteado, gira). Clave: 'pz_aviso_<r>'. Blanco: usar setTint(color).
function crearTexturaAvisoZona(escena, radioMundo) {
  const E = ESCALA_PIXEL;
  const r = Math.round(radioMundo / E);
  const clave = 'pz_aviso_' + r;
  if (escena.textures.exists(clave)) return clave;
  const lado = r * 2 + 5, c = Math.floor(lado / 2);
  const t = escena.textures.createCanvas(clave, lado * 4, lado);
  const ctx = t.getContext();
  const n = Math.max(12, Math.round(r / 2.5));
  for (let f = 0; f < 4; f++) {
    for (let i = 0; i < n; i++) {
      if (i % 2) continue;
      const a0 = (i + f / 2) / n * Math.PI * 2;
      for (let k = 0; k < 6; k++) {
        const a = a0 + k / 6 * (Math.PI * 2 / n);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fillRect(f * lado + Math.round(c + Math.cos(a) * r), Math.round(c + Math.sin(a) * r), 1, 1);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(f * lado + Math.round(c + Math.cos(a) * (r - 1)), Math.round(c + Math.sin(a) * (r - 1)), 1, 1);
      }
    }
  }
  for (let f = 0; f < 4; f++) t.add(f, 0, f * lado, 0, lado, lado);
  t.refresh();
  return clave;
}

// Íconos (claves 'pz_icono_<tipo>', 2 cuadros) + 'zona_curacion' para el menú de pausa
function crearTexturasZonasNuevas(escena) {
  Object.keys(PZ_ZONAS_ICONOS).forEach((tipo) => {
    const clave = 'pz_icono_' + tipo;
    if (!escena.textures.exists(clave)) crearTexturaPixel(escena, clave, PZ_ZONAS_ICONOS[tipo]);
  });
  // la curación no tiene ícono 'zona_curacion' en SPRITES_ZONAS: el menú de pausa (pausa.js) lo pide con ese nombre
  if (!escena.textures.exists('zona_curacion')) crearTexturaPixel(escena, 'zona_curacion', PZ_ZONAS_ICONOS.curacion);
}

// Qué cuadro del aura mostrar. "falta" = ms que le quedan; "parpadeo" = CONFIG.ZONA_PARPADEO_MS
function pzCuadroAura(ahora, falta, parpadeo) {
  if (falta < parpadeo) return 4 + Math.min(7, Math.floor((1 - falta / parpadeo) * 8));
  return Math.floor(ahora / PZ_ZONAS_SUGERIDO.AURA_CUADRO_MS) % 4;
}

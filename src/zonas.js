// ===============================================================
//  ZONAS ESPECIALES
//  Círculos que aparecen en la plaza por un rato, con un borde de
//  color y un ícono al centro. Mientras el perro está dentro:
//   - Zona de miedo (morada): no puede atacar.
//   - Zona peligrosa (roja): recibe el doble de daño.
//   - Barro (naranja): se mueve más lento. Los enemigos también.
//   - Zona segura (celeste, rara): no recibe daño, pero no gana experiencia.
//   - Zona de curación (verde, rara, solo en La Plaza): recupera vida de a poco.
//  En La Plaza las zonas usan el dibujo nuevo de src/plaza_zonas.js (aura, ícono y
//  anillo de aviso); en Terminal y Feria, el dibujo de siempre.
//  Los números (tamaño, duración, qué tan seguido) están en src/config.js
//  (sección ZONAS). Lo usa src/scenes/GameScene.js.
//
//  Para agregar una zona nueva:
//   1. Agrega sus números en CONFIG.ZONAS (src/config.js) con RADIO y PESO.
//   2. Agrégala en la lista ZONAS de abajo (mismo id), con su nombre,
//      color, frase y el dibujo de su ícono en SPRITES_ZONAS.
//   3. Lo que HACE la zona hay que programarlo: revisa cómo se usan
//      escena.efectoZona.miedo, .peligro, .barro y .segura en GameScene.js
// ===============================================================

const ZONAS = [
  { id: 'miedo',   nombre: 'Zona de miedo',   color: 0xb388ff, colorTexto: '#d1b3ff', frase: 'No puedes atacar' },
  { id: 'peligro', nombre: 'Zona peligrosa',  color: 0xff5252, colorTexto: '#ff8a80', frase: 'Recibes el doble de daño' },
  { id: 'barro',   nombre: 'Barro',           color: 0xff9a1f, colorTexto: '#ffc680', frase: 'Todos se mueven más lento' },
  { id: 'segura',  nombre: 'Zona segura',     color: 0x4fc3f7, colorTexto: '#a6e3fb', frase: 'No recibes daño, pero no ganas experiencia' },
  { id: 'curacion', nombre: 'Zona de curación', color: 0x5fe36a, colorTexto: '#a8f5ae', frase: 'Recuperas vida de a poco' } // FASE 4 (nueva)
];

// Íconos de 10 x 10 (mismo formato que src/sprites.js: cada letra es un
// píxel, "." es transparente y K es el borde casi negro)
const SPRITES_ZONAS = {
  // Fantasma morado
  miedo: {
    colores: { M: 0xb388ff },
    cuadros: [[
      '...KKKK...',
      '..KMMMMK..',
      '.KMMMMMMK.',
      '.KMKMMKMK.',
      '.KMKMMKMK.',
      '.KMMMMMMK.',
      '.KMMKKMMK.',
      '.KMMMMMMK.',
      '.KMKMMKMK.',
      '..K.KK.K..'
    ]]
  },
  // Triángulo rojo con signo de exclamación
  peligro: {
    colores: { R: 0xff5252 },
    cuadros: [[
      '....KK....',
      '...KRRK...',
      '...KRRK...',
      '..KRWWRK..',
      '..KRWWRK..',
      '.KRRWWRRK.',
      '.KRRRRRRK.',
      'KRRRWWRRRK',
      'KRRRRRRRRK',
      '.KKKKKKKK.'
    ]]
  },
  // Gotas y charco de barro (naranja)
  barro: {
    colores: { B: 0xff9a1f, b: 0xb8650c }, // v0.50: naranja (antes café)
    cuadros: [[
      '..........',
      '...K......',
      '..KBK.....',
      '..KBK..K..',
      '.KBBBK.KBK',
      '.KBBBK.KBK',
      '..KKK...K.',
      '..KKKKKK..',
      '.KbbBBbbK.',
      '..KKKKKK..'
    ]]
  },
  // Escudo celeste con una cruz
  segura: {
    colores: { G: 0x4fc3f7 }, // v0.50: celeste (antes verde)
    cuadros: [[
      '.KKKKKKKK.',
      '.KGGGGGGK.',
      '.KGGWWGGK.',
      '.KGWWWWGK.',
      '.KGGWWGGK.',
      '.KGGWWGGK.',
      '..KGGGGK..',
      '..KGGGGK..',
      '...KGGK...',
      '....KK....'
    ]]
  }
};

function buscarZona(id) {
  return ZONAS.find((z) => z.id === id) || { id, nombre: id, color: 0xffffff, colorTexto: '#ffffff', frase: '' };
}

// Zonas que tienen números en config.js
function tiposDeZona() {
  return Object.keys(CONFIG.ZONAS || {});
}

// Crea los íconos (solo la primera vez). Se llaman "zona_" + id
function crearTexturasZonas(escena) {
  Object.keys(SPRITES_ZONAS).forEach((id) => {
    const clave = 'zona_' + id;
    if (!escena.textures.exists(clave)) crearTexturaPixel(escena, clave, SPRITES_ZONAS[id]);
  });
}

// Estado inicial (al empezar la partida)
function iniciarZonas(escena) {
  crearTexturasZonas(escena);
  if (typeof crearTexturasZonasNuevas === 'function') crearTexturasZonasNuevas(escena); // FASE 4
  escena.zonas = [];
  escena.avisosZona = [];        // FASE 4: anillos de aviso (zona por aparecer)
  escena.proximaCuraZona = 0;    // FASE 4: curación
  escena.proximaZona = CONFIG.ZONAS_PRIMERA_MS;
  escena.efectoZona = { miedo: false, peligro: false, barro: false, segura: false, curacion: false };
}

// FASE 4: aura nueva solo en la plaza (terminal y feria siguen con el dibujo de hoy)
function zonasNuevas(escena) {
  return escena.mapaId === 'plaza' && typeof crearTexturaAuraZona === 'function';
}

// ¿Se puede poner una zona de radio r con centro en (x, y)?
// No encima de la pileta, no encima del perro, dentro del mapa y sin tapar otra zona.
function lugarZonaValido(escena, x, y, r) {
  const margen = CONFIG.ZONA_MARGEN;
  if (x - r < 0 || y - r < 0 || x + r > CONFIG.MAPA_ANCHO || y + r > CONFIG.MAPA_ALTO) return false;
  const c = escena.plaza.centro;
  if (Phaser.Math.Distance.Between(x, y, c.x, c.y) < r + CONFIG.PILETA_RADIO + margen) return false;
  if (Phaser.Math.Distance.Between(x, y, escena.perro.x, escena.perro.y) < r + escena.base.RADIO + margen) return false;
  return escena.zonas.every((z) => Phaser.Math.Distance.Between(x, y, z.x, z.y) > r + z.radio + 20);
}

// Elige un tipo al azar según su PESO
function sortearTipoZona(escena) {
  const tipos = tiposDeZona().filter((id) => (CONFIG.ZONAS[id].PESO || 0) > 0)
    .filter((id) => id !== 'curacion' || (escena && zonasNuevas(escena))); // FASE 4: curación solo en la plaza
  if (tipos.length === 0) return null;
  const total = tipos.reduce((s, id) => s + CONFIG.ZONAS[id].PESO, 0);
  let sorteo = Math.random() * total;
  for (const id of tipos) {
    sorteo -= CONFIG.ZONAS[id].PESO;
    if (sorteo < 0) return id;
  }
  return tipos[tipos.length - 1];
}

// Intenta poner una zona al azar cerca del perro. Devuelve la zona o null.
function aparecerZonaAlAzar(escena, tipo) {
  tipo = tipo || sortearTipoZona(escena);
  if (!tipo) return null;
  const r = CONFIG.ZONAS[tipo].RADIO;
  for (let intento = 0; intento < 25; intento++) {
    const ang = Math.random() * Math.PI * 2;
    const d = Phaser.Math.Between(CONFIG.ZONA_DISTANCIA_MIN, CONFIG.ZONA_DISTANCIA_MAX);
    const x = escena.perro.x + Math.cos(ang) * d;
    const y = escena.perro.y + Math.sin(ang) * d;
    if (lugarZonaValido(escena, x, y, r)) {
      if (zonasNuevas(escena)) {   // FASE 4: primero un anillo de aviso; la zona sale en actualizarZonas
        const aviso = escena.add.image(x, y, crearTexturaAvisoZona(escena, r), 0).setScale(ESCALA_PIXEL).setDepth(801)
          .setTint(PZ_ZONAS_ESTILO[tipo] ? PZ_ZONAS_ESTILO[tipo].color : 0xffffff);
        escena.avisosZona.push({ tipo, x, y, aviso, cuando: escena.tiempoSobrevivido + PZ_ZONAS_SUGERIDO.ZONA_AVISO_MS });
        return null;
      }
      return crearZona(escena, tipo, x, y);
    }
  }
  return null;
}

// Dibuja la zona: relleno suave, borde punteado del color de la zona y el ícono.
// Va encima de la oscuridad para que se vea de noche.
function crearZona(escena, tipo, x, y) {
  const datos = buscarZona(tipo);
  const r = CONFIG.ZONAS[tipo].RADIO;
  const nueva = zonasNuevas(escena);
  let g;
  if (nueva) {   // FASE 4: aura con pulso y cuenta regresiva (src/plaza_zonas.js)
    g = escena.add.image(x, y, crearTexturaAuraZona(escena, tipo, r), 0).setScale(ESCALA_PIXEL).setDepth(801);
  } else {
    g = escena.add.graphics({ x, y }).setDepth(801);
    g.fillStyle(datos.color, 0.14);
    g.fillCircle(0, 0, r);
    // borde de "píxeles" cuadrados (estilo 8 bits)
    const puntos = Math.round((Math.PI * 2 * r) / 14);
    g.fillStyle(datos.color, 0.95);
    for (let i = 0; i < puntos; i++) {
      const a = (i / puntos) * Math.PI * 2;
      g.fillRect(Math.cos(a) * r - 3, Math.sin(a) * r - 3, 6, 6);
    }
  }
  const icono = escena.add.image(x, y, nueva ? 'pz_icono_' + tipo : 'zona_' + tipo, 0).setScale(ESCALA_PIXEL).setDepth(802).setAlpha(0.9);
  const zona = { tipo, x, y, radio: r, grafico: g, icono, hasta: escena.tiempoSobrevivido + CONFIG.ZONA_DURACION_MS, dentro: false };
  escena.zonas.push(zona);
  // aparece creciendo
  const escala = nueva ? ESCALA_PIXEL : 1;
  g.setScale(0.2 * escala);
  escena.tweens.add({ targets: g, scale: escala, duration: 350, ease: 'Back.easeOut' });
  return zona;
}

function borrarZona(escena, zona) {
  escena.tweens.killTweensOf(zona.grafico);
  zona.grafico.destroy();
  zona.icono.destroy();
}

// ¿El punto (x, y) está dentro de alguna zona de este tipo?
function dentroDeZona(escena, tipo, x, y) {
  return escena.zonas.some((z) => z.tipo === tipo && Phaser.Math.Distance.Between(x, y, z.x, z.y) <= z.radio);
}

// Se llama en cada cuadro: aparecen y desaparecen zonas, y se calcula
// en qué zonas está el perro (escena.efectoZona)
function actualizarZonas(escena) {
  const ahora = escena.tiempoSobrevivido;

  // Aparecer una nueva cada cierto tiempo (al amanecer ya no)
  if (ahora >= escena.proximaZona) {
    escena.proximaZona = ahora + CONFIG.ZONAS_CADA_MS;
    if (!escena.amaneciendo && escena.zonas.length + (escena.avisosZona || []).length < CONFIG.ZONAS_MAXIMAS) aparecerZonaAlAzar(escena);
  }

  // FASE 4: los avisos giran y, cuando les toca, se vuelven zona
  escena.avisosZona = (escena.avisosZona || []).filter((a) => {
    if (ahora < a.cuando) { a.aviso.setFrame(Math.floor(ahora / 120) % 4); return true; }
    a.aviso.destroy();
    if (!escena.amaneciendo) crearZona(escena, a.tipo, a.x, a.y);
    return false;
  });

  // Quitar las que se acabaron; las que están por acabarse parpadean
  escena.zonas = escena.zonas.filter((z) => {
    if (ahora >= z.hasta) { borrarZona(escena, z); return false; }
    const falta = z.hasta - ahora;
    const alfa = falta < CONFIG.ZONA_PARPADEO_MS && Math.floor(ahora / 200) % 2 === 0 ? 0.35 : 1;
    z.grafico.setAlpha(alfa);
    z.icono.setAlpha(0.9 * alfa);
    if (z.grafico.type === 'Image') {   // FASE 4: pulso y borde que se apaga al final
      z.grafico.setFrame(pzCuadroAura(ahora, falta, CONFIG.ZONA_PARPADEO_MS));
      z.icono.setFrame(Math.floor(ahora / 400) % 2);
    }
    return true;
  });

  // Efectos sobre el perro + aviso al entrar
  const efecto = { miedo: false, peligro: false, barro: false, segura: false, curacion: false };
  const px = escena.perro.x;
  const py = escena.perro.y;
  escena.zonas.forEach((z) => {
    const dentro = Phaser.Math.Distance.Between(px, py, z.x, z.y) <= z.radio;
    if (dentro && !z.dentro) {
      const datos = buscarZona(z.tipo);
      escena.textoFlotante(datos.nombre + ': ' + datos.frase.toLowerCase(), datos.colorTexto);
    }
    z.dentro = dentro;
    if (dentro) efecto[z.tipo] = true;
  });
  escena.efectoZona = efecto;

  // FASE 4: zona de curación (cura de a poco mientras estás adentro)
  const cura = CONFIG.ZONAS.curacion;
  if (efecto.curacion && cura && ahora >= escena.proximaCuraZona) {
    escena.proximaCuraZona = ahora + cura.CURA_CADA_MS;
    escena.curar(cura.CURA, '#a8f5ae');
  }
}

// Cuánto se multiplica la velocidad dentro del barro (1 = normal)
function factorBarro() {
  const b = CONFIG.ZONAS.barro;
  return b ? Math.max(0, 1 - (b.LENTITUD || 0)) : 1;
}

// Barro para los enemigos: se llama después de moverlos en cada cuadro
// (no se frena a los que van volando por un ladrido)
function frenarEnemigosEnBarro(escena) {
  if (!CONFIG.ZONAS.barro || !escena.zonas.some((z) => z.tipo === 'barro')) return;
  const f = factorBarro();
  const ahora = escena.tiempoSobrevivido;
  escena.enemigos.getChildren().forEach((e) => {
    if (ahora < e.empujadoHasta) return;
    if (dentroDeZona(escena, 'barro', e.x, e.y)) e.body.velocity.scale(f);
  });
}

// Modo de prueba (tecla Z): una zona de cada tipo alrededor del perro
// (nunca encima de él ni de la pileta)
function pruebaZonas(escena) {
  const tipos = tiposDeZona().filter((id) => id !== 'curacion' || zonasNuevas(escena)); // v0.50: curación solo en la plaza
  let puestas = 0;
  tipos.forEach((tipo, i) => {
    const r = CONFIG.ZONAS[tipo].RADIO;
    const d = r + escena.base.RADIO + CONFIG.ZONA_MARGEN + 30;
    // Prueba primero su lado preferido y luego da la vuelta completa, cada vez más lejos
    let lista = false;
    for (let paso = 0; paso < 6 && !lista; paso++) {
      for (let k = 0; k < 24 && !lista; k++) {
        const ang = (i / tipos.length) * Math.PI * 2 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 12);
        const dist = d + paso * 70;
        const x = escena.perro.x + Math.cos(ang) * dist;
        const y = escena.perro.y + Math.sin(ang) * dist;
        if (lugarZonaValido(escena, x, y, r)) { crearZona(escena, tipo, x, y); puestas++; lista = true; }
      }
    }
  });
  escena.textoFlotante(puestas + ' zonas (prueba)', '#b3e5fc');
}

// Al terminar la partida
function limpiarZonas(escena) {
  (escena.zonas || []).forEach((z) => borrarZona(escena, z));
  escena.zonas = [];
  (escena.avisosZona || []).forEach((a) => a.aviso.destroy()); // FASE 4
  escena.avisosZona = [];
  escena.efectoZona = { miedo: false, peligro: false, barro: false, segura: false, curacion: false };
}

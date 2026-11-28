// ===============================================================
//  SPRITES NUEVOS (v0.28.1): cargador de los dibujos nuevos.
//  Los dibujos están en src/sprites_perrita.js, sprites_limpiavidrios.js,
//  sprites_perrera.js, sprites_cuchilla.js, sprites_tripa_seca.js,
//  sprites_perros_nuevos.js, sprites_perros_artista.js y (v0.37) sprites_tipoR.js (Borracho).
//  Formato de cada uno: { size (32 o 48), paleta, anims }. Miran a la derecha.
//  Todavía NO salen en una partida: por ahora solo los usa la galería
//  de prueba (src/scenes/GaleriaScene.js, se abre con ?galeria=1).
//  Las texturas se llaman 'nuevo_<id>' y las animaciones 'nuevo_<id>_<anim>'
//  (el prefijo "nuevo_" evita chocar con los dibujos viejos, como 'perrera').
// ===============================================================

// Cuadros por segundo de cada animación y si se repite (-1) o se juega una vez (0)
const SPRITES_NUEVOS_VELOCIDAD = {
  idle: [6, -1],
  caminar: [10, -1],
  correr: [12, -1],
  ataque: [12, 0],
  dano: [1, 0],
  muerte: [8, 0],
  silbato: [6, 0],
  especial: [8, 0]
};
const SPRITES_NUEVOS_ORDEN = ['idle', 'caminar', 'correr', 'ataque', 'especial', 'silbato', 'dano', 'muerte'];

// Catálogo: id -> { nombre, datos() }. datos() devuelve null si no cargó su script
// (se usa typeof para que una constante que falta no rompa nada)
const SPRITES_NUEVOS = {
  nuevo_perrita: { nombre: 'Perrita del moño', datos: () => (typeof PERRITA_SPRITE !== 'undefined' ? PERRITA_SPRITE : null) },
  nuevo_limpiavidrios: { nombre: 'Limpiavidrios', datos: () => (typeof LIMPIAVIDRIOS_SPRITE !== 'undefined' ? LIMPIAVIDRIOS_SPRITE : null) },
  nuevo_limpiavidrios_perro: { nombre: 'Perro del limpiavidrios', datos: () => (typeof LIMPIAVIDRIOS_PERRO_SPRITE !== 'undefined' ? LIMPIAVIDRIOS_PERRO_SPRITE : null) },
  nuevo_perrera: { nombre: 'Personal de la Perrera', datos: () => (typeof PERRERA_SPRITE !== 'undefined' ? PERRERA_SPRITE : null) },
  nuevo_cuchilla: { nombre: 'El Malandra', datos: () => (typeof CUCHILLA_SPRITE !== 'undefined' ? CUCHILLA_SPRITE : null) },
  nuevo_cuchilla_perro: { nombre: 'Perro del Malandra', datos: () => (typeof CUCHILLA_PERRO_SPRITE !== 'undefined' ? CUCHILLA_PERRO_SPRITE : null) },
  nuevo_tipoR: { nombre: 'Borracho', datos: () => (typeof TIPOR_SPRITE !== 'undefined' ? TIPOR_SPRITE : null) },
  nuevo_tripa_seca: { nombre: 'Tripa seca', datos: () => (typeof TRIPA_SECA_SPRITE !== 'undefined' ? TRIPA_SECA_SPRITE : null) },
  nuevo_pastor: { nombre: 'Pastor alemán', datos: () => (typeof PERROS_NUEVOS_SPRITES !== 'undefined' ? PERROS_NUEVOS_SPRITES.pastor || null : null) },
  nuevo_salchicha: { nombre: 'Salchicha', datos: () => (typeof PERROS_NUEVOS_SPRITES !== 'undefined' ? PERROS_NUEVOS_SPRITES.salchicha || null : null) },
  nuevo_gran_danes: { nombre: 'Gran danés', datos: () => (typeof PERROS_ARTISTA_SPRITES !== 'undefined' ? PERROS_ARTISTA_SPRITES.gran_danes || null : null) },
  nuevo_poodle: { nombre: 'Poodle', datos: () => (typeof PERROS_ARTISTA_SPRITES !== 'undefined' ? PERROS_ARTISTA_SPRITES.poodle || null : null) },
  nuevo_pug: { nombre: 'Pug', datos: () => (typeof PERROS_ARTISTA_SPRITES !== 'undefined' ? PERROS_ARTISTA_SPRITES.pug || null : null) },
  nuevo_dogo: { nombre: 'Dogo', datos: () => (typeof PERROS_ARTISTA_SPRITES !== 'undefined' ? PERROS_ARTISTA_SPRITES.dogo || null : null) },
  nuevo_sheepdog: { nombre: 'Sheepdog (ovejero)', datos: () => (typeof PERROS_ARTISTA_SPRITES !== 'undefined' ? PERROS_ARTISTA_SPRITES.sheepdog || null : null) }
};

// Animaciones de un sprite en un orden fijo (las conocidas primero; las otras al final)
function animsSpriteNuevo(datos) {
  const nombres = Object.keys(datos.anims || {});
  return SPRITES_NUEVOS_ORDEN.filter((n) => nombres.includes(n)).concat(nombres.filter((n) => !SPRITES_NUEVOS_ORDEN.includes(n)));
}

// Crea (solo la primera vez) la textura de cada sprite nuevo, con todos sus cuadros
// uno al lado del otro, y sus animaciones 'nuevo_<id>_<anim>'.
// Devuelve la lista de ids que sí se cargaron.
function crearSpritesNuevos(escena) {
  const listos = [];
  const faltan = [];
  Object.keys(SPRITES_NUEVOS).forEach((id) => {
    const datos = SPRITES_NUEVOS[id].datos();
    if (!datos || !datos.anims || !datos.paleta) {
      faltan.push(id);
      return;
    }
    const lado = datos.size === 48 ? 48 : 32;
    const cuadros = [];
    const indices = {};
    animsSpriteNuevo(datos).forEach((nombre) => {
      indices[nombre] = [];
      datos.anims[nombre].forEach((filas) => { indices[nombre].push(cuadros.length); cuadros.push(filas); });
    });
    if (!escena.textures.exists(id)) {
      const ancho = lado * cuadros.length;
      const textura = escena.textures.createCanvas(id, ancho, lado);
      const ctx = textura.getContext();
      const imagen = ctx.createImageData(ancho, lado);
      const colores = {};
      Object.keys(datos.paleta).forEach((letra) => { colores[letra] = colorSpriteRaza(datos.paleta[letra]); }); // acepta #rrggbbaa
      cuadros.forEach((filas, n) => {
        filas.forEach((fila, y) => {
          for (let x = 0; x < fila.length && x < lado; x++) {
            const c = colores[fila[x]];
            if (!c) continue; // '.' = transparente
            const k = (y * ancho + n * lado + x) * 4;
            imagen.data[k] = c[0]; imagen.data[k + 1] = c[1]; imagen.data[k + 2] = c[2]; imagen.data[k + 3] = c[3];
          }
        });
        textura.add(n, 0, n * lado, 0, lado, lado);
      });
      ctx.putImageData(imagen, 0, 0);
      textura.refresh();
    }
    Object.keys(indices).forEach((nombre) => {
      const clave = id + '_' + nombre;
      if (escena.anims.exists(clave) || indices[nombre].length === 0) return;
      const [fps, repetir] = SPRITES_NUEVOS_VELOCIDAD[nombre] || [8, 0];
      escena.anims.create({ key: clave, frames: indices[nombre].map((i) => ({ key: id, frame: i })), frameRate: fps, repeat: repetir });
    });
    listos.push(id);
  });
  if (faltan.length > 0) {
    console.warn('[Sprites nuevos] No se cargaron: ' + faltan.join(', ') + '. Revisa que index.html tenga sus scripts (src/sprites_*.js).');
  }
  return listos;
}

// Anima un sprite nuevo según cómo se mueve (v0.29: lo usan los enemigos con dibujo nuevo en GameScene).
// estado: { muerto, dano, ataque } (opcional). El dibujo mira a la derecha: flipX si va a la izquierda.
// Al moverse usa 'correr' (perros 32x32) o 'caminar' (humanos y jefes 48x48), la que tenga.
function animarSpriteNuevo(sprite, vx, vy, estado) {
  const id = sprite.texture.key;
  const e = estado || {};
  const existe = (n) => sprite.scene.anims.exists(id + '_' + n);
  let nombre = 'idle';
  if (e.muerto) nombre = 'muerte';
  else if (e.dano) nombre = 'dano';
  else if (e.ataque) nombre = 'ataque';
  else if (vx * vx + vy * vy > 25) nombre = existe('correr') ? 'correr' : 'caminar';
  if (!existe(nombre)) nombre = 'idle';
  if (vx < -5) sprite.setFlipX(true);
  else if (vx > 5) sprite.setFlipX(false);
  const anim = id + '_' + nombre;
  if (sprite.anims.currentAnim && sprite.anims.currentAnim.key === anim) return;
  sprite.anims.play(anim, nombre === 'idle' || nombre === 'caminar' || nombre === 'correr');
}

// v0.29: escala de un sprite nuevo en la partida según su tamaño
// (32x32 -> ESCALA_32, 48x48 -> ESCALA_48; están en CONFIG.ENEMIGOS_SPRITE_NUEVO)
function escalaSpriteNuevo(escena, clave) {
  const E = CONFIG.ENEMIGOS_SPRITE_NUEVO || {};
  const lado = escena.textures.get(clave).get(0).height;
  return lado >= 48 ? (E.ESCALA_48 || 1.5) : (E.ESCALA_32 || 2);
}

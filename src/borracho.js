// ===============================================================
//  BORRACHO (v0.37): dibujo nuevo (src/sprites_tipoR.js) y dos ataques.
//  Sigue caminando en zigzag (moverZigzag en GameScene) y además:
//   - Botellazo (cerca): si el perro está a menos de BOTELLAZO_DISTANCIA,
//     levanta la botella un instante y pega (daño = su DANO de contacto).
//   - Botella lanzada (lejos): si el perro está entre LANZAR_DISTANCIA_MIN y _MAX,
//     cada LANZAR_CADA_MIN_MS..MAX_MS se detiene (LANZAR_AVISO_MS), levanta la botella
//     y la tira en arco hacia donde estaba el perro (con un poco de error).
//     Al caer se rompe y daña en BOTELLA_RADIO. Si no pega, quedan vidrios (solo se ven).
//  Los números están en CONFIG.ENEMIGOS.borracho (src/config.js).
// ===============================================================

// Cuadro de la animación de ataque (0 = botella arriba, 1 = golpe)
function cuadroAtaqueBorracho(escena, enemigo, n) {
  const anim = escena.anims.get(enemigo.texture.key + '_ataque');
  if (!anim || !anim.frames[n]) return;
  enemigo.anims.stop();
  enemigo.setFrame(anim.frames[n].frame.name);
}

// Se llama desde moverEnemigos en vez de moverZigzag cuando el borracho tiene BOTELLAS.
// Devuelve true mientras avisa que va a lanzar (parpadea).
function moverBorracho(escena, enemigo, ahora) {
  const cfg = enemigo.cfg;
  if (enemigo.proximoLanzar === undefined) {
    enemigo.proximoLanzar = ahora + Phaser.Math.Between(cfg.LANZAR_CADA_MIN_MS, cfg.LANZAR_CADA_MAX_MS);
    enemigo.proximoBotellazo = 0;
  }

  // Levantando la botella (aviso): quieto
  if (enemigo.estado === 'avisar') {
    enemigo.body.setVelocity(0, 0);
    if (ahora >= enemigo.estadoHasta) {
      if (enemigo.ataqueBorracho === 'lanzar') {
        lanzarBotella(escena, enemigo);
        enemigo.proximoLanzar = ahora + Phaser.Math.Between(cfg.LANZAR_CADA_MIN_MS, cfg.LANZAR_CADA_MAX_MS);
      } else {
        golpeBotellazo(escena, enemigo);
        enemigo.proximoBotellazo = ahora + cfg.BOTELLAZO_ESPERA_MS;
      }
      enemigo.estado = 'atacar';
      enemigo.estadoHasta = ahora + cfg.ATAQUE_MS;
    }
    return enemigo.ataqueBorracho === 'lanzar';
  }

  // Golpe recién dado: quieto un momento
  if (enemigo.estado === 'atacar') {
    enemigo.body.setVelocity(0, 0);
    if (ahora >= enemigo.estadoHasta) enemigo.estado = 'acercarse';
    return false;
  }

  enemigo.estado = 'acercarse';
  const perro = perroMasCercano(escena, enemigo.x, enemigo.y); // coop: el más cercano que no esté caído
  if (!perro.caido && !escena.amaneciendo) {
    const d = Phaser.Math.Distance.Between(enemigo.x, enemigo.y, perro.x, perro.y);
    let ataque = null;
    if (d < cfg.BOTELLAZO_DISTANCIA && ahora >= enemigo.proximoBotellazo) ataque = 'botellazo';
    else if (d >= cfg.LANZAR_DISTANCIA_MIN && d <= cfg.LANZAR_DISTANCIA_MAX && ahora >= enemigo.proximoLanzar) ataque = 'lanzar';
    if (ataque) {
      enemigo.ataqueBorracho = ataque;
      enemigo.estado = 'avisar';
      enemigo.anguloEmbestida = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, perro.x, perro.y);
      enemigo.objetivoX = perro.x; // la botella va adonde estaba el perro al avisar
      enemigo.objetivoY = perro.y;
      enemigo.estadoHasta = ahora + (ataque === 'lanzar' ? cfg.LANZAR_AVISO_MS : cfg.BOTELLAZO_AVISO_MS);
      enemigo.body.setVelocity(0, 0);
      return ataque === 'lanzar';
    }
    // Si el perro se alejó, el lanzamiento se reprograma (no lanza apenas vuelva a estar a tiro)
  }
  escena.moverZigzag(enemigo, ahora);
  return false;
}

// Dibujo del borracho: botella arriba al avisar, golpe al atacar; si no, lo normal.
// Devuelve true si ya lo animó (moverEnemigos no hace nada más).
function animarBorracho(escena, enemigo, ahora) {
  if (!enemigo.cfg.BOTELLAS || !enemigo.spriteNuevo) return false;
  if (ahora < enemigo.danoAnimHasta) return false; // el daño se ve igual que siempre
  if (enemigo.estado === 'avisar') {
    cuadroAtaqueBorracho(escena, enemigo, 0);
    return true;
  }
  if (enemigo.estado === 'atacar') {
    cuadroAtaqueBorracho(escena, enemigo, 1);
    return true;
  }
  return false;
}

// Datos del golpe que usa recibirGolpe (multiplicadores de noche, mapa, global y coop
// ya vienen en multDano). Se copia para que la botella pegue aunque el borracho ya haya muerto.
function golpeadorBorracho(enemigo) {
  return { cfg: enemigo.cfg, tipo: enemigo.tipo, multDano: enemigo.multDano, estado: 'botella', x: enemigo.x, y: enemigo.y };
}

// Botellazo: pega a los perros que estén a su alcance (el golpe se ve como un arco breve)
function golpeBotellazo(escena, enemigo) {
  const cfg = enemigo.cfg;
  const a = enemigo.anguloEmbestida;
  const g = escena.add.graphics().setDepth(7);
  g.fillStyle(0xc5e1a5, 0.35);
  g.slice(enemigo.x, enemigo.y, cfg.BOTELLAZO_DISTANCIA, a - 0.8, a + 0.8, false);
  g.fillPath();
  escena.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() });
  escena.perrosEnJuego().forEach((perro) => {
    if (perro.caido) return;
    const r = perro.body ? perro.body.halfWidth : 16;
    if (Phaser.Math.Distance.Between(enemigo.x, enemigo.y, perro.x, perro.y) <= cfg.BOTELLAZO_DISTANCIA + r * 0.5) {
      escena.golpearPerro(perro, enemigo, cfg.BOTELLAZO_DANO !== undefined ? cfg.BOTELLAZO_DANO : cfg.DANO);
    }
  });
}

// Textura de la botella que vuela (verde, con cuello y brillo)
function texturaBotella(escena) {
  if (escena.textures.exists('botella_borracho')) return 'botella_borracho';
  const g = escena.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x161218, 1); g.fillRect(2, 0, 4, 14); g.fillRect(0, 5, 8, 11);
  g.fillStyle(0x5a6e2c, 1); g.fillRect(3, 1, 2, 5); g.fillRect(1, 6, 6, 9);
  g.fillStyle(0xb8c86a, 1); g.fillRect(2, 7, 1, 6);
  g.generateTexture('botella_borracho', 8, 16);
  g.destroy();
  return 'botella_borracho';
}

// Tira una botella en arco hacia donde estaba el perro (con un poco de error por el zigzag)
function lanzarBotella(escena, enemigo) {
  const cfg = enemigo.cfg;
  const error = Math.random() * cfg.BOTELLA_ERROR;
  const angError = Math.random() * Math.PI * 2;
  const destinoX = Phaser.Math.Clamp(enemigo.objetivoX + Math.cos(angError) * error, 10, CONFIG.MAPA_ANCHO - 10);
  const destinoY = Phaser.Math.Clamp(enemigo.objetivoY + Math.sin(angError) * error, 10, CONFIG.MAPA_ALTO - 10);
  const x0 = enemigo.x + Math.cos(enemigo.anguloEmbestida) * 14;
  const y0 = enemigo.y - 18; // sale de la mano levantada
  const dist = Phaser.Math.Distance.Between(x0, y0, destinoX, destinoY);
  const sprite = escena.add.image(x0, y0, texturaBotella(escena)).setScale(2).setDepth(8);
  const sombra = escena.add.ellipse(x0, enemigo.y + 10, 14, 6, 0x000000, 0.3).setDepth(4.5);
  if (!escena.botellas) escena.botellas = [];
  escena.botellas.push({
    sprite, sombra, x0, y0, destinoX, destinoY, t: 0,
    duracion: Math.max(350, (dist / cfg.BOTELLA_VELOCIDAD) * 1000),
    altura: 40 + dist * 0.25,
    golpe: golpeadorBorracho(enemigo),
    dano: cfg.BOTELLA_DANO !== undefined ? cfg.BOTELLA_DANO : cfg.DANO,
    radio: cfg.BOTELLA_RADIO,
    vidriosMs: cfg.VIDRIOS_MS
  });
}

// Mueve las botellas en el aire (una vez por cuadro, desde GameScene.update)
function moverBotellas(escena, delta) {
  if (!escena.botellas || escena.botellas.length === 0) return;
  escena.botellas = escena.botellas.filter((b) => {
    b.t += delta;
    const p = Math.min(1, b.t / b.duracion);
    const x = b.x0 + (b.destinoX - b.x0) * p;
    const ySuelo = b.y0 + (b.destinoY - b.y0) * p;
    b.sprite.setPosition(x, ySuelo - Math.sin(p * Math.PI) * b.altura);
    b.sprite.rotation += delta * 0.018; // gira en el aire
    b.sombra.setPosition(x, ySuelo + 4).setScale(0.6 + 0.4 * p);
    // dónde va a caer (círculo tenue)
    escena.avisos.lineStyle(2, 0xc5e1a5, 0.5);
    escena.avisos.strokeCircle(b.destinoX, b.destinoY, b.radio);
    if (p < 1) return true;
    romperBotella(escena, b);
    return false;
  });
}

// La botella cae: vidrios que saltan; daña a los perros cerca. Si no pega, quedan vidrios un rato.
function romperBotella(escena, b) {
  b.sprite.destroy();
  b.sombra.destroy();
  const x = b.destinoX;
  const y = b.destinoY;
  let pego = false;
  if (!escena.gameOver && !escena.amaneciendo) {
    escena.perrosEnJuego().forEach((perro) => {
      if (perro.caido) return;
      const r = perro.body ? perro.body.halfWidth : 16;
      if (Phaser.Math.Distance.Between(x, y, perro.x, perro.y) <= b.radio + r * 0.5) {
        escena.golpearPerro(perro, b.golpe, b.dano);
        pego = true;
      }
    });
  }
  // vidrios que saltan
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
    const color = i % 3 === 0 ? 0xffffff : i % 3 === 1 ? 0xb8c86a : 0x5a6e2c;
    const v = escena.add.rectangle(x, y, 4, 3, color).setDepth(7).setRotation(Math.random() * 3);
    escena.tweens.add({
      targets: v, x: x + Math.cos(a) * (14 + Math.random() * 16), y: y + Math.sin(a) * (10 + Math.random() * 12),
      rotation: v.rotation + 4, alpha: 0, duration: 320, onComplete: () => v.destroy()
    });
  }
  const destello = escena.add.circle(x, y, b.radio * 0.6, 0xffffff, 0.5).setDepth(7);
  escena.tweens.add({ targets: destello, scale: 1.6, alpha: 0, duration: 200, onComplete: () => destello.destroy() });
  if (pego) return;
  // vidrios en el suelo (solo se ven, no dañan)
  const g = escena.add.graphics().setDepth(3.5);
  for (let i = 0; i < 7; i++) {
    const vx = x + Phaser.Math.Between(-14, 14);
    const vy = y + Phaser.Math.Between(-8, 8);
    g.fillStyle(i % 2 === 0 ? 0x8fa24a : 0xdfe8c0, 0.9);
    g.fillTriangle(vx, vy, vx + 4, vy + 1, vx + 1, vy + 3);
  }
  escena.tweens.add({ targets: g, alpha: 0, delay: Math.max(0, b.vidriosMs - 400), duration: 400, onComplete: () => g.destroy() });
}

// Fin de partida: borra las botellas en el aire
function limpiarBotellas(escena) {
  (escena.botellas || []).forEach((b) => { b.sprite.destroy(); b.sombra.destroy(); });
  escena.botellas = [];
}

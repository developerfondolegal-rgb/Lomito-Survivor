// ===============================================================
//  GATO CALLEJERO (v0.43): enemigo normal (NO es jefe).
//  Dibujo: src/sprites_gatoJefe.js (GATO_JEFE_SPRITE, 48x48; el nombre del
//  archivo dice "Jefe" pero aquí es un gato común). Textura 'nuevo_gatoJefe'.
//   - Persigue al perro rápido. Al tocarlo lo araña (daño de contacto DANO,
//     juega 'ataque' ANIM_ATAQUE_MS).
//   - Cada SALTO_CADA_MIN_MS..SALTO_CADA_MAX_MS, si el perro está entre
//     SALTO_DISTANCIA_MIN y SALTO_DISTANCIA_MAX, se agacha avisando
//     (SALTO_AVISO_MS: parpadea y marca dónde cae) y salta en línea recta
//     (SALTO_MS a SALTO_VELOCIDAD). Durante el salto pega SALTO_DANO.
//     La dirección se fija al empezar el aviso: moverse lo esquiva.
//   - Después del salto se queda quieto DESCANSO_MS.
//  Los números están en CONFIG.ENEMIGOS.gatoCallejero (src/config.js).
// ===============================================================

// Se llama desde moverEnemigos (COMPORTAMIENTO 'gato'). Devuelve true mientras avisa.
function moverGato(escena, enemigo, ahora) {
  const cfg = enemigo.cfg;
  // El primer salto no sale apenas llega: espera un rato al azar
  if (enemigo.proximoSalto === undefined) enemigo.proximoSalto = ahora + Phaser.Math.Between(1500, cfg.SALTO_CADA_MIN_MS);

  if (enemigo.estado === 'avisar') {
    enemigo.body.setVelocity(0, 0);
    const a = enemigo.anguloEmbestida;
    const largo = cfg.SALTO_VELOCIDAD * (cfg.SALTO_MS / 1000);
    const fx = enemigo.x + Math.cos(a) * largo;
    const fy = enemigo.y + Math.sin(a) * largo;
    // Línea corta y círculo donde cae (se puede esquivar)
    escena.avisos.lineStyle(3, COLOR_AVISO, 0.7);
    escena.avisos.lineBetween(enemigo.x, enemigo.y, fx, fy);
    escena.avisos.fillStyle(COLOR_AVISO, 0.2);
    escena.avisos.fillCircle(fx, fy, enemigo.radio + 6);
    escena.avisos.lineStyle(2, COLOR_AVISO, 0.7);
    escena.avisos.strokeCircle(fx, fy, enemigo.radio + 6);
    if (ahora >= enemigo.estadoHasta) {
      enemigo.estado = 'saltar';
      enemigo.estadoHasta = ahora + cfg.SALTO_MS;
      enemigo.danoContacto = cfg.SALTO_DANO; // el salto pega más que el arañazo
    }
    return true;
  }

  if (enemigo.estado === 'saltar') {
    const v = cfg.SALTO_VELOCIDAD;
    enemigo.body.setVelocity(Math.cos(enemigo.anguloEmbestida) * v, Math.sin(enemigo.anguloEmbestida) * v);
    if (ahora >= enemigo.estadoHasta) {
      enemigo.estado = 'descansar';
      enemigo.estadoHasta = ahora + cfg.DESCANSO_MS;
      enemigo.danoContacto = undefined;
      enemigo.proximoSalto = ahora + Phaser.Math.Between(cfg.SALTO_CADA_MIN_MS, cfg.SALTO_CADA_MAX_MS);
    }
    return false;
  }

  if (enemigo.estado === 'descansar') {
    enemigo.body.setVelocity(0, 0);
    if (ahora >= enemigo.estadoHasta) enemigo.estado = 'acercarse';
    return false;
  }

  // Acercándose: ¿toca saltar? (si un ladrido o el aturdimiento cortó el salto, ya no pega extra)
  enemigo.estado = 'acercarse';
  enemigo.danoContacto = undefined;
  const perro = perroMasCercano(escena, enemigo.x, enemigo.y);
  const d = Phaser.Math.Distance.Between(enemigo.x, enemigo.y, perro.x, perro.y);
  if (ahora >= enemigo.proximoSalto && !perro.caido && ahora >= enemigo.rodeandoHasta &&
    d >= cfg.SALTO_DISTANCIA_MIN && d <= cfg.SALTO_DISTANCIA_MAX) {
    enemigo.estado = 'avisar';
    enemigo.anguloEmbestida = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, perro.x, perro.y);
    enemigo.estadoHasta = ahora + cfg.SALTO_AVISO_MS;
    enemigo.body.setVelocity(0, 0);
    return true;
  }
  escena.moverHaciaPerro(enemigo, enemigo.velocidad, ahora);
  return false;
}

// Animación del aviso y del salto ('ataque_especial'). Devuelve true si la puso;
// si no, GameScene usa animarSpriteNuevo (idle, caminar, ataque al arañar, daño).
// La muerte la juega el cadáver (GameScene, 'nuevo_gatoJefe_muerte').
function animarGato(escena, enemigo, ahora) {
  if (enemigo.cfg.COMPORTAMIENTO !== 'gato' || !enemigo.spriteNuevo) return false;
  const clave = enemigo.texture.key + '_ataque_especial';
  const usar = ahora >= enemigo.danoAnimHasta && // el daño se ve igual que siempre
    (enemigo.estado === 'avisar' || enemigo.estado === 'saltar') && escena.anims.exists(clave);
  if (!usar) {
    // Vuelve a las animaciones normales (animarSpriteNuevo pone la que toca)
    if (enemigo.gatoCuadroFijo) {
      enemigo.gatoCuadroFijo = false;
      enemigo.anims.resume();
    }
    return false;
  }
  // Avisando: primer cuadro (zarpa arriba). Saltando: el segundo (zarpa al frente).
  // Se juega la animación y se deja quieta en ese cuadro.
  const anim = escena.anims.get(clave);
  const cuadro = anim.frames[Math.min(enemigo.estado === 'avisar' ? 0 : 1, anim.frames.length - 1)];
  if (!enemigo.anims.currentAnim || enemigo.anims.currentAnim.key !== clave) enemigo.anims.play(clave);
  enemigo.anims.pause(cuadro);
  enemigo.gatoCuadroFijo = true;
  enemigo.setFlipX(Math.cos(enemigo.anguloEmbestida) < 0);
  return true;
}

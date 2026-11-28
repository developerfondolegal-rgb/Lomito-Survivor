// ===============================================================
//  PITBULL DE PANDILLA (v0.41): dibujo en src/sprites_pitbullPandilla.js.
//  Llegan de a GRUPO_MIN..GRUPO_MAX por el mismo lado de la pantalla
//  (crearGrupo en GameScene) y cada uno recibe un lugar distinto alrededor
//  del perro (enemigo.cercoAngulo), repartidos en círculo.
//   - Lejos (más de CERCO_DISTANCIA): van directo al perro, rodeando obstáculos.
//   - Cerca: giran alrededor del perro, por fuera, hasta su lugar
//     (a CERCO_RADIO del perro). Al llegar se lanzan a morder (MORDER_MS).
//   - Después de morder vuelven a su lugar (RETIRADA_MS) y repiten.
//  El daño es el de contacto (DANO), con los multiplicadores de siempre.
//  Los números están en CONFIG.ENEMIGOS.pitbullPandilla (src/config.js).
// ===============================================================

// Reparte los lugares alrededor del perro entre los de un grupo recién creado.
// El primero queda del lado por donde llegan y el resto se reparte en círculo,
// en el orden en que vienen (así no se cruzan entre ellos).
function asignarCercoPandilla(escena, grupo, x, y) {
  if (!grupo.length) return;
  const perro = perroMasCercano(escena, x, y);
  const base = Phaser.Math.Angle.Between(perro.x, perro.y, x, y);
  const relativo = (e) => Phaser.Math.Angle.Wrap(Phaser.Math.Angle.Between(perro.x, perro.y, e.x, e.y) - base);
  const ordenados = grupo.slice().sort((a, b) => relativo(a) - relativo(b));
  const n = ordenados.length;
  ordenados.forEach((e, i) => {
    e.cercoAngulo = base + (i - (n - 1) / 2) * (Math.PI * 2 / n);
  });
}

// Se llama desde moverEnemigos (COMPORTAMIENTO 'pandilla')
function moverPandilla(escena, enemigo, ahora) {
  const cfg = enemigo.cfg;
  const perro = perroMasCercano(escena, enemigo.x, enemigo.y);
  const dist = Phaser.Math.Distance.Between(enemigo.x, enemigo.y, perro.x, perro.y);
  // Uno suelto (élite, tecla T sin grupo): su lugar es el lado por donde viene
  if (enemigo.cercoAngulo === undefined) {
    enemigo.cercoAngulo = Phaser.Math.Angle.Between(perro.x, perro.y, enemigo.x, enemigo.y);
  }

  // Mordiendo: corre directo al perro
  if (enemigo.estado === 'morder') {
    if (ahora < enemigo.estadoHasta) {
      escena.moverHaciaPerro(enemigo, enemigo.velocidad * cfg.MORDER_VELOCIDAD_MULT, ahora);
      return;
    }
    enemigo.estado = 'retirada';
    enemigo.estadoHasta = ahora + cfg.RETIRADA_MS;
    enemigo.cercoDesde = ahora;
  }

  // Lejos (o rodeando un obstáculo): directo al perro
  if (dist > cfg.CERCO_DISTANCIA || ahora < enemigo.rodeandoHasta) {
    if (enemigo.estado !== 'retirada') enemigo.estado = 'acercarse';
    escena.moverHaciaPerro(enemigo, enemigo.velocidad, ahora);
    return;
  }

  // Cerca: gira alrededor del perro hacia su lugar
  if (enemigo.estado === 'acercarse') {
    enemigo.estado = 'cercar';
    enemigo.cercoDesde = ahora;
  }
  if (enemigo.estado === 'retirada' && ahora >= enemigo.estadoHasta) enemigo.estado = 'cercar';

  const actual = Phaser.Math.Angle.Between(perro.x, perro.y, enemigo.x, enemigo.y);
  const falta = Phaser.Math.Angle.Wrap(enemigo.cercoAngulo - actual);
  const paso = Phaser.Math.Clamp(falta, -cfg.CERCO_GIRO, cfg.CERCO_GIRO);
  // Mientras le falta mucho para llegar, gira un poco más afuera (para no chocar al perro)
  const radio = cfg.CERCO_RADIO * (1 + 0.4 * Math.abs(paso) / cfg.CERCO_GIRO);
  const ox = perro.x + Math.cos(actual + paso) * radio;
  const oy = perro.y + Math.sin(actual + paso) * radio;
  const haciaObjetivo = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, ox, oy);
  const lejosObjetivo = Phaser.Math.Distance.Between(enemigo.x, enemigo.y, ox, oy);
  const vel = Math.min(enemigo.velocidad, lejosObjetivo * 6); // frena al llegar (sin temblar)
  enemigo.body.setVelocity(Math.cos(haciaObjetivo) * vel, Math.sin(haciaObjetivo) * vel);

  // ¿Llegó a su lugar? (o lleva mucho rato dando vueltas): se lanza a morder
  if (enemigo.estado === 'cercar') {
    const lx = perro.x + Math.cos(enemigo.cercoAngulo) * cfg.CERCO_RADIO;
    const ly = perro.y + Math.sin(enemigo.cercoAngulo) * cfg.CERCO_RADIO;
    const enSuLugar = Phaser.Math.Distance.Between(enemigo.x, enemigo.y, lx, ly) < cfg.CERCO_LLEGADA;
    if (enSuLugar || ahora - (enemigo.cercoDesde || ahora) > cfg.CERCO_MAX_MS) {
      enemigo.estado = 'morder';
      enemigo.estadoHasta = ahora + cfg.MORDER_MS;
      enemigo.ataqueAnimHasta = ahora + cfg.MORDER_MS; // juega 'ataque' mientras se lanza
    }
  }
}

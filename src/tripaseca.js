// ===============================================================
//  EL TRIPA SECA (v0.33): mini jefe que llega como evento de la noche,
//  igual que el curao al volante y la jauría (src/ataques.js): avisa
//  con un texto grande y después aparece fuera de la pantalla.
//  Llega una vez por noche, desde cerca de los 5:00 de partida.
//  Los números están en src/config.js: TRIPA_SECA (el evento) y
//  ENEMIGOS.tripaseca (vida, daño y ataques).
//
//  Cómo pelea:
//   - Brazo largo (si estás cerca): se detiene, marca una línea en el
//     suelo y lanza el brazo. Si te pega, te tira hacia él.
//   - Estirón (si estás más lejos): se achica avisando y cruza en
//     línea recta. Se esquiva saliéndose de la franja hacia el lado.
//   - Furia: bajo la mitad de la vida, el brazo llega más lejos y lo
//     lanza más seguido.
//  Tecla de prueba: T (llega al tiro, con su aviso).
// ===============================================================

const TEXTO_TRIPA_SECA = 'Se ve al Tripa Seca...';
const NOMBRE_TRIPA_SECA = 'El Tripa Seca';
const COLOR_TRIPA_BRAZO = 0xffcc80;   // línea del brazo
const COLOR_TRIPA_ESTIRON = 0xff7043; // franja del estirón

// Inicio de la partida (lo llama GameScene.create)
function iniciarTripaSeca(escena) {
  const C = CONFIG.TRIPA_SECA || {};
  escena.tripaLlegadas = 0;        // cuántas veces llegó esta noche (sin contar la tecla T)
  escena.tripaAvisoHasta = null;   // aviso en pantalla: aparece a este tiempo
  escena.tripaAvisoPrueba = false;
  escena.tripaProxima = ((C.DESDE_SEGUNDOS || 0) + Math.random() * (C.VARIACION_SEGUNDOS || 0)) * 1000;
  escena.textoTripaSeca = null;
  escena.barraTripaSeca = null;    // la barra y su nombre se crean cuando llega
  escena.textoBarraTripaSeca = null;
}

// El Tripa Seca vivo (o null)
function tripaSecaViva(escena) {
  return escena.enemigos.getChildren().find((e) => e.active && e.tipo === 'tripaseca' && !e.espantado) || null;
}

function tripaSecaDelMapa(escena) {
  const mapas = (CONFIG.TRIPA_SECA || {}).MAPAS;
  return !mapas || mapas.includes(escena.mapaId);
}

// Lo llama GameScene.update en cada cuadro
function actualizarTripaSeca(escena, delta) {
  const C = CONFIG.TRIPA_SECA;
  if (!C || C.ACTIVO === false) return;
  const ahora = escena.tiempoSobrevivido;

  // Terminó el aviso: aparece
  if (escena.tripaAvisoHasta !== null && ahora >= escena.tripaAvisoHasta) {
    escena.tripaAvisoHasta = null;
    quitarTextoEvento(escena, 'textoTripaSeca');
    if (!escena.amaneciendo) aparecerTripaSeca(escena);
  }

  // ¿Le toca llegar?
  if (escena.tripaAvisoHasta === null && !escena.amaneciendo && tripaSecaDelMapa(escena) &&
      escena.tripaLlegadas < (C.VECES_POR_NOCHE === undefined ? 1 : C.VECES_POR_NOCHE) &&
      ahora >= escena.tripaProxima && !tripaSecaViva(escena)) {
    if (curaoEnCamino(escena) || jauriaEnCamino(escena)) {
      escena.tripaProxima = ahora + 2500; // no llega encima de otro evento
    } else {
      escena.tripaLlegadas++;
      avisarTripaSeca(escena);
    }
  }

  dibujarBarraTripaSeca(escena, tripaSecaViva(escena));
}

// Modo de prueba (tecla T): llega al tiro, con su aviso (no cuenta para la vez de la noche)
function pruebaTripaSeca(escena) {
  if (!CONFIG.TRIPA_SECA || CONFIG.TRIPA_SECA.ACTIVO === false) return;
  if (escena.amaneciendo || escena.tripaAvisoHasta !== null || tripaSecaViva(escena)) return;
  avisarTripaSeca(escena);
}

function avisarTripaSeca(escena) {
  escena.tripaAvisoHasta = escena.tiempoSobrevivido + (CONFIG.TRIPA_SECA.AVISO_MS || 0);
  mostrarTextoEvento(escena, 'textoTripaSeca', TEXTO_TRIPA_SECA, 214, '#ffcc80');
}

// Aparece fuera de la pantalla, como un enemigo más (crearEnemigo le pone vida y daño
// con la fase, el mapa, la dificultad y el cooperativo)
function aparecerTripaSeca(escena) {
  const cfg = CONFIG.ENEMIGOS.tripaseca;
  if (!cfg) return null;
  const pos = escena.posicionFueraDePantalla();
  const en = escena.crearEnemigo('tripaseca', pos.x, pos.y, true);
  if (!en) return null;
  en.vidaMax = en.vida;
  en.furia = false;
  en.escalaBase = en.scaleX;
  en.ataqueTripa = null;
  en.danoContacto = undefined;
  en.proximoAtaque = escena.tiempoSobrevivido + 1000;
  en.proximoBrazo = 0;
  en.proximoEstiron = 0;
  en.setDepth(6.5);
  if (cfg.MASA) en.body.mass = cfg.MASA;
  escena.cameras.main.shake(250, 0.006);
  return en;
}

// Lo llama GameScene.moverEnemigos. Devuelve true mientras avisa un ataque.
function moverTripaSeca(escena, en, ahora) {
  const cfg = en.cfg;
  en.danoContacto = undefined;

  // Furia: bajo la mitad de la vida (una sola vez)
  if (!en.furia && en.vidaMax && en.vida <= en.vidaMax * cfg.FURIA_EN) {
    en.furia = true;
    en.tinteBase = cfg.FURIA_TINTE;
    en.tinte = null; // para que se pinte de nuevo
    escena.mostrarAviso('¡El Tripa Seca se enfurece!', '#ff5252');
    escena.cameras.main.shake(250, 0.008);
  }
  const alcance = en.furia ? cfg.FURIA_BRAZO_ALCANCE : cfg.BRAZO_ALCANCE;
  const g = escena.avisos;

  if (en.estado === 'avisar') {
    en.body.setVelocity(0, 0);
    const a = en.anguloEmbestida;
    const prende = Math.floor(ahora / 100) % 2 === 0;
    if (en.ataqueTripa === 'brazo') {
      // línea flaca en el suelo, hasta donde llega el brazo
      const largo = en.radio + alcance;
      g.lineStyle(prende ? 4 : 2, COLOR_TRIPA_BRAZO, prende ? 0.9 : 0.55);
      g.lineBetween(en.x, en.y, en.x + Math.cos(a) * largo, en.y + Math.sin(a) * largo);
      g.strokeCircle(en.x + Math.cos(a) * largo, en.y + Math.sin(a) * largo, cfg.BRAZO_ANCHO);
      if (ahora >= en.estadoHasta) {
        lanzarBrazoTripaSeca(escena, en, alcance);
        en.proximoBrazo = ahora + (en.furia ? cfg.FURIA_BRAZO_ESPERA_MS : cfg.BRAZO_ESPERA_MS);
        en.proximoAtaque = ahora + cfg.ESPERA_ENTRE_ATAQUES_MS;
        en.estado = 'atacar';
        en.estadoHasta = ahora + cfg.ATAQUE_MS;
      }
    } else {
      // estirón: franja por donde va a cruzar, y se achica de a poco
      const fx = en.x + Math.cos(a) * cfg.ESTIRON_LARGO;
      const fy = en.y + Math.sin(a) * cfg.ESTIRON_LARGO;
      g.lineStyle(en.radio * 2, COLOR_TRIPA_ESTIRON, 0.2);
      g.lineBetween(en.x, en.y, fx, fy);
      if (prende) {
        g.lineStyle(3, COLOR_TRIPA_ESTIRON, 0.9);
        g.lineBetween(en.x, en.y, fx, fy);
      }
      const t = Phaser.Math.Clamp(1 - (en.estadoHasta - ahora) / cfg.ESTIRON_AVISO_MS, 0, 1);
      en.setScale(en.escalaBase * (1 - 0.3 * t));
      if (ahora >= en.estadoHasta) {
        en.setScale(en.escalaBase);
        en.estado = 'embestir'; // (cuenta como embestida para el Chalequito y el árbol)
        en.estadoHasta = ahora + (cfg.ESTIRON_LARGO / cfg.ESTIRON_VELOCIDAD) * 1000;
      }
    }
    return true;
  }

  if (en.estado === 'embestir') {
    const v = cfg.ESTIRON_VELOCIDAD;
    en.body.setVelocity(Math.cos(en.anguloEmbestida) * v, Math.sin(en.anguloEmbestida) * v);
    en.danoContacto = cfg.ESTIRON_DANO;
    if (Math.floor(ahora / 40) % 2 === 0) escena.dejarSombra(en);
    if (ahora >= en.estadoHasta) {
      en.body.setVelocity(0, 0);
      en.proximoEstiron = ahora + cfg.ESTIRON_ESPERA_MS;
      en.proximoAtaque = ahora + cfg.ESPERA_ENTRE_ATAQUES_MS;
      en.estado = 'descansar';
      en.estadoHasta = ahora + cfg.ESTIRON_DESCANSO_MS;
    }
    return false;
  }

  if (en.estado === 'atacar' || en.estado === 'descansar') {
    en.body.setVelocity(0, 0);
    if (ahora >= en.estadoHasta) en.estado = 'acercarse';
    return false;
  }

  // Caminar hacia el perro y elegir el ataque según la distancia
  en.estado = 'acercarse';
  if (en.scaleX !== en.escalaBase) en.setScale(en.escalaBase);
  const perro = perroMasCercano(escena, en.x, en.y);
  const d = Phaser.Math.Distance.Between(en.x, en.y, perro.x, perro.y);
  if (!perro.caido && ahora >= en.proximoAtaque) {
    const r = perro.body ? perro.body.halfWidth : 16;
    let ataque = null;
    if (d <= en.radio + alcance + r && ahora >= en.proximoBrazo) ataque = 'brazo';
    else if (d >= cfg.ESTIRON_DISTANCIA_MIN && d <= cfg.ESTIRON_DISTANCIA_MAX && ahora >= en.proximoEstiron) ataque = 'estiron';
    if (ataque) {
      en.ataqueTripa = ataque;
      en.estado = 'avisar';
      en.anguloEmbestida = Phaser.Math.Angle.Between(en.x, en.y, perro.x, perro.y);
      en.estadoHasta = ahora + (ataque === 'brazo' ? cfg.BRAZO_AVISO_MS : cfg.ESTIRON_AVISO_MS);
      en.body.setVelocity(0, 0);
      return true;
    }
  }
  escena.moverHaciaPerro(en, en.velocidad, ahora);
  return false;
}

// Lo empujó un ladrido, lo aturdieron o huye: corta el ataque y vuelve a su forma
function cortarAtaqueTripaSeca(escena, en) {
  if (en.escalaBase && en.scaleX !== en.escalaBase) en.setScale(en.escalaBase);
  en.danoContacto = undefined;
}

// Brazo largo: pega a los perros que estén sobre la línea y los tira hacia él
function lanzarBrazoTripaSeca(escena, en, alcance) {
  const cfg = en.cfg;
  const a = en.anguloEmbestida;
  const dir = { x: Math.cos(a), y: Math.sin(a) };
  const largo = en.radio + alcance;

  // el brazo se ve un momento (línea gruesa con la mano en la punta)
  const brazo = escena.add.graphics().setDepth(7);
  brazo.lineStyle(7, 0x2a1712, 1);
  brazo.lineBetween(en.x, en.y - 8, en.x + dir.x * largo, en.y + dir.y * largo);
  brazo.lineStyle(4, 0xdba07c, 1);
  brazo.lineBetween(en.x, en.y - 8, en.x + dir.x * largo, en.y + dir.y * largo);
  brazo.fillStyle(0xf2c8a4, 1);
  brazo.fillCircle(en.x + dir.x * largo, en.y + dir.y * largo, 7);
  escena.tweens.add({ targets: brazo, alpha: 0, duration: 260, onComplete: () => brazo.destroy() });

  escena.perrosEnJuego().forEach((perro) => {
    if (perro.caido) return;
    const r = perro.body ? perro.body.halfWidth : 16;
    const dx = perro.x - en.x;
    const dy = perro.y - en.y;
    const largoEn = dx * dir.x + dy * dir.y;           // qué tan adelante está
    const lado = Math.abs(dx * dir.y - dy * dir.x);    // qué tan al lado de la línea
    if (largoEn < -r || largoEn > largo + r || lado > cfg.BRAZO_ANCHO + r) return;
    escena.conPerro(perro, () => {
      const antes = escena.vida;
      escena.danoAtaqueEnemigo = cfg.BRAZO_DANO;
      try {
        escena.recibirGolpe(escena.perro, en);
      } finally {
        escena.danoAtaqueEnemigo = undefined;
      }
      if (escena.gameOver || !(escena.vida < antes)) return; // lo esquivó: no lo tira
      if (bonusArbol(escena, 'INAMOVIBLE') > 0) return;       // Inamovible (Pitbull): no lo mueven
      // lo tira hacia él, sin dejarlo encima
      const d = Math.sqrt(dx * dx + dy * dy);
      const espacio = d - en.radio - r - 8;
      const ms = Math.min(cfg.BRAZO_TIRON_MS, (espacio / cfg.BRAZO_TIRON_VELOCIDAD) * 1000);
      if (ms < 30 || d <= 0) return;
      const v = cfg.BRAZO_TIRON_VELOCIDAD;
      escena.empujePerro = { x: (-dx / d) * v, y: (-dy / d) * v, hasta: escena.tiempoSobrevivido + ms };
      escena.textoFlotante('¡Te agarró!', '#ffcc80');
    });
  });
}

// Barra de vida de mini jefe arriba al centro (en el lugar de la del Jefe; si están los dos, más abajo).
// Usa la misma barra que el Jefe de la Plaza (pintarBarraVida, src/jefe.js).
// en = null la esconde.
function dibujarBarraTripaSeca(escena, en) {
  if (!en || !en.active) {
    if (escena.barraTripaSeca) escena.barraTripaSeca.clear();
    if (escena.textoBarraTripaSeca) escena.textoBarraTripaSeca.setVisible(false);
    if (escena.gameOver) quitarTextoEvento(escena, 'textoTripaSeca');
    return;
  }
  const e = escena.margenHudExtra || 0;
  const conJefe = escena.jefeVivo();
  const y = (conJefe ? 140 : 64) + e; // con el Jefe: debajo de su barra y del texto de los desafíos
  if (!escena.barraTripaSeca) {
    escena.barraTripaSeca = escena.add.graphics().setScrollFactor(0).setDepth(1000);
    escena.textoBarraTripaSeca = escena.add.text(escena.scale.width / 2, 0, '', {
      fontFamily: FUENTE, fontSize: '16px', color: '#ffcc80', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);
  }
  escena.textoBarraTripaSeca.setPosition(escena.scale.width / 2, y - 22);
  escena.barraTripaSeca.clear();
  pintarBarraVida(escena.barraTripaSeca, escena.textoBarraTripaSeca, en, {
    ancho: 340, alto: 12, x: escena.scale.width / 2, y,
    furiaEn: en.cfg.FURIA_EN, texto: NOMBRE_TRIPA_SECA + (en.furia ? '  ¡FURIOSO!' : '')
  });
}

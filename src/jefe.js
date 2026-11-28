// ===============================================================
//  JEFE FINAL: "El Jefe de la Plaza"
//  Un perro enorme que aparece al final de la noche.
//  Sus números (vida, velocidad, ataques) están en src/config.js (sección JEFE).
//
//  Cómo pelea:
//   - Camina hacia el perro y cada cierto tiempo ataca.
//   - Embestida: se queda quieto, marca una franja roja y corre en línea recta.
//   - Aullido: se queda quieto con anillos naranjos y llama a una manada.
//   - Furia: al bajar a la mitad de su vida se pone rojo y más rápido.
//  Los empujones del Ladrido, la Mandíbula y el Aullido de fusión no lo mueven.
// ===============================================================

const COLOR_JEFE_AVISO = 0xff5252;   // rojo: franja de la embestida
const COLOR_JEFE_AULLIDO = 0xffa726; // naranjo: anillos del aullido
const COLOR_JEFE_FURIA = 0xff8a80;   // tinte rojizo en furia
const NOMBRE_JEFE = 'El Jefe de la Plaza';

// Dibujo del jefe (24 x 18). Mismas reglas que src/sprites.js:
// C = pelaje, c = sombra, L = hocico y guata, S = cicatriz, E = ojo rojo,
// M = collar, P = púas del collar. Mira hacia la derecha.
SPRITES.jefe = {
  colores: { C: 0x4b3f38, c: 0x2b231f, L: 0x8a7565, S: 0xc77d7d, E: 0xff3b30, M: 0x7a1c1c, P: 0xd0d0d0 },
  animacion: 5,
  cuadros: [
    [
      '................KK...KK.',
      '...............KcCK.KcCK',
      '..............KCCCCKKCCK',
      '..............KCCCCCCCCK',
      '..............KCSECCCCCK',
      '..............KCCCCCLLLK',
      '..............KCCCCKWKWK',
      '.K...........KMPMPMKKKK.',
      '.KcK.KKKKKKKKMMMMMMK....',
      '..KKCCCCCCCCCCCCCCCK....',
      '..KCCCCCCCCCCCCCCCCK....',
      '..KCcCCCCCCCCCCCCcCK....',
      '..KcLLLLLLLLLLLLLLcK....',
      '..KCCCK........KCCCK....',
      '..KCCK..........KCCK....',
      '..KCCK..........KCCK....',
      '..KCCK..........KCCK....',
      '.KKKKK.........KKKKK....'
    ],
    [
      '................KK...KK.',
      '...............KcCK.KcCK',
      '..............KCCCCKKCCK',
      '..............KCCCCCCCCK',
      '..............KCSECCCCCK',
      '..............KCCCCCLLLK',
      '..............KCCCCKWKWK',
      '.K...........KMPMPMKKKK.',
      '.KcK.KKKKKKKKMMMMMMK....',
      '..KKCCCCCCCCCCCCCCCK....',
      '..KCCCCCCCCCCCCCCCCK....',
      '..KCcCCCCCCCCCCCCcCK....',
      '..KcLLLLLLLLLLLLLLcK....',
      '..KCCCK........KCCCK....',
      '...KCCK........KCCK.....',
      '....KCCK......KCCK......',
      '....KCCK......KCCK......',
      '....KKKK......KKKK......'
    ]
  ]
};

// Crea al jefe fuera de la pantalla. Se suma al grupo de enemigos para que
// las mordidas, el ladrido y las huellas le hagan daño como a cualquiera.
function crearJefe(escena) {
  const J = CONFIG.JEFE;
  const pos = escena.posicionFueraDePantalla();
  const lugar = escena.plaza.buscarLibre(pos.x, pos.y, J.RADIO + 6);

  const jefe = agregarSprite(escena, lugar.x, lugar.y, 'jefe');
  jefe.setScale(ESCALA_PIXEL * J.TAMANO).setDepth(7);
  escena.enemigos.add(jefe);
  ponerChoqueCircular(jefe, J.RADIO);
  jefe.body.mass = 50; // los perros chicos casi no lo empujan

  // Datos que usa el resto del juego (iguales a los de un enemigo normal)
  jefe.esJefe = true;
  jefe.tipo = 'jefe';
  jefe.cfg = { DANO: J.DANO, HUESOS: J.HUESOS, VELOCIDAD: J.VELOCIDAD, COMPORTAMIENTO: 'jefe' };
  jefe.radio = J.RADIO;
  // Dificultad del mapa y global (src/mapas.js): más vida y más daño
  jefe.vida = J.VIDA * factorDificultad(escena.mapaId, 'VIDA');
  if (escena.coop) jefe.vida *= CONFIG.COOP.VIDA_ENEMIGOS_MULT || 1; // v0.27: cooperativo, más vida (src/coop.js)
  jefe.vidaMax = jefe.vida;
  jefe.multDano = factorDificultad(escena.mapaId, 'DANO');
  jefe.velocidad = J.VELOCIDAD;
  jefe.elite = false;
  jefe.borde = null;
  jefe.dePrueba = false;
  jefe.tinte = 'normal';
  jefe.tinteBase = null;
  jefe.huyendoHasta = 0;
  jefe.empujadoHasta = 0;
  jefe.aturdidoHasta = 0;
  jefe.destelloHasta = 0;
  jefe.recargaHasta = 0;
  jefe.rodeandoHasta = 0;
  jefe.rodeoObstaculo = null;
  jefe.rodeoLado = 1;
  jefe.rodeoInicio = 0;

  // Su propia forma de pelear
  jefe.estado = 'caminar';
  jefe.estadoHasta = 0;
  jefe.proximoAtaque = escena.tiempoSobrevivido + J.ATAQUE_CADA_MS;
  jefe.ultimoAtaque = Math.random() < 0.5 ? 'aullido' : 'embestida';
  jefe.anguloEmbestida = 0;
  jefe.furia = false;
  return jefe;
}

// Se llama en cada cuadro mientras el jefe está vivo
function actualizarJefe(escena, jefe) {
  const J = CONFIG.JEFE;
  const ahora = escena.tiempoSobrevivido;
  const perro = perroMasCercano(escena, jefe.x, jefe.y); // cooperativo: el más cercano (src/coop.js)
  const g = escena.avisosJefe;
  g.clear();

  // Furia: a la mitad de la vida (una sola vez)
  if (!jefe.furia && jefe.vida <= jefe.vidaMax * J.FURIA_EN) {
    jefe.furia = true;
    jefe.velocidad = J.FURIA_VELOCIDAD;
    escena.mostrarAvisoGrande('¡El Jefe está furioso!', 'Ahora es más rápido', '#ff5252');
    escena.cameras.main.shake(300, 0.01);
  }
  const aviso = jefe.furia ? J.FURIA_AVISO : 1;
  const espera = jefe.furia ? J.FURIA_ATAQUE_CADA_MS : J.ATAQUE_CADA_MS;
  jefe.cfg.DANO = jefe.estado === 'embestir' ? J.EMBESTIDA_DANO : J.DANO;

  if (jefe.estado === 'caminar') {
    const angulo = escena.anguloHaciaPerro(jefe, ahora);
    jefe.body.setVelocity(Math.cos(angulo) * jefe.velocidad, Math.sin(angulo) * jefe.velocidad);
    if (ahora >= jefe.proximoAtaque) {
      // Alterna los ataques (así siempre se ven los dos)
      jefe.ultimoAtaque = jefe.ultimoAtaque === 'embestida' ? 'aullido' : 'embestida';
      jefe.body.setVelocity(0, 0);
      if (jefe.ultimoAtaque === 'embestida') {
        jefe.estado = 'avisarEmbestida';
        jefe.anguloEmbestida = Phaser.Math.Angle.Between(jefe.x, jefe.y, perro.x, perro.y);
        jefe.estadoHasta = ahora + J.EMBESTIDA_AVISO_MS * aviso;
      } else {
        jefe.estado = 'avisarAullido';
        jefe.estadoHasta = ahora + J.AULLIDO_AVISO_MS * aviso;
      }
      jefe.avisoTotal = jefe.estadoHasta - ahora;
    }
  } else if (jefe.estado === 'avisarEmbestida') {
    // Quieto, mirando al perro, con una franja roja que marca por dónde pasará
    jefe.body.setVelocity(0, 0);
    const largo = J.EMBESTIDA_VELOCIDAD * (J.EMBESTIDA_MS / 1000);
    const fx = jefe.x + Math.cos(jefe.anguloEmbestida) * largo;
    const fy = jefe.y + Math.sin(jefe.anguloEmbestida) * largo;
    g.lineStyle(jefe.radio * 2, COLOR_JEFE_AVISO, 0.22);
    g.lineBetween(jefe.x, jefe.y, fx, fy);
    if (Math.floor(ahora / 120) % 2 === 0) {
      g.lineStyle(3, COLOR_JEFE_AVISO, 0.9);
      g.lineBetween(jefe.x, jefe.y, fx, fy);
    }
    jefe.setFlipX(Math.cos(jefe.anguloEmbestida) < 0);
    if (ahora >= jefe.estadoHasta) {
      jefe.estado = 'embestir';
      jefe.estadoHasta = ahora + J.EMBESTIDA_MS;
    }
  } else if (jefe.estado === 'embestir') {
    const v = J.EMBESTIDA_VELOCIDAD;
    jefe.body.setVelocity(Math.cos(jefe.anguloEmbestida) * v, Math.sin(jefe.anguloEmbestida) * v);
    if (Math.floor(ahora / 40) % 2 === 0) escena.dejarSombra(jefe);
    if (ahora >= jefe.estadoHasta) {
      jefe.estado = 'descansar';
      jefe.estadoHasta = ahora + J.EMBESTIDA_DESCANSO_MS;
    }
  } else if (jefe.estado === 'descansar') {
    jefe.body.setVelocity(0, 0);
    if (ahora >= jefe.estadoHasta) terminarAtaqueJefe(jefe, ahora, espera);
  } else if (jefe.estado === 'avisarAullido') {
    // Quieto con anillos naranjos que se cierran hacia él
    jefe.body.setVelocity(0, 0);
    const falta = Math.max(0, (jefe.estadoHasta - ahora) / jefe.avisoTotal); // de 1 a 0
    g.lineStyle(4, COLOR_JEFE_AULLIDO, 0.9);
    g.strokeCircle(jefe.x, jefe.y, jefe.radio + 15 + falta * 120);
    g.lineStyle(2, COLOR_JEFE_AULLIDO, 0.6);
    g.strokeCircle(jefe.x, jefe.y, jefe.radio + 15 + ((falta * 120 + 60) % 120));
    if (ahora >= jefe.estadoHasta) {
      aullarJefe(escena, jefe);
      terminarAtaqueJefe(jefe, ahora, espera);
    }
  }

  // Caminar (y mirar hacia donde va)
  if (jefe.estado === 'caminar' || jefe.estado === 'embestir') {
    animarCaminar(jefe, jefe.body.velocity.x, jefe.body.velocity.y);
  } else if (jefe.anims.isPlaying) {
    jefe.anims.stop();
    jefe.setFrame(0);
  }

  // Color: destello blanco al recibir daño, parpadeo al avisar, rojizo en furia
  let tinte = jefe.furia ? 'furia' : 'normal';
  if (ahora < jefe.destelloHasta) tinte = 'destello';
  else if ((jefe.estado === 'avisarEmbestida' || jefe.estado === 'avisarAullido') && Math.floor(ahora / 100) % 2 === 0) tinte = 'aviso';
  if (jefe.tinte !== tinte) {
    jefe.tinte = tinte;
    if (tinte === 'destello') jefe.setTintFill(COLOR_BLANCO);
    else if (tinte === 'aviso') jefe.setTintFill(jefe.estado === 'avisarAullido' ? COLOR_JEFE_AULLIDO : COLOR_JEFE_AVISO);
    else if (tinte === 'furia') jefe.setTint(COLOR_JEFE_FURIA);
    else jefe.clearTint();
  }
}

function terminarAtaqueJefe(jefe, ahora, espera) {
  jefe.estado = 'caminar';
  jefe.proximoAtaque = ahora + espera;
}

// Aullido: onda naranja y llega una manada alrededor del jefe
function aullarJefe(escena, jefe) {
  const J = CONFIG.JEFE;
  const onda = escena.add.image(jefe.x, jefe.y, texturaOnda(escena, 220)).setDepth(5).setTint(COLOR_JEFE_AULLIDO);
  onda.setScale(ESCALA_PIXEL * 0.2);
  escena.tweens.add({ targets: onda, scale: ESCALA_PIXEL, alpha: 0, duration: 500, onComplete: () => onda.destroy() });
  escena.cameras.main.shake(200, 0.006);

  const tipo = CONFIG.ENEMIGOS.manada ? 'manada' : Object.keys(CONFIG.ENEMIGOS)[0];
  const cuantos = jefe.furia ? J.FURIA_AULLIDO_MANADA : J.AULLIDO_MANADA;
  for (let i = 0; i < cuantos; i++) {
    const angulo = (i / cuantos) * Math.PI * 2 + Math.random() * 0.5;
    const x = Phaser.Math.Clamp(jefe.x + Math.cos(angulo) * J.AULLIDO_DISTANCIA, 20, CONFIG.MAPA_ANCHO - 20);
    const y = Phaser.Math.Clamp(jefe.y + Math.sin(angulo) * J.AULLIDO_DISTANCIA, 20, CONFIG.MAPA_ALTO - 20);
    escena.crearEnemigo(tipo, x, y, true);
  }
}

// Barra de vida grande arriba al centro de la pantalla
function dibujarBarraJefe(escena, jefe) {
  const g = escena.barraJefe;
  g.clear();
  if (!jefe || !jefe.active) {
    escena.textoJefe.setVisible(false);
    return;
  }
  pintarBarraVida(g, escena.textoJefe, jefe, {
    ancho: 460, alto: 16, y: 64 + (escena.margenHudExtra || 0), x: escena.scale.width / 2,
    furiaEn: CONFIG.JEFE.FURIA_EN, texto: NOMBRE_JEFE + (jefe.furia ? '  ¡FURIOSO!' : '')
  });
}

// v0.33: dibuja una barra de vida de jefe (la usan el Jefe de la Plaza y el
// Tripa Seca, src/tripaseca.js). op: { ancho, alto, x (centro), y, furiaEn, texto }
function pintarBarraVida(g, texto, ser, op) {
  const ancho = op.ancho;
  const alto = op.alto;
  const x = op.x - ancho / 2;
  const y = op.y;
  const porcentaje = Math.max(0, ser.vida / ser.vidaMax);

  g.fillStyle(0x000000, 0.7);
  g.fillRect(x - 3, y - 3, ancho + 6, alto + 6);
  g.fillStyle(0x4a1010, 1);
  g.fillRect(x, y, ancho, alto);
  g.fillStyle(ser.furia ? 0xff1744 : 0xd32f2f, 1);
  g.fillRect(x, y, ancho * porcentaje, alto);
  // rayita donde empieza la furia
  g.fillStyle(0xffffff, 0.7);
  g.fillRect(x + ancho * op.furiaEn - 1, y, 2, alto);
  g.lineStyle(2, 0xffd54f, 1);
  g.strokeRect(x, y, ancho, alto);

  texto.setVisible(true);
  texto.setText(op.texto);
}

// ===============================================================
//  CHOW CHOW (v0.35): poder "Melena" y las mejoras de su árbol.
//  - Pasivo: recibe menos daño (CONFIG.RAZAS.chowchow.MELENA_MENOS_DANO).
//  - Activo "Rugido": misma tecla / botón que el Sprint del Galgo
//    (J1 Espacio, J2 Enter o botón A del control, celular botón RUGIR).
//    Los enemigos cercanos huyen; el Jefe y El Tripa Seca reciben daño.
//  - Árbol (números en src/config.js, ARBOL.RAZAS.chowchow; textos en src/arbol.js):
//    Nube de pelo, Lengua de intimidación, Bostezo real, No corro llego y Trono.
//  Cooperativo: lo de cada perro se guarda en variables de la escena que
//  src/coop.js intercambia (tronoEscudo, tronoQuietoMs, tronoEspera,
//  esperaBostezo, graficoChow). Las nubes de pelo son de los dos (nubesPelo).
// ===============================================================

// Se llama al empezar la partida (GameScene.create, después de iniciarArbol)
function iniciarChow(escena) {
  escena.tronoEscudo = 0;      // vida que le queda al escudo del Trono (0 = sin escudo)
  escena.tronoQuietoMs = 0;    // cuánto lleva quieto
  escena.tronoEspera = 0;      // recarga del Trono que falta (ms)
  escena.esperaBostezo = 0;
  escena.graficoChow = null;   // se crea al primer dibujo (uno por perro)
  escena.nubesPelo = [];       // { x, y, radio, hasta, total, lentitud }
  escena.graficoNubes = null;
}

// Pasivo de la Melena: 0.06 = 6% menos daño (con el árbol, más)
function reduccionMelena(escena) {
  if (escena.poder !== 'melena') return 0;
  return Math.min(0.9, (escena.base.MELENA_MENOS_DANO || 0) + bonusArbol(escena, 'MELENA_MENOS_DANO'));
}

// ---------------- Rugido ----------------

function rugirChow(escena) {
  const B = escena.base;
  const p = escena.perro;
  const ahora = escena.tiempoSobrevivido;
  const radio = B.RUGIDO_RADIO || 140;
  escena.poderCarga = 0;
  escena.marcarAtaqueVisual();

  // Onda naranja que se expande y un anillo que queda un momento
  const onda = escena.add.image(p.x, p.y, texturaOnda(escena, radio)).setDepth(5).setScale(ESCALA_PIXEL * 0.2).setTint(0xffb74d);
  escena.tweens.add({ targets: onda, scale: ESCALA_PIXEL, alpha: 0, duration: 450, onComplete: () => onda.destroy() });
  const anillo = escena.add.circle(p.x, p.y, radio).setStrokeStyle(3, 0xffcc80, 0.8).setDepth(5);
  escena.tweens.add({ targets: anillo, alpha: 0, duration: 500, onComplete: () => anillo.destroy() });
  escena.textoFlotante('¡GRRR!', '#ffb74d');
  tocarRugido(escena);

  const danoLeon = bonusArbol(escena, 'RUGIDO_DANO'); // León de la plaza
  escena.enemigos.getChildren().slice().forEach((en) => {
    if (!en.active) return;
    if (Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) > radio + (en.radio || 0)) return;
    const grande = en.esJefe || (en.cfg && en.cfg.COMPORTAMIENTO === 'tripaseca');
    if (grande) {
      escena.danarEnemigo(en, (B.RUGIDO_DANO_JEFE || 0) + danoLeon); // no huyen: les duele
      return;
    }
    en.huyendoHasta = Math.max(en.huyendoHasta || 0, ahora + (B.RUGIDO_HUIR_MS || 1200));
    if (danoLeon > 0) escena.danarEnemigo(en, danoLeon);
  });

  // Nube de pelo: queda un aura donde rugió que frena a los enemigos
  const nubeMs = bonusArbol(escena, 'NUBE_MS');
  if (nubeMs > 0) {
    escena.nubesPelo.push({ x: p.x, y: p.y, radio, hasta: ahora + nubeMs, total: nubeMs, lentitud: bonusArbol(escena, 'NUBE_LENTITUD') });
  }
}

// Gruñido grave hecho con el sonido del navegador (como la bocina del curao, src/ataques.js)
function tocarRugido(escena) {
  const volumen = escena.base.RUGIDO_VOLUMEN || 0;
  const ctx = escena.sound && escena.sound.context;
  if (volumen <= 0 || !ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime;
    const dura = 0.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volumen, t0 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dura);
    gain.connect(ctx.destination);
    [[150, 70], [113, 55]].forEach(([desde, hasta]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(desde, t0);
      osc.frequency.exponentialRampToValueAtTime(hasta, t0 + dura);
      osc.connect(gain);
      osc.start(t0);
      osc.stop(t0 + dura + 0.02);
    });
  } catch (e) {
    // sin sonido: el rugido igual se ve
  }
}

// ---------------- Cada cuadro, por perro (lo llama actualizarArbol) ----------------

function actualizarChow(escena, delta, puedeAtacar) {
  const A = (k) => bonusArbol(escena, k);
  const p = escena.perro;
  const ahora = escena.tiempoSobrevivido;

  // Trono (Majestad): quieto un rato = escudo hasta moverse o que lo rompan
  if (A('TRONO_ESCUDO') > 0) {
    const v = p.body ? p.body.velocity.length() : 0;
    const moviendo = v > 10 || p.caido;
    if ((escena.tronoEscudo || 0) > 0) {
      if (moviendo) {
        escena.tronoEscudo = 0;
        escena.tronoEspera = A('TRONO_RECARGA_MS');
      }
    } else {
      escena.tronoEspera = Math.max(0, (escena.tronoEspera || 0) - delta);
      escena.tronoQuietoMs = moviendo ? 0 : (escena.tronoQuietoMs || 0) + delta;
      if (escena.tronoEspera <= 0 && escena.tronoQuietoMs >= A('TRONO_QUIETO_MS') && !escena.amaneciendo) {
        escena.tronoEscudo = A('TRONO_ESCUDO');
        escena.textoFlotante('¡Trono!', '#ffd54f');
      }
    }
  }

  // Bostezo real (Lengua): cada cierto tiempo aturde a los que están muy cerca
  if (A('BOSTEZO_CADA_MS') > 0 && !escena.amaneciendo) {
    escena.esperaBostezo = Math.min(A('BOSTEZO_CADA_MS'), (escena.esperaBostezo || 0) + delta);
    const radio = A('BOSTEZO_RADIO');
    const cerca = escena.enemigos.getChildren().filter((en) => en.active && !en.esJefe &&
      Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) <= radio + (en.radio || 0));
    if (escena.esperaBostezo >= A('BOSTEZO_CADA_MS') && puedeAtacar && !p.caido && cerca.length > 0) {
      escena.esperaBostezo = 0;
      cerca.forEach((en) => { en.aturdidoHasta = Math.max(en.aturdidoHasta || 0, ahora + A('BOSTEZO_ATURDIR_MS')); });
      const onda = escena.add.image(p.x, p.y, texturaOnda(escena, radio)).setDepth(5).setScale(ESCALA_PIXEL * 0.2).setTint(0xb39ddb);
      escena.tweens.add({ targets: onda, scale: ESCALA_PIXEL, alpha: 0, duration: 600, onComplete: () => onda.destroy() });
      escena.textoFlotante('¡Bostezo real!', '#d1c4e9');
    }
  }

  // Dibujo del escudo del Trono (uno por perro)
  if (A('TRONO_ESCUDO') > 0) {
    if (!escena.graficoChow) escena.graficoChow = escena.add.graphics().setDepth(11);
    const g = escena.graficoChow;
    g.clear();
    if ((escena.tronoEscudo || 0) > 0) {
      const parte = escena.tronoEscudo / A('TRONO_ESCUDO');
      g.lineStyle(3, 0xffd54f, 0.4 + 0.5 * parte);
      g.strokeCircle(p.x, p.y, escena.base.RADIO + 12);
      g.fillStyle(0xffd54f, 0.12 * parte);
      g.fillCircle(p.x, p.y, escena.base.RADIO + 12);
    }
  }
}

// El Trono absorbe el golpe. Devuelve el daño que queda para la vida.
function absorberTrono(escena, dano) {
  const escudo = escena.tronoEscudo || 0;
  if (escudo <= 0 || dano <= 0) return dano;
  const usado = Math.min(escudo, dano);
  escena.tronoEscudo = escudo - usado;
  if (escena.tronoEscudo <= 0) {
    escena.tronoEscudo = 0;
    escena.tronoEspera = bonusArbol(escena, 'TRONO_RECARGA_MS');
    escena.textoFlotante('¡Se rompió el trono!', '#ffcc80');
  }
  return dano - usado;
}

// ---------------- Una vez por cuadro, para los dos perros ----------------
// Nube de pelo y Lengua de intimidación: frenan enemigos (el jefe no se frena).
// Se llama en GameScene.update después de mover a los enemigos (fuera del turno de J2).
function frenarEnemigosChow(escena) {
  const ahora = escena.tiempoSobrevivido;
  escena.nubesPelo = (escena.nubesPelo || []).filter((n) => n.hasta > ahora);
  const nubes = escena.nubesPelo;

  // Perros con Lengua de intimidación
  const lenguas = [];
  const agregar = (perro, arbol) => {
    if (perro && !perro.caido && arbol && arbol.LENGUA_RADIO > 0) lenguas.push({ perro, radio: arbol.LENGUA_RADIO, lentitud: arbol.LENGUA_LENTITUD || 0 });
  };
  agregar(escena.perro, escena.arbol);
  if (escena.jugador2) agregar(escena.jugador2.perro, escena.jugador2.arbol);

  if (nubes.length > 0 || lenguas.length > 0) {
    const humanos = CONFIG.ARBOL.LENGUA_HUMANOS || [];
    escena.enemigos.getChildren().forEach((en) => {
      if (!en.active || en.esJefe || ahora < en.empujadoHasta) return;
      let factor = 1;
      let nube = 0;
      nubes.forEach((n) => {
        if (Phaser.Math.Distance.Between(n.x, n.y, en.x, en.y) <= n.radio) nube = Math.max(nube, n.lentitud);
      });
      factor *= 1 - nube;
      if (humanos.includes(en.tipo)) {
        let lengua = 0;
        lenguas.forEach((l) => {
          if (Phaser.Math.Distance.Between(l.perro.x, l.perro.y, en.x, en.y) <= l.radio + (en.radio || 0)) lengua = Math.max(lengua, l.lentitud);
        });
        factor *= 1 - lengua;
      }
      if (factor < 1) en.body.velocity.scale(Math.max(0, factor));
    });
  }

  // Dibujo de las nubes de pelo
  if (nubes.length === 0 && !escena.graficoNubes) return;
  if (!escena.graficoNubes) escena.graficoNubes = escena.add.graphics().setDepth(4);
  const g = escena.graficoNubes;
  g.clear();
  nubes.forEach((n) => {
    const parte = Math.max(0, (n.hasta - ahora) / n.total);
    g.fillStyle(0x3c4660, 0.22 * parte);
    g.fillCircle(n.x, n.y, n.radio);
    g.lineStyle(2, 0x9fa8da, 0.45 * parte);
    g.strokeCircle(n.x, n.y, n.radio);
  });
}

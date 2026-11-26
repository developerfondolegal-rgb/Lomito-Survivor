// ===============================================================
//  ATAQUES: evoluciones de ataque, ataques secundarios (Rasguño y
//  Escarbar) y los eventos peligrosos "el curao al volante" y "la jauría".
//  Los números están en src/config.js (secciones ATAQUES, CURAO y JAURIA).
//  Aquí están los textos y el código.
//
//  Para agregar una evolución nueva:
//   1. Copia un bloque de EVOLUCIONES (aquí abajo) con un id nuevo.
//   2. En src/config.js, dentro de ATAQUES.EVOLUCIONES, copia un
//      bloque con ese id y elige RAZA, INSTINTO y OBJETO.
//   3. Lo que HACE se programa en este archivo (busca "tieneEvolucion").
// ===============================================================

// Evoluciones: transforman el ataque de una raza. Aparecen como carta
// dorada cuando el INSTINTO de ataque está en su nivel máximo y tienes
// el OBJETO pedido (en config.js).
const EVOLUCIONES = [
  { id: 'rebote',    nombre: 'Mordida callejera',  frase: 'Cada mordida rebota y muerde a otros enemigos cercanos.' },
  { id: 'sacudida',  nombre: 'Agarre de pitbull',  frase: 'La Mandíbula de hierro sujeta y sacude al enemigo. Al soltarlo, daña en área.' },
  { id: 'embestida', nombre: 'Embestida de galgo', frase: 'El sprint es una embestida que daña y aparta a todo lo que atraviesas.' },
  { id: 'marca',     nombre: 'Aullido rastreador', frase: 'El ladrido marca a los enemigos: reciben más daño de todo.' }
];

// Texto del aviso del auto
const TEXTO_CURAO = '¡Viene un curao al volante!';

// ---------------------------------------------------------------
//  Inicio de la partida (lo llama GameScene.create)
// ---------------------------------------------------------------
function iniciarAtaques(escena) {
  escena.evoluciones = {};          // evoluciones logradas (id: true)
  escena.esperaRasguno = 0;
  escena.esperaEscarbar = 0;
  escena.terrones = [];             // terrones de Escarbar volando
  escena.agarre = null;             // enemigo sujeto por el Agarre de pitbull
  escena.agarreListoEn = 0;
  escena.capaMarcas = escena.add.graphics().setDepth(801);  // miras del Aullido rastreador (sobre la oscuridad)

  // El curao al volante (uno o varios autos a la vez)
  escena.curaos = [];               // autos en camino
  escena.proximoCurao = null;       // cuándo llegan los próximos (null = todavía no se sortea)
  escena.numeroCurao = 0;
  escena.capaCuraoMundo = escena.add.graphics().setDepth(801);   // franja de aviso y luz de los faros
  escena.capaCuraoPantalla = escena.add.graphics().setScrollFactor(0).setDepth(1550); // borde rojo y flecha
  escena.textoCurao = null;
  escena.empujePerro = null;        // empujón del auto (o de la jauría) al perro

  // La jauría (estampida de perros en fila)
  escena.jaurias = [];              // carriles en camino
  escena.proximaJauria = null;
  escena.numeroJauria = 0;
  escena.jauriaGolpeo = false;
  escena.capaJauriaMundo = escena.add.graphics().setDepth(801);
  escena.capaJauriaPantalla = escena.add.graphics().setScrollFactor(0).setDepth(1549);
  escena.textoJauria = null;

  // Dibujos (solo la primera vez). Los íconos de instintos los usa la carta dorada de evolución
  crearTexturasInstintos(escena);
  if (!escena.textures.exists('auto_curao')) {
    crearTexturaPixel(escena, 'auto_curao', {
      // cacharro verde con focos blancos encendidos
      colores: { C: 0x5f8f3a, c: 0x3d6224, V: 0x9fd3ff, L: 0xffffff, R: 0xff3030 },
      cuadros: [DIBUJO_AUTO]
    });
  }
  if (!escena.textures.exists('terron')) {
    crearTexturaPixel(escena, 'terron', {
      colores: { T: 0x8d6e63, t: 0x5d4037 },
      cuadros: [['.tt.', 'tTTt', 'tTtt', '.tt.']]
    });
  }

  // v0.24: Patada trasera, Tirar caca, Meada, Ladrido fuerte y Hedor (src/ataques_nuevos.js)
  iniciarAtaquesNuevos(escena);
}

// Lo llama GameScene.update en cada cuadro (después de la mordida)
function actualizarAtaques(escena, delta, puedeAtacar) {
  const ahora = escena.tiempoSobrevivido;
  const A = CONFIG.ATAQUES;

  // Rasguño: zarpazo en abanico hacia el enemigo más cercano
  const nvR = escena.instintos.rasguno || 0;
  if (nvR > 0 && puedeAtacar) {
    const esperaR = intervaloRasguno(nvR) * factorEnfriamiento(escena); // Lomo ágil (src/ataques_nuevos.js)
    escena.esperaRasguno = Math.min(esperaR, escena.esperaRasguno + delta);
    if (escena.esperaRasguno >= esperaR && rasgunar(escena, nvR)) escena.esperaRasguno = 0;
  }

  // Escarbar: lanza terrones que dañan y frenan
  const nvE = escena.instintos.escarbar || 0;
  if (nvE > 0 && puedeAtacar) {
    const esperaE = intervaloEscarbar(nvE) * factorEnfriamiento(escena);
    escena.esperaEscarbar = Math.min(esperaE, escena.esperaEscarbar + delta);
    if (escena.esperaEscarbar >= esperaE && escarbar(escena, nvE)) escena.esperaEscarbar = 0;
  }
  moverTerrones(escena, delta);

  // v0.24: ataques nuevos y Lengüetazo (src/ataques_nuevos.js)
  actualizarAtaquesNuevos(escena, delta, puedeAtacar);

  // Enemigos frenados por la tierra (el jefe no se frena)
  // (cooperativo: solo en el turno de J1, para no frenarlos dos veces por cuadro, src/coop.js)
  const lentitud = Math.max(0, 1 - A.ESCARBAR.LENTITUD);
  if (!escena.enJ2) escena.enemigos.getChildren().forEach((en) => {
    if (en.esJefe || !(ahora < en.lentoHasta) || ahora < en.empujadoHasta) return;
    en.body.velocity.scale(lentitud);
  });

  // Evoluciones
  actualizarAgarre(escena);
  if (tieneEvolucion(escena, 'embestida') && escena.enSprint() && puedeAtacar) embestidaGalgo(escena);
  dibujarMarcas(escena);
}

// ---------------------------------------------------------------
//  EVOLUCIONES
// ---------------------------------------------------------------

function cfgEvolucion(id) {
  return (CONFIG.ATAQUES.EVOLUCIONES || {})[id];
}

function buscarEvolucion(id) {
  return EVOLUCIONES.find((e) => e.id === id) || { id, nombre: id, frase: '' };
}

function tieneEvolucion(escena, id) {
  return !!(escena.evoluciones && escena.evoluciones[id]);
}

// Evoluciones de la raza de la partida (las que tienen números en config.js)
function evolucionesDeRaza(razaId) {
  return EVOLUCIONES.filter((e) => cfgEvolucion(e.id) && cfgEvolucion(e.id).RAZA === razaId);
}

// ¿Cumple lo que pide? Devuelve { listo, requisito, progreso }
function estadoEvolucion(escena, evo) {
  const c = cfgEvolucion(evo.id);
  const max = CONFIG.INSTINTO_NIVEL_MAX;
  const nInst = escena.instintos[c.INSTINTO] || 0;
  const pide = c.OBJETO ? (c.OBJETO_NIVEL || 1) : 0;
  const nObj = c.OBJETO ? escena.nivelObjeto(c.OBJETO) : 0;
  const nombreObj = c.OBJETO ? buscarObjeto(c.OBJETO).nombre : '';
  const requisito = nombreInstinto(c.INSTINTO) + ' Nv ' + max +
    (c.OBJETO ? ' + ' + nombreObj + (pide > 1 ? ' Nv ' + pide : '') : '');
  const progreso = nombreInstinto(c.INSTINTO) + ' ' + nInst + '/' + max +
    (c.OBJETO ? ' + ' + nombreObj + ' ' + Math.min(nObj, pide) + '/' + pide : '');
  return { listo: nInst >= max && nObj >= pide, requisito, progreso };
}

// Las que se pueden elegir ahora (salen como carta dorada)
function evolucionesDisponibles(escena) {
  return evolucionesDeRaza(escena.razaId).filter((e) => !tieneEvolucion(escena, e.id) && estadoEvolucion(escena, e).listo);
}

function nombresEvoluciones(escena) {
  return EVOLUCIONES.filter((e) => tieneEvolucion(escena, e.id)).map((e) => e.nombre);
}

function aplicarEvolucion(escena, id) {
  escena.evoluciones[id] = true;
  escena.mostrarAviso('¡Evolución: ' + buscarEvolucion(id).nombre + '!', '#ffab40');
  escena.cameras.main.flash(250, 255, 200, 80);
  escena.actualizarInventario();
}

// Carta dorada de evolución (la usa GameScene.mostrarCartas)
function dibujarCartaEvolucion(escena, evo, i, cx, cy, anchoCarta, altoCarta) {
  const c = cfgEvolucion(evo.id);
  const fondo = escena.add.rectangle(cx, cy, anchoCarta, altoCarta, 0x5a3608)
    .setStrokeStyle(5, 0xffab00)
    .setInteractive({ useHandCursor: true });
  fondo.on('pointerover', () => fondo.setStrokeStyle(6, 0xffffff));
  fondo.on('pointerout', () => fondo.setStrokeStyle(5, 0xffab00));
  fondo.on('pointerdown', () => escena.tocarCarta(i));

  const tecla = escena.add.text(cx, cy - 108, '[' + (i + 1) + ']  ★ EVOLUCIÓN ★', {
    fontFamily: FUENTE, fontSize: '16px', color: '#ffd54f', fontStyle: 'bold'
  }).setOrigin(0.5);
  const nombre = escena.add.text(cx, cy - 75, evo.nombre, {
    fontFamily: FUENTE, fontSize: '23px', color: '#ffe082', fontStyle: 'bold'
  }).setOrigin(0.5);
  const frase = escena.add.text(cx, cy - 12, evo.frase, {
    fontFamily: FUENTE, fontSize: '15px', color: '#ffffff', align: 'center',
    wordWrap: { width: anchoCarta - 30 }
  }).setOrigin(0.5);
  const clave = 'instinto_' + c.INSTINTO;
  const icono = escena.textures.exists(clave) ? escena.add.image(cx, cy + 44, clave, 0).setScale(3) : null;
  const requisito = escena.add.text(cx, cy + 90, estadoEvolucion(escena, evo).requisito, {
    fontFamily: FUENTE, fontSize: '13px', color: '#ffcc80', align: 'center',
    wordWrap: { width: anchoCarta - 20 }
  }).setOrigin(0.5);

  escena.tweens.add({ targets: fondo, alpha: 0.8, duration: 450, yoyo: true, repeat: -1 });
  return [fondo, tecla, nombre, frase, requisito].concat(icono ? [icono] : []);
}

// Mordida callejera (Quiltro): la mordida rebota a otros enemigos cercanos.
// La llama GameScene.morder después de cada mordida.
function reboteMordida(escena, x, y, primero, dano) {
  if (!tieneEvolucion(escena, 'rebote')) return;
  const c = cfgEvolucion('rebote');
  const mordidos = [primero];
  const puntos = [{ x, y }];
  let d = dano;
  let px = x;
  let py = y;
  for (let k = 0; k < c.REBOTES; k++) {
    d *= c.DANO;
    let siguiente = null;
    let mejor = Infinity;
    escena.enemigos.getChildren().forEach((en) => {
      if (!en.active || mordidos.includes(en)) return;
      const dist = Phaser.Math.Distance.Between(px, py, en.x, en.y) - en.radio;
      if (dist <= c.DISTANCIA && dist < mejor) { mejor = dist; siguiente = en; }
    });
    if (!siguiente) break;
    mordidos.push(siguiente);
    px = siguiente.x;
    py = siguiente.y;
    puntos.push({ x: px, y: py });
    escena.mostrarMordida(siguiente, false, false);
    escena.danarEnemigo(siguiente, d);
  }
  if (puntos.length < 2) return;

  // Rayito amarillo entre los mordidos
  const g = escena.add.graphics().setDepth(21);
  g.lineStyle(3, 0xffe082, 0.9);
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1];
    const b = puntos[i];
    const mx = (a.x + b.x) / 2 + Phaser.Math.Between(-10, 10);
    const my = (a.y + b.y) / 2 + Phaser.Math.Between(-10, 10);
    g.lineBetween(a.x, a.y, mx, my);
    g.lineBetween(mx, my, b.x, b.y);
  }
  escena.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
}

// Agarre de pitbull: la Mandíbula de hierro sujeta al enemigo.
// La llama GameScene.morder cuando la mordida es de Mandíbula de hierro.
function intentarAgarre(escena, enemigo, x, y) {
  if (!tieneEvolucion(escena, 'sacudida') || escena.agarre) return;
  const c = cfgEvolucion('sacudida');
  const ahora = escena.tiempoSobrevivido;
  if (ahora < escena.agarreListoEn) return;
  // Si murió con la mordida, o es el jefe (no se puede levantar), explota al tiro
  if (!enemigo.active || enemigo.esJefe) {
    escena.agarreListoEn = ahora + c.ESPERA_MS;
    explosionAgarre(escena, enemigo.active ? enemigo.x : x, enemigo.active ? enemigo.y : y);
    return;
  }
  escena.agarre = { enemigo, hasta: ahora + c.AGARRE_MS, proximaSacudida: ahora + c.SACUDIDA_CADA_MS, x, y };
  escena.textoFlotante('¡Te tengo!', '#ffcc80');
}

function actualizarAgarre(escena) {
  const a = escena.agarre;
  if (!a) return;
  const c = cfgEvolucion('sacudida');
  const ahora = escena.tiempoSobrevivido;
  const en = a.enemigo;
  if (!en.active || escena.amaneciendo) {
    soltarAgarre(escena, a.x, a.y);
    return;
  }

  // Lo lleva en el hocico y lo sacude de lado a lado
  const dir = escena.ultimaDireccion;
  const dist = escena.base.RADIO + en.radio - 4;
  const temblor = Math.sin(ahora / 28) * 7;
  const x = escena.perro.x + dir.x * dist - dir.y * temblor;
  const y = escena.perro.y + dir.y * dist + dir.x * temblor;
  en.body.reset(x, y);
  en.aturdidoHasta = ahora + 150;
  en.empujadoHasta = 0;
  a.x = x;
  a.y = y;

  if (ahora >= a.proximaSacudida) {
    a.proximaSacudida += c.SACUDIDA_CADA_MS;
    escena.mostrarMordida(en, true, false);
    escena.danarEnemigo(en, escena.danoMordida() * c.SACUDIDA_DANO);
  }
  if (ahora >= a.hasta) soltarAgarre(escena, x, y);
}

function soltarAgarre(escena, x, y) {
  escena.agarre = null;
  escena.agarreListoEn = escena.tiempoSobrevivido + cfgEvolucion('sacudida').ESPERA_MS;
  explosionAgarre(escena, x, y);
}

// Al soltar: golpe en área que daña y empuja (incluido el que tenía sujeto)
function explosionAgarre(escena, x, y) {
  const c = cfgEvolucion('sacudida');
  const onda = escena.add.image(x, y, texturaOnda(escena, c.EXPLOSION_RADIO)).setDepth(5)
    .setScale(ESCALA_PIXEL * 0.2).setTint(0xff9100);
  escena.tweens.add({ targets: onda, scale: ESCALA_PIXEL, alpha: 0, duration: 300, onComplete: () => onda.destroy() });
  escena.cameras.main.shake(140, 0.006);
  const dano = escena.danoMordida() * c.EXPLOSION_DANO;
  const ahora = escena.tiempoSobrevivido;
  escena.enemigos.getChildren().slice().forEach((en) => {
    if (!en.active) return;
    if (Phaser.Math.Distance.Between(x, y, en.x, en.y) > c.EXPLOSION_RADIO + en.radio) return;
    if (!en.esJefe) {
      const ang = Phaser.Math.Angle.Between(x, y, en.x, en.y);
      en.body.setVelocity(Math.cos(ang) * c.EXPLOSION_EMPUJE, Math.sin(ang) * c.EXPLOSION_EMPUJE);
      en.empujadoHasta = ahora + 250;
    }
    escena.danarEnemigo(en, dano);
  });
}

// Embestida de galgo: durante el sprint daña y aparta a cada enemigo que atraviesa
function embestidaGalgo(escena) {
  const c = cfgEvolucion('embestida');
  const p = escena.perro;
  const dir = escena.direccionSprint;
  const ahora = escena.tiempoSobrevivido;
  const dano = escena.danoMordida() * c.DANO;
  escena.enemigos.getChildren().slice().forEach((en) => {
    if (!en.active || en.embestidaSprint === escena.numeroSprint) return;
    if (Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) > escena.base.RADIO + en.radio + c.ANCHO) return;
    en.embestidaSprint = escena.numeroSprint;
    if (!en.esJefe) {
      // lo tira hacia el lado en que estaba (a la izquierda o derecha del galgo)
      const lado = dir.x * (en.y - p.y) - dir.y * (en.x - p.x) >= 0 ? 1 : -1;
      en.body.setVelocity(-dir.y * lado * c.EMPUJE + dir.x * 80, dir.x * lado * c.EMPUJE + dir.y * 80);
      en.empujadoHasta = ahora + 250;
    }
    escena.mostrarMordida(en, true, false);
    escena.danarEnemigo(en, dano);
  });
  // Estela dorada
  if (!efectosLimitados(escena)) {
    const r = escena.add.rectangle(p.x, p.y, 18, 18, 0xffd54f, 0.55).setDepth(9)
      .setRotation(Math.atan2(dir.y, dir.x));
    escena.tweens.add({ targets: r, alpha: 0, scaleX: 2.2, scaleY: 0.3, duration: 320, onComplete: () => r.destroy() });
  }
}

// Sprint más largo con la Embestida de galgo (lo usa GameScene.iniciarSprint)
function sprintExtraEvolucion(escena) {
  return tieneEvolucion(escena, 'embestida') ? (cfgEvolucion('embestida').DURACION_EXTRA_MS || 0) : 0;
}

// Aullido rastreador (Beagle): el ladrido marca a los enemigos alcanzados
function marcarConLadrido(escena, enemigo) {
  if (!tieneEvolucion(escena, 'marca')) return;
  enemigo.marcadoHasta = escena.tiempoSobrevivido + cfgEvolucion('marca').MARCA_MS;
}

function radioExtraLadrido(escena) {
  return tieneEvolucion(escena, 'marca') ? (cfgEvolucion('marca').RADIO_EXTRA || 0) : 0;
}

// Daño que recibe un enemigo (marcado = recibe más). Lo usa GameScene.danarEnemigo
function danoContraMarcado(escena, enemigo, dano) {
  if (!(escena.tiempoSobrevivido < enemigo.marcadoHasta)) return dano;
  return dano * (1 + (cfgEvolucion('marca').DANO_EXTRA || 0));
}

// Mira roja sobre los enemigos marcados (solo los que están en pantalla)
function dibujarMarcas(escena) {
  const g = escena.capaMarcas;
  g.clear();
  if (!tieneEvolucion(escena, 'marca')) return;
  const ahora = escena.tiempoSobrevivido;
  const vista = escena.cameras.main.worldView;
  g.lineStyle(2, 0xff5252, 0.9);
  escena.enemigos.getChildren().forEach((en) => {
    if (!(ahora < en.marcadoHasta) || !vista.contains(en.x, en.y)) return;
    const r = en.radio + 5;
    g.strokeCircle(en.x, en.y, r);
    g.lineBetween(en.x - r - 4, en.y, en.x - r + 4, en.y);
    g.lineBetween(en.x + r - 4, en.y, en.x + r + 4, en.y);
    g.lineBetween(en.x, en.y - r - 4, en.x, en.y - r + 4);
    g.lineBetween(en.x, en.y + r - 4, en.x, en.y + r + 4);
  });
}

// ---------------------------------------------------------------
//  ATAQUES SECUNDARIOS (se ganan como instintos)
// ---------------------------------------------------------------

// Números del Rasguño en un nivel
function datosRasguno(nv) {
  const c = CONFIG.ATAQUES.RASGUNO;
  const n = Math.max(0, nv - 1);
  return {
    cadaMs: Math.max(250, c.CADA_MS - n * c.CADA_MENOS_MS),
    dano: c.DANO + n * c.DANO_EXTRA,
    alcance: c.ALCANCE + n * c.ALCANCE_EXTRA,
    angulo: Math.min(360, c.ANGULO + n * c.ANGULO_EXTRA)
  };
}

function intervaloRasguno(nv) {
  return datosRasguno(nv).cadaMs;
}

// Zarpazo en abanico hacia el enemigo más cercano. Devuelve false si no hay nadie a su alcance.
function rasgunar(escena, nv) {
  const d = datosRasguno(nv);
  const p = escena.perro;
  let cercano = null;
  let mejor = Infinity;
  escena.enemigos.getChildren().forEach((en) => {
    const dist = Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) - en.radio;
    if (dist <= d.alcance && dist < mejor) { mejor = dist; cercano = en; }
  });
  if (!cercano) return false;

  const centro = Phaser.Math.Angle.Between(p.x, p.y, cercano.x, cercano.y);
  const mitad = Phaser.Math.DegToRad(d.angulo) / 2;
  escena.enemigos.getChildren().slice().forEach((en) => {
    if (!en.active) return;
    const dist = Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y);
    if (dist - en.radio > d.alcance) return;
    const dif = Math.abs(Phaser.Math.Angle.Wrap(Phaser.Math.Angle.Between(p.x, p.y, en.x, en.y) - centro));
    // los que están pegados al perro siempre reciben el zarpazo
    if (dif > mitad && dist > escena.base.RADIO + en.radio + 6) return;
    escena.danarEnemigo(en, d.dano);
  });

  // Dibujo: tres garras blancas en arco
  const g = escena.add.graphics({ x: p.x, y: p.y }).setDepth(21);
  [0.55, 0.78, 1].forEach((f, i) => {
    g.lineStyle(i === 1 ? 4 : 3, i === 1 ? 0xffffff : 0xffcdd2, 0.9);
    g.beginPath();
    g.arc(0, 0, d.alcance * f, centro - mitad * f, centro + mitad * f, false);
    g.strokePath();
  });
  escena.tweens.add({ targets: g, alpha: 0, duration: 220, onComplete: () => g.destroy() });
  return true;
}

// Números de Escarbar en un nivel
function datosEscarbar(nv) {
  const c = CONFIG.ATAQUES.ESCARBAR;
  const n = Math.max(0, nv - 1);
  return {
    cadaMs: Math.max(300, c.CADA_MS - n * c.CADA_MENOS_MS),
    terrones: c.TERRONES + Math.floor(n / Math.max(1, c.TERRON_CADA_NIVELES)),
    dano: c.DANO + n * c.DANO_EXTRA,
    frenoMs: c.FRENO_MS + n * c.FRENO_EXTRA_MS
  };
}

function intervaloEscarbar(nv) {
  return datosEscarbar(nv).cadaMs;
}

// Lanza terrones hacia los enemigos más cercanos. Devuelve false si no hay nadie a su alcance.
function escarbar(escena, nv) {
  const c = CONFIG.ATAQUES.ESCARBAR;
  const d = datosEscarbar(nv);
  const p = escena.perro;
  const objetivos = escena.enemigos.getChildren()
    .map((en) => ({ en, dist: Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) }))
    .filter((o) => o.dist - o.en.radio <= c.ALCANCE)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, d.terrones);
  if (objetivos.length === 0) return false;

  for (let i = 0; i < d.terrones; i++) {
    // si hay menos enemigos que terrones, los que sobran van al más cercano con un poco de desvío
    const o = objetivos[i] || objetivos[0];
    const desvio = objetivos[i] ? 0 : Phaser.Math.FloatBetween(-0.35, 0.35);
    const ang = Phaser.Math.Angle.Between(p.x, p.y, o.en.x, o.en.y) + desvio;
    const img = escena.add.image(p.x, p.y, 'terron', 0).setScale(ESCALA_PIXEL).setDepth(8);
    escena.terrones.push({
      img, x: p.x, y: p.y,
      vx: Math.cos(ang) * c.VELOCIDAD, vy: Math.sin(ang) * c.VELOCIDAD,
      recorrido: 0, largo: c.ALCANCE * 1.25, dano: d.dano, frenoMs: d.frenoMs
    });
  }
  // tierrita que salta de las patas
  polvo(escena, p.x, p.y + escena.base.RADIO * 0.6, 4);
  return true;
}

function moverTerrones(escena, delta) {
  if (escena.terrones.length === 0) return;
  const c = CONFIG.ATAQUES.ESCARBAR;
  const seg = delta / 1000;
  escena.terrones = escena.terrones.filter((t) => {
    t.x += t.vx * seg;
    t.y += t.vy * seg;
    t.recorrido += Math.hypot(t.vx, t.vy) * seg;
    // sube y baja (como si volara en arco)
    const arco = Math.sin(Math.min(1, t.recorrido / t.largo) * Math.PI);
    t.img.setPosition(t.x, t.y - arco * 18).setScale(ESCALA_PIXEL * (1 + arco * 0.5)).setRotation(t.recorrido / 30);

    const toca = escena.enemigos.getChildren().some((en) =>
      en.active && Phaser.Math.Distance.Between(t.x, t.y, en.x, en.y) <= en.radio + 8);
    if (!toca && t.recorrido < t.largo) return true;

    // Cae: daña y frena a los que están alrededor
    const ahora = escena.tiempoSobrevivido;
    escena.enemigos.getChildren().slice().forEach((en) => {
      if (!en.active || Phaser.Math.Distance.Between(t.x, t.y, en.x, en.y) > c.RADIO + en.radio) return;
      en.lentoHasta = Math.max(en.lentoHasta || 0, ahora + t.frenoMs);
      escena.danarEnemigo(en, t.dano);
    });
    polvo(escena, t.x, t.y, 5);
    t.img.destroy();
    return false;
  });
}

// Puntitos de tierra que saltan y desaparecen
function polvo(escena, x, y, cuantos) {
  if (efectosLimitados(escena)) return;
  for (let i = 0; i < cuantos; i++) {
    const r = escena.add.rectangle(x, y, 4, 4, i % 2 ? 0x8d6e63 : 0x5d4037).setDepth(8);
    escena.tweens.add({
      targets: r, x: x + Phaser.Math.Between(-22, 22), y: y + Phaser.Math.Between(-22, 8), alpha: 0,
      duration: 300, onComplete: () => r.destroy()
    });
  }
}

// ---------------------------------------------------------------
//  EVENTOS PELIGROSOS: el curao al volante (uno o varios autos que
//  cruzan a toda velocidad) y la jauría (estampida de perros en fila).
//  Los dos avisan antes, para que se puedan esquivar.
// ---------------------------------------------------------------

// Medidas del auto (el dibujo es de 14 x 22 cuadritos)
const AUTO_CURAO_ANCHO = 14 * ESCALA_PIXEL;
const AUTO_CURAO_LARGO = 22 * ESCALA_PIXEL;

// Valor de una lista "por fase" (si la lista es más corta, usa el último)
function valorPorFase(lista, fase, porDefecto) {
  if (!lista || lista.length === 0) return porDefecto;
  const v = lista[Math.min(fase, lista.length - 1)];
  return v === undefined ? porDefecto : v;
}

// Qué tan seguido viene un evento en esta fase (0 = no viene), con la
// dificultad del mapa y el multiplicador global (src/mapas.js)
function frecuenciaEvento(escena, cfg, fase) {
  const f = valorPorFase(cfg.FRECUENCIA_POR_FASE, fase, 0) || 0;
  return f > 0 ? f * factorDificultad(escena.mapaId, 'EVENTOS') : 0;
}

function esperaEvento(cfg, frecuencia) {
  return Phaser.Math.Between(cfg.ESPERA_MIN_MS, Math.max(cfg.ESPERA_MIN_MS, cfg.ESPERA_MAX_MS)) / frecuencia;
}

// Sortea cuándo llega el próximo evento (null = en esta fase no viene)
function programarEvento(escena, cfg) {
  const ahora = escena.tiempoSobrevivido;
  const frecuencia = frecuenciaEvento(escena, cfg, faseDeLaNoche(ahora));
  if (frecuencia <= 0) return null;
  return Math.max(ahora + esperaEvento(cfg, frecuencia), (cfg.DESDE_SEGUNDOS || 0) * 1000);
}

// Línea recta que cruza la pantalla desde un lado (0 izquierda, 1 derecha,
// 2 arriba, 3 abajo) y pasa a "desvio" px de donde está el perro AHORA
// (si te mueves, la esquivas). extra = largo que se suma al final.
function trayectoEvento(escena, lado, inclinacionGrados, desvio, extra) {
  const p = escena.perro;
  const vista = escena.cameras.main.worldView;
  const base = [0, Math.PI, Math.PI / 2, -Math.PI / 2][lado]; // hacia dónde va
  const angulo = base + Phaser.Math.DegToRad(Phaser.Math.FloatBetween(-inclinacionGrados, inclinacionGrados));
  const dir = { x: Math.cos(angulo), y: Math.sin(angulo) };
  const perp = { x: -dir.y, y: dir.x };
  const centro = { x: p.x + perp.x * desvio, y: p.y + perp.y * desvio };
  const mitadVista = (lado < 2 ? vista.width : vista.height) / 2;
  const antes = mitadVista / Math.max(0.3, Math.abs(lado < 2 ? dir.x : dir.y)) + AUTO_CURAO_LARGO + 120;
  const despues = antes + 300 + (extra || 0);
  return {
    lado, dir, perp, angulo,
    inicio: { x: centro.x - dir.x * antes, y: centro.y - dir.y * antes },
    largo: antes + despues
  };
}

// Lados distintos al azar
function ladosAlAzar(n) {
  return Phaser.Utils.Array.Shuffle([0, 1, 2, 3]).slice(0, Math.max(1, Math.min(4, n)));
}

// ¿Hay algún evento en camino? (para que no vengan dos encima)
function curaoEnCamino(escena) {
  return !!(escena.curaos && escena.curaos.length > 0);
}
function jauriaEnCamino(escena) {
  return !!(escena.jaurias && escena.jaurias.length > 0);
}

// Daño de un evento al perro, con las mismas reducciones que un golpe normal
// (Collar, Cuero de calle, Zona peligrosa, árbol). Devuelve el daño hecho
// (0 si lo esquivó). op: { dano, invulnerableMs, empuje: {x, y, ms}, texto, reduccionExtra }
function golpearPerroEvento(escena, op) {
  const ahora = escena.tiempoSobrevivido;
  if (escena.gameOver || escena.amaneciendo) return 0;
  if (escena.perro.caido) return 0; // cooperativo: ya está caído (src/coop.js)
  if (escena.enSprint()) { // Sprint del Galgo: pasa justo al lado sin tocarlo
    escena.textoFlotante('¡Esquivado por un pelo!', '#e1bee7');
    return 0;
  }
  if (ahora < escena.invulnerableHasta) return 0;
  if (escena.efectoZona.segura) {
    escena.textoFlotante('¡Zona segura!', '#9ccc65');
    return 0;
  }
  if (Math.random() < bonusColeccion('antifaz', 'ESQUIVAR') + bonusArbol(escena, 'ESQUIVAR')) {
    escena.invulnerableHasta = ahora + CONFIG.PERRO_INVULNERABLE_MS;
    escena.textoFlotante('¡Esquivado!', '#e1bee7');
    return 0;
  }

  let dano = op.dano * Math.max(0, 1 - escena.nivelObjeto('collar') * CONFIG.OBJETOS.collar.MENOS_DANO);
  dano *= Math.max(0, 1 - (op.reduccionExtra || 0));
  if (escena.fusiones.cuero && ahora < escena.cueroHasta) dano *= CONFIG.FUSIONES.cuero.MULTIPLICADOR;
  if (escena.efectoZona.peligro) dano *= CONFIG.ZONAS.peligro.DANO_MULTIPLICADOR || 1;
  dano *= Math.max(0, 1 - escena.reduccionArbol());
  dano *= 1 - reduccionArmadura(escena); // Pelaje grueso (src/ataques_nuevos.js)
  dano = Math.max(1, Math.round(dano));

  escena.vida = Math.max(0, escena.vida - dano);
  escena.invulnerableHasta = ahora + op.invulnerableMs;
  if (escena.fusiones.cuero) escena.cueroHasta = ahora + CONFIG.FUSIONES.cuero.DURACION_MS;
  escena.cameras.main.shake(300, 0.015);
  escena.cameras.main.flash(150, 255, 60, 60);
  escena.textoFlotante(op.texto + ' −' + dano, '#ff5252');
  if (op.empuje) escena.empujePerro = { x: op.empuje.x, y: op.empuje.y, hasta: ahora + op.empuje.ms };

  if (escena.vida <= 0 && !salvarseArbol(escena)) escena.terminarJuego();
  return dano;
}

// Flecha en el borde de la pantalla, en el punto por donde entra el evento, apuntando hacia afuera
function flechaEvento(g, escena, inicio, dir, color) {
  const w = escena.scale.width;
  const h = escena.scale.height;
  const cam = escena.cameras.main;
  const m = 46 + margenExtra();
  const s = pantallaDesdeMundo(escena, inicio.x, inicio.y); // con el zoom del cooperativo (src/coop.js)
  const sx = Phaser.Math.Clamp(s.x, m, w - m);
  const sy = Phaser.Math.Clamp(s.y, m, h - m);
  const ax = -dir.x;
  const ay = -dir.y;
  const px = -ay;
  const py = ax;
  g.fillStyle(color, 1);
  g.lineStyle(3, 0x000000, 1);
  const punta = { x: sx + ax * 8, y: sy + ay * 8 };
  const atras = { x: sx - ax * 22, y: sy - ay * 22 };
  const pts = [
    punta,
    { x: atras.x + px * 22, y: atras.y + py * 22 },
    { x: atras.x + px * 9, y: atras.y + py * 9 },
    { x: atras.x + px * 9 - ax * 26, y: atras.y + py * 9 - ay * 26 },
    { x: atras.x - px * 9 - ax * 26, y: atras.y - py * 9 - ay * 26 },
    { x: atras.x - px * 9, y: atras.y - py * 9 },
    { x: atras.x - px * 22, y: atras.y - py * 22 }
  ];
  g.fillPoints(pts, true);
  g.strokePoints(pts, true);
}

// Texto grande de aviso que palpita (uno por tipo de evento)
function mostrarTextoEvento(escena, clave, texto, y, color) {
  quitarTextoEvento(escena, clave);
  const t = escena.add.text(escena.scale.width / 2, y + (escena.margenHudExtra || 0), texto, {
    fontFamily: FUENTE, fontSize: '30px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
  }).setOrigin(0.5).setScrollFactor(0).setDepth(1551);
  escena.tweens.add({ targets: t, scale: 1.08, duration: 160, yoyo: true, repeat: -1 });
  escena[clave] = t;
}
function quitarTextoEvento(escena, clave) {
  const t = escena[clave];
  if (!t) return;
  escena.tweens.killTweensOf(t);
  t.destroy();
  escena[clave] = null;
}

// ---------------------------------------------------------------
//  EL CURAO AL VOLANTE
// ---------------------------------------------------------------

// Lo llama GameScene.update en cada cuadro
function actualizarCurao(escena, delta) {
  const C = CONFIG.CURAO;
  if (!C || C.ACTIVO === false) return;
  if (curaoEnCamino(escena)) {
    avanzarCuraos(escena, delta);
    return;
  }
  if (escena.amaneciendo) return;

  const ahora = escena.tiempoSobrevivido;
  if (frecuenciaEvento(escena, C, faseDeLaNoche(ahora)) <= 0) {
    escena.proximoCurao = null;
    return;
  }
  if (escena.proximoCurao === null) escena.proximoCurao = programarEvento(escena, C);
  if (escena.proximoCurao === null || ahora < escena.proximoCurao) return;
  if (jauriaEnCamino(escena)) { // no viene encima de una jauría
    escena.proximoCurao = ahora + 2500;
    return;
  }
  iniciarCuraos(escena);
}

// Modo de prueba (tecla V): los autos vienen al tiro (los de la fase actual)
function pruebaCurao(escena) {
  if (curaoEnCamino(escena) || escena.amaneciendo) return;
  iniciarCuraos(escena);
}

// Empieza el aviso: uno o varios autos, cada uno desde un lado distinto
function iniciarCuraos(escena) {
  const C = CONFIG.CURAO;
  const ahora = escena.tiempoSobrevivido;
  const rango = valorPorFase(C.AUTOS_POR_FASE, faseDeLaNoche(ahora), [1, 1]);
  const n = Phaser.Math.Between(rango[0] || 1, Math.max(rango[0] || 1, rango[1] || 1));
  ladosAlAzar(n).forEach((lado, i) => {
    const maxDesvio = i === 0 ? C.DESVIO_MAX : (C.DESVIO_EXTRA_MAX || C.DESVIO_MAX);
    const t = trayectoEvento(escena, lado, C.INCLINACION_GRADOS, Phaser.Math.FloatBetween(-maxDesvio, maxDesvio), 0);
    escena.numeroCurao++;
    escena.curaos.push(Object.assign(t, {
      id: escena.numeroCurao,
      estado: 'aviso',
      hasta: ahora + C.AVISO_MS + i * (C.SEPARACION_AUTOS_MS || 0),
      recorrido: 0,
      zigzag: Math.random() < C.ZIGZAG_PROBABILIDAD,
      faseZigzag: Math.random() * Math.PI * 2,
      auto: null,
      pos: null,
      golpeoPerro: false,
      atropellados: 0,
      sobreObstaculo: false
    }));
  });

  // Aviso: texto, bocina y (Galgo) el sprint queda listo para esquivarlo
  const texto = n > 1 ? '¡Vienen ' + n + ' curaos al volante!' : TEXTO_CURAO;
  mostrarTextoEvento(escena, 'textoCurao', texto, 178, '#ff5252');
  tocarBocina(escena, n > 1 ? 3 : 2);
  if (C.GALGO_SPRINT_LISTO && escena.poder === 'sprint') escena.poderCarga = escena.poderEsperaTotal;
}

// Dónde está el auto después de recorrer "s" píxeles, y hacia dónde mira
function posicionCurao(cu, s) {
  const C = CONFIG.CURAO;
  let lateral = 0;
  let pendiente = 0;
  if (cu.zigzag) {
    const onda = Math.max(50, C.VELOCIDAD * C.ZIGZAG_CADA_MS / 1000); // largo de cada vaivén
    const k = (Math.PI * 2) / onda;
    lateral = C.ZIGZAG_AMPLITUD * Math.sin(s * k + cu.faseZigzag);
    pendiente = C.ZIGZAG_AMPLITUD * k * Math.cos(s * k + cu.faseZigzag);
  }
  return {
    x: cu.inicio.x + cu.dir.x * s + cu.perp.x * lateral,
    y: cu.inicio.y + cu.dir.y * s + cu.perp.y * lateral,
    angulo: cu.angulo + Math.atan(pendiente)
  };
}

function avanzarCuraos(escena, delta) {
  const C = CONFIG.CURAO;
  const ahora = escena.tiempoSobrevivido;
  const prende = Math.floor(ahora / 150) % 2 === 0;
  const pantalla = escena.capaCuraoPantalla;
  const mundo = escena.capaCuraoMundo;
  pantalla.clear();
  mundo.clear();

  // Borde rojo que parpadea mientras algún auto está avisando
  const avisando = escena.curaos.filter((cu) => cu.estado === 'aviso');
  if (avisando.length > 0 && prende) {
    const w = escena.scale.width;
    const h = escena.scale.height;
    pantalla.lineStyle(10, 0xff1744, 0.85);
    pantalla.strokeRect(5, 5, w - 10, h - 10);
    pantalla.fillStyle(0xff1744, 0.6);
    avisando.forEach((cu) => { // el lado por donde entra, más grueso
      if (cu.lado === 0) pantalla.fillRect(0, 0, 26, h);
      else if (cu.lado === 1) pantalla.fillRect(w - 26, 0, 26, h);
      else if (cu.lado === 2) pantalla.fillRect(0, 0, w, 26);
      else pantalla.fillRect(0, h - 26, w, 26);
    });
  }

  for (const cu of escena.curaos.slice()) {
    if (cu.estado === 'aviso') {
      dibujarAvisoCurao(escena, cu, prende);
      if (ahora < cu.hasta) continue;
      // ¡Viene!
      cu.estado = 'cruzar';
      const pos = posicionCurao(cu, 0);
      cu.auto = escena.add.image(pos.x, pos.y, 'auto_curao', 0).setScale(ESCALA_PIXEL).setDepth(11);
      cu.pos = pos;
      tocarBocina(escena, 1);
    }

    // Avanza en pasos cortos para no "saltarse" a nadie aunque vaya muy rápido
    const total = C.VELOCIDAD * (delta / 1000);
    const pasos = Math.max(1, Math.ceil(total / 18));
    for (let i = 0; i < pasos; i++) {
      cu.recorrido += total / pasos;
      const pos = posicionCurao(cu, cu.recorrido);
      cu.auto.setPosition(pos.x, pos.y).setRotation(pos.angulo + Math.PI / 2); // el dibujo mira hacia arriba
      cu.pos = pos;
      atropellar(escena, cu, pos);
      if (escena.gameOver || !escena.curaos.includes(cu)) return; // te atropelló y se acabó la partida
    }

    // Obstáculos: no lo detienen, pero pega un salto al pasar por encima
    const encima = !escena.plaza.libre(cu.pos.x, cu.pos.y, 6);
    if (encima && !cu.sobreObstaculo) {
      polvo(escena, cu.pos.x, cu.pos.y, 6);
      escena.tweens.add({ targets: cu.auto, scale: ESCALA_PIXEL * 1.25, duration: 90, yoyo: true });
    }
    cu.sobreObstaculo = encima;
    dibujarFarosCurao(escena, cu);

    if (cu.recorrido >= cu.largo) {
      if (cu.atropellados >= 2) escena.mostrarAviso('¡El curao atropelló a ' + cu.atropellados + ' enemigos!', '#ffab40');
      cu.auto.destroy();
      escena.curaos.splice(escena.curaos.indexOf(cu), 1);
    }
  }

  if (!escena.curaos.some((cu) => cu.estado === 'aviso')) quitarTextoEvento(escena, 'textoCurao');
  if (escena.curaos.length === 0) terminarCurao(escena);
}

// Revisa si el auto (un rectángulo girado) toca al perro o a los enemigos
function atropellar(escena, cu, pos) {
  const C = CONFIG.CURAO;
  const hx = Math.cos(pos.angulo);
  const hy = Math.sin(pos.angulo);
  const toca = (x, y, r) => {
    const dx = x - pos.x;
    const dy = y - pos.y;
    const largo = dx * hx + dy * hy;     // hacia adelante
    const ancho = -dx * hy + dy * hx;    // hacia el lado
    return Math.abs(largo) <= AUTO_CURAO_LARGO / 2 + r && Math.abs(ancho) <= AUTO_CURAO_ANCHO / 2 + r;
  };

  // El perro (el Galgo es más difícil de atropellar)
  // (cooperativo: también revisa a J2, con su propio "ya lo golpeó", src/coop.js)
  const revisarPerro = () => {
    if (cu[claveGolpeCoop(escena, 'golpeoPerro')]) return;
    const r = Math.max(4, escena.base.RADIO - (escena.poder === 'sprint' ? C.GALGO_MARGEN : 0));
    if (toca(escena.perro.x, escena.perro.y, r)) golpearPerroCurao(escena, cu, hx, hy, pos);
  };
  revisarPerro();
  if (escena.gameOver) return;
  if (escena.coop) {
    conJugador2(escena, revisarPerro);
    if (escena.gameOver) return;
  }

  // Los enemigos: salen volando
  escena.enemigos.getChildren().slice().forEach((en) => {
    if (!en.active || en.atropellado === cu.id) return;
    if (Math.abs(en.x - pos.x) > 90 + en.radio || Math.abs(en.y - pos.y) > 90 + en.radio) return;
    if (!toca(en.x, en.y, en.radio)) return;
    en.atropellado = cu.id;
    if (en.esJefe) {
      escena.danarEnemigo(en, C.DANO_JEFE, true); // true: daño del curao, no del perro
      escena.cameras.main.shake(150, 0.006);
      return;
    }
    if (!efectosLimitados(escena)) {
      const lado = -(en.x - pos.x) * hy + (en.y - pos.y) * hx >= 0 ? 1 : -1;
      const vuela = escena.add.image(en.x, en.y, en.texture.key, en.frame.name)
        .setScale(en.scaleX).setFlipX(en.flipX).setDepth(12);
      escena.tweens.add({
        targets: vuela,
        x: en.x + hx * 160 - hy * lado * 90,
        y: en.y + hy * 160 + hx * lado * 90,
        angle: 720 * lado, alpha: 0, duration: 550,
        onComplete: () => vuela.destroy()
      });
    }
    if (!en.dePrueba) cu.atropellados++;
    escena.danarEnemigo(en, C.DANO_ENEMIGOS, true); // true: daño del curao, no del perro
  });
}

// El auto le pega al perro: mucho daño y un empujón
function golpearPerroCurao(escena, cu, hx, hy, pos) {
  const C = CONFIG.CURAO;
  const ahora = escena.tiempoSobrevivido;
  if (escena.gameOver || escena.amaneciendo) return;
  if (!escena.enSprint() && ahora < escena.invulnerableHasta) return; // sigue pudiendo pegarle después
  cu[claveGolpeCoop(escena, 'golpeoPerro')] = true;

  // Empujón: hacia adelante del auto y hacia el lado donde estaba el perro
  const lado = -(escena.perro.x - pos.x) * hy + (escena.perro.y - pos.y) * hx >= 0 ? 1 : -1;
  const ex = hx * 0.6 - hy * lado;
  const ey = hy * 0.6 + hx * lado;
  const largo = Math.hypot(ex, ey) || 1;
  golpearPerroEvento(escena, {
    dano: C.DANO * multiplicadorGlobal(),
    reduccionExtra: bonusColeccion('boleto', 'MENOS_DANO_CURAO'), // Boleto de micro (ultra raro de la Terminal)
    invulnerableMs: C.INVULNERABLE_MS,
    empuje: { x: (ex / largo) * C.EMPUJE, y: (ey / largo) * C.EMPUJE, ms: C.EMPUJE_MS },
    texto: '¡Atropellado!'
  });
}

// Franja roja por donde pasará (en el mundo, encima de la oscuridad) y flecha en el borde
function dibujarAvisoCurao(escena, cu, prende) {
  const C = CONFIG.CURAO;
  flechaEvento(escena.capaCuraoPantalla, escena, cu.inicio, cu.dir, prende ? 0xffeb3b : 0xff5252);
  const ancho = AUTO_CURAO_ANCHO + 16 + (cu.zigzag ? C.ZIGZAG_AMPLITUD * 2 : 0);
  const mundo = escena.capaCuraoMundo;
  mundo.lineStyle(ancho, 0xff1744, prende ? 0.22 : 0.12);
  mundo.lineBetween(cu.inicio.x, cu.inicio.y, cu.inicio.x + cu.dir.x * cu.largo, cu.inicio.y + cu.dir.y * cu.largo);
}

// Luz de los faros hacia adelante (encima de la oscuridad)
function dibujarFarosCurao(escena, cu) {
  const g = escena.capaCuraoMundo;
  const pos = cu.pos;
  const hx = Math.cos(pos.angulo);
  const hy = Math.sin(pos.angulo);
  const px = -hy;
  const py = hx;
  const fx = pos.x + hx * (AUTO_CURAO_LARGO / 2 - 4);
  const fy = pos.y + hy * (AUTO_CURAO_LARGO / 2 - 4);
  const L = 200;
  g.fillStyle(0xfff59d, 0.2);
  g.fillPoints([
    { x: fx - px * 13, y: fy - py * 13 },
    { x: fx + px * 13, y: fy + py * 13 },
    { x: fx + hx * L + px * 60, y: fy + hy * L + py * 60 },
    { x: fx + hx * L - px * 60, y: fy + hy * L - py * 60 }
  ], true);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(fx - px * 13, fy - py * 13, 4);
  g.fillCircle(fx + px * 13, fy + py * 13, 4);
}

// Se fueron todos los autos (o terminó la partida): limpia y sortea cuándo vienen los próximos
function terminarCurao(escena) {
  escena.curaos.forEach((cu) => { if (cu.auto) cu.auto.destroy(); });
  escena.curaos = [];
  quitarTextoEvento(escena, 'textoCurao');
  escena.capaCuraoMundo.clear();
  escena.capaCuraoPantalla.clear();
  escena.proximoCurao = programarEvento(escena, CONFIG.CURAO);
}

// ---------------------------------------------------------------
//  LA JAURÍA: estampida de perros en fila por un carril
// ---------------------------------------------------------------

const TEXTO_JAURIA = '¡Viene una jauría!';
const COLOR_JAURIA = 0xffa000;   // naranjo: carril de aviso
const DIBUJOS_JAURIA = ['rival', 'bravo', 'manada']; // dibujos de src/sprites.js (oscurecidos)

function actualizarJauria(escena, delta) {
  const J = CONFIG.JAURIA;
  if (!J || J.ACTIVO === false) return;
  if (jauriaEnCamino(escena)) {
    avanzarJaurias(escena, delta);
    return;
  }
  if (escena.amaneciendo) return;

  const ahora = escena.tiempoSobrevivido;
  if (frecuenciaEvento(escena, J, faseDeLaNoche(ahora)) <= 0) {
    escena.proximaJauria = null;
    return;
  }
  if (escena.proximaJauria === null) escena.proximaJauria = programarEvento(escena, J);
  if (escena.proximaJauria === null || ahora < escena.proximaJauria) return;
  if (curaoEnCamino(escena)) { // no viene encima de un curao
    escena.proximaJauria = ahora + (J.ESPERA_TRAS_CURAO_MS || 3000);
    return;
  }
  iniciarJauria(escena);
}

// Modo de prueba (tecla E): la jauría viene al tiro
function pruebaJauria(escena) {
  if (jauriaEnCamino(escena) || escena.amaneciendo) return;
  iniciarJauria(escena);
}

function iniciarJauria(escena) {
  const J = CONFIG.JAURIA;
  const ahora = escena.tiempoSobrevivido;
  const fase = faseDeLaNoche(ahora);
  const perros = Math.max(1, Math.round(valorPorFase(J.PERROS_POR_FASE, fase, 8)));
  const carriles = Math.max(1, Math.round(valorPorFase(J.CARRILES_POR_FASE, fase, 1)));
  const cola = perros * J.SEPARACION;
  escena.numeroJauria++;

  ladosAlAzar(carriles).forEach((lado, i) => {
    const maxDesvio = i === 0 ? J.DESVIO_MAX : (J.DESVIO_EXTRA_MAX || J.DESVIO_MAX);
    const t = trayectoEvento(escena, lado, 8, Phaser.Math.FloatBetween(-maxDesvio, maxDesvio), cola);
    // Cada perro con su lugar en la fila y su lado del carril
    const lugares = [];
    for (let k = 0; k < perros; k++) {
      lugares.push({
        atras: k * J.SEPARACION + Phaser.Math.Between(-10, 10),
        lateral: Phaser.Math.FloatBetween(-1, 1) * Math.max(0, J.ANCHO_CARRIL / 2 - 16),
        sprite: null
      });
    }
    escena.jaurias.push(Object.assign(t, {
      id: escena.numeroJauria,
      estado: 'aviso',
      hasta: ahora + J.AVISO_MS + i * 300,
      recorrido: 0,
      cola,
      lugares
    }));
  });
  escena.jauriaGolpeo = false; // pega una sola vez por jauría
  escena.jauriaGolpeo2 = false; // (cooperativo: una vez a J2 también)

  mostrarTextoEvento(escena, 'textoJauria', carriles > 1 ? '¡Vienen ' + carriles + ' jaurías!' : TEXTO_JAURIA, 218, '#ffb74d');
  tocarLadridos(escena);
  if (CONFIG.CURAO.GALGO_SPRINT_LISTO && escena.poder === 'sprint') escena.poderCarga = escena.poderEsperaTotal;
}

function avanzarJaurias(escena, delta) {
  const J = CONFIG.JAURIA;
  const ahora = escena.tiempoSobrevivido;
  const prende = Math.floor(ahora / 170) % 2 === 0;
  const mundo = escena.capaJauriaMundo;
  const pantalla = escena.capaJauriaPantalla;
  mundo.clear();
  pantalla.clear();

  for (const ja of escena.jaurias.slice()) {
    if (ja.estado === 'aviso') {
      // Carril naranjo por donde pasarán, con bordes, y flecha en el borde de la pantalla
      const fin = { x: ja.inicio.x + ja.dir.x * ja.largo, y: ja.inicio.y + ja.dir.y * ja.largo };
      mundo.lineStyle(J.ANCHO_CARRIL, COLOR_JAURIA, prende ? 0.25 : 0.13);
      mundo.lineBetween(ja.inicio.x, ja.inicio.y, fin.x, fin.y);
      const bx = ja.perp.x * J.ANCHO_CARRIL / 2;
      const by = ja.perp.y * J.ANCHO_CARRIL / 2;
      mundo.lineStyle(3, COLOR_JAURIA, prende ? 0.9 : 0.5);
      mundo.lineBetween(ja.inicio.x + bx, ja.inicio.y + by, fin.x + bx, fin.y + by);
      mundo.lineBetween(ja.inicio.x - bx, ja.inicio.y - by, fin.x - bx, fin.y - by);
      flechaEvento(pantalla, escena, ja.inicio, ja.dir, prende ? 0xffe082 : COLOR_JAURIA);
      if (ahora < ja.hasta) continue;
      ja.estado = 'correr';
      ja.lugares.forEach((l, k) => {
        const s = agregarSprite(escena, ja.inicio.x, ja.inicio.y, DIBUJOS_JAURIA[k % DIBUJOS_JAURIA.length]);
        // casi negros (siluetas), para que no se confundan con los perros normales
        s.setDepth(11).setTint(k % 2 ? 0x3e2723 : 0x4e342e).setFlipX(ja.dir.x < -0.05).setVisible(false);
        if (escena.anims.exists(s.texture.key + '_caminar')) s.anims.play(s.texture.key + '_caminar');
        l.sprite = s;
      });
    }

    // Mientras corren, el carril sigue marcado (más suave)
    mundo.lineStyle(J.ANCHO_CARRIL, COLOR_JAURIA, 0.1);
    mundo.lineBetween(ja.inicio.x, ja.inicio.y, ja.inicio.x + ja.dir.x * ja.largo, ja.inicio.y + ja.dir.y * ja.largo);

    ja.recorrido += J.VELOCIDAD * (delta / 1000);
    const radioPerro = escena.base.RADIO;
    ja.lugares.forEach((l) => {
      const s = ja.recorrido - l.atras;
      const visible = s >= 0 && s <= ja.largo;
      l.sprite.setVisible(visible);
      if (!visible) return;
      const x = ja.inicio.x + ja.dir.x * s + ja.perp.x * l.lateral;
      const y = ja.inicio.y + ja.dir.y * s + ja.perp.y * l.lateral;
      l.sprite.setPosition(x, y);
      // ¿Pilló al perro? (una vez por jauría; cooperativo: también a J2, src/coop.js)
      const revisarPerro = () => {
        if (!escena[claveGolpeCoop(escena, 'jauriaGolpeo')] &&
            Phaser.Math.Distance.Between(x, y, escena.perro.x, escena.perro.y) <= radioPerro + 14) {
          golpearPerroJauria(escena, ja);
        }
      };
      revisarPerro();
      if (escena.coop && !escena.gameOver) conJugador2(escena, revisarPerro);
    });
    if (escena.gameOver || !escena.jaurias.includes(ja)) return;

    if (ja.recorrido >= ja.largo + ja.cola + 40) {
      ja.lugares.forEach((l) => l.sprite.destroy());
      escena.jaurias.splice(escena.jaurias.indexOf(ja), 1);
    }
  }

  if (!escena.jaurias.some((ja) => ja.estado === 'aviso')) quitarTextoEvento(escena, 'textoJauria');
  if (escena.jaurias.length === 0) terminarJauria(escena);
}

function golpearPerroJauria(escena, ja) {
  const J = CONFIG.JAURIA;
  const ahora = escena.tiempoSobrevivido;
  if (!escena.enSprint() && ahora < escena.invulnerableHasta) return;
  escena[claveGolpeCoop(escena, 'jauriaGolpeo')] = true;
  // Lo arrastran hacia adelante y lo tiran hacia el lado del carril donde estaba
  const lado = (escena.perro.x - ja.inicio.x) * ja.perp.x + (escena.perro.y - ja.inicio.y) * ja.perp.y >= 0 ? 1 : -1;
  const ex = ja.dir.x * 0.5 + ja.perp.x * lado;
  const ey = ja.dir.y * 0.5 + ja.perp.y * lado;
  const largo = Math.hypot(ex, ey) || 1;
  golpearPerroEvento(escena, {
    dano: J.DANO * multiplicadorGlobal(),
    invulnerableMs: J.INVULNERABLE_MS,
    empuje: { x: (ex / largo) * J.EMPUJE, y: (ey / largo) * J.EMPUJE, ms: J.EMPUJE_MS },
    texto: '¡Te pilló la jauría!'
  });
}

function terminarJauria(escena) {
  escena.jaurias.forEach((ja) => ja.lugares.forEach((l) => { if (l.sprite) l.sprite.destroy(); }));
  escena.jaurias = [];
  quitarTextoEvento(escena, 'textoJauria');
  escena.capaJauriaMundo.clear();
  escena.capaJauriaPantalla.clear();
  escena.proximaJauria = programarEvento(escena, CONFIG.JAURIA);
}

// Fin de la partida: borra todo lo de este archivo que quedó en pantalla
function limpiarAtaques(escena) {
  if (curaoEnCamino(escena) || escena.textoCurao) terminarCurao(escena);
  if (jauriaEnCamino(escena) || escena.textoJauria) terminarJauria(escena);
  escena.capaMarcas.clear();
  escena.terrones.forEach((t) => t.img.destroy());
  escena.terrones = [];
  escena.agarre = null;
  escena.empujePerro = null;
}

// Ladridos "guau-guau" de la jauría (sonido del navegador, sin archivos)
function tocarLadridos(escena) {
  const volumen = CONFIG.CURAO.BOCINA_VOLUMEN || 0;
  const ctx = escena.sound && escena.sound.context;
  if (volumen <= 0 || !ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const inicio = t0 + i * 0.16 + Math.random() * 0.05;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, inicio);
      gain.gain.exponentialRampToValueAtTime(volumen, inicio + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.12);
      gain.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420 + Math.random() * 120, inicio);
      osc.frequency.exponentialRampToValueAtTime(160, inicio + 0.12);
      osc.connect(gain);
      osc.start(inicio);
      osc.stop(inicio + 0.14);
    }
  } catch (e) {
    // sin sonido: el aviso igual se ve
  }
}

// Bocina "piii-piii" hecha con el sonido del navegador (no necesita archivos).
// Si el navegador no deja sonar (o el volumen es 0), no pasa nada.
function tocarBocina(escena, veces) {
  const volumen = CONFIG.CURAO.BOCINA_VOLUMEN || 0;
  const ctx = escena.sound && escena.sound.context;
  if (volumen <= 0 || !ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime;
    for (let i = 0; i < veces; i++) {
      const inicio = t0 + i * 0.32;
      const dura = i === veces - 1 ? 0.42 : 0.22;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, inicio);
      gain.gain.exponentialRampToValueAtTime(volumen, inicio + 0.02);
      gain.gain.setValueAtTime(volumen, inicio + dura - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, inicio + dura);
      gain.connect(ctx.destination);
      [370, 466].forEach((f) => { // dos notas juntas, como bocina de auto viejo
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, inicio);
        osc.connect(gain);
        osc.start(inicio);
        osc.stop(inicio + dura + 0.02);
      });
    }
  } catch (e) {
    // sin sonido: el aviso igual se ve
  }
}

// ---------------------------------------------------------------
//  Para la pestaña Stats de la pausa
// ---------------------------------------------------------------
// Una fila por ataque: { nombre, valor (nivel), detalle, evolucion, apagado }.
// La evolución de la raza va en la fila del ataque que transforma:
// la de un instinto de ataque (Ladrido) va en ese ataque; las demás, en el
// poder de la raza (Mandíbula, Sprint) o, si no tiene poder activo, en la Mordida.
function filasAtaquesStats(escena) {
  const e = escena;
  const max = CONFIG.INSTINTO_NIVEL_MAX;
  const s = (ms) => numeroPausa(ms / 1000, 2) + ' s';
  const filas = [];

  filas.push({ id: 'mordida', nombre: 'Mordida', valor: 'siempre',
    detalle: numeroPausa(e.danoMordida()) + ' de daño cada ' + s(e.intervaloMordida()) + ' a ' + e.alcanceMordida() + ' px' });

  if (e.poderEsperaTotal > 0) {
    filas.push({ id: 'poder', nombre: sinTeclas(e.textosRaza.poder || 'Poder'), valor: 'poder',
      detalle: 'Se recarga en ' + s(e.poderEsperaTotal) });
  }

  const nvL = e.instintos.ladrido || 0;
  filas.push({ id: 'ladrido', nombre: 'Ladrido', valor: nvL ? 'Nv ' + nvL + ' / ' + max : 'sin aprender', apagado: !nvL,
    detalle: nvL ? numeroPausa(e.danoLadrido()) + ' de daño en ' + Math.round(e.radioLadrido()) + ' px cada ' + s(e.intervaloLadrido())
      : 'Sale como instinto al subir de nivel' });

  const nvR = e.instintos.rasguno || 0;
  const r = datosRasguno(Math.max(1, nvR));
  filas.push({ id: 'rasguno', nombre: 'Rasguño', valor: nvR ? 'Nv ' + nvR + ' / ' + max : 'sin aprender', apagado: !nvR,
    detalle: nvR ? numeroPausa(r.dano) + ' de daño en abanico de ' + Math.round(r.angulo) + '° cada ' + s(r.cadaMs * factorEnfriamiento(e))
      : 'Sale como instinto al subir de nivel' });

  const nvE = e.instintos.escarbar || 0;
  const d = datosEscarbar(Math.max(1, nvE));
  filas.push({ id: 'escarbar', nombre: 'Escarbar', valor: nvE ? 'Nv ' + nvE + ' / ' + max : 'sin aprender', apagado: !nvE,
    detalle: nvE ? d.terrones + (d.terrones > 1 ? ' terrones' : ' terrón') + ' de ' + numeroPausa(d.dano) + ', frena ' +
      Math.round(CONFIG.ATAQUES.ESCARBAR.LENTITUD * 100) + '% por ' + s(d.frenoMs) + ', cada ' + s(d.cadaMs * factorEnfriamiento(e))
      : 'Sale como instinto al subir de nivel' });

  // v0.24: Patada trasera, Tirar caca, Meada, Ladrido fuerte y Hedor (src/ataques_nuevos.js)
  filasAtaquesNuevosStats(e).forEach((f) => filas.push(f));

  // Evoluciones de la raza: a qué fila van
  evolucionesDeRaza(e.razaId).forEach((evo) => {
    const c = cfgEvolucion(evo.id);
    let destino = filas.find((f) => f.id === c.INSTINTO) || filas.find((f) => f.id === 'poder') || filas[0];
    const est = estadoEvolucion(e, evo);
    const como = tieneEvolucion(e, evo.id) ? 'lograda' : est.listo ? 'lista (sale al subir de nivel)' : 'falta ' + est.progreso;
    destino.evolucion = (destino.evolucion ? destino.evolucion + '  ·  ' : '') + '★ Evolución ' + evo.nombre + ': ' + como;
    destino.evolucionLograda = destino.evolucionLograda || tieneEvolucion(e, evo.id);
  });
  return filas;
}

// ===============================================================
//  ATAQUES: evoluciones de ataque, ataques secundarios (Rasguño y
//  Escarbar) y el evento "el curao al volante".
//  Los números están en src/config.js (secciones ATAQUES y CURAO).
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

  // El curao al volante
  escena.curao = null;              // auto en camino (o null)
  escena.proximoCurao = null;       // cuándo llega el próximo (null = todavía no se sortea)
  escena.numeroCurao = 0;
  escena.capaCuraoMundo = escena.add.graphics().setDepth(801);   // franja de aviso y luz de los faros
  escena.capaCuraoPantalla = escena.add.graphics().setScrollFactor(0).setDepth(1550); // borde rojo y flecha
  escena.textoCurao = null;
  escena.empujePerro = null;        // empujón del auto al perro

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
}

// Lo llama GameScene.update en cada cuadro (después de la mordida)
function actualizarAtaques(escena, delta, puedeAtacar) {
  const ahora = escena.tiempoSobrevivido;
  const A = CONFIG.ATAQUES;

  // Rasguño: zarpazo en abanico hacia el enemigo más cercano
  const nvR = escena.instintos.rasguno || 0;
  if (nvR > 0 && puedeAtacar) {
    escena.esperaRasguno = Math.min(intervaloRasguno(nvR), escena.esperaRasguno + delta);
    if (escena.esperaRasguno >= intervaloRasguno(nvR) && rasgunar(escena, nvR)) escena.esperaRasguno = 0;
  }

  // Escarbar: lanza terrones que dañan y frenan
  const nvE = escena.instintos.escarbar || 0;
  if (nvE > 0 && puedeAtacar) {
    escena.esperaEscarbar = Math.min(intervaloEscarbar(nvE), escena.esperaEscarbar + delta);
    if (escena.esperaEscarbar >= intervaloEscarbar(nvE) && escarbar(escena, nvE)) escena.esperaEscarbar = 0;
  }
  moverTerrones(escena, delta);

  // Enemigos frenados por la tierra (el jefe no se frena)
  const lentitud = Math.max(0, 1 - A.ESCARBAR.LENTITUD);
  escena.enemigos.getChildren().forEach((en) => {
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
//  EL CURAO AL VOLANTE: un auto cruza la plaza a toda velocidad
// ---------------------------------------------------------------

// Medidas del auto (el dibujo es de 14 x 22 cuadritos)
const AUTO_CURAO_ANCHO = 14 * ESCALA_PIXEL;
const AUTO_CURAO_LARGO = 22 * ESCALA_PIXEL;

// Qué tan seguido viene en esta fase (0 = no viene)
function frecuenciaCurao(fase) {
  const lista = CONFIG.CURAO.FRECUENCIA_POR_FASE || [];
  if (lista.length === 0) return 0;
  return lista[Math.min(fase, lista.length - 1)] || 0;
}

function esperaCurao(frecuencia) {
  const C = CONFIG.CURAO;
  return Phaser.Math.Between(C.ESPERA_MIN_MS, Math.max(C.ESPERA_MIN_MS, C.ESPERA_MAX_MS)) / frecuencia;
}

// Lo llama GameScene.update en cada cuadro
function actualizarCurao(escena, delta) {
  const C = CONFIG.CURAO;
  if (!C || C.ACTIVO === false) return;
  if (escena.curao) {
    avanzarCurao(escena, delta);
    return;
  }
  if (escena.amaneciendo) return;

  const ahora = escena.tiempoSobrevivido;
  const frecuencia = frecuenciaCurao(faseDeLaNoche(ahora));
  if (frecuencia <= 0) {
    escena.proximoCurao = null;
    return;
  }
  if (escena.proximoCurao === null) escena.proximoCurao = ahora + esperaCurao(frecuencia);
  if (ahora >= escena.proximoCurao) iniciarCurao(escena);
}

// Modo de prueba (tecla V): el auto viene al tiro
function pruebaCurao(escena) {
  if (escena.curao || escena.amaneciendo) return;
  iniciarCurao(escena);
}

// Empieza el aviso: elige por dónde entra y la línea que va a seguir
// (pasa cerca de donde está el perro AHORA: si te mueves, lo esquivas)
function iniciarCurao(escena) {
  const C = CONFIG.CURAO;
  const p = escena.perro;
  const vista = escena.cameras.main.worldView;
  const lado = Phaser.Math.Between(0, 3); // 0 izquierda, 1 derecha, 2 arriba, 3 abajo
  const base = [0, Math.PI, Math.PI / 2, -Math.PI / 2][lado]; // hacia dónde va
  const angulo = base + Phaser.Math.DegToRad(Phaser.Math.FloatBetween(-C.INCLINACION_GRADOS, C.INCLINACION_GRADOS));
  const dir = { x: Math.cos(angulo), y: Math.sin(angulo) };
  const perp = { x: -dir.y, y: dir.x };
  const desvio = Phaser.Math.FloatBetween(-C.DESVIO_MAX, C.DESVIO_MAX);
  const centro = { x: p.x + perp.x * desvio, y: p.y + perp.y * desvio };
  const mitadVista = (lado < 2 ? vista.width : vista.height) / 2;
  const antes = mitadVista / Math.max(0.3, Math.abs(lado < 2 ? dir.x : dir.y)) + AUTO_CURAO_LARGO + 120;
  const despues = antes + 300;

  escena.numeroCurao++;
  escena.curao = {
    id: escena.numeroCurao,
    estado: 'aviso',
    hasta: escena.tiempoSobrevivido + C.AVISO_MS,
    lado, dir, perp, angulo,
    inicio: { x: centro.x - dir.x * antes, y: centro.y - dir.y * antes },
    largo: antes + despues,
    recorrido: 0,
    zigzag: Math.random() < C.ZIGZAG_PROBABILIDAD,
    faseZigzag: Math.random() * Math.PI * 2,
    auto: null,
    golpeoPerro: false,
    atropellados: 0,
    sobreObstaculo: false
  };

  // Aviso: texto, bocina y (Galgo) el sprint queda listo para esquivarlo
  const w = escena.scale.width;
  escena.textoCurao = escena.add.text(w / 2, 178 + (escena.margenHudExtra || 0), TEXTO_CURAO, {
    fontFamily: FUENTE, fontSize: '30px', color: '#ff5252', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
  }).setOrigin(0.5).setScrollFactor(0).setDepth(1551);
  escena.tweens.add({ targets: escena.textoCurao, scale: 1.08, duration: 160, yoyo: true, repeat: -1 });
  tocarBocina(escena, 2);
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

function avanzarCurao(escena, delta) {
  const C = CONFIG.CURAO;
  const cu = escena.curao;
  const ahora = escena.tiempoSobrevivido;

  if (cu.estado === 'aviso') {
    dibujarAvisoCurao(escena, cu, ahora);
    if (ahora < cu.hasta) return;
    // ¡Viene!
    cu.estado = 'cruzar';
    escena.capaCuraoPantalla.clear();
    if (escena.textoCurao) {
      escena.tweens.killTweensOf(escena.textoCurao);
      escena.textoCurao.destroy();
      escena.textoCurao = null;
    }
    const pos = posicionCurao(cu, 0);
    cu.auto = escena.add.image(pos.x, pos.y, 'auto_curao', 0).setScale(ESCALA_PIXEL).setDepth(11);
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
    if (escena.gameOver || !escena.curao) return; // te atropelló y se acabó la partida
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
    terminarCurao(escena);
  }
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
  if (!cu.golpeoPerro) {
    const r = Math.max(4, escena.base.RADIO - (escena.poder === 'sprint' ? C.GALGO_MARGEN : 0));
    if (toca(escena.perro.x, escena.perro.y, r)) golpearPerroCurao(escena, cu, hx, hy, pos);
    if (escena.gameOver) return;
  }

  // Los enemigos: salen volando
  escena.enemigos.getChildren().slice().forEach((en) => {
    if (!en.active || en.atropellado === cu.id) return;
    if (Math.abs(en.x - pos.x) > 90 + en.radio || Math.abs(en.y - pos.y) > 90 + en.radio) return;
    if (!toca(en.x, en.y, en.radio)) return;
    en.atropellado = cu.id;
    if (en.esJefe) {
      escena.danarEnemigo(en, C.DANO_JEFE);
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
    escena.danarEnemigo(en, C.DANO_ENEMIGOS);
  });
}

// El auto le pega al perro: mucho daño y un empujón
function golpearPerroCurao(escena, cu, hx, hy, pos) {
  const C = CONFIG.CURAO;
  const ahora = escena.tiempoSobrevivido;
  if (escena.gameOver || escena.amaneciendo) return;

  // Sprint del Galgo: pasa justo al lado sin tocarlo
  if (escena.enSprint()) {
    cu.golpeoPerro = true;
    escena.textoFlotante('¡Esquivado por un pelo!', '#e1bee7');
    return;
  }
  if (ahora < escena.invulnerableHasta) return;
  cu.golpeoPerro = true;
  if (escena.efectoZona.segura) {
    escena.textoFlotante('¡Zona segura!', '#9ccc65');
    return;
  }
  if (Math.random() < bonusColeccion('antifaz', 'ESQUIVAR') + bonusArbol(escena, 'ESQUIVAR')) {
    escena.invulnerableHasta = ahora + CONFIG.PERRO_INVULNERABLE_MS;
    escena.textoFlotante('¡Esquivado!', '#e1bee7');
    return;
  }

  // Mismas reducciones que un golpe normal (Collar, Cuero de calle, Zona peligrosa, árbol)
  let dano = C.DANO * Math.max(0, 1 - escena.nivelObjeto('collar') * CONFIG.OBJETOS.collar.MENOS_DANO);
  dano *= Math.max(0, 1 - bonusColeccion('boleto', 'MENOS_DANO_CURAO')); // Boleto de micro (ultra raro de la Terminal)
  if (escena.fusiones.cuero && ahora < escena.cueroHasta) dano *= CONFIG.FUSIONES.cuero.MULTIPLICADOR;
  if (escena.efectoZona.peligro) dano *= CONFIG.ZONAS.peligro.DANO_MULTIPLICADOR || 1;
  dano *= Math.max(0, 1 - escena.reduccionArbol());
  dano = Math.max(1, Math.round(dano));

  escena.vida = Math.max(0, escena.vida - dano);
  escena.invulnerableHasta = ahora + C.INVULNERABLE_MS;
  if (escena.fusiones.cuero) escena.cueroHasta = ahora + CONFIG.FUSIONES.cuero.DURACION_MS;
  escena.cameras.main.shake(300, 0.015);
  escena.cameras.main.flash(150, 255, 60, 60);
  escena.textoFlotante('¡Atropellado! −' + dano, '#ff5252');

  // Empujón: hacia adelante del auto y hacia el lado donde estaba el perro
  const lado = -(escena.perro.x - pos.x) * hy + (escena.perro.y - pos.y) * hx >= 0 ? 1 : -1;
  const ex = hx * 0.6 - hy * lado;
  const ey = hy * 0.6 + hx * lado;
  const largo = Math.hypot(ex, ey) || 1;
  escena.empujePerro = { x: (ex / largo) * C.EMPUJE, y: (ey / largo) * C.EMPUJE, hasta: ahora + C.EMPUJE_MS };

  if (escena.vida <= 0 && !salvarseArbol(escena)) escena.terminarJuego();
}

// Borde rojo que parpadea, franja por donde pasará y flecha hacia el lado por donde entra
function dibujarAvisoCurao(escena, cu, ahora) {
  const g = escena.capaCuraoPantalla;
  const w = escena.scale.width;
  const h = escena.scale.height;
  const cam = escena.cameras.main;
  const prende = Math.floor(ahora / 150) % 2 === 0;
  g.clear();
  if (prende) {
    g.lineStyle(10, 0xff1744, 0.85);
    g.strokeRect(5, 5, w - 10, h - 10);
    // el lado por donde entra, más grueso
    g.fillStyle(0xff1744, 0.6);
    if (cu.lado === 0) g.fillRect(0, 0, 26, h);
    else if (cu.lado === 1) g.fillRect(w - 26, 0, 26, h);
    else if (cu.lado === 2) g.fillRect(0, 0, w, 26);
    else g.fillRect(0, h - 26, w, 26);
  }

  // Flecha en el borde, en el punto por donde va a aparecer, apuntando hacia afuera
  const m = 46 + margenExtra();
  const sx = Phaser.Math.Clamp(cu.inicio.x - cam.scrollX, m, w - m);
  const sy = Phaser.Math.Clamp(cu.inicio.y - cam.scrollY, m, h - m);
  const ax = -cu.dir.x;
  const ay = -cu.dir.y;
  const px = -ay;
  const py = ax;
  g.fillStyle(prende ? 0xffeb3b : 0xff5252, 1);
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

  // Franja roja por donde pasará (en el mundo, encima de la oscuridad)
  const C = CONFIG.CURAO;
  const mundo = escena.capaCuraoMundo;
  mundo.clear();
  const ancho = AUTO_CURAO_ANCHO + 16 + (cu.zigzag ? C.ZIGZAG_AMPLITUD * 2 : 0);
  mundo.lineStyle(ancho, 0xff1744, prende ? 0.22 : 0.12);
  mundo.lineBetween(cu.inicio.x, cu.inicio.y, cu.inicio.x + cu.dir.x * cu.largo, cu.inicio.y + cu.dir.y * cu.largo);
}

// Luz de los faros hacia adelante (encima de la oscuridad)
function dibujarFarosCurao(escena, cu) {
  const g = escena.capaCuraoMundo;
  g.clear();
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

// El auto se fue: limpia y sortea cuándo viene el próximo
function terminarCurao(escena) {
  const cu = escena.curao;
  if (cu && cu.auto) cu.auto.destroy();
  if (escena.textoCurao) {
    escena.tweens.killTweensOf(escena.textoCurao);
    escena.textoCurao.destroy();
    escena.textoCurao = null;
  }
  escena.capaCuraoMundo.clear();
  escena.capaCuraoPantalla.clear();
  escena.curao = null;
  const frecuencia = frecuenciaCurao(faseDeLaNoche(escena.tiempoSobrevivido));
  escena.proximoCurao = frecuencia > 0 ? escena.tiempoSobrevivido + esperaCurao(frecuencia) : null;
}

// Fin de la partida: borra todo lo de este archivo que quedó en pantalla
function limpiarAtaques(escena) {
  if (escena.curao) terminarCurao(escena);
  escena.capaMarcas.clear();
  escena.terrones.forEach((t) => t.img.destroy());
  escena.terrones = [];
  escena.agarre = null;
  escena.empujePerro = null;
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
    detalle: nvR ? numeroPausa(r.dano) + ' de daño en abanico de ' + Math.round(r.angulo) + '° cada ' + s(r.cadaMs)
      : 'Sale como instinto al subir de nivel' });

  const nvE = e.instintos.escarbar || 0;
  const d = datosEscarbar(Math.max(1, nvE));
  filas.push({ id: 'escarbar', nombre: 'Escarbar', valor: nvE ? 'Nv ' + nvE + ' / ' + max : 'sin aprender', apagado: !nvE,
    detalle: nvE ? d.terrones + (d.terrones > 1 ? ' terrones' : ' terrón') + ' de ' + numeroPausa(d.dano) + ', frena ' +
      Math.round(CONFIG.ATAQUES.ESCARBAR.LENTITUD * 100) + '% por ' + s(d.frenoMs) + ', cada ' + s(d.cadaMs)
      : 'Sale como instinto al subir de nivel' });

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

// ===============================================================
//  GRAN DANÉS (v0.36): poder pasivo "Sombra larga" y su árbol.
//  - Pasivo (sin tecla): los enemigos dentro de un cono delante del perro
//    (hacia donde mira o camina) se mueven más lento. No hace daño.
//    El Jefe y El Tripa Seca se frenan menos. Números en CONFIG.RAZAS.grandanes.
//  - Árbol (números en src/config.js, ARBOL.RAZAS.grandanes; textos en src/arbol.js):
//    Paso pesado, Farol andante, No me mueven, Estatua de la plaza,
//    Mirada seria, Ladrido grave, Quieto cabros y Dueño de la esquina.
//  Cooperativo: lo de cada perro se guarda en variables de la escena que
//  src/coop.js intercambia (estatuaHasta, estatuaListaEn, esperaEsquina,
//  tocandoPaso, ladridoGrave, graficoSombra).
// ===============================================================

// Se llama al empezar la partida (GameScene.create, después de iniciarArbol)
function iniciarGranDanes(escena) {
  escena.estatuaHasta = 0;     // Estatua de la plaza: sin recibir daño hasta este momento
  escena.estatuaListaEn = 0;   // y lista otra vez en este momento
  escena.esperaEsquina = 0;    // Dueño de la esquina
  escena.tocandoPaso = [];     // Paso pesado: enemigos que ya tocaba en el cuadro anterior
  escena.ladridoGrave = null;  // Ladrido grave: 'ladrido' o 'ladridoFuerte' (el primero que elige)
  escena.graficoSombra = null; // dibujo del cono (uno por perro)
}

// ---------------- El cono ----------------

// Datos del cono de un perro (o null si no tiene Sombra larga).
// perro, base, arbol y direccion son los de ESE perro (en cooperativo, los de J1 o J2).
function conoSombra(perro, base, arbol, direccion) {
  if (!perro || !base || !base.SOMBRA_LARGO || perro.caido) return null;
  const ancho = (base.SOMBRA_ANGULO || 80) * (1 + ((arbol && arbol.SOMBRA_ANCHO) || 0));
  const dir = direccion && direccion.lengthSq() > 0 ? direccion : { x: 1, y: 0 };
  return {
    x: perro.x, y: perro.y,
    angulo: Math.atan2(dir.y, dir.x),
    medio: Phaser.Math.DegToRad(ancho / 2),
    largo: base.SOMBRA_LARGO,
    radioPerro: base.RADIO || 0
  };
}

// ¿Está el enemigo dentro del cono? (cuenta el tamaño del enemigo)
function dentroDelCono(c, en) {
  const dx = en.x - c.x;
  const dy = en.y - c.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  const r = en.radio || 0;
  if (d > c.largo + c.radioPerro + r) return false;
  if (d < 1) return true;
  const dif = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - c.angulo));
  // un poco más de ángulo para los enemigos grandes (que el borde los alcance), sin llegar a los de atrás
  return dif <= c.medio + Math.min(0.35, Math.asin(Math.min(1, r / d)));
}

// Cono del perro que está "activo" ahora en la escena (J1, o J2 dentro de conJugador2)
function conoPerroActual(escena) {
  if (escena.poder !== 'intimida') return null;
  return conoSombra(escena.perro, escena.base, escena.arbol, escena.ultimaDireccion);
}

// Farol andante: el enemigo que te pega desde tu sombra hace menos daño (0.1 = 10%)
function reduccionFarol(escena, enemigo) {
  const menos = bonusArbol(escena, 'FAROL_MENOS_DANO');
  if (menos <= 0 || !enemigo) return 0;
  const c = conoPerroActual(escena);
  return c && dentroDelCono(c, enemigo) ? menos : 0;
}

// No me mueven: el empujón que recibe el perro se multiplica por esto
function factorEmpujeGranDanes(escena) {
  return Math.max(0, 1 - bonusArbol(escena, 'EMPUJE_MENOS'));
}

// ---------------- Una vez por cuadro, para los dos perros ----------------
// Frena a los enemigos dentro de los conos y dibuja la sombra.
// Se llama en GameScene.update después de mover a los enemigos y al jefe (fuera del turno de J2).
function frenarEnemigosGranDanes(escena) {
  const conos = [];
  const agregar = (perro, base, arbol, dir, poder, guardar) => {
    const c = poder === 'intimida' ? conoSombra(perro, base, arbol, dir) : null;
    guardar(c);
    if (!c) return;
    c.lentitud = base.SOMBRA_LENTITUD || 0;
    c.lentitudJefe = base.SOMBRA_LENTITUD_JEFE || 0;
    c.perros = (arbol && arbol.SOMBRA_PERROS) || 0;
    conos.push(c);
  };
  agregar(escena.perro, escena.base, escena.arbol, escena.ultimaDireccion, escena.poder, (c) => dibujarSombra(escena, escena, c));
  const j2 = escena.jugador2;
  if (j2) agregar(j2.perro, j2.base, j2.arbol, j2.ultimaDireccion, j2.poder, (c) => dibujarSombra(escena, j2, c));
  if (conos.length === 0) return;

  const ahora = escena.tiempoSobrevivido;
  const perrosTipos = CONFIG.ARBOL.SOMBRA_PERROS_TIPOS || [];
  escena.enemigos.getChildren().forEach((en) => {
    if (!en.active || !en.body || ahora < en.empujadoHasta) return;
    const grande = en.esJefe || (en.cfg && en.cfg.COMPORTAMIENTO === 'tripaseca');
    let lentitud = 0;
    conos.forEach((c) => {
      if (!dentroDelCono(c, en)) return;
      let l = grande ? c.lentitudJefe : c.lentitud;
      if (!grande && perrosTipos.includes(en.tipo)) l += c.perros; // Quieto, cabros
      lentitud = Math.max(lentitud, l);
    });
    if (lentitud > 0) en.body.velocity.scale(Math.max(0, 1 - lentitud));
  });
}

// Sombra suave en el suelo (dueno = la escena para J1, escena.jugador2 para J2)
function dibujarSombra(escena, dueno, c) {
  if (!c) {
    if (dueno.graficoSombra) dueno.graficoSombra.clear();
    return;
  }
  if (!dueno.graficoSombra) dueno.graficoSombra = escena.add.graphics().setDepth(3);
  const g = dueno.graficoSombra;
  g.clear();
  // tres capas: más oscura cerca del perro, más suave en la punta
  [[1, 0.12], [0.72, 0.12], [0.45, 0.12]].forEach(([parte, alfa]) => {
    g.fillStyle(0x0d0d1a, alfa);
    g.slice(c.x, c.y, c.radioPerro + c.largo * parte, c.angulo - c.medio, c.angulo + c.medio, false);
    g.fillPath();
  });
  g.lineStyle(1, 0x9fa8da, 0.25);
  g.slice(c.x, c.y, c.radioPerro + c.largo, c.angulo - c.medio, c.angulo + c.medio, false);
  g.strokePath();
}

// ---------------- Cada cuadro, por perro (lo llama actualizarArbol) ----------------

function actualizarGranDanes(escena, delta, puedeAtacar) {
  const A = (k) => bonusArbol(escena, k);
  const p = escena.perro;
  const ahora = escena.tiempoSobrevivido;

  // Estatua de la plaza: gris mientras dura
  if (A('ESTATUA_MS') > 0) {
    const estatua = ahora < (escena.estatuaHasta || 0);
    if (estatua && !p.estatuaGris) {
      p.estatuaGris = true;
      p.setTint(0x9e9e9e);
    } else if (!estatua && p.estatuaGris) {
      p.estatuaGris = false;
      p.clearTint();
    }
  }

  // Paso pesado: al caminar, el enemigo que tocas (recién) puede quedar aturdido
  if (A('PASO_PROBABILIDAD') > 0) {
    const caminando = p.body && p.body.velocity.length() > 20 && !p.caido;
    const antes = escena.tocandoPaso || [];
    const ahoraToca = [];
    escena.enemigos.getChildren().forEach((en) => {
      if (!en.active) return;
      if (Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) > escena.base.RADIO + (en.radio || 0) + 4) return;
      ahoraToca.push(en);
      if (!caminando || antes.includes(en) || en.esJefe) return;
      if (Math.random() < A('PASO_PROBABILIDAD')) {
        en.aturdidoHasta = Math.max(en.aturdidoHasta || 0, ahora + A('PASO_ATURDIR_MS'));
        escena.textoFlotante('¡Pum!', '#b0bec5');
      }
    });
    escena.tocandoPaso = ahoraToca;
  }

  if (escena.amaneciendo) return;

  // Dueño de la esquina: ladrido grave automático cada cierto tiempo, si hay enemigos cerca
  if (A('ESQUINA_CADA_MS') > 0) {
    escena.esperaEsquina = Math.min(A('ESQUINA_CADA_MS'), (escena.esperaEsquina || 0) + delta);
    const radio = A('ESQUINA_RADIO');
    if (escena.esperaEsquina >= A('ESQUINA_CADA_MS') && puedeAtacar && !p.caido &&
        escena.enemigos.getChildren().some((en) => en.active && Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) <= radio + (en.radio || 0))) {
      escena.esperaEsquina = 0;
      escena.ladrar({ radio, dano: A('ESQUINA_DANO'), color: 0x7e57c2 });
      escena.textoFlotante('¡GUAU!', '#b39ddb');
    }
  }
}

// Estatua de la plaza: se llama justo después de que el perro pierde vida.
// Si bajó del límite (y sigue vivo), queda un rato sin recibir daño.
function revisarEstatua(escena) {
  const ms = bonusArbol(escena, 'ESTATUA_MS');
  if (ms <= 0 || escena.vida <= 0) return;
  const ahora = escena.tiempoSobrevivido;
  if (ahora < (escena.estatuaListaEn || 0)) return;
  if (escena.vida >= escena.vidaMax * bonusArbol(escena, 'ESTATUA_VIDA')) return;
  escena.estatuaHasta = ahora + ms;
  escena.estatuaListaEn = ahora + bonusArbol(escena, 'ESTATUA_RECARGA_MS');
  escena.invulnerableHasta = Math.max(escena.invulnerableHasta || 0, escena.estatuaHasta);
  escena.textoFlotante('¡Estatua!', '#e0e0e0');
}

// Ladrido grave: el primero de los dos ladridos que elige queda marcado
// (lo llama GameScene.aplicarInstinto)
function marcarLadridoGrave(escena, id) {
  if (bonusArbol(escena, 'LADRIDO_GRAVE') <= 0 || escena.ladridoGrave) return;
  if (id === 'ladrido' || id === 'ladridoFuerte') escena.ladridoGrave = id;
}

// Niveles de radio extra que da el Ladrido grave a ese ladrido (0 o 1)
function nivelesLadridoGrave(escena, id) {
  if (!escena || escena.ladridoGrave !== id) return 0;
  return bonusArbol(escena, 'LADRIDO_GRAVE');
}

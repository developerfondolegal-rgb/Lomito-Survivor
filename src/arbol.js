// ===============================================================
//  ÁRBOL DE HABILIDADES POR RAZA (se paga con huesitos guardados)
//  - Cada raza tiene 3 ramas con 4 mejoras. Para comprar una mejora
//    hay que tener la anterior de su rama. La 4ª es una habilidad ESPECIAL.
//  - Lo comprado se guarda en el navegador (localStorage), igual que los
//    huesitos (src/huesitos.js) y la colección.
//  - Los efectos se aplican al EMPEZAR una partida con esa raza
//    (src/scenes/GameScene.js) y se ven en la pestaña Stats de la pausa.
//  - La pantalla para comprar es src/scenes/ArbolScene.js (tecla G en el menú).
//
//  Los NÚMEROS (costos y efectos) están en src/config.js, sección ARBOL.
//  Aquí están los nombres, textos e íconos.
//  En los textos, {CLAVE} se cambia por el número de config.js:
//   {CLAVE}  = el número tal cual      {CLAVE%} = como porcentaje (0.3 → 30%)
//   {CLAVEs} = milisegundos en segundos (3000 → 3 s)
// ===============================================================

const ARBOL_RAMAS = {
  quiltro: [
    {
      id: 'calle', nombre: 'Calle', color: 0xffb74d, icono: 'calle',
      nodos: [
        { nombre: 'Mañas de calle', texto: 'El poder Calle cura {CALLE_RAPIDEZ%} más rápido.' },
        { nombre: 'Hueso de regalo', texto: '{HUESO_EXTRA%} de probabilidad de que cada enemigo suelte 1 hueso extra.' },
        { nombre: 'Conoce el barrio', texto: 'El poder Calle cura +{CALLE_CURA} de vida cada vez.' },
        { nombre: 'Dueño del barrio', texto: 'ESPECIAL: cada {DUENO_CADA_ENEMIGOS} enemigos derrotados, el último suelta una comida.' }
      ]
    },
    {
      id: 'suerte', nombre: 'Suerte', color: 0x81c784, icono: 'suerte',
      nodos: [
        { nombre: 'Moneda en el suelo', texto: '+{HUESITOS%} de huesitos al terminar la partida.' },
        { nombre: 'Ojo para lo bueno', texto: 'Los objetos caen {OBJETO%} más seguido.' },
        { nombre: 'Estrella de la calle', texto: 'Los ultra raros caen +{ULTRA%} más seguido de los enemigos normales.' },
        { nombre: 'Pata de conejo', texto: 'ESPECIAL: los enemigos élite SIEMPRE sueltan un ultra raro.' }
      ]
    },
    {
      id: 'supervivencia', nombre: 'Supervivencia', color: 0xef5350, icono: 'supervivencia',
      nodos: [
        { nombre: 'Cuero curtido', texto: '+{VIDA} de vida máxima.' },
        { nombre: 'Estómago de fierro', texto: 'La comida cura {COMIDA%} más y la pileta cura {COMIDA%} más rápido.' },
        { nombre: 'Vigor de mestizo', texto: 'Regeneración {REGENERACION%} más rápida y +{VIDA} de vida máxima.' },
        { nombre: 'Siete vidas', texto: 'ESPECIAL: 1 vez por partida, al recibir un golpe mortal vuelves con {SIETE_VIDAS%} de la vida.' }
      ]
    }
  ],
  pitbull: [
    {
      id: 'mordida', nombre: 'Mordida', color: 0xff8a65, icono: 'mordida',
      nodos: [
        { nombre: 'Quijada fuerte', texto: '+{DANO%} de daño de mordida.' },
        { nombre: 'Colmillo certero', texto: '{CRITICO%} de probabilidad de mordida crítica (doble daño).' },
        { nombre: 'Mordisco rápido', texto: 'Muerde {MORDIDA_RAPIDEZ%} más seguido.' },
        { nombre: 'Sacudida', texto: 'ESPECIAL: cada mordida también daña a los enemigos a {SACUDIDA_RADIO} px del mordido ({SACUDIDA%} del daño).' }
      ]
    },
    {
      id: 'aguante', nombre: 'Aguante', color: 0x90a4ae, icono: 'aguante',
      nodos: [
        { nombre: 'Pecho ancho', texto: '+{VIDA} de vida máxima.' },
        { nombre: 'Piel gruesa', texto: '{MENOS_DANO%} menos daño recibido.' },
        { nombre: 'Lamerse las heridas', texto: 'Recupera 1 de vida cada {CURA_CADA_MSs} y +{VIDA} de vida máxima.' },
        { nombre: 'Inamovible', texto: 'ESPECIAL: la Perrera no te puede atrapar y las embestidas te hacen {INAMOVIBLE%} menos daño.' }
      ]
    },
    {
      id: 'furia', nombre: 'Furia', color: 0xffd54f, icono: 'furia',
      nodos: [
        { nombre: 'Mandíbula ansiosa', texto: 'La Mandíbula de hierro se carga {MANDIBULA_RECARGA%} más rápido.' },
        { nombre: 'Mandíbula pesada', texto: 'La Mandíbula de hierro hace +{MANDIBULA_DANO} de daño y aturde {MANDIBULA_ATURDIR_MSs} más.' },
        { nombre: 'Sangre caliente', texto: '+{FURIA_DANO%} de daño cuando te queda menos del {FURIA_VIDA%} de vida.' },
        { nombre: 'Berserker', texto: 'ESPECIAL: con menos del {BERSERKER%} de vida, TODAS tus mordidas son de Mandíbula de hierro.' }
      ]
    }
  ],
  galgo: [
    {
      id: 'sprint', nombre: 'Sprint', color: 0x4fc3f7, icono: 'sprint',
      nodos: [
        { nombre: 'Zancada larga', texto: 'El sprint dura {SPRINT_DURACION_MSs} más.' },
        { nombre: 'Pulmones de atleta', texto: 'El sprint se recarga {SPRINT_RECARGA%} más rápido.' },
        { nombre: 'Patas de resorte', texto: 'Sprint +{SPRINT_VELOCIDAD} de velocidad y se recarga {SPRINT_RECARGA%} más rápido.' },
        { nombre: 'Rayo gris', texto: 'ESPECIAL: el sprint hace {RAYO_DANO} de daño a cada enemigo que atraviesas.' }
      ]
    },
    {
      id: 'esquiva', nombre: 'Esquiva', color: 0xb39ddb, icono: 'esquiva',
      nodos: [
        { nombre: 'Cuerpo liviano', texto: '+{VELOCIDAD%} de velocidad.' },
        { nombre: 'Quiebre de cintura', texto: '{ESQUIVAR%} de probabilidad de esquivar un golpe.' },
        { nombre: 'Viento en contra', texto: '+{ESQUIVAR%} de esquivar y +{VELOCIDAD%} de velocidad.' },
        { nombre: 'Reflejos', texto: 'ESPECIAL: al esquivar, el sprint queda listo al tiro y quedas {REFLEJOS_MSs} más sin recibir daño.' }
      ]
    },
    {
      id: 'caza', nombre: 'Caza', color: 0xe57373, icono: 'caza',
      nodos: [
        { nombre: 'Ojo de presa', texto: '+{CAZA_DANO%} de daño a enemigos rápidos (rival, manada) o que embisten.' },
        { nombre: 'Persecución', texto: '+{CAZA_DANO%} más de daño a enemigos rápidos o que embisten.' },
        { nombre: 'Remate', texto: '{CAZA_CRITICO%} de crítico (doble daño) contra enemigos rápidos o que embisten.' },
        { nombre: 'Lebrel', texto: 'ESPECIAL: la primera mordida después de cada sprint hace ×{LEBREL_MULTIPLICADOR} de daño a hasta {LEBREL_OBJETIVOS} enemigos.' }
      ]
    }
  ],
  beagle: [
    {
      id: 'olfato', nombre: 'Olfato', color: 0xa1887f, icono: 'olfato',
      nodos: [
        { nombre: 'Hocico húmedo', texto: '+{IMAN} de alcance del imán de huesos.' },
        { nombre: 'Nariz fina', texto: '+{IMAN} de imán y los huesos vuelan {IMAN_RAPIDEZ%} más rápido hacia ti.' },
        { nombre: 'Huele la comida', texto: 'La comida aparece {COMIDA_RAPIDEZ%} más seguido.' },
        { nombre: 'Nariz de sabueso', texto: 'ESPECIAL: el Rastreo también señala comida (verde) y objetos (morado) fuera de la pantalla.' }
      ]
    },
    {
      id: 'botin', nombre: 'Botín', color: 0xf2d64b, icono: 'botin',
      nodos: [
        { nombre: 'Buen comedor', texto: '+{XP%} de experiencia por hueso.' },
        { nombre: 'Escarbador', texto: '{HUESO_EXTRA%} de probabilidad de que cada enemigo suelte 1 hueso extra.' },
        { nombre: 'Coleccionista', texto: '+{HUESITOS%} de huesitos al terminar la partida.' },
        { nombre: 'Tesoro enterrado', texto: 'ESPECIAL: cada {TESORO_CADA_MSs} desentierras un objeto raro o mejor cerca de ti.' }
      ]
    },
    {
      id: 'manada', nombre: 'Manada', color: 0x64b5f6, icono: 'manada',
      nodos: [
        { nombre: 'Lomo erizado', texto: '{GRUPO_DEFENSA%} menos daño por cada enemigo cerca (máx. 5).' },
        { nombre: 'Valor de jauría', texto: '+{GRUPO_DANO%} de daño por cada enemigo cerca (máx. 5).' },
        { nombre: 'Uno para todos', texto: '+{GRUPO_DEFENSA%} menos daño y +{GRUPO_DANO%} de daño por cada enemigo cerca.' },
        { nombre: 'Aullido de la manada', texto: 'ESPECIAL: cada {AULLIDO_CADA_MSs} aúllas: {AULLIDO_DANO} de daño, empuja y hace huir a los enemigos cercanos.' }
      ]
    }
  ]
};

const ARBOL_NODOS = 4; // mejoras por rama

// ---------------- Guardado en el navegador (localStorage) ----------------
// Se guarda así: { version: 1, razas: { quiltro: { calle: 2, suerte: 0, ... } }, gastado: { quiltro: 170 },
//                 general: { colmillosAfilados: 2 }, gastadoGeneral: 120 }
// (el número de cada rama = cuántas mejoras de esa rama compraste, de 0 a 4;
//  "general" = mejoras para todas las razas, como Colmillos afilados (v0.22))

let ARBOL_EN_MEMORIA = null;

function datosArbol() {
  if (ARBOL_EN_MEMORIA) return ARBOL_EN_MEMORIA;
  let datos = null;
  try {
    const texto = window.localStorage.getItem(CONFIG.ARBOL.GUARDADO);
    if (texto) datos = JSON.parse(texto);
  } catch (e) {
    datos = null; // el navegador no deja guardar o el guardado está roto: se empieza de cero
  }
  if (!datos || typeof datos !== 'object') datos = {};
  const limpio = { version: 1, razas: {}, gastado: {}, general: {}, gastadoGeneral: 0 };
  const razas = datos.razas && typeof datos.razas === 'object' ? datos.razas : {};
  const gastado = datos.gastado && typeof datos.gastado === 'object' ? datos.gastado : {};
  Object.keys(ARBOL_RAMAS).forEach((razaId) => {
    limpio.razas[razaId] = {};
    ARBOL_RAMAS[razaId].forEach((rama) => {
      const n = Number(razas[razaId] && razas[razaId][rama.id]);
      limpio.razas[razaId][rama.id] = Number.isFinite(n) ? Math.max(0, Math.min(ARBOL_NODOS, Math.floor(n))) : 0;
    });
    const g = Number(gastado[razaId]);
    limpio.gastado[razaId] = Number.isFinite(g) && g > 0 ? Math.floor(g) : 0;
  });
  // Mejoras generales (todas las razas)
  const general = datos.general && typeof datos.general === 'object' ? datos.general : {};
  const nc = Number(general.colmillosAfilados);
  limpio.general.colmillosAfilados = Number.isFinite(nc) ? Math.max(0, Math.min(nivelesColmillos(), Math.floor(nc))) : 0;
  const gg = Number(datos.gastadoGeneral);
  limpio.gastadoGeneral = Number.isFinite(gg) && gg > 0 ? Math.floor(gg) : 0;
  ARBOL_EN_MEMORIA = limpio;
  return limpio;
}

function guardarArbol() {
  try {
    window.localStorage.setItem(CONFIG.ARBOL.GUARDADO, JSON.stringify(datosArbol()));
    return true;
  } catch (e) {
    console.warn('No se pudo guardar el árbol de habilidades en el navegador:', e);
    return false;
  }
}

// Se usa en "Borrar progreso" del Álbum
function borrarArbol() {
  ARBOL_EN_MEMORIA = null;
  try {
    window.localStorage.removeItem(CONFIG.ARBOL.GUARDADO);
  } catch (e) {
    console.warn('No se pudo borrar el árbol de habilidades del navegador:', e);
  }
}

// ---------------- Consultas ----------------

function ramasDeRaza(razaId) {
  return ARBOL_RAMAS[razaId] || [];
}

// Cuántas mejoras de la rama tiene compradas (0 a 4)
function nivelRama(razaId, ramaId) {
  const r = datosArbol().razas[razaId];
  return (r && r[ramaId]) || 0;
}

// Costo del nodo i (0 = el primero de la rama)
function costoNodo(i) {
  const costos = CONFIG.ARBOL.COSTOS || [];
  return Math.max(0, Math.floor(costos[Math.min(i, costos.length - 1)] || 0));
}

// 'comprado', 'disponible' (es el siguiente de su rama) o 'bloqueado'
function estadoNodo(razaId, ramaId, i) {
  const nivel = nivelRama(razaId, ramaId);
  if (i < nivel) return 'comprado';
  if (i === nivel) return 'disponible';
  return 'bloqueado';
}

function mejorasCompradas(razaId) {
  return ramasDeRaza(razaId).reduce((t, rama) => t + nivelRama(razaId, rama.id), 0);
}

function gastadoEnRaza(razaId) {
  return datosArbol().gastado[razaId] || 0;
}

// Números del nodo (de src/config.js)
function numerosNodo(razaId, ramaId, i) {
  const r = CONFIG.ARBOL.RAZAS[razaId];
  return (r && r[ramaId] && r[ramaId][i]) || {};
}

// Texto del efecto con los números de config.js puestos
function textoNodo(razaId, ramaId, i) {
  const rama = ramasDeRaza(razaId).find((x) => x.id === ramaId);
  const nodo = rama && rama.nodos[i];
  if (!nodo) return '';
  const nums = numerosNodo(razaId, ramaId, i);
  return nodo.texto.replace(/\{([A-Z_]+?)(%|s)?\}/g, (todo, clave, tipo) => {
    const v = nums[clave];
    if (typeof v !== 'number') return '?';
    if (tipo === '%') return Math.round(v * 100) + '%';
    if (tipo === 's') return numeroArbol(v / 1000) + ' s';
    return numeroArbol(v);
  });
}

function numeroArbol(n) {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

// ---------------- Colmillos afilados (mejora general, v0.22) ----------------
// Sirve para todas las razas. "Reiniciar árbol" de una raza no la quita.

function nivelesColmillos() {
  return (CONFIG.ARBOL.COLMILLOS_COSTOS || []).length;
}

// Nivel comprado (0 = ninguno)
function nivelColmillos() {
  return datosArbol().general.colmillosAfilados || 0;
}

// Costo del siguiente nivel (null si ya está al máximo)
function costoColmillos() {
  const n = nivelColmillos();
  if (n >= nivelesColmillos()) return null;
  return Math.max(0, Math.floor(CONFIG.ARBOL.COLMILLOS_COSTOS[n] || 0));
}

// Daño extra que da (0.1 = +10%)
function bonusColmillos(nivel) {
  return (nivel === undefined ? nivelColmillos() : nivel) * (CONFIG.ARBOL.COLMILLOS_DANIO_POR_NIVEL || 0);
}

// Compra el siguiente nivel si alcanzan los huesitos. Devuelve true si se compró.
function comprarColmillos() {
  const costo = costoColmillos();
  if (costo === null || huesitosGuardados() < costo) return false;
  const datos = datosArbol();
  datos.general.colmillosAfilados = nivelColmillos() + 1;
  datos.gastadoGeneral += costo;
  sumarHuesitos(-costo);
  guardarArbol();
  return true;
}

// ---------------- Comprar y reiniciar ----------------

// Compra el siguiente nodo de la rama si alcanzan los huesitos. Devuelve true si se compró.
function comprarNodo(razaId, ramaId, i) {
  if (estadoNodo(razaId, ramaId, i) !== 'disponible') return false;
  const costo = costoNodo(i);
  if (huesitosGuardados() < costo) return false;
  const datos = datosArbol();
  datos.razas[razaId][ramaId] = i + 1;
  datos.gastado[razaId] = (datos.gastado[razaId] || 0) + costo;
  sumarHuesitos(-costo);
  guardarArbol();
  return true;
}

// Borra el árbol de una raza y devuelve los huesitos gastados. Devuelve cuántos se devolvieron.
function reiniciarArbolRaza(razaId) {
  const datos = datosArbol();
  const devolver = Math.floor(gastadoEnRaza(razaId) * (CONFIG.ARBOL.DEVOLUCION === undefined ? 1 : CONFIG.ARBOL.DEVOLUCION));
  ramasDeRaza(razaId).forEach((rama) => { datos.razas[razaId][rama.id] = 0; });
  datos.gastado[razaId] = 0;
  guardarArbol();
  if (devolver > 0) sumarHuesitos(devolver);
  return devolver;
}

// ---------------- Efectos en la partida ----------------

// Suma los números de todas las mejoras compradas de la raza: { VIDA: 25, DANO: 0.1, ... }
function efectosArbol(razaId) {
  const suma = {};
  ramasDeRaza(razaId).forEach((rama) => {
    const nivel = nivelRama(razaId, rama.id);
    for (let i = 0; i < nivel; i++) {
      const nums = numerosNodo(razaId, rama.id, i);
      Object.keys(nums).forEach((k) => {
        if (typeof nums[k] === 'number') suma[k] = (suma[k] || 0) + nums[k];
      });
    }
  });
  return suma;
}

// Bonus del árbol en esta partida (0 si no lo tiene)
function bonusArbol(escena, clave) {
  return (escena && escena.arbol && escena.arbol[clave]) || 0;
}

// Se llama al empezar la partida, ANTES de calcular la vida.
// Lo comprado después de empezar no cambia la partida en curso.
function iniciarArbol(escena) {
  escena.arbol = efectosArbol(escena.razaId);
  escena.colmillosAfilados = nivelColmillos(); // mejora general (v0.22): se fija al empezar la partida
  escena.sieteVidasUsada = false;
  escena.muertesDueno = 0;
  escena.esperaCuraArbol = 0;
  escena.esperaTesoro = 0;
  escena.esperaAullido = 0;
  escena.numeroSprint = 0;
  escena.lebrelListo = false;
}

// Cuántos enemigos hay cerca del perro (para la rama Manada), hasta GRUPO_MAXIMO
function enemigosCercaArbol(escena) {
  const A = CONFIG.ARBOL;
  const r = A.GRUPO_RADIO || 160;
  const p = escena.perro;
  let n = 0;
  const lista = escena.enemigos.getChildren();
  for (let i = 0; i < lista.length && n < (A.GRUPO_MAXIMO || 5); i++) {
    if (Phaser.Math.Distance.Between(p.x, p.y, lista[i].x, lista[i].y) <= r) n++;
  }
  return n;
}

// Enemigo "rápido" para la rama Caza: velocidad base alta o embistiendo
function esPresaRapida(enemigo) {
  const v = (enemigo.cfg && enemigo.cfg.VELOCIDAD) || 0;
  return v >= (CONFIG.ARBOL.CAZA_VELOCIDAD_MINIMA || 110) || enemigo.estado === 'embestir';
}

// Lo que hacen las mejoras especiales en cada cuadro (lo llama GameScene.update)
function actualizarArbol(escena, delta, puedeAtacar) {
  const A = (k) => bonusArbol(escena, k);

  // Lamerse las heridas (Pitbull): 1 de vida cada cierto tiempo
  if (A('CURA_CADA_MS') > 0 && escena.vida < escena.vidaMax) {
    escena.esperaCuraArbol += delta;
    if (escena.esperaCuraArbol >= A('CURA_CADA_MS') / escena.multiplicadorRegeneracion()) {
      escena.esperaCuraArbol = 0;
      escena.vida = Math.min(escena.vidaMax, escena.vida + 1);
    }
  }

  // Rayo gris (Galgo): el sprint daña una vez a cada enemigo que atraviesa
  if (A('RAYO_DANO') > 0 && escena.enSprint()) {
    const p = escena.perro;
    escena.enemigos.getChildren().slice().forEach((en) => {
      if (en.rayoSprint === escena.numeroSprint) return;
      if (Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) > escena.base.RADIO + en.radio + 8) return;
      en.rayoSprint = escena.numeroSprint;
      escena.mostrarMordida(en, false, true);
      escena.danarEnemigo(en, A('RAYO_DANO'));
    });
  }

  if (escena.amaneciendo) return;

  // Tesoro enterrado (Beagle): cada cierto tiempo, un objeto raro o mejor cerca
  if (A('TESORO_CADA_MS') > 0) {
    escena.esperaTesoro += delta;
    if (escena.esperaTesoro >= A('TESORO_CADA_MS')) {
      escena.esperaTesoro = 0;
      const ang = Math.random() * Math.PI * 2;
      const lugar = escena.plaza.buscarLibre(escena.perro.x + Math.cos(ang) * 110, escena.perro.y + Math.sin(ang) * 110, 14);
      escena.soltarObjeto(lugar.x, lugar.y, null, escena.sortearRareza('raro'));
      escena.textoFlotante('¡Tesoro enterrado!', '#f2d64b');
    }
  }

  // Aullido de la manada (Beagle): ladrido grande cada cierto tiempo, si hay enemigos cerca
  if (A('AULLIDO_CADA_MS') > 0) {
    escena.esperaAullido = Math.min(A('AULLIDO_CADA_MS'), escena.esperaAullido + delta);
    if (escena.esperaAullido >= A('AULLIDO_CADA_MS') && puedeAtacar && enemigosCercaArbol(escena) > 0) {
      escena.esperaAullido = 0;
      escena.ladrar({ radio: A('AULLIDO_RADIO'), dano: A('AULLIDO_DANO'), huirMs: A('AULLIDO_HUIR_MS'), color: 0x64b5f6 });
      escena.textoFlotante('¡Auuuu!', '#90caf9');
    }
  }
}

// Al derrotar un enemigo (lo llama danarEnemigo): Dueño del barrio (Quiltro)
function alDerrotarArbol(escena, enemigo) {
  const cada = bonusArbol(escena, 'DUENO_CADA_ENEMIGOS');
  if (cada <= 0) return;
  escena.muertesDueno++;
  if (escena.muertesDueno >= cada) {
    escena.muertesDueno = 0;
    const lugar = escena.plaza.libre(enemigo.x, enemigo.y, 12) ? enemigo : escena.plaza.buscarLibre(enemigo.x, enemigo.y, 12);
    escena.soltarComida(lugar.x, lugar.y);
  }
}

// Siete vidas (Quiltro): se llama cuando la vida llega a 0. Devuelve true si se salvó.
function salvarseArbol(escena) {
  const parte = bonusArbol(escena, 'SIETE_VIDAS');
  if (parte <= 0 || escena.sieteVidasUsada) return false;
  escena.sieteVidasUsada = true;
  escena.vida = Math.max(1, Math.ceil(escena.vidaMax * parte));
  escena.invulnerableHasta = escena.tiempoSobrevivido + 2000;
  escena.cameras.main.flash(300, 255, 255, 255);
  escena.textoFlotante('¡Siete vidas!', '#ffe082');
  return true;
}

// ---------------- Para la pestaña Stats de la pausa ----------------

// Las mejoras que no se ven en otros stats (huesitos, objetos, especiales...)
function partesArbolStats(escena) {
  const A = (k) => bonusArbol(escena, k);
  const pct = (v) => Math.round(v * 100) + '%';
  const p = [];
  if (escena.colmillosAfilados) p.push('Colmillos afilados +' + pct(bonusColmillos(escena.colmillosAfilados)) + ' daño');
  if (A('HUESITOS')) p.push('+' + pct(A('HUESITOS')) + ' huesitos');
  if (A('HUESO_EXTRA')) p.push(pct(A('HUESO_EXTRA')) + ' hueso extra');
  if (A('OBJETO')) p.push('objetos +' + pct(A('OBJETO')));
  if (A('ULTRA')) p.push('ultra raros +' + pct(A('ULTRA')));
  if (A('COMIDA')) p.push('comida/pileta +' + pct(A('COMIDA')));
  if (A('COMIDA_RAPIDEZ')) p.push('más comida +' + pct(A('COMIDA_RAPIDEZ')));
  if (A('IMAN_RAPIDEZ')) p.push('huesos vuelan +' + pct(A('IMAN_RAPIDEZ')));
  if (A('SPRINT_DURACION_MS') || A('SPRINT_VELOCIDAD')) {
    p.push('sprint ' + numeroArbol((escena.base.SPRINT_DURACION_MS + A('SPRINT_DURACION_MS')) / 1000) + ' s a ' +
      (escena.base.SPRINT_VELOCIDAD + A('SPRINT_VELOCIDAD')));
  }
  if (A('SPRINT_RECARGA')) p.push('sprint recarga +' + pct(A('SPRINT_RECARGA')));
  if (A('CAZA_DANO')) p.push('+' + pct(A('CAZA_DANO')) + ' daño a rápidos');
  if (A('CAZA_CRITICO')) p.push(pct(A('CAZA_CRITICO')) + ' crítico a rápidos');
  if (A('FURIA_DANO')) p.push('+' + pct(A('FURIA_DANO')) + ' daño bajo ' + pct(A('FURIA_VIDA')) + ' vida');
  if (A('GRUPO_DANO')) p.push('+' + pct(A('GRUPO_DANO')) + ' daño por enemigo cerca');
  if (A('GRUPO_DEFENSA')) p.push('−' + pct(A('GRUPO_DEFENSA')) + ' daño por enemigo cerca');
  // Especiales (4º nodo de cada rama)
  ramasDeRaza(escena.razaId).forEach((rama) => {
    if (nivelRama(escena.razaId, rama.id) >= ARBOL_NODOS) {
      let nombre = '★ ' + rama.nodos[ARBOL_NODOS - 1].nombre;
      if (rama.id === 'supervivencia' && escena.sieteVidasUsada) nombre += ' (usada)';
      p.push(nombre);
    }
  });
  return p;
}

// ---------------- Íconos en pixel art (8 x 8) ----------------
// '#' = pixel pintado. Los usa src/scenes/ArbolScene.js
const ICONOS_ARBOL = {
  calle: ['...##...', '..####..', '.######.', '########', '.#....#.', '.#.##.#.', '.#.##.#.', '.######.'],
  suerte: ['...##...', '...##...', '########', '.######.', '..####..', '.######.', '.##..##.', '##....##'],
  supervivencia: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
  mordida: ['########', '########', '.##..##.', '.##..##.', '..#..#..', '........', '.##..##.', '########'],
  aguante: ['########', '#......#', '#.####.#', '#.####.#', '#.####.#', '.#.##.#.', '..#..#..', '...##...'],
  furia: ['....#...', '...##...', '..###.#.', '.######.', '.######.', '########', '.######.', '..####..'],
  sprint: ['....###.', '...###..', '..###...', '.######.', '...###..', '..###...', '.##.....', '#.......'],
  esquiva: ['######..', '......#.', '..####.#', '......#.', '#####...', '........', '.######.', '........'],
  caza: ['..####..', '.#....#.', '#..##..#', '#.####.#', '#.####.#', '#..##..#', '.#....#.', '..####..'],
  olfato: ['........', '.######.', '########', '##.##.##', '########', '.######.', '..####..', '........'],
  botin: ['........', '##....##', '########', '.######.', '.######.', '########', '##....##', '........'],
  manada: ['.#....#.', '###..###', '.#.##.#.', '..####..', '.######.', '.######.', '..####..', '........'],
  candado: ['..####..', '.#....#.', '.#....#.', '########', '###..###', '###..###', '########', '........'],
  estrella: ['...#....', '..###...', '#######.', '.#####..', '.##.##..', '#.....#.', '........', '........']
};

// Dibuja un ícono con su esquina superior izquierda en (x, y). tam = tamaño de cada pixel
function dibujarIconoArbol(g, x, y, icono, tam, color, alfa) {
  const filas = ICONOS_ARBOL[icono];
  if (!filas) return;
  g.fillStyle(color, alfa === undefined ? 1 : alfa);
  filas.forEach((fila, fy) => {
    for (let fx = 0; fx < fila.length; fx++) {
      if (fila[fx] === '#') g.fillRect(x + fx * tam, y + fy * tam, tam, tam);
    }
  });
}

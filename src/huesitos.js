// ===============================================================
//  HUESITOS: la moneda del juego
//  - Durante la partida se juntan "huesitos de la partida" (todavía
//    NO guardados). Se ven arriba a la izquierda en la partida.
//  - Al terminar (muerte o amanecer) se suman al total guardado
//    en el navegador (localStorage), igual que la colección.
//  - El total guardado se ve en la pantalla de inicio y se puede
//    apostar en el Rincón de apuestas (src/scenes/ApuestasScene.js).
//
//  Los números están en src/config.js, sección HUESITOS.
// ===============================================================

// ---------------- Guardado en el navegador (localStorage) ----------------
// Se guarda así: { version: 1, total: 120 }

let HUESITOS_EN_MEMORIA = null;

function datosHuesitos() {
  if (HUESITOS_EN_MEMORIA) return HUESITOS_EN_MEMORIA;
  let datos = null;
  try {
    const texto = window.localStorage.getItem(CONFIG.HUESITOS.GUARDADO);
    if (texto) datos = JSON.parse(texto);
  } catch (e) {
    datos = null; // el navegador no deja guardar o el guardado está roto: se empieza de cero
  }
  if (!datos || typeof datos !== 'object') datos = { version: 1, total: 0 };
  const total = Number(datos.total);
  datos.total = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  HUESITOS_EN_MEMORIA = datos;
  return datos;
}

function guardarHuesitos() {
  try {
    window.localStorage.setItem(CONFIG.HUESITOS.GUARDADO, JSON.stringify(datosHuesitos()));
    return true;
  } catch (e) {
    console.warn('No se pudieron guardar los huesitos en el navegador:', e);
    return false;
  }
}

// Total guardado
function huesitosGuardados() {
  return datosHuesitos().total;
}

// Suma (o resta, si cantidad es negativa) al total guardado y guarda al tiro.
// Nunca baja de 0. Devuelve el total nuevo.
function sumarHuesitos(cantidad) {
  const datos = datosHuesitos();
  datos.total = Math.max(0, Math.floor(datos.total + (Math.floor(cantidad) || 0)));
  guardarHuesitos();
  return datos.total;
}

// Se usa en "Borrar progreso" del Álbum
function borrarHuesitos() {
  HUESITOS_EN_MEMORIA = { version: 1, total: 0 };
  try {
    window.localStorage.removeItem(CONFIG.HUESITOS.GUARDADO);
  } catch (e) {
    console.warn('No se pudieron borrar los huesitos del navegador:', e);
  }
}

// ---------------- En la partida ----------------

// Se llama al empezar la partida
function iniciarHuesitos(escena) {
  escena.huesitosApuestas = 0;     // lo ganado (+) o perdido (−) en el rincón durante la partida
  escena.jefesDerrotados = 0;
  escena.huesitosCobrados = false; // true cuando ya se sumaron al total guardado
}

// Desglose de los huesitos de la partida. victoria = true si amaneció.
// Devuelve { lineas: [{ nombre, cantidad }], total }
function desgloseHuesitos(escena, victoria) {
  const H = CONFIG.HUESITOS;
  const lineas = [
    { nombre: 'Minutos', cantidad: Math.floor(escena.tiempoSobrevivido / 60000) * H.POR_MINUTO },
    { nombre: 'Nivel', cantidad: Math.max(0, escena.nivel - 1) * H.POR_NIVEL },
    { nombre: 'Enemigos', cantidad: Math.floor(escena.derrotados / Math.max(1, H.ENEMIGOS_POR_HUESITO)) },
    { nombre: 'Desafíos', cantidad: (escena.desafiosCompletados || []).length * H.POR_DESAFIO },
    { nombre: 'Jefe', cantidad: (escena.jefesDerrotados || 0) * H.POR_JEFE },
    { nombre: 'Amanecer', cantidad: victoria ? H.BONUS_AMANECER : 0 }
  ];
  // Árbol de habilidades (Moneda en el suelo / Coleccionista): un % más de lo ganado (src/arbol.js)
  const extraArbol = bonusArbol(escena, 'HUESITOS');
  if (extraArbol > 0) {
    const ganado = lineas.reduce((t, l) => t + l.cantidad, 0);
    lineas.push({ nombre: 'Árbol', cantidad: Math.floor(ganado * extraArbol) });
  }
  if (escena.huesitosApuestas) lineas.push({ nombre: 'Apuestas', cantidad: escena.huesitosApuestas });
  const suma = lineas.reduce((t, l) => t + l.cantidad, 0);
  return { lineas, total: Math.max(0, suma) };
}

// Huesitos de la partida que se pueden apostar ahora mismo
function huesitosDePartida(escena) {
  return desgloseHuesitos(escena, false).total;
}

// Al terminar la partida: suma los huesitos de la partida al total guardado (solo una vez)
function cobrarHuesitos(escena, victoria) {
  const desglose = desgloseHuesitos(escena, victoria);
  if (!escena.huesitosCobrados) {
    escena.huesitosCobrados = true;
    sumarHuesitos(desglose.total);
  }
  return desglose;
}

// Texto corto del desglose: "Minutos +9 · Nivel +4 · Apuestas −10"
function textoDesgloseHuesitos(desglose) {
  const partes = desglose.lineas
    .filter((l) => l.cantidad !== 0)
    .map((l) => l.nombre + ' ' + (l.cantidad > 0 ? '+' : '−') + Math.abs(l.cantidad));
  return partes.length ? partes.join(' · ') : 'nada esta vez';
}

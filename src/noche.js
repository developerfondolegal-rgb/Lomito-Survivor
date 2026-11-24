// ===============================================================
//  LA NOCHE: reloj, fases y oscuridad
//  Los números están en src/config.js (sección NOCHE).
//  El reloj va de HORA_INICIO (22:00) a HORA_FIN (06:00) en
//  DURACION_MINUTOS minutos de juego.
// ===============================================================

// Cuánto dura la noche en milisegundos
function duracionNocheMs() {
  return CONFIG.NOCHE.DURACION_MINUTOS * 60 * 1000;
}

// Cuántas horas de reloj tiene la noche (de 22 a 6 = 8 horas)
function horasDeLaNoche() {
  const N = CONFIG.NOCHE;
  return ((N.HORA_FIN - N.HORA_INICIO + 24) % 24) || 24;
}

// Qué parte de la noche ya pasó: 0 = recién empieza, 1 = amaneció
function progresoNoche(ms) {
  return Phaser.Math.Clamp(ms / duracionNocheMs(), 0, 1);
}

// La hora que marca el reloj, por ejemplo "23:45"
function horaDeLaNoche(ms) {
  const minutosReloj = Math.floor(progresoNoche(ms) * horasDeLaNoche() * 60);
  const total = CONFIG.NOCHE.HORA_INICIO * 60 + minutosReloj;
  const hora = Math.floor(total / 60) % 24;
  const minuto = total % 60;
  return String(hora).padStart(2, '0') + ':' + String(minuto).padStart(2, '0');
}

// En qué parte de la noche cae una hora del reloj (22 = 0, 2 = 0.5 ...)
function progresoDeHora(hora) {
  return ((hora - CONFIG.NOCHE.HORA_INICIO + 24) % 24) / horasDeLaNoche();
}

// Número de la fase en la que vamos (0 = la primera de la lista)
function faseDeLaNoche(ms) {
  const progreso = progresoNoche(ms);
  let indice = 0;
  CONFIG.NOCHE.FASES.forEach((fase, i) => {
    if (progreso >= progresoDeHora(fase.HORA)) indice = i;
  });
  return indice;
}

// Datos de la fase (si no hay fases en config.js, todo normal)
function datosFase(indice) {
  return CONFIG.NOCHE.FASES[indice] || { NOMBRE: '', APARICION: 1, VIDA: 1, VELOCIDAD: 1 };
}

// Qué tan oscura está la plaza: baja poco a poco al acercarse el amanecer
function oscuridadDeLaNoche(ms) {
  const N = CONFIG.NOCHE;
  const inicial = CONFIG.OSCURIDAD;
  const final = Math.min(inicial, N.OSCURIDAD_AL_FINAL);
  const progreso = progresoNoche(ms);
  if (progreso <= N.ACLARA_DESDE) return inicial;
  const t = (progreso - N.ACLARA_DESDE) / Math.max(0.001, 1 - N.ACLARA_DESDE);
  return inicial + (final - inicial) * t;
}

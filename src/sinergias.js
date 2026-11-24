// ===============================================================
//  SINERGIAS: combinaciones que dan un bonus extra cuando tienes
//  las dos cosas juntas (un instinto y un objeto, o dos de cualquiera).
//  Se activan solas: no hay carta que elegir.
//  Los números (cuánto bonus da cada una) están en src/config.js,
//  en la sección "SINERGIAS".
//
//  Para agregar una sinergia nueva:
//   1. Copia un bloque de SINERGIAS (aquí abajo) y cambia "id" por un
//      nombre nuevo sin espacios ni tildes (por ejemplo: 'guardian').
//   2. En "requiere" pon lo que hace falta. Cada cosa es
//      { instinto: 'id' } (ids de src/instintos.js) o
//      { objeto: 'id' } (ids de src/objetos.js). Pueden ser 2 o más.
//   3. En src/config.js, dentro de SINERGIAS, copia un bloque con ese
//      mismo id y elige el bonus. Los bonus que ya funcionan son:
//        VELOCIDAD     (0.1 = 10% más rápido)
//        DANO          (0.1 = 10% más daño de mordida)
//        REGENERACION  (0.2 = te curas 20% más rápido con el tiempo)
//      Si usas otro nombre de bonus, hay que programarlo en
//      src/scenes/GameScene.js (busca "bonusSinergias").
// ===============================================================
const SINERGIAS = [
  { id: 'callejero', nombre: 'Callejero veterano',
    requiere: [{ instinto: 'pellejoDuro' }, { objeto: 'caracu' }],
    frase: 'Años en la calle: te curas más rápido.' },
  { id: 'cazador',   nombre: 'Cazador',
    requiere: [{ instinto: 'colmillos' }, { instinto: 'olfato' }],
    frase: 'Hueles a la presa y la muerdes más fuerte.' },
  { id: 'veloz',     nombre: 'Veloz',
    requiere: [{ instinto: 'patasLigeras' }, { objeto: 'pelota' }],
    frase: 'Persiguiendo la pelota corres aún más.' }
];

// Qué significa cada bonus (para los textos del menú de pausa)
const NOMBRES_BONUS_SINERGIA = {
  VELOCIDAD: 'de velocidad',
  DANO: 'de daño de mordida',
  REGENERACION: 'de regeneración'
};

// ===============================================================
//  De aquí para abajo está el código. No hace falta tocarlo para
//  agregar sinergias con los bonus que ya existen.
// ===============================================================

// Nivel que tiene el perro de una cosa pedida por la sinergia
function nivelRequisito(escena, req) {
  if (req.instinto) return escena.instintos[req.instinto] || 0;
  if (req.objeto) return escena.nivelObjeto(req.objeto);
  return 0;
}

// Nombre de una cosa pedida por la sinergia
function nombreRequisito(req) {
  if (req.instinto) return (INSTINTOS.find((i) => i.id === req.instinto) || { nombre: req.instinto }).nombre;
  if (req.objeto) return buscarObjeto(req.objeto).nombre;
  return '?';
}

// true si el perro tiene todo lo que pide la sinergia
function sinergiaActiva(escena, sinergia) {
  const minimo = CONFIG.SINERGIA_NIVEL_MINIMO || 1;
  return sinergia.requiere.every((req) => nivelRequisito(escena, req) >= minimo);
}

// Los números de una sinergia (de src/config.js)
function numerosSinergia(sinergia) {
  return (CONFIG.SINERGIAS && CONFIG.SINERGIAS[sinergia.id]) || {};
}

// Suma de un bonus (por ejemplo 'VELOCIDAD') de todas las sinergias activas
function bonusSinergias(escena, bonus) {
  return SINERGIAS.reduce((suma, s) => {
    if (!sinergiaActiva(escena, s)) return suma;
    return suma + (numerosSinergia(s)[bonus] || 0);
  }, 0);
}

// Texto del bonus, por ejemplo "+20% de regeneración"
function textoBonusSinergia(sinergia) {
  const numeros = numerosSinergia(sinergia);
  return Object.keys(numeros).map((clave) =>
    '+' + Math.round(numeros[clave] * 100) + '% ' + (NOMBRES_BONUS_SINERGIA[clave] || clave.toLowerCase())
  ).join(', ');
}

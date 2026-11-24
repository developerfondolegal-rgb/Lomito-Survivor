// ===============================================================
//  NOMBRES DE LOS ENEMIGOS
//  Los números de cada enemigo están en src/config.js (sección ENEMIGOS).
//
//  Para agregar un enemigo nuevo:
//   1. Copia un bloque de aquí y cambia "id" por un nombre nuevo
//      sin espacios ni tildes (por ejemplo: 'gato').
//   2. En src/config.js, dentro de ENEMIGOS, copia el bloque de otro
//      enemigo con ese mismo id y cambia sus números, forma y color.
//   3. En COMPORTAMIENTO puedes reutilizar uno de los existentes:
//      'perseguir', 'zigzag', 'embestida' o 'atrapar'.
//  El orden de esta lista es el orden en que salen en el Game Over.
// ===============================================================
const ENEMIGOS = [
  { id: 'rival',      nombre: 'Perro rival', descripcion: 'Círculo rojo. Te persigue.' },
  { id: 'manada',     nombre: 'Manada',      descripcion: 'Círculos rojos chicos. Llegan en grupo, rápidos y débiles.' },
  { id: 'borracho',   nombre: 'Borracho',    descripcion: 'Rectángulo naranjo. Lento, zigzaguea, aguanta mucho y pega fuerte.' },
  { id: 'drogadicto', nombre: 'Drogadicto',  descripcion: 'Triángulo verde. Se detiene, avisa con una línea y embiste.' },
  { id: 'perrera',    nombre: 'Perrera',     descripcion: 'Cuadrado azul. No hace daño, pero te deja atrapado un momento.' }
];

// ===============================================================
//  NOMBRES DE LOS ENEMIGOS
//  Los números de cada enemigo están en src/config.js (sección ENEMIGOS).
//
//  Para agregar un enemigo nuevo:
//   1. Copia un bloque de aquí y cambia "id" por un nombre nuevo
//      sin espacios ni tildes (por ejemplo: 'gato').
//   2. En src/config.js, dentro de ENEMIGOS, copia el bloque de otro
//      enemigo con ese mismo id y cambia sus números.
//   3. (Opcional) En src/sprites.js agrega su dibujo con ese mismo id.
//      Si no tiene dibujo, se ve como un perro rival de su COLOR.
//   4. En COMPORTAMIENTO puedes reutilizar uno de los existentes:
//      'perseguir', 'zigzag', 'embestida' o 'atrapar'.
//  El orden de esta lista es el orden en que salen en el Game Over.
// ===============================================================
const ENEMIGOS = [
  { id: 'rival',      nombre: 'Perro rival', descripcion: 'Perro rojizo. Te persigue.' },
  { id: 'manada',     nombre: 'Manada',      descripcion: 'Perritos rojizos chicos. Llegan en grupo, rápidos y débiles.' },
  { id: 'borracho',   nombre: 'Borracho',    descripcion: 'Persona con botella. Lento, zigzaguea, aguanta mucho y pega fuerte.' },
  { id: 'drogadicto', nombre: 'Drogadicto',  descripcion: 'Persona encorvada verde pálido. Se detiene, avisa con una línea y embiste.' },
  { id: 'perrera',    nombre: 'Perrera',     descripcion: 'Persona de uniforme azul con lazo. No hace daño, pero te deja atrapado un momento.' },
  // Propios de cada mapa (v0.19; en qué mapa salen: MAPAS en src/config.js)
  { id: 'paloma',     nombre: 'Palomas',     descripcion: 'Bandada de palomas de la plaza. Revolotean en zigzag y picotean.' },
  { id: 'auxiliar',   nombre: 'Auxiliar de micro', descripcion: 'Chaleco amarillo y jockey. Grita "¡suba, suba!" y embiste lejos y fuerte.' },
  { id: 'bravo',      nombre: 'Quiltro bravo', descripcion: 'Perro café oscuro con collar de púas. Más grande, rápido y fuerte que el rival.' },
  // Con dibujo nuevo (v0.29)
  { id: 'monaEnemiga', nombre: 'Perrita del moño', descripcion: 'Perrita chica y rápida. Se frena, abre la boca y se lanza un tramo corto.' },
  // v0.30
  { id: 'limpiavidrios', nombre: 'Limpiavidrios', descripcion: 'Con balde y escobilla. De lejos tira agua jabonosa que te deja lento; de cerca, escobillazo.' },
  { id: 'perroJabon', nombre: 'Perro del limpiavidrios', descripcion: 'Perro crema que acompaña al limpiavidrios. Si el agua te moja, te embiste. Sin su dueño se enoja.' },
  // v0.31
  { id: 'malandra', nombre: 'El Malandra', descripcion: 'Peligroso. Se acerca, le brilla el filo y corta en arco. Aléjate o hazte a un lado.' },
  { id: 'perroMalandra', nombre: 'Perro del Malandra', descripcion: 'Perro agresivo del Malandra. Embiste cuando su dueño corta. Sin su dueño se enoja.' },
  // v0.32
  { id: 'personalPerrera', nombre: 'Personal de la Perrera', descripcion: 'Lanza una red que te deja inmóvil y con el silbato llama perros de manada.' }
];

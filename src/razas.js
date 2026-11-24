// ===============================================================
//  TEXTOS DE LAS RAZAS (lo que se lee en las cartas de inicio)
//  Los números de cada raza están en src/config.js (sección RAZAS).
//
//  Para agregar una raza nueva:
//   1. Copia un bloque de aquí y cambia "id" por un nombre nuevo
//      sin espacios ni tildes (por ejemplo: 'chihuahua').
//   2. En src/config.js, dentro de RAZAS, copia el bloque de otra
//      raza con ese mismo id y cambia sus números.
//   3. En PODER puedes reutilizar uno de los poderes existentes
//      ('calle', 'mandibula', 'sprint', 'rastreo') o dejar ''.
//  El orden de esta lista es el orden de las cartas (teclas 1, 2, 3...).
// ===============================================================
const RAZAS = [
  {
    id: 'quiltro',
    nombre: 'Quiltro',
    frase: 'Mestizo de la calle: se adapta a todo.',
    fortalezas: 'Equilibrado y resistente (vigor de mestizo).',
    debilidades: 'No destaca en nada en particular.',
    poder: 'Calle',
    poderTexto: 'Los enemigos siempre sueltan hueso y te curas un poco con el tiempo.'
  },
  {
    id: 'pitbull',
    nombre: 'Pitbull',
    frase: 'Musculoso, con una mandíbula muy potente.',
    fortalezas: 'Mucha vida y mordida fuerte.',
    debilidades: 'Lento y muerde un poco menos seguido.',
    poder: 'Mandíbula de hierro',
    poderTexto: 'Cuando está cargada, la mordida aturde al enemigo y hace daño extra.'
  },
  {
    id: 'galgo',
    nombre: 'Galgo',
    frase: 'Nacido para correr: el más rápido de todos.',
    fortalezas: 'Velocidad altísima y cuerpo pequeño.',
    debilidades: 'Poca vida y mordida algo débil.',
    poder: 'Sprint [Espacio]',
    poderTexto: 'Carrera corta muy rápida hacia donde te mueves, sin recibir daño.'
  },
  {
    id: 'beagle',
    nombre: 'Beagle',
    frase: 'Sabueso pequeño con una nariz de campeón.',
    fortalezas: 'Olfato enorme: atrae huesos desde lejos.',
    debilidades: 'Pequeño y de mordida débil.',
    poder: 'Rastreo',
    poderTexto: 'Imán de huesos gigante y flechas que señalan a los enemigos fuera de la pantalla.'
  }
];

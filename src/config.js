// ===============================================================
//  AJUSTES DEL JUEGO
//  Cambia estos números para hacer el juego más fácil o difícil.
//  Guarda el archivo y recarga el navegador (F5) para ver el cambio.
//  (ms = milisegundos; 1000 ms = 1 segundo)
// ===============================================================
const CONFIG = {
  // Tamaño del mapa (en píxeles)
  MAPA_ANCHO: 3000,
  MAPA_ALTO: 3000,

  // --- El perro (jugador) ---
  PERRO_VIDA_MAX: 100,          // vida con la que empieza
  PERRO_VELOCIDAD: 220,         // qué tan rápido se mueve
  PERRO_RADIO: 20,              // tamaño del círculo café
  PERRO_INVULNERABLE_MS: 500,   // tiempo sin recibir daño después de un golpe

  // --- Ataque automático "Mordida" ---
  MORDIDA_DANO: 10,             // daño que hace cada mordida
  MORDIDA_ALCANCE: 90,          // qué tan cerca debe estar el enemigo para morderlo
  MORDIDA_CADA_MS: 1000,        // cada cuánto muerde (1000 = 1 vez por segundo)

  // --- Enemigos (perros rivales) ---
  ENEMIGO_VIDA: 20,             // vida de cada enemigo (20 = 2 mordidas)
  ENEMIGO_VELOCIDAD: 110,       // qué tan rápido persiguen
  ENEMIGO_RADIO: 16,            // tamaño del círculo rojo
  ENEMIGO_DANO: 5,              // vida que te quitan al tocarte
  ENEMIGOS_MAXIMOS: 150,        // límite de enemigos a la vez (para que no se ponga lento)

  // --- Aparición de enemigos ---
  APARICION_INICIAL_MS: 2000,   // al empezar, aparece 1 enemigo cada 2 segundos
  APARICION_MINIMA_MS: 300,     // lo más rápido que pueden llegar a aparecer
  APARICION_ACELERA_MS: 15      // cada segundo sobrevivido, aparecen esta cantidad de ms antes
};

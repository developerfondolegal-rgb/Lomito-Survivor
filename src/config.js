// ===============================================================
//  AJUSTES DEL JUEGO
//  Cambia estos números para hacer el juego más fácil o difícil.
//  Guarda el archivo y recarga el navegador (F5) para ver el cambio.
//  (ms = milisegundos; 1000 ms = 1 segundo)
//  Cuidado: no borres las comas ni los dos puntos.
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
  APARICION_ACELERA_MS: 15,     // cada segundo sobrevivido, aparecen esta cantidad de ms antes

  // --- Huesos (experiencia) ---
  HUESO_XP: 1,                  // experiencia que da cada hueso
  HUESO_TAMANO: 8,              // tamaño del cuadradito amarillo
  IMAN_RADIO: 70,               // desde qué distancia los huesos vuelan hacia el perro
  IMAN_VELOCIDAD: 400,          // qué tan rápido vuelan los huesos hacia el perro

  // --- Niveles ---
  XP_NIVEL_INICIAL: 4,          // huesos que pide el primer nivel
  XP_NIVEL_AUMENTO: 3,          // cuántos huesos más pide cada nivel que el anterior

  // --- Instintos (mejoras al subir de nivel) ---
  INSTINTO_NIVEL_MAX: 5,        // nivel máximo de cada instinto

  // "Mordida rápida": cada nivel muerde esta cantidad de ms antes
  MORDIDA_RAPIDA_MS: 120,       // (1000 → 880 → 760 → 640 → 520 → 400)

  // "Colmillos": daño extra por mordida en cada nivel
  COLMILLOS_DANO: 5,

  // "Patas ligeras": velocidad extra en cada nivel
  PATAS_VELOCIDAD: 25,

  // "Pellejo duro": vida máxima extra y curación en cada nivel
  PELLEJO_VIDA: 20,
  PELLEJO_CURA: 20,

  // "Olfato": alcance extra del imán de huesos en cada nivel
  OLFATO_IMAN: 40,

  // "Ladrido": ataque en círculo alrededor del perro que daña y empuja
  LADRIDO_CADA_MS: 4000,        // cada cuánto ladra en el nivel 1
  LADRIDO_CADA_MENOS_MS: 400,   // cada nivel ladra esta cantidad de ms antes
  LADRIDO_RADIO: 120,           // tamaño del círculo en el nivel 1
  LADRIDO_RADIO_EXTRA: 20,      // círculo más grande en cada nivel
  LADRIDO_DANO: 8,              // daño en el nivel 1
  LADRIDO_DANO_EXTRA: 4,        // daño extra en cada nivel
  LADRIDO_EMPUJE: 350,          // qué tan fuerte empuja a los enemigos
  LADRIDO_EMPUJE_MS: 250        // cuánto dura el empujón
};

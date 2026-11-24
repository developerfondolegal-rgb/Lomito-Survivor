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

  // ---------------------------------------------------------------
  //  RAZAS
  //  Los números base de cada perro. Los textos de las cartas están
  //  en src/razas.js
  //
  //  COLOR: color del círculo (formato 0xRRGGBB)
  //  VIDA: vida con la que empieza
  //  VELOCIDAD: qué tan rápido se mueve
  //  MORDIDA_DANO: daño de cada mordida
  //  MORDIDA_CADA_MS: cada cuánto muerde (1000 = 1 vez por segundo)
  //  RADIO: tamaño del círculo (más chico = más fácil esquivar)
  //  HUESO_PROBABILIDAD: probabilidad de que un enemigo suelte hueso
  //                      (1 = siempre, 0.75 = 3 de cada 4 veces)
  //  IMAN_EXTRA: alcance extra del imán de huesos
  //  PODER: qué poder especial usa ('calle', 'mandibula', 'sprint',
  //         'rastreo' o '' para ninguno)
  //  PODER_ESPERA_MS: tiempo de espera del poder (0 = poder pasivo)
  // ---------------------------------------------------------------
  RAZAS: {
    // Quiltro (mestizo): equilibrado y resistente
    quiltro: {
      COLOR: 0x8b5a2b,          // café
      VIDA: 110,
      VELOCIDAD: 220,
      MORDIDA_DANO: 10,
      MORDIDA_CADA_MS: 1000,
      RADIO: 20,
      HUESO_PROBABILIDAD: 1,    // poder "Calle": los enemigos siempre sueltan hueso
      IMAN_EXTRA: 0,
      PODER: 'calle',
      PODER_ESPERA_MS: 0,
      CALLE_CURA: 1,            // poder "Calle": vida que recupera...
      CALLE_CURA_CADA_MS: 2000  // ...cada este tiempo
    },

    // Pitbull: lento, mucha vida y mordida fuerte
    pitbull: {
      COLOR: 0x6b7f99,          // gris azulado
      VIDA: 160,
      VELOCIDAD: 175,
      MORDIDA_DANO: 16,
      MORDIDA_CADA_MS: 1150,
      RADIO: 23,
      HUESO_PROBABILIDAD: 0.75,
      IMAN_EXTRA: 0,
      PODER: 'mandibula',
      PODER_ESPERA_MS: 6000,    // "Mandíbula de hierro" se carga cada 6 segundos
      MANDIBULA_DANO_EXTRA: 20, // daño extra de esa mordida
      MANDIBULA_ATURDIR_MS: 1500 // cuánto tiempo queda quieto el enemigo
    },

    // Galgo: muy rápido y frágil
    galgo: {
      COLOR: 0xe8d5b0,          // beige claro
      VIDA: 70,
      VELOCIDAD: 290,
      MORDIDA_DANO: 9,
      MORDIDA_CADA_MS: 1000,
      RADIO: 16,
      HUESO_PROBABILIDAD: 0.75,
      IMAN_EXTRA: 0,
      PODER: 'sprint',
      PODER_ESPERA_MS: 4000,    // "Sprint" (tecla Espacio) se recarga en 4 segundos
      SPRINT_VELOCIDAD: 800,    // velocidad durante el sprint
      SPRINT_DURACION_MS: 300   // cuánto dura el sprint
    },

    // Beagle: mordida débil pero gran olfato
    beagle: {
      COLOR: 0xf5f5f0,          // blanco...
      COLOR_MANCHA: 0x8b5a2b,   // ...con manchas café...
      COLOR_MANCHA_2: 0x222222, // ...y negras (tricolor)
      VIDA: 90,
      VELOCIDAD: 225,
      MORDIDA_DANO: 7,
      MORDIDA_CADA_MS: 900,
      RADIO: 17,
      HUESO_PROBABILIDAD: 0.75,
      IMAN_EXTRA: 130,          // poder "Rastreo": imán de huesos mucho más grande
      PODER: 'rastreo',
      PODER_ESPERA_MS: 0,
      RASTREO_FLECHAS_MAX: 15   // máximo de flechas a enemigos fuera de pantalla
    }
  },

  // --- Cosas que comparten todas las razas ---
  PERRO_INVULNERABLE_MS: 500,   // tiempo sin recibir daño después de un golpe
  MORDIDA_ALCANCE: 90,          // qué tan cerca debe estar el enemigo para morderlo

  // ---------------------------------------------------------------
  //  ENEMIGOS
  //  Los números de cada tipo de enemigo. Sus nombres están en
  //  src/enemigos.js
  //
  //  FORMA: 'circulo', 'rectangulo', 'triangulo' o 'cuadrado'
  //  COLOR: color de relleno (formato 0xRRGGBB)
  //  BORDE: color del borde (opcional)
  //  RADIO: tamaño del enemigo (para choques y mordidas)
  //  ANCHO / ALTO: solo para 'rectangulo'
  //  VIDA: vida del enemigo
  //  VELOCIDAD: qué tan rápido se mueve
  //  DANO: vida que te quita al tocarte (0 = no hace daño)
  //  HUESOS: cuántos huesos suelta al morir (más duro = más huesos)
  //  DESDE_SEGUNDOS: desde qué segundo de la partida empieza a aparecer
  //                  (45 = 0:45, 90 = 1:30, 150 = 2:30, 210 = 3:30)
  //  PESO: qué tan seguido aparece comparado con los demás
  //        (10 = muy seguido, 1 = poco)
  //  MAXIMO: máximo de este enemigo a la vez (opcional)
  //  COMPORTAMIENTO: cómo se mueve: 'perseguir', 'zigzag',
  //                  'embestida' o 'atrapar'
  // ---------------------------------------------------------------
  ENEMIGOS: {
    // Perro rival: el enemigo básico
    rival: {
      FORMA: 'circulo',
      COLOR: 0xd63c3c,          // rojo
      RADIO: 16,
      VIDA: 20,
      VELOCIDAD: 110,
      DANO: 5,
      HUESOS: 1,
      DESDE_SEGUNDOS: 0,
      PESO: 10,
      COMPORTAMIENTO: 'perseguir'
    },

    // Manada: grupos de perros chicos, rápidos y débiles
    manada: {
      FORMA: 'circulo',
      COLOR: 0xff6e6e,          // rojo claro
      RADIO: 10,
      VIDA: 8,
      VELOCIDAD: 165,
      DANO: 3,
      HUESOS: 1,
      DESDE_SEGUNDOS: 45,
      PESO: 1.5,                // la mitad de seguido que el borracho o el drogadicto
      COMPORTAMIENTO: 'perseguir',
      GRUPO_MIN: 3,             // llegan de a 3...
      GRUPO_MAX: 4              // ...hasta 4 juntos
    },

    // Borracho: lento, zigzaguea, mucha vida y golpe fuerte
    borracho: {
      FORMA: 'rectangulo',
      COLOR: 0xff9800,          // naranjo
      ANCHO: 36,
      ALTO: 26,
      RADIO: 15,
      VIDA: 70,
      VELOCIDAD: 65,
      DANO: 15,
      HUESOS: 3,
      DESDE_SEGUNDOS: 90,
      PESO: 3,
      COMPORTAMIENTO: 'zigzag',
      ZIGZAG_GRADOS: 55,        // cuánto se desvía hacia los lados
      ZIGZAG_CADA_MS: 1400      // cuánto demora en ir de un lado al otro y volver
    },

    // Drogadicto: se queda quieto, avisa y embiste rápido
    drogadicto: {
      FORMA: 'triangulo',
      COLOR: 0x66bb6a,          // verde
      RADIO: 16,
      VIDA: 35,
      VELOCIDAD: 80,            // velocidad cuando se acerca caminando
      DANO: 10,
      HUESOS: 3,
      DESDE_SEGUNDOS: 150,
      PESO: 3,
      COMPORTAMIENTO: 'embestida',
      DISTANCIA_EMBESTIDA: 280, // a esta distancia del perro se detiene para embestir
      AVISO_MS: 700,            // tiempo quieto avisando (línea y parpadeo)
      EMBESTIDA_VELOCIDAD: 520, // velocidad de la embestida
      EMBESTIDA_MS: 550,        // cuánto dura la embestida
      DESCANSO_MS: 900          // tiempo quieto después de embestir
    },

    // Perrera: no hace daño, pero te atrapa
    perrera: {
      FORMA: 'cuadrado',
      COLOR: 0x1e63c8,          // azul
      BORDE: 0xffffff,          // con borde blanco
      RADIO: 17,
      VIDA: 90,
      VELOCIDAD: 95,
      DANO: 0,
      HUESOS: 5,
      DESDE_SEGUNDOS: 210,
      PESO: 1,
      MAXIMO: 2,
      COMPORTAMIENTO: 'atrapar',
      ATRAPA_MS: 1500,          // cuánto tiempo te deja quieto
      RECARGA_MS: 4000          // después de atraparte, cuánto espera para poder atraparte de nuevo
    }
  },

  // --- Aparición de enemigos ---
  ENEMIGOS_MAXIMOS: 150,        // límite de enemigos a la vez (para que no se ponga lento)
  APARICION_INICIAL_MS: 2000,   // al empezar, aparece 1 enemigo (o 1 manada) cada 2 segundos
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
  MORDIDA_RAPIDA_MS: 120,

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

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
  //  PLAZA (el mapa). El dibujo y la ubicación están en src/mapa.js
  // ---------------------------------------------------------------
  MAPA_SEMILLA: 'lomito',       // cambia este texto para que las cosas salgan en otros lugares
  CALLE_ANCHO: 160,             // ancho de la calle con autos en los 4 bordes
  PASILLO_ANCHO: 400,           // ancho de los caminos de baldosas en cruz
  PILETA_RADIO: 108,            // tamaño de la pileta del centro
  SENDEROS_POR_PRADO: 1,        // senderos de tierra en cada uno de los 4 prados

  // Cuántas cosas hay (si no caben todas, se ponen las que quepan)
  ARBOLES: 40,
  BANCAS: 16,
  BASUREROS: 8,                 // van al lado de las bancas
  FAROLES: 16,                  // 4 alrededor de la pileta y el resto en los caminos
  AUTOS: 14,

  // Luz y oscuridad
  OSCURIDAD: 0.7,               // qué tan oscura es la noche (0 = de día, 1 = negro total)
  LUZ_FAROL_RADIO: 220,         // tamaño del círculo de luz de cada farol
  LUZ_PERRO_RADIO: 150,         // pequeña luz alrededor del perro para no perderlo de vista

  // Comida (cura un poco de vida; solo se come si te falta vida)
  COMIDA_CURA: 15,              // vida que recupera cada comida
  COMIDA_CADA_MS: 12000,        // cada cuánto aparece comida en algún lugar cerca del perro
  COMIDA_DISTANCIA: 550,        // qué tan lejos del perro puede aparecer
  COMIDA_MAXIMA: 8,             // máximo de comida en el suelo a la vez
  BASURERO_COMIDA_CADA_MS: 6000, // cada cuánto aparece comida junto al basurero más cercano
  BASURERO_DISTANCIA: 700,      // el basurero tiene que estar a esta distancia del perro o menos

  // Agua de la pileta (cura si el perro está pegado a ella)
  AGUA_CURA: 1,                 // vida que recupera...
  AGUA_CURA_CADA_MS: 500,       // ...cada este tiempo
  AGUA_DISTANCIA: 15,           // qué tan pegado a la pileta tiene que estar

  // Enemigos rodeando obstáculos
  RODEO_MS: 600,                // al chocar un obstáculo, cuánto rato caminan de lado para rodearlo

  // ---------------------------------------------------------------
  //  RAZAS
  //  Los números base de cada perro. Los textos de las cartas están
  //  en src/razas.js
  //
  //  COLOR: no cambia el dibujo (los dibujos están en src/sprites.js).
  //         Solo se usa para pintar una raza nueva que no tenga dibujo
  //         (formato 0xRRGGBB)
  //  VIDA: vida con la que empieza
  //  VELOCIDAD: qué tan rápido se mueve
  //  MORDIDA_DANO: daño de cada mordida
  //  MORDIDA_CADA_MS: cada cuánto muerde (1000 = 1 vez por segundo)
  //  RADIO: tamaño de la zona de choque (más chico = más fácil esquivar)
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
      COLOR: 0xf5f5f0,          // blanco
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
  //  COLOR: no cambia el dibujo (los dibujos están en src/sprites.js).
  //         Solo se usa para pintar un enemigo nuevo que no tenga
  //         dibujo (formato 0xRRGGBB)
  //  RADIO: tamaño de la zona de choque (y para las mordidas)
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
      COLOR: 0xff9800,          // naranjo
      RADIO: 18,                // zona de choque del tamaño del dibujo (era 15)
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
      COLOR: 0x66bb6a,          // verde
      RADIO: 18,                // zona de choque del tamaño del dibujo (era 16)
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
      COLOR: 0x1e63c8,          // azul
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
  LADRIDO_EMPUJE_MS: 250,       // cuánto dura el empujón

  // ---------------------------------------------------------------
  //  OBJETOS
  //  Caen a veces de los enemigos (además de los huesos). Pasa encima
  //  para recogerlos. Los nombres, frases y dibujos están en src/objetos.js
  // ---------------------------------------------------------------
  OBJETO_PROBABILIDAD: 0.03,    // probabilidad de que un enemigo suelte objeto (0.03 = 3 de cada 100)
  OBJETO_NIVEL_MAX: 3,          // nivel máximo de cada objeto
  INVENTARIO_MAX: 6,            // cuántos objetos distintos puedes llevar
  OBJETO_RECOGER: 22,           // qué tan cerca tienes que pasar para recogerlo (se suma al RADIO del perro)

  // Rarezas: PESO = qué tan seguido sale comparado con las demás
  //          (70 de 100 veces común, 22 raro, 7 épico, 1 legendario)
  //          SUBE = cuántos niveles sube el objeto ('max' = directo al máximo)
  //          CURA_TODO = true para que además cure toda la vida
  RAREZAS: {
    comun:      { PESO: 70, SUBE: 1 },
    raro:       { PESO: 22, SUBE: 2 },
    epico:      { PESO: 7,  SUBE: 'max' },
    legendario: { PESO: 1,  SUBE: 'max', CURA_TODO: true }
  },

  // Qué hace cada objeto POR CADA NIVEL (nivel 3 = 3 veces esto)
  OBJETOS: {
    collar:  { MENOS_DANO: 0.1 },             // Collar viejo: 10% menos daño recibido por nivel
    pelota:  { VELOCIDAD: 20 },               // Pelota mordida: velocidad extra por nivel
    caracu:  { CURA: 1, CADA_MS: 2500 },      // Hueso de caracú: vida que recupera por nivel, cada este tiempo
    placa:   { XP_EXTRA: 0.25 },              // Placa: 25% más experiencia por hueso por nivel
    frazada: { VIDA: 20 }                     // Frazada: vida máxima extra por nivel (y te cura lo mismo)
  },

  // ---------------------------------------------------------------
  //  FUSIONES (instinto en nivel 5 + su objeto en nivel 3)
  //  Qué combinación desbloquea cada una está en src/objetos.js
  // ---------------------------------------------------------------
  FUSIONES: {
    // Frenesí (Mordida rápida + Collar viejo)
    frenesi: {
      MORDIDA_MULTIPLICADOR: 0.5, // el tiempo entre mordidas se multiplica por esto (0.5 = el doble de rápido)
      OBJETIVOS: 2                // a cuántos enemigos muerde a la vez
    },
    // Aullido (Ladrido + Placa de identificación)
    aullido: {
      RADIO_EXTRA: 80,            // círculo del ladrido más grande
      HUIR_MS: 2000               // cuánto rato huyen los enemigos alcanzados
    },
    // Estampida (Patas ligeras + Pelota mordida)
    estampida: {
      HUELLA_CADA_MS: 90,         // cada cuánto deja una huella mientras corre
      HUELLA_DURA_MS: 1500,       // cuánto dura cada huella en el suelo
      HUELLA_RADIO: 22,           // tamaño de la zona que daña de cada huella
      DANO: 6,                    // daño que hacen las huellas...
      GOLPE_CADA_MS: 350          // ...cada este tiempo, a los enemigos que las pisan
    },
    // Cuero de calle (Pellejo duro + Frazada)
    cuero: {
      MULTIPLICADOR: 0.5,         // daño recibido mientras está activo (0.5 = la mitad)
      DURACION_MS: 3000           // cuánto dura después de cada golpe
    }
  },

  // ---------------------------------------------------------------
  //  ENEMIGO ÉLITE: versión grande de un enemigo, con borde dorado
  // ---------------------------------------------------------------
  ELITE_CADA_SEGUNDOS: 60,      // cada cuánto aparece uno (60 = cada minuto)
  ELITE_TAMANO: 1.7,            // cuánto más grande es (dibujo y choque)
  ELITE_VIDA: 10,               // su vida es la del enemigo normal por este número
  ELITE_HUESOS: 3,              // suelta los huesos del enemigo normal por este número
  ELITE_RAREZA_MINIMA: 'raro'   // siempre suelta un objeto de esta rareza o mejor
};

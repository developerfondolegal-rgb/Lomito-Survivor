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
  ELITE_RAREZA_MINIMA: 'raro',  // siempre suelta un objeto de esta rareza o mejor

  // ---------------------------------------------------------------
  //  SINERGIAS: bonus extra por tener dos cosas juntas.
  //  Qué cosas pide cada una (y sus nombres) está en src/sinergias.js
  //  Cada número es el bonus: 0.1 = 10% más, 0.2 = 20% más.
  //  Bonus que existen: VELOCIDAD, DANO (de mordida), REGENERACION
  //  (la regeneración es la curación con el tiempo: el poder Calle del
  //  Quiltro y el Hueso de caracú; la comida y la pileta no cambian)
  // ---------------------------------------------------------------
  SINERGIA_NIVEL_MINIMO: 1,     // nivel que necesita cada cosa para que cuente (1 = basta con tenerla)
  SINERGIAS: {
    // Callejero veterano (Pellejo duro + Hueso de caracú)
    callejero: { REGENERACION: 0.2 },  // te curas 20% más rápido
    // Cazador (Colmillos + Olfato)
    cazador:   { DANO: 0.1 },          // 10% más daño de mordida
    // Veloz (Patas ligeras + Pelota mordida)
    veloz:     { VELOCIDAD: 0.1 }      // 10% más rápido
  },

  // ---------------------------------------------------------------
  //  ZONAS ESPECIALES: círculos que aparecen un rato en el mapa, con
  //  borde de color y un ícono. Sus nombres, colores, íconos y qué
  //  hacen están en src/zonas.js
  //  Nunca aparecen encima de la pileta ni encima del perro.
  // ---------------------------------------------------------------
  ZONAS_PRIMERA_MS: 30000,      // a qué momento de la partida aparece la primera (30000 = 0:30)
  ZONAS_CADA_MS: 20000,         // después, cada cuánto aparece una nueva
  ZONAS_MAXIMAS: 3,             // máximo de zonas en el mapa a la vez
  ZONA_DURACION_MS: 25000,      // cuánto dura cada zona antes de desaparecer
  ZONA_PARPADEO_MS: 4000,       // los últimos 4 segundos parpadea para avisar que se va
  ZONA_DISTANCIA_MIN: 250,      // qué tan cerca del perro puede aparecer (desde el centro de la zona)...
  ZONA_DISTANCIA_MAX: 650,      // ...y qué tan lejos
  ZONA_MARGEN: 40,              // espacio libre mínimo entre el borde de la zona y la pileta o el perro

  // Cada zona:
  //  RADIO: tamaño del círculo
  //  PESO: qué tan seguido aparece comparada con las demás (1 = rara)
  ZONAS: {
    // Zona de miedo (morada): el perro no puede atacar (ni morder ni ladrar)
    miedo:   { RADIO: 140, PESO: 3 },
    // Zona peligrosa (roja): el daño que recibe el perro se multiplica por esto
    peligro: { RADIO: 150, PESO: 3, DANO_MULTIPLICADOR: 2 },
    // Barro (café): el perro y los enemigos se mueven más lento (0.4 = 40% más lento)
    barro:   { RADIO: 160, PESO: 3, LENTITUD: 0.4 },
    // Zona segura (verde, rara): no recibe daño, pero tampoco recoge huesos (no gana experiencia)
    segura:  { RADIO: 110, PESO: 1 }
  },

  // ---------------------------------------------------------------
  //  MINI DESAFÍOS: cada cierto tiempo aparece uno con un aviso arriba
  //  y una cuenta regresiva. Si lo cumples ganas una recompensa; si
  //  fallas no pasa nada. Sus nombres y frases están en src/desafios.js
  //  (no aparecen mientras el jefe está vivo ni al amanecer)
  // ---------------------------------------------------------------
  DESAFIO_PRIMERO_MS: 60000,    // a qué momento de la partida llega el primero (60000 = 1:00)
  DESAFIO_CADA_MS: 60000,       // tiempo de descanso entre que termina uno y empieza el siguiente

  // Recompensa al cumplirlo: un objeto (raro o mejor) o mucha experiencia
  DESAFIO_OBJETO_PROBABILIDAD: 0.5, // probabilidad de que sea objeto (0.5 = la mitad de las veces; si no, experiencia)
  DESAFIO_RAREZA_MINIMA: 'raro',    // el objeto es de esta rareza o mejor
  DESAFIO_XP: 40,                   // experiencia que da (40 huesos de golpe)

  // Cada desafío:
  //  PESO: qué tan seguido sale comparado con los demás
  //  TIEMPO_MS: la cuenta regresiva (tiempo para cumplirlo)
  DESAFIOS: {
    // Búsqueda: encontrar cosas perdidas repartidas en el mapa (con flechas en el borde de la pantalla)
    busqueda: {
      PESO: 1,
      TIEMPO_MS: 60000,
      OBJETOS: 3,               // cuántas cosas hay que encontrar
      DISTANCIA_MIN: 500,       // qué tan lejos del perro aparecen...
      DISTANCIA_MAX: 1100,      // ...como máximo
      RECOGER: 30               // qué tan cerca hay que pasar para recogerlas (se suma al RADIO del perro)
    },
    // Aguanta: quedarse dentro de una zona marcada mientras llegan más enemigos
    aguanta: {
      PESO: 1,
      TIEMPO_MS: 50000,         // tiempo total para lograrlo
      DENTRO_MS: 30000,         // tiempo que hay que estar dentro de la zona (se suma solo mientras estás dentro)
      RADIO: 170,               // tamaño de la zona marcada
      DISTANCIA: 320,           // a qué distancia del perro aparece la zona
      APARICION: 0.5            // mientras dura, el tiempo entre enemigos se multiplica por esto (0.5 = el doble de enemigos)
    },
    // Cacería: derrotar muchos enemigos rápido
    caceria: {
      PESO: 1,
      TIEMPO_MS: 45000,
      ENEMIGOS: 30              // cuántos hay que derrotar
    },
    // Sin morder: sobrevivir sin atacar (la mordida y el ladrido se apagan solos)
    sinMorder: {
      PESO: 1,
      TIEMPO_MS: 20000
    }
  },

  // ---------------------------------------------------------------
  //  ULTRA RAROS: la rareza más difícil (brillo arcoíris). No son
  //  objetos del inventario: son COLECCIONABLES que se guardan en el
  //  navegador para siempre y dan un bonus permanente en todas las
  //  partidas, con cualquier raza. Sus nombres, frases y dibujos están
  //  en src/coleccionables.js
  // ---------------------------------------------------------------
  ULTRA_PROBABILIDAD_ENEMIGO: 0.0005, // enemigo normal: 5 de cada 10.000 sueltan uno
  ULTRA_PROBABILIDAD_ELITE: 0.04,     // élite: 4 de cada 100
  ULTRA_PROBABILIDAD_JEFE: 0.35,      // Jefe de la Plaza: 35 de cada 100
  ULTRA_DESAFIOS: ['aguanta', 'caceria'], // estos desafíos SIEMPRE dan un ultra raro al cumplirlos
                                          // (además de su recompensa normal). Ids de DESAFIOS
  ULTRA_RECOGER: 24,                  // qué tan cerca tienes que pasar para recogerlo (se suma al RADIO del perro)

  // Copias que pide cada nivel del coleccionable (del 1 al 5):
  // 1 copia para el nivel 1, 2 más para el 2, 3 más para el 3, 5 más para el 4 y 8 más para el 5.
  // Si agregas o quitas números, cambia la cantidad de niveles.
  COLECCION_COPIAS: [1, 2, 3, 5, 8],
  COLECCION_GUARDADO: 'lomitoSurvivor_coleccion', // nombre del guardado en el navegador (no lo cambies o se "pierde" el progreso)

  // Qué da cada coleccionable POR CADA NIVEL (nivel 3 = 3 veces esto).
  // 0.1 = 10%
  COLECCIONABLES: {
    // Chalequito reflectante: los enemigos aparecen más lejos (px) y las embestidas
    // (Drogadicto y Jefe) te hacen menos daño
    chalequito: { APARECE_LEJOS: 40, MENOS_DANO_EMBESTIDA: 0.1 },
    // Sweater tejido a mano: vida máxima extra, y recupera 1 de vida cada
    // (CURA_CADA_MS / nivel): nivel 1 = cada 6 s, nivel 5 = cada 1,2 s
    sweater: { VIDA: 10, CURA_CADA_MS: 6000 },
    // Peluche de zombie: compañero que da vueltas alrededor del perro.
    //  DANO: daño por nivel al tocar a un enemigo   GOLPE_CADA_MS: cada cuánto puede golpear al mismo enemigo
    //  ORBITA_RADIO: qué tan lejos del perro gira   VUELTA_MS: cuánto demora una vuelta   RADIO: su tamaño de choque
    peluche: { DANO: 4, GOLPE_CADA_MS: 500, ORBITA_RADIO: 70, VUELTA_MS: 2200, RADIO: 14 },
    // Mantita cuadrillé: la Zona segura cura 1 de vida cada (SEGURA_CURA_CADA_MS / nivel)
    // y la pileta cura más rápido (0.2 = 20% más rápido por nivel)
    mantita: { SEGURA_CURA_CADA_MS: 1500, PILETA_RAPIDEZ: 0.2 },
    // Capa de superhéroe: más velocidad y el poder (Sprint o Mandíbula) se recarga más rápido
    capa: { VELOCIDAD: 0.03, RECARGA: 0.08 },
    // Antifaz: probabilidad de esquivar un golpe (0.03 = 3 de cada 100)
    antifaz: { ESQUIVAR: 0.03 },
    // Collar antipulgas: menos daño de estos enemigos (ids de ENEMIGOS)
    antipulgas: { MENOS_DANO: 0.08, TIPOS: ['manada', 'rival'] },
    // Lentes: más alcance de mordida y del imán de huesos (px)
    lentes: { ALCANCE: 6, IMAN: 15 },
    // Zapatilla perdida: la comida cura esta vida extra
    zapatilla: { COMIDA_CURA: 3 },
    // Pañuelo rojo: probabilidad de mordida crítica (hace el doble de daño)
    panuelo: { CRITICO: 0.04 },
    // Cascabel: más experiencia por hueso
    cascabel: { XP_EXTRA: 0.06 },
    // Gorro de lana: el barro te frena menos y la Perrera te deja atrapado menos rato
    gorro: { MENOS_LENTITUD: 0.15 }
  },

  // ---------------------------------------------------------------
  //  LA NOCHE (meta de la partida). El código está en src/noche.js
  //  Ganas si llegas a la HORA_FIN y el Jefe de la Plaza está derrotado.
  // ---------------------------------------------------------------
  NOCHE: {
    DURACION_MINUTOS: 10,       // cuánto dura la noche de verdad (10 = 10 minutos jugando)
    HORA_INICIO: 22,            // hora que marca el reloj al empezar (22 = 22:00)
    HORA_FIN: 6,                // hora del amanecer (6 = 06:00)

    // La oscuridad baja poco a poco al acercarse el amanecer
    ACLARA_DESDE: 0.5,          // desde qué parte de la noche empieza a aclarar (0.5 = desde la mitad)
    OSCURIDAD_AL_FINAL: 0.35,   // qué tan oscuro queda justo antes del amanecer (OSCURIDAD normal es 0.7)

    // Amanecer: cuando ganas, el cielo se aclara y los enemigos huyen
    AMANECER_MS: 5000,          // cuánto dura el amanecer antes de la pantalla de victoria
    AMANECER_LUZ: 0.2,          // cuánta luz anaranjada se ve al amanecer (0 = nada, 1 = todo naranjo)

    // Fases: al llegar cada HORA aparece un aviso grande y la dificultad sube.
    // (las horas se reparten solas en la duración: con 10 minutos, cada 2 horas = 2,5 minutos)
    //  APARICION: el tiempo entre enemigos se multiplica por esto (0.7 = salen más seguido)
    //  VIDA: la vida de los enemigos nuevos se multiplica por esto (1.5 = 50% más vida)
    //  VELOCIDAD: la velocidad de los enemigos nuevos se multiplica por esto
    FASES: [
      { HORA: 22, NOMBRE: 'Anochecer',      APARICION: 1,    VIDA: 1,    VELOCIDAD: 1 },
      { HORA: 0,  NOMBRE: 'Medianoche',     APARICION: 0.85, VIDA: 1.25, VELOCIDAD: 1.05 },
      { HORA: 2,  NOMBRE: 'Madrugada',      APARICION: 0.7,  VIDA: 1.5,  VELOCIDAD: 1.1 },
      { HORA: 4,  NOMBRE: 'Antes del alba', APARICION: 0.6,  VIDA: 1.8,  VELOCIDAD: 1.15 }
    ]
  },

  // ---------------------------------------------------------------
  //  JEFE FINAL: "El Jefe de la Plaza". Su dibujo y ataques están en src/jefe.js
  // ---------------------------------------------------------------
  JEFE: {
    MINUTO: 9,                  // a qué minuto de la noche aparece
    VIDA: 3000,                 // vida total (la barra grande de arriba)
    RADIO: 42,                  // tamaño de su zona de choque
    TAMANO: 2,                  // cuánto más grande se dibuja que un perro normal
    VELOCIDAD: 90,              // velocidad caminando
    DANO: 20,                   // daño al tocarte
    HUESOS: 40,                 // huesos que suelta al morir
    OBJETO_RAREZA: 'epico',     // suelta un objeto de esta rareza o mejor
    APARICION_MIENTRAS: 1.5,    // mientras está vivo, el tiempo entre enemigos normales se multiplica por esto (1.5 = salen menos)
    ATAQUE_CADA_MS: 4000,       // tiempo caminando entre un ataque y el siguiente

    // Furia: al bajar a esta parte de su vida se pone más rápido
    FURIA_EN: 0.5,              // 0.5 = a la mitad de la vida
    FURIA_VELOCIDAD: 140,       // velocidad caminando en furia
    FURIA_ATAQUE_CADA_MS: 2500, // tiempo entre ataques en furia

    // Ataque 1: embestida en línea recta (antes avisa con una franja roja)
    EMBESTIDA_AVISO_MS: 1000,   // tiempo quieto avisando antes de embestir
    EMBESTIDA_VELOCIDAD: 650,   // velocidad de la embestida
    EMBESTIDA_MS: 700,          // cuánto dura la embestida
    EMBESTIDA_DANO: 30,         // daño si te alcanza embistiendo
    EMBESTIDA_DESCANSO_MS: 900, // tiempo quieto (cansado) después de embestir

    // Ataque 2: aullido que llama a una manada (antes avisa con anillos)
    AULLIDO_AVISO_MS: 1200,     // tiempo quieto avisando antes de aullar
    AULLIDO_MANADA: 6,          // cuántos perritos de manada llegan
    FURIA_AULLIDO_MANADA: 9,    // cuántos llegan en furia
    AULLIDO_DISTANCIA: 180,     // a qué distancia del jefe aparecen

    FURIA_AVISO: 0.7            // en furia, los avisos duran esto (0.7 = 70% del tiempo normal)
  },

  // ---------------------------------------------------------------
  //  HUESITOS: la moneda del juego. Durante la partida se juntan
  //  "huesitos de la partida" (se ven arriba a la izquierda). Al terminar
  //  (muerte o amanecer) se suman al total guardado en el navegador.
  //  El código está en src/huesitos.js
  // ---------------------------------------------------------------
  HUESITOS: {
    POR_MINUTO: 3,              // huesitos por cada minuto entero sobrevivido
    POR_NIVEL: 1,               // huesitos por cada nivel subido (el nivel 1 no cuenta)
    ENEMIGOS_POR_HUESITO: 10,   // 1 huesito por cada 10 enemigos derrotados
    POR_DESAFIO: 5,             // huesitos por cada mini desafío cumplido
    POR_JEFE: 20,               // huesitos por derrotar al Jefe de la Plaza
    BONUS_AMANECER: 25,         // bonus extra si sobrevives la noche (amanece)
    PRUEBA_TECLA_H: 100,        // modo de prueba: cuántos huesitos da la tecla H en la pantalla de inicio
    GUARDADO: 'lomitoSurvivor_huesitos' // nombre del guardado en el navegador (no lo cambies o se "pierden" los huesitos)
  },

  // ---------------------------------------------------------------
  //  ÁRBOL DE HABILIDADES (src/arbol.js y src/scenes/ArbolScene.js)
  //  Mejoras permanentes por raza que se compran con huesitos guardados.
  //  Cada raza tiene 3 ramas con 4 mejoras. Para comprar una mejora hay
  //  que tener la anterior de su rama. Se aplican al EMPEZAR la partida.
  //  Los nombres y textos de cada mejora están en src/arbol.js
  //
  //  Cada mejora es una lista de números; si compras varias mejoras con
  //  el mismo número, se suman. Qué significa cada número:
  //   VIDA: vida máxima extra              VELOCIDAD: 0.05 = 5% más rápido
  //   DANO: 0.1 = 10% más daño de mordida  MORDIDA_RAPIDEZ: 0.1 = muerde 10% más seguido
  //   CRITICO: probabilidad de mordida crítica (doble daño)
  //   MENOS_DANO: 0.08 = 8% menos daño recibido
  //   ESQUIVAR: probabilidad de esquivar un golpe (0.06 = 6 de cada 100)
  //   REGENERACION: 0.25 = la curación con el tiempo es 25% más rápida
  //   IMAN: alcance extra del imán (px)    IMAN_RAPIDEZ: 0.4 = los huesos vuelan 40% más rápido
  //   XP: 0.1 = 10% más experiencia        HUESO_EXTRA: probabilidad de 1 hueso extra por enemigo
  //   HUESITOS: 0.2 = 20% más huesitos al terminar la partida
  //   OBJETO: 0.4 = los objetos caen 40% más seguido
  //   ULTRA: 1 = los ultra raros caen el doble de seguido de enemigos normales
  //   COMIDA: 0.5 = comida 50% más curativa y pileta 50% más rápida
  //   COMIDA_RAPIDEZ: 0.3 = la comida aparece 30% más seguido
  // ---------------------------------------------------------------
  ARBOL: {
    COSTOS: [50, 120, 250, 500],  // huesitos que cuesta cada nivel de la rama (1º, 2º, 3º y 4º)
    DEVOLUCION: 1,                // "Reiniciar árbol" devuelve esta parte de lo gastado (1 = el 100%)
    GUARDADO: 'lomitoSurvivor_arbol', // nombre del guardado en el navegador (no lo cambies o se "pierde" el árbol)

    // Para las ramas que dependen de los enemigos cercanos (Manada del Beagle)
    GRUPO_RADIO: 160,             // a esta distancia (px) un enemigo cuenta como "cerca"
    GRUPO_MAXIMO: 5,              // máximo de enemigos que cuentan
    // Caza (Galgo): enemigos "rápidos" = velocidad base desde este número, o embistiendo
    CAZA_VELOCIDAD_MINIMA: 110,   // rival (110) y manada (165) cuentan; borracho (65) no

    RAZAS: {
      quiltro: {
        // Calle: mejora el poder "Calle"
        calle: [
          { CALLE_RAPIDEZ: 0.3 },               // Calle cura 30% más rápido
          { HUESO_EXTRA: 0.15 },                // 15% de probabilidad de 1 hueso extra
          { CALLE_CURA: 1 },                    // Calle cura +1 de vida cada vez
          { DUENO_CADA_ENEMIGOS: 12 }           // ESPECIAL "Dueño del barrio": cada 12 enemigos derrotados cae una comida
        ],
        // Suerte: más raros, ultra raros y huesitos
        suerte: [
          { HUESITOS: 0.15 },                   // +15% huesitos al terminar
          { OBJETO: 0.4 },                      // objetos 40% más seguido
          { ULTRA: 1 },                         // ultra raros el doble de seguido (enemigos normales)
          { PATA_CONEJO: 1 }                    // ESPECIAL "Pata de conejo": los élites siempre sueltan un ultra raro
        ],
        // Supervivencia: vida, regeneración, comer y beber
        supervivencia: [
          { VIDA: 15 },
          { COMIDA: 0.5 },                      // comida cura 50% más y la pileta cura 50% más rápido
          { REGENERACION: 0.25, VIDA: 10 },
          { SIETE_VIDAS: 0.4 }                  // ESPECIAL "Siete vidas": 1 vez por partida, al morir vuelves con 40% de vida
        ]
      },
      pitbull: {
        // Mordida: daño
        mordida: [
          { DANO: 0.1 },
          { CRITICO: 0.08 },                    // 8% de mordida crítica (doble daño)
          { MORDIDA_RAPIDEZ: 0.1 },
          { SACUDIDA: 0.4, SACUDIDA_RADIO: 70 } // ESPECIAL "Sacudida": cada mordida daña también a los que están
                                                // cerca del mordido (40% del daño, a 70 px)
        ],
        // Aguante: vida y reducción de daño
        aguante: [
          { VIDA: 20 },
          { MENOS_DANO: 0.08 },
          { CURA_CADA_MS: 3000, VIDA: 10 },     // recupera 1 de vida cada 3 s
          { INAMOVIBLE: 0.5 }                   // ESPECIAL "Inamovible": la Perrera no te atrapa y las embestidas
                                                // te hacen la mitad de daño (0.5)
        ],
        // Furia: mejora "Mandíbula de hierro" y pega más con poca vida
        furia: [
          { MANDIBULA_RECARGA: 0.25 },          // la Mandíbula se carga 25% más rápido
          { MANDIBULA_DANO: 15, MANDIBULA_ATURDIR_MS: 500 },
          { FURIA_DANO: 0.3, FURIA_VIDA: 0.4 }, // +30% de daño con menos del 40% de vida
          { BERSERKER: 0.35 }                   // ESPECIAL "Berserker": con menos del 35% de vida TODAS las mordidas
                                                // son de Mandíbula de hierro
        ]
      },
      galgo: {
        // Sprint: duración y recarga
        sprint: [
          { SPRINT_DURACION_MS: 100 },          // el sprint dura 0,1 s más
          { SPRINT_RECARGA: 0.2 },              // se recarga 20% más rápido
          { SPRINT_VELOCIDAD: 150, SPRINT_RECARGA: 0.1 },
          { RAYO_DANO: 25 }                     // ESPECIAL "Rayo gris": el sprint hace 25 de daño a cada enemigo que atraviesas
        ],
        // Esquiva: velocidad y esquivar
        esquiva: [
          { VELOCIDAD: 0.05 },
          { ESQUIVAR: 0.06 },
          { ESQUIVAR: 0.06, VELOCIDAD: 0.05 },
          { REFLEJOS_MS: 800 }                  // ESPECIAL "Reflejos": al esquivar, el sprint queda listo y
                                                // quedas 0,8 s más sin recibir daño
        ],
        // Caza: daño a enemigos rápidos o embistiendo
        caza: [
          { CAZA_DANO: 0.25 },
          { CAZA_DANO: 0.25 },
          { CAZA_CRITICO: 0.15 },               // 15% de crítico contra enemigos rápidos
          { LEBREL_MULTIPLICADOR: 3, LEBREL_OBJETIVOS: 3 } // ESPECIAL "Lebrel": la primera mordida después de cada sprint
                                                           // hace el triple de daño a hasta 3 enemigos
        ]
      },
      beagle: {
        // Olfato: rango de recolección y Rastreo
        olfato: [
          { IMAN: 30 },
          { IMAN: 30, IMAN_RAPIDEZ: 0.4 },
          { COMIDA_RAPIDEZ: 0.3 },
          { NARIZ: 1 }                          // ESPECIAL "Nariz de sabueso": las flechas del Rastreo también
                                                // señalan comida (verde) y objetos (morado) fuera de la pantalla
        ],
        // Botín: más huesos, experiencia y huesitos
        botin: [
          { XP: 0.1 },
          { HUESO_EXTRA: 0.15 },
          { HUESITOS: 0.2 },
          { TESORO_CADA_MS: 75000 }             // ESPECIAL "Tesoro enterrado": cada 75 s desentierra un objeto raro o mejor
        ],
        // Manada: ayuda contra grupos de enemigos
        manada: [
          { GRUPO_DEFENSA: 0.03 },              // 3% menos daño por cada enemigo cerca (máx GRUPO_MAXIMO)
          { GRUPO_DANO: 0.04 },                 // 4% más daño por cada enemigo cerca
          { GRUPO_DEFENSA: 0.03, GRUPO_DANO: 0.04 },
          { AULLIDO_CADA_MS: 10000, AULLIDO_RADIO: 170, AULLIDO_DANO: 12, AULLIDO_HUIR_MS: 1500 }
                                                // ESPECIAL "Aullido de la manada": cada 10 s aúlla: daña,
                                                // empuja y hace huir a los enemigos cercanos
        ]
      }
    }
  },

  // ---------------------------------------------------------------
  //  RINCÓN DE APUESTAS (src/scenes/ApuestasScene.js)
  //  Aparece al cambiar de fase la noche (solo con los huesitos de la
  //  partida) y al terminar la partida (con el total guardado o con
  //  1 copia de un coleccionable).
  //  PAGO = cuánto te devuelven en total si ganas, contando lo apostado
  //  (apuestas 10 con PAGO 2: recibes 20, o sea ganas 10). Se redondea hacia abajo.
  //  Con coleccionables: si ganas te quedas tu copia y recibes
  //  (PAGO - 1) copias extra redondeado hacia abajo, mínimo 1.
  //
  //  REGLA: la casa siempre gana un poquito. Cada juego tiene valor
  //  esperado NEGATIVO para el jugador (lo que ganas en promedio por cada
  //  huesito apostado; −0,10 = pierdes 10 de cada 100 a la larga).
  //  Si cambias PAGO o probabilidades, revisa que siga siendo negativo.
  // ---------------------------------------------------------------
  APUESTAS: {
    EN_CAMBIO_DE_FASE: true,    // false = el rincón NO aparece al cambiar de fase (útil para probar)
    EN_FIN_DE_PARTIDA: true,    // false = al terminar la partida, M vuelve directo al menú
    MINIMO: 5,                  // apuesta mínima en huesitos
    MAXIMO: 200,                // apuesta máxima en huesitos (nunca más de lo que tienes)
    PASO: 5,                    // cuánto sube o baja la apuesta con las flechas izquierda/derecha

    // Número exacto: eliges del 1 al 6 y se tira 1 dado.
    //  Ganas 1 de cada 6 veces. Valor esperado = (1/6) × 5 − 1 = −0,167 (−16,7%)
    //  Coleccionable: +4 copias. VE = (1/6) × 4 − (5/6) × 1 = −0,167 copias
    EXACTO_PAGO: 5,

    // Contra la máquina: tú y la máquina tiran 2 dados; gana la suma más alta.
    //  EMPATE = gana la máquina. Empatan 146 de 1296 veces (11,3%),
    //  así que ganas 575/1296 = 44,4% de las veces.
    //  Valor esperado = 0,444 × 2 − 1 = −0,113 (−11,3%)
    //  Coleccionable: +1 copia. VE = 0,444 × 1 − 0,556 × 1 = −0,113 copias
    MAQUINA_PAGO: 2,

    // Bajo o alto: "bajo" = 1, 2 o 3; "alto" = 4, 5 o 6. Acertar es 1 de 2...
    //  ...pero "el gato salta a la mesa" GATO_PROBABILIDAD de las veces y pierdes igual.
    //  Ganas (1/2) × (11/12) = 45,8% de las veces.
    //  Valor esperado = 0,458 × 1,8 − 1 = −0,175 (−17,5%)
    //  Coleccionable: +1 copia (mínimo 1). VE = 0,458 × 1 − 0,542 × 1 = −0,083 copias
    BAJO_ALTO_PAGO: 1.8,
    GATO_PROBABILIDAD: 1 / 12,  // 1 de cada 12 tiradas el gato salta y pierdes

    DADO_MS: 900                // cuánto rato rueda el dado antes de mostrar el resultado
  },

  // ---------------------------------------------------------------
  //  MÓVIL: celulares y tablets con pantalla táctil (src/tactil.js)
  //  En PC con teclado y mouse nada de esto se activa.
  //  Los tamaños "reales" son píxeles de la pantalla del celular
  //  (no del juego, que se achica para caber).
  // ---------------------------------------------------------------
  MOVIL: {
    CONTROLES_TACTILES: 'auto', // 'auto' = solo en pantallas táctiles · true = siempre · false = nunca

    // Joystick (mitad izquierda de la pantalla: aparece donde pones el dedo)
    JOYSTICK_RADIO_REAL: 60,    // cuánto hay que mover el dedo para ir a toda velocidad
    JOYSTICK_ZONA_MUERTA: 0.15, // movimientos más chicos que esto (15% del radio) no mueven al perro
    JOYSTICK_ZONA: 0.5,         // qué parte de la pantalla (desde la izquierda) sirve para el joystick (0.5 = la mitad)

    // Botones de la derecha (Sprint y Pausa)
    BOTON_SPRINT_REAL: 84,      // tamaño del botón de Sprint en px reales (mínimo recomendado: 60)
    BOTON_PAUSA_REAL: 62,       // tamaño del botón de Pausa en px reales
    BOTONES_ALFA: 0.45,         // transparencia de los controles (0 = invisibles, 1 = sólidos)

    CARTAS_ESPERA_MS: 450,      // las cartas de nivel no se pueden tocar hasta pasado este rato (evita toques sin querer)
    MARGEN_HUD: 24,             // distancia (px del juego) entre los bordes de la pantalla y los textos/botones del HUD en celular (en PC es 12)
    TEXTO_MINIMO: 12,           // tamaño mínimo de letra en celular (px del juego). Más alto = más legible pero puede encimarse

    // Rendimiento (solo en celular)
    ENEMIGOS_MAXIMOS: 100,      // límite de enemigos a la vez en celular (en PC se usa ENEMIGOS_MAXIMOS de arriba)
    LIMITAR_EFECTOS_DESDE: 45,  // con más enemigos que esto se omiten efectos chicos (dientes, sombras del sprint)
    EFECTOS_UNO_DE_CADA: 3,     // cuando se limitan, solo se muestra 1 de cada 3 dientes de mordida
    OSCURIDAD_CADA_CUADROS: 2   // la oscuridad de la noche se redibuja cada 2 cuadros (1 = siempre, más fluido pero más pesado)
  }
};

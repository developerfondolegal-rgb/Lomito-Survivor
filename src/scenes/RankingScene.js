// Ranking online (se abre desde la pantalla de inicio con el botón "Ranking"
// o la tecla L). Muestra el top 20 general o de una raza, y tu posición.
// Los datos vienen de Supabase (src/online.js). Sin la versión online solo
// muestra "Ranking disponible en la versión online".
// (marcoPixel viene de src/pausa.js; FUENTE, de MenuScene.js; botonPantalla,
//  margenHUD y margenExtra, de src/tactil.js)
//
// Teclado: ◄ ► (o Q / E, o 1 a 5) cambiar filtro · R actualizar · Esc o L volver

class RankingScene extends Phaser.Scene {
  constructor() {
    super('RankingScene');
  }

  create() {
    this.m = margenHUD();
    this.e = margenExtra();
    // Filtros: general (null) y una pestaña por raza
    this.filtros = [{ id: null, nombre: 'General' }].concat(
      RAZAS.filter((r) => CONFIG.RAZAS[r.id]).map((r) => ({ id: r.id, nombre: r.nombre })));
    this.filtro = 0;
    this.capaPestanas = [];
    this.capaTabla = [];
    this.pedido = 0; // para ignorar respuestas viejas si cambias de filtro rápido

    const teclas = ['ESC', 'L', 'LEFT', 'RIGHT', 'Q', 'E', 'R', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];
    this.teclas = {};
    teclas.forEach((t) => { this.teclas[t] = this.input.keyboard.addKey(t); });

    const w = this.scale.width;
    const h = this.scale.height;
    this.add.text(w / 2, 26 + this.e / 2, 'Ranking', {
      fontFamily: FUENTE, fontSize: '30px', color: '#ffe082', fontStyle: 'bold'
    }).setOrigin(0.5);

    const tecla = (t) => (modoTactil() ? '' : ' (' + t + ')');
    const yb = h - 26 - this.e / 2;
    botonPantalla(this, w / 2 - 120, yb, 210, 34, 'Volver' + tecla('Esc'), 0xffd54f, () => this.scene.start('MenuScene'));
    if (onlineDisponible()) {
      botonPantalla(this, w / 2 + 120, yb, 210, 34, 'Actualizar' + tecla('R'), 0x4fc3f7, () => this.cargar());
    }

    if (!onlineDisponible()) {
      this.add.text(w / 2, h / 2 - 20, TEXTO_SOLO_ONLINE, {
        fontFamily: FUENTE, fontSize: '24px', color: '#cfd8dc', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(w / 2, h / 2 + 18, 'Ábrelo desde la página del juego en internet (GitHub Pages).', {
        fontFamily: FUENTE, fontSize: '16px', color: '#9e9e9e'
      }).setOrigin(0.5);
      return;
    }

    this.dibujarPestanas();
    this.cargar();
    // Si la sesión termina de cargar después de abrir esta pantalla, vuelve a pedir (para tu posición)
    const desuscribir = alCambiarOnline(() => this.cargar());
    this.events.once('shutdown', desuscribir);
  }

  update() {
    const t = (nombre) => Phaser.Input.Keyboard.JustDown(this.teclas[nombre]);
    if (t('ESC') || t('L')) { this.scene.start('MenuScene'); return; }
    if (!onlineDisponible()) return;
    if (t('LEFT') || t('Q')) this.cambiarFiltro(this.filtro - 1);
    if (t('RIGHT') || t('E')) this.cambiarFiltro(this.filtro + 1);
    ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'].forEach((nombre, i) => {
      if (t(nombre) && i < this.filtros.length) this.cambiarFiltro(i);
    });
    if (t('R')) this.cargar();
  }

  cambiarFiltro(i) {
    const n = this.filtros.length;
    const nuevo = ((i % n) + n) % n;
    if (nuevo === this.filtro) return;
    this.filtro = nuevo;
    this.dibujarPestanas();
    this.cargar();
  }

  // Pestañas: General y cada raza (se tocan o se cambian con flechas)
  dibujarPestanas() {
    this.capaPestanas.forEach((o) => o.destroy());
    this.capaPestanas = [];
    const w = this.scale.width;
    const n = this.filtros.length;
    const sep = Math.min(170, (w - 2 * this.m) / n);
    const ancho = sep - 10;
    const y = 70 + this.e / 2;
    this.filtros.forEach((f, i) => {
      const cx = w / 2 + (i - (n - 1) / 2) * sep;
      const elegido = i === this.filtro;
      const texto = (modoTactil() ? '' : (i + 1) + '. ') + f.nombre;
      const partes = botonPantalla(this, cx, y, ancho, 32, texto, elegido ? 0xffe082 : 0x78909c,
        () => this.cambiarFiltro(i), 15);
      this.capaPestanas.push(...partes);
      if (elegido) { // contorno blanco para la pestaña elegida
        this.capaPestanas.push(this.add.graphics().lineStyle(2, 0xffffff).strokeRect(cx - ancho / 2 - 3, y - 19, ancho + 6, 38));
      }
    });
  }

  // Pide el ranking del filtro actual a Supabase
  cargar() {
    const pedido = ++this.pedido;
    this.mostrarMensaje('Cargando...', '#cfd8dc');
    cargarRanking(this.filtros[this.filtro].id)
      .then((r) => { if (pedido === this.pedido && this.sys.isActive()) this.dibujarTabla(r); })
      .catch((e) => {
        if (pedido === this.pedido && this.sys.isActive()) this.mostrarMensaje('No se pudo cargar el ranking: ' + e.message, '#ef9a9a');
      });
  }

  limpiarTabla() {
    this.capaTabla.forEach((o) => o.destroy());
    this.capaTabla = [];
  }

  mostrarMensaje(texto, color) {
    this.limpiarTabla();
    this.capaTabla.push(this.add.text(this.scale.width / 2, this.scale.height / 2, texto, {
      fontFamily: FUENTE, fontSize: '20px', color, align: 'center', wordWrap: { width: this.scale.width - 80 }
    }).setOrigin(0.5));
  }

  // Dos columnas de 10 puestos (1-10 a la izquierda, 11-20 a la derecha)
  dibujarTabla(r) {
    this.limpiarTabla();
    const capa = this.capaTabla;
    const w = this.scale.width;
    const general = this.filtros[this.filtro].id === null;
    const yo = ONLINE.usuario ? ONLINE.usuario.id : null;
    const porColumna = Math.ceil(CONFIG.ONLINE.RANKING_CANTIDAD / 2);
    const espacio = 20;
    const anchoCol = (w - 2 * this.m - espacio) / 2;
    const arriba = 104 + this.e / 2;
    const altoFila = 29;
    // Posición de cada dato dentro de una columna (la misma para encabezados y filas)
    const pos = {
      num: 8,
      apodo: 40,
      raza: Math.round(anchoCol * 0.43),
      tiempo: Math.round(anchoCol * 0.63),
      puntaje: anchoCol - 8
    };
    // anchoMax: si el texto no cabe, se achica (para que no se encime con la columna de al lado)
    const texto = (x, y, t, estilo, anchoMax) => {
      const obj = this.add.text(x, y, t, { fontFamily: FUENTE, fontSize: '15px', color: '#ffffff', ...estilo }).setOrigin(0, 0.5);
      if (anchoMax && obj.width > anchoMax) obj.setScale(anchoMax / obj.width, 1);
      capa.push(obj);
      return obj;
    };

    if (r.filas.length === 0) {
      capa.push(this.add.text(w / 2, arriba + 120, 'Todavía no hay partidas en este ranking.\n¡Juega una noche y sé el primero!', {
        fontFamily: FUENTE, fontSize: '20px', color: '#cfd8dc', align: 'center'
      }).setOrigin(0.5));
    }

    // Encabezados: una sola fila, y solo sobre las columnas que tienen datos
    // (con 10 partidas o menos hay una sola columna y un solo encabezado)
    const columnas = Math.min(2, Math.ceil(r.filas.length / porColumna));
    for (let col = 0; col < columnas; col++) {
      const x0 = this.m + col * (anchoCol + espacio);
      const estilo = { fontSize: '13px', color: '#9e9e9e', fontStyle: 'bold' };
      texto(x0 + pos.num, arriba, '#', estilo);
      texto(x0 + pos.apodo, arriba, 'Apodo', estilo);
      if (general) texto(x0 + pos.raza, arriba, 'Raza', estilo);
      texto(x0 + pos.tiempo, arriba, 'Tiempo', estilo);
      texto(x0 + pos.puntaje, arriba, 'Puntaje', estilo).setOrigin(1, 0.5);
    }

    r.filas.slice(0, porColumna * 2).forEach((f, i) => {
      const col = Math.floor(i / porColumna);
      const x0 = this.m + col * (anchoCol + espacio);
      const y = arriba + 24 + (i % porColumna) * altoFila;
      const mia = f.jugador_id === yo;
      const g = this.add.graphics();
      if (mia) marcoPixel(g, x0, y - altoFila / 2 + 1, anchoCol, altoFila - 2, 0xffe082, 0x4a3a2a);
      else g.fillStyle(i % 2 ? 0x2b2b3a : 0x24243a, 1).fillRect(x0, y - altoFila / 2 + 1, anchoCol, altoFila - 2);
      capa.push(g);
      const color = mia ? '#ffe082' : (i < 3 ? ['#ffd54f', '#e0e0e0', '#ffab91'][i] : '#ffffff');
      const finApodo = general ? pos.raza : pos.tiempo;
      texto(x0 + pos.num, y, String(i + 1), { color, fontStyle: 'bold' });
      texto(x0 + pos.apodo, y, f.apodo, { color, fontStyle: mia ? 'bold' : 'normal' }, finApodo - pos.apodo - 8);
      if (general) texto(x0 + pos.raza, y, this.nombreRaza(f.raza), { fontSize: '14px', color: '#cfd8dc' }, pos.tiempo - pos.raza - 8);
      const logros = (f.jefe_derrotado ? ' ⚔' : '') + (f.amanecer ? ' ☀' : '');
      const tiempo = texto(x0 + pos.tiempo, y, formatoTiempo(f.segundos_sobrevividos) + logros, { fontSize: '14px', color: '#cfd8dc' });
      const puntaje = texto(x0 + pos.puntaje, y, Number(f.puntaje).toLocaleString('es-CL'), { color, fontStyle: 'bold' }).setOrigin(1, 0.5);
      const libre = (pos.puntaje - puntaje.displayWidth - 8) - pos.tiempo; // espacio entre el tiempo y el puntaje
      if (tiempo.width > libre) tiempo.setScale(Math.max(0.6, libre / tiempo.width), 1);
    });

    // Tu posición (abajo)
    const yPie = arriba + 24 + porColumna * altoFila + 8;
    let pie;
    let colorPie = '#cfd8dc';
    if (!ONLINE.usuario) {
      pie = 'Entra con Google en el menú para aparecer en el ranking.';
    } else if (!ONLINE.apodo) {
      pie = 'Elige tu apodo en el menú para aparecer en el ranking.';
    } else if (!r.mia) {
      pie = ONLINE.apodo + ': aún no tienes partidas en este ranking.';
    } else {
      pie = 'Tu posición: #' + r.posicion + '   ·   ' + ONLINE.apodo + '   ·   ' +
        Number(r.mia.puntaje).toLocaleString('es-CL') + ' puntos' + (general ? ' (' + this.nombreRaza(r.mia.raza) + ')' : '');
      colorPie = '#ffe082';
    }
    capa.push(this.add.text(w / 2, yPie, pie, {
      fontFamily: FUENTE, fontSize: '16px', color: colorPie, fontStyle: 'bold'
    }).setOrigin(0.5, 0.5));
    capa.push(this.add.text(w / 2, yPie + 20, '⚔ derrotó al jefe   ·   ☀ sobrevivió la noche', {
      fontFamily: FUENTE, fontSize: '12px', color: '#9e9e9e'
    }).setOrigin(0.5, 0.5));
  }

  nombreRaza(id) {
    const r = RAZAS.find((x) => x.id === id);
    return r ? r.nombre : id;
  }
}

// 125 -> "02:05"
function formatoTiempo(segundos) {
  const s = Math.max(0, Math.floor(segundos || 0));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

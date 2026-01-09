function crearSistemaNotificaciones() {
	const notificaciones = new Map(); // id -> notificación
	const historial = [];
	const tiposNotificaciones = ["info", "warning", "error"];
	let idActual = 1;

	function validacionTipo(tipo) {
		return tiposNotificaciones.includes(tipo);
	}

	function crearNotificacion(mensaje, tipo) {
		return {
			id: idActual++,
			mensaje,
			tipo,
			fecha: new Date(),
			leida: false,
		};
	}

	return {
		agregar(mensaje, tipo) {
			if (!mensaje || !validacionTipo(tipo)) {
				return {
					ok: false,
					error: "Entrada inválida",
				};
			}

			const notificacion = crearNotificacion(mensaje, tipo);
			notificaciones.set(notificacion.id, notificacion);
			historial.push(`Se agregó notificación de tipo: ${tipo}`);

			return { ok: true, data: notificacion };
		},

		marcarComoLeida(id) {
			const notificacion = notificaciones.get(id);

			if (!notificacion) {
				return {
					ok: false,
					error: "La notificación no existe",
				};
			}
			if (notificacion.leida) {
				return {
					ok: false,
					error: "Notificación ya leída",
				};
			}

			notificacion.leida = true;
			return { ok: true, data: notificacion.id };
		},

		obtenerNoLeidas() {
			const noLeidas = [];
			for (let notificacion of notificaciones.values()) {
				if (notificacion.leida === false) {
					noLeidas.push(notificacion);
				}
			}
			return {
				data: noLeidas,
				meta: {
					total: noLeidas.length,
					mensaje:
						noLeidas.length === 0
							? "No hay notificaciones sin leer"
							: undefined,
				},
			};
		},

		obtenerPorTipo(tipo) {
			const resultado = [];

			for (let notificacion of notificaciones.values()) {
				if (notificacion.tipo === tipo) {
					resultado.push(notificacion);
				}
			}

			return {
				data: resultado,
				meta: {
					total: resultado.length,
					mensaje:
						resultado.length === 0
							? "No hay notificaciones de este tipo"
							: undefined,
				},
			};
		},

		eliminar(id) {
			const notificacion = notificaciones.get(id);
			if (!notificacion) {
				return {
					ok: false,
					error: "La notificación no existe",
				};
			}
			notificaciones.delete(id);
			historial.push(`Se eliminó notificación ID:${notificacion.id}`);

			return { ok: true, data: id };
		},

		verHistorial() {
			return {
				data: [...historial],
				meta: {
					total: historial.length,
				},
			};
		},
	};
}

// =========================== TESTING ===========================
const sistema = crearSistemaNotificaciones();

// agregar notificación
const resultadoAgregar = sistema.agregar("Bienvenido", "info");
console.log(resultadoAgregar.ok === true ? "Agregado" : "No se pudo agregar");

const notif2 = sistema.agregar("Advertencia de espacio", "warning");
const notif3 = sistema.agregar("Error crítico", "error");

// obtener notificaciones no leidas
const noLeidasAntes = sistema.obtenerNoLeidas();
console.log(noLeidasAntes.meta.total);

// marcar como leida
const resultadoLeida = sistema.marcarComoLeida(resultadoAgregar.data.id);
console.log(
	resultadoLeida.ok === true
		? "Notificación leida"
		: "No se pudo marcar como leída"
);

// obtener notificaciones no leídas
const noLeidasDespues = sistema.obtenerNoLeidas();
console.log(noLeidasDespues.meta.total);

// eliminar notificación
const eliminada = sistema.eliminar(notif2.data.id);
console.log(eliminada);

// ver registro de movimi
const registro = sistema.verHistorial();
console.log(registro.data);

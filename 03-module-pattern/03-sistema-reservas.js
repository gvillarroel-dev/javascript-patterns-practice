const SistemaReservas = (function () {
	const habitaciones = (function () {
		const habitacionesRegistradas = new Map();

		function registrar(numero, tipo, precioPorNoche) {
			if (!Number.isInteger(numero) || typeof tipo !== "string" || tipo.trim() === "" || typeof precioPorNoche !== "number" || precioPorNoche < 0) {
				return {
					ok: false,
					meta: { mensaje: "Entrada inválida" },
				};
			}

			const existeHabitacion = habitacionesRegistradas.has(numero);
			if (existeHabitacion) {
				return {
					ok: false,
					meta: { mensaje: "Habitación ya registrada" },
				};
			}

			habitacionesRegistradas.set(numero, {
				numero,
				tipo,
				precioPorNoche,
			});
			return { ok: true };
		}

		function obtenerPrecio(numeroHabitacion) {
			if (!Number.isInteger(numeroHabitacion)) {
				return {
					ok: false,
					meta: { mensaje: "Entrada inválida" },
				};
			}

			const habitacion = habitacionesRegistradas.get(numeroHabitacion);
			if (!habitacion) {
				return {
					ok: false,
					meta: { mensaje: "Habitación no registrada" },
				};
			}

			return {
				ok: true,
				data: {
					numero: habitacion.numero,
					precioPorNoche: habitacion.precioPorNoche,
				},
			};
		}

		function listarHabitaciones() {
			return {
				ok: true,
				data: Array.from(habitacionesRegistradas.values()),
			};
		}

		return {
			registrar,
			listarHabitaciones,
			obtenerPrecio,
		};
	})();

	const reservas = (function () {})();

	return {
		habitaciones,
		reservas,
	};
})();

// Registrar habitaciones
SistemaReservas.habitaciones.registrar(101, "simple", 80);
SistemaReservas.habitaciones.registrar(102, "doble", 120);
SistemaReservas.habitaciones.registrar(201, "suite", 200);

const res = SistemaReservas.habitaciones.registrar(255, "simple", 230);
console.log(res);

const resInvalida = SistemaReservas.habitaciones.registrar(255, "simple", 230);
console.log(resInvalida.meta.mensaje);

console.log(SistemaReservas.habitaciones.listarHabitaciones());

const resVerPrecio = SistemaReservas.habitaciones.obtenerPrecio(201);
console.log(resVerPrecio.data);

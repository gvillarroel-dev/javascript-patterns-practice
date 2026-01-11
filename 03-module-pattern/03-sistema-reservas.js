const SistemaReservas = (function () {
	// helper
	function listarHabitacionesDisponibles(fechaInicio, fechaFin) {
		const listaHabitaciones = habitaciones.listarHabitaciones();
		const disponibles = [];

		for (const habitacion of listaHabitaciones.data) {
			const disponibilidad = reservas.hayDisponibilidad(habitacion.numero, fechaInicio, fechaFin);
			if (disponibilidad.ok && disponibilidad.data) {
				disponibles.push(habitacion);
			}
		}
		return {
			ok: true,
			data: disponibles,
		};
	}

	const habitaciones = (function () {
		const habitacionesRegistradas = new Map();

		function registrar(numero, tipo, precioPorNoche) {
			if (!Number.isInteger(numero) || typeof tipo !== "string" || 
				tipo.trim() === "" || typeof precioPorNoche !== "number" || precioPorNoche < 0) {
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

		function existe(numeroHabitacion) {
			return habitacionesRegistradas.has(numeroHabitacion);
		}

		return {
			registrar,
			listarHabitaciones,
			obtenerPrecio,
			existe,
		};
	})();

	const reservas = (function (habitacionesApi) {
		const reservasPorHabitacion = new Map(); // numeroHabitacion -> [{cliente, fechaInicio, fechaFin}]

		// helpers
		function esFechaValida(fecha) {
			return fecha instanceof Date && !Number.isNaN(fecha.getTime());
		}

		function obtenerReservas(numeroHabitacion) {
			return reservasPorHabitacion.get(numeroHabitacion) || [];
		}

		// métodos internos
		function crear(numeroHabitacion, cliente, fechaInicio, fechaFin) {
			if (!Number.isInteger(numeroHabitacion) || typeof cliente !== "string" 
				|| cliente.trim() === "" || !esFechaValida(fechaInicio) || !esFechaValida(fechaFin)) {
				return {
					ok: false,
					meta: { mensaje: "Entrada inválida" },
				};
			}

			if (fechaInicio >= fechaFin) {
				return {
					ok: false,
					meta: { mensaje: "Rango de fechas inválido" },
				};
			}

			if (!habitacionesApi.existe(numeroHabitacion)) {
				return {
					ok: false,
					meta: {
						mensaje: "La habitación que intenta reservar no existe",
					},
				};
			}

			const reservas = [...obtenerReservas(numeroHabitacion)];

			for (const reserva of reservas) {
				const haySolapamiento = fechaInicio < reserva.fechaFin && fechaFin > reserva.fechaInicio;
				
				if (haySolapamiento) {
					return {
						ok: false,
						meta: { mensaje: "Fecha ya reservada" },
					};
				}
			}

			reservas.push({ cliente, fechaInicio, fechaFin });
			reservasPorHabitacion.set(numeroHabitacion, reservas);

			return {
				ok: true,
				data: { numeroHabitacion, reservas: [...reservas] },
			};
		}

		function hayDisponibilidad(numeroHabitacion, fechaInicio, fechaFin) {
			if (!Number.isInteger(numeroHabitacion) || !esFechaValida(fechaInicio) || !esFechaValida(fechaFin)) {
				return {
					ok: false,
					meta: { mensaje: "Entrada inválida" },
				};
			}

			if (!habitacionesApi.existe(numeroHabitacion)) {
				return {
					ok: false,
					meta: { mensaje: "La habitación no existe" },
				};
			}

			const reservas = obtenerReservas(numeroHabitacion);

			for (const reserva of reservas) {
				const haySolapamiento = fechaInicio < reserva.fechaFin && fechaFin > reserva.fechaInicio;
				if (haySolapamiento) {
					return {
						ok: true,
						data: false,
					};
				}
			}

			return {
				ok: true,
				data: true,
			};
		}

		return {
			crear,
			hayDisponibilidad,
		};
	})({ existe: habitaciones.existe, listarHabitaciones: habitaciones.listarHabitaciones });

	return {
		habitaciones,
		reservas,
		listarHabitacionesDisponibles,
	};
})();

// Registrar habitaciones
SistemaReservas.habitaciones.registrar(101, "simple", 80);
SistemaReservas.habitaciones.registrar(102, "doble", 120);
SistemaReservas.habitaciones.registrar(201, "suite", 200);

console.log("---------- Registrar habitacion válida ----------");
const res = SistemaReservas.habitaciones.registrar(255, "simple", 230);
console.log(res);

console.log("---------- Registrar habitacion inválida ----------");
const resInvalida = SistemaReservas.habitaciones.registrar(255, "simple", 230);
console.log(resInvalida.meta.mensaje);

console.log("---------- listar habitaciones ----------");
console.log(SistemaReservas.habitaciones.listarHabitaciones());

console.log("---------- obtener precio de habitación ----------");
const resVerPrecio = SistemaReservas.habitaciones.obtenerPrecio(201);
console.log(resVerPrecio.data);

console.log("---------- crear reserva válida ----------");
const reserva1 = SistemaReservas.reservas.crear(
	101,
	"Jules",
	new Date("2024-06-01"),
	new Date("2024-06-05")
);
console.log(reserva1);

console.log("---------- crear reserva duplicada ----------");
const reservaDuplicada = SistemaReservas.reservas.crear(
	101,
	"Maddox",
	new Date("2024-06-01"),
	new Date("2024-06-05")
);
console.log(reservaDuplicada.meta.mensaje);

console.log("---------- crear reserva: misma habitacion, diferente fecha ----------");
const reserva2 = SistemaReservas.reservas.crear(
	101,
	"Maddox",
	new Date("2024-06-06"),
	new Date("2024-06-10")
);
console.log(reserva2.data);

const reserva3 = SistemaReservas.reservas.crear(
	102,
	"Macklin",
	new Date("2024-06-11"),
	new Date("2024-06-15")
);

console.log("---------- listar habitaciones disponibles en fecha específica ----------");
const resListarDisponibles = SistemaReservas.listarHabitacionesDisponibles(
	new Date("2024-06-06"),
	new Date("2024-06-10")
);

console.log(resListarDisponibles.data);

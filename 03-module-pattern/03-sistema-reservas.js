const SistemaReservas = (function () {

	// ============ Submódulo: Habitaciones 
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
		const reservasPorHabitacion = new Map(); // numeroHabitacion -> [{id, cliente, fechaInicio, fechaFin}]
		let secuenciaIdReserva = 0;

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

			reservas.push({ id: ++secuenciaIdReserva, cliente, fechaInicio, fechaFin });
			reservasPorHabitacion.set(numeroHabitacion, reservas);

			return {
				ok: true,
				data: { idReserva: secuenciaIdReserva, numeroHabitacion, fechaInicio, fechaFin },
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
					meta: { mensaje: "Habitación no encontrada" },
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

		function cancelar(numeroHabitacion, idReserva) {
			if(!Number.isInteger(numeroHabitacion) || !Number.isInteger(idReserva)) {
				return {
					ok: false,
					meta: { mensaje: "Entrada inválida" }
				};
			}
			
			if(!habitacionesApi.existe(numeroHabitacion)) {
				return {
					ok: false,
					meta: { mensaje: "Habitación no encontrada" }
				};
			}

			const reservas = obtenerReservas(numeroHabitacion);

			const index = reservas.findIndex((reserva) => reserva.id === idReserva);
			if(index === -1) {
				return {
					ok: false,
					meta: { mensaje: "Reserva no encontrada" }
				};
			}

			const reserva = reservas[index];
			
			const ahora = Date.now();
			const limiteCancelacion = reserva.fechaInicio.getTime() - 24 * 60 * 60 * 1000;
			if(ahora >= limiteCancelacion) {
				return {
					ok: false,
					meta: { mensaje: "Límite de cancelación excedido. No se pudo cancelar" }
				};
			}

			reservas.splice(index, 1);
			reservasPorHabitacion.set(numeroHabitacion, reservas);
			return {
				ok: true,
				data: { idReserva }
			}
		}

		function modificar(numeroHabitacion, idReserva, nuevosDatos){
			if(!Number.isInteger(numeroHabitacion) || !Number.isInteger(idReserva)) {
				return {
					ok: false,
					meta: { mensaje: "Entrada inválida" }
				};
			}

			if(!habitacionesApi.existe(numeroHabitacion)) {
				return {
					ok: false,
					meta: { mensaje: "Habitación no encontrada" }
				};
			}

			const reservas = obtenerReservas(numeroHabitacion);

			const index = reservas.findIndex((reserva) => reserva.id === idReserva);
			if(index === -1) {
				return {
					ok: false,
					meta: { mensaje: "Reserva no encontrada" }
				};
			}

			const reservaActual = reservas[index];

			const ahora = Date.now();
			const limite = reservaActual.fechaInicio.getTime() - 24 * 60 * 60 * 1000;
			if(ahora >= limite) {
				return {
					ok: false,
					meta: { mensaje: "Límite de modificación excedido (24 horas). No se pudo modificar" }
				};
			}

			const clienteFinal = nuevosDatos.cliente ?? reservaActual.cliente;
			const fechaInicioFinal = nuevosDatos.fechaInicio ?? reservaActual.fechaInicio;
			const fechaFinFinal = nuevosDatos.fechaFin ?? reservaActual.fechaFin;

			if(typeof clienteFinal !== "string" || clienteFinal.trim() === "" || !esFechaValida(fechaInicioFinal) || !esFechaValida(fechaFinFinal)) {
				return {
					ok: false,
					meta: { mensaje: "Datos inválidos" }
				};
			}

			if (fechaInicioFinal >= fechaFinFinal) {
				return {
					ok: false,
					meta: { mensaje: "Rango de fechas inválido" },
				};
			}

			for(const reserva of reservas) {
				if(reserva.id === idReserva) continue;
				
				const haySolapamiento = fechaInicioFinal < reserva.fechaFin && fechaFinFinal > reserva.fechaInicio;
				if(haySolapamiento) {
					return {
						ok: false,
						meta: { mensaje: "Fecha ya reservada" }
					};
				}
			}
			
			reservas[index] = {
				...reservaActual,
				cliente: clienteFinal,
				fechaInicio: fechaInicioFinal,
				fechaFin: fechaFinFinal,
			};
			reservasPorHabitacion.set(numeroHabitacion, reservas);
			
			return {
				ok: true,
				data: { idReserva }
			};
		}

		function listarReservasPorHabitacion(numeroHabitacion) {
			if(!Number.isInteger(numeroHabitacion)) {
				return {
					ok: false,
					meta: { mensaje: "Entrada inválida" }
				};
			}
			
			if(!habitacionesApi.existe(numeroHabitacion)) {
				return {
					ok: false,
					meta: { mensaje: "Habitación no encontrada" }
				};
			}

			return {
				ok: true,
				data: [...obtenerReservas(numeroHabitacion)]
			};
		}

		return {
			crear,
			cancelar,
			modificar,
			listarReservasPorHabitacion,
			hayDisponibilidad,
		};
	})({ existe: habitaciones.existe, listarHabitaciones: habitaciones.listarHabitaciones });

	function listarHabitacionesDisponibles(fechaInicio, fechaFin) {
		if (!fechaInicio || !fechaFin || fechaInicio >= fechaFin) {
			return {
				ok: false,
				meta: { mensaje: "Rango de fechas inválido" },
			};
		}

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

console.log("---------- cancelar reserva válida ----------");
const reserva4 = SistemaReservas.reservas.crear(
	101,
	"Jude",
	new Date("2026-01-13"),
	new Date("2026-01-20")
);

const resCancelar = SistemaReservas.reservas.cancelar(reserva4.data.numeroHabitacion, reserva4.data.idReserva)
console.log(resCancelar.ok === true);

console.log("---------- modificar reserva válida ----------");

const reserva5 = SistemaReservas.reservas.crear(
	101,
	"Jude",
	new Date("2026-01-13"),
	new Date("2026-01-20")
);

console.log(SistemaReservas.reservas.listarReservasPorHabitacion(reserva1.data.numeroHabitacion).data);

const nuevosDatosReserva = {
	fechaInicio: new Date("2026-01-14")
}
const resMod = SistemaReservas.reservas.modificar(reserva5.data.numeroHabitacion, reserva5.data.idReserva, nuevosDatosReserva);
console.log(resMod.ok === true);

console.log("---------- ver lista de reservas de una habitación válida ----------");
console.log(SistemaReservas.reservas.listarReservasPorHabitacion(reserva1.data.numeroHabitacion).data);
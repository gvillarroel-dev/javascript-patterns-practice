function crearTemporizador() {
	let segundos = 0;
	let intervalo = null;
	let corriendo = false;
	let tiempoInicio = null;

	return {
		iniciar() {
			if (corriendo) {
				return {
					exito: false,
					mensaje: "El temporizador ya está corriendo",
				};
			}

			corriendo = true;
			tiempoInicio = Date.now() - segundos * 1000;

			intervalo = setInterval(() => {
				segundos = Math.floor((Date.now() - tiempoInicio) / 1000);
			}, 100);

			return { exito: true, mensaje: "Temporizador iniciado" };
		},

		pausar() {
			if (!corriendo) {
				return {
					exito: false,
					mensaje: "El temporizador está detenido",
				};
			}

			clearInterval(intervalo);
			intervalo = null;
			corriendo = false;

			return { exito: true, mensaje: "Temporizador detenido" };
		},

		reanudar() {
			if (corriendo) {
				return {
					exito: false,
					mensaje: "Temporizador ya está corriendo",
				};
			}
			return this.iniciar();
		},

		reiniciar() {
			if (corriendo) {
				clearInterval(intervalo);
				intervalo = null;
				corriendo = false;
			}
			segundos = 0;
			return { exito: true, mensaje: "Temporizador reiniciado" };
		},

		obtenerTiempo() {
			return segundos;
		},

		estaCorriendo() {
			return corriendo;
		},

		obtenerTiempoFormateado() {
			const horas = Math.floor(segundos / 3600);
			const minutos = Math.floor((segundos % 3600) / 60);
			const segs = segundos % 60;

			return `${String(horas).padStart(2, "0")}:${String(
				minutos
			).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
		},
	};
}

const timer = crearTemporizador();

console.log("======= Test I: Temporizador con uso correcto =======");

timer.iniciar();
console.log(`Iniciado: ${timer.estaCorriendo()}`);

setTimeout(() => {
	console.log(`Tiempo transcurrido: ${timer.obtenerTiempo()}`);
	console.log(`Tiempo formateado: ${timer.obtenerTiempoFormateado()}`);

	timer.pausar();
	console.log(`Temporizador pausado: ${timer.estaCorriendo()}`);

	const tiempoAlPausar = timer.obtenerTiempo();

	setTimeout(() => {
		console.log(`Después de pausar: ${timer.obtenerTiempo()}`);
		console.log(
			`¿Tiempo no cambió?: ${timer.obtenerTiempo() === tiempoAlPausar}`
		);

		timer.reiniciar();
		console.log(`Después de reiniciar: ${timer.obtenerTiempo()}`);
	}, 2000);
}, 3000);

// privacidad -> variables no accesibles
// console.log(`Segundos: ${timer.segundos}`);
// console.log(`Intervalo: ${timer.intervalo}`);

// Test: Pausar sin iniciar
console.log("======= Test II: Pausar temporizador sin iniciar =======");
const timer2 = crearTemporizador();

let resultadoPausar = timer2.pausar();
console.log(`¿Falló?: ${!resultadoPausar.exito}`);
console.log(resultadoPausar.mensaje);

// Test: Doble inicio
console.log("======= Test III: Doble inicio de temporizador =======");
const timer3 = crearTemporizador();

timer3.iniciar();
const resultadoDobleInicio = timer3.iniciar();
console.log(`¿Falló?: ${!resultadoDobleInicio.exito}'`);
console.log(resultadoDobleInicio.mensaje);
timer3.pausar();

const CalculadoraModule = (function () {
	const historial = new Map(); // operacion -> {operacion, resultado}
	const MAX_HISTORIAL = 10;

	function agregarAlHistorial(operacion, resultado) {
		if (historial.has(operacion)) return;

		if (historial.size === MAX_HISTORIAL) {
			let operacionMasAntigua = historial.keys().next().value;
			historial.delete(operacionMasAntigua);
		}
		historial.set(operacion, { operacion, resultado });
	}

	// API
	return {
		sumar(a, b) {
			const resultado = a + b;
			agregarAlHistorial(`${a} + ${b}`, resultado);
			return { ok: true, data: resultado };
		},

		restar(a, b) {
			const resultado = a - b;
			agregarAlHistorial(`${a} - ${b}`, resultado);
			return { ok: true, data: resultado };
		},

		multiplicar(a, b) {
			const resultado = a * b;
			agregarAlHistorial(`${a} * ${b}`, resultado);
			return { ok: true, data: resultado };
		},

		dividir(a, b) {
			if (b === 0) {
				return {
					ok: false,
					meta: { mensaje: "Error: división por cero" },
				};
			}
			const resultado = a / b;
			agregarAlHistorial(`${a} / ${b}`, resultado);
			return { ok: true, data: resultado };
		},

		verHistorial() {
			return {
				ok: true,
				data: Array.from(historial.values()),
			};
		},

		limpiarHistorial() {
			historial.clear();
			return { ok: true, meta: { mensaje: "Historial limpio" } };
		},
	};
})();

// ======================================= TESTING =======================================
const resultadoSuma = CalculadoraModule.sumar(2, 2);
console.log(resultadoSuma.data);

CalculadoraModule.restar(4, 2);

const divisionCero = CalculadoraModule.dividir(2, 0);
console.log(divisionCero.meta.mensaje);

CalculadoraModule.multiplicar(5, 5);

const historialOperaciones = CalculadoraModule.verHistorial();
console.log(historialOperaciones.data);

CalculadoraModule.limpiarHistorial();
console.log(CalculadoraModule.verHistorial().data);

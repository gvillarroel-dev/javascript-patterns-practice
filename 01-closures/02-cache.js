function crearCache() {
	let datos = new Map();

	function haExpirado(entrada) {
		return Date.now() > entrada.expiraEn;
	}

	function limpiarDatosExpirados() {
		for (let [clave, valor] of datos.entries()) {
			if (haExpirado(valor)) {
				datos.delete(clave);
			}
		}
	}

	return {
		guardar(clave, valor, tiempoVidaMs) {
			if (!clave || tiempoVidaMs < 0) {
				return { exito: false, error: "Parámetros inválidos" };
			}

			const entrada = {
				valor,
				expiraEn: Date.now() + tiempoVidaMs,
				guardadoEn: Date.now(),
			};

			datos.set(clave, entrada);
			return { exito: true };
		},

		obtener(clave) {
			if (!datos.has(clave)) {
				return null;
			}

			const entrada = datos.get(clave);
			if (haExpirado(entrada)) {
				datos.delete(clave);
				return null;
			}

			return entrada.valor;
		},

		limpiar() {
			limpiarDatosExpirados();
			return {
				exito: true,
				datosEliminados: Array.from(datos.keys()).length,
			};
		},
	};
}

// Testing
const cache = crearCache();

cache.guardar("usuario", { nombre: "Jude", edad: 32 }, 3000);
const usuario = cache.obtener("usuario");
console.log("Usuario recuperado:", usuario);

const resultadoLimpieza = cache.limpiar();
console.log(resultadoLimpieza);

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

		cacheSize() {
			limpiarDatosExpirados();
			return datos.size;
		},

		tieneValor(clave) {
			const valor = this.obtener(clave);
			return valor !== null;
		},

		eliminar(clave) {
			if (!datos.has(clave)) {
				return { exito: false, error: "Clave no encontrada" };
			}
			datos.delete(clave);
			return { exito: true };
		},

		limpiarCache() {
			datos.clear();
			return { exito: true };
		},

		obtenerInfo(clave) {
			if (!datos.has(clave)) {
				return null;
			}

			const entrada = datos.get(clave);
			if (haExpirado(entrada)) {
				datos.delete(clave);
				return null;
			}

			const tiempoRestante = entrada.expiraEn - Date.now();
			return {
				clave,
				tiempoRestante: tiempoRestante,
				tiempoRestanteEnSegundos: Math.floor(tiempoRestante / 1000),
				guardadoEn: new Date(entrada.guardadoEn),
				expiraEn: new Date(entrada.expiraEn),
			};
		},
	};
}

// ======================== Testing ========================
const cache = crearCache();

// Test: guardar y recuperar datos:
cache.guardar("usuario", { nombre: "Jude", edad: 32 }, 3000);
const usuario = cache.obtener("usuario");
console.log("Usuario recuperado:", usuario);
console.log(`Tamaño del cache: ${cache.cacheSize()}`);

// Test: entradas con diferentes tiempos de expiración
console.log("\nNuevas entradas");
cache.guardar("configuración", { tema: "oscuro" }, 5000);
cache.guardar("token", "jyx433", 2000);
cache.guardar("sesion", { id: 1 }, 10000);

console.log(`Tamaño del cache: ${cache.cacheSize()}`);

// Test: Información de entradas
console.log("\nInformación de entrada");
const infoToken = cache.obtenerInfo("token");
console.log(`El Token expira en: ${infoToken.tiempoRestanteEnSegundos} segundos`);

const claveInvalida = cache.obtenerInfo("identificación");
console.log(claveInvalida);

// Test: prueba de expiración de archivos
console.log("\nEsperando tiempo de expiración...");

setTimeout(() => {
	console.log("\nDespués de 2.5 segundos:");
	console.log(`Token (2s): ${cache.obtener("token")}`);
	console.log("Usuario (3s):", cache.obtener("usuario"));
	console.log("Configuración (5s):", cache.obtener("configuración"));
}, 2500);

setTimeout(() => {
	console.log("\nDespués de 2.5 segundos:");
	console.log("Configuración (5s):", cache.obtener("configuración"));
	console.log("Sesion (10s):", cache.obtener("sesion"));
	console.log("Tamaño final del cache:", cache.cacheSize());
}, 6000);

function crearProductoConfigurable(nombre, precioBase) {
	const producto = {
		nombre,
		precioBase,
	};
	const opcionesDisponibles = new Map(); // nombre -> {nombre, precio}
	const opcionesSeleccionadas = new Set();

	function calcularPrecioTotal() {
		let precioTotal = producto.precioBase;

		for (let nombreOpcion of opcionesSeleccionadas) {
			const opcion = opcionesDisponibles.get(nombreOpcion);
			precioTotal += opcion.precio;
		}
		return precioTotal;
	}

	return {
		agregarOpcion(nombreOpcion, precioDiferencia) {
			if (!nombreOpcion || typeof precioDiferencia !== "number" || precioDiferencia < 0) {
				return { ok: false, meta: { mensaje: "Entrada inválida" } };
			}
			opcionesDisponibles.set(nombreOpcion, {
				nombre: nombreOpcion,
				precio: precioDiferencia,
			});
			return { ok: true };
		},

		seleccionarOpcion(nombreOpcion) {
			if (!opcionesDisponibles.has(nombreOpcion)) {
				return { ok: false, meta: { mensaje: `La opción ${nombreOpcion} no existe` },
				};
			}

			if (opcionesSeleccionadas.has(nombreOpcion)) {
				return { ok: false, meta: { mensaje: `La opción ${nombreOpcion} ya está seleccionada`, }};
			}

			opcionesSeleccionadas.add(nombreOpcion);
			return { ok: true };
		},

		deseleccionarOpcion(nombreOpcion) {
			if (!opcionesSeleccionadas.has(nombreOpcion)) {
				return {ok: false, meta: { mensaje: `La opción ${nombreOpcion} no está seleccionada`}};
			}

			opcionesSeleccionadas.delete(nombreOpcion);
			return { ok: true };
		},

		calcularPrecioFinal() {
			return {
				ok: true,
				data: calcularPrecioTotal(),
			};
		},

		obtenerConfiguracion() {
			const catalogo = Array.from(opcionesSeleccionadas).map((nombreOpcion) => {
				const opcion = opcionesDisponibles.get(nombreOpcion);
				return {
					nombre: opcion.nombre,
					precio: opcion.precio,
				};
			});

			return {
				ok: true,
				data: {
					producto: producto.nombre,
					precioBase: producto.precioBase,
					opciones: catalogo,
					precioTotal: calcularPrecioTotal(),
				},
			};
		},
	};
}

// =================================== TESTING ===================================
// =================================== TESTING ===================================
const laptop = crearProductoConfigurable("Laptop Pro", 1200);

// agregar opciones al producto
console.log("--- Agregar opciones ---");
const resultadoAgregar = laptop.agregarOpcion("RAM 16GB", 250);
console.log(resultadoAgregar.ok ? "opción agregada" : "opción no agregada");

laptop.agregarOpcion("SSD 1TB", 340);
laptop.agregarOpcion("AMD Rizen 5000", 590);

// seleccionar opciones del producto
console.log("\n--- Seleccionar opciones ---");
const resultadoSeleccionarOpcion = laptop.seleccionarOpcion("RAM 16GB");
console.log(resultadoSeleccionarOpcion.ok ? "opción seleccionada" : "no seleccionada");

const dobleSeleccion = laptop.seleccionarOpcion("RAM 16GB");
console.log(!dobleSeleccion.ok ? "duplicado rechazado" : "permitió duplicado");

const seleccionInvalida = laptop.seleccionarOpcion("GPU 3090");
console.log(seleccionInvalida.meta.mensaje);

// deseleccionar opciones del producto
console.log("\n--- Deseleccionar opciones ---");
const resultadoDeseleccionar = laptop.deseleccionarOpcion("RAM 16GB");
console.log(resultadoDeseleccionar.ok ? "opción deseleccionada" : "opción aún seleccionada");

const deseleccionInvalida = laptop.deseleccionarOpcion("RAM 8GB");
console.log(deseleccionInvalida.meta.mensaje);

// calcular precio final del producto
console.log("\n--- Calcular precio ---");
laptop.seleccionarOpcion("SSD 1TB");
laptop.seleccionarOpcion("AMD Rizen 5000");

const precioTotal = laptop.calcularPrecioFinal();
console.log(`Total: $${precioTotal.data}`);

// ver configuración final del producto
console.log("\n--- Configuración final ---");
const resultadoConfiguracion = laptop.obtenerConfiguracion();
console.log(resultadoConfiguracion.data);

// Test: producto precio base solo
console.log("\n--- Caso sin opciones ---");
const laptop2 = crearProductoConfigurable("Laptop Pro", 1200);
const precioFinalBase = laptop2.calcularPrecioFinal();
console.log(`Precio base: $${precioFinalBase.data}`);
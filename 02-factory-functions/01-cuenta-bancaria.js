function crearCuentaBancaria(titular, saldoInicial) {
	let saldo = saldoInicial;
	let transacciones = [];

	function registroTransacciones(tipo, monto) {
		transacciones.push({ tipo, monto, fecha: new Date() });
	}

	return {
		getTitular() {
			return titular;
		},

		depositar(monto) {
			if (monto > 0) {
				saldo += monto;
				registroTransacciones("depósito", monto);
				return { exito: true, mensaje: "Depósito hecho correctamente" };
			}
			return { exito: false };
		},

		retirar(monto) {
			if (monto > 0 && monto <= saldo) {
				saldo -= monto;
				registroTransacciones("retiro", monto);
				return { exito: true };
			}

			return { exito: false, mensaje: "Saldo insuficiente" };
		},

		verSaldo() {
			return saldo;
		},

		verMovimientos() {
			return [...transacciones];
		},
	};
}

// ========================== TESTING ==========================
const miCuenta = crearCuentaBancaria("Jules", 1000);

console.log(`Titular de la cuenta: ${miCuenta.getTitular()}`);

// Test: depósito en cuenta
miCuenta.depositar(750);
console.log(`Saldo actual: ${miCuenta.verSaldo()}`);

// Test: retiro de dinero
const retiroInvalido = miCuenta.retirar(2000);
console.log(`Estado del retiro: ${retiroInvalido.mensaje}`);

const retiroValido = miCuenta.retirar(120);
console.log(`Estado del retiro: ${retiroValido.exito ? "aceptado": "rechazado"}`);

// Test: visualizacion de saldo y movimientos
console.log(`Saldo actual en cuenta: ${miCuenta.verSaldo()}`);
console.log(miCuenta.verMovimientos());

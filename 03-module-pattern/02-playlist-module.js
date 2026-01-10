const PlaylistModule = (function () {
	const biblioteca = new Map(); // nombre -> { nombre, canciones }

	return {
		agregar(nombre) {
			if (biblioteca.has(nombre)) {
				return {
					ok: false,
					meta: { mensaje: "La playlist ya existe" },
				};
			}

			const playlist = {
				nombre,
				canciones: [],
				reproduciendo: false,
			};

			biblioteca.set(nombre, playlist);
			return { ok: true, data: playlist };
		},

		agregarCancion(nombrePlaylist, cancion) {
			const playlist = biblioteca.get(nombrePlaylist);
			if (!playlist) {
				return {
					ok: false,
					meta: {
						mensaje: `La playlist ${nombrePlaylist} no existe`,
					},
				};
			}

			if (!cancion || !cancion.titulo) {
				return {
					ok: false,
					meta: { mensaje: "Datos de canción inválidos" },
				};
			}

			if (playlist.canciones.some((c) => c.titulo === cancion.titulo)) {
				return {
					ok: false,
					meta: {
						mensaje: `${cancion.titulo} ya se encuentra en la playlist`,
					},
				};
			}

			playlist.canciones.push({
				titulo: cancion.titulo,
				artista: cancion.artista,
				duracion: cancion.duracion,
			});

			return {
				ok: true,
				data: {
					nombre: playlist.nombre,
					canciones: [...playlist.canciones],
				},
			};
		},

		eliminarCancion(nombrePlaylist, tituloCancion) {
			const playlist = biblioteca.get(nombrePlaylist);
			if (!playlist) {
				return {
					ok: false,
					meta: {
						mensaje: `La playlist ${nombrePlaylist} no existe`,
					},
				};
			}

			const index = playlist.canciones.findIndex(
				(c) => c.titulo === tituloCancion
			);
			if (index === -1) {
				return {
					ok: false,
					meta: {
						mensaje: `${tituloCancion} no se encuentra en la playlist`,
					},
				};
			}
			playlist.canciones.splice(index, 1);
			return { ok: true };
		},

		reproducir(nombrePlaylist) {
			const playlist = biblioteca.get(nombrePlaylist);
			if (!playlist) {
				return {
					ok: false,
					meta: {
						mensaje: `La playlist ${nombrePlaylist} no existe`,
					},
				};
			}

			if (playlist.canciones.length === 0) {
				return {
					ok: false,
					meta: {
						mensaje: `La playlist ${nombrePlaylist} aún no tiene canciones agregadas`,
					},
				};
			}

			playlist.reproduciendo = true;
			return { ok: true, data: [...playlist.canciones] };
		},

		mezclar(nombrePlaylist) {
			const playlist = biblioteca.get(nombrePlaylist);
			if (!playlist) {
				return {
					ok: false,
					meta: {
						mensaje: `La playlist ${nombrePlaylist} no existe`,
					},
				};
			}

			if (playlist.canciones.length === 0) {
				return {
					ok: false,
					meta: { mensaje: "La playlist no tiene canciones" },
				};
			}

			const mezcla = [...playlist.canciones];
			for (let i = playlist.canciones.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
			}
			return { ok: true, data: mezcla };
		},

		duracionTotal(nombrePlaylist) {
			const playlist = biblioteca.get(nombrePlaylist);
			if (!playlist) {
				return {
					ok: false,
					meta: {
						mensaje: `La playlist ${nombrePlaylist} no existe`,
					},
				};
			}

			const duracion = playlist.canciones.reduce((total, cancion) => total + cancion.duracion, 0);
			return { ok: true, data: duracion };
		},

		buscarPorArtista(nombreArtista) {
			const resultado = [];
			if (biblioteca.size === 0) {
				return {
					ok: true,
					data: [],
				};
			}

			for (const playlist of biblioteca.values()) {
				for (const cancion of playlist.canciones) {
					if (cancion.artista === nombreArtista) {
						resultado.push({
							...cancion,
							playlist: playlist.nombre,
						});
					}
				}
			}

			return { ok: true, data: resultado };
		},

		verBiblioteca() {
			return {
				ok: true,
				data: Array.from(biblioteca.values()),
			};
		},
	};
})();

// =========================== ZONA DE TESTING ===========================

// agregar playlist válida
console.log("\n----- Test: agregar playlist válida -----");
const resAgregar = PlaylistModule.agregar("Rock");
console.log(resAgregar.ok === true ? "Playlist agregada" : "No agregada");

// agregar playlist duplicada
console.log("\n----- Test: agregar playlist duplicada -----");
const resDuplicada = PlaylistModule.agregar("Rock");
console.log(resDuplicada.meta.mensaje);

// agregar canciones
const cancion1 = {
    titulo: "Verte de Cerca",
    artista: "Airbag",
    duracion: 181
}

const cancion2 = {
    titulo: "Extrañas Intenciones",
    artista: "Airbag",
    duracion: 148
}

const cancion3 = {
	titulo: "The Pretender",
	artista: "Foo Fighters",
	duracion: 270,
};

// agregar cancion válida
console.log("\n----- Test: agregar canción válida -----");
const resAgregarCancion = PlaylistModule.agregarCancion("Rock", cancion1);
console.log(resAgregarCancion.ok === true ? "Canción agregada" : "No agregada");

PlaylistModule.agregarCancion("Rock", cancion2);
PlaylistModule.agregarCancion("Rock", cancion3);

// agregar canción duplicada
console.log("\n----- Test: agregar canción duplicada -----");
const resCancionDuplicada = PlaylistModule.agregarCancion("Rock", cancion1);
console.log(resCancionDuplicada.ok === false);
console.log(resCancionDuplicada.meta.mensaje);

// agregar canción a playlist inexistente
console.log("\n----- Test: agregar canción a playlist inválida -----");
const resPlaylistInexistente = PlaylistModule.agregarCancion("Pop", cancion3);
console.log(resPlaylistInexistente.meta.mensaje);

// eliminar canciones
console.log("\n----- Test: eliminar canción válida -----");
const resEliminar = PlaylistModule.eliminarCancion("Rock", "Extrañas Intenciones");
console.log(resEliminar.ok === true);
console.log(PlaylistModule.verBiblioteca());

// eliminar canción inválida
console.log("\n----- Test: eliminar canción inválida -----");
const resEliminarInvalida = PlaylistModule.eliminarCancion("Rock", "Nothing Else Matters");
console.log(resEliminarInvalida.ok === false);
console.log(resEliminarInvalida.meta.mensaje);

// reproducir playlist sin canciones
console.log("\n----- Test: reproducir playlist sin canciones -----");
PlaylistModule.agregar("J-Pop");
const resReproducirVacia = PlaylistModule.reproducir("J-Pop");
console.log(resReproducirVacia.meta.mensaje);

// reproducir playlist válida
console.log("\n----- Test: reproducir playlist válida -----");
const resReproducir = PlaylistModule.reproducir("Rock");
console.log(Array.isArray(resReproducir.data));

// mezclar playlist 
console.log("\n----- Test: mezclar canciones en playlist válida -----");
PlaylistModule.agregarCancion("Rock", cancion2)
const resMezclar = PlaylistModule.mezclar("Rock");
console.log(resMezclar.data);

// mezclar playlist inexistente
console.log("\n----- Test: mezclar canciones en playlist inválida -----");
const resMezclarInvalida = PlaylistModule.mezclar("Electronica");
console.log(resMezclarInvalida.ok == false);
console.log(resMezclarInvalida.meta.mensaje);

// buscar por artista
console.log("\n----- Test: buscar artista válido -----");
const resBuscar = PlaylistModule.buscarPorArtista("Foo Fighters");
console.log(resBuscar.data);

// buscar artista inexistente
console.log("\n----- Test: buscar artista inválido -----");
const resBuscarInvalido = PlaylistModule.buscarPorArtista("The Beatles");
console.log(resBuscarInvalido.data.length === 0);

// ver biblioteca completa
console.log("\n----- Test: ver biblioteca -----");
const biblioteca = PlaylistModule.verBiblioteca();
console.log(biblioteca.data);

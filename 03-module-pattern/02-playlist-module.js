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
				j = Math.floor(Math.random() * (i + 1));
				[mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
			}
			return { ok: true, data: mezcla };
		},

		verBiblioteca() {
			return {
				data: Array.from(biblioteca.values()),
			};
		},
	};
})();

// =========================== ZONA DE TESTING ===========================

const resAgregar = PlaylistModule.agregar("Rock Clásico");
console.log(resAgregar);

console.log(PlaylistModule.verBiblioteca().data);

const resAgregarC = PlaylistModule.agregarCancion(resAgregar.data.nombre, {
	titulo: "Stairway to Heaven",
	artista: "Led Zeppelin",
	duracion: 482,
});
console.log(resAgregarC.data);

const agregarMismaCancion = PlaylistModule.agregarCancion(
	resAgregar.data.nombre,
	{
		titulo: "Stairway to Heaven",
		artista: "Led Zeppelin",
		duracion: 482,
	}
);
console.log(agregarMismaCancion.meta.mensaje);

console.log(PlaylistModule.eliminarCancion("Muse", "Airbag").meta.mensaje);
console.log(
	PlaylistModule.eliminarCancion("Rock Clásico", "Airbag").meta.mensaje
);
console.log(
	PlaylistModule.eliminarCancion("Rock Clásico", "Stairway to Heaven")
);

console.log(PlaylistModule.verBiblioteca().data);

console.log(PlaylistModule.reproducir("Rock Clásico").meta.mensaje);
PlaylistModule.agregarCancion(resAgregar.data.nombre, {
	titulo: "Stairway to Heaven",
	artista: "Led Zeppelin",
	duracion: 482,
});
PlaylistModule.agregarCancion(resAgregar.data.nombre, {
	titulo: "Verte de Cerca",
	artista: "Airbag",
	duracion: 482,
});

console.log(PlaylistModule.reproducir("Rock Clásico").data);

console.log(PlaylistModule.mezclar("Rock Clásico"));

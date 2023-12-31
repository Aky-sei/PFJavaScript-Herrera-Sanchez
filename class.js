// Clase de las peliculas
class Pelicula {
    constructor (nombre,duracion,disponible) {
        this.nombre = nombre
        this.duracion = duracion
        this.disponible = hallarDias(disponible)
    }
}

// Clase de los dias
class Dia {
    constructor (dia,precio) {
        this.nombre = dia
        this.precio = precio
    }
}

// Funcion que toma los dias del array dado a la clase peliculas para generar un nuevo array solo con los dias deseados
function hallarDias(disponible) {
    let resultado = []
    disponible.forEach(element => {
        dias[element] ? resultado.push(dias[element]) : null
    });
    return resultado
}
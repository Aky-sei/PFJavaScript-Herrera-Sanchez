// Definimos las varialbles necesarias usamos un función asincrona para recibir los datos del archivo
// Cuando se obtienen los datos, solo necesitamos mostrar el carrito y las peliculas para que el usuario las vea

let peliculas = []

const obtenerDatosDePeliculas = async () => {
    const resp = await fetch(`data.json`)
    peliculas = await resp.json()
    mostrarCarrito()
    mostrarPeliculas()
}
obtenerDatosDePeliculas()

// Se consiguen lo elementos necesarios del HTML
let inputNombre = document.getElementById("inputNombre")
let sectionPeliculas = document.getElementById("sectionPeliculas")
let sectionHorarios = document.getElementById("sectionHorarios")
let botonComprar = document.getElementById("botonComprar")
let botonConfirmar = document.getElementById("botonConfirmar")
let sectionCarrito = document.getElementById("carrito")
let totalCarrito = document.getElementById("costoTotal")
let totalCarritoDiv = document.getElementById("totalCarrito")

// Se define variables para posterior uso
let peliculaSeleccionada = ""
let horarioSeleccionado = ""
let costoTotal = 0
// Se define el carrito y el nombre tomandolos del localStorage en caso de existir
let carrito = JSON.parse(localStorage.getItem("cineCarrito")) || []
let nombreComprador = localStorage.getItem("cineNombre") || ""
inputNombre.value = nombreComprador

// Se almacena el valor del input del nombre en el LocalStorage
inputNombre.addEventListener("change",({target}) => {
    nombreComprador = target.value
    localStorage.setItem("cineNombre", nombreComprador)
    mostrarCarrito()
})

// Se construye el HTML para mostrar las peliculas disponibles
function mostrarPeliculas() {
    // Construir el HTML
    let insertar = ""
    for (const pelicula of peliculas) {
        insertar += `
        <div class="cartillaPelicula">
            <h3 class="peliculaNombre">${pelicula.nombre}</h3>
            <p class="peliculaDuracion">${pelicula.duracion}</p>
        </div>
        `
    }
    sectionPeliculas.innerHTML = insertar
    // Modificar el borde para mostrar la pelicula seleccionada
    for (const cartilla of document.getElementsByClassName("cartillaPelicula")) {
        cartilla.addEventListener("click",({target}) => {
            horarioSeleccionado = ""
            for (const cartilla of document.getElementsByClassName("cartillaPelicula")) {
                cartilla.style.border = "3px solid black"
            }
            if (target.localName == "h3" || target.localName == "p") {
                target.parentElement.style.border = "3px solid blue"
                // Asignar el objeto de la pelicula seleccionada a la variable
                peliculaSeleccionada = peliculas.find((pelicula) => pelicula.nombre == target.parentElement.children[0].innerHTML)
            } else {
                target.style.border = "3px solid blue"
                peliculaSeleccionada = peliculas.find((pelicula) => pelicula.nombre == target.children[0].innerHTML)
            }
            mostrarHorarios()
        })
    }
}

// Se construye el HTML para mostrar los horarios disponibles dependiendo de la pelicula asignada
function mostrarHorarios() {
    // Construir el HTML
    let insertar = ""
    for (const horario of peliculaSeleccionada.disponible) {
        insertar += `
        <div class="cartillaHorario">
            <h3 class="horarioNombre">${horario.nombre}</h3>
            <p class="horarioDuracion">$${horario.precio}</p>
        </div>
        `
    }
    sectionHorarios.innerHTML = insertar
    // Modificar el borde para mostrar el horario seleccionado
    for (const cartilla of document.getElementsByClassName("cartillaHorario")) {
        cartilla.addEventListener("click",({target}) => {
            for (const cartilla of document.getElementsByClassName("cartillaHorario")) {
                cartilla.style.border = "3px solid black"
            }
            if (target.localName == "h3" || target.localName == "p") {
                target.parentElement.style.border = "3px solid blue"
                // Asignar el objeto del horario seleccionado a la variable horarioSeleccionado
                horarioSeleccionado = peliculaSeleccionada.disponible.find((dia) => dia.nombre == target.parentElement.children[0].innerHTML)
            } else {
                target.style.border = "3px solid blue"
                horarioSeleccionado = peliculaSeleccionada.disponible.find((dia) => dia.nombre == target.children[0].innerHTML)
            }
        })
    }
}

// Evento y función para el botón que envia los objetos comprados al carrito
botonComprar.addEventListener("click",() => {
    if (peliculaSeleccionada && horarioSeleccionado) {
        let a = new(Date)
        let hora = `${a.getHours()}:${a.getMinutes()}:${a.getSeconds()}`
        carrito.push({
            nombre:peliculaSeleccionada.nombre,
            duracion:peliculaSeleccionada.duracion,
            horario:horarioSeleccionado.nombre,
            precio:horarioSeleccionado.precio,
            hora:hora
        })
        // Se almacena el carrito en el localStorage con cada actualización
        localStorage.setItem("cineCarrito", JSON.stringify(carrito))
        // Se informa al usuario que la pelicula se añadio al carrito usando la libreria "toastify"
        Toastify({
            text: "Pelicula añadida al carrito",
            gravity: "bottom",
            position: "right",
            duration: 3000
        }).showToast();
        resetearTablas()
        mostrarCarrito()
    } else if (!peliculaSeleccionada) {
        // Uso de las libreria "SweetAlert" para mostrar los errores que puedan ocurrir
        Swal.fire({
            icon: "error",
            title: "Por favor, seleccione una pelicula",
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Por favor, seleccione un horario",
        });
    }
})

// Mostrar los objetos en el carrito
function mostrarCarrito() {
    let insertar = ""
    // Ordenamos en carrito por orden de precio
    carrito.sort((a,b) => {
        return a.precio - b.precio
    })
    for (const objeto of carrito) {
        costoTotal += objeto.precio
        insertar += `
        <div class="cartillaCarrito">
            <h3 class="carritoNombre">${objeto.nombre}</h3>
            <div>
                <p class="carritoDuracion">${objeto.duracion}</p>
                <p class="carritoHorario">${objeto.horario}</p>
            </div>
            <div>
                <p class="carritoPrecio">$${objeto.precio}</p>
                <p class="carritoHora">${objeto.hora}</p>
            </div>
        </div>
        `
    }
    // Mostramos al final de carrito el total y el nombre del cliente
    totalCarritoDiv.innerHTML = `
        <h3>Costo total:</h3>
        <p>$${costoTotal}</p>
        <h3>Cuenta a nombre de:</h3>
        <p class="nombreComprador">${nombreComprador}</p>
    `
    sectionCarrito.innerHTML = insertar
}

// Confirmar la compra del carrito
botonConfirmar.addEventListener("click",() => {
    if (nombreComprador && costoTotal != 0) {
        // Se muestra la cuenta final
        Swal.fire({
            title: "<strong>SE HA COMPLETADO LA COMPRA</strong>",
            icon: "success",
            html: `
                <p>El costo totoal de la compra es de $${costoTotal} a nombre de ${nombreComprador}
            `,
            showCloseButton: true,
            confirmButtonText: `
              <i class="fa fa-thumbs-up"></i> Great!
            `,
            confirmButtonAriaLabel: "Thumbs up, great!"
        });
        // Se resetean todas las variables pertinentes para volver a iniciar el programa
        resetearTablas()
        carrito = []
        costoTotal = 0
        sectionCarrito.innerHTML = ""
        localStorage.removeItem("cineCarrito")
        mostrarCarrito()
    } else {
        if (!nombreComprador) {
            Swal.fire({
                icon: "error",
                title: "Por favor, ingrese su nombre para poder generar la boleta final",
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Para poder porcesar la compra debe haber algun objeto en el carrito",
            });
        }
    }
})

// Función para resetear las tablas y las selecciones
function resetearTablas() {
    peliculaSeleccionada = ""
    horarioSeleccionado = ""
    sectionHorarios.innerHTML = ""
    mostrarPeliculas()
}
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
let sectionPeliculas = document.getElementById("sectionPeliculas")
let sectionHorarios = document.getElementById("sectionHorarios")
let botonComprar = document.getElementById("botonComprar")
let botonConfirmar = document.getElementById("botonConfirmar")
let sectionCarrito = document.getElementById("carrito")
let totalCarrito = document.getElementById("costoTotal")
let totalCarritoDiv = document.getElementById("totalCarrito")
let inputDescuento = document.getElementById("descuento")
let outputDescuento = document.getElementById("descuentoActivo")

// Se define variables para posterior uso
let peliculaSeleccionada = ""
let horarioSeleccionado = ""
let costoTotal = 0
let costoFinal = 0
let descuentoValido = false
let inputValido = true
// Se define el carrito y el nombre tomandolos del localStorage en caso de existir
let carrito = JSON.parse(localStorage.getItem("cineCarrito")) || []
let comprador = JSON.parse(localStorage.getItem("cineComprador")) || []

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
            <p class="horarioPrecio">$${horario.precio}</p>
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
        carrito.push({
            nombre:peliculaSeleccionada.nombre,
            duracion:peliculaSeleccionada.duracion,
            horario:horarioSeleccionado.nombre,
            precio:horarioSeleccionado.precio,
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
        costoTotal = 0
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
            </div>
        </div>
        `
    }
    // Mostramos al final de carrito el total y modificamos en caso de un descuento
    if (descuentoValido) {
        totalCarritoDiv.innerHTML = `
        <h3>Costo total:</h3>
        <p>$${costoTotal} - $${costoTotal*0.2} = $${costoTotal*0.8}</p>
    `
    } else {
        totalCarritoDiv.innerHTML = `
            <h3>Costo total:</h3>
            <p>$${costoTotal}</p>
        `
    }
    sectionCarrito.innerHTML = insertar
}

// Confirmar la compra del carrito
botonConfirmar.addEventListener("click",async () => {
    // Tomamos el valor del costo final al momento de presionar el botón
    descuentoValido ? costoFinal = costoTotal * 0.8 : costoFinal = costoTotal
    if (costoTotal != 0) {
        // Se muestra el chekout final
        const promesaCarrito = await Swal.fire({
            title: "<strong>INGRESE SUS DATOS PARA COMPLETAR LA COMPRA:</strong>",
            icon: "warning",
            // Se usa un formulario para manejar varios inputs
            html: `
                <form>
                    <label>
                        <p>Nombre:</p>
                        <input type="text" id="swal-input1" value="${comprador[0] || ""}">
                    </label>
                    <label>
                        <p>Número de tarjeta:</p>
                        <input type="number" id="swal-input2" value="${comprador[1] || ""}">
                        <p id="swal-validation2"></p>
                    </label>
                    <label>
                        <p>Clave de la tarjeta:</p>
                        <input type="number" id="swal-input3" value="${comprador[2] || ""}">
                        <p id="swal-validation3"></p>
                    </label>
                    <label>
                        <p>email:</p>
                        <input type="email" id="swal-input4" value="${comprador[3] || ""}">
                    </label>
                </form>
            `,
            // Se usa didOpen para definir los eventos que mostrarán los mensajes en caso de un error de validación
            // Solo se validan los valores númericos para propositos de revisión
            // En un caso normal, se validarian con un Fetch la validez de todos los datos
            didOpen: () => {
                document.getElementById("swal-input2").addEventListener("change", ({target}) => {
                    if (target.value.length !== 12) {
                        inputValido = false
                        document.getElementById("swal-validation2").innerHTML = "El Número de tarjeta no es valido (debe tener 12 digitos)"
                        document.getElementById("swal-validation2").style.color = "red"
                    } else {
                        inputValido = true
                        document.getElementById("swal-validation2").innerHTML = ""
                    }
                })
                document.getElementById("swal-input3").addEventListener("change", ({target}) => {
                    if (target.value.length !== 3) {
                        inputValido = false
                        document.getElementById("swal-validation3").innerHTML = "La clave de la tarjeta no es valida (debe tener 3 digitos)"
                        document.getElementById("swal-validation3").style.color = "red"
                    } else {
                        inputValido = true
                        document.getElementById("swal-validation3").innerHTML = ""
                    }
                })
                // Tras definir los eventos, se hace una validación inicial para los datos traidos del localStorage
                if (comprador[1].length !== 12) {
                    inputValido = false
                    document.getElementById("swal-validation2").innerHTML = "El Número de tarjeta no es valido (debe tener 12 digitos)"
                    document.getElementById("swal-validation2").style.color = "red"
                }
                if (comprador[2].length !== 3) {
                    inputValido = false
                    document.getElementById("swal-validation3").innerHTML = "La clave de la tarjeta no es valida (debe tener 3 digitos)"
                    document.getElementById("swal-validation3").style.color = "red"
                }
            },
            // Al confirmar los datos, se recolectan sus valores en un array y se envian al localStorage
            preConfirm: () => {
                const a = [
                    document.getElementById("swal-input1").value,
                    document.getElementById("swal-input2").value,
                    document.getElementById("swal-input3").value,
                    document.getElementById("swal-input4").value
                ]
                comprador = a
                localStorage.setItem("cineComprador", JSON.stringify(a))
                // Si la validación de los datos fue positiva, se devuelve el array con las respuestas para su posterior uso
                // Si la validación fue negativa, le retorna false para evitar la confirmación de la compra
                if (!inputValido) {
                    return false
                } else {
                    return a
                }
            },
            showLoaderOnConfirm: true,
            showCancelButton: true,
            confirmButtonText: `
              Confirmar!
            `,
            confirmButtonAriaLabel: "Great!",
            cancelButtonText: `
              Cancelar
            `,
            cancelButtonAriaLabel: "Cancelar"
        });
        // Se resetean todas las variables pertinentes para volver a iniciar el programa si se acepta el Checkout
        if (promesaCarrito.isConfirmed) {
            // Se manda un ultimo Swal para notificar de que se proceso la compra
            Swal.fire({
                title: "<strong>MUCHAS GRACIAS POR SU COMPRA</strong>",
                icon: "success",
                html: `
                    Compra realizada por ${promesaCarrito.value[0]} por un valor de $${costoFinal}.</br>
                    Boleta enviada a ${promesaCarrito.value[3]}
                `
            })
            resetearTablas()
            carrito = []
            costoTotal = 0
            sectionCarrito.innerHTML = ""
            localStorage.removeItem("cineCarrito")
            mostrarCarrito()
        }
    } else {
        Swal.fire({
            icon: "error",
            title: "Para poder porcesar la compra debe haber algun objeto en el carrito",
        });
    }
})

// Función y evento para manejar el timer del descuento.
// Para motivos de revisión, todo input con más de 3 letras se considera valido
inputDescuento.addEventListener("change",({target}) => {
    if (target.value.length == "") {
        outputDescuento.innerHTML = "Actualmente no hay ningun descuento aplicado"
        outputDescuento.style.color = "black"
    // El codigo a ejecutar si las validaciones son correctas
    } else if (target.value.length >= 3) {
        // Desabilitamos el input, pues el cupon ya es valido
        inputDescuento.disabled = true
        descuentoValido = true
        // Mostramos el carrito para palicar los cambios necesarios por el descuento
        mostrarCarrito()
        const descuentoTimer = 20
        // Al cabo de 20 segundos, se desactiva el descuento
        setTimeout(()=> {
            clearInterval(intervaloDescuento)
            descuentoValido = false
            outputDescuento.innerHTML = "Actualmente no hay ningun descuento aplicado"
            outputDescuento.style.color = "black"
            inputDescuento.disabled = false
            mostrarCarrito ()
        },descuentoTimer*1000 + 1000)
        // Definimos un intervalo para la cuento regresiva
        const intervaloDescuento = setInterval(() => {
            outputDescuento.innerHTML = `El cupón aplicado es valido duranto los proximos ${descuentoTimer} segundos`
            outputDescuento.style.color = "green"
            descuentoTimer --
        },1000)
    } else {
        outputDescuento.innerHTML = "El cupón ingresado no es valido"
        outputDescuento.style.color = "red"
    }
})

// Función para resetear las tablas y las selecciones
function resetearTablas() {
    peliculaSeleccionada = ""
    horarioSeleccionado = ""
    sectionHorarios.innerHTML = ""
    mostrarPeliculas()
}
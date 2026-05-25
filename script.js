// --- INICIALIZACIÓN DEL CARRITO DESDE LOCALSTORAGE ---
let carrito = JSON.parse(localStorage.getItem('carrito_angeles')) || [];

// --- FUNCIÓN GUARDAR ---
function guardarCarrito() {
    localStorage.setItem('carrito_angeles', JSON.stringify(carrito));
}

// --- AGREGAR PRODUCTO DESDE EL MENÚ TRADICIONAL ---
function agregarDelMenu(nombre, precio) {
    // Verificar si el producto ya está en el carrito
    let itemExistente = carrito.find(item => item.nombre === nombre && item.tipo === 'menu');

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            nombre: nombre,
            precio: parseFloat(precio),
            cantidad: 1,
            tipo: 'menu',
            detalles: 'Pastel tradicional de vitrina'
        });
    }
    
    guardarCarrito();
    alert(`¡${nombre} agregado con éxito al carrito!`);
}

// --- CAPTURA DE FORMULARIO DE PASTEL PERSONALIZADO ---
const formPersonalizado = document.getElementById('form-personalizado');
if (formPersonalizado) {
    formPersonalizado.addEventListener('submit', function(e) {
        e.preventDefault();

        // Obtener valores seleccionados
        const tamanoSeleccionado = document.getElementById('tamano').value;
        const pan = document.getElementById('pan').value;
        const relleno = document.getElementById('relleno').value;
        const cobertura = document.getElementById('cobertura').value;
        const notas = document.getElementById('detalles').value;

        // Extraer precio del string del select (Ej: "Mediano... - $500" -> 500)
        const precioBase = parseFloat(tamanoSeleccionado.split('$')[1]);
        const tamanoNombre = tamanoSeleccionado.split(' - ')[0];

        const descripcionDetallada = `Pan: ${pan}, Relleno: ${relleno}, Cobertura: ${cobertura}.${notas ? ' Nota: ' + notas : ''}`;

        // Estructura del pastel personalizado
        const pastelCustom = {
            id: 'CUSTOM-' + Date.now(),
            nombre: `Pastel Personalizado (${tamanoNombre})`,
            precio: precioBase,
            cantidad: 1,
            tipo: 'personalizado',
            detalles: descripcionDetallada
        };

        carrito.push(pastelCustom);
        guardarCarrito();

        alert('¡Tu pastel personalizado ha sido añadido al carrito!');
        formPersonalizado.reset();
        window.location.href = 'carrito.html'; // Redirección automática
    });
}

// --- RENDERIZADO DINÁMICO DE LA PÁGINA DEL CARRITO ---
function renderizarInterfazCarrito() {
    const contenedor = document.getElementById('contenedor-carrito');
    if (!contenedor) return; // Salir si no estamos en carrito.html

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="carrito-vacio-msg">
                <p>Tu carrito está vacío. ¡Ve a nuestro menú y déjate tentar!</p>
                <br>
                <a href="menu.html" class="btn">Ver Menú</a>
            </div>
        `;
        return;
    }

    let tablaHTML = `
        <table class="tabla-carrito">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Detalles / Descripción</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalGeneral = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalGeneral += subtotal;

        tablaHTML += `
            <tr>
                <td style="font-weight: 600; color: var(--color-principal);">${item.nombre}</td>
                <td style="font-size: 0.85rem; color: #555;">${item.detalles}</td>
                <td>$${item.precio.toFixed(2)}</td>
                <td>
                    <input type="number" min="1" value="${item.cantidad}" 
                           style="width: 50px; padding: 0.2rem;" 
                           onchange="cambiarCantidad('${item.id}', this.value)">
                </td>
                <td style="font-weight: 600;">$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" 
                            onclick="eliminarItem('${item.id}')">Eliminar</button>
                </td>
            </tr>
        `;
    });

    tablaHTML += `
            </tbody>
        </table>
        
        <div class="total-container">
            Total General: $${totalGeneral.toFixed(2)} MXN
        </div>

        <div class="acciones-carrito">
            <button class="btn btn-danger" onclick="vaciarCarrito()">Vaciar Todo el Carrito</button>
            <button class="btn" style="background-color: #25d366;" onclick="checkoutWhatsApp(${totalGeneral})">
                Confirmar Pedido por WhatsApp
            </button>
        </div>
    `;

    contenedor.innerHTML = tablaHTML;
}

// --- MODIFICAR CANTIDADES DINÁMICAMENTE ---
function cambiarCantidad(id, nuevaCantidad) {
    const cantidadInt = parseInt(nuevaCantidad);
    if (cantidadInt < 1 || isNaN(cantidadInt)) return;

    const item = carrito.find(prod => prod.id === id);
    if (item) {
        item.cantidad = cantidadInt;
        guardarCarrito();
        renderizarInterfazCarrito(); // Recarga la vista reflejando cambios
    }
}

// --- ELIMINAR ITEM ---
function eliminarItem(id) {
    carrito = carrito.filter(prod => prod.id !== id);
    guardarCarrito();
    renderizarInterfazCarrito();
}

// --- VACIAR CARRITO ---
function vaciarCarrito() {
    if(confirm('¿Seguro que deseas vaciar tu lista de compras?')) {
        carrito = [];
        guardarCarrito();
        renderizarInterfazCarrito();
    }
}

// --- PROCESAR PEDIDO ENVIANDO DETALLES A WHATSAPP ---
function checkoutWhatsApp(total) {
    let mensaje = `🍰 *NUEVO PEDIDO DESDE LA WEB - Pastelería de todos los Ángeles* 🍰\n\n`;
    
    carrito.forEach((item, index) => {
        mensaje += `*${index + 1}. ${item.nombre}* (x${item.cantidad})\n`;
        mensaje += `   _Especificaciones:_ ${item.detalles}\n`;
        mensaje += `   _Subtotal:_ $${(item.precio * item.cantidad).toFixed(2)}\n\n`;
    });

    mensaje += `🏁 *TOTAL A PAGAR:* $${total.toFixed(2)} MXN\n`;
    mensaje += `Por favor indíquenme los métodos de pago y fecha de entrega. ¡Gracias!`;

    // Codificar texto para URL de navegador
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Reemplaza con tu número telefónico real (incluyendo código de país sin el signo '+')
    const numeroTelefono = "521234567890"; 
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${mensajeCodificado}`;

    window.open(urlWhatsApp, '_blank');
}
const socket = io();

// Sockets

socket.on("deliverProducts", (data) => {
  let products = data.payload;
  fetch("templates/products.hbs")
    .then((string) => string.text())
    .then((template) => {
      const processedTemplate = Handlebars.compile(template);
      const templateObject = {
        products: products,
      };
      const html = processedTemplate(templateObject);
      let div = document.getElementById("productsExisting");
      div.innerHTML = html;
    })
    .then(() => {
      const buttonsEdit = document.querySelectorAll("#editarFormulario");
      buttonsEdit.forEach((button) => {
        button.addEventListener("click", editarFormulario);
      });
      const buttonsDelete = document.querySelectorAll("#borrarFormulario");
      buttonsDelete.forEach((button) => {
        button.addEventListener("click", borrarFormulario);
      });
      const buttonsAddCart = document.querySelectorAll("#agregarCarrito");
      buttonsAddCart.forEach((button) => {
        button.addEventListener("click", agregarCarrito);
      });
    });
});

socket.on("createCarts", (data) => {
  let productos = data.payload.productos;
  fetch("templates/cart.hbs")
    .then((string) => string.text())
    .then((template) => {
      const processedTemplate = Handlebars.compile(template);
      const templateObject = {
        productosLength: productos.length,
        productos: productos,
      };
      const html = processedTemplate(templateObject);
      let div = document.getElementById("cartProductsExisting");
      div.innerHTML = html;
    })
    .then(() => {
      document
        .getElementById("cartProductsExisting")
        .setAttribute("data-key", data.payload.id);
      const buttonsDeleteProduct = document.querySelectorAll("#borrarProducto");
      buttonsDeleteProduct.forEach((button) => {
        button.addEventListener("click", borrarProductoCarrito);
      });
      const buttonsDeleteCart = document.querySelectorAll("#borrarCarrito");
      buttonsDeleteCart.forEach((button) => {
        button.addEventListener("click", borrarCarrito);
      });
    });
});

const inputUsername = document.getElementById("inputUsername");
const inputMensaje = document.getElementById("inputMensaje");
const btnEnviar = document.getElementById("btnEnviar");

const enviarMensajeId = document.getElementById("formPublicarMensaje");
enviarMensajeId.addEventListener("submit", enviarMensaje);

function enviarMensaje(event) {
  event.preventDefault();
  const mensaje = { autor: inputUsername.value, texto: inputMensaje.value };
  socket.emit("nuevoMensaje", mensaje);
  formPublicarMensaje.reset();
  inputMensaje.focus();
}

socket.on("mensajes", (mensajes) => {
  const html = makeHtmlList(mensajes.payload);
  document.getElementById("chatMessages").innerHTML = html;
});

// fin Sockets
function makeHtmlList(mensajes) {
  return mensajes
    .map((mensaje) => {
      return `
              <div>
                  <b style="color:blue;">${mensaje.autor}</b>
                  [<span style="color:brown;">${mensaje.date}</span>] :
                  <i style="color:green;">${mensaje.texto}</i>
              </div>
          `;
    })
    .join(" ");
}

inputUsername.addEventListener("input", () => {
  const hayEmail = inputUsername.value.length;
  const hayTexto = inputMensaje.value.length;
  inputMensaje.disabled = !hayEmail;
  btnEnviar.disabled = !hayEmail || !hayTexto;
});

inputMensaje.addEventListener("input", () => {
  const hayTexto = inputMensaje.value.length;
  btnEnviar.disabled = !hayTexto;
});

const enviarFormularioId = document.getElementById("productsForm");
enviarFormularioId.addEventListener("submit", enviarFormulario);

const enviarFormularioEditadoId = document.getElementById("updateProductsForm");
enviarFormularioEditadoId.addEventListener("submit", enviarFormularioEditado);

function enviarFormulario(event) {
  event.preventDefault();
  let form = document.getElementById("productsForm");
  let data = new FormData(form);
  fetch("/api/productos", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(data)),
    headers: { "Content-Type": "application/json" },
  })
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      console.log("JSON:", json);
      console.log("EXITO!");
    });
}

function enviarFormularioEditado(event) {
  event.preventDefault();
  let form = document.getElementById("updateProductsForm");

  let id = form.getAttribute("data-key");
  let data = new FormData(form);

  fetch("/api/productos/" + id, {
    method: "PUT",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.get("editar-title"),
      price: data.get("editar-price"),
      thumbnail: data.get("editar-thumbnail"),
    }),
  })
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      console.log(json);
    });


  document.getElementById("productsForm").style = "display:block";
  document.getElementById("updateProductsForm").style = "display:none";

  document.getElementById("updateProductsForm").removeAttribute("data-key");
  document.getElementsByName("editar-title")[0].value = "";
  document.getElementsByName("editar-price")[0].value = "";
  document.getElementsByName("editar-thumbnail")[0].value = "";
}

async function editarFormulario(event) {
  event.preventDefault();
  console.log("editando...");

  const productId =
    event.target.parentElement.parentElement.getAttribute("data-key");

  const data = await fetch("/api/productos/" + productId, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      console.log("EXITO!");
      console.log(json);
      return json;
    });
  
  
  document.getElementById("productsForm").style = "display:none";
  document.getElementById("updateProductsForm").style = "display:block";

  document
    .getElementById("updateProductsForm")
    .setAttribute("data-key", data.id);
  document.getElementsByName("editar-title")[0].value = data.title;
  document.getElementsByName("editar-price")[0].value = data.price;
  document.getElementsByName("editar-thumbnail")[0].value = data.thumbnail;
}

function borrarFormulario(event) {
  console.log("borrando...");
  const productId =
    event.target.parentElement.parentElement.getAttribute("data-key");

  fetch("/productos/" + productId, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      console.log("JSON:", json.message);
      console.log("DELETE EXITO!");
    })
    .catch((err) => console.log(err));
}

async function agregarCarrito(event) {
  console.log("agregando...");
  const productId =
    event.target.parentElement.parentElement.getAttribute("data-key");
  const carritoId = document.getElementById("cartProductsExisting").getAttribute("data-key");

  const productData = await fetch("/api/productos/" + productId, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      return result.json();
    })
    .catch((err) => console.log(err));

  await fetch("/api/carrito/" + carritoId + "/productos",{
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: productData.title,
      precio: productData.price,
      thumbnail: productData.thumbnail
    }),
  })
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      console.log("JSON:", json);
      console.log("AGREGADO EXITO!");
    })
    .catch((err) => console.log(err));
}

function borrarProductoCarrito (event) {
  console.log("borrando...");

  const carritoId = document.getElementById("cartProductsExisting").getAttribute("data-key");
  const productoId = event.target.parentElement.parentElement.getAttribute("data-key");
  fetch("/api/carrito/" + carritoId + "/productos/" + productoId,{
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      console.log("JSON:", json);
      console.log("BORRADO DE PRODUCTO EXITO!");
    })
    .catch((err) => console.log(err));
}

function borrarCarrito () {
  console.log("borrando carrito...");

  const carritoId = document.getElementById("cartProductsExisting").getAttribute("data-key");

  fetch("/api/carrito/" + carritoId,{
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      console.log("JSON:", json);
      console.log("BORRADO EXITO!");
    })
    .catch((err) => console.log(err));
}
//----------------CARRITO--------------//

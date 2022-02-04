const express = require("express");
const cors = require("cors");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const minimist = require("minimist");
const dotenv = require("dotenv");
dotenv.config();

let minimazedArgs = minimist(process.argv.slice(2));
let config = {
  port: minimazedArgs.p || 8080,
  debug: minimazedArgs.d || false,
  mode: minimazedArgs.m || "dev",
  others: minimazedArgs._,
};

let info = {
  path: process.cwd(),
  process_id: process.pid,
  version_node: process.version,
  title_process: process.title,
  operative_sistem: process.platform,
  memory_usage: process.memoryUsage(),
  project_folder: __dirname,
};

const ProductManager = require("./class/manager");
const MessageManager = require("./class/managerMensajes");
const CartManager = require("./class/managerCarrito");

const app = express();
const PORT = process.env.PORT || config.port;

const manager = new ProductManager();
const managerMensajes = new MessageManager();
const managerCarrito = new CartManager();

const server = app.listen(PORT, () => {
  console.log("Escuchando en el puerto " + PORT);
});
console.log(process.env.NODE_ENV);
console.log(info);
console.log(config);

server.on("error", (error) => console.log(`Error en servidor ${error}`));
const io = new Server(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());
app.use(express.static("public"));
app.engine(
  "hbs",
  handlebars({
    extname: ".hbs",
    defaultLayout: "index.hbs",
  })
);
app.set("view engine", "hbs");
app.set("views", "./views");

// ADMINISTRADOR => Middleware de autenticacion para rutas
const authMiddleware = (req, res, next) => {
  const admin = true;
  if (!admin) {
    return res
      .status(403)
      .send({ error: -1, message: "Ruta no autorizada para usuarios" });
  }
  next();
};

app.get("/info", (req, res) => {
  res.render("info", {
    info: { ...info, ...config },
  });
});


app.get("/api/randoms", (req, res) => {

});

// CRUD - PRODUCTOS

app.get("/api/productos", (req, res) => {
  manager.getAll().then((result) => {
    if (result.status === "success") {
      res.status(200).send(result.payload);
    } else {
      res.status(500).send(result);
    }
  });
});

app.get("/api/productos/:id", async (req, res) => {
  const id = req.params.id;
  await manager.getById(id).then(async (result) => {
    if (result.status === "success") {
      res.status(200).send(result.payload);
    } else {
      res.status(500).send(result.message);
    }
  });
});

app.post("/api/productos", authMiddleware, async (req, res) => {
  const { title, price, thumbnail } = req.body;
  await manager.save({ title, price, thumbnail }).then(async (result) => {
    if (result.status === "success") {
      res.status(200).send(result.payload);
    } else {
      res.status(500).send(result.message);
    }
  });
  io.sockets.emit("deliverProducts", await manager.getAll());
});

app.put("/api/productos/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  await manager.updateProduct(id, body).then((result) => {
    if (result.status === "success") {
      res.status(200).send({ message: result.message });
    } else {
      res.status(500).send({ message: result.message });
    }
  });
  io.sockets.emit("deliverProducts", await manager.getAll());
});

app.delete("/productos/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  await manager.deletedById(id).then((result) => {
    if (result.status === "success") {
      res.status(200).send({ message: result.message });
    } else {
      res.status(500).send({ message: result.message });
    }
  });
  io.sockets.emit("deliverProducts", await manager.getAll());
});

// CRUD - CARRITO

app.get("/api/carrito/:id/productos", async (req, res) => {
  const id = req.params.id;
  await managerCarrito.getById(id).then((result) => {
    if (result.status === "success") {
      res.status(200).send(result.payload);
    } else {
      res.status(500).send(result.message);
    }
  });
});

app.post("/api/carrito/", (req, res) => {
  managerCarrito.createCart().then((result) => {
    if (result.status === "success") {
      res.status(200).send(result.payload);
    } else {
      res.status(500).send(result.message);
    }
  });
});

app.post("/api/carrito/:id/productos", (req, res) => {
  const id = req.params.id;
  const { nombre, precio, thumbnail } = req.body;
  managerCarrito
    .save(id, { nombre, precio, thumbnail })
    .then((result) => {
      if (result.status === "success") {
        res.status(200).send(result.payload);
      } else {
        res.status(500).send(result.message);
      }
    })
    .then(async () => {
      const cart = await managerCarrito.getById(id);
      io.sockets.emit("createCarts", cart);
    });
});

app.delete("/api/carrito/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  await managerCarrito
    .deleteAll(id)
    .then((result) => {
      if (result.status === "success") {
        res.status(200).send(result);
      } else {
        res.status(500).send(result);
      }
    })
    .then(async () => {
      const cart = await managerCarrito.createCart();
      io.sockets.emit("createCarts", cart);
    });
});

app.delete("/api/carrito/:id/productos/:id_prod", (req, res) => {
  const { id, id_prod } = req.params;
  console.log(id, id_prod);
  managerCarrito
    .deletedById(id, id_prod)
    .then((result) => {
      if (result.status === "success") {
        res.status(200).send(result);
      } else {
        res.status(500).send(result);
      }
    })
    .then(async () => {
      const cart = await managerCarrito.getById(id);
      io.sockets.emit("createCarts", cart);
    });
});

//socket
io.on("connection", async (socket) => {
  console.log(`El socket ${socket.id} se ha conectado`);
  let products = await manager.getAll();

  socket.emit("deliverProducts", products);
  socket.emit("createCarts", await managerCarrito.createCart());
  socket.emit("mensajes", await managerMensajes.getAll());
  socket.on("nuevoMensaje", async (mensaje) => {
    await managerMensajes.save(mensaje);
    io.sockets.emit("mensajes", await managerMensajes.getAll());
  });
});

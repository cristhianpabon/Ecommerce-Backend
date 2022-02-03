const fs = require("fs");

class MessageManager {
  constructor() {
    this.id = 1;
  }

  async save(mensaje) { 
    try {
      let data = await fs.promises.readFile("files/mensajes.txt", "utf-8");
      let mensajes = JSON.parse(data);
        console.log(mensajes);
      let nuevoMensaje = {
        id: this.setId(),
        autor: mensaje.autor,
        date: new Date(),
        texto: mensaje.texto,
      };
      mensajes.push(nuevoMensaje);
      try {
        await fs.promises.writeFile(
          "files/mensajes.txt",
          JSON.stringify(mensajes, null, 2)
        );
        return { status: "success", payload: nuevoMensaje.id };
      } catch (error) {
        return {
          status: "error",
          message: "No se pudo guardar el mensaje: " + error,
        };
      }
    } catch {
      let nuevoMensaje = {
        id: this.setId(),
        autor: mensaje.autor,
        date: new Date(),
        texto: mensaje.texto,
      };
      try {
        await fs.promises.writeFile(
          "files/mensajes.txt",
          JSON.stringify([nuevoMensaje], null, 2)
        );

        return { status: "success", payload: nuevoMensaje.id };
      } catch (error) {
        return {
          status: "error",
          message: "No se pudo crear el archivo:" + error,
        };
      }
    }
  }

  async getAll() {
    try {
      let data = await fs.promises.readFile("files/mensajes.txt", "utf-8");
      let mensajes = JSON.parse(data);
      if (mensajes) {
        return { status: "success", payload: mensajes };
      }
    } catch (error) {
      return {
        status: "error",
        message: "No se encontro los mensajes: " + error,
      };
    }
  }

  async deleteAll() {
    try {
      await fs.promises.writeFile("files/mensajes.txt", "");
      return "Se ha borrado todo";
    } catch (error) {
      return "No se encontro el archivo: " + error;
    }
  }

  setId() {
    return Date.now().toString();
  }
}

module.exports = MessageManager;

// productManager
//   .save({
//     title: "9999",
//     price: "220",
//     thumbnail: "https://picsum.photos/200",
//   })
//   .then((response) => console.log(response));

// productManager.getById(1636083611395).then((response) => console.log(response));

// productManager.getAll().then((response) => console.log(response));

// productManager.deletedById(1636083611395).then((response) => console.log(response));

// productManager.deleteAll().then((response) => console.log(response));

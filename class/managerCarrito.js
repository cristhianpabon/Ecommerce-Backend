const fs = require("fs");

class CartManager {
  constructor() {
    this.id = 1;
  }

  async save(cartId, product) {
    try {
      let data = await fs.promises.readFile("files/carritos.txt", "utf-8");
      let carts = JSON.parse(data);
      let cart = carts.find((cart) => cart.id === cartId);
      if (!cart) {
        return {
          status: "error",
          message: "El carrito con el " + cartID + " no existe",
        };
      }
      if (
        cart.productos.some(
          (currentProduct) => currentProduct.nombre === product.nombre
        )
      ) {
        return { status: "error", message: "El producto ya existe" };
      } else {
        let dataObject = {
          id: this.setId(),
          timestamp: Date.now(),
          nombre: product.nombre,
          precio: product.precio,
          thumbnail: product.thumbnail,
        };
        cart.productos.push(dataObject);
        let newCarts = carts
          .map((currentCart) => {
            if (currentCart.id !== cart.id) return currentCart;
          })
          .filter(Boolean);

        newCarts.push(cart);
        try {
          await fs.promises.writeFile(
            "files/carritos.txt",
            JSON.stringify(newCarts, null, 2)
          );

          return { status: "success", payload: { id: dataObject.id } };
        } catch (error) {
          return {
            status: "error",
            message: "No se pudo guardar el producto: " + error,
          };
        }
      }
    } catch (error) {
      return {
        status: "error",
        message: "No se pudo guardar el producto: " + error,
      };
    }
  }

  async createCart() {
    let dataObject = {
      id: this.setId(),
      timestamp: Date.now(),
      productos: [],
    };

    try {
      let data = await fs.promises.readFile("files/carritos.txt", "utf-8");
      let carts = JSON.parse(data);

      carts.push(dataObject);
      await fs.promises.writeFile(
        "files/carritos.txt",
        JSON.stringify(carts, null, 2)
      );

      return { status: "success", payload: dataObject };
    } catch {
      try {
        await fs.promises.writeFile(
          "files/carritos.txt",
          JSON.stringify([dataObject], null, 2)
        );

        return { status: "success", payload: dataObject };
      } catch (error) {
        return {
          status: "error",
          message: "No se pudo crear el archivo:" + error,
        };
      }
    }
  }

  async getById(id) {
    try {
      let data = await fs.promises.readFile("files/carritos.txt", "utf-8");
      let carts = JSON.parse(data);

      let cart = carts.find((cart) => cart.id == id);
      if (cart) {
        return { status: "success", payload: cart };
      }
    } catch (error) {
      return {
        status: "error",
        message: "No se encontro el producto: " + error,
      };
    }
  }

  async getRandom() {
    try {
      let data = await fs.promises.readFile("files/productos.txt", "utf-8");
      let products = JSON.parse(data);
      if (products) {
        return products[Math.floor(Math.random() * products.length)];
      }
    } catch (error) {
      return "No se encontro el producto:" + error;
    }
  }

  async deletedById(cartId, productId) {
    console.log(cartId, productId);
    try {
      let data = await fs.promises.readFile("files/carritos.txt", "utf-8");
      let carts = JSON.parse(data);
      let cart = carts.find((cart) => cart.id === cartId);

      let newProducts = cart.productos
        .map((currentProduct) => {
          if (currentProduct.id !== productId) return currentProduct;
        })
        .filter(Boolean);

      cart.productos = newProducts;
      let newCarts = carts
        .map((currentCart) => {
          if (currentCart.id !== cart.id) return currentCart;
        })
        .filter(Boolean);

      newCarts.push(cart);
      await fs.promises.writeFile(
        "files/carritos.txt",
        JSON.stringify(newCarts, null, 2)
      );
      return { status: "success", message: "Se ha un producto borrado por ID" };
    } catch (error) {
      return {
        status: "success",
        message: "No se ha borrado el producto: " + error,
      };
    }
  }

  async deleteAll(id) {
      
    try {
      let data = await fs.promises.readFile("files/carritos.txt", "utf-8");
      let carts = JSON.parse(data);
      let cart = carts.find((cart) => cart.id === id);

      if (!cart) {
        return {
          status: "error",
          message: "El carrito no existe en el archivo"
        };
      }
      let newCarts = carts
        .map((currentCart) => {
          if (currentCart.id !== id) return currentCart;
        })
        .filter(Boolean);
      await fs.promises.writeFile(
        "files/carritos.txt",
        JSON.stringify(newCarts, null, 2)
      );
      return { status: "success", message: "Se ha borrado el carrito" };
    } catch (error) {
      return {
        status: "error",
        message: "No se encontro el archivo: " + error,
      };
    }
  }

  setId() {
    return Date.now().toString();
  }
}

module.exports = CartManager;

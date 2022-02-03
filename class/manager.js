const fs = require("fs");

class ProductManager {
  constructor() {
    this.id = 1;
  }

  async save(product) {
    try {
      let data = await fs.promises.readFile("files/productos.txt", "utf-8");
      let products = JSON.parse(data);
      if (
        products.some(
          (currentProduct) => currentProduct.title === product.title
        )
      ) {
        return {status: "error", message: "El producto ya existe"};
      } else {
        let dataObject = {
          id: this.setId(),
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
        };
        products.push(dataObject);
        try {
          await fs.promises.writeFile(
            "files/productos.txt",
            JSON.stringify(products, null, 2)
          );

          return {status: "success", payload: {id: dataObject.id}};
        } catch (error) {
          return {status: "error", message: "No se pudo guardar el producto: " + error};
        }
      }
    } catch {
      let dataObject = {
        id: this.setId(),
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
      };
      try {
        await fs.promises.writeFile(
          "files/productos.txt",
          JSON.stringify([dataObject], null, 2)
        );

        return {status: "success", payload: dataObject.id};
      } catch (error) {
        return {status: "error", message: "No se pudo crear el archivo:" + error};
      }
    }
  }

  async getById(id) {
    try {
      let data = await fs.promises.readFile("files/productos.txt", "utf-8");
      let products = JSON.parse(data);

      let product = products.find((product) => product.id == id);
      if (product) {
        return {status: "success", payload: product};
      }
    } catch (error) {
      return {status: "error", message: "No se encontro el producto: " + error};
    }
  }

  async getByTitle(title) {
    try {
      let data = await fs.promises.readFile("files/productos.txt", "utf-8");
      let products = JSON.parse(data);

      let product = products.find((product) => product.title == title);
      if (product) {
        return {status: "success", payload: product};
      }
    } catch (error) {
      return {status: "error", message: "No se encontro el producto: " + error};
    }
  }

  async getAll() {
    try {
      let data = await fs.promises.readFile("files/productos.txt", "utf-8");
      let products = JSON.parse(data);
      if (products) {
        return {status: "success", payload: products};
      }
    } catch (error) {
      return {status: "error", message:"No se encontro el producto:" + error};
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
  async updateProduct(id,body){
      try{
          let data = await fs.promises.readFile('files/productos.txt','utf-8');
          let products = JSON.parse(data);
          if(!products.some(pt=>pt.id===id)) return {status:"error", message:"No hay product con el id especificado"}
          let result = products.map(product=>{
              if(product.id===id){
                      body = Object.assign({id:product.id,...body});
                      return body;
              }else{
                  return product;
              }
          })
          try{
              await fs.promises.writeFile('files/productos.txt',JSON.stringify(result,null,2));
              return {status:"success", message:"product actualizado"}
          }catch{
              return {status:"error", message:"Error al actualizar la product"}
          }
      }catch(error){
          return {status:"error",message:"Fallo al actualizar la product: "+error}
      }
  }

  async deletedById(id) {
    try {
      let data = await fs.promises.readFile("files/productos.txt", "utf-8");
      let products = JSON.parse(data);
      let product = products.find((product) => product.id === id);

      let newProducts = products
        .map((currentProduct) => {
          if (currentProduct.id !== product.id) return currentProduct;
        })
        .filter(Boolean);
      await fs.promises.writeFile(
        "files/productos.txt",
        JSON.stringify(newProducts, null, 2)
      );
      return {status: "success", message: "Se ha borrado por ID"};
    } catch (error) {
      return  {status: "success", message: "No se ha borrado el producto: " + error};
    }
  }

  async deleteAll() {
    try {
      await fs.promises.writeFile("files/productos.txt", "");
      return "Se ha borrado todo";
    } catch (error) {
      return "No se encontro el archivo: " + error;
    }
  }

  setId() {
    return Date.now().toString();
  }
}

module.exports = ProductManager;

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

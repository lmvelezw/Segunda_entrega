import cartsModel from "../models/carts.model.js";

class Carts {
  async getCarts() {
    try {
      let carts = await cartsModel.find();
      return carts;
    } catch (error) {
      console.log("err", error);
    }
  }

  async getCartByID(id) {
    try {
      let cart = await cartsModel.findById(id).populate("products.product");
      let cartsInfo = cart.toObject();
      return cartsInfo;
    } catch (error) {
      console.log("err", error);
    }
  }

  async createCart() {
    try {
      let result = cartsModel.create({});
      return result;
    } catch (error) {
      console.log("err", error);
    }
  }

  async createProductInCart(cid, pid, quantity) {
    try {
      let updatedCart = await cartsModel.findOneAndUpdate(
        { _id: cid, "products.product": pid },
        { $inc: { "products.$.quantity": parseInt(quantity) } },
        { new: true }
      );

      if (!updatedCart) {
        let cartExists = await cartsModel.findById({ _id: cid });

        if (!cartExists) {
          throw new Error("Cart not found");
        }

        cartExists.products.push({ product: pid, quantity: quantity });
        updatedCart = await cartExists.save();
      }

      return updatedCart;
    } catch (error) {
      console.log("err", error);
    }
  }

  async addMultipleProductsToCart(cid, products) {
    try {
      let cartExists = await cartsModel.findById({ _id: cid });

      if (!cartExists) {
        return res.send({ result: "error", error: "Cart not found" });
      }
      cartExists.products.push(...products);
      let updatedCart = await cartExists.save();
      return updatedCart;
    } catch (error) {
      console.log("err", error);
    }
  }

  async deleteCart(id) {
    try {
      let result = await cartsModel.updateOne(
        { _id: id },
        { $set: { products: [] } }
      );
      return result;
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }

  async deleteProductInCart(cid, pid) {
    try {
      let cartExists = await cartsModel.findById(cid);
      if (!cartExists) {
        throw new Error("Cart not found");
      }
      cartExists.products = cartExists.products.filter(
        (prod) => prod.product.toString() !== pid
      );

      let updatedCart = await cartExists.save();

      return updatedCart;
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }
}

export default Carts;

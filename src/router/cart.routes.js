import { Router } from "express";
import cartsModel from "../models/carts.model.js";

const cartRouter = Router();

cartRouter.get("/", async (req, res) => {
  try {
    let carts = await cartsModel.find();
    res.send({ result: "success", payload: carts });
  } catch (error) {
    console.log(error);
  }
});

cartRouter.get("/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let cart = await cartsModel.findById(id).populate("products.product");

    const cartsInfo = cart.toObject();
    console.log(cartsInfo);

    res.render("cartProducts", {
      cartsInfo,
    });
  } catch (error) {
    console.log(error);
  }
});

cartRouter.post("/", async (req, res) => {
  let result = await cartsModel.create({});
  res.send({ result: "success", payload: result });
});

cartRouter.put("/:cid", async (req, res) => {
  let { cid } = req.params;
  let products = req.body;

  try {
    let cartExists = await cartsModel.findById({ _id: cid });

    if (!cartExists) {
      return res.send({ result: "error", error: "Cart not found" });
    }
    cartExists.products.push(...products);

    let updatedCart = await cartExists.save();
    return res.send({
      result: "success",
      payload: updatedCart,
    });
  } catch (error) {
    console.error(error);
    return res.send({ result: "error", error: "Internal server error" });
  }
});

cartRouter.put("/:cid/product/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  let quantity = req.body.quantity;

  try {
    if (!cid || !pid || !quantity) {
      return res.send({
        status: "error",
        error: "Missing product, cart, or quantity",
      });
    }

    let updatedCart = await cartsModel.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $inc: { "products.$.quantity": parseInt(quantity) } },
      { new: true }
    );

    if (!updatedCart) {
      let cartExists = await cartsModel.findById({ _id: cid });

      if (!cartExists) {
        return res.send({ result: "error", error: "Cart not found" });
      }

      cartExists.products.push({ product: pid, quantity: quantity });
      updatedCart = await cartExists.save();
    }

    return res.send({
      result: "success",
      payload: updatedCart,
    });
  } catch (error) {
    console.error(error);
    return res.send({ result: "error", error: "Internal server error" });
  }
});

cartRouter.delete("/:id", async (req, res) => {
  try {
    let { id } = req.params;

    let result = await cartsModel.updateOne(
      { _id: id },
      { $set: { products: [] } }
    );
    res.send({ result: "success", payload: result });
  } catch (error) {
    return res.send({ status: "error", error: "Internal server error" });
  }
});

cartRouter.delete("/:cid/product/:pid", async (req, res) => {
  let { cid, pid } = req.params;

  try {
    if (!cid || !pid) {
      return res.send({ status: "error", error: "Invalid cart or product ID" });
    }

    let cartExists = await cartsModel.findById(cid);

    if (!cartExists) {
      return res.send({ status: "error", error: "Cart not found" });
    }

    cartExists.products = cartExists.products.filter(
      (prod) => prod.product.toString() !== pid
    );

    let updatedCart = await cartExists.save();

    return res.send({ status: "success", payload: updatedCart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: "error", error: "Internal server error" });
  }
});

export default cartRouter;

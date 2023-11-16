import { Router } from "express";
import CartManager from "../controllers/cartsControllers.js";

const cartManager = new CartManager();

const cartRouter = Router();

cartRouter.get("/", cartManager.readCarts);
cartRouter.get("/:id", cartManager.getCartByID);
cartRouter.post("/", cartManager.createCart);
cartRouter.put("/:cid/product/:pid", cartManager.createProductInCart);
cartRouter.put("/:cid", cartManager.addMultipleProductsToCart);
cartRouter.delete("/:id", cartManager.deleteCart);
cartRouter.delete("/:cid/product/:pid", cartManager.deleteProductInCart);

export default cartRouter;

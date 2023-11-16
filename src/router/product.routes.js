import { Router } from "express";
import handlebars from "handlebars";
import { URLSearchParams } from "url";
import ProductManager from "../controllers/productControllers.js";

const productManager = new ProductManager();

const ProductRouter = Router();

handlebars.registerHelper("generateNextPageLink", (query, nextPage) => {
  const queryParams = new URLSearchParams(query);
  const existingParams = Array.from(queryParams.entries());
  existingParams.forEach(([key, value]) => {
    queryParams.set(key, value);
  });
  queryParams.set("page", nextPage);
  return queryParams.toString();
});
handlebars.registerHelper("generatePrevPageLink", (query, prevPage) => {
  const queryParams = new URLSearchParams(query);

  const existingParams = Array.from(queryParams.entries());
  existingParams.forEach(([key, value]) => {
    queryParams.set(key, value);
  });

  queryParams.set("page", prevPage);

  return queryParams.toString();
});

// http://localhost:8080/api/products?category=Mesa&limit=1&sort=asc&page=2
ProductRouter.get("/", productManager.getAllProducts);
ProductRouter.get("/:id", productManager.getProductByID);
ProductRouter.post("/", productManager.createProduct);
ProductRouter.put("/:id", productManager.updateProduct);
ProductRouter.delete("/:id", productManager.deleteProduct);

export default ProductRouter;

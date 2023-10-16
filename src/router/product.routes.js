import { Router } from "express";
import productModel from "../models/products.model.js";
import handlebars from "handlebars";
import { URLSearchParams } from "url";

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
ProductRouter.get("/", async (req, res) => {
  let limit = req.query.limit || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "none";
  let category = req.query.category || null;

  try {
    let query = {};

    if (category) {
      query.category = category;
    }

    let options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort !== "none" ? sort : undefined,
    };

    if (sort === "asc" || sort === "desc") {
      options.sort = { price: sort === "asc" ? 1 : -1 };
    }

    let productsToShow = await productModel.paginate(query, options);

    const productsInfo = {
      docs: productsToShow.docs.map((doc) => doc.toObject()),
      hasNextPage: productsToShow.hasNextPage,
      nextPage: productsToShow.nextPage,
      hasPrevPage: productsToShow.hasPrevPage,
      prevPage: productsToShow.prevPage,
    };
    const user = req.session.user || null;


    res.render("home", {
      productsInfo,
      query: req.query,
      user: user,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Server Error");
  }
});

ProductRouter.get("/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let product = await productModel.find({ _id: id });
    res.send({ result: "success", payload: product });
  } catch (error) {
    console.log(error);
  }
});

ProductRouter.post("/", async (req, res) => {
  let { title, description, code, price, stock, category, image } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    res.send({ status: "error", error: "Incomplete data" });
  }
  let result = await productModel.create({
    title,
    description,
    code,
    price,
    stock,
    category,
    image,
  });
  res.send({ result: "success", payload: result });
});

ProductRouter.put("/:id", async (req, res) => {
  let { id } = req.params;
  let updateProduct = req.body;
  if (
    !updateProduct.title ||
    !updateProduct.description ||
    !updateProduct.code ||
    !updateProduct.price ||
    !updateProduct.stock ||
    !updateProduct.category
  ) {
    res.send({ status: "error", error: "Missing data for product" });
  }
  let result = await productModel.updateOne({ _id: id }, updateProduct);
  res.send({ result: "success", payload: result });
});

ProductRouter.delete("/:id", async (req, res) => {
  let { id } = req.params;
  let result = await productModel.deleteOne({ _id: id });
  res.send({ result: "success", payload: result });
});

export default ProductRouter;

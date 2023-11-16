import productModel from "../models/products.model.js";

class Products {
  constructor() {}

  async getAllProducts(req) {
    try {
      let limit = req.query.limit || 10;
      let page = req.query.page || 1;
      let sort = req.query.sort || "none";
      let category = req.query.category || null;

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

      return {
        productsInfo: productsInfo,
        query: req.query,
      };
    } catch (error) {
      console.log("err", error);
    }
  }

  async getProductByID(req) {
    let { id } = req.params;
    try {
      let product = await productModel.find({ _id: id });
      return product;
    } catch (error) {
      console.log("err", error);
    }
  }

  async createProduct(req) {
    let { title, description, code, price, stock, category, image } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error("Incomplete data");
    }
    try {
      let result = await productModel.create({
        title,
        description,
        code,
        price,
        stock,
        category,
        image,
      });
      return result;
    } catch (error) {
      return console.log(error);
    }
  }

  async updateProduct(req, updateProduct) {
    try {
      let { id } = req.params;
      let result = await productModel.updateOne({ _id: id }, updateProduct);
      return result;
    } catch (error) {
      console.log("err", error);
    }
  }

  async deleteProduct(req) {
    let { id } = req.params;
    try {
      let result = await productModel.deleteOne({ _id: id });
      return result;
    } catch (error) {
      console.log("err", error);
    }
  }
}

export default Products;

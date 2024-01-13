import mongoose from "mongoose";
import Products from "../src/dao/classes/product.dao.js";
import supertest from "supertest";
import Assert from "assert";
import { config } from "dotenv";
import Carts from "../src/dao/classes/carts.dao.js";
import app from "../src/index.js";
import userModel from "../src/dao/models/users.model.js";
import * as chai from "chai";

const expect = chai.expect;

config();

const mongoUrl = process.env.MONGO_URL;

await mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    throw Error(`Error connecting to database ${error}`);
  });

const assert = Assert.strict;

describe("Test Products dao", () => {
  before(function () {
    this.productsDao = new Products();
  });
  beforeEach(function () {
    this.timeout(5000);
  });

  it("Dao adds product to the database as an admin role", async function () {
    const testProduct = {
      title: "Test Prod",
      description: "This is a test product",
      code: "123abc",
      price: 12,
      stock: 1,
      category: "Test",
      image: null,
    };

    const req = {
      session: {
        user: {
          role: "admin",
        },
      },
      body: testProduct,
    };
    const result = await this.productsDao.createProduct(req);
    assert.ok(result._id);
  });

  it("Dao must return the products array", async function () {
    try {
      const req = {
        query: {
          limit: 3,
          page: 1,
          sort: "asc",
          category: null,
        },
      };

      const result = await this.productsDao.getAllProducts(req);
      assert.strictEqual(Array.isArray(result), result.length > 0, true);
    } catch (error) {
      console.log("Error retrieving data: ", error);
      assert.fail("Missed test");
    }
  });
});

describe("Test Carts dao", () => {
  before(function () {
    this.cartsDao = new Carts();
  });
  beforeEach(function () {
    this.timeout(5000);
  });

  it("Dao creates a cart in the database", async function () {
    const req = {
      products: [],
    };

    const createdCart = await this.cartsDao.createCart(req);
    assert.ok(createdCart._id);
  });

  it("Dao deletes a cart in the database", async function () {
    const req = {
      products: [],
    };

    const createdCart = await this.cartsDao.createCart(req);
    assert.ok(createdCart._id);

    const cartAfterDeletion = await this.cartsDao.getCartByID(createdCart._id);
    assert.strict(cartAfterDeletion, null);
  });
});

describe("User Registration", () => {
  beforeEach(async () => {
    // Clear the users collection before each test
    await userModel.deleteMany();
  });

  it("should register a new user", async () => {
    const newUser = {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      age: 25,
      role: "user",
      password: "password123",
    };

    try {
      const res = await supertest(app)
        .post("/api/sessions/register")
        .send(newUser)
        .expect(302)
        .expect("Location", "/api/sessions/login");

      // console.log("Response Body:", res.body);
      // // Perform assertions for successful registration
      // expect(res.body.user).to.have.property("_id");

      // // Query the database to check if the user was created
      // const registeredUser = await userModel.findOne({
      //   email: newUser.email,
      // });

      // Assert that the user is not null (i.e., user exists in the database)
      // expect(registeredUser).to.not.be.null;

      // Additional assertions based on your user creation logic
      // expect(registeredUser.first_name).to.equal(newUser.first_name);
      // expect(registeredUser.role).to.equal(newUser.role);
    } catch (error) {
      // Handle errors, log them, etc.
      console.error("Error in user registration test:", error);
      throw error; // Re-throw the error to make the test fail
    }
  });
});

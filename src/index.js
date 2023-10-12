import express from "express";
import { engine } from "express-handlebars";
import { __dirname } from "./utils.js";
import * as path from "path";
import mongoose from "mongoose";

import ProductRouter from "./router/product.routes.js";
import cartRouter from "./router/cart.routes.js";


// Express
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));


const httpServer = app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
// Handlebars config
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname + "/views"));
app.use("/", express.static(__dirname + "/public"));

// Mongoose
const environment = async () => {
  await mongoose
    .connect(
      "mongodb+srv://velezwiesner:8FxbISA9qJksWzmM@cluster0.bn5gi6q.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp"
    )
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      throw Error(`Error connecting to database ${error}`);
    });
};

environment();

// Routes
app.use("/api/products", ProductRouter);
app.use("/api/cart", cartRouter);

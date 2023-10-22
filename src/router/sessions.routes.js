import { Router } from "express";
import usersModel from "../models/users.model.js";
import { createHash, isValidPassword } from "../utils.js";

const sessionRouter = Router();

sessionRouter.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const User = new usersModel();

sessionRouter.get("/register", async (req, res) => {
  res.render("register");
});

sessionRouter.post("/register", async (req, res) => {
  let { first_name, last_name, email, age, password, role } = req.body;
  try {
    if (!first_name || !last_name || !email || !age || !password || !role) {
      res.send({ status: "error", error: "Incomplete data" });
    }

    await usersModel.create({
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
      role,
    });

    res.redirect("/api/sessions/login");
  } catch (error) {
    res.status(500).send("Error de registro");
  }
});

sessionRouter.get("/login", async (req, res) => {
  res.render("login");
});

sessionRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });

    const user = await usersModel.findOne(
      { email: email },
      { email: 1, first_name: 1, last_name: 1, password: 1, role:1 }
    );
    if (!user)
      res.status(400).send({ status: "error", error: "User not found" });
    if (!isValidPassword(user, password))
      return res
        .status(403)
        .send({ status: "error", error: "Incorrect password" });
    delete user.password;
    req.session.user = user.toObject();
    res.redirect("/api/products");
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Server Error");
  }
});

sessionRouter.get("/logout", async (req, res) => {
  delete req.session.user;

  res.redirect("/api/sessions/login");
});

sessionRouter.get("/fullprofile", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/api/sessions/login");
    }

    const { first_name, last_name, email, role } = req.session.user;

    res.render("fullProfile", { first_name, last_name, email, role });
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Server Error");
  }
});

export default sessionRouter;

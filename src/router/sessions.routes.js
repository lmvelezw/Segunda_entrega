import { Router } from "express";
import usersModel from "../models/users.model.js";

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
      password,
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
    const user = await usersModel.findOne({ email, password });

    if (user) {
      req.session.user = user.toObject();
      console.log(req.session.user);
      res.redirect("/api/products");
    } else {
      res.redirect("/api/sessions/register");
    }
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

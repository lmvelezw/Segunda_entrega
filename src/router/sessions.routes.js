import { Router } from "express";
import usersModel from "../models/users.model.js";
import passport from "passport";

const sessionRouter = Router();

sessionRouter.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const User = new usersModel();

sessionRouter.get("/register", async (req, res) => {
  res.render("register");
});

sessionRouter.post(
  "/register",
  passport.authenticate("register", {
    successRedirect: "/api/sessions/login",
    failureRedirect: "/api/sessions/failregister",
  })
);

sessionRouter.get("/failregister", async (req, res) => {
  res.render("failregister")
});

sessionRouter.get("/login", async (req, res) => {
  res.render("login");
});

sessionRouter.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/api/sessions/login" }),
  async (req, res) => {
    if (!req.user) {
      return res.status(400)({ status: "error", error: "Invalid credentials" });
    }
    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      email: req.user.email,
      role: req.user.role,
    };
    res.redirect("/api/products");
  }
);

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

sessionRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

sessionRouter.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/api/sessions/login" }),
  async (req, res) => {
    req.session.user = req.user;
    res.redirect("/api/products");
  }
);

export default sessionRouter;

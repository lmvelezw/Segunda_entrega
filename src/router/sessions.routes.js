import { Router } from "express";
import usersModel from "../dao/models/users.model.js";
import UsersManager from "../controllers/usersControllers.js";
import passport from "passport";

const userManager = new UsersManager();
const sessionRouter = Router();

sessionRouter.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const User = new usersModel();

sessionRouter.post(
  "/register",
  passport.authenticate("register", {
    successRedirect: "/api/sessions/login",
    failureRedirect: "/api/sessions/failregister",
  }),
  userManager.registerUser
);

sessionRouter.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/login",
  }),
  userManager.loginUser
);

sessionRouter.get("/logout", userManager.logoutUser);
sessionRouter.get("/fullprofile", userManager.fullProfileUser);
sessionRouter.get("/github", userManager.githubLogin);
sessionRouter.get("/githubcallback", userManager.githubCallback);

sessionRouter.get("/register", async (req, res) => {
  res.render("register");
});

sessionRouter.get("/failregister", async (req, res) => {
  res.render("failregister");
});

sessionRouter.get("/login", async (req, res) => {
  res.render("login");
});

export default sessionRouter;

import passport from "passport";
import local from "passport-local";
import userModel from "../models/users.model.js";
import {
  createHash,
  isValidPassword,
} from "../utils.js";
import GitHubStrategy from "passport-github2";
import cartsModel from "../models/carts.model.js";

const LocalStrategy = local.Strategy;
const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age, role } = req.body;
        try {
          let user = await userModel.findOne({ email: username });
          if (user) {
            return done(null, false, { message: "Email already exists." });
          }
          const newUser = {
            first_name,
            last_name,
            email,
            age,
            role,
            password: createHash(password),
            cart: null,
          };
          let result = await userModel.create(newUser);

          let newCart = await cartsModel.create({});
          result.cart = newCart._id;
          await result.save();

          return done(null, result);
        } catch (error) {
          return done("Error getting user: " + error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    let user = await userModel.findById(id);
    done(null, user);
  });
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          let user = await userModel.findOne({ email: username });
          if (!user) {
            return done(null, false, {
              message: "No User Found with this Email",
            });
          }
          if (!isValidPassword(user, password))
            return done(null, false, { message: "Incorrect password" });

          if (!user.cart) {
            let newCart = await cartsModel.create({});
            user.cart = newCart._id;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );


  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          let user = await userModel.findOne({ email: profile._json.email });
          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: "",
              email: profile._json.email,
              age: 18,
              password: "",
              role: "user",
              cart: "",
            };
            let result = await userModel.create(newUser);

            let newCart = await cartsModel.create({});
            result.cart = newCart._id;
            await result.save();

            done(null, result);
          } else {
            if (!user.cart) {
              let newCart = await cartsModel.create({});
              user.cart = newCart._id;
              await user.save();
            }
            done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
export default initializePassport;

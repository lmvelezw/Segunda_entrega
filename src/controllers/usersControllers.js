class UsersManager {
  constructor() {}

  async registerUser(req, res) {
    try {
      res.render("register");
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }

  async loginUser(req, res) {
    try {
      if (!req.user) {
        return res.status(400).json({
          status: "error",
          error: "Invalid credentials",
        });
      }

      req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role,
      };

      return res.redirect("/api/products");
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }

  async logoutUser(req, res) {
    try {
      req.logout((err) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).send("Server Error");
        }
        return res.redirect("/api/sessions/login");
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send("Server Error");
    }
  }

  async fullProfileUser(req, res) {
    try {
      if (!req.session.user) {
        return res.redirect("/api/sessions/login");
      }

      const { first_name, last_name, email, role } = req.session.user;

      return res.render("fullProfile", { first_name, last_name, email, role });
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }

  async githubLogin(req, res) {
    try {
      passport.authenticate("github", { scope: ["user:email"] })(req, res);
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }

  async githubCallback(req, res) {
    try {
      passport.authenticate("github", {
        failureRedirect: "/api/sessions/login",
      })(req, res, async () => {
        req.session.user = req.user;
        return res.redirect("/api/products");
      });
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }
}

export default UsersManager;

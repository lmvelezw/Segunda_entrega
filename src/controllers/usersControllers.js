import config from "../config/config.js";
import Users from "../dao/classes/users.dao.js";
import nodemailer from "nodemailer";
import userModel from "../dao/models/users.model.js";
import crypto from "crypto";
import multer from "multer";
import passport from "passport";

const usersDao = new Users();

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 8080,
  auth: {
    user: config.gmailUser,
    pass: config.gmailPass,
  },
});

class UsersManager {
  storageDocuments = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/documents");
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const originalName = file.originalName;
      cb(null, `${timestamp} ${originalName}`);
    },
  });

  uploadDocuments = multer({
    storage: this.storageDocuments,
    limits: { files: 3 },
  }).array("documents", 3);

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
        userId: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role,
        cart: req.user.cart,
      };

      const currentTime = Date.now();
      let userId = req.user._id;
      await userModel.findByIdAndUpdate(userId, {
        lastConnection: currentTime,
      });

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

      const { userId, first_name, last_name, email, role } = req.session.user;

      return res.render("fullProfile", {
        userId,
        first_name,
        last_name,
        email,
        role,
      });
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

  async validateUser(req, res) {
    try {
      let user = await userModel.findOne({ email: req.body.email });

      if (!user) {
        return res.send({ status: "error", error: "User not found" });
      }

      const token = crypto.randomBytes(20).toString("hex");

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000;

      await user.save();

      let recoveryLink = `http://localhost:8080/api/sessions/passrecover/${token}`;

      await transport.sendMail({
        from: config.gmailUser,
        to: user.email,
        subject: `Password recovery`,
        text: `Click the following link to recover your password: ${recoveryLink}`,
        html: `Click the following link to recover your password: <a href="${recoveryLink}">${recoveryLink}</a>`,
      });

      return res.redirect("/api/sessions/login");
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }

  async changeUserRole(req, res) {
    try {
      let userId = req.session.user.userId;
      return res.render("roleChange", { userId });
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }

  // async updateUserRole(req, res) {
  //   try {

  //     if (!req.user || !req.user._id) {
  //       return res.status(400).send("User ID not found");
  //     }
  //     console.log("files", req.files);

  //     if (req.files && req.files.length !== 3) {
  //       return res
  //         .status(400)
  //         .send("Please upload three documents for role update.");
  //     }
  //     this.uploadDocuments(req, res, async (err) => {
  //       if (err) {
  //         console.error("Error uploading documents:", err);

  //         return res.status(400).send("Error uploading documents.");
  //       }
  //       console.log("Uploaded documents:", req.files);

  //       let newRole = req.body.role;
  //       let userId = req.session.user.userId;

  //       const updatedUser = await usersDao.updateUserRole(userId, newRole);
  //       console.log("User role updated:", updatedUser);

  //       return res.redirect("/");
  //     });
  //   } catch (error) {
  //     console.log("err", error);
  //     return res.status(500).send("Server Error");
  //   }
  // }
  async updateUserRole(req, res) {
    try {
      console.log("Entered updateUserRole");

      if (!req.user || !req.user._id) {
        return res.status(400).send("User ID not found");
      }

      console.log("files", req.files);

      if (req.files && req.files.length !== 3) {
        return res
          .status(400)
          .send("Please upload three documents for role update.");
      }

      this.uploadDocuments(req, res, async (err) => {
        if (err) {
          console.error("Error uploading documents:", err);
          return res.status(400).send("Error uploading documents.");
        }

        console.log("Uploaded documents:", req.files);

        let newRole = req.body.role;
        let userId = req.session.user.userId;

        // Pass the uploaded files to updateUserRole
        const updatedUser = await usersDao.updateUserRole(
          userId,
          newRole,
          req.files
        );

        console.log("User role updated:", updatedUser);

        return res.redirect("/");
      });
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }

  async uploadDocument(req, res) {
    try {
      const storageProfilePic = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "uploads/profiles");
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const originalName = file.originalName;
          const ext = path.extname(originalName);
          cb(null, `${timestamp} ${originalName}`);
        },
      });

      const uploadProfilePic = multer({ storage: storageProfilePic });

      const storageProductPic = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "uploads/products");
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const originalName = file.originalName;
          const ext = path.extname(originalName);
          cb(null, `${timestamp} ${originalName}`);
        },
      });

      const uploadProductPic = multer({ storage: storageProductPic });

      const storageDocuments = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "uploads/documents");
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const originalName = file.originalName;
          const ext = path.extname(originalName);
          cb(null, `${timestamp} ${originalName}`);
        },
      });
    } catch (error) {
      console.log("err", error);
      return res.status(500).send("Server Error");
    }
  }
}

export default UsersManager;

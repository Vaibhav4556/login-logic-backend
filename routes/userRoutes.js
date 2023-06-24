const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const User = require("../models/usersmodel");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

const sendSetPasswordmail = async (email, token) => {
  // console.log(token, "::::::::::");
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "tsetuser36@gmail.com", // Replace with your Gmail email address
        pass: "hloyoqapqktccvfi", // Replace with your Gmail password or app password
      },
    });

    const mailOptions = {
      from: "tsetuser36@gmail.com",
      to: email,
      subject: "please rest your password ",
      html: `Using link reset your password : <a href='http://localhost:8000/api/users/reset-password?token=${token}> Reset link</a>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("mail sent successfully", info.response);
      }
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

// router.post("/register", (req, res) => {

//   User.find({ email: req.body.email }).then((docs) => {
//     if (docs.length > 0) {
//       return res.status(400).json({ message: "user already registered" });
//     } else {
//       const newuser = new User({
//         firstname: req.body.firstname,
//         email: req.body.email,
//         password: req.body.password,
//       });

//       return newuser.save();
//     }
//   });
// });

router.post("/register", async (req, res) => {
  try {
    const { firstname, email, phone, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }, { firstname: firstname }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const newUser = new User({
      firstname,
      email,
      phone,
      password,
    });

    await newUser.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user" });
  }
});

router.post("/login", (req, res) => {
  User.find({ email: req.body.email, password: req.body.password }).then(
    (docs) => {
      if (docs.length > 0) {
        const user = {
          firstname: docs[0].firstname,
          _id: docs[0]._id,
          email: docs[0].email,
        };
        console.log(user);

        res.status(200).json({ message: "Login Successfull" });
      } else {
        return res.status(400).json({ message: "Invalid Credentilas" });
      }
    }
  );
});

router.post("/forgot-password", (req, res) => {
  const email = req.body.email;
  const token = randomstring.generate(); // Generate the token

  User.find({ email: email }).then((docs) => {
    if (docs.length > 0) {
      User.updateOne({ email: email }, { $set: { token: token } })
        .then(() => {
          sendSetPasswordmail(email, token); // Pass the token to the email sending function
          res
            .status(200)
            .json({ message: "Please check your inbox and reset password" });
        })
        .catch((error) => {
          console.error("Error updating token:", error);
          res.status(500).json({ message: "Internal server error" });
        });
    } else {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  });
});

router.get("/reset-password", async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (!tokenData) {
      throw new Error("Token is not valid");
    } else {
      const password = req.body.password;
      const UserData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: password, token: "" } },
        { new: true }
      );
      res
        .status(200)
        .send({
          success: true,
          msg: "Password has been reset",
          data: UserData,
        });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/update", (req, res) => {
  const { userid, updateduser } = req.body;

  User.findByIdAndUpdate(userid, {
    firstname: updateduser.firstname,
    email: updateduser.email,
    password: updateduser.password,
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.send("User details updated successfully");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// {for update  pass data like below

//   {
//     "userid":"649693d92d20ccf84a45741f",

//     "updateduser":{
//    "firstname":"gaurav",
//    "email":"pjnv01@gmail.com",
//    "password":"111111"}

// }

// }

router.get("/getallusers", (req, res) => {
  User.find({}).then((docs) => {
    if (!docs) {
      return res.status(400).json({ message: "something went wrong" });
    } else {
      res.send(docs);
    }
  });
});

router.post("/logout", (req, res) => {
 
  // This can include clearing session data, removing tokens, or any other necessary logout logic
  
  req.session.destroy((error) => {
    if (error) {
      console.error("Error during logout:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
});




module.exports = router;

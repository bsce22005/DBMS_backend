import express from "express";
import 'dotenv/config';
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import userInfo from "../Middleware/User.Middleware.js";
import con from "../database.js";

const router = express.Router();


// Example route for Express
router.get("/user", (req, res) => {
  res.send("Hello from the Express server!");
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

  con.query("CREATE DATABASE IF NOT EXISTS Node", function (err, result) {
    if (err) throw err;
    console.log("Database created",result);
  });

});

router.post(
  "/signup",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter a valid name").isLength({ min: 2 }),
    body("password", "Enter a password greater than 5 characters.").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Enter valid credentials!", success });
    }

    try {
      // Establish the connection once at the beginning
      con.connect(function (err) {
        if (err) {
          console.error("Connection error: ", err);
          return res.status(500).send("Failed to connect to the database.");
        }
        console.log("Connected to the database.");
      });

      // Create database if not exists
      con.query("CREATE DATABASE IF NOT EXISTS DBMS_Project", function (err, result) {
        if (err) {
          console.error("Database creation error: ", err);
          return res.status(500).send("Failed to create database.");
        }
        console.log("Database created:", result);
      });

      // Use the created database
      con.query("USE DBMS_Project", function (err) {
        if (err) {
          console.error("Database selection error: ", err);
          return res.status(500).send("Failed to select database.");
        }
        console.log("Using DBMS_Project database");
      });

      // Create the Guardian table if not exists
      con.query(
        `CREATE TABLE IF NOT EXISTS Guardian (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            password VARCHAR(200) NOT NULL,
            email VARCHAR(200) NOT NULL UNIQUE,
            auth_token VARCHAR(255)
        );`,
        function (err, result) {
          if (err) {
            console.error("Table creation error: ", err);
            return res.status(500).send("Failed to create table.");
          }
          console.log("Table created:", result);
        }
      );

      // Check if the user already exists
      const checkUserQuery = "SELECT * FROM Guardian WHERE email = ?";
      con.query(checkUserQuery, [req.body.email], async (err, results) => {
        if (err) {
          console.error("User check error: ", err);
          return res.status(500).send("Database query failed.");
        }
        if (results.length > 0) {
          return res.status(400).json({ message: "User with this email already exists!", success });
        } else {
          // Encrypt the password
          const salt = await bcrypt.genSalt(10);
          const securedPassword = await bcrypt.hash(req.body.password, salt);

          // Insert the new user into the table
          const insertUserQuery = "INSERT INTO Guardian (name, email, password) VALUES (?, ?, ?)";
          con.query(insertUserQuery, [req.body.name, req.body.email, securedPassword], (err, result) => {
            if (err) {
              console.error("Insert user error: ", err);
              return res.status(500).send("Failed to insert user.");
            }

            const userId = result.insertId;

            // Generate auth token
            const data = { id: userId };
            const authToken = jwt.sign(data, process.env.JWT_SECRET2);

            // Update the auth_token in the Guardian table
            const updateAuthTokenQuery = "UPDATE Guardian SET auth_token = ? WHERE id = ?";
            con.query(updateAuthTokenQuery, [authToken, userId], (err, updateResult) => {
              if (err) {
                console.error("Token update error: ", err);
                return res.status(500).send("Failed to update token.");
              }

              success = true;
              return res.json({ success, authToken });
            });
          });
        }
      });
    } catch (error) {
      console.error("Server error: ", error);
      return res.status(500).send("Internal Server Error!");
    }
  }
);


// router.post(
//   "/signup",
//   [
//     body("email", "Enter a valid email").isEmail(),
//     body("password", "Enter a password greater than 5 characters.").isLength({
//       min: 5,
//     }),
//   ],
//   async (req, res) => {
//     let success=false;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
      
//       return res.status(400).json({"message":"Enter valid credentials!","success":success});
//     }
//     try {
//       let checking = false;
//       con.connect(function(err) {
//         if (err) throw err;
//         console.log("Connected!");
//       });
    
//       con.query("CREATE DATABASE IF NOT EXISTS DBMS_Project", function (err, result) {
//         if (err) throw err;
//         console.log("Database created",result);
//       });

//       con.query(
//         `CREATE TABLE IF NOT EXISTS Guardian (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             name VARCHAR(255) NOT NULL,
//             password VARCHAR(255) NOT NULL,
//             email VARCHAR(255) NOT NULL UNIQUE
//         );`,
//         function (err, result) {
//           if (err) throw err;
//           console.log("Table created", result);
//         }
//       );
      

//       // checking = await User.findOne({ email: req.body.email });
//       // if (checking) {
//       //   return res.status(400).send({"message":"User with this email already exists!","success":success});
//       // }

//       const salt = await bcrypt.genSalt(10);
//       const securedPassword = await bcrypt.hash(req.body.password, salt);

//       // let user = await User.create({
//       //   email: req.body.email,
//       //   password: securedPassword,
//       // });

//       // const data = {
//       //   id: user._id,
//       // };

//       const authToken = jwt.sign(data, process.env.JWT_SECRET2);
//       let settingAuthToken = await User.findByIdAndUpdate(
//         user._id,
//         { $set: { authenticationToken: authToken } },
//         { new: true }
//       );
//       success=true;
//       res.json({"success":success,"authToken":settingAuthToken.authenticationToken});
//     } catch (error) {
//       res.status(500).send("Internal Server Error!");
//     }
//   }
// );

// router.post(
//   "/login",
//   [
//     body("email", "Enter a valid email").isEmail(),
//     body("password", "Enter a valid password").exists(),
//   ],
//   async (req, res) => {
//     let success=false;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({"message":"Enter valid credentials!","success":success});
//     }
//     try {
//       let emailExists = await User.findOne({ email: req.body.email });
//       if (!emailExists) {
//         return res
//           .status(400)
//           .json({ "message": "Please try to login with correct credentials.","success":success });
//       }
//       const passwordCompare = await bcrypt.compare(
//         req.body.password,
//         emailExists.password
//       );
//       if (!passwordCompare) {
//         return res
//           .status(400)
//           .json({ "message": "Please try to login with correct credentials.","success":success});
//       }

//       const data = {
//         id: emailExists._id,
//       };

//       const authToken = jwt.sign(data, process.env.JWT_SECRET2);
//       let settingAuthToken = await User.findByIdAndUpdate(
//         emailExists._id,
//         { $set: { authenticationToken: authToken } },
//         { new: true }
//       );
//       success=true;
//       res.json({"success":success,"authToken":settingAuthToken.authenticationToken});
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send("Internal server error!!");
//     }
//   }
// );

// router.put(
//   "/changePassword",
//   userInfo,
//   async (req, res) => {
//     const errors = validationResult(req);
//     let success=false;
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ "message":errors,"success":success });
//     }
//     try {
//       let gettingUser = await User.findById(req.currentUser);
//       if (!gettingUser) {
//         return res.status(401).send({"message":"Incorrect credentials","success":success });
//       }
//       let passwordCompare=await bcrypt.compare(req.body.currentPassword,gettingUser.password)
//       if (!passwordCompare) {
//         return res.status(401).send({"message":"Incorrect credentials","success":success });
//       }

//       const salt = await bcrypt.genSalt(10);
//       const securedPassword = await bcrypt.hash(req.body.newPassword, salt);

//       let changed = await User.findByIdAndUpdate(
//         req.currentUser,
//         { $set: { password: securedPassword } },
//         { new: true }
//       );

//       success=true;
//       res.status(200).send({"success":success});


//     } catch (error) {
//       res.status(500).send({"message":error,"success":success});
//     }
//   }
// );


// router.delete('/logout',userInfo, 
// async (req,res)=>{

//     try {
//         let success=false;
//         const afterLogout=await User.findByIdAndUpdate(req.currentUser,{$unset:{"authenticationToken":1}},{new:true});
//         if (!afterLogout) {
//           return res.status(401).send({"message":"Incorrect credentials","success":success});
//         }
//         success=true;
//         res.status(200).send({"success":success});

//     } catch (error) {
//         res.status(500).send("Internal Server Error");
//     }


// })


export default router;
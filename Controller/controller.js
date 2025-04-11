const nodemailer = require("nodemailer");
const db = require("../Config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const image = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploaded file info:", req.file);

    res.status(200).json({
      message: "Image uploaded successfully",
      fileInfo: req.file,
    });
  } catch (error) {
    console.error("Image upload error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// User Registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // const profile_picture = req.file ? req.file.filename : null;
    const profile_picture = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : null;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure role is valid
    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into table
    await db.query("CALL RegisterUser(?, ?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      role,
      profile_picture, // this can be a string like a URL or path
    ]);

    const transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail's service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates if necessary
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: " Welcome to Our Platform from Rizwan Ahmed!",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Welcome, ${name}!</h2>
          <p>Thank you for registering on our platform. We're thrilled to have you on board!</p>
          <p style="margin: 20px 0;">
            You can now explore our platform as a <strong>${role}</strong>, and start your journey with us.
          </p>
          <p>Let us know if you ever need help – we're here for you!</p>
          <br/>
          <p style="font-size: 14px; color: #888;">Warm regards,<br/>The Team 🚀</p>
          <hr/>
          <p style="font-size: 12px; color: #aaa;">If you did not sign up for this account, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      const resp = await transporter.sendMail(mailOptions);
      console.log("Check resp > ", resp);
    } catch (err) {
      console.log("email error > ", err);
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Call stored procedure and get user
    const [rows] = await db.query("CALL login(?)", [email]);
    // const user = rows[0]; // get first row of first result set
    const user = rows[0][0]; // Get the actual user object from first result set
    // because store procedure wrapped it with two layers so rows[0][0]
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const getAllUser = async (req, res) => {
//   try {
//     const [users] = await db.promise().query("SELECT * FROM users");

//     if (users.length === 0) {
//       return res.status(404).json({ message: "No users found" });
//     }

//     res.status(200).json({
//       success: true,
//       count: users.length,
//       data: users,
//     });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });

//   }
// };
const getAllUser = async (req, res, next) => {
  try {
    const [users] = await db.query("CALL getAllUsers()"); // Intentional error

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(" Error in getAllUser:", error.message);
    next(error); //  Ensure the error is forwarded to global error handler
  }
};

module.exports = { registerUser, loginUser, getAllUser, image };

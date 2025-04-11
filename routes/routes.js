const express = require("express");
const multer = require("multer");
// const upload = multer({ dest: 'uploads/' })
const {
  registerUser,
  loginUser,
  getAllUser,
  image,
} = require("../Controller/controller");
const protctRoute = require("../middleware/authMiddleware");

const router = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Initialize multer with custom storage
const upload = multer({ storage: storage });


router.post("/api/upload", upload.single("file"), image); // Upload route
router.post("/register", upload.single("profile_picture"), registerUser);
// router.post("/register", registerUser);                // Registration
router.post("/login", loginUser);                      // Login
// router.get("/getAllUser", protctRoute, getAllUser);  // Protected route (optional)
router.get("/getAllUser", getAllUser);                 // Get all users
router.get("/errorTest", (req, res) => {
  throw new Error("This is a test error!");            // Error testing
});

module.exports = router;

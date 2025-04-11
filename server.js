require("dotenv").config();
const express = require("express");
const { logger, consoleLogger } = require("./Loggs/loggs");
const errorLogger = require("./Loggs/errorLogger");
const db = require("./Config/db");
const authRoutes = require("./routes/routes");
const winstonLogger = require("./Loggs/winston");

const app = express();
app.use(express.json());

// ✅ Serve uploaded images statically
app.use('/uploads', express.static('uploads'));  // <-- Add this line here

app.use(logger);
app.use(consoleLogger);

// Route middleware
app.use("/api/auth", authRoutes);

// Winston logger
winstonLogger.info('this is dummy message');
winstonLogger.error("this is error message");
winstonLogger.warn("this is dummy data");

// Global error handling and DB logging
app.use(async (err, req, res, next) => {
  console.error("Captured Error in Global Middleware:", err.message);

  try {
    console.log("Attempting to insert error into the database...");
    await db
      .promise()
      .query(
        "INSERT INTO errors (method, url, error_message, stack_trace) VALUES (?, ?, ?, ?)",
        [req.method, req.originalUrl, err.message, err.stack]
      );
    console.log("Error successfully logged in the database.");
  } catch (dbError) {
    console.error("Failed to log error to database:", dbError.message);
  }

  next(err);
  // Optionally send error response
  // res.status(500).json({ message: "Something went wrong!", error: err.message });
});

app.use(errorLogger);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// require("dotenv").config();
// const express = require("express");
// const { logger, consoleLogger } = require("./Loggs/loggs");
// const errorLogger = require("./Loggs/errorLogger");
// const db = require("./Config/db");
// const authRoutes = require("./routes/routes");
// const winstonLogger = require("./Loggs/winston");
// const app = express();
// app.use(express.json());

// app.use(logger);
// app.use(consoleLogger);
// app.use("/api/auth", authRoutes);

// //winston logger
// winstonLogger.info('this is dummy message');
// winstonLogger.error("this is error message");
// winstonLogger.warn("this is dummy data")

// app.use(async (err, req, res, next) => {
//   console.error(" Captured Error in Global Middleware:", err.message);

//   try {
//     console.log(" Attempting to insert error into the database...");

//     await db
//       .promise()
//       .query(
//         "INSERT INTO errors (method, url, error_message, stack_trace) VALUES (?, ?, ?, ?)",
//         [req.method, req.originalUrl, err.message, err.stack]
//       );

//     console.log(" Error successfully logged in the database.");
//   } catch (dbError) {
//     console.error(" Failed to log error to database:", dbError.message);
//   }
//   next(err);
// //   res
// //     .status(500)
// //     .json({ message: "Something went wrong!", error: err.message });
// });
// app.use(errorLogger);
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

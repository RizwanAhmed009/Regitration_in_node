const fs = require("fs");
const path = require("path");

const errorLogStream = fs.createWriteStream(path.join(__dirname, "error.log"), {
  flags: "a",
});

// Custom error logging middleware
const errorLogger = (err, req, res, next) => {
  console.log("Error Logger Middleware Executed");
  const errorMessage = `
    ===========================
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    URL: ${req.url}
    Status: ${res.statusCode}
    Message: ${err.message}
    Stack Trace: ${err.stack}
    ===========================
    `;

  console.log(errorMessage);

  errorLogStream.write(errorMessage, (writeErr) => {
    if (writeErr) {
      console.error("Failed to write to error log file:", writeErr);
    }
    res.status(500).json({ message: "Something went wrong!" });
  });
};

module.exports = errorLogger;

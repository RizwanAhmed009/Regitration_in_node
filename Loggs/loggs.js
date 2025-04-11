const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
// create a write stream to log rquest to a file
const logstream = fs.createWriteStream(
  path.join(__dirname, "access.log"), // file name and path
  {
    flags: "a", //append mode for file
  }
);

const logger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: logstream,
  }
);
//user morgan middlewere,log request to console n dev formate 
const consoleLogger = morgan("dev");
module.exports = { logger, consoleLogger };

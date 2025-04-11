const { createLogger, format, transports } = require("winston");
const DatabaseTransport = require("../Transport/dbTransport")
const path = require("path");
// const winston = require("winston/lib/winston/config");
const winstonLogger = createLogger({
  level: "info", 
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    // format.printf(({ timestamp, level, message }) => {
    //   return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    // })
    format.json()
  ),
  transports: [
    new transports.Console(), 
    // new transports.File({ filename: "app.log" }) 
    new transports.File({
        filename:path.join(__dirname,"app.log")
    }),
    new DatabaseTransport()
  ],
});

module.exports = winstonLogger;


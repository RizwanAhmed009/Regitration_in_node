const Transport = require("winston-transport");
const db = require("../Config/db");

class DatabaseTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.db = db;
  }

  async log(info, callback) {
    setImmediate(() => this.emit("logged", info));

    const { level, message, timestamp } = info;

    try {
      await this.db
        .promise()
        .query(
          "INSERT INTO winstonlogs (level, message, timestamp) VALUES (?, ?, ?)",
          [level, message, timestamp]
        );
    } catch (error) {
      console.error("Failed to insert data into the database:", error.message);
    }

    callback();
  }
}

module.exports = DatabaseTransport;

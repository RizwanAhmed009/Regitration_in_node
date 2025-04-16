require("dotenv").config();
const express = require("express");
const { logger, consoleLogger } = require("./Loggs/loggs");
const errorLogger = require("./Loggs/errorLogger");
const db = require("./Config/db");
const authRoutes = require("./routes/routes");
const winstonLogger = require("./Loggs/winston");
const app = express();
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const redisclient = require("./Config/redisUtil");
app.use(express.json());
//redis_API
app.get("/using-redis",async(req,res)=>{
  const cacheKey = "calculatedsum";
  try {
    const cacheResult = await redisclient.get(cacheKey);
    if(cacheResult){
      console.log("Data coming from redis....")
      return res.json({data:parseInt(cacheResult),cached:true})
    }
    let calculatedSum = 0;
    console.log("Calculating fresh Data .....");
    for(let i=0;i<1000000;i++){
       calculatedSum += i;
    }
    await redisclient.set(cacheKey,calculatedSum.toString(),{ex:60})
    return res.json({data:calculatedSum,cached:false})
  } catch (error) {
    return res.status(500).json({error:error.message})

  }
})


app.use("/uploads", express.static("uploads"));

app.use(logger);
app.use(consoleLogger);

// Route middleware
app.use("/api/auth", authRoutes);

//caching practise
app.get("/data", (req, res) => {
  const cacheKey = "myData";
  const cacheData = myCache.get(cacheKey);
  if (cacheData) {
    console.log("Serving Data from cache...");
    return res.json(cacheData);
  }
  console.log("Fetching data from API/DB..");
  const freshData = fetchDataFromDb();
  myCache.set(cacheKey, freshData);
  return res.json(freshData);
});

const fetchDataFromDb = () => {
  return { data: "Hullo world", timestamp: new Date() };
};
// Winston logger
winstonLogger.info("this is dummy message");
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

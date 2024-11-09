const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
  return client.db("bugle");
}

module.exports = connectDB;

// todo: comments, ads, impressions

// (for ahbey's dir structure)
console.log("visit: http://localhost:8080/dailybugle/front/index.html")
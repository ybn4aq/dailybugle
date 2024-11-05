const connectDB = require("../db/connect");

async function findUser(username, password) {
  const db = await connectDB();
  return await db.collection("users").findOne({ username, password });
}

module.exports = { findUser };

const connectDB = require("../db/connect");

async function findUser(username, password) {
  const db = await connectDB();
  return await db.collection("users").findOne({ username, password });
}

async function createUser(username, password) {
  const db = await connectDB();
  const user = { username, password };
  const result = await db.collection("users").insertOne(user);
  return result.insertedId; //change?
}
module.exports = { findUser, createUser  };
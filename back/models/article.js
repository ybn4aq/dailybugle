const connectDB = require("../db/connect");
const { ObjectId } = require('mongodb');

async function getArticles() {
  const db = await connectDB();
  return await db.collection("articles").find().toArray();
}

async function getArticleById(id) {
  const db = await connectDB();
  return await db.collection("articles").findOne({ _id: new ObjectId(id) });
}

async function createArticle(article) {
  const db = await connectDB();
  await db.collection("articles").insertOne(article);
}

async function updateArticle(id, article) {
  const db = await connectDB();
  await db.collection("articles").updateOne({ _id: new ObjectId(id) }, { $set: article });
}

async function deleteArticle(id) {
  const db = await connectDB();
  await db.collection("articles").deleteOne({ _id: new ObjectId(id) });
}

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };

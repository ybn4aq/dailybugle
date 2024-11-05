const connectDB = require("../db/connect");

async function addComment(articleId, comment) {
  const db = await connectDB();
  await db.collection("comments").insertOne({ articleId, ...comment });
}

async function getComments(articleId) {
  const db = await connectDB();
  return await db.collection("comments").find({ articleId }).toArray();
}

module.exports = { addComment, getComments };

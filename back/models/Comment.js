const connectDB = require("../db/connect");
const { ObjectId } = require("mongodb"); // Import ObjectId

async function addCommentToArticle(articleId, commentData) {
  try {
    const db = await connectDB();
    const comment = {
      comment: commentData.comment,
      dateCreated: new Date(),
      user_id: commentData.user_id,
      author: commentData.user_id,
    };
    await db.collection("comments").insertOne(comment); // For comment searching
    await db.collection("articles").updateOne(
      { _id: new ObjectId(articleId) }, // Ensure conversion to ObjectId
      { $push: { comments: comment } }
    );
  } catch (error) {
    console.error("Error in addCommentToArticle:", error);
    throw error; // Re-throw error to let the server handle it
  }
}

async function getComments(articleId) {
  try {
    const db = await connectDB();
    const article = await db
      .collection("articles")
      .findOne({ _id: new ObjectId(articleId) });
    return article ? article.comments : [];
  } catch (error) {
    console.error("Error in getComments:", error);
    throw error;
  }
}

async function searchComments(query) {
  const db = await connectDB();
  console.log(`Searching comments with query: "${query}"`);
  const comments = await db
    .collection("comments")
    .find({ $text: { $search: query } })
    .toArray();
  return comments;
}

module.exports = { addCommentToArticle, getComments, searchComments };

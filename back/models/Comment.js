const connectDB = require("../db/connect");
const { ObjectId } = require("mongodb"); // Import ObjectId

async function addCommentToArticle(articleId, commentData) {
  const db = await connectDB();
  const comment = {
    comment: commentData.comment,
    dateCreated: new Date(),
    user_id: commentData.user_id,
  };
  await db.collection("articles").updateOne(
    { _id: ObjectId(articleId) }, // Convert to ObjectId
    { $push: { comments: comment } }
  );
}

async function getComments(articleId) {
  const db = await connectDB();
  const article = await db.collection("articles").findOne({ _id: ObjectId(articleId) }); // Convert to ObjectId
  return article ? article.comments : [];
}


module.exports = { addCommentToArticle, getComments };

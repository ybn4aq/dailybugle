const connectDB = require("../db/connect");

async function addCommentToArticle(articleId, commentData) {
  const db = await connectDB();
  const comment = {
    comment: commentData.comment,
    dateCreated: new Date(),
    user_id: commentData.user_id,
  };
  await db.collection("articles").updateOne(
    { _id: articleId },
    { $push: { comments: comment } }
  );
}


async function getComments(articleId) {
  const db = await connectDB();
  const article = await db.collection("articles").findOne({ _id: articleId });
  return article ? article.comments : [];
}

module.exports = { addCommentToArticle, getComments };

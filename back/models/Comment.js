const connectDB = require("../db/connect");
const { ObjectId } = require("mongodb"); // Import ObjectId

async function addCommentToArticle(articleId, commentData) {
  try {
    const db = await connectDB();
    const comment = {
      _id: new ObjectId(),
      comment: commentData.comment,
      dateCreated: new Date(),
      user_id: commentData.user_id,
      author: commentData.user_id,
    };
    await db.collection("comments").insertOne(comment); 
    await db.collection("articles").updateOne(
      { _id: new ObjectId(articleId) }, 
      { $push: { comments: comment } }
    );
  } catch (error) {
    console.error("Error in addCommentToArticle:", error);
    throw error; 
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

async function updateArticleComments(articleId, updatedComments) {
  try {
    const db = await connectDB();

    // Iterate over the updatedComments array
    const bulkOps = updatedComments.map((comment) => ({
      updateOne: {
        filter: { _id: new ObjectId(articleId) }, 
        update: {
          $set: {
            "comments.$[elem].comment": comment.text, 
          },
        },
        arrayFilters: [
          { "elem._id": new ObjectId(comment.id) }, 
        ],
      },
    }));
    const bulkOpsComments = updatedComments.map((comment) => ({
      updateOne: {
        filter: { _id: new ObjectId(comment.id) }, 
        update: {
          $set: {
            comment: comment.text, 
          },
        },
      },
    }));

    const result = await db.collection("articles").bulkWrite(bulkOps);
    const commentsResult = await db.collection("comments").bulkWrite(bulkOpsComments);

    return {result, commentsResult};
  } catch (error) {
    console.error("Error in updateComments:", error);
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

module.exports = { addCommentToArticle, getComments, searchComments, updateArticleComments };

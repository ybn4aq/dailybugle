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
    };
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
    const article = await db.collection("articles").findOne({ _id: new ObjectId(articleId) });
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
        filter: { _id: new ObjectId(articleId) }, // Match the article by its ID
        update: {
          $set: {
            "comments.$[elem].comment": comment.text, // Update the comment text
          },
        },
        arrayFilters: [
          { "elem._id": new ObjectId(comment.id) }, // Match the specific comment in the array
        ],
      },
    }));
    const bulkOpsComments = updatedComments.map((comment) => ({
      updateOne: {
        filter: { _id: new ObjectId(comment.id) }, // Match the comment in the comments collection
        update: {
          $set: {
            comment: comment.text, // Update the comment text
          },
        },
      },
    }));

    // Execute all updates as a bulk write
    const result = await db.collection("articles").bulkWrite(bulkOps);
    const commentsResult = await db.collection("comments").bulkWrite(bulkOpsComments);

    return {result, commentsResult};
  } catch (error) {
    console.error("Error in updateComments:", error);
    throw error;
  }
}

module.exports = { addCommentToArticle, getComments, updateArticleComments };
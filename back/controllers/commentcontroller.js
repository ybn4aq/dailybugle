const { addCommentToArticle, getComments, updateArticleComments } = require("../models/Comment");

exports.addComment = async (req, res) => {
  try {
    const commentData = { comment: req.body.comment, user_id: req.body.user_id };
    await addCommentToArticle(req.params.id, commentData);
    res.status(201).json({ message: "Comment added successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await getComments(req.params.id);
    res.status(200).json(comments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const articleId = id;
    const updatedComments = comments;

    // Validate input
    if (!Array.isArray(updatedComments)) {
      return res.status(400).json({ error: "Invalid input format" });
    }

    const result = await updateArticleComments(articleId, updatedComments);

    res.status(200).json({
      message: "Comments updated successfully",
      modifiedCount: result.modifiedCount, // Log the number of modified comments
    });
  } catch (error) {
    console.error("Error in updateComments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


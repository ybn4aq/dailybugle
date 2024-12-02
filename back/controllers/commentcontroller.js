const {
  addCommentToArticle,
  getComments,
  searchComments,
} = require("../models/Comment");

exports.addComment = async (req, res) => {
  try {
    const commentData = {
      comment: req.body.comment,
      user_id: req.body.user_id,
    };
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

exports.getCommentsByName = async (req, res) => {
  try {
    const comments = await searchComments(req.params.name);
    console.log(comments);
    res.status(200).json(comments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

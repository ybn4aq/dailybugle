const { addComment, getComments } = require("../models/Comment");

exports.addComment = async (req, res) => {
  try {
    await addComment(req.params.id, req.body);
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

const { getArticles, getArticleById, createArticle, updateArticle, deleteArticle } = require("../models/article");

exports.getArticles = async (req, res) => {
  try {
    const articles = await getArticles();
    res.status(200).json(articles);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (article) {
      res.status(200).json(article);
    } else {
      res.status(404).json({ error: "Article not found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createArticle = async (req, res) => {
  try {
    await createArticle(req.body);
    res.status(201).json({ message: "Article created successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    await updateArticle(req.params.id, req.body);
    res.status(200).json({ message: "Article updated successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error"});
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    await deleteArticle(req.params.id);
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

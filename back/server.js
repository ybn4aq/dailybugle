const express = require("express");
const cors = require("cors");
const app = express();
const authController = require("./controllers/auth");
const articleController = require("./controllers/articlecontroller");
const commentController = require("./controllers/commentcontroller");
const port = 3002;

app.use(cors());
app.use(express.json());
app.use(express.static("./frontend"));

// Authentication routes
app.post("/login", authController.login);

// Article routes
app.get("/articles", articleController.getArticles);
app.get("/search-articles/:name", articleController.getArticlesByName);
app.get("/articles/:id", articleController.getArticleById);
app.post("/articles", articleController.createArticle);
app.put("/articles/:id", articleController.updateArticle);
app.delete("/articles/:id", articleController.deleteArticle);

// Comment routes
app.post("/articles/:id/comments", commentController.addComment);
app.put("/articles/:id/comments", commentController.updateComments);
app.get("/articles/:id/comments", commentController.getComments);
app.get("/search-comments/:name", commentController.getCommentsByName);

app.listen(port, () => console.log(`Server running on port ${port}`));

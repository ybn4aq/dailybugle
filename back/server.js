// const express = require("express");
// const app = express();

// const { MongoClient } = require("mongodb");
// const uri = "mongodb://localhost:27017";
// const host = "127.0.0.1";
// const client = new MongoClient(uri);
// const port = 3002;

// app.use(express.json());
// app.listen(port, host, () => console.log(`listening on port ${port}`));

// // LOGIN
// app.get("/login", async (request, response) => {
//   const username = request.body.username;
//   const password = request.body.password;
//   try {
//     await client.connect();
//     await client
//       .db("bugle")
//       .collection("users")
//       .findOne({ username: username, password: password })
//       .then((results) => response.send(results))
//       .catch((error) => console.error(error));
//   } catch (e) {
//     console.error(e);
//   } finally {
//     client.close();
//   }
// });


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
app.get("/articles/:id", articleController.getArticleById);
app.post("/articles", articleController.createArticle);
app.put("/articles/:id", articleController.updateArticle);
app.delete("/articles/:id", articleController.deleteArticle);

// Comment routes
app.post("/articles/:id/comments", commentController.addComment);
app.get("/articles/:id/comments", commentController.getComments);

app.listen(port, () => console.log(`Server running on port ${port}`));

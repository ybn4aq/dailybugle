const express = require("express");
const app = express();

const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const host = "127.0.0.1";
const client = new MongoClient(uri);
const port = 3002;

app.use(express.json());
app.listen(port, host, () => console.log(`listening on port ${port}`));

// LOGIN
app.get("/login", async (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  try {
    await client.connect();
    await client
      .db("bugle")
      .collection("users")
      .findOne({ username: username, password: password })
      .then((results) => response.send(results))
      .catch((error) => console.error(error));
  } catch (e) {
    console.error(e);
  } finally {
    client.close();
  }
});

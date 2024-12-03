const { findUser, createUser } = require("../models/user");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUser(username, password);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await findUser(username, password);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const userId = await createUser(username, password);
    res.status(201).json({ message: "User created successfully", userId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};
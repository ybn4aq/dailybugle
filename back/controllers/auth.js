const { findUser } = require("../models/user");

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

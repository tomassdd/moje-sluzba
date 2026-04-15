const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("SERVER FUNGUJE");
});

app.listen(8081, "0.0.0.0");

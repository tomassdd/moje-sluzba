const path = require("path");
const express = require("express");
const app = express();
const port = 8081;
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("data.db");


app.use(express.json());
app.use(express.static(__dirname));

app.get("/ping", (req, res) => {
	res.send("pong ");
});

app.get("/status", (req, res) => {
	res.json({
		status: "ok",
		autor: "Tom",
		cas: new Date()
	});
});

const fetch = require("node-fetch");

app.post("/ai", async (req, res) => {
	const prompt = req.body.prompt || "Ahoj";

	try {
		const response = await fetch("https://kurim.ithope.eu/v1/chat/completions", {
		method: "POST",
		headers: {
		 "Content-Type": "application/json",
		  "Authorization": "Bearer sk--doFqwqtDa8xaBYqlDJJpg"
		},
		body: JSON.stringify({
    	model: "gemma3:27b",
   		messages: [
      	{ role: "user", content: prompt }
    ]
  })
});
		
	const data = await response.json();

	res.json({
	 odpoved: data.choices[0].message.content
});
} catch (err) {
	res.json({ error: "AI chyba" });
}
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;
	
app.post("/register", (req, res) => {
  const { username, password } = req.body;
	
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT
    )
  `);
});

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    function (err) {
      if (err) {
        return res.json({ error: "Chyba" });
      }
      res.json({ msg: "OK" });
    }
  );
});
  db.get(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, row) => {
      if (row) {
        res.json({ msg: "OK" });
      } else {
        res.status(401).json({ error: "Špatné údaje" });
      }
    }
  );
});

app.listen(port,"0.0.0.0", () => {
	console.log("Server bezi na portu  " + port);
});

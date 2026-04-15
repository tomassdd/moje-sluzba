const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ===== DB (bezpečná cesta)
const db = new sqlite3.Database("/tmp/data.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT
    )
  `);
});

// ===== TEST
app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

// ===== REGISTER
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    function (err) {
      if (err) return res.json({ error: "DB chyba" });
      res.json({ msg: "OK" });
    }
  );
});

// ===== LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

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

// ===== AI (BEZ node-fetch)
app.post("/ai", async (req, res) => {
  const prompt = req.body.prompt || "Ahoj";

  try {
    const response = await fetch("https://kurim.ithope.eu/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.sk--doFq...JJpg

      },
      body: JSON.stringify({
        model: "gemma3:27b",
        messages: [
          { role: "system", content: "Odpovídej jednou krátkou větou." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    res.json({
      odpoved: data.choices?.[0]?.message?.content || "AI neodpověděla"
    });

  } catch (err) {
    res.json({ error: "AI chyba" });
  }
});

// ===== START
app.listen(8081, "0.0.0.0", () => {
  console.log("Server běží");
});

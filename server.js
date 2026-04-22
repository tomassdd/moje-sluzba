const path = require("path");
const express = require("express");
const fetch = require("node-fetch");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = 8081;

// Konfigurace z proměnných prostředí
const SECRET_KEY = process.env.SECRET_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// Připojení k PostgreSQL
const pool = new Pool({ connectionString: DATABASE_URL });

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pro podporu běžných formulářů
app.use(express.static(__dirname));

// Automatické vytvoření tabulky při startu serveru
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);
        console.log("✅ Databáze inicializována.");
    } catch (err) {
        console.error("❌ Chyba připojení k DB. Zkouším to znovu...", err.message);
        setTimeout(initDB, 5000); // Docker db může chvíli startovat
    }
}
initDB();

// Middleware pro kontrolu JWT tokenu
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Chybí token, přihlaste se" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Neplatný nebo vypršelý token" });
        req.user = user;
        next();
    });
}

// --- Endpointy ---

app.get("/ping", (req, res) => res.send("pong "));
app.get("/status", (req, res) => res.json({ status: "ok", autor: "Tom", cas: new Date() }));

// Registrace
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) return res.status(400).json({ error: "Uživatel již existuje" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
        res.json({ message: "Registrace úspěšná" });
    } catch (err) {
        res.status(500).json({ error: "Interní chyba databáze" });
    }
});

// Přihlášení
app.post("/token", async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) return res.status(400).json({ error: "Nesprávné jméno nebo heslo" });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Nesprávné jméno nebo heslo" });

        const accessToken = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ access_token: accessToken });
    } catch (err) {
        res.status(500).json({ error: "Interní chyba databáze" });
    }
});

// Chráněný AI Endpoint (vyžaduje token)
app.post("/ai", authenticateToken, async (req, res) => {
    const prompt = req.body.prompt || "Ahoj";
    try {
        const response = await fetch("https://kurim.ithope.eu/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer sk--doFqwqtDa8xaBYqlDJJpg"
                // Tip: V produkci je lepší API klíč schovat do proměnné prostředí
            },
            body: JSON.stringify({
                model: "gemma3:27b",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        res.json({ odpoved: data.choices[0].message.content });
    } catch (err) {
        res.json({ error: "AI chyba připojení k externímu API" });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log("🚀 Server bezi na portu " + port);
});
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));

const pool = new Pool({
    user: "postgres",       // твоят PostgreSQL username
    host: "localhost",
    database: "testdb",     // името на твоята база
    password: "123123",   // твоят PostgreSQL password
    port: 7172,
});

// REGISTER
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        await pool.query(
            "INSERT INTO users(username, password) VALUES($1,$2)",
            [username, hash]
        );
        res.send("Registered!");
    } catch (err) 
    {
        console.error(err);
        res.send("Couldn't create user, try again later.");
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
    );

    if (!result.rows.length) {
        return res.send("User not found");
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return res.send("Wrong password");
    }

    req.session.userId = user.id;

    res.send("Logged in!");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
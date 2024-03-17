const express = require("express");
const bodyParser = require("body-parser");
const mariadb = require("mariadb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const app_port = process.env.PORT || 3000;

// Read database credentials from environment variables
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const connectionLimit = 15; // Adjust as needed

const APIRouter = require("./src/routers/apirouter.js");

app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  })
);

async function createConnection() {
  try {
    const pool = mariadb.createPool({
      host,
      port,
      user,
      password,
      database,
      connectionLimit,
    });

    return pool;
  } catch (err) {
    console.error("Error connecting to database:", err);
    //throw err; // Re-throw the error for proper handling
  }
}

/* EXAMPLE OF USING CONNECTION POOL

const pool = await createConnection();
const rows = await pool.query("SELECT * from users");
await pool.end();
*/

app.use("/api", APIRouter);

app.listen(app_port, () => {
  console.log(`Example app listening at http://localhost:${app_port}`);
});

// middleware/sessionMiddleware.js
const session = require("express-session");
let MySqlStore = require("express-mysql-session")(session);
require("dotenv").config();

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

const options = {
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
};

const store = new MySqlStore(options);

module.exports = session({
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});

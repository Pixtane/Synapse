const mariadb = require("mariadb");
require("dotenv").config();

class Database {
  constructor(config) {
    this.config = config;
    this.pool = null; // Initialize pool later

    process.on("SIGINT", () => {
      this.closePool();
      process.exit();
    });

    this.setupReconnection();
  }

  escapeSpecialCharacters(text) {
    const escapeMap = {
      "\0": "\\0",
      "'": "\\'",
      '"': '\\"',
      "\b": "\\b",
      "\n": "\\n",
      "\r": "\\r",
      "\t": "\\t",
      "\u001A": "\\Z",
      "\\": "\\\\",
      "%": "\\%",
      _: "\\_",
    };

    return text.replace(/[\0\'\"\b\n\r\t\u001A\\%_]/g, function (match) {
      return escapeMap[match];
    });
  }

  async connect() {
    try {
      if (this.pool === null) {
        this.pool = mariadb.createPool(this.config);
      }
      const connection = await this.pool.getConnection();
      //console.log("Successful connection to the database");
      return connection;
    } catch (err) {
      console.error("Error connecting to the database:", err);
      throw err;
    }
  }

  async query(sql, parameters = []) {
    const connection = await this.connect();

    try {
      console.log("Executing query:", sql);
      const data = await connection.execute(sql, parameters);
      return data;
    } catch (err) {
      console.error("Error executing query:", err);
      throw err;
    } finally {
      connection.release();
    }
  }

  async checkConnection() {
    try {
      const connection = await this.connect();
      await connection.ping();
      connection.release();
    } catch (error) {
      console.error("Error checking connection:", error);
      console.log("Reconnecting to the database");
    }
  }

  insert(table, data, paramaters = []) {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ");

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${values})`;

    return this.query(sql, paramaters);
  }

  select(table, columns = "*", condition = "", paramaters = []) {
    const sql = `SELECT ${columns} FROM ${table} ${condition}`;
    return this.query(sql, paramaters);
  }

  delete(table, condition = "", paramaters = []) {
    const sql = `DELETE FROM ${table} WHERE ${condition}`;
    return this.query(sql, paramaters);
  }

  update(table, UnfilteredData, condition = "", paramaters = []) {
    const data = Object.fromEntries(
      Object.entries(UnfilteredData).filter(
        ([key, value]) => value !== undefined
      )
    );

    const columns = Object.keys(data)
      .map((key) => `${key} = '${data[key]}'`)
      .join(", ");

    const sql = `UPDATE ${table} SET ${columns} ${
      condition !== "" ? "WHERE" : ""
    } ${condition}`;
    return this.query(sql, paramaters);
  }

  async closePool() {
    if (this.pool) {
      await this.pool.end();
      console.log("Connection pool closed");
    }
  }

  setupReconnection() {
    setInterval(async () => {
      await this.checkConnection();
    }, 24 * 60 * 60 * 1000);
  }
}

const sharedDatabase = new Database({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 300,
  queueLimit: 0,
});

module.exports = sharedDatabase;

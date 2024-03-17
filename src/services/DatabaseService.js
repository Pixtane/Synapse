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

  async connect() {
    try {
      if (this.pool === null) {
        this.pool = mariadb.createPool(this.config);
      }
      const connection = await this.pool.getConnection();
      console.log("Successful connection to the database");
      return connection;
    } catch (err) {
      console.error("Error connecting to the database:", err);
      throw err;
    }
  }

  async query(sql) {
    const connection = await this.connect();

    try {
      console.log("Executing query:", sql);
      const data = await connection.execute(sql);

      if (Array.isArray(data)) {
        const [results] = data; // Destructure only if it's an array
        return results;
      } else {
        const results = data; // Assign the entire object otherwise
        return results;
      }
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

  insert(table, data) {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ");

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${values})`;

    return this.query(sql);
  }

  select(table, columns = "*", condition = "") {
    const sql = `SELECT ${columns} FROM ${table} ${condition}`;
    return this.query(sql);
  }

  delete(table, condition = "") {
    const sql = `DELETE FROM ${table} ${condition}`;
    return this.query(sql);
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

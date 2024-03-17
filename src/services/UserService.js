const fs = require("fs");
const bcrypt = require("bcrypt");
const util = require("util");

const sharedDatabase = require("../services/DatabaseService");
require("dotenv").config();

function no(object) {
  if (!object || object == "" || object == null || object == undefined) {
    return true;
  }
  return false;
}

function emailCheck(email) {
  const re =
    /^(?=.{1,254}$)(([^<>()\[\]\\.,;:\s@"]+(\.[^<;>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function usernameCheck(username) {
  const re = /^[A-Za-z][A-Za-z0-9_]{5,30}$/;
  return re.test(String(username));
}

function passwordCheck(password) {
  // At least one letter and one number, 7 to 29 characters
  const re = /^((?=.*?[a-z])|(?=.*?[A-Z]))(?=.*?[0-9]).{7,29}/;
  return re.test(String(password));
}

class UserService {
  async getUsersFromDb() {
    try {
      const userData = fs.readFileSync("src/config/users.json", "utf8");
      return JSON.parse(userData);
    } catch (error) {
      return [];
    }
  }

  async selectUserFromDB(username, email) {
    try {
      let data = "WHERE ";
      if (email) {
        data += `email = '${email}'`;
      } else if (username) {
        data += `name = '${username}'`;
      }

      return sharedDatabase
        .select("users", "id, password", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error inserting user:", err);
        });
    } catch (error) {
      return false;
    }
  }

  async writeUserToDb(email, username, password) {
    try {
      const data = {
        name: username,
        email: email,
        password: password,
      };

      return sharedDatabase
        .insert("users", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error inserting user:", err);
        });
    } catch (error) {
      return false;
    }
  }

  validateData(email, username, password, checkusername = true) {
    try {
      if (no(email) || (checkusername ? no(username) : false) || no(password)) {
        return { status: 400, message: "bad request" };
      }
      if (!emailCheck(email)) {
        return { status: 400, message: "bad request: invalid email" };
      }
      if (!usernameCheck(username) && checkusername) {
        return { status: 400, message: "bad request: invalid username" };
      }
      if (!passwordCheck(password)) {
        return { status: 400, message: "bad request: invalid password" };
      }
      return { status: 200, message: "success" };
    } catch (error) {
      return { status: 500, message: "internal error" };
    }
  }

  async signUp(email, username, password) {
    let validationResult = this.validateData(email, username, password);
    if (validationResult.status != 200) {
      return validationResult;
    }

    try {
      // Check for existing username
      const existingUsername = await this.selectUserFromDB(username, null);
      if (!no(existingUsername)) {
        return {
          status: 400,
          message: "bad request: username already exists",
        };
      }

      // Check for existing email
      const existingEmail = await this.selectUserFromDB(null, email);
      if (existingEmail) {
        return {
          status: 400,
          message: "bad request: email already exists",
        };
      }

      //#region hashing password
      let saltRounds = Number(process.env.SALT_ROUNDS);

      const salt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(password, salt);
      //#endregion

      const writeResult = await this.writeUserToDb(
        email,
        username,
        hashPassword
      );

      if (!writeResult) {
        return {
          status: 500,
          message: "internal error: unable to write users",
        };
      }

      return { status: 200, message: "success" };
    } catch (error) {
      console.error(error);
      return { status: 500, message: "internal error" };
    }
  }

  async signIn(email, password) {
    try {
      let validationResult = this.validateData(email, null, password, false);

      if (validationResult.status != 200) {
        return validationResult;
      }

      let user = await this.selectUserFromDB(null, email);
      if (!user) {
        return { status: 404, message: "user not found" };
      }

      const passwordHashBuffer = Buffer.from(user.password, "binary");
      const passwordHashString = passwordHashBuffer.toString("binary");

      const match = await bcrypt.compare(password, passwordHashString);
      if (!match) {
        return { status: 401, message: "invalid credentials" };
      }
      return { status: 200, message: "success" };
    } catch (error) {
      console.error(error);
      return { status: 500, message: "internal error" };
    }
  }
}

module.exports = new UserService();

const bcrypt = require("bcrypt");

const sharedDatabase = require("../services/DatabaseService");
require("dotenv").config();

class UserService {
  no(object) {
    if (!object || object == "" || object == null || object == undefined) {
      return true;
    }
    return false;
  }

  emailCheck(email) {
    const re =
      /^(?=.{1,254}$)(([^<>()\[\]\\.,;:\s@"]+(\.[^<;>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  usernameCheck(username) {
    const re = /^[A-Za-z][A-Za-z0-9_]{5,30}$/;
    return re.test(String(username));
  }

  passwordCheck(password) {
    // At least one letter and one number, 7 to 29 characters
    const re = /^((?=.*?[a-z])|(?=.*?[A-Z]))(?=.*?[0-9]).{7,29}/;
    return re.test(String(password));
  }

  async hashPassword(password) {
    let saltRounds = Number(process.env.SALT_ROUNDS);

    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
  }

  async delete(userId) {
    try {
      return sharedDatabase
        .delete("users", "id = " + userId)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error deleting user:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async getData(userId) {
    try {
      let data = "WHERE id = " + userId;

      return sharedDatabase
        .select("users", "*", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error selecting user:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async searchUsers(query) {
    try {
      if (typeof query !== "string") {
        return false;
      }
      const safeQuery = query.replace(/[^a-zA-Z0-9\s_]/g, "");

      /* Some magic shit, idk why but fulltext index doesn't work and refuses to give anything
      It is much slower and doesn't use indexing, but it works
      .select(
          "users",
          "id, name, email, avatar",
          "WHERE MATCH(name) AGAINST('+" + safeQuery + "' IN BOOLEAN MODE);"
        )
      */
      return sharedDatabase
        .select(
          "users",
          "id, name, email, avatar",
          "WHERE LOWER(name) LIKE LOWER('%" + safeQuery + "%');"
        )
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error selecting user:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
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
      if (
        this.no(email) ||
        (checkusername ? this.no(username) : false) ||
        this.no(password)
      ) {
        return { status: 400, message: "bad request" };
      }
      if (!this.emailCheck(email)) {
        return { status: 400, message: "bad request: invalid email" };
      }
      if (!this.usernameCheck(username) && checkusername) {
        return { status: 400, message: "bad request: invalid username" };
      }
      if (!this.passwordCheck(password)) {
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
      if (!this.no(existingUsername)) {
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

      const hashPassword = await this.hashPassword(password);

      const writeResult = await this.writeUserToDb(
        email,
        username,
        hashPassword
      );

      console.log("writeResult", writeResult);
      console.log("writeResult.insertId", Number(writeResult.insertId));

      if (!writeResult) {
        return {
          status: 500,
          message: "internal error: unable to write users",
        };
      }

      return {
        status: 200,
        message: "success",
        session: Number(writeResult.insertId),
      };
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
      return { status: 200, message: "success", session: user.id };
    } catch (error) {
      console.error(error);
      return { status: 500, message: "internal error" };
    }
  }

  async updateUser(name, email, avatar, password, userId) {
    try {
      const data = {
        name: name,
        email: email,
        avatar: avatar,
        password: password,
      };

      return sharedDatabase
        .update("users", data, `id = ${userId}`)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error updating user:", err);
        });
    } catch (error) {
      return false;
    }
  }
}

module.exports = new UserService();

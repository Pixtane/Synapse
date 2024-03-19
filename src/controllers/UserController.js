const service = require("../services/UserService.js");

class UserController {
  async test(req, res) {
    console.log(req);
    res.status(200).send({ status: 200 });
  }

  async getData(userId) {
    return await service.getData(userId);
  }

  async searchUsers(query) {
    return await service.searchUsers(query);
  }

  async deleteAccount(userId) {
    return await service.delete(userId);
  }

  async update(name, email, avatar, password, userId) {
    let response = { message: "Updated ", status: 200 };
    let hashPassword;

    if (name) {
      if (!service.usernameCheck(name)) {
        return { status: 400, message: "bad request: invalid username" };
      }
      if (!service.no(await service.selectUserFromDB(name, null))) {
        return { status: 400, message: "bad request: username already exists" };
      }
      response.message += "name ";
    }

    if (email) {
      if (!service.emailCheck(email)) {
        return { status: 400, message: "bad request: invalid email" };
      }
      if (!service.no(await service.selectUserFromDB(null, email))) {
        return { status: 400, message: "bad request: email already exists" };
      }
      response.message += "email ";
    }

    if (password) {
      if (!service.passwordCheck(password)) {
        return { status: 400, message: "bad request: invalid password" };
      }
      hashPassword = await service.hashPassword(password);
      response.message += "password ";
    }

    await service.updateUser(name, email, avatar, hashPassword, userId);

    response.message += "successfully!";

    return response;
  }

  async signUp(req, res) {
    const data = req.body;
    console.log("controller data", data);
    if (!data || !data.email || !data.username || !data.password) {
      return res.status(400).send({ status: 400, message: "Bad request" });
    }
    const responseData = await service.signUp(
      data.email,
      data.username,
      data.password
    );
    console.log(responseData);
    return responseData;
  }

  async signIn(req, res) {
    const data = req.body;
    console.log("controller login data", data);
    if (!data || !data.email || !data.password) {
      return res.status(400).send({ status: 400, message: "Bad request" });
    }
    const responseData = await service.signIn(data.email, data.password);
    console.log("login response data", responseData);
    return responseData;
  }
}

module.exports = new UserController();

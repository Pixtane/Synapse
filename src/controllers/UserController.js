const service = require("../services/UserService.js");

class UserController {
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

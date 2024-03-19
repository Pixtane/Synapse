const userService = require("../services/UserService.js");
const postService = require("../services/PostService.js");

class PostController {
  async createPost(req, res, userId) {
    const data = req.body;
    console.log("controller login data", data);
    if (!data || !data.title) {
      return res.status(400).send({ status: 400, message: "Bad request" });
    }
    const responseData = await postService.createPost(
      userId,
      data.title,
      data.body
    );
    return responseData;
  }
}

module.exports = new PostController();

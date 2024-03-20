const userService = require("../services/UserService.js");
const postService = require("../services/PostService.js");

class PostController {
  async getData(postId) {
    return await postService.getData(postId);
  }

  async deletePost(postId) {
    return await postService.deletePost(postId);
  }

  async createPost(req, res, userId) {
    const data = req.body;
    if (!data || !data.title) {
      return res.status(400).send({ status: 400, message: "Bad request" });
    }
    const responseData = await postService.createPost(
      userId,
      data.title,
      data.body
    );

    if (responseData) {
      return { status: 201, message: "Post created successfully" };
    } else {
      return { status: 204, message: "Success" };
    }
  }
}

module.exports = new PostController();

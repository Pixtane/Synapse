const commentService = require("../services/CommentService.js");

class CommentController {
  async getCommentsOnPost(commentId) {
    return await commentService.getCommentsOnPost(commentId);
  }

  async getComment(commentId) {
    return await commentService.getComment(commentId);
  }

  async deleteComment(commentId) {
    return await commentService.deleteComment(commentId);
  }

  async createComment(req, res, userId) {
    const data = req.body;
    if (
      !data ||
      !data.comment ||
      !data.post_id ||
      typeof Number(data.post_id) !== "number"
    ) {
      return res.status(400).send({ status: 400, message: "Bad request" });
    }
    const responseData = await commentService.createComment(
      userId,
      Number(data.post_id),
      data.comment
    );

    if (responseData) {
      return { status: 201, message: "Comment created successfully" };
    } else {
      return { status: 204, message: "Success" };
    }
  }
}

module.exports = new CommentController();

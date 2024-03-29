const commentController = require("../controllers/CommentController");

const Router = require("express").Router;

const router = new Router();

function statusData(res, responseData) {
  res.status(responseData.status || 400).send({
    status: responseData.status || 400,
    message: responseData.message || "No message",
  });
}

router.get("/get/:postid", async (req, res) => {
  // Get data for any account
  const postId = Number(req.params.postid);
  if (typeof postId !== "number") {
    res.status(400).send({ status: 400, message: "Bad request" });
    return;
  }
  let data = await commentController.getCommentsOnPost(postId);
  if (!data || data.length === 0) {
    res
      .status(404)
      .send({ status: 404, message: "Post or comments not found" });
    return;
  }
  if (typeof data !== "object") {
    res.status(500).send({
      status: 500,
      message: "Internal server error. Data is not an object",
    });
    return;
  }
  res.status(200).send({ status: 200, data: data });
});

router.delete("/delete/:commentid", async (req, res) => {
  // Get data for any account
  const commentId = Number(req.params.commentid);
  if (typeof commentId !== "number") {
    res.status(400).send({ status: 400, message: "Bad request" });
    return;
  }

  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }

  let [comment] = await commentController.getComment(commentId);
  if (!comment) {
    res.status(404).send({ status: 404, message: "Comment not found" });
    return;
  }
  if (comment.user_id !== userId) {
    res.status(401).send({
      status: 401,
      message: "Unauthorized (contact admin if commented anonymously)",
    });
    return;
  }

  let data = await commentController.deleteComment(commentId);

  if (
    !data ||
    data.length === 0 ||
    (typeof data === "object" && data.affectedRows === 0n)
  ) {
    res.status(404).send({ status: 404, message: "Comment not found." });
    return;
  }

  if (typeof data !== "object") {
    // 204 for "Something went wrong but hope everything is okay"
    res.status(204).send({
      status: 204,
      info: "Success",
    });
    return;
  }

  res.status(200).send({ status: 200, info: "Successfully deleted comment." });
});

router.post("/create", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }

  const responseData = await commentController.createComment(req, res, userId);
  statusData(res, responseData);
});

module.exports = router;

const userController = require("../controllers/UserController");

const postController = require("../controllers/PostController");

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
  let [data] = await postController.getData(postId);
  if (!data || data.length === 0 || !data.title) {
    res.status(404).send({ status: 404, message: "Post not found" });
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

router.delete("/delete/:postid", async (req, res) => {
  // Get data for any account
  const postId = Number(req.params.postid);
  if (typeof postId !== "number") {
    res.status(400).send({ status: 400, message: "Bad request" });
    return;
  }

  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }

  let [post] = await postController.getData(postId);
  if (!post || post.length === 0 || !post.title) {
    res.status(404).send({ status: 404, message: "Post not found" });
    return;
  }
  if (post.user_id !== userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }

  let data = await postController.deletePost(postId);
  console.log(data);

  if (
    !data ||
    data.length === 0 ||
    (typeof data === "object" && data.affectedRows === 0n)
  ) {
    res.status(404).send({ status: 404, message: "Post not found." });
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

  res.status(200).send({ status: 200, info: "Successfully deleted post." });
});

router.post("/create", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }

  const responseData = await postController.createPost(req, res, userId);
  statusData(res, responseData);
});

module.exports = router;

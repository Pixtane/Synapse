const likeController = require("../controllers/LikeController");

const Router = require("express").Router;

const router = new Router();

function statusData(res, responseData) {
  res.status(responseData.status || 400).send({
    status: responseData.status || 400,
    message: responseData.message || "No message",
  });
}

router.get("/get/:postid", async (req, res) => {
  // Get data for any post
  const postId = Number(req.params.postid);
  if (typeof postId !== "number") {
    res.status(400).send({ status: 400, message: "Bad request" });
    return;
  }
  let data = await likeController.getLikesOnPost(postId);
  if (!data || data.length === 0) {
    res.status(404).send({ status: 404, message: "Post or likes not found" });
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

  let [like] = await likeController.getLikeOnPost(postId, userId);
  if (!like) {
    res.status(404).send({ status: 404, message: "Like not found" });
    return;
  }
  if (like.user_id !== userId) {
    res.status(401).send({
      status: 401,
      message: "Unauthorized (contact admin if liked anonymously)",
    });
    return;
  }

  let data = await likeController.deleteLike(like.id);

  if (
    !data ||
    data.length === 0 ||
    (typeof data === "object" && data.affectedRows === 0n)
  ) {
    res
      .status(500)
      .send({ status: 500, message: "Internal server error. DB failed." });
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

  res.status(200).send({ status: 200, info: "Successfully deleted like." });
});

router.put("/create/:postid", async (req, res) => {
  // Get data for any account
  const postid = Number(req.params.postid);
  if (typeof postid !== "number") {
    res.status(400).send({ status: 400, message: "Bad request" });
    return;
  }

  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }

  // Check if like is already placed, if it is ignore. You can't place more than 1 like

  let [like] = await likeController.getLikeOnPost(postid, userId);
  console.log(like);
  if (like) {
    res.status(410).send({ status: 410, message: "Already liked" });
    return;
  }

  const responseData = await likeController.createLike(userId, postid);
  statusData(res, responseData);
});

module.exports = router;

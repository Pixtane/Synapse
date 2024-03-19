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

router.post("/create", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }
  const responseData = await postController.createPost(req, res, userId);
  statusData(res, responseData);
});

router.get("/data", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }
  let data = await controller.getData(userId);
  res.status(200).send({ status: 200, data: data });
});

module.exports = router;

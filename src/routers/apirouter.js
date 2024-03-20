const controller = require("../controllers/UserController");

const Router = require("express").Router;

const POSTRouter = require("./postrouter");

const router = new Router();

router.use("/post", POSTRouter);

function statusData(res, responseData) {
  res.status(responseData.status || 400).send({
    status: responseData.status || 400,
    message: responseData.message || "No message",
  });
}

router.get("/data", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }
  let data = await controller.getData(userId);
  res.status(200).send({ status: 200, data: data });
});

router.post("/test", (req, res) => {
  console.log("testing...");
  controller.test(req, res);
});

router.post("/search-users", async (req, res) => {
  let query = req.body.query;

  let data = await controller.searchUsers(query);
  res.status(200).send({ status: 200, data: data });
});

router.delete("/delete-account", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }
  const responseData = await controller.deleteAccount(userId);
  console.log(responseData, typeof responseData);
  res.status(200).send({ status: 200, message: "Account deleted" });
});

router.post("/update", async (req, res) => {
  const body = req.body;

  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send({ status: 401, message: "Unauthorized" });
    return;
  }

  if (!body) {
    res.status(400).send({ status: 400, message: "Bad request" });
    return;
  }
  const name = body.username;
  const email = body.email;
  const avatar = body.avatar;
  const password = body.password;

  if (!(name || email || avatar || password)) {
    res.status(400).send({
      status: 400,
      message: "Bad request. Provide at least one field to update.",
    });
    return;
  }

  const responseData = await controller.update(
    name,
    email,
    avatar,
    password,
    userId
  );
  statusData(res, responseData);
});

router.post("/register", async (req, res) => {
  const responseData = await controller.signUp(req, res);
  console.log(responseData);
  if (!responseData) {
    return;
  }
  if (!responseData.session) {
    console.error("Error creating session:", responseData);
    res.status(500).send({
      status: 500,
      message: "Internal server error. Couldn't create session.",
    });
  }
  req.session.userId = responseData.session;
  statusData(res, responseData);
});

router.post("/login", async (req, res) => {
  const responseData = await controller.signIn(req, res);
  console.log(responseData);
  if (!responseData) {
    return;
  }
  req.session.userId = responseData.session;
  statusData(res, responseData);
});

module.exports = router;

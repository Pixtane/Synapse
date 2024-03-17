const controller = require("../controllers/UserController");

const Router = require("express").Router;

const router = new Router();

function statusData(res, responseData) {
  res.status(responseData.status || 400).send({
    status: responseData.status || 400,
    message: responseData.message || "No message",
  });
}

router.post("/register", async (req, res) => {
  const responseData = await controller.signUp(req, res);
  console.log(responseData);
  if (!responseData) {
    return;
  }
  statusData(res, responseData);
});

router.post("/login", async (req, res) => {
  const responseData = await controller.signIn(req, res);
  console.log(responseData);
  if (!responseData) {
    return;
  }
  statusData(res, responseData);
});

module.exports = router;

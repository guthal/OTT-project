const router = require("express").Router();
const Account = require("../model/Account");

router.post("/", (req, res) => {
  Account.create({});
});

module.exports = router;

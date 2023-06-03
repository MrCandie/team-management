const express = require("express");
const middleware = require("../middleware");
const teamController = require("../controllers/teamController");

const router = express.Router();

router.route("/").post(middleware.protect, teamController.createTeam);
router.post(
  "/send-invitation/:teamId",
  middleware.protect,
  teamController.sendInvitation
);

router.post(
  "/accept-invitation/:teamId",
  middleware.protect,
  teamController.acceptInvitation
);

router.post(
  "/reject-invitation/:teamId",
  middleware.protect,
  teamController.rejectInvitation
);

router.post(
  "/leave-team/:teamId",
  middleware.protect,
  teamController.leaveTeam
);

router.post(
  "/remove-member",
  middleware.protect,
  teamController.removeMemberFromTeam
);
module.exports = router;

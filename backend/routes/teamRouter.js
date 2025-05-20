const router = require("express").Router();
const { getTeams, createTeam, joinTeam, deleteTeam } = require("../controllers/teams_controller");


router.route("/")
    .get(getTeams)
    .post(createTeam);

router.route("/:teamId")
    .patch(joinTeam)
    .delete(deleteTeam);


module.exports = router;
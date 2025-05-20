//MainRouter.js
const router = require('express').Router()
const hackathons = require('../controllers/hackathons_controller')
const { protectRoute } = require('../controllers/auth_controller');
const authRouter = require("./authRouter")
const teamRouter = require('./teamRouter')


router.route('/hackathons')
    .post(hackathons.update_hackathons)
    .get(hackathons.get_hackathons);

router.use('/auth', authRouter);

router.use('/teams',protectRoute, teamRouter);


module.exports = router
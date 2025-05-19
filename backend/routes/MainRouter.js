//MainRouter.js
const router = require('express').Router()
const hackathons = require('../controllers/hackathons_controller')
const authRouter = require("./authRouter")


router.route('/hackathons')
    .post(hackathons.update_hackathons)
    .get(hackathons.get_hackathons);


router.use('/auth', authRouter);




module.exports = router
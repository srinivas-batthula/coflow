//MainRouter.js
const router = require('express').Router()
const hackathons = require('../controllers/hackathons_controller')


router.route('/hackathons')
    .post(hackathons.update_hackathons)
    .get(hackathons.get_hackathons);



module.exports = router
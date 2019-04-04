const express = require('express');
const router = express.Router();
const controller = require('./controller')

//////////
router.post('/tms/api/tracking',
    controller.inserTracking(),
    async (req, res) => {
        res.status(200).json({ success: true })
    })



module.exports = router;
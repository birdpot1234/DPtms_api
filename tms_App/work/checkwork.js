const express = require('express');
const router = express.Router();
const controller = require('./controller')

//////////
router.post('/tms/api/confirmsome',
    controller.insertAppWorkApp(),
    controller.updateBillToApp(),
    async (req, res) => {
        res.status(200).json({ success: true })
    })



module.exports = router;
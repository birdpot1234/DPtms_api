const express = require('express');
const router = express.Router();

const controller = require('./controller')
const moment = require('moment');
const con = require('../connect_sql')


/*####################### SHIPMENT #######################*/
router.get('/test/restart',
    controller.restart(),
    (req, res, next) => {
        res.status(200).json({ success: true, result: req.result })
    })

router.get('/test/update',
    controller.update(),
    (req, res, next) => {
        res.status(200).json({ success: true, result: req.result })
    })



module.exports = router;
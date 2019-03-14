const express = require('express');
const router = express.Router();

const controller = require('./tracking')
const moment = require('moment');
const con = require('../connect_sql')


/*####################### SHIPMENT #######################*/
router.get('/dhl/api/shipment',
    (req, res, next) => {
        res.status(200).json({ success: true, result: req.result })
    })



module.exports = router;
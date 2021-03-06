const express = require('express');
const app = express();
const morgan = require('morgan');
const moment = require('moment')
require('moment/locale/th')
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const socketio = require('socket.io');
const show_tsc = require('./api/tsc/show_tsc');
const regis_1 = require('./tms_App/tms_registstep_1');
const regis_2 = require('./tms_App/tms_registstep_2');
const regis_3 = require('./tms_App/tms_registstep_3');
const info = require('./kerry_api/info');
const dhl_info = require('./dhl_api/info');
const test = require('./test_api/route')
const update_status = require('./kerry_api/update_status');
const tms_assign = require('./tms_App/tms_assignToMass');
const confirmwork = require('./tms_App/work/checkwork');    /* [##############################################] */
const trackingApp = require('./tms_App/tracking/tracking'); /* [##############################################] */
const api_geocoding = require('./tms_App/api_geocoding');
const api_uploadslip = require('./tms_App/tms_uploadslip');
const dhl_creation = require('./dhl_api/shipmentCreation')
// const api_checkEmail = require('./tms_App/tms_EvaluationForm/tms_checkEmail');
// const api_insertEmail = require('./tms_App/tms_EvaluationForm/tms_insertEmail');
// const api_updateEmail = require('./tms_App/tms_EvaluationForm/tms_updateEmail');

// controller tracking
const tracking = require('./dhl_api/tracking');

////Body parser 
app.use(morgan('dev'));
app.use('/upload', express.static('upload'));
app.use('/images', express.static('images'));
//app.use('/',express.static('regis_1'));
app.use(bodyParser.urlencoded({ extended: true, limit: 1024 * 1024 * 20, type: 'application/x-www-form-urlencoding' }));
app.use(bodyParser.json({ limit: 1024 * 1024 * 2000, type: 'application/json' }));

//-------Modify by SamuraiiHot 2018-10-31
const cors = require('cors')
app.use(cors())
const web_api = require("./tms_api_web/routes")
app.use("/web-api", web_api)
const app_api = require("./tms_App/routes")
app.use("/app-api", app_api)
//-------Modify by SamuraiiHot 2018-10-31

app.use('/show_tsc', show_tsc);
app.use('/', regis_1);
app.use('/', regis_2);
app.use('/', regis_3);
app.use("/", web_api)
app.use("/", info);
app.use("/", update_status);
app.use("/", tms_assign);
app.use("/", api_geocoding);
app.use("/", api_uploadslip);

app.use("/", confirmwork); /* [##############################################] */
app.use("/", trackingApp); /* [##############################################] */
// app.use("/", api_checkEmail);
// app.use("/", api_insertEmail);
app.use("/", dhl_info); // dhl
app.use("/", test);
app.use("/", dhl_creation);
// app.use("/", api_updateEmail);
app.get('/', (req, res) => {
    res.render('index');
})

//Error url send//
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    console.log(error)
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

/*####################### SCHEDULE TRACKING DHL #######################*/
// schedule.scheduleJob("0 */1 * * * *", async () => {
//     console.log("Schedule :::", moment().format())
//     await tracking.tracking();
// })

module.exports = app;

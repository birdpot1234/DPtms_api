const con = require('../connect_sql')
const sql = require('mssql')
const moment = require('moment')

const messenger = "AA"
exports.restart = () => async (req, res, next) => {
    let pool = await new sql.ConnectionPool(con.condb1()).connect();
    pool.on("error", err => { throw (err) })
    await pool;
    try {
        const _sql = `SELECT TOP(20) INVOICEID, datetime FROM BillToApp WHERE MessengerID='${messenger}' ORDER BY datetime DESC`
        let result = await pool.request().query(_sql)
        let arrInv = result.recordset;
        let datetime = moment().format("YYYY-MM-DD HH:mm:ss");

        await Promise.all([
            arrInv.map(async el => {
                let { INVOICEID } = el
                const upSql = `UPDATE BillToApp SET datetime='${datetime}', status_receive='0', update_billtoapp='0', receive_success='0' WHERE INVOICEID='${INVOICEID}' AND MessengerID='${messenger}'`;
                /*####################### WORK_APP #######################*/
                const delApp_Detail = `DELETE FROM App_Detail WHERE invoiceNumber IN (SELECT invoiceNumber FROM App_workApp WHERE (invoiceNumber='${INVOICEID}') AND (MessengerID='${messenger}'))`;
                const delApp_workApp = `DELETE FROM App_workApp WHERE invoiceNumber='${INVOICEID}' AND MessengerID='${messenger}'`;
                /*####################### FINISH #######################*/
                const delApp_finishDetail = `DELETE FROM App_finishDetail WHERE invoiceNumber IN (SELECT invoiceNumber FROM App_FinishApp WHERE (invoiceNumber='${INVOICEID}') AND (MessengerID='${messenger}'))`;
                const delApp_FinishApp = `DELETE FROM App_FinishApp WHERE invoiceNumber='${INVOICEID}' AND MessengerID='${messenger}'`;

                /*####################### REPORT #######################*/
                const delReportDetail = `DELETE FROM ReportDetail WHERE INVOICEID IN (SELECT INVOICEID FROM Report WHERE (INVOICEID='${INVOICEID}') AND (MessengerID='${messenger}'))`;
                const delReport = `DELETE FROM Report WHERE INVOICEID='${INVOICEID}' AND MessengerID='${messenger}'`;

                // await pool.request().query(upSql);
                // await pool.request().query(delApp_Detail);
                await pool.request().query(delApp_workApp);



                // await pool.request().query(delApp_finishDetail);
                // await pool.request().query(delApp_FinishApp);

                // await pool.request().query(delReport);
                // await pool.request().query(delReportDetail);
            })
        ])

        next();
    } catch (error) {
        res.status(400).json({ success: false, message: JSON.stringify(error) })
        console.log(error)
    }
} 
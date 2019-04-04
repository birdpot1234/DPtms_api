const con = require('../connect_sql')
const sql = require('mssql')
const moment = require('moment')
require('moment/locale/th')
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

exports.update = () => async (req, res, next) => {
    let pool = await new sql.ConnectionPool(con.condb1()).connect();
    pool.on("error", err => { throw (err) })
    await pool;
    try {
        let _sql = `SELECT invoiceNumber,MessReport, Datetime, Status  FROM TMS_updateMessReport`;
        let result = await pool.request().query(_sql);
        console.log(result.recordset.length)
        result.recordset.forEach(async (el, i) => {
            let update = `UPDATE App_FinishApp SET MessengerID='${el.MessReport}', 
                datetime='${moment(el.Datetime).add(-1, 'd').format('YYYY-MM-DD HH:mm:ss')}', status='${el.Status}', statusclear =1 
                WHERE invoiceNumber='${el.invoiceNumber}'
            `

            // 
            // console.log(update)
            await pool.request().query(update);
            if (i === result.recordset.length - 1) {
                console.log('success update')
                res.status(200).json({ success: true, result: result.recordset })
            }
        })

        // res.status(200).json({ success: true, result: result.recordset })

    } catch (error) {
        console.log(error)
    }

}

// DECLARE @cnt INT = 0;
// WHILE @cnt < 88
// BEGIN

//    SET @cnt = @cnt + 1;
//    UPDATE App_FinishApp SET MessengerID = (select MessReport FROM TMS_updateMessReport),datetime = (select Datetime FROM TMS_updateMessReport),status = (select Status FROM TMS_updateMessReport),statusclear =1  where invoiceNumber in (select invoiceNumber FROM TMS_updateMessReport)
// END
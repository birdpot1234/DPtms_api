const con = require('../../connect_sql');
const sql = require("mssql")

exports.inserTracking = () => {
    return async (req, res, next) => {
        let pool1 = await new sql.ConnectionPool(con.condb1()).connect();
        pool1.on("error", err => { throw (err) })

        const request = await pool1.request();
        let { invoiceNumber, mess_id, latitude, longitude, status } = req.body;
        let invoice = JSON.stringify(invoiceNumber).replace('[', '').replace(']', '').replace(/"/g, "'");
        let insertTracking = `INSERT INTO Tracking(invoice, DateTime, status, location, messengerID, Trip, lat, long) 
            SELECT DISTINCT INVOICEID, GETDATE(), '${status}', StoreZone, '${mess_id}', 1, '${latitude}', '${longitude}' FROM BillToApp
            WHERE MessengerID='${mess_id}' AND INVOICEID IN (${invoice}) 
        `

        try {
            await request.query(insertTracking)
            next();
        } catch (error) {
            console.log(error)
            res.status(401).json({ success: false })
        }
    }
}
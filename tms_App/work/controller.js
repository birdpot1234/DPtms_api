
var con = require('../../connect_sql');
var sql = require("mssql");

exports.insertAppWorkApp = () => {
    return async (req, res, next) => {
        console.log('insert app')
        let { invoicenumber, mess_id } = req.body
        let pool1 = await new sql.ConnectionPool(con.condb1()).connect();
        pool1.on("error", err => { throw (err) })

        const request = await pool1.request();
        Promise.all(
            invoicenumber.map(async element => {
                const checkAppworkApp = `SELECT  1 as isCount FROM App_WorkApp WHERE invoiceNumber='${element}' AND MessengerID='${mess_id}'`;
                let haveInvoice = await request.query(checkAppworkApp);
                if (haveInvoice.recordset.length <= 0) {
                    return element
                }
            })).then(async result => {
                let invoiceCheck = result.filter(el => el)
                if (invoiceCheck.length > 0) {
                    let invoice = JSON.stringify(invoiceCheck).replace('[', '').replace(']', '').replace(/"/g, "'");
                    let insertDetail = `INSERT INTO App_Detail(invoiceNumber,itemCode,itemName,qty,amount,priceOfUnit,amountbox,qtyCN,statusclear,amountedit)
                        SELECT INVOICEID,ItemID,ItemName,Qty,Amount,PriceOfUnit,1,0,0,Amount FROM TMS_insertworkapp 
                        WHERE MessengerID = '${mess_id}' AND INVOICEID IN (${invoice})`

                    let insertWorkApp = `INSERT INTO App_workapp(invoiceNumber,documentSet,customerID,customerName,addressShipment,[status],Zone,MessengerID,MessengerName,DELIVERYNAME,Type,TelCustomer,DateTime,Trip,DateUpdate,DateBilltoApp)
                            SELECT DISTINCT INVOICEID,DocumentSet,CustomerID,CustomerName,AddressShipment,'6',StoreZone,MessengerID,MessengerName,DELIVERYNAME, '', TelCustomer, Getdate(), Trip, Getdate(), Getdate() FROM TMS_insertworkapp 
                           WHERE MessengerID = '${mess_id}' AND INVOICEID IN (${invoice})`;
                    try {
                        await request.query(insertDetail);
                        await request.query(insertWorkApp);
                        req.pool1 = pool1
                        next();
                    } catch (error) {
                        console.log(error)
                        res.status(401).json({ success: false })
                    }
                } else {
                    req.pool1 = pool1
                    next();
                }
            });
    }
}

exports.updateBillToApp = () => {
    return async (req, res, next) => {
        const request = await req.pool1.request();

        let { mess_id, id } = req.body
        let invoice = JSON.stringify(id).replace('[', '').replace(']', '').replace(/"/g, "'");
        const updateBillToApp = `UPDATE BillToApp SET update_billtoapp = 1,receive_success =1,Status = 4, update_time = getdate() WHERE MessengerID = '${mess_id}' AND id IN (${invoice})`;
        try {
            await request.query(updateBillToApp)
            next();
        } catch (error) {
            res.status(401).json({ success: false })
            console.log(error)
        }
    }
}
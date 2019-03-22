const con = require('../connect_sql')
const sql = require('mssql')
const fetch = require('node-fetch')
const authen = require('./authen');
const moment = require('moment')
require('moment/locale/th')

var pool;
let token = null // use
const statusCode = [77093, 77225]
/*####################### AUTHEN DHL #######################*/
// const shipmentAPI = (token) => {
//     fetch("https://sandbox.dhlecommerce.asia/rest/v3/Shipment", {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: shipmentBody(token)
//     }).then(res => {
//         setTimeout(() => null, 0);
//         return res.json()
//     }).then(async json => {
//         console.log(json.manifestResponse.bd)
//         if (json.manifestResponse.bd.responseStatus === 202) {
//             await authen()
//         }
//     }).catch((err) => console.log(err))
// }

// const shipmentBody = (token) => {
//     return `{  
//         "manifestRequest":{  
//            "bd":{  
//               "pickupAccountId":"5999999101",
//               "soldToAccountId":"5999999101",
//               "shipmentItems":[  
//                  {  
//                     "codValue":1250.0,
//                     "isMult": "TRUE",  
//                     "deliveryOption": "C", 
//                     "valueAddedServices":{
//                          "valueAddedService":[
//                              {"vasCode" : "PPOD" }
//                          ]
//                      },
//                     "consigneeAddress":{  
//                        "address1":"Test adrress01",
//                        "city":"-",
//                        "district": "phatumwan",
//                        "postCode":"10330",
//                        "country":"TH",
//                        "name":"Ms.Somchai Jaidee",
//                        "state":"Bangkok",
//                        "phone":"0111111111",
//                        "email":"Somchai@test.com"
//                     },
//                     "productCode":"PDO",
//                     "shipmentID":"THAZW20190200",
//                     "totalWeight":25,
//                     "shipmentPieces":[  
//                        {  
//                           "pieceID":11
//                        },
//                        {  
//                           "pieceID":21
//                        }
//                     ],
//                     "totalWeightUOM":"G",
//                     "currency":"THB"
//                  }
//               ]
//            },
//            "hdr":{  
//               "accessToken":"${token}",
//               "messageVersion":"1.4",
//               "messageDateTime":"2018-05-15T06:07:58+00:00",
//               "messageLanguage":"th_TH",
//               "messageType":"SHIPMENT"
//            }
//         }
//      }`
// }

/*####################### Tracking #######################*/
const get_shipID = async () => {
    await pool;
    try {
        const request = pool.request()
        const _sql = `SELECT ref_no, con_no FROM DHL_Info WHERE status_code <> '${statusCode[0]}' AND status_code <> '${statusCode[1]}'`;
        const result = await request.query(_sql)
        return result.recordset;
    } catch (error) {
        console.log('error: shipID ', JSON.stringify({ error }))
    }
}

// เรียกฟังก์ชั่น TRACKING => DHL & UPDATE + INSERT
const call = async (shipID) => {
    let arr = [];

    shipID.forEach((element, i) => {
        arr.push(`${element.ref_no}`) // ["", ""]
    });



    // ####### CALL API TRACKING #######
    let result = await trackingAPI(token, JSON.stringify(arr))
    if (result.responseStatus.code === "200") { // success
        result.shipmentItems.forEach(async (el, i) => {
            console.log(el)
            let obj = {
                con_no: shipID[i].con_no,
                ref_no: shipID[i].ref_no,
                status_code: el.events[el.events.length - 1].status,
                status_desc: el.events[el.events.length - 1].description,
                date: el.events[el.events.length - 1].dateTime,
                location: el.events[el.events.length - 1].address.city
            }

            await update(obj) // update DHL_Info
            await insert(obj) // insert DHL_Info_Tran
        })

        console.log('success tracking')
    }
}

// update DHL_Info [Head]
const update = async (obj) => {
    await pool
    try {
        const { status_code, status_desc, date, location, ref_no } = obj;
        const request = pool.request();
        const _sql = `UPDATE DHL_Info SET status_code='${status_code}', status_desc='${status_desc}', update_date='${date}', \
        location='${location}' WHERE ref_no='${ref_no}'`
        try {
            await request.query(_sql)
        } catch (error) {
            console.log("update error", JSON.stringify({ error }))
        }
    } catch (error) {
        console.log('error update DHL_Info', JSON.stringify({ error }))
    }
}

// insert DHL_Info_Tran
const insert = async (obj) => {
    await pool
    try {
        const { status_code, status_desc, date, location, con_no, ref_no } = obj;
        const request = pool.request();
        const _sql = `INSERT INTO DHL_Info_Tran(con_no, status_code, status_desc, update_date, ref_no, location) \
        VALUES('${con_no}', '${status_code}', '${status_desc}', '${date}', '${ref_no}', '${location}')`;

        try {
            await request.query(_sql)
        } catch (error) {
            console.log('error insert DHL_Info_Tran', JSON.stringify({ error }))
        }
    } catch (error) {
        console.log(error)
    }
}

const trackingAPI = (token, arr) => new Promise((resolve, reject) => {
    fetch("https://sandbox.dhlecommerce.asia/rest/v3/Tracking", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: trackingBody(token, arr)
    }).then(res => {
        setTimeout(() => null, 0);
        return res.json()
    }).then(async json => {
        resolve(json.trackItemResponse.bd)
    }).catch((err) => console.log(err))
})

const trackingBody = (token, shipID) => {
    console.log(shipID)
    return `{
        "trackItemRequest": {
            "hdr": {
                "messageType": "TRACKITEM",
                "accessToken": "${token}",
                "messageDateTime": "${moment().format()}",
                "messageVersion": "1.0",
                "messageLanguage": "th_TH"
            },
            "bd": {
                "soldToAccountId": "5999999100",
                "pickupAccountId": "5999999100",
                "ePODRequired": "Y", 
                "trackingReferenceNumber": ${shipID}
            }
        }
    }`
}

exports.tracking = async () => {
    try {
        if (!pool) {
            pool = await new sql.ConnectionPool(con.condb1()).connect();
            pool.on("error", err => { throw (err) })
        }

        token = await authen.authen(pool); // get token from API Token
        let shipID = await get_shipID(); // เอาเลข SHIP ID [1]
        await call(shipID); // ส่งไป TRACKING
    } catch (error) {
        console.log(error)
    }
}
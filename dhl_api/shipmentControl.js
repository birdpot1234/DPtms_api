const con = require('../connect_sql')
const sql = require('mssql')
const request = require('request')
const fetch = require('node-fetch')
var parm = require('../dhl_api/jsonparm');
const authen = require('./authen');
let pool;
let kerry_no = null;
let arr_success = '{"success":[],"false":[]}'
let obj_arr = JSON.parse(arr_success)
let arr_false = [];
let shipmentItem = [];
let respon =[]
let token = null // use



const setFormatch = async (obj) => {
    let str = ''
    for (let i = 0; i < obj.length; i++) {

        str = `${str}'${obj[i].con_no}',`

    }
    str = str.substring(0, str.length - 1)

    return str
}
const getAddress = async (dhl) => {
  //  console.log('er')
    await pool;
    try {
        const request = pool.request()
        const _sql = "SELECT * FROM TMS_Interface where dhl_document IN(" + dhl + ")";
        const result = await request.query(_sql)
        return result.recordset;
    } catch (error) {
        console.log('error: shipID ', JSON.stringify({ error }))
    }
}
const setbody = async (arr) => {
    return new Promise((resolve, reject) => { 
        setTimeout(()=>{resolve("Delay Hello"); 
        }, 500); 
        arr.forEach(async el => {
            // findindex
            let body = parm.bodys(el)
            shipmentItem.push(body)
        })
    }); 
  
}
const jsonbody = async (arr,token) => {
    let body = parm.shipment(arr)
    await call_DHL(JSON.stringify(body),token)
  
}
const call_DHL = (body,token) => new Promise((resolve, reject) => {
    console.log('eiei')
    let arr =  parm.shipment(body,token)
    console.log('eiei2')
    //const body = parm.bodys(arr);
    console.log('api')
    fetch(`https://sandbox.dhlecommerce.asia/rest/v3/Shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arr),  //JSON.stringify(body),
        json: true
    }).then(res => {
        setTimeout(() => null, 0);

        return res.json()
    }).then(async json => {

     InsetSuccess_Shipment((json.manifestResponse.bd.shipmentItems))
     resolve(json)
   
    }).catch((err) => console.log(err))
})

const InsetSuccess_Shipment = async (arr) => {
    //  await pool
    //console.log(arr[0].shipmentID)
    await pool
    try {

        const request = pool.request();
        console.log('1')
         arr.forEach(async el => {

             if (el.responseStatus.code == 200) {
                 console.log(el.shipmentID)
             
              const _sql = `INSERT INTO DHL_Info(con_no,status_code,status_desc,status_date,update_date,ref_no)\
              SELECT dhl_document,'00000','Created',convert(varchar, getdate(), 120),convert(varchar, getdate(),120),invoice FROM TMS_Interface WHERE dhl_document = '${el.shipmentID}'\
              INSERT INTO DHL_Info_Trans(con_no,status_code,status_desc,status_date,update_date,ref_no)\
              SELECT dhl_document,'00000','Created',convert(varchar, getdate(), 120),convert(varchar, getdate(),120),invoice FROM TMS_Interface WHERE dhl_document = '${el.shipmentID}'`
              
        
                try {
                    await request.query(_sql)
                } catch (error) {
                    console.log("update error", JSON.stringify({ error }))
                }
             }
             else{
                console.log('else',el.shipmentID)
             }
          


         })
    } catch (error) {
        console.log('error update DHL_Info', JSON.stringify({ error }))
    }


}





exports.info = async (obj) => {

    try {
        if (!pool) {
            pool = await new sql.ConnectionPool(con.condb1()).connect();
            pool.on("error", err => { throw (err) })
        }
        token = await authen.authen(pool); // get token from API Token
        let kerry_no = await setFormatch(obj);
        let address = await getAddress(kerry_no)
      //  let a = await delay()
        let bodyy = await setbody(address)
       // let b = await delay()
  
       let arr = await call_DHL(JSON.stringify(shipmentItem),token)

        return arr


    } catch (error) {
        console.log(error)
    }
}
function delay() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Delay Hello");
        }, 500);
    });
} 

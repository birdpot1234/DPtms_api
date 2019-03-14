const con = require('../connect_sql')
const sql = require('mssql')
const request = require('request')
const fetch = require('node-fetch')
var parm = require('../kerry_api/jsonparm');
// var fn_kerry = require('../kerry_api/function_kerry');
let pool;
let kerry_no = null;


const getAddress = async (inv) => {
    console.log('er')
    await pool;
    try {
        const request = pool.request()
        const _sql ="SELECT * FROM TMS_Interface where invoice IN("+inv+")";
        const result = await request.query(_sql)
        return result.recordset;
    } catch (error) {
        console.log('error: shipID ', JSON.stringify({ error }))
    }
}




const setFormatch = async (obj) => {
    let str=''
    for(let i =0;i<obj.length;i++)
            {
            
             str =`${str}'${obj[i].con_no}',`
             
            }
            str = str.substring(0,str.length-1)
         
            return str
}

const loop_kerry = async (data) =>{
    for(let i=0;i<data.length;i++){
        console.log("num",i)
      let log = call_kerry(data[i])
      
    }

}



const call_kerry = (arr) => new Promise((resolve, reject) => {
    const body = parm.bodys(arr);
   
    fetch(`http://exch.th.kerryexpress.com/ediwebapi_uat/SmartEDI/shipment_info`, {
        method: 'POST',
        headers: {  app_key: '3174a437-5c87-4709-bc88-4f280dcb1c77',
                    app_id: 'DPLUS',
                    'Content-Type': 'application/json' },
        body:   JSON.stringify(body),
        json: true
    }).then(res => {
        setTimeout(() => null, 0);
       
        return res.json()
    }).then(async json => {
        console.log(json)
     
    }).catch((err) => console.log(err))
})



exports.info = async (obj) => {
    try {
        if (!pool) {
            pool = await new sql.ConnectionPool(con.condb1()).connect();
            pool.on("error", err => { throw (err) })
        }

        let kerry_no = await setFormatch(obj);
       
        let address =await getAddress(kerry_no)
        await loop_kerry(address)
      

    } catch (error) {
        console.log(error)
    }
}

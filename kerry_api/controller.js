const con = require('../connect_sql')
const sql = require('mssql')
const request = require('request')
const fetch = require('node-fetch')
var parm = require('../kerry_api/jsonparm');

let pool;
let kerry_no = null;
let arr_success = '{"success":[],"false":[]}'
let obj_arr = JSON.parse(arr_success)
let arr_false = [];

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



const log = async (data) =>{
 console.log("success",data)

}
const loop_kerry = async (data) =>{
    return new Promise((resolve, reject) => { 
         setTimeout(()=>{resolve("Delay Hello"); 
         }, 500); 
    for(let i=0;i<data.length;i++){
        console.log("num",i)
      let log = call_kerry(data[i])
      
    }
     }); 
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
       
       
        let result_success = json.res.shipment
        let con = []
        result_success.status_code==000?obj_arr['success'].push({"con_no":result_success.con_no,"status":result_success.status_code,"status_des":result_success.status_desc})
        :obj_arr['false'].push({"con_no":result_success.con_no,"status":result_success.status_code,"status_des":result_success.status_desc})
        
        
     
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
        let loop= await loop_kerry(address)
       
        return obj_arr
      

    } catch (error) {
        console.log(error)
    }
}

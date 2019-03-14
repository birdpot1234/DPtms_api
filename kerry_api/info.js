const express = require('express');
const request = require('request')
const router = express.Router();
var moment = require("moment");
var datetime = require('node-datetime');
var con = require('../connect_sql');
var parm = require('../kerry_api/jsonparm');
var fn_kerry = require('../kerry_api/function_kerry');
var respons ='';
var responstatus ='';
var arr ={};
var re_count ={};
var sql = require("mssql");
var arrSuccess = [];
var arrFail = [];
var str =""
  router.post('/kerry/api/shipment_info', function(req, res) { 
    let request = []
     str = ""
    console.log(req.body)
     async function main(){
    var data = req.body 

      
  
      let setFormath =  await fn_kerry.getvalue(data.shipment)
      let a = await delay(); 
     // console.log("1",setFormath)
      let setFoem = await   selectData(setFormath)
      let b = await delay(); 
      for(let i=0;i<arr.length;i++){
       let sCheck_TMSBox =  await insert_info(arr[i]); 
       }
  


   } 
   main(); 
    
   }); 


async function insert_info(i){
console.log("eiei")
  var options = parm.getvalue(i)
    request(options, function (error, response, body) {
      if (error)
      {
        throw new Error(error);
      } 
      else{
        if(body.res.shipment.status_code!=000){
          //ต้องมีการเก็บ inv ที่ไม่สำเร็จ และทำการส่งใหม่
          console.log(body.res);
         // arrFail.push(body.res.shipment.con_no);
        }
        else{
          console.log(body.res);
          //arrSuccess.push(body.res.shipment.con_no);
          //ทำการ เก็บ inv เข้า table 
        }
   
       
      }
    
     
    });

}

async function selectData(inv){
  console.log("insert_info")
  var data=[]
  
  sql.close()
  sql.connect(con.condb1(), function(err) {

     if (err) {
         console.log(err+"connect db not found");
         response.status(500).json({
             statuserr: 0
         });
     }
     else{
         const pool1 = new sql.ConnectionPool(con.condb1(), err => {
         var result_tms = "SELECT * FROM TMS_Interface where invoice IN("+inv+")";
         console.log(result_tms);
         pool1.request().query(result_tms, (err, recordsets) => {
         
           if (err) {
               console.log("error select data" + err);
     
            respons = err.name;
            responstatus =500;
  
             }
             else {
                var result = '';
                result = recordsets['recordsets'];
                result_hold = result[0];
                if (result_hold == "") {
             
                respons = result_hold;
                responstatus =201;
                }
                else
                {
                 arr = result_hold
                 
                 console.log(arr)
                  
                }
                
            }
            sql.close()
         
 
           
       });
       }); 
    
     }
     
 })
        
}

function delay() { 
  return new Promise((resolve, reject) => { 
       setTimeout(()=>{ 
           resolve("Delay Hello"); 
       }, 500); 
   }); 
 } 

function to(promise) {
    return promise.then(data => {
       return {
         error: null,
         result: data
       }
    })
    .catch(err => {
      return {
        error: err
      }
    })
 }

module.exports = router;
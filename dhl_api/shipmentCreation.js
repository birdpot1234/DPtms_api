const express = require('express');
const request = require('request')
const router = express.Router();
var moment = require("moment");
var datetime = require('node-datetime');
var con = require('../connect_sql');
var controller = require('../dhl_api/shipmentControl');

var sql = require("mssql");


  router.post('/dhl/api/shipment_info', function(req, res) { 
    let request = []
    
    console.log(req.body)
     async function main(){
     var data = req.body 
  
      let respons= await controller.info(data.shipment)
      let wait_respone = await delay()
     res.status(200).json({ result: respons, status:200
      });
      
  

   } 
   main(); 
    
   }); 


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
const express = require('express');
const request = require('request')
const router = express.Router();
var moment = require("moment");
var datetime = require('node-datetime');
var con = require('../connect_sql');
var parm = require('../kerry_api/jsonparm');
var controller = require('../kerry_api/controller');
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
  
      await controller.info(data.shipment)

  

   } 
   main(); 
    
   }); 



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
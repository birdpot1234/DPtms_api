
module.exports = {

    bodys: function(arr)
    {
        //console.log("body",arr)
        var body= {
            codValue: null,
            isMult: "true",
            deliveryOption: "C",
            valueAddedServices:{
                   valueAddedService:[
                   {vasCode : "PPOD" }
                
                                       ]
                   },
            consigneeAddress: {
              address1: arr.address_shipment,
              address2: "",
              address3: "",
              city: "Suan Luang",
              district: "Suanluang",
              postCode: arr.zipcode,
              country: "TH",
              name: arr.customer_name,
              state: "Bangkok",
              phone: "023456789",
              email: null
            },
            productCode: "PDO",
            shipmentID: arr.dhl_document,
            totalWeight: 100,
            totalWeightUOM: "G",
            currency: "THB",
            shipmentPieces: [
                {
                  pieceID: 1
                }
              ]
          }
          //console.log(JSON.parse(body))
            return body
    },
    shipment: function(arr,token)
    {
        //console.log("body",arr)
        var shipment= {
            manifestRequest: {
              bd: {
                pickupAccountId: "5999999100",
                soldToAccountId: "5999999100",
                shipmentItems:JSON.parse(arr)
              },
              
              hdr: {
                accessToken: token,
                messageVersion: "1.4",
                messageDateTime: "2018-05-15T06:07:58+00:00",
                messageLanguage: "en",
                messageType: "SHIPMENT"
              }
            }
          }
         // console.log(JSON.stringify(shipment))
            return shipment
    },


}
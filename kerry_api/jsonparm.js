

module.exports = {

    bodys: function(arr)
    {
        var body={ req:
            {
                shipment: {
                    con_no: arr.invoice,
                    s_name: "บริษัท ดีพลัส อินเตอร์เทรด จำกัด",
                    s_address: "123/20-22 ถนนนนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120",
                    s_village: "",
                    s_soi: "",
                    s_road: "",
                    s_subdistrict: "",
                    s_district: "",
                    s_province: "",
                    s_zipcode: "10120",
                    s_mobile1: "0229448480",
                    s_mobile2: "",
                    s_telephone: "02-294-4848-0",
                    s_email: "recruit@dplus.co.th",
                    s_contactperson: "คุณปรีชา มากมี",
                    r_name: arr.customer_name,
                    r_address: arr.address_shipment,
                    r_village: "",
                    r_soi: "",
                    r_road: "",
                    r_subdistrict: "",
                    r_district: "",
                    r_province: "",
                    r_zipcode: arr.zipcode,
                    r_mobile1: (arr.contact_phone==null?'11':arr.contact_phone),
                    r_mobile2: "",
                    r_telephone: (arr.contact_phone==null?'11':arr.contact_phone),
                    r_email: "",
                    r_contactperson: arr.customer_name,
                    special_note: "",
                    service_code: "ND",
                    cod_amount: arr.invoice_amount,
                    cod_type: "CASH",
                    tot_pkg: arr.box_amount,
                    declare_value: 0,
                    ref_no: arr.invoice,
                    action_code: "A",
                    Delivery_type:"D2D"
    
                }
            } }
            return body
    }

}
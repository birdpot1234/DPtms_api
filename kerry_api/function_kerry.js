
module.exports = {
    foo: function () {
        // whatever
        console.log('eiei')
      },
    getvalue: async function(obj)
    {
        var str = ''
        for(let i =0;i<obj.length;i++)
        {
         // arr.push(obj[i].con_no)
        // str = "'"+str+"'+'"obj[i].con_no"'+"," "
         str =`${str}'${obj[i].con_no}',`
         // str = str+ " SELECT * from TMS_Interface where  invoice ='"+obj[i].con_no+"' " 
        }
        str = str.substring(0,str.length-1)
        console.log(str)
        return str
   
     
    }
}
const fetch = require('node-fetch');
const moment = require('moment');
require('moment/locale/th')
let pool;

let clientId = "LTExMTgwNTI4MTY=";
let password = "APITest1"

// get token [DHL_Token]
const get_token = async () => {
    await pool
    try {
        const request = pool.request();
        const _sql = `SELECT TOP(1) DHL_Token, update_datetime FROM DHL_Token ORDER BY update_datetime DESC`
        const result = await request.query(_sql);
        if (result.recordset.length <= 0) {
            // insert
            let { token, date } = await insert_token();
            return { token, date };
        }
        let { DHL_Token: token, update_datetime: date } = result.recordset[0];
        return { token, date }
    } catch (error) {
        console.log("error [get token] ", JSON.stringify(error))
    }
}

// insert token when null
const insert_token = async () => {
    await pool
    try {
        let { token } = await authAPI();
        const request = pool.request();
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        const _sql = `INSERT INTO DHL_Token(DHL_Token, update_datetime) VALUES('${token}', '${date}')`
        await request.query(_sql);
        return { token, date }
    } catch (error) {
        console.log('error [insert_token]', JSON.stringify({ error }))
    }
}

// when token expire
const update_token = async (oldtoken) => {
    await pool
    try {
        let { token } = await authAPI();
        const request = pool.request();
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        const _sql = `UPDATE DHL_Token SET DHL_Token='${token}', update_datetime='${date}' \
            WHERE DHL_Token LIKE '${oldtoken}'`
        await request.query(_sql)
        return token
    } catch (error) {
        console.log('error [update_token]', JSON.stringify({ error }))
    }
}

const validate_token = async () => {
    let object = await get_token();
    let now = moment().format();
    let end = moment(object.date).format()
    var duration = moment.duration(moment(now).diff(end));
    var hour = ~~(duration.asHours() + 7);
    if (hour >= 12) {
        let token = await update_token(object.token);
        return token;
    } else {
        // ไม่ทำการยิง API Authen ใหม่ ส่ง token จาก database
        return object.token
    }
}

const authAPI = () => new Promise((resolve, reject) => {
    fetch(`https://sandbox.dhlecommerce.asia/rest/v1/OAuth/AccessToken?clientId=${clientId}&password=${password}&returnFormat=json`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => {
        setTimeout(() => null, 0);
        return res.json()
    }).then(async json => {
        token = json.accessTokenResponse.token
        resolve({ token })
    }).catch((err) => console.log(err))
})

exports.authen = async (_pool) => {
    try {
        pool = _pool;
        let token = await validate_token();
        return token;
    } catch (error) {
        console.log(error)
        return null;
    }
}
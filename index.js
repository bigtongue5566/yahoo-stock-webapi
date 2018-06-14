const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express();
const cors = require('cors')
app.use(cors());

app.get('/:stockcode/basicdata',(req,res)=>{
    getBasicData(req.params.stockcode).then((data)=>{
        res.json(data);
    });
})

app.get('/:stockcode/dividend',(req,res)=>{
    getDividendData(req.params.stockcode).then((data)=>{
        res.json(data);
    });
})



async function getBasicData(stockCode){
    const api = 'https://quality.data.gov.tw/dq_download_json.php?nid=18419&md5_url=4932a781923479c4c782e8a07078d9e9';
    const otcApi = 'https://quality.data.gov.tw/dq_download_json.php?nid=25036&md5_url=f915a69e3f23cda7ff53026c1c890926';
    let listOfCompanyData = await axios.get(api).then(res=>{
        return(res.data)
    })
    let listOfOtcCompanyData = await axios.get(otcApi).then(res=>{
        return(res.data)
    })
    let allCompanyData = listOfCompanyData.concat(listOfOtcCompanyData)
    let companyData = allCompanyData.filter(e=>e['公司代號']==stockCode+'')[0]
    return(companyData)
}


async function getDividendData(stockCode){
    let pastDividend = await axios.get(`https://tw.stock.yahoo.com/d/s/dividend_${stockCode}.html`).then(res=>{
        const $ = cheerio.load(res.data);
        let dividend = [];
        $('tr[bgcolor="#FFFFFF"]').slice(0, 5).each((i,e)=>{
            let year = $(e).children().eq(0).text();
            let cashDividend = $(e).children().eq(1).text();
            let stockDividend = $(e).children().eq(4).text();
            let totalDividend = $(e).children().eq(5).text();        
            dividend.push({year,cashDividend,stockDividend,totalDividend})
        })      
        return(dividend)  
    })
    return(pastDividend)
}


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}`));
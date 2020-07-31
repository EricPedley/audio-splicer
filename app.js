const fetch = require("node-fetch");
const { createReadStream } = require('fs');
const stream = createReadStream('audio-file.flac');
if(process.env.NODE_ENV!=="production")
    require("dotenv").config()
const url = process.env.API_URL
const options = {
    method:"POST",
    headers: {
        ContentType:"audio/flac",
        Authorization:`Basic ${Buffer.from(`apikey:${process.env.API_KEY}`,'utf-8').toString("base64")}`
    },
    body:stream
}
fetch(`${url}/v1/recognize?timestamps=true`,options).then((res)=>{
    return res.json();
}).then((json)=>{
    console.log(JSON.stringify(json.results[0].alternatives));
})

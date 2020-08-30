// const { writeFile, writeFileSync, readFileSync, createReadStream } = require('fs');
// const { exec } = require("child_process");
// const fetch = require("node-fetch")
// if (process.env.NODE_ENV !== "production")
//     require("dotenv").config()

function speechRecFromBuffer(buffer) {
    const url = process.env.API_URL
    const options = {
        method: "POST",
        headers: {
            ContentType: "audio/mp3",
            Authorization: `Basic ${Buffer.from(`apikey:${process.env.API_KEY}`, 'utf-8').toString("base64")}`
        },
        body: buffer
    }
    return fetch(`${url}/v1/recognize?timestamps=true`, options).then((res) => {
        console.log(res);
        return res.json();
    });
}
// (async ()=>{
// const filePath = `serverfiles/tempfiles/audio-file.mp3`;
// const stream = createReadStream(filePath);
// const ibmres = await speechRecFromBuffer(stream);
// console.log(JSON.stringify(ibmres));
// console.log(JSON.stringify(ibmres.results[0].alternatives));})();
var arr = [];
arr[0] = "Jani";
arr[1] = "Hege";
arr[2] = "Stale";
arr[3] = "Kai Jim";
arr[4] = "Borge";

console.log(arr.join());
arr.splice(2, 0, "Lene");
console.log(arr.join());
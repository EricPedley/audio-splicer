const fetch = require("node-fetch");
const ffmpeg = require("ffmpeg");
const express = require("express");
const cors = require("cors");
const { createReadStream, writeFile } = require('fs');
const { exec } = require("child_process");
if (process.env.NODE_ENV !== "production")
    require("dotenv").config()




const app = express();
app.use(cors());
app.use(express.json({ type: "*/*" }));


app.post("/build-mp3", function (req, res) {
    const data = req.body;
    let concatListString = "";
    const audioFileName = "audio-file.mp3";//HARD CODED VALUE
    for (const [start, end] of data) {
        concatListString += `file ${audioFileName}\ninpoint ${start}\noutpoint ${end}\n`;
    }
    const inputTextFileName = "concatlist.txt";//HARD CODED
    const outputAudioFileName = "outputcombined.mp3"//HARD CODED
    writeFile(inputTextFileName, concatListString, (err) => {
        console.log(err);
        exec(`ffmpeg -f concat -i ${inputTextFileName} ${outputAudioFileName}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                res.send("error");
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                res.send("stderr");
            }
            console.log(`stdout: ${stdout}`);
            res.send("stdout")
        });
    });
})
app.get("/audio-fragments", async function (req, res) {
    const data = await speechRecReq(audioFileName);
    res.send(data.results[0].alternatives);

})
app.listen(3001, () => console.log("running on 3001"))

function speechRecReq(fileName) {
    const placeholder = [["several", 1, 1.52], ["tornadoes", 1.52, 2.15], ["touched", 2.15, 2.54], ["down", 2.54, 2.82], ["as", 2.82, 2.92], ["a", 2.92, 3], ["line", 3, 3.3], ["of", 3.3, 3.39], ["severe", 3.39, 3.77], ["thunderstorms", 3.77, 4.51], ["swept", 4.51, 4.79], ["through", 4.79, 4.95], ["Colorado", 4.95, 5.6], ["on", 5.6, 5.73], ["Sunday", 5.73, 6.35]]
    return { results: [{ alternatives: [{ timestamps: placeholder }] }] };
    // const stream = createReadStream(fileName);
    // const url = process.env.API_URL
    // const options = {
    //     method: "POST",
    //     headers: {
    //         ContentType: "audio/mp3",
    //         Authorization: `Basic ${Buffer.from(`apikey:${process.env.API_KEY}`, 'utf-8').toString("base64")}`
    //     },
    //     body: stream
    // }
    // return fetch(`${url}/v1/recognize?timestamps=true`, options).then((res) => {
    //     return res.json();
    // });
}

function splitVideo(fileName) {
    new ffmpeg(fileName).then((video) => {
        video.addCommand("-ss", "00:00:00");//CHANGE THESE HARDCODED VALUES
        video.addCommand("-t", "00:00:02");
        video.save('output.mp3', (error, file) => {
            if (!error)
                console.log(file);
            else
                console.log(error);
        });
    });
}



//fmpeg example command https://stackoverflow.com/questions/21491091/splitting-an-audio-mp3-file: ffmpeg -i long.mp3 -acodec copy -ss 00:00:00 -t 00:30:00 half1.mp3
//concatenate docs: https://trac.ffmpeg.org/wiki/Concatenate https://stackoverflow.com/questions/42747935/cut-multiple-videos-and-merge-with-ffmpeg
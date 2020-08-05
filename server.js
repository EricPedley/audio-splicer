const fetch = require("node-fetch");
const ffmpeg = require("ffmpeg");
const express = require("express");
const cors = require("cors");
const { createReadStream } = require('fs');
if (process.env.NODE_ENV !== "production")
    require("dotenv").config()
const app = express();
app.use(cors());
app.use(express.json({ type: "*/*" }));
app.post("/build-mp3", function (req, res) {
    console.log(req.body);
    res.send("placeholder response")
})
app.listen(3001, () => console.log("running on 3001"))

function speechRecReq(fileName) {
    const stream = createReadStream(fileName);
    const url = process.env.API_URL
    const options = {
        method: "POST",
        headers: {
            ContentType: "audio/mp3",
            Authorization: `Basic ${Buffer.from(`apikey:${process.env.API_KEY}`, 'utf-8').toString("base64")}`
        },
        body: stream
    }
    fetch(`${url}/v1/recognize?timestamps=true`, options).then((res) => {
        return res.json();
    }).then((json) => {
        console.log(JSON.stringify(json.results[0].alternatives));
    });
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
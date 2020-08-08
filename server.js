const fetch = require("node-fetch");
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { writeFile, writeFileSync, readFileSync, createReadStream } = require('fs');
const { exec } = require("child_process");
if (process.env.NODE_ENV !== "production")
    require("dotenv").config()




const app = express();
app.use(cors());
app.use(express.json({ type: "application/json" }));
app.use(fileUpload());
app.use(express.static("serverfiles"));
//app.use(express.raw())
app.post("/build-mp3", function (req, res) {
    const { clips, id } = req.body;
    let concatListString = "";
    const audioFileName = `serverfiles/tempfiles/input${id}.mp3`;
    for (const [start, end] of clips) {
        concatListString += `file ${audioFileName}\ninpoint ${start}\noutpoint ${end}\n`;
    }
    const inputTextFileName = "concatlist.txt";//HARD CODED (this might be fine)
    const outputAudioFileName = `serverfiles/tempfiles/output${id}.mp4`
    writeFile(inputTextFileName, concatListString, (err) => {
        console.log(err);
        exec(`ffmpeg -f concat -i ${inputTextFileName} ${outputAudioFileName}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                res.send({ result: "error", content: error.message });
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                res.send({ result: "stderr", content: stderr });
                return;
            }
            console.log(`stdout: ${stdout}`);
            res.send({ result: "stdout", content: stdout, id })
        });
    });
})


app.post("/audio-fragments", function (req, res) {//accepts an audio file, sends it to IBM cloud, then sends the relevant part of the IBM cloud response back to browser
    const file = req.files.audioFile;
    const uniqueNumber = generateUniqueNumber();
    file.mv(`serverfiles/tempfiles/input${uniqueNumber}.mp4`);
    console.log("bruh")
    exec(`ffmpeg -i serverfiles/tempfiles/input${uniqueNumber}.mp4 serverfiles/tempfiles/input${uniqueNumber}audio.mp3`, async (error, stdout, stderr) => {
        const stream = createReadStream(`serverfiles/tempfiles/input${uniqueNumber}audio.mp3`);
        console.log(stream)

        //works with the sample audio file but not the ffmpeg generated ones
        const ibmres = await speechRecFromBuffer(stream);//response from IBM server with timestamps
        console.log(JSON.stringify(ibmres));
        res.send({ id: uniqueNumber, data: ibmres.results[0].alternatives });
    });

})

app.post("/placeholder-fragments", function (req, res) {
    const uniqueNumber = generateUniqueNumber();
    const placeholder = [["several", 1, 1.52], ["tornadoes", 1.52, 2.15], ["touched", 2.15, 2.54], ["down", 2.54, 2.82], ["as", 2.82, 2.92], ["a", 2.92, 3], ["line", 3, 3.3], ["of", 3.3, 3.39], ["severe", 3.39, 3.77], ["thunderstorms", 3.77, 4.51], ["swept", 4.51, 4.79], ["through", 4.79, 4.95], ["Colorado", 4.95, 5.6], ["on", 5.6, 5.73], ["Sunday", 5.73, 6.35]]
    res.send({ id: uniqueNumber, data: [{ timestamps: placeholder }] });
})
app.listen(3001, () => console.log("running on 3001"))


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
        return res.json();
    });
}

function generateUniqueNumber() {//this reads and writes to a text file that has a number that keeps increasing so that all the files have unique names
    const pathToNum = "serverfiles/tempfiles/uniqueNum.txt";
    let uniqueNumber;
    try {
        uniqueNumber = Number(readFileSync(pathToNum).toString());
    } catch (e) {
        uniqueNumber = 1;
    }
    writeFileSync(pathToNum, (uniqueNumber + 1));
    return uniqueNumber;
}

//fmpeg example command https://stackoverflow.com/questions/21491091/splitting-an-audio-mp3-file: ffmpeg -i long.mp3 -acodec copy -ss 00:00:00 -t 00:30:00 half1.mp3
//concatenate docs: https://trac.ffmpeg.org/wiki/Concatenate https://stackoverflow.com/questions/42747935/cut-multiple-videos-and-merge-with-ffmpeg
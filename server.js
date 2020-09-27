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
app.use(express.static("build"));
app.use(express.static("serverfiles"));
//app.use(express.raw())
app.post("/build-mp3", async function (req, res) {
    const { clips, id } = req.body;
    let concatListString = "";
    const inputAudio = `serverfiles/tempfiles/input${id}.mp4`;
    //const audioFileName = `serverfiles/tempfiles/input20.mp4`;//HARD CODED change once done
    const inputTextFileName = "concatlist.txt";//HARD CODED (this might be fine)
    const outputAudioFileName = `serverfiles/tempfiles/output${id}.mp4`
    for (let i = 0; i < clips.length; i++) {//create each separate clip
        const [start, end] = clips[i];
        const command = `ffmpeg -i ${inputAudio} -ss ${start} -t ${end - start} serverfiles/tempfiles/input${id}clip${i}.mp4`
        const noErrors = await execPromise(command, printCMDOut);
        if (noErrors)
            concatListString += `file serverfiles/tempfiles/input${id}clip${i}.mp4\n`;
    }
    const command = `ffmpeg -f concat -i ${inputTextFileName} ${outputAudioFileName}`;
    writeFileSync(inputTextFileName, concatListString);
    const noErrors = await execPromise(command, printCMDOut);
    if (noErrors)
        res.send("all good");
    else
        res.send("encountered server errors");
})

function execPromise(command, callback) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            resolve(callback(error, stdout, stderr));
        })
    })
}

function printCMDOut(error, stdout, stderr) {//returns false on error and true on no error
    if (error) {
        console.log(`error: ${error.message}`);
        return false;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return true;
    }
    console.log(`stdout: ${stdout}`);
    return true
}


app.post("/audio-fragments", async function (req, res) {//accepts an audio file, sends it to IBM cloud, then sends the relevant part of the IBM cloud response back to browser
    const file = req.files.audioFile;
    const uniqueNumber = generateUniqueNumber();
    file.mv(`serverfiles/tempfiles/input${uniqueNumber}.mp4`);
    const noErrors = await execPromise(`ffmpeg -i serverfiles/tempfiles/input${uniqueNumber}.mp4 -c:a libmp3lame serverfiles/tempfiles/input${uniqueNumber}audio.mp3`, printCMDOut);
    //doesn't work because of ffmpeg bs. previous version(the exe on master branch) works fine
    if (noErrors) {
        const stream = createReadStream(`serverfiles/tempfiles/input${uniqueNumber}audio.mp3`);
        console.log(stream)

        //works with the sample audio file but not the ffmpeg generated ones
        const ibmres = await speechRecFromBuffer(stream);//response from IBM server with timestamps
        console.log(JSON.stringify(ibmres));//this is where the example bush thing came from
        const responsePayload = {
            id: uniqueNumber, data: ibmres.results.reduce((accumulator, current) => {
                return [...accumulator, ...current.alternatives[0].timestamps];
            }, [])
        };
        console.log(responsePayload);
        res.send(responsePayload);
    } else {
        res.send("error!");
    }
})

app.post("/placeholder-fragments", function (req, res) {
    const uniqueNumber = generateUniqueNumber();
    //const placeholder = [["last",0.65,1.02],["night",1.02,1.37],["I",1.76,1.9],["had",1.9,2.15],["a",2.15,2.35],["warm",2.35,2.75],["conversation",2.75,3.57],["with",3.57,3.77],["president",3.77,4.19],["elect",4.19,4.45],["Barack",4.45,4.8],["Obama",4.8,5.27]]
    //const placeholder = [["several", 1, 1.52], ["tornadoes", 1.52, 2.15], ["touched", 2.15, 2.54], ["down", 2.54, 2.82], ["as", 2.82, 2.92], ["a", 2.92, 3], ["line", 3, 3.3], ["of", 3.3, 3.39], ["severe", 3.39, 3.77], ["thunderstorms", 3.77, 4.51], ["swept", 4.51, 4.79], ["through", 4.79, 4.95], ["Colorado", 4.95, 5.6], ["on", 5.6, 5.73], ["Sunday", 5.73, 6.35]]
    //const placeholder = {"result_index":0,"results":[{"final":true,"alternatives":[{"transcript":"last night I had a warm conversation with president elect Barack Obama ","confidence":0.99,"timestamps":[["last",0.65,1.02],["night",1.02,1.37],["I",1.76,1.9],["had",1.9,2.15],["a",2.15,2.35],["warm",2.35,2.75],["conversation",2.75,3.57],["with",3.57,3.77],["president",3.77,4.19],["elect",4.19,4.45],["Barack",4.45,4.8],["Obama",4.8,5.27]]}]},{"final":true,"alternatives":[{"transcript":"I congratulate him as senator Biden on their impressive victory ","confidence":0.88,"timestamps":[["I",6.41,6.54],["congratulate",6.54,7.27],["him",7.27,7.44],["as",7.44,7.55],["senator",7.55,7.86],["Biden",7.86,8.35],["on",8.8,9.01],["their",9.01,9.14],["impressive",9.14,9.75],["victory",9.75,10.31]]}]},{"final":true,"alternatives":[{"transcript":"I told the president elect he can count on complete cooperation ","confidence":0.84,"timestamps":[["I",12,12.12],["told",12.12,12.36],["the",12.36,12.43],["president",12.43,12.84],["elect",12.84,13.12],["he",13.12,13.22],["can",13.22,13.37],["count",13.37,13.73],["on",13.73,13.98],["complete",13.98,14.5],["cooperation",14.5,15.32]]}]},{"final":true,"alternatives":[{"transcript":"for my administration as he makes the transition to the White House ","confidence":0.95,"timestamps":[["for",16.13,16.25],["my",16.25,16.46],["administration",16.46,17.22],["as",17.22,17.33],["he",17.33,17.43],["makes",17.43,17.74],["the",17.74,17.83],["transition",17.83,18.44],["to",18.44,18.56],["the",18.56,18.64],["White",18.64,18.89],["House",18.89,19.32]]}]}]}
    const placeholder = { "result_index": 0, "results": [{ "final": true, "alternatives": [{ "transcript": "last night I had a warm conversation with president elect Barack Obama ", "confidence": 0.97, "timestamps": [["last", 0, 0.41], ["night", 0.41, 0.74], ["I", 1.15, 1.29], ["had", 1.29, 1.53], ["a", 1.53, 1.73], ["warm", 1.73, 2.13], ["conversation", 2.13, 2.95], ["with", 2.95, 3.15], ["president", 3.15, 3.57], ["elect", 3.57, 3.83], ["Barack", 3.83, 4.18], ["Obama", 4.18, 4.59]] }] }] }
    res.send({
        id: uniqueNumber, data: placeholder.results.reduce((accumulator, current) => {
            return [...accumulator, ...current.alternatives[0].timestamps];
        }, [])
    });
})
const port = process.env.PORT||4000;
app.listen(port, () => console.log(`running on ${port}`))


function speechRecFromBuffer(buffer) {
    const url = process.env.API_URL;
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
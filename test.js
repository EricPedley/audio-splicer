const { exec } = require("child_process");

(async ()=>{
    console.log("f u")
const clips = [[1.29, 1.53], [1.53, 1.73], [2.13,2.95]];
//const audioFileName = `serverfiles/tempfiles/input${id}.mp4`;
const audioFileName = `serverfiles/tempfiles/input20.mp4`;//HARD CODED change once done
//const inputTextFileName = "concatlist.txt";//HARD CODED (this might be fine)
//const outputAudioFileName = `serverfiles/tempfiles/output${id}.mp4`
for (let i = 0; i < clips.length; i++) {//create each separate clip
    const [start, end] = clips[i];
    const command = `ffmpeg -i "Bush Speech 5s.mp4" -ss ${start} -t ${end - start} ${i}.mp4`
    console.log(command);
    await execPromise(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}
for (let i = 1; i < clips.length; i++) {//concat them all(DOESN't WORK, USE TEXT FILE LIST AND IT WILL WORK)
    const [start, end] = clips[i];
    await execPromise(`ffmpeg -f concat -i 0.mp4 -i ${i}.mp4 0.mp4`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}
})//run function here

const {createReadStream} = require("fs");
const stream = createReadStream("input4audio.mp3");
console.log(stream);

function execPromise(command,callback) {
    return new Promise((resolve,reject)=> {
        exec(command,(error, stdout, stderr)=> {
            callback(error, stdout, stderr);
            resolve();
        })
    })
}

// exec(`ffmpeg -i "Bush Speech 5s.mp4" -ss 1 -t 2 13.mp4`, (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });
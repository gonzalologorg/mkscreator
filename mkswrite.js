const readline = require('readline');
const fs = require('fs');
const path = require('path');
const TGA = require('tga');
const { PNG } = require('pngjs');
const sharp = require('sharp');
const sizeOf = require('image-size')
var spawn = require('child_process').spawn;

if (!fs.existsSync(__dirname + "/config.json")) {
    fs.writeFileSync(__dirname + "/config.json", "");
}
const fileContent = fs.readFileSync(__dirname + '/config.json', "utf8");
var config = JSON.parse(fileContent);
if (!config) {
    config = {};
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const filePath = process.cwd() + "\\";
let fileName = process.argv[2];
let params = process.argv[3];
let frames = 0;

if (!fileName) {
    console.log("You have not provided a file name!\n");
    process.exit(0);
}

if (!fs.existsSync(filePath + "/" + fileName)) {
    console.log("File does not exist!\n");
    process.exit(0);
}

function processMKS(mksFile, baseFile){
    if (fs.existsSync(mksFile)) {
        var pidb = spawn(config.BinPath + "\\vtex.exe", ["-dontusegamedir", "-quiet", filePath + baseFile + ".sht"]);
        pidb.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        pidb.on('close', function(code){
            console.log("Finished converting vtex file");
            console.log("Deleting temp files");

            fs.writeFileSync(filePath + baseFile + ".vmt", '"SpriteCard" {\n' +
            '    "$basetexture" "' + baseFile + '"\n' +
            '    "$blendframes" "0"\n' +
            '    "$orientation" "0"\n' +
            '    "$translucent" "1"\n' +
            '    "$additive" "0"\n' +
            '    "$vertexalpha" "1"\n' +
            '}');

            fs.unlinkSync(filePath + baseFile + ".mks");
            fs.unlinkSync(filePath + baseFile + ".sht");
            fs.unlinkSync(filePath + baseFile + ".tga");
            for (i = 0; i < frames; i++) {
                console.log("Deleted temp/frame" + i + ".png")
                fs.unlinkSync("temp/frame" + i + ".png");
                fs.unlinkSync("temp/frame" + i + ".tga");
            }
            fs.rmSync("temp/", { recursive: true, force: true });

            rl.close();
        });
    }
}

function startConversion(frames){
    let mkpath = config.BinPath + "/mksheet.exe";
    let baseFile = fileName.substring(0, fileName.length - 4)
    let mksFile = filePath + baseFile + ".mks"
    var pid = spawn(mkpath, [mksFile]);

    pid.on('close', function(code){
        console.log("Conversion finished " + code);
        processMKS(mksFile, baseFile)
    });
}

function setupPath(){
    rl.question('You have to setup your bin folder (E:/Steam/Steamapps/Garrysmod/bin): ', function (path) {
        if (fs.existsSync(path + "/mksheet.exe")) {
            config.BinPath = path;
            fs.writeFileSync(__dirname + "/config.json", JSON.stringify(config, null, 2));
            startConversion();
        }else{
            console.log("Invalid folder!\n");
            setupPath();
        }
    })
}

function proccessImage(w, h, filePath, fileName){

    if (!fs.existsSync(filePath + "/temp/")) {
        fs.mkdirSync(filePath + "/temp/");
        console.log("creating temp folder");
    }
    
    const dimensions = sizeOf(fileName)
    var sharpie = sharp(fileName);
    let fw = Math.floor(dimensions.width / w);
    let fh = Math.floor(dimensions.height / h);

    let frame = 0;
    let frameCount = w * h;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            console.log("Writting " + "./temp/frame" + frame + ".png");
            let options = {
                width : fw,
                height : fh,
                left : Math.floor(x * fw),
                top : Math.floor(y * fh),
            }
            sharpie.extract(options).toFile("./temp/frame" + frame + ".png").then((info) => {
                frameCount--;
                if (frameCount == 0) {
                    convertFramesToTGA(w * h)
                }
            })
            frame++;
        }
    }
}

function convertFramesToTGA(frames){
    let totalFrames = frames;
    console.log("Converting to TGA")
    for (frame = 0; frame < frames; frame++) {
        let curFrame = frame;
        stream = fs.createReadStream("./temp/frame" + frame + ".png")
        .pipe(
            new PNG({
                filterType: 4,
            })
        ).on("parsed", function(){
            const buffer = TGA.createTgaBuffer(this.width, this.height, this.data);
            fileName = fileName.substring(0, fileName.length - 4) + '.tga';
            fs.writeFileSync("./temp/frame" + curFrame + ".tga", buffer);
            totalFrames--;
            if (totalFrames <= 0) {
                writeMKS(frames);
            }
        })
    }
}

function writeMKS(frames){
    let content = "sequence 0";
    if (params == null || params == "loop") {
        if (process.argv[3] == "loop") {
            content += "\nloop\n";
        }

        for (i = 0; i < frames; i++) {
            content += "\nframe " + "temp/frame" + i + ".tga" + " 1 ";
        }
    }else if (params == "single") {
        content += "\nloop";
        for (i = 0; i < frames; i++) {
            content += "\nframe " + "temp/frame" + i + ".tga" + " 1\nsequence " + i + "\nloop\n";
        }
    }

    fs.writeFileSync(filePath + fileName.substring(0, fileName.length - 4) + ".mks", content);
    if (!config.BinPath) {
        setupPath();
    }else{
        startConversion(frames);
    }
}

rl.question('Frames Number W H <extra parameter: loop | single>', function (num) {
    let args = num.split(" ");
    framesx = parseInt(args[0] || 1);
    framesy = parseInt(args[1] || 1);

    if (path.extname(fileName) == '.png'){
        proccessImage(framesx, framesy, filePath, fileName);
        return;
    }

    processBody()
});
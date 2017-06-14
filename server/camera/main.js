const spawn = require(`child_process`).spawn;

class Camera {

    constructor(options) {

        // Capture options (https://www.raspberrypi.org/documentation/raspbian/applications/camera.md)
        this.options = Object.assign({
            nopreview: true,
            inline: true,
            intra: 1,
            timeout: 0,
            width: 640,
            height: 480,
            framerate: 24,
            hflip: false,
            vflip: false
        }, options || {}, {output: `-`});

        const args = [];
        // Command arguments
        for (const opt of Object.keys(this.options)) {
            if (false !== this.options[opt]) {
                args.push(`--` + opt);
                if (true !== this.options[opt]) {
                    args.push(this.options[opt]);
                }
            }
        };

        // Capture
        const raspivid = spawn(`raspivid`, args, {
            stdio: [`ignore`, `pipe`, `pipe`]
        });
        console.error(`\x1b[34mCamera Source\n=>\x1b[0m raspivid`, args.join(` `));

        raspivid
            .stderr
            .on(`data`, (data) => {
                console.error(data.toString());
            });

        // H264 stream
        this.source = raspivid.stdout;
    }

    stream(argsOut, callback) {

        // Output options (https://libav.org/documentation/avconv.html#Options-1) Command arguments
        const args = [
            `-fflags`,
            `nobuffer`,
            `-probesize`,
            (256 * 1024),
            `-f`,
            `h264`,
            `-r`,
            this.options.framerate,
            `-i`,
            `pipe:0`,
            `-an`
        ].concat(argsOut, [`pipe:1`]);

        // Converter
        const avconv = spawn(`avconv`, args, {
            stdio: [`pipe`, `pipe`, `pipe`]
        });
        console.error(`\x1b[34mCamera Stream\n=>\x1b[0m avconv`, args.join(` `));

        avconv
            .stdout
            .on(`data`, callback);
        avconv
            .stderr
            .on(`data`, (data) => {
                console.error(data.toString());
            });

        // Controller
        this
            .source
            .pipe(avconv.stdin);

        return avconv;
    }

    mjpeg(callback) {
        return this.stream([
            `-f`,
            `image2pipe`,
            `-c:v`,
            `mjpeg`,
            `-b:v`,
            (2048 * 1024),
            `-r`,
            this.options.framerate
        ], callback);
    }
}

module.exports = Camera;
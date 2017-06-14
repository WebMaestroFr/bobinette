const spawn = require(`child_process`).spawn;

const Detection = require(`./detection`);

let cpus = require(`os`)
    .cpus()
    .length;

if (cpus > 2) {
    cpus -= 2;
} else {
    cpus = 1;
}

class Vision {

    static process(module, options, buffer) {
        return new Promise((resolve, reject) => {

            if (cpus === 0) {
                return;
            }
            cpus -= 1;

            const args = [`${__dirname}/${module}.py`];
            for (const opt of Object.keys(options)) {
                args.push(`--` + opt);
                args.push(JSON.stringify(options[opt]));
            }
            const execution = spawn(`python`, args, {
                stdio: [`pipe`, `pipe`, `pipe`]
            });
            console.error(`\x1b[34mVision Process\n=>\x1b[0m python`, args.join(' '));

            execution
                .stdout
                .on(`data`, (data) => {
                    const response = JSON.parse(data);
                    execution.kill();
                    cpus += 1;
                    resolve(response);
                });
            execution
                .stderr
                .on(`data`, (data) => {
                    execution.kill();
                    cpus += 1;
                    reject(data.toString());
                });

            try {
                execution
                    .stdin
                    .end(buffer);
            } catch (err) {
                reject(err);
            }
        });
    }

    static detect(options, buffer, overlap) {
        return new Promise((resolve, reject) => {
            Vision
                .process(`detect`, options, buffer)
                .then((objects) => {
                    const detections = Detection.collect(objects, overlap);
                    resolve(detections);
                })
                .catch(reject);
        });
    }
}

module.exports = Vision;
const spawn = require(`child_process`).spawn;

const processStdout = (data, callback) => {
    const results = data.split(/}\s*{/);
    const subject = results.length === 1
        ? results[0]
        : `${results[0]}}`;
    try {
        const {date, detections, image} = JSON.parse(subject);
        callback({
            date: (new Date(date)).valueOf(),
            detections,
            image
        });
    } catch (e) {
        if (e instanceof SyntaxError && results.length === 1) {
            console.error(`\x1b[33m✘\x1b[0m Buffering ...`);
            return data;
        } else {
            console.error(e, subject);
        }
    } finally {
        return (results.length === 1)
            ? ``
            : processStdout(`{${results[1]}`, callback);
    }
};

module.exports = {
    detect: (cascade, callback) => {
        const execution = spawn(`python`, [`-u`, `${__dirname}/${cascade}.py`]);
        let stdout = ``;
        execution
            .stdout
            .on(`data`, (data) => {
                stdout = processStdout(stdout + data.toString(), callback);
            });
        execution
            .stdout
            .on('end', function() {
                console.error(`\x1b[31m✘\x1b[0m Python Process`);
            });
        execution
            .stderr
            .on(`data`, (data) => {
                const response = data.toString();
                return console.error(response);
            });
    }
};
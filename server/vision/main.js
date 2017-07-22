const spawn = require(`child_process`).spawn;

const debug = require(`../debug`);

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
    } catch (err) {
        if (err instanceof SyntaxError && results.length === 1) {
            debug.warning(`Buffering ...`);
            return data;
        } else {
            debug.error(err);
        }
    } finally {
        return (results.length === 1)
            ? ``
            : processStdout(`{${results[1]}`, callback);
    }
};

module.exports = {
    detect: (cascade, callback) => {
        const execution = spawn(`python`, [
            `-u`, `${__dirname}/${cascade}.py`
        ], {
            detached: true,
            stdio: [`ignore`, `pipe`, `pipe`]
        });
        let stdout = ``;
        execution
            .stdout
            .on(`data`, (data) => {
                stdout = processStdout(stdout + data.toString(), callback);
            });
        execution
            .stderr
            .on(`data`, (data) => {
                const response = data.toString();
                debug.error(response);
            });
        return execution;
    }
};
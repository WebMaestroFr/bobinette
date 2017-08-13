const spawn = require(`child_process`).spawn;

const debug = require(`../debug`);

const processStdout = (data, callback) => {
    const results = data.split(/}\s*{/);
    const subject = results.length === 1
        ? results[0]
        : `${results[0]}}`;
    try {
        const frame = JSON.parse(subject);
        callback(frame);
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
    detect: (subject, handleSnapshot) => {
        const execution = spawn(`python`, [
            `-u`, `${__dirname}/detect/__main__.py`, subject
        ], {
            detached: true,
            stdio: [`ignore`, `pipe`, `pipe`]
        });
        let stdout = ``;
        execution
            .stdout
            .on(`data`, (data) => {
                stdout = processStdout(stdout + data.toString(), handleSnapshot);
            });
        execution
            .stderr
            .on(`data`, (data) => {
                const response = data.toString();
                debug.error(response);
            });
        return execution;
    },
    train: (profiles) => {}
};
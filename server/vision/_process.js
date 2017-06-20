const spawn = require(`child_process`).spawn;

module.exports = (module, options) => {
    return new Promise((resolve, reject) => {

        const args = [`${__dirname}/__${module}.py`];
        for (const opt of Object.keys(options)) {
            args.push(`--` + opt);
            args.push(JSON.stringify(options[opt]));
        }
        const execution = spawn(`python`, args, {
            stdio: [`pipe`, `pipe`, `pipe`]
        });
        console.error(`\x1b[34mVision Process\n=>\x1b[0m python`, args.join(` `));

        execution
            .stdout
            .on(`data`, (data) => {
                const response = JSON.parse(data);
                execution.kill();
                return resolve(response);
            });
        execution
            .stderr
            .on(`data`, (data) => {
                execution.kill();
                return reject(data.toString());
            });
    }).catch((err) => {
        return console.error(`\x1b[31m✘\x1b[0m Vision Process`, err);
    });
};
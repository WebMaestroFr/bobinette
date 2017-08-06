let logKey = null;

const clearLastLog = (key = null) => {
    if (key !== null && key === logKey) {
        process
            .stderr
            .cursorTo(0);
    } else {
        process
            .stderr
            .write(`\n`)
    }
    logKey = key;
}

module.exports = {
    success: (message, key) => {
        clearLastLog(key);
        process
            .stderr
            .write(`\x1b[32m✔\x1b[0m ${message}`);
    },
    warning: (message, key) => {
        clearLastLog(key);
        process
            .stderr
            .write(`\x1b[33m●\x1b[0m ${message}`);
    },
    error: (message, key) => {
        clearLastLog(key);
        process
            .stderr
            .write(`\x1b[31m✘\x1b[0m ${message}`);
    }
}
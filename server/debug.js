module.exports = {
    success: (message) => {
        console.error(`\x1b[32m✔\x1b[0m`, message);
    },
    warning: (message) => {
        console.error(`\x1b[33m●\x1b[0m`, message);
    },
    error: (message) => {
        console.error(`\x1b[31m✘\x1b[0m`, message);
    }
}
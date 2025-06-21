module.exports = {
    apps : [
        {
            name: 'dev-main',
            script: './server.js',
            instances: 1,
            exec_mode: 'cluster',
            merge_logs: true,
        },
        {
            name: 'dev-socket',
            script    : "./socket.js",
            instances : 1,
            exec_mode : "cluster",
            merge_logs: true,
        },
    ]
}
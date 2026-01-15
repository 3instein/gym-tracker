module.exports = {
    apps: [
        {
            name: 'gym-tracker',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3002,
                HOSTNAME: '0.0.0.0'
            }
        }
    ]
};

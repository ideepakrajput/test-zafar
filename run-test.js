const { spawn } = require('child_process');

console.log('=== Starting Webpage Generator API Test ===\n');

// Start the server
const server = spawn('node', ['app.js'], {
    stdio: 'pipe'
});

server.stdout.on('data', (data) => {
    console.log(`[SERVER] ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
    console.error(`[SERVER ERROR] ${data.toString().trim()}`);
});

// Wait for server to start, then run test
setTimeout(() => {
    console.log('\n=== Running API Test ===\n');

    const test = spawn('node', ['test.js'], {
        stdio: 'pipe'
    });

    test.stdout.on('data', (data) => {
        console.log(`[TEST] ${data.toString().trim()}`);
    });

    test.stderr.on('data', (data) => {
        console.error(`[TEST ERROR] ${data.toString().trim()}`);
    });

    test.on('close', (code) => {
        console.log(`\n[TEST] Test completed with code ${code}`);
        server.kill();
        process.exit(0);
    });

}, 3000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.kill();
    process.exit(0);
});
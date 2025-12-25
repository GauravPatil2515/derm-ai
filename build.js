const { exec } = require('child_process');

exec('npx vite build', { cwd: '.', shell: true }, (error, stdout, stderr) => {
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    if (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
});

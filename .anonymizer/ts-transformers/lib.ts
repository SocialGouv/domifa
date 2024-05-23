export function main(anonymize: (line: Record<string, any>) => void) {
    const stdin = process.stdin;
    const stdout = process.stdout;
    const stderr = process.stderr;

    // stdin.setEncoding('utf8');

    // stderr.write('Anonymizer started\n');

    // process.once('SIGTERM', () => {
    //     stderr.write('SIGTERM received\n');
    //     process.exit(1);
    // });

    stdin.on('data', function (lineBuffer) {
        try {
            const line = JSON.parse(lineBuffer.toString());
            anonymize(line);
        } catch (error: any) {
            stderr.write(`Error: ${error.message}\n`);
            stderr.write(`Stack: ${error.stack}\n`);
            process.exit(1);
        }
    });

    stdin.on('end', function () {
       stderr.write('Anonymizer ended\n');
    })
}
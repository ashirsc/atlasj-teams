import * as readline from 'readline';

export class LineReader {
    private rl: readline.Interface;
    private lines: string[];
    private resolve: (value: string | PromiseLike<string>) => void;

    constructor() {
        this.lines = [];
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.rl.on('line', (input) => {
            if (this.resolve) {
                this.resolve(input);
                this.resolve = null;
            } else {
                this.lines.push(input);
            }

            this.rl.prompt();
        });

        console.log("Welcome! Enter your question below.")

        this.rl.setPrompt('> ');
        this.rl.prompt();
    }

    getLine(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.lines.length > 0) {
                resolve(this.lines.shift()?.slice(2));
            } else {
                this.resolve = resolve;
            }
        });
    }
}
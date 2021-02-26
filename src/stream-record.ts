import fs from 'fs';

export class StreamRecord {
    index0;
    stream: fs.WriteStream;
    constructor(filePath: fs.PathLike, csvIndex: string) {
        this.index0 = csvIndex
        if (fs.existsSync(filePath)) console.log(`path:${filePath} exists`);
        else {
            this.stream = fs.createWriteStream(filePath, { encoding: 'utf8' });
            this.stream.write(this.index0);
        }
    }
    write = (chunk: any, ...args: any) => this.stream.write(chunk, ...args);
}
import * as fs from 'node:fs';

export function readFile(filename: string) {
  const readStream = fs.createReadStream(filename);
  return new Promise((resolve, reject) => {
    let result = '';
    readStream.on('data', (data) => {
      result += data;
    });
    readStream.on('end', () => resolve(result));
    readStream.on('error', (err) => reject(err));
  });
}

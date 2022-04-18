import fs from 'fs';
import path from 'path';

export const readStream = (file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = fs.createReadStream(path.resolve(file));
    let fileContent = '';
    stream.on('data', (data: string) => {
      fileContent += data;
    });

    stream.on('close', () => {
      resolve(fileContent);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });


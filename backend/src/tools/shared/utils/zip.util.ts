import * as fs from 'fs';
const archiver = require('archiver');
import { Logger } from '@nestjs/common';

export async function zipFiles(sourceFiles: string[], outputPath: string): Promise<void> {
  const logger = new Logger('ZipUtil');
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    output.on('close', function() {
      logger.log(`Zipped ${archive.pointer()} total bytes to ${outputPath}`);
      resolve();
    });

    archive.on('warning', function(err: any) {
      if (err.code === 'ENOENT') {
        logger.warn(err);
      } else {
        reject(err);
      }
    });

    archive.on('error', function(err: any) {
      reject(err);
    });

    archive.pipe(output);

    for (const file of sourceFiles) {
      const name = file.split(/[\\/]/).pop();
      if (name) {
        archive.file(file, { name });
      }
    }

    archive.finalize();
  });
}

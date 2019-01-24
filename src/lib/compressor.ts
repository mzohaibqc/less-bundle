/// <reference path="../typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import globals = require('./globals');
import buildContents = require('./buildcontents');
import generateOutput = require('./generateoutput');

function writeToFile(path: string, data: Array<string>) {
  return new Promise(function (resolve, reject) {
    try {
      var fd = fs.openSync(path, 'w'),
        buffer = new Buffer(data.join('\n'), 'utf8');

      fs.writeSync(fd, buffer, 0, buffer.length, 0);
      fs.closeSync(fd);
      resolve();
    } catch (err) {
      console.log('Could not write to file: ' + JSON.stringify(err, null, 4));
      reject(err);
    }
  });
}

/**
 * Uses the config to go through all of the framework *.less files in the 
 * proper order and compresses them into a single file for packaging.
 * 
 * @param config The configuration for compressing the files.
 * when the task is complete.
 */
function compress(config?: globals.IConfig) {
  globals.initialize(config);
  return new Promise(function (resolve, reject) {
    var src = path.resolve(globals.config.src),
      writeFile = config && config.writeFile,
      writers = globals.writers,
      output = globals.output,
      dest = globals.config.dest,
      clear = globals.clear,
      version = globals.config.version,
      license = globals.config.license;

    // Goes through each file in the dest files and makes sure they have a 
    // .less extension.
    if (writeFile) {
      dest.forEach((outFile, index) => {
        var end = outFile.lastIndexOf('.');
        dest[index] = outFile.substring(0, (end > -1) ? end : undefined) + '.less';
      });
    }

    // Reads the src file, builds the contents for each 
    // file in the proper order, and generates the output file.
    fs.readFile(src, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      var splitLines = data.split(/\r\n|\n/);
      splitLines[0] = splitLines[0].trim();
      buildContents(splitLines, src);

      // generate the output
      generateOutput();

      // If a license file is specified, we want to prepend it to the output.
      if (!!license) {
        var licenseFile = path.resolve(license),
          licenseData = fs.readFileSync(licenseFile, 'utf8'),
          lines = licenseData.split(/\r\n|\n/),
          regex = /(.*)v\d+\.\d+\.\d+(.*)/;

        // If a version is specified, we want to go through and find where 
        // the version is specified in the license, then replace it with the 
        // passed-in version.
        if (!!version) {
          lines.some((line, index) => {
            if (regex.test(line)) {
              lines[index] = line.replace(regex, '$1v' + version + '$2');
              return true;
            }
            return false;
          });
        }

        // Add the lines as a comment block
        lines.forEach((line, index) => {
          lines[index] = ' * ' + line;
        });

        lines.unshift('/**');
        lines.push(' */');

        output.unshift(lines.join('\n'));
      }

      // Make sure the file ends in a new line.
      if (!!output[output.length - 1].trim()) {
        output.push('');
      }

      // Go through each destination file and make sure we can 
      // write a file to the location, making new directories 
      // if necessary. Then write the output to each destination.
      if (writeFile) {
        dest.forEach((destFile) => {
          var destPath = path.resolve(destFile),
            split = path.resolve(destPath, '..').split(/\/|\\/),
            concat = '';

          if (/[a-zA-Z]:/.test(split[0])) {
            split.shift();
            split.unshift('/' + split.shift());
          }

          split.forEach((val) => {
            concat += val + '/';
            try {
              fs.mkdirSync(concat);
            } catch (err) {

            }
          });

          writeToFile(destPath, output)
            .then(() => resolve(output.join('\n')))
            .catch(error => reject(error));
        });
      }
      clear();
      resolve(output.join('\n'));
    });
  });
}

export = compress;

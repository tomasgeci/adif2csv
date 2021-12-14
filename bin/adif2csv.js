#!/usr/bin/env node

import {readFileSync, writeFile} from 'fs';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers'
import chalk from 'chalk';
import boxen from 'boxen';
import {AdifParser} from 'adif-parser-ts';
import {convertArrayToCSV} from 'convert-array-to-csv';

const cliOptions = yargs(hideBin(process.argv))
    .usage("Usage: -f <file>")
    .version('1.0.0')
    .option('f', {
        alias: "file",
        describe: "Path to ADIF file ",
        type: "string",
        demandOption: true
    })
    .argv

const loadedMsg = chalk.white.bold(`Loaded ADIF file ${cliOptions.file}`)

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
    backgroundColor: "#445544"
};

console.log(boxen(loadedMsg, boxenOptions));

let start = new Date();

try {
    const adifFileContent = readFileSync(cliOptions.file, 'utf8');
    let adifContent = AdifParser.parseAdi(adifFileContent);
    let count = adifContent.records.length;
    let arrayForCsv = [];

    adifContent.records.forEach(record => {
        arrayForCsv.push(
            {
                'call': record['call'],
                'band': record['band'],
                'mode': record['mode'],
                'time_on': record['time_on'],
                'qso_date': record['qso_date'],
                'rst_rcvd': record['rst_rcvd'],
                'rst_sent': record['rst_sent']
            }
        );
    });

    const csv = convertArrayToCSV(arrayForCsv, {separator: ','});

    writeFile(cliOptions.file + '.csv', csv, function (err) {
        if (err) {
            return console.log(err);
        }
    });

    const finishedMsg = chalk.green.bold(`Converted ADIF file ${cliOptions.file} to ${cliOptions.file}.csv with ${count} QSO records`)

    console.log(boxen(finishedMsg, boxenOptions));
    console.log('Execution time: %dms', new Date() - start);

} catch (err) {
    console.error(err)
}

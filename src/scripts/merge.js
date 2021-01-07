/**
 * Merge population data (originally in CSV) into 
 * a GeoJSON
 */
const Papa = require('papaparse');
const fs = require('fs')
const jsonfile = require('jsonfile')

const regions = require('../data/galicia.json');

const POSTAL_CODE_LENGTH = 5

const isCouncil = data => data.cp.length === POSTAL_CODE_LENGTH
const indexByPostalCode = (prev, current) => {
    prev[current.cp] = current;
    return prev
}

const yearlyDataCsv = fs.readFileSync(`${__dirname}/../data/yearlyDataPontevedra.csv`)

const yearlyData = Papa.parse(yearlyDataCsv.toString(), { header: true, delimiter:';'})
    .data
    .filter( isCouncil )
    .reduce( indexByPostalCode, {} )

regions.features.forEach(region => {
    const postalCode = region.properties.codigo_postal
    region.properties.population = yearlyData[postalCode]
})

const unknown = regions.features.filter( region => !region.properties.population )

unknown.forEach( region => region.properties.population = {})

console.log(`${unknown.length} unmatched councils`)
//console.log(unknown)

jsonfile.writeFileSync(`${__dirname}/../data/galiciaWithPopulation.json`, regions)

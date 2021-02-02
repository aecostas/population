import React, { useState } from 'react';

import ElevationMap from './components/ElevationChart'
import YearSelector from './components/YearSelector'
import TimeSeriesChart from './components/TimeSeriesChart'

import * as turf from '@turf/turf'

import population from './data/galiciaWithPopulation.json'

import './App.css'

// {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-123.0249569,49.2407190],[-123.0241582,49.2407165],[-123.0240445,49.2406847],[-123.0239311,49.2407159],[-123.0238530,49.2407157],[-123.0238536,49.2404548],[-123.0249568,49.2404582],[-123.0249569,49.2407190]]]},
// "properties":{"valuePerSqm":4563,"growth":0.3592}},

population.features.forEach(feature => {
  feature.properties.area = turf.area(feature.geometry) / 1000000
})

const [longitude, latitude] = turf.center(turf.featureCollection(population.features)).geometry.coordinates
const years = ['1981', '1991', '2000', '2010', '2019']

const dataByYear = {}

years.forEach(year => {
  dataByYear[year] = population.features
    .map(feature => feature.properties.population[year])
    .sort((a, b) => parseInt(b) - parseInt(a))
})

const App = () => {
  const [currentYear, setCurrentYear] = useState(2000)

  // this line changes the data modal so deck.gl refresh the map
  population.features.forEach(feature => feature.properties.current = currentYear)

  return (
    <React.Fragment>

      <ElevationMap 
        data={ population }
        currentYear={currentYear}
        center={[latitude, longitude]}
        visualization='population'
      />

      <YearSelector
        years={[1981, 1991, 2000, 2010, 2019]}
        slideTo={year => {
          setCurrentYear(year)
        }}
      />

      <TimeSeriesChart
        className='population-chart'
        data={dataByYear}
        currentYear={currentYear}
      />

    </React.Fragment>

  );
}

export default App;

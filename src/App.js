import React, { useState } from 'react';
import { render } from 'react-dom';
import { StaticMap } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
import { scaleThreshold } from 'd3-scale';

import YearSelector from './components/YearSelector'
import TimeSeriesChart from './components/TimeSeriesChart'

import * as turf from '@turf/turf'

import population from './data/galiciaWithPopulation.json'

import './App.css'

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json'; // eslint-disable-line

// {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-123.0249569,49.2407190],[-123.0241582,49.2407165],[-123.0240445,49.2406847],[-123.0239311,49.2407159],[-123.0238530,49.2407157],[-123.0238536,49.2404548],[-123.0249568,49.2404582],[-123.0249569,49.2407190]]]},
// "properties":{"valuePerSqm":4563,"growth":0.3592}},

export const COLOR_SCALE = scaleThreshold()
  .domain([0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ]);

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

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

const App = ({ data = DATA_URL, mapStyle = MAP_STYLE }) => {
  const [currentYear, setCurrentYear] = useState(2000)

  const getTooltip = ({ object }) => {
    if (!object) return;

    const population = object.properties.population ? parseInt(object.properties.population[`${currentYear}`]) : 0
    const area = parseInt(object.properties.area)

    return (
      {
        html:
          `\
          <div><b>${object.properties.municipio}</b></div>
          <div> Área: ${area} km<sup>2</sup> </div>
          <div> Población: ${population} </div>
          <div> Densidad: ${parseInt(population / area)} hab/km<sup>2</sup>  </div>
          `
      }
    );
  }


  const initialViewState = {
    latitude,
    longitude,
    zoom: 8,
    maxZoom: 16,
    pitch: 45,
    bearing: 0
  };

  population.features.forEach(feature => feature.properties.current = currentYear)

  const layers = [
    new GeoJsonLayer({
      id: 'geojson',
      data: population,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      updateTriggers: {
        getElevation: { year: currentYear }
      },
      getElevation: f => {
        const value = f.properties.population ? f.properties.population[`${currentYear}`] : 0
        return value / f.properties.area * 10
      },
      getFillColor: f => {
        const value = f.properties.population ? f.properties.population[`${currentYear}`] : 0
        return COLOR_SCALE(value / f.properties.area)
      },
      getLineColor: [255, 255, 255],
      pickable: true
    })
  ];

  return (
    <React.Fragment>

      <DeckGL
        layers={layers}
        // effects={effects}
        initialViewState={initialViewState}
        controller={true}
        getTooltip={getTooltip}
      >
        <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
      </DeckGL>

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

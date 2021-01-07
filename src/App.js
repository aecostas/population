import React, { useState } from 'react';
import { render } from 'react-dom';
import { StaticMap } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
import { scaleThreshold } from 'd3-scale';

import * as turf from '@turf/turf'

import population from './data/galiciaWithPopulation.json'

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

const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 11,
  maxZoom: 16,
  pitch: 45,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 13),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true
});

const landCover = [[[-123.0, 49.196], [-123.0, 49.324], [-123.306, 49.324], [-123.306, 49.196]]];

function getTooltip({ object }) {
  if (!object) return;

  const population = object.properties.population ? parseInt(object.properties.population['2010']) : 0
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

const App = ({ data = DATA_URL, mapStyle = MAP_STYLE }) => {

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  population.features.forEach(feature => {
    feature.properties.area = turf.area(feature.geometry) / 1000000
  })

  const layers = [
    // only needed when using shadows - a plane for shadows to drop on
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      stroked: false,
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    }),
    new GeoJsonLayer({
      id: 'geojson',
      data: population,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: f => {
        const value = f.properties.population ? f.properties.population['2010'] : 0
        console.log(value / f.properties.area)
        return value / f.properties.area * 10
      },
      getFillColor: f => {
        const value = f.properties.population ? f.properties.population['2010'] : 0
        return COLOR_SCALE(value / f.properties.area)
      },
      getLineColor: [255, 255, 255],
      pickable: true
    })
  ];

  return (
    <DeckGL
      layers={layers}
     // effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export default App;

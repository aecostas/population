import React, { useMemo } from 'react';

import { StaticMap } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { scaleThreshold } from 'd3-scale';

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

export const COLOR_SCALE_POPULATION = scaleThreshold()
  .domain([0, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000, 512000, 1024000, 2048000])
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

const ElevationMap = props => {
    const mapStyle = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
    const [latitude, longitude] = props.center

    const initialViewState = {
        latitude,
        longitude,
        zoom: 8,
        maxZoom: 16,
        pitch: 45,
        bearing: 0
    };

    const getTooltip = ({ object }) => {
        if (!object) return;

        const population = object.properties.population ? parseInt(object.properties.population[`${props.currentYear}`]) : 0
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

    const regionCallbacks = useMemo(() => ({
        density: {
            elevation: f => {
                const value = f.properties.population ? f.properties.population[`${props.currentYear}`] : 0
                return value / f.properties.area * 10
            },
            fillColor: f => {
                const population = f.properties.population ? f.properties.population[`${props.currentYear}`] : 0
                return COLOR_SCALE(population / f.properties.area)
            }
        },
        population: {
            elevation: f => {
                return parseInt(f.properties.population[`${props.currentYear}`])
            },
            fillColor: f => {
                const population = f.properties.population ? f.properties.population[`${props.currentYear}`] : 0
                return COLOR_SCALE_POPULATION(population)
            }
        }
    }))

    const currentVisualization = props.visualization
    const layers = [
        new GeoJsonLayer({
            id: 'geojson',
            data: props.data,
            opacity: 0.8,
            stroked: false,
            filled: true,
            extruded: true,
            wireframe: true,
            updateTriggers: {
                getElevation: { year: props.currentYear }
            },
            getElevation: regionCallbacks[currentVisualization].elevation,
            getFillColor: regionCallbacks[currentVisualization].fillColor,
            getLineColor: [255, 255, 255],
            pickable: true
        })
    ];

    return (
        <DeckGL
            layers={layers}
            // effects={effects}
            initialViewState={initialViewState}
            controller={true}
            getTooltip={getTooltip}
        >
            <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
        </DeckGL>
    )
}

export default ElevationMap;

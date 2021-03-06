import React from 'react';

import {
    XYPlot,
    XAxis,
    YAxis,
    HorizontalGridLines,
    VerticalGridLines,
    LineSeries,
    MarkSeries,
    DiscreteColorLegend
} from 'react-vis';

import './time-series-chart.scss'

const TimeSeriesChart = props => {
    const THIN_LINE = 2
    const FAT_LINE = 4

    const lineSeries = Object.keys(props.data).map(year => <LineSeries
        data={props.data[year].map((value, i) => ({ x: i, y: parseInt(value) }))}
        style={{ strokeWidth: parseInt(year) === parseInt(props.currentYear) ? FAT_LINE : THIN_LINE }}
    />)

    return (
        <div>
            <XYPlot yDomain={[0, 10000]} width={500} height={300} className={props.className}>

                <HorizontalGridLines />
                <VerticalGridLines />
                <XAxis title="Concellos" tickValues={Array(props.data.length).map((item, i) => i)} />
                <YAxis title="Poboación" left={0} />

                {lineSeries}
            </XYPlot>
        </div>

    );
}

export default TimeSeriesChart;


/*
   <DiscreteColorLegend
                    items={Object.keys(props.data)}
                />
        <LineSeries
                className="fourth-series"
                curve={curveCatmullRom.alpha(0.5)}
                data={[{ x: 1, y: 7 }, { x: 2, y: 11 }, { x: 3, y: 9 }, { x: 4, y: 2 }]}
            />
*/
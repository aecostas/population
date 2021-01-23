import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 250,
    },
    margin: {
        height: theme.spacing(3),
    },
}));

const marks = [
    {
        value: 0,
        label: '0°C',
    },
    {
        value: 10,
        label: '20°C',
    },
    {
        value: 50,
        label: '37°C',
    },
    {
        value: 100,
        label: '100°C',
    },
];

function valuetext(value) {
    return `${value}°C`;
}

const YearSelector = props => {
    const classes = useStyles();
    const range = props.years.slice(-1) - props.years[0]
    const normalize = year => (year - props.years[0])*100/range
    const unnormalize = value => value * range / 100 + props.years[0]

    const marks = props.years.map( (year, i) => (
        {
            value: normalize(year), 
            label: `${year}`
        })
    )

    const handleChange = (evt, newValue) => {
        props.slideTo(unnormalize(newValue))
    }

    const valueLabelFormat = (value) => marks.findIndex((mark) => mark.value === value) + 1;
    return (
        <div className={classes.root}>
            <Typography id="track-false-slider" gutterBottom>
                Removed track
        </Typography>
            <Slider
                track={false}
                aria-labelledby="track-false-slider"
                valueLabelFormat={valueLabelFormat}
                getAriaValueText={valuetext}
                defaultValue={2}
                marks={marks}
                step={null}
                onChange={handleChange}
            />
            <div className={classes.margin} />

        </div>
    );
}

export default YearSelector;
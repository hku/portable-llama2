import { Grid, Input, Slider, Typography } from "@mui/material"
import React, { useEffect } from "react";

interface ParamSliderProps {
    label: string;
    min: number; 
    max: number; 
    step: number; 
    defaultValue: number;
    onChange: (s:number) => void
}

const ParamSlider = ({label, onChange, defaultValue, min, max, step}: ParamSliderProps) => {

    const [value, setValue] = React.useState<number>(defaultValue);

    useEffect(()=>{
        onChange(value)
    },[value]);

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        if(Array.isArray(newValue)) {
            setValue(newValue[0]);
        } else {
            setValue(newValue)
        }
      };
    
      const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.trim()
        setValue(value === '' ? defaultValue : Number(event.target.value));
      };
    
      const handleBlur = () => {
        if (value < min) {
          setValue(min);
        } else if (value > max) {
          setValue(max);
        }
      };

    return <>
        <Typography gutterBottom>{label}</Typography>
        <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Slider
            value={value}
            onChange={handleSliderChange}
            min ={min}
            step={step}
            max={max}
            aria-labelledby="input-slider"
          />
        </Grid>
        <Grid item>
          <Input
            value={value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    
    </>
}

export default ParamSlider


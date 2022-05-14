import React from "react";
import { Box, Button } from "@material-ui/core";
import Context from "../../contexts/Context";
import { notifyExpectedPerformance } from "../../sessionManager";

import CanvasJSReact from './canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default class STMessage extends React.Component {
    static contextType = Context;

    constructor(props) {
        super(props);
        this.state = { continue: false };
        this.expectedPerformanceChangeHandler = this.expectedPerformanceChangeHandler.bind(this);
    }
    
    expectedPerformanceChangeHandler(event) {
        let stMessage = this.context.environment.localization.stMessage;

        var val = parseInt(event.target.value);
        if (val > stMessage.chart.max) val = stMessage.chart.max;
        if (val < stMessage.chart.min) val = stMessage.chart.min;

        notifyExpectedPerformance(val);

        this.chart.options.data[0].dataPoints[2].y =  val;
        this.chart.render();

        if (event.target.value !== null && event.target.value !== '' && val > 0)
            this.setState({ continue: true });
        else
            this.setState({ continue: false });
    }

    render() {
        let localization = this.context.environment.localization;
        let stMessage = localization.stMessage;

        if (stMessage.chart !== undefined) {
            const options = {
                title: { text: stMessage.chart.title },
                data: [{
                    type: "column",
                    dataPoints: stMessage.chart.dataPoints
                }]
            };

            return (
                <Box>
                    <Box>
                        <CanvasJSChart options = {options}  onRef = {ref => this.chart = ref} />
                    </Box>
                    Indique quanto acha que vai ser seu escore entre [0 - 200]: 
                    <input type="number" pattern="[0-9]*" inputmode="numeric" min={stMessage.chart.min} max={stMessage.chart.max} onChange={this.expectedPerformanceChangeHandler} />
                    <center style={{margin: "16px"}}>
                        <Button disabled={!this.state.continue} variant="contained" color="primary" size="large" onClick={this.props.onClickNext}>
                            {stMessage.next}
                        </Button>
                    </center>
                </Box>
            );
        } else {
            return(
                <Box>
                    <center style={{margin: "16px"}}>
                        <Button variant="contained" color="primary" size="large" onClick={this.props.onClickNext}>
                            {stMessage.next}
                        </Button>
                    </center>
                </Box>
            );
        }

        
    }
}
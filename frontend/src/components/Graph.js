import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Graph.css';

function Graph(props) {
    const heartRateRef = useRef(null);
    const cadenceRef = useRef(null);
    const altitudeRef = useRef(null);


    const data = props.data;
    const heartRateData = (typeof data.heartrate === 'undefined') ? null : data.heartrate.data;
    const cadenceData = (typeof data.cadence === 'undefined') ? null : data.cadence.data;
    const altitudeData = (typeof data.altitude === 'undefined') ? null : data.altitude.data;
    const heartrateColor = "red";
    const cadenceColor = "green";
    const altitudeColor = "blue";

    useEffect(() => {
        const margin = { top: 10, right: 1, bottom: 40, left: 75 };
        const width = 480 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const createGraph = (ref, graphData, yAxisLabel, color) => {
            const svgElement = ref.current.querySelector('svg');

            let svg;
            if (svgElement) {
                svg = d3.select(svgElement).select('g');
            } else {
                svg = d3
                    .select(ref.current)
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            }

            const x = d3.scaleLinear().range([0, width]);
            const y = d3.scaleLinear().range([height, 0]);

            const line = d3
                .line()
                .x((d, i) => x(i))
                .y((d) => y(d));

            x.domain([0, props.index]);
            y.domain([d3.min(graphData), d3.max(graphData)]);

            const formatKilometers = d3.format('.1f');
            const xAxis = d3.axisBottom(x).tickFormat((d) => formatKilometers(props.kilometers[d] / 1000) + ' km');

            if (!svgElement) {
                svg.append('path')
                    .datum(graphData)
                    .attr('class', 'line')
                    .style('stroke', color)
                    .style('fill', 'none');
            } else {
                svg.select('.line')
                    .datum(graphData)
                    .transition()
                    .duration(100)
                    .attr('d', line)
                    .style('stroke', color);
            }

            if (!svgElement) {
                svg.append('g')
                    .attr('class', 'x-axis')
                    .attr('transform', `translate(0, ${height})`)
                    .call(xAxis);

                svg.append('g').call(d3.axisLeft(y));
                svg.append('text')
                    .attr('class', 'y-axis-label')
                    .attr('transform', 'rotate(-90)')
                    .attr('y', -margin.left)
                    .attr('x', -height / 2)
                    .attr('dy', '1em')
                    .style('text-anchor', 'middle')
                    .text(yAxisLabel);
            } else {
                svg.select('.x-axis').transition().duration(1).call(xAxis);
            }
        };
        if (heartRateData !== null) { createGraph(heartRateRef, heartRateData, 'Heart Rate', heartrateColor); }
        if (cadenceData !== null) { createGraph(cadenceRef, cadenceData, 'Cadence', cadenceColor); }
        if (altitudeData !== null) { createGraph(altitudeRef, altitudeData, 'Altitude', altitudeColor); }
    }, [props.index]);

    return (
        <div>
            {heartRateData !== null && (
                <div className="graph graphGraph">
                    <h2>Heart Rate</h2>
                    <div ref={heartRateRef} className="graph-container graphContainer"></div>
                </div>
            )}
            {cadenceData !== null && (
                <div className="graph graphGraph">
                    <h2>Cadence</h2>
                    <div ref={cadenceRef} className="graph-container graphContainer"></div>
                </div>
            )}
            {altitudeData !== null && (
                <div className="graph graphGraph">
                    <h2>Altitude</h2>
                    <div ref={altitudeRef} className="graph-container graphContainer"></div>
                </div>
            )}
        </div>
    );
}

export default Graph;

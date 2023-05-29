import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Graph.css'

function Graph(props) {
    const graphRef = useRef(null);
    const lineRef = useRef(null);
    const xAxisRef = useRef(null);

    useEffect(() => {
        const data = props.data;
        const color = props.color;

        const margin = { top: 10, right: 1, bottom: 40, left: 50 };
        const width = 480 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const svgElement = graphRef.current.querySelector("svg");

        let svg;
        if (svgElement) {
            svg = d3.select(svgElement).select("g");
        } else {
            svg = d3.select(graphRef.current)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        }


        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const line = d3.line()
            .x((d, i) => x(i))
            .y(d => y(d));

        x.domain([0, props.index]); // width for full graph
        y.domain([d3.min(data), d3.max(data)]);

        const formatKilometers = d3.format(".1f");
        const xAxis = d3.axisBottom(x).tickFormat(d => formatKilometers(props.kilometers[d] / 1000) + " km");


        if (!lineRef.current) {
            lineRef.current = svg.append("path")
                .datum(data)
                .attr("class", "line")
                .style("stroke", color)
                .style("fill", "none");
        } else {
            svg.select(".line")
                .datum(data)
                .transition()
                .duration(300)
                .attr("d", line)
                .style("stroke", color);
        }

        if (!xAxisRef.current) {
            xAxisRef.current = svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis);
        } else {
            svg.select(".x-axis")
                .transition()
                .duration(500)
                .call(xAxis);
        }

        svg.append("g")
            .call(d3.axisLeft(y));
    }, [props.index]);

    return (
        <div className='graph'>
            <h2>{props.name}</h2>
            <div ref={graphRef} className='graph-container' ></div>
        </div>
    );
}

export default Graph;

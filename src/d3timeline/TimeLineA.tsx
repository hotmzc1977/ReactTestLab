import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3';
import data1 from "./1.json";
import data2 from "./2.json";
import data3 from "./3.json";

type TDataItem = {
    date: Date,
    marketvalue: number,
    value: number
}

type TData = {
    name: string,
    color: string,
    items: TDataItem[]
}

type TDimension = {
    width: number,
    height: number,
    margin: {
        top: number,
        right: number,
        bottom: number,
        left: number
    }
}


interface Props {
    data: TData[],
    dimension: TDimension
}

function TimeLineComponent(props: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const { width, height, margin } = props.dimension
    const [svgWidth, setSvgWidth] = useState<number>(props.dimension.width + props.dimension.margin.left + props.dimension.margin.right);
    const [svgHeight, setSvgHeight] = useState<number>(props.dimension.height + props.dimension.margin.top + props.dimension.margin.bottom);

    useEffect(() => {
        console.log(d3.min(props.data[0].items, (d) => d.value), d3.max(props.data[0].items, (d) => d.value));
        const xScale = d3.scaleTime()
            .domain(d3.extent(props.data[0].items, (item: TDataItem) => item.date) as unknown as Date[])
            .range([0, props.dimension.width])

        const yScale = d3.scaleLinear()
            .domain([
                (d3.min(props.data[0].items, (item) => item.value) ?? 0) - 50,
                (d3.max(props.data[0].items, (item) => item.value) ?? 0) + 50
            ]).range([props.dimension.height, 0])

        const svgEl = d3.select(svgRef.current)
        svgEl.selectAll("*").remove()
        const svg = svgEl.append("g").attr("transform", `translate(${margin.left},${margin.top})`)
        const xAxis = d3
            .axisBottom(xScale)
            .ticks(5)
            .tickSize(-height + margin.bottom);
        const xAxisGroup = svg
            .append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(xAxis);
        xAxisGroup.select(".domain").remove();
        xAxisGroup.selectAll("line").attr("stroke", "rgba(255, 255, 255, 0.2)");
        xAxisGroup
            .selectAll("text")
            .attr("opacity", 0.5)
            .attr("color", "white")
            .attr("font-size", "0.75rem");

        const yAxis = d3
            .axisLeft(yScale)
            .ticks(5)
            .tickSize(-width)
            .tickFormat((val) => `${val}%`);
        const yAxisGroup = svg.append("g").call(yAxis);
        yAxisGroup.select(".domain").remove();
        yAxisGroup.selectAll("line").attr("stroke", "rgba(255, 255, 255, 0.2)");
        yAxisGroup
            .selectAll("text")
            .attr("opacity", 0.5)
            .attr("color", "white")
            .attr("font-size", "0.75rem");
        // Draw the lines
        const line = d3
            .line()
        // .x((d) => d[0])
        // .y((d) => d[1]);

        svg
            .selectAll(".line")
            .data(props.data)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", (d) => d.color)
            .attr("stroke-width", 3)
            .attr("d", (d) => line(d.items.map(item => {
                const x = xScale(item.date)
                const y = yScale(item.value)
                return [x, y]
            })));

    }, [props])
    return (
        <svg ref={svgRef} width={svgWidth} height={svgHeight} />
    )
}

export default function TimeLineA() {


    const portfolioData = {
        name: "Portfolio",
        color: "#ffffff",
        items: data3.map((d) => ({ ...d, date: new Date(d.date) })) as unknown as [TDataItem]
    };
    const schcData = {
        name: "SCHC",
        color: "#d53e4f",
        items: data2.map((d) => ({ ...d, date: new Date(d.date) })) as unknown as [TDataItem]
    };
    const vcitData = {
        name: "VCIT",
        color: "#5e4fa2",
        items: data1.map((d) => ({ ...d, date: new Date(d.date) })) as unknown as [TDataItem]
    };

    const dimension = {
        width: 600,
        height: 300,
        margin: {
            top: 30,
            right: 30,
            bottom: 30,
            left: 60
        }
    };

    return <div style={{

        backgroundColor: "#000000",
        border: "1px solid white",
        display: "inline-block"
    }}><TimeLineComponent data={[portfolioData, schcData, vcitData]} dimension={dimension} /></div>
}

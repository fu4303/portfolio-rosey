import React, { useState } from 'react'
import classNames from "classnames"
import PropTypes from 'prop-types'
import * as d3 from "d3"
import { useChartDimensions } from "./utils"
import Axis from "components/Paradiddle/Axis"
import Chart from 'components/Paradiddle/Chart'
import Line from "components/Paradiddle/Line"
import './Timeline.scss'

const formatDate = d3.timeFormat("%A")

const Timeline = ({ data, xAccessor, yAccessor, label, className }) => {
    const [ref, dimensions] = useChartDimensions();
    const [isMouseMove, setIsMouseMove] = useState(false);
    const [currentHoveredData, setCurrentHoveredData] = useState();
    const [currentHoveredCircleCoords, setCurrentHoveredCircleCoords] = useState();

    const xScale = d3.scaleTime()
        .domain(d3.extent(data[0], xAccessor))
        .range([0, dimensions.boundedWidth])

    const yScale = d3.scaleLinear()
        .domain([120, 180])
        .range([dimensions.boundedHeight, 0])

    const xAccessorScaled = d => xScale(xAccessor(d))
    const yAccessorScaled = d => yScale(yAccessor(d))

    const onMouseMove = e => {
        let x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        let y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        const hoveredDate = xScale.invert(x);

        const getDistanceFromHoveredDate = d => Math.abs(
            xAccessor(d) - hoveredDate
        )

        const closestIndex = d3.scan(data[0], (a, b) => (
            getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
        ))

        let closestDataPoints = []
        for (let i=0; i < data.length; i++) {
            closestDataPoints.push(data[i][closestIndex])
        }

        let circleCoords = []
        let closestValues = []
        for (let j=0; j < closestDataPoints.length; j++) {
            let closestXVal = xAccessor(closestDataPoints[j])
            let closestYVal = yAccessor(closestDataPoints[j])

            closestValues.push([closestXVal, closestYVal])
            circleCoords.push([xScale(closestXVal), yScale(closestYVal)])
        }

        setIsMouseMove(true)
        setCurrentHoveredData(closestValues)
        setCurrentHoveredCircleCoords(circleCoords)
    }

    const onMouseEnter = e => {
    }

    const onMouseLeave = e => {
        //console.log("onMouseLeave")
        setIsMouseMove(false)
        setCurrentHoveredData()
        setCurrentHoveredCircleCoords()
    }

    return (
        <div className={classNames("Timeline", className)} ref={ref}>
            {currentHoveredCircleCoords && (
                <Tooltip
                    currentHoveredData={currentHoveredData}
                    currentHoveredCircleCoords={currentHoveredCircleCoords}
                    dimensions={dimensions}
                />
            )}

            <Chart
                dimensions={dimensions}
                onMouseMove={onMouseMove}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <Axis
                    dimension="x"
                    scale={xScale}
                    formatTick={formatDate}
                />
                <Axis
                    dimension="y"
                    scale={yScale}
                    label={label}
                />

                {isMouseMove && (
                    <>
                        <rect
                            className="Timeline__hover-line Timeline__hover-line--vertical"
                            width="1"
                            x={currentHoveredCircleCoords[0][0]}
                            y={0}
                            height={dimensions.boundedHeight}
                            style={{ opacity: (isMouseMove ? 1 : 0) }}
                        />
                    </>
                )}

                {data.map((line, i) => (
                    <Line
                        className={`Line--exercise-${i}`}
                        key={i}
                        data={line}
                        xAccessor={xAccessorScaled}
                        yAccessor={yAccessorScaled}
                    />
                ))}

                {isMouseMove && (
                    <>
                        {data.map((circle, i) => (
                            <Circle
                                className={`Circle--exercise-${i}`}
                                key={i}
                                cx={currentHoveredCircleCoords[i][0]}
                                cy={currentHoveredCircleCoords[i][1]}
                                style={{ opacity: (isMouseMove ? 1 : 0) }}
                            />
                        ))}
                    </>
                )}

            </Chart>
        </div>
    );
};

Timeline.propTypes = {
    data: PropTypes.array,
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func,
    label: PropTypes.string
};

export default Timeline;

const Circle = ({ className, cx, cy, style }) => {
    return (
        <circle className={classNames("Circle", className)}
            r={5}
            fill="red"
            cx={cx}
            cy={cy}
            style={style}
        />
    )
}

const Tooltip = ({ currentHoveredCircleCoords, currentHoveredData, dimensions }) => {
    let exercises = ["A", "B", "C", "D"]
    let date = formatDate(currentHoveredData[0][0])
    let leftScrubCoord = currentHoveredCircleCoords[0][0] + dimensions.marginLeft
    let topScrubCoord = dimensions.marginTop

    return (
        <div className="Tooltip__container" style={{ opacity: 1, left: `${leftScrubCoord}px`, top: `${topScrubCoord}px` }}>
            <div className="Tooltip">
                <div className="Tooltip__date">
                    {date}
                </div>
                <div className="Tooltip__variations">
                    {currentHoveredData.map((data, i) => (
                        <div className={classNames("Tooltip__variation", `Tooltip__variation-${[i]}`)} key={i}>
                            <span className="Tooltip__variation__dot"></span>
                            <div className="Tooltip__variation__name">
                                Variation {exercises[i]}
                            </div>
                            <span className="Tooltip__variation__change"></span>
                            <span className="Tooltip__variation__bpm">
                                {data[1]} bpm
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
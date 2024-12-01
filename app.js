const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

const req = new XMLHttpRequest();
let baseTemp
let values 

let xScale
let yScale

let minYear
let maxYear

const width = 1200
const height = 600
const padding = 60

let variance

const tooltip = d3.select("#tooltip");

const canvas = d3.select("#canvas");

const drawCanvas = () => {
      canvas.attr("width", width)
      canvas.attr("height", height)
}

const generateScale = () => {
  minYear = d3.min(values, (item) => item["year"]);
   maxYear = d3.max(values, (item) => item["year"]);
  
   xScale = d3.scaleLinear()
             .domain([minYear, maxYear + 1])
             .range([padding, width - padding])
  
  yScale = d3.scaleTime()
              //new date start in Y-M-D-H-M-S-m
             .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
             .range([padding, height - padding])
}

const drawCells = () => {
  canvas.selectAll("rect")
        .data(values)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("fill", (item) => {
          const variance = item["variance"];
          if (variance <= -2) {
              return "SteelBlue"; 
          } else if (variance <= -1) {
              return "LightSteelBlue"; 
          } else if (variance <= 1) {
              return "orange"; 
          } else {
              return "Crimson";
          }
        })
        .attr("data-year", (item) => item["year"])
        .attr("data-month", (item) => item["month"] - 1)
        .attr("data-temp", (item) => baseTemp + item["variance"])
        .attr("height", (height - (2 * padding)) / 12)
        .attr("y", (item) => yScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0)))
        .attr("width", (item) => {
            let numOfYear = maxYear - minYear;
            return (width - (2 * padding)) / numOfYear;
        })
        .attr("x", (item) => xScale(item["year"]))
        .on("mouseover", (event, item) => {
            const year = item["year"];
            const month = d3.timeFormat("%B")(new Date(0, item["month"] - 1, 1));
            const temp = baseTemp + item["variance"];
            tooltip.transition()
              .style("visibility", "visible");
            tooltip.html(`Year: ${year}<br>Month: ${month}<br>Temperature: ${temp.toFixed(1)}°C`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
            tooltip.attr("data-year", year);
        })
        .on("mouseout", () => {
            tooltip.transition()
              .style("visibility", "hidden");
        });
}


const generateAxis = () => {
  let xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format("d")) 
  
  let yAxis = d3.axisLeft(yScale)
                 .tickFormat(d3.timeFormat("%B")) 
  
   canvas.append('g')
     .call(xAxis)
     .attr("id", "x-axis")
     .attr("transform", "translate(0, " + (height - padding) + ")" )
  
   canvas.append("g")
     .call(yAxis)
     .attr("id", "y-axis")
     .attr("transform", "translate(" + padding + ", 0)")
}

req.open("GET", url, true)
req.onload= () => {
    let object = JSON.parse(req.responseText)
    baseTemp = object["baseTemperature"]
    values = object["monthlyVariance"]
   console.log(values)
    drawCanvas()
    generateScale()
    drawCells()
    generateAxis()
}
req.send();

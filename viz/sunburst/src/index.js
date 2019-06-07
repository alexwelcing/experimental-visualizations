const dscc = require('@google/dscc');
const d3 = Object.assign({}, require('d3'), require('d3-scale-chromatic'), require('d3-hierarchy'), require('d3-array'));

const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

const createRoot = (data) => {
  const levels = data.fields.dimension.length;
  const dimensions = data.fields.dimension;
  const table = data.tables.DEFAULT;
  var nested;
  var nestedVals = [];

  switch (levels) {
    case 1:
      nested =  d3.rollup(table, v => v.length, d => d.dimension[0]);
      for (let [k1, v1] of nested.entries()){
        nestedVals.push(
          {
            name: k1,
            value: v1
          }
        )
      }
      break;
    case 2:
      nested =  d3.rollup(table, v => v.length, d => d.dimension[0], d => d.dimension[1])
      for (let [k1, v1] of nested.entries()){
        let c1 = [];
        for (let [k2, v2] of v1.entries()){
          c1.push({
            name: k2,
            value: v2
          })
        }
        nestedVals.push(
          {
            name: k1,
            children: c1
          }
        )
      }
      break;
    case 3:
      nested = d3.rollup(table, v => v.length, d => d.dimension[0], d => d.dimension[1], d => d.dimension[2])
      for (let [k1, v1] of nested.entries()){
        let c1 = [];
        for (let [k2, v2] of v1.entries()){
          let c2 = [];
          for (let [k3, v3] of v2.entries()){
            c2.push({
              name: k3,
              value: v3
            });
          }
          c1.push({
            name: k2,
            children: c2
          })
        }
        nestedVals.push(
          {
            name: k1,
            children: c1
          }
        )
      }
      break;
    case 4:
      nested =  d3.rollup(table, v => v.length, d => d.dimension[0], d => d.dimension[1], d => d.dimension[2], d => d.dimension[3])
      for (let [k1, v1] of nested.entries()){
        let c1 = [];
        for (let [k2, v2] of v1.entries()){
          let c2 = [];
          for (let [k3, v3] of v2.entries()){
            let c3 = [];
            for (let [k4, v4] of v3.entries()){
              c3.push({
                name: k4,
                dimId: dimensions[3].id,
                value: v4
              });
            }
            c2.push({
              name: k3,
              dimId: dimensions[2].id,
              children: c3
            });
          }
          c1.push({
            name: k2,
            dimId: dimensions[1].id,
            children: c2
          })
        }
        nestedVals.push(
          {
            name: k1,
            children: c1,
            dimId: dimensions[0].id
          }
        )
      }
      break;
    default:
     return table;
  }

  return {children: nestedVals};

}

// write viz code here
const drawViz = (data) => {
  const margin = { top: 20, bottom: 20, left: 20, right: 20 };
  const height = dscc.getHeight() - margin.top - margin.bottom;
  const width = dscc.getWidth() - margin.left - margin.right;

  // remove the canvas if it exists
  d3.select('body')
    .selectAll('svg')
    .remove();

  var svg = d3
    .select('body')
    .append('svg')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('width', width)
    .attr('height', height);

  const radius = Math.min(width/2, height/2);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(
    data.tables.DEFAULT.map((row) => row.dimension[0])
  );

  const assignColor = (d) => {
    if (d.depth === 1) {
      return colorScale(d.data.name);
    } else if (d.depth === 2){
      return colorScale(d.parent.data.name);
    } else if (d.depth === 3){
      return colorScale(d.parent.parent.data.name);
    } else if (d.depth === 4){
      return colorScale(d.parent.parent.parent.data.name);
    }

  }

  const root = d3.hierarchy(createRoot(data));
  root.sum((d) => d.value);
  const layout = d3.partition().size([2 * Math.PI, radius]);
  layout(root);

  const arc = d3.arc();

  const clicked = (d) =>{
    console.log(d);
    let FILTER = dscc.InteractionType.FILTER;
    let interactionData = {
      concepts: [d.data.dimId],
      values: [[d.data.name]]
    };
    dscc.sendInteraction("onClick", FILTER, interactionData);
  }

  const path = svg.append('g')
  .attr('transform', `translate(${width/2}, ${height/2})`)
  .selectAll('path')
  .data(root.descendants().slice(1))
  .enter()
  .append('path')
  .attr('d', (d) => {
    return arc(
      {
        innerRadius: d.y0,
        outerRadius: d.y1,
        startAngle: d.x0,
        endAngle: d.x1
      }
    )
  })
  .attr('fill', (d) => assignColor(d))
  .attr('stroke', 'white')
  .on('click', (d) => clicked(d));


  path.append('title')
  .text((d) => d.data.name);

};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}

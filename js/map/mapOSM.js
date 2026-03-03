import { gBasemap, projection } from "./mapInit.js";
import { tile as d3Tile } from "https://cdn.jsdelivr.net/npm/d3-tile@1/+esm";

const tile = d3Tile();

export function drawOSM(width, height, transform = d3.zoomIdentity) {

  const k = transform.k;

  const scale = projection.scale() * k * 2 * Math.PI;

  const translate = [
    projection.translate()[0] * k + transform.x,
    projection.translate()[1] * k + transform.y
  ];

  const tiles = tile
    .size([width, height])
    .scale(scale)
    .translate(translate)();

  gBasemap
    .selectAll("image")
    .data(tiles, d => `${d[0]}-${d[1]}-${d[2]}`)
    .join("image")
    .attr("href", d =>
      `https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/${d[2]}/${d[0]}/${d[1]}.png`
    )
    .attr("x", d => Math.floor((d[0] + tiles.translate[0]) * tiles.scale))
    .attr("y", d => Math.floor((d[1] + tiles.translate[1]) * tiles.scale))
    .attr("width", Math.ceil(tiles.scale))
    .attr("height", Math.ceil(tiles.scale))
    .attr("opacity", 0.9);
}
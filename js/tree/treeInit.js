export let svgTree;
export let gTreeRoot, gLinks, gNodes;

import { renderTree } from "./treeRender.js";
import { dispatcher } from "../dispatcher.js";

export function initTree() {

  const container = document.getElementById("tree-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  svgTree = d3.select("#tree-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  gTreeRoot = svgTree.append("g")
    .attr("class", "tree-root");

  gLinks = gTreeRoot.append("g")
    .attr("class", "links-layer");

  gNodes = gTreeRoot.append("g")
    .attr("class", "nodes-layer");

  // =====================
  // HOVER depuis MAP
  // =====================
  dispatcher.on("orgHover.tree", id => {

    gNodes.selectAll("g.node")
      .select("circle")
      .attr("stroke", d => d.data.id === id ? "#000" : null)
      .attr("stroke-width", d => d.data.id === id ? 1.5 : 0);

  });

  dispatcher.on("orgOut.tree", () => {

    gNodes.selectAll("g.node")
      .select("circle")
      .attr("stroke", null)
      .attr("stroke-width", 0);

  });

  renderTree();

  return { width, height };
}
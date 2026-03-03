// js/tree/treeZoom.js

import { svgTree, gTreeRoot } from "./treeInit.js";
import { state } from "../state.js";

export function initTreeZoom() {

  const zoom = d3.zoom()
    .scaleExtent([0.5, 5])
    .on("zoom", (event) => {

      const transform = event.transform;

      gTreeRoot.attr("transform", transform);

      state.treeTransform = transform;
    });

  svgTree.call(zoom);
}
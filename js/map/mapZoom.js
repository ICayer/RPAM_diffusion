// /map/mapZoom.js

import { svgMap, gRoot, projection } from "./mapInit.js";
import { drawOSM } from "./mapOSM.js";
import { state } from "../state.js";
import { dispatcher } from "../dispatcher.js";
import { dataStore } from "../data/dataStore.js";

export function initMapZoom(width, height) {

  const zoom = d3.zoom()
    .scaleExtent([1, 40])
    .on("zoom", (event) => {
      const transform = event.transform;

      // 1️⃣ Déplacer toutes les couches vectorielles (Basemap + Donuts)
      gRoot.attr("transform", transform);

      // 2️⃣ Synchroniser les tuiles OSM
      drawOSM(width, height, transform);

      // 3️⃣ COMPENSER LA TAILLE DES DONUTS (La correction est ici)
      // On sélectionne tous les groupes de donuts
      // On leur applique une transformation inverse pour qu'ils gardent 
      // leur taille visuelle initiale malgré le zoom global.
      gRoot.selectAll(".city-group")
        .attr("transform", d => {
          const coords = projection([d.lon, d.lat]);
          // On replace le donut à ses coordonnées ET on divise son échelle par k
          return `translate(${coords[0]}, ${coords[1]}) scale(${1 / transform.k})`;
        })
        .style("stroke-width", (0.8 * transform.k) + "px"); // On épaissit un peu le trait pour qu'il reste visible

      state.mapTransform = transform;
    });

  // Activer le zoom
  svgMap.call(zoom);

  const initialTransform = d3.zoomIdentity.scale(1);
  svgMap.call(zoom.transform, initialTransform);
  state.mapTransform = initialTransform;

  // Forcer mise à jour visuelle immédiate
  gRoot.attr("transform", initialTransform);
  drawOSM(width, height, initialTransform);

  // 🔵 CENTER MAP ON ORGANISATION
  dispatcher.on("centerMapOnOrg.map", id => {
    const org = dataStore.organisationById.get(id);
    if (org && org.lat && org.lon) {
      const coords = projection([org.lon, org.lat]);
      const targetScale = 8;
      const x = width / 2 - targetScale * coords[0];
      const y = height / 2 - targetScale * coords[1];
      
      svgMap.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(targetScale));
    }
  });
}
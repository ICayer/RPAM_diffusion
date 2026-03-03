// js/main.js

import { loadAllData } from "./data/dataLoader.js";
import { initMap, gMarkers, projection } from "./map/mapInit.js";
import { initMapZoom } from "./map/mapZoom.js";
import { initTree } from "./tree/treeInit.js";
import { initTreeZoom } from "./tree/treeZoom.js";
// Importation du nouveau nom de fonction
import { renderMapMarkers } from "./map/mapMarkers.js"; 

async function init() {
  // 1. Charger les données (CSV + Stats par ville)
  await loadAllData();

  // 2. Initialiser la carte (SVG, Groupes, Projection)
  const { width, height } = initMap();
 
  // 3. Dessiner le fond de carte OSM
  import("./map/mapOSM.js").then(module => {
    module.drawOSM(width, height, d3.zoomIdentity);
  });

  // 4. Initialiser le zoom AVANT de dessiner les marqueurs
  initMapZoom(width, height);

  // 5. Dessiner les donuts sur la couche gMarkers
  renderMapMarkers(gMarkers, projection);

  // 6. Initialiser l'arbre
  initTree();
  initTreeZoom();
}

init();
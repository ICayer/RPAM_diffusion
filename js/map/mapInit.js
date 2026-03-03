// /map/mapInit.js
import { dataStore } from "../data/dataStore.js";

export let svgMap;
export let gBasemap, gRoot, gMap, gMarkers;
export let projection;

export function initMap() {
  const container = document.getElementById("map-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  svgMap = d3.select("#map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  gBasemap = svgMap.append("g").attr("class", "basemap");
  gRoot = svgMap.append("g").attr("class", "root-layer");
  gMap = gRoot.append("g").attr("class", "mrc-layer");
  gMarkers = gRoot.append("g").attr("class", "markers-layer");

  // 1. Initialiser la projection
  projection = d3.geoMercator();

  // 2. 🔥 Utiliser les données GEO (les 417 valides)
  const geoData = dataStore.organisationsGeo;

  if (geoData && geoData.length > 0) {
    const features = {
      type: "FeatureCollection",
      features: geoData.map(d => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [+d.lon, +d.lat] // On s'assure que ce sont des nombres
        }
      }))
    };

    // 3. Ajuster la vue sur ces données
    projection.fitSize([width, height], features);
    console.log("Projection ajustée avec succès sur", geoData.length, "points.");
  } else {
    console.error("Impossible d'ajuster la projection : dataStore.organisationsGeo est vide !");
  }

  return { width, height };
}
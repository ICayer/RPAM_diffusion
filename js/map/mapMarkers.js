import { dataStore } from "../data/dataStore.js";
import { etapeColors } from "../utils/colors.js";
import { showTooltip, moveTooltip, hideTooltip } from "../ui/tooltip.js";
import { dispatcher } from "../dispatcher.js";
import { state } from "../state.js";

const MIN_RADIUS = 6;
const MAX_RADIUS = 30;

export function renderMapMarkers(gMarkers, projection) {
  gMarkers.selectAll(".city-group").remove();

  const pie = d3.pie().value(d => d.value).sort(null);
  const arc = d3.arc();

  const maxTotal = d3.max(dataStore.villesStats, d => d.counts.Total) || 1;
  const radiusScale = d3.scaleSqrt()
    .domain([0, maxTotal])
    .range([MIN_RADIUS, MAX_RADIUS]);

  const cityGroups = gMarkers.selectAll(".city-group")
    .data(dataStore.villesStats, d => d.ville)
    .join("g")
    .attr("class", "city-group")
    .attr("transform", d => {
      const coords = projection([d.lon, d.lat]);
      const k = state.mapTransform ? state.mapTransform.k : 1;
      return coords ? `translate(${coords[0]}, ${coords[1]}) scale(${1/k})` : null;
    });

  cityGroups.each(function(d) {
    const g = d3.select(this);
    const radius = radiusScale(d.counts.Total);
    const isSelected = state.selectedCity === d.ville;
    
    // On prépare les données des segments pour le donut et pour le tooltip
    const segments = [
      { etape: "1-Prélèvement", value: d.counts["1-Prélèvement"] },
      { etape: "2-Transformation", value: d.counts["2-Transformation"] },
      { etape: "3-Distribution", value: d.counts["3-Distribution"] }
    ].filter(s => s.value > 0);

    // Dessin des segments du donut
    g.selectAll("path")
      .data(pie(segments))
      .join("path")
      .attr("d", arc.innerRadius(radius * 0.45).outerRadius(radius))
      .attr("fill", p => etapeColors[p.data.etape])
      .attr("stroke", isSelected ? "#000" : "#fff")
      .attr("stroke-width", isSelected ? 2 : 0.8);

    // Zone d'interaction invisible
    g.append("circle")
      .attr("r", radius + 2)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseover", (event) => {
        // Construction du contenu HTML avec la répartition par couleur
        const html = `
          <div class="tooltip-title">${d.ville} ${isSelected ? " (Actif)" : ""}</div>
          <div class="tooltip-row"><strong>Total:</strong> ${d.counts.Total} organisations</div>
          <div style="margin-top:8px; border-top:1px solid #ddd; padding-top:6px;">
            ${segments.map(s => `
              <div style="font-size:11px; display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                <span style="width:10px; height:10px; border-radius:50%; background:${etapeColors[s.etape]}; border:1px solid rgba(0,0,0,0.1)"></span>
                <span style="flex:1">${s.etape.split('-')[1]}</span>
                <b>${s.value}</b>
              </div>
            `).join('')}
          </div>
          <div style="font-size:10px; color:#666; margin-top:8px; font-style:italic; border-top:1px dashed #eee; padding-top:4px;">
            ${isSelected ? "Cliquez pour réinitialiser" : "Cliquez pour filtrer l'arbre"}
          </div>
        `;
        showTooltip(event, html);
      })
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip)
      .on("click", (event, d) => {
        dispatcher.call("cityClick", null, d.ville);
      });
  });
}
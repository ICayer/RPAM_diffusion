import { gLinks, gNodes, svgTree } from "./treeInit.js";
import { dataStore } from "../data/dataStore.js";
import { state } from "../state.js";
import { dispatcher } from "../dispatcher.js";
import { etapeColors } from "../utils/colors.js";
import { showTooltip, moveTooltip, hideTooltip } from "../ui/tooltip.js";

export function renderTree() {
  const container = document.getElementById("tree-container");
  const width = container.clientWidth;
  const viewHeight = container.clientHeight;

  let root = dataStore.hierarchy;

  // 1. MARQUAGE DE VISIBILITÉ
  root.each(node => {
    if (node.depth === 3) {
      node.visible = state.selectedCity ? (node.data.data.ville === state.selectedCity) : true;
    }
  });

  root.eachAfter(node => {
    if (node.depth < 3) {
      node.visible = node.children && node.children.some(c => c.visible);
    }
  });

  // 2. CONFIGURATION DES ESPACEMENTS
  const ROW_HEIGHT = 22;
  const TEXT_OFFSET = 12;
  const DEPTH_X_OFFSET = 150; // Distance horizontale (profondeur)
  const MARGIN_TOP = 40;      // Marge de sécurité en haut du SVG
  const MARGIN_LEFT = 40;     // Marge de sécurité à gauche du SVG

  let nodesToRender = [];
  let linksToRender = [];
  let globalYCounter = 0;

  if (state.selectedCity) {
    // --- MODE FILTRÉ (VILLES) ---
    root.children.forEach(etape => {
      if (!etape.visible) return;
      
      etape.children.forEach(activite => {
        if (!activite.visible) return;

        activite.x = globalYCounter * ROW_HEIGHT;
        activite.y = DEPTH_X_OFFSET;
        nodesToRender.push(activite);

        const orgs = activite.children.filter(c => c.visible);
        orgs.forEach(org => {
          globalYCounter++;
          org.x = globalYCounter * ROW_HEIGHT;
          org.y = DEPTH_X_OFFSET * 2.2;
          nodesToRender.push(org);
          linksToRender.push({ source: activite, target: org });
        });
        
        linksToRender.push({ source: etape, target: activite });
        globalYCounter += 1.5; 
      });

      const etapeNodes = etape.children.filter(a => a.visible);
      if (etapeNodes.length > 0) {
        etape.x = (etapeNodes[0].x + etapeNodes[etapeNodes.length - 1].x) / 2;
        etape.y = 0;
        nodesToRender.push(etape);
      }
    });
  } else {
    // --- MODE NORMAL (VUE GLOBALE OU FOCUS) ---
    const activeKey = Array.from(state.expandedActivities)[0];
    if (activeKey) {
        // Vue Focus
        const [eName, aName] = activeKey.split('|');
        const target = root.descendants().find(d => d.depth === 2 && d.data.name === aName && d.parent.data.name === eName);
        if (target) {
            target.x = 0; target.y = 0;
            target.children.forEach((c, i) => { 
                c.x = i * ROW_HEIGHT; 
                c.y = DEPTH_X_OFFSET * 1.5; 
            });
            nodesToRender = [target, ...target.children];
            linksToRender = target.links();
            globalYCounter = target.children.length;
        }
    } else {
        // Vue Globale
        root.children.forEach(etape => {
            const startY = globalYCounter;
            etape.children.forEach(activite => {
                activite.x = globalYCounter * ROW_HEIGHT;
                activite.y = DEPTH_X_OFFSET;
                globalYCounter++;
            });
            etape.x = ((startY + globalYCounter - 1) * ROW_HEIGHT) / 2;
            etape.y = 0;
        });
        nodesToRender = root.descendants().filter(d => d.depth > 0 && d.depth <= 2);
        linksToRender = root.links().filter(d => d.source.depth >= 1 && d.target.depth <= 2);
    }
  }

  // 3. RENDU SVG AVEC MARGES
  const dynamicHeight = Math.max(viewHeight, (globalYCounter * ROW_HEIGHT) + MARGIN_TOP + 100);
  svgTree.attr("height", dynamicHeight).attr("width", width);
  
  // On décale tout le groupe principal pour créer les marges
  const mainGroup = d3.select(gNodes.node().parentNode);
  mainGroup.transition().duration(400)
           .attr("transform", `translate(${MARGIN_LEFT}, ${MARGIN_TOP})`);

  // Update des liens
  gLinks.selectAll("path")
    .data(linksToRender, d => `${d.source.data.name}-${d.target.data.id || d.target.data.name}`)
    .join("path")
    .transition().duration(400)
    .attr("fill", "none")
    .attr("stroke", "#eee")
    .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

  // Update des nœuds
  const node = gNodes.selectAll("g.node")
    .data(nodesToRender, d => d.data.id || d.data.name)
    .join(enter => {
      const g = enter.append("g").attr("class", "node");
      g.append("circle").attr("class", "main-circle");
      g.append("text");
      return g;
    });

  node.transition().duration(400).attr("transform", d => `translate(${d.y},${d.x})`);

  node.select("circle.main-circle")
    .attr("r", d => d.depth === 3 ? 3.5 : 6)
    .attr("fill", d => {
        if (d.depth === 1) return etapeColors[d.data.name];
        if (d.depth === 2) return etapeColors[d.parent.data.name];
        return etapeColors[d.parent.parent.data.name];
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  node.select("text")
    .attr("dx", TEXT_OFFSET) 
    .attr("dy", 4)
    .text(d => d.data.name)
    .style("font-size", d => d.depth === 3 ? "11px" : "12px")
    .style("font-weight", d => d.depth < 3 ? "700" : "400")
    .style("font-family", "sans-serif");

  // 4. BOUTON TOGGLE (Affiché uniquement si NON filtré par ville)
  const activityNodes = state.selectedCity ? [] : nodesToRender.filter(d => d.depth === 2);
  
  gNodes.selectAll("g.toggle-group")
    .data(activityNodes, d => `${d.parent.data.name}|${d.data.name}`)
    .join(
        enter => {
            const g = enter.append("g").attr("class", "toggle-group").style("cursor", "pointer");
            g.append("circle").attr("r", 7).attr("fill", "#fff").attr("stroke", "#ccc");
            g.append("text").attr("class", "toggle-icon").attr("text-anchor", "middle").attr("dy", 4).style("font-size", "10px");
            return g;
        },
        update => update,
        exit => exit.remove() // Important : on enlève les boutons si pas de données
    )
    .attr("transform", d => `translate(${d.y - 25}, ${d.x})`)
    .on("click", (event, d) => {
        const key = `${d.parent.data.name}|${d.data.name}`;
        state.expandedActivities.has(key) ? state.expandedActivities.clear() : (state.expandedActivities.clear(), state.expandedActivities.add(key));
        renderTree();
    })
    .select("text.toggle-icon")
    .text(d => state.expandedActivities.has(`${d.parent.data.name}|${d.data.name}`) ? "−" : "+");

  // Tooltips
  node.on("mouseover", (event, d) => {
      let content = (d.depth === 3) ? 
        `<div class="tooltip-title">${d.data.data.organisation}</div><div class="tooltip-row">${d.data.data.ville}</div>` : 
        `<div class="tooltip-title">${d.data.name}</div>`;
      showTooltip(event, content);
  })
  .on("mousemove", moveTooltip)
  .on("mouseout", hideTooltip);
}

dispatcher.on("cityClick.tree", (cityName) => {
  state.selectedCity = (state.selectedCity === cityName) ? null : cityName;
  state.expandedActivities.clear(); 
  renderTree();
  // On remonte le scroll au clic pour voir le haut de la liste
  document.getElementById("tree-container").scrollTo({ top: 0, behavior: 'smooth' });
});
// ui/tooltip.js

let tooltip;

export function initTooltip() {
    // On crée la div si elle n'existe pas
    tooltip = d3.select("body").selectAll(".custom-tooltip")
        .data([null])
        .join("div")
        .attr("class", "custom-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("pointer-events", "none")
        .style("z-index", "9999");
}

export function showTooltip(event, content) {
    if (!tooltip) initTooltip();
    
    tooltip
        .html(content)
        .style("visibility", "visible");
    
    moveTooltip(event);
}

export function moveTooltip(event) {
    if (!tooltip) return;
    tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 15) + "px");
}

export function hideTooltip() {
    if (tooltip) tooltip.style("visibility", "hidden");
}
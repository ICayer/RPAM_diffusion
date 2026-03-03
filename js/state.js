export const state = {

  hoveredOrgId: null,

  expandedActivities: new Set(),
  selectedCity: null, // <-- Ajoute ceci pour stocker la ville filtrée
  mapTransform: d3.zoomIdentity,
  treeTransform: d3.zoomIdentity

};
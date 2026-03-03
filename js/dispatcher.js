export const dispatcher = d3.dispatch(
  "orgHover",
  "orgOut",
  "orgClick",
  "activityToggle",
  "centerMapOnOrg",
  "cityClick" // <-- Nouveau : Pour filtrer l'arbre par ville
);
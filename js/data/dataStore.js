export const dataStore = {

  // =========================
  // DONNÉES BRUTES
  // =========================
  villes: [],       
  villesStats: [],         // coordonnees_ville.csv
  organisations: [],         // organisation_caracteristique.csv
  organisationsAll: [], // Ajoute ceci
  organisationsGeo: [], // Ajoute ceci
  organisationsSansCoordonnees: [], // Optionnel, pour le debug
  // =========================
  // DONNÉES NORMALISÉES
  // =========================
  organisationsByVille: new Map(),   // ville -> [organisations]
  organisationById: new Map(),       // id -> organisation
  hierarchy: null,                   // hiérarchie pour le tree

};
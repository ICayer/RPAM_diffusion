import { dataStore } from "./dataStore.js";

export async function loadAllData() {
  // 1. Chargement des fichiers CSV
  const [villesCSV, organisationsCSV] = await Promise.all([
    d3.csv("data/coordonnees_villecomplet.csv"),
    d3.csv("data/BD_Prototype_RPAM_min.csv")
  ]);

  // ==========================================
  // 2. NORMALISATION DES VILLES
  // ==========================================
  dataStore.villes = villesCSV.map(d => ({
    ville: d.ville ? d.ville.trim() : "Inconnue",
    lon: +d.lon,
    lat: +d.lat
  }));

  const villeIndex = new Map(
    dataStore.villes.map(d => [d.ville, d])
  );

  // ==========================================
  // 3. NORMALISATION DES ORGANISATIONS
  // ==========================================
  const organisationsTemp = organisationsCSV.map(d => {
    // Gestion de la casse et des espaces pour la ville
    const villeNom = (d.ville || d.Ville || "").trim();
    const villeData = villeNom ? villeIndex.get(villeNom) : null;

    // L'objet organisation normalisé
    const o = {
      id: d.id,
      etape: d.etape,           // ex: "1-Prélèvement"
      activite: d.activite,     // ex: "Représentation"
      organisation: d.organisation || "Inconnu",
      ville: villeNom,
      lat: villeData ? villeData.lat : null,
      lon: villeData ? villeData.lon : null
    };
    return o;
  });

  dataStore.organisationsAll = organisationsTemp;
  dataStore.organisationsGeo = organisationsTemp.filter(d => d.lat && d.lon);
  dataStore.organisationsSansCoordonnees = organisationsTemp.filter(d => !d.lat || !d.lon);

  // Indexation par ID pour les interactions rapides
  dataStore.organisationById.clear();
  dataStore.organisationsAll.forEach(org => {
    dataStore.organisationById.set(org.id, org);
  });

  // Groupement par ville pour la carte
  dataStore.organisationsByVille = d3.group(
    dataStore.organisationsGeo,
    d => d.ville
  );

  // ==========================================
  // 4. CONSTRUCTION DES STATS PAR VILLE (NOUVEAU)
  // Indispensable pour les Donut Charts sur la Map
  // ==========================================
  dataStore.villesStats = [];

  dataStore.organisationsByVille.forEach((orgs, villeNom) => {
    // On récupère les coordonnées depuis la première organisation de la liste
    const first = orgs[0];

    // Initialisation des compteurs par grande étape
    const counts = {
      "1-Prélèvement": 0,
      "2-Transformation": 0,
      "3-Distribution": 0,
      "Total": orgs.length
    };

    // On incrémente selon l'étape de chaque organisation
    orgs.forEach(o => {
      if (counts[o.etape] !== undefined) {
        counts[o.etape]++;
      }
    });

    dataStore.villesStats.push({
      ville: villeNom,
      lat: first.lat,
      lon: first.lon,
      counts: counts,
      organisations: orgs // Gardé en mémoire pour le clic/zoom
    });
  });

  // ==========================================
  // 5. CONSTRUCTION DE LA HIÉRARCHIE (TREE)
  // ==========================================
  const nested = d3.rollup(
    dataStore.organisationsAll,
    v => v,
    d => d.etape,
    d => d.activite
  );

  const root = {
    name: "root",
    children: []
  };

  nested.forEach((activites, etape) => {
    const etapeNode = {
      name: etape,
      children: []
    };

    activites.forEach((orgs, activite) => {
      const activiteNode = {
        name: activite,
        children: []
      };

      orgs.forEach(o => {
        // On stocke l'objet complet dans 'data' pour le tooltip
        activiteNode.children.push({ 
            name: o.organisation, 
            id: o.id, 
            data: o 
        });
      });

      etapeNode.children.push(activiteNode);
    });

    root.children.push(etapeNode);
  });

  dataStore.hierarchy = d3.hierarchy(root);

  // Debug console
  console.log("Données chargées :", dataStore.organisationsAll.length);
  console.log("Villes agrégées pour la carte :", dataStore.villesStats.length);
}
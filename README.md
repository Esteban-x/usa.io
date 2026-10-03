# USA.io

Explorez les 50 États des États-Unis (et le district de Columbia) depuis un globe 3D interactif.

- **Globe 3D** (Three.js / React Three Fiber) centré sur les États-Unis : chaque État est une tuile extrudée sur la sphère. Au survol, la tuile se soulève et **révèle son drapeau**, avec une carte d'infos et la température en direct. Un clic zoome sur l'État et ouvre sa fiche.
- **Fiche de chaque État** : chiffres clés (population 2020/2024, superficie, densité, PIB, revenu médian, entrée dans l'Union, point culminant, vote 2024…), météo en direct et prévisions à 7 jours, heure locale par fuseau, histoire, géographie, économie, symboles officiels, plus grandes villes, faits étonnants, lieux incontournables (photos Wikipédia et liens Street View), États voisins.
- **Annuaire** des États avec recherche, filtre par région et tri.
- **Street View** : 153 lieux emblématiques à explorer, avec une « destination surprise ».
- **Recherche rapide** partout avec `Ctrl K` ou `/`.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run geo` | Régénère la géométrie du globe (`public/data/*.json`) et les voisins (`app/data/generated/neighbors.ts`) depuis `us-atlas` et `world-atlas`. Ajouter `SKIP_DOTS=1` pour sauter le calcul (lent) des points des continents. |
| `npm run check:data` | Vérifie la cohérence des fiches (slugs, nombre de villes et de lieux, fuseaux, total de 538 grands électeurs…). |

## Structure

```
app/
  page.tsx                 Accueil (globe)
  etats/page.tsx           Annuaire des États
  etats/[slug]/page.tsx    Fiche d'un État (pages statiques)
  street-view/page.tsx     Lieux emblématiques
  components/globe/        Scène 3D, géométrie des tuiles, textures des drapeaux
  data/states/             Données des 51 fiches (types dans data/types.ts)
public/
  flags/                   Drapeaux (SVG et WebP)
  data/                    Géométrie des États et points des continents
```

## Sources

- Frontières : [us-atlas](https://github.com/topojson/us-atlas) et [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth / US Census Bureau)
- Drapeaux : [Flagpedia / flagcdn](https://flagpedia.net)
- Météo : [Open-Meteo](https://open-meteo.com) (en direct, sans clé)
- Résumés et photos : API REST de [Wikipédia](https://www.wikipedia.org) (mis en cache 24 h)
- Chiffres : US Census Bureau (recensement 2020, estimations 2024, ACS 2023), BEA (PIB 2023)

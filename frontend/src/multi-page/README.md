# Multi-page

Dossier des différentes pages de l'application ESI Online.

## Structure

- **HomePage.jsx** — Page d'accueil
- **index.jsx** — Export central (à mettre à jour à chaque nouvelle page)

## Ajouter une page

1. Créer un fichier `MaPage.jsx` dans ce dossier.
2. L'ajouter dans `index.jsx` : `export { default as MaPage } from './MaPage'`
3. Ajouter la route dans `App.jsx` : `<Route path="/ma-route" element={<MaPage />} />`

## Pages à venir (exemples)

- LoginPage
- DashboardPage (admin / prof / élève)
- CataloguePage
- etc.

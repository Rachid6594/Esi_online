import { createServer, Model, Factory, Response } from 'miragejs'

const MOCK_COURSES = [
  { id: '1', code: 'INF301', intitule: 'Algorithmique et structures de données', professeur: 'Dr. K. Bensaid', credits: 4, couleur: 'orange', filiere: 'GL', niveau: 'L3', horaire: 'Lun 08h–10h, Mer 10h–12h', salle: 'Amphi A', type: 'Cours+TD' },
  { id: '2', code: 'INF302', intitule: 'Bases de données avancées', professeur: 'Dr. A. Zerrouki', credits: 4, couleur: 'blue', filiere: 'GL', niveau: 'L3', horaire: 'Mar 08h–10h, Jeu 14h–16h', salle: 'Salle 203', type: 'Cours+TP' },
  { id: '3', code: 'INF303', intitule: 'Réseaux informatiques', professeur: 'M. S. Hadj', credits: 3, couleur: 'green', filiere: 'RT', niveau: 'L3', horaire: 'Lun 10h–12h', salle: 'Amphi B', type: 'Cours' },
  { id: '4', code: 'INF304', intitule: 'Génie logiciel', professeur: 'Dr. N. Messaoudi', credits: 4, couleur: 'purple', filiere: 'GL', niveau: 'L3', horaire: 'Mer 08h–10h, Ven 10h–12h', salle: 'Salle 105', type: 'Cours+TD' },
  { id: '5', code: 'MAT301', intitule: 'Mathématiques discrètes', professeur: 'Dr. O. Belhocine', credits: 3, couleur: 'red', filiere: 'GL', niveau: 'L3', horaire: 'Jeu 08h–10h', salle: 'Amphi C', type: 'Cours' },
  { id: '6', code: 'ANG301', intitule: 'Anglais technique', professeur: 'Mme. L. Brahimi', credits: 2, couleur: 'slate', filiere: 'GL', niveau: 'L3', horaire: 'Ven 08h–10h', salle: 'Salle 301', type: 'TD' },
]

/* Contenu détaillé des cours (chapitres + sections) pour le lecteur en ligne */
const MOCK_COURSE_CONTENT = {
  '1': {
    description: "Ce cours couvre les fondamentaux de l'algorithmique : complexité, structures de données (listes, piles, files, arbres, graphes), et les principaux algorithmes de tri et de recherche.",
    objectifs: [
      'Maîtriser la notion de complexité algorithmique (O, Ω, Θ)',
      'Implémenter les structures de données fondamentales',
      'Concevoir des algorithmes efficaces de tri et recherche',
      'Résoudre des problèmes classiques avec des graphes',
    ],
    chapitres: [
      {
        id: 'ch1',
        titre: 'Introduction et complexité',
        sections: [
          { id: 'ch1-s1', titre: 'Qu\'est-ce qu\'un algorithme ?', contenu: 'Un algorithme est une suite finie et non ambiguë d\'instructions permettant de résoudre un problème ou d\'obtenir un résultat. Le mot vient du nom du mathématicien perse Al-Khwârizmî (IXe siècle).\n\nUn bon algorithme doit être :\n• **Correct** : il produit le résultat attendu pour toute entrée valide.\n• **Terminant** : il se termine en un nombre fini d\'étapes.\n• **Efficace** : il utilise les ressources (temps, mémoire) de façon raisonnable.\n\nExemple simple — recherche du maximum dans un tableau :\n```\nfonction maximum(T, n)\n  max ← T[0]\n  pour i de 1 à n-1 faire\n    si T[i] > max alors\n      max ← T[i]\n  retourner max\n```' },
          { id: 'ch1-s2', titre: 'Notation asymptotique (O, Ω, Θ)', contenu: 'La notation asymptotique permet de décrire le comportement d\'un algorithme lorsque la taille de l\'entrée croît vers l\'infini.\n\n**Grand-O (O)** — borne supérieure :\nf(n) = O(g(n)) signifie qu\'il existe c > 0 et n₀ tels que f(n) ≤ c·g(n) pour tout n ≥ n₀.\n\n**Grand-Omega (Ω)** — borne inférieure :\nf(n) = Ω(g(n)) signifie qu\'il existe c > 0 et n₀ tels que f(n) ≥ c·g(n) pour tout n ≥ n₀.\n\n**Grand-Theta (Θ)** — borne exacte :\nf(n) = Θ(g(n)) si et seulement si f(n) = O(g(n)) et f(n) = Ω(g(n)).\n\nOrdre de croissance courant :\nO(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)' },
          { id: 'ch1-s3', titre: 'Analyse de la complexité', contenu: 'L\'analyse de la complexité consiste à estimer les ressources nécessaires à l\'exécution d\'un algorithme en fonction de la taille de l\'entrée n.\n\n**Complexité temporelle** — nombre d\'opérations élémentaires.\n**Complexité spatiale** — quantité de mémoire supplémentaire utilisée.\n\nOn distingue :\n• **Meilleur cas** : entrée la plus favorable.\n• **Pire cas** : entrée la plus défavorable (la plus utilisée en pratique).\n• **Cas moyen** : moyenne sur toutes les entrées possibles.\n\nExemple : recherche séquentielle dans un tableau de n éléments :\n- Meilleur cas : O(1) — l\'élément est en première position.\n- Pire cas : O(n) — l\'élément est absent ou en dernière position.\n- Cas moyen : O(n/2) = O(n).' },
        ],
      },
      {
        id: 'ch2',
        titre: 'Structures de données linéaires',
        sections: [
          { id: 'ch2-s1', titre: 'Tableaux et listes chaînées', contenu: 'Le **tableau** (array) est la structure la plus simple : une zone contiguë de mémoire indexée.\n\nAccès par index : O(1)\nInsertion/suppression en fin : O(1) amorti (tableau dynamique)\nInsertion/suppression au milieu : O(n)\n\nLa **liste chaînée** est une séquence de nœuds, chacun contenant une valeur et un pointeur vers le suivant.\n\nAccès par index : O(n)\nInsertion/suppression en tête : O(1)\nInsertion/suppression au milieu (si position connue) : O(1)\n\nVariantes :\n• Liste simplement chaînée\n• Liste doublement chaînée (pointeur précédent + suivant)\n• Liste circulaire' },
          { id: 'ch2-s2', titre: 'Piles (LIFO)', contenu: 'Une **pile** (stack) est une structure de données LIFO (Last In, First Out).\n\nOpérations principales :\n• `empiler(x)` — ajoute x au sommet : O(1)\n• `dépiler()` — retire et retourne le sommet : O(1)\n• `sommet()` — retourne le sommet sans le retirer : O(1)\n• `est_vide()` — teste si la pile est vide : O(1)\n\nApplications classiques :\n• Évaluation d\'expressions postfixées\n• Vérification du parenthésage\n• Parcours en profondeur (DFS)\n• Appels de fonctions (pile d\'exécution)' },
          { id: 'ch2-s3', titre: 'Files (FIFO)', contenu: 'Une **file** (queue) est une structure FIFO (First In, First Out).\n\nOpérations principales :\n• `enfiler(x)` — ajoute x en queue : O(1)\n• `défiler()` — retire et retourne l\'élément en tête : O(1)\n• `tête()` — retourne la tête sans la retirer : O(1)\n\nImplémentations :\n• Tableau circulaire\n• Liste chaînée avec pointeurs tête et queue\n\nVariantes :\n• File de priorité (priority queue) — souvent implémentée avec un tas (heap)\n• Deque (double-ended queue) — insertion/suppression aux deux extrémités' },
        ],
      },
      {
        id: 'ch3',
        titre: 'Algorithmes de tri',
        sections: [
          { id: 'ch3-s1', titre: 'Tri par insertion et tri par sélection', contenu: '**Tri par insertion** :\nPrincipe : on insère chaque élément à sa place dans la partie déjà triée.\n\nComplexité : O(n²) en pire cas, O(n) en meilleur cas (tableau déjà trié).\nStable : oui. En place : oui.\n\n```\npour i de 1 à n-1 faire\n  clé ← T[i]\n  j ← i - 1\n  tant que j ≥ 0 et T[j] > clé faire\n    T[j+1] ← T[j]\n    j ← j - 1\n  T[j+1] ← clé\n```\n\n**Tri par sélection** :\nPrincipe : on sélectionne le minimum et on le place en position correcte.\n\nComplexité : toujours O(n²). Stable : non. En place : oui.' },
          { id: 'ch3-s2', titre: 'Tri rapide (Quicksort)', contenu: '**Quicksort** est un algorithme de tri par division (divide and conquer).\n\nPrincipe :\n1. Choisir un pivot\n2. Partitionner : éléments ≤ pivot à gauche, > pivot à droite\n3. Récursivement trier les deux sous-tableaux\n\nComplexité :\n• Pire cas : O(n²) — pivot toujours min ou max\n• Cas moyen : O(n log n)\n• Meilleur cas : O(n log n)\n\nEn place : oui (avec partition de Lomuto ou Hoare).\nStable : non en version classique.\n\nQuicksort est souvent le tri le plus rapide en pratique grâce à sa bonne localité de cache.' },
          { id: 'ch3-s3', titre: 'Tri fusion (Mergesort)', contenu: '**Mergesort** est un algorithme de tri stable basé sur la fusion de sous-tableaux triés.\n\nPrincipe :\n1. Diviser le tableau en deux moitiés\n2. Trier récursivement chaque moitié\n3. Fusionner les deux moitiés triées\n\nComplexité : toujours O(n log n).\nStable : oui.\nEn place : non (nécessite O(n) mémoire supplémentaire).\n\nLa fusion de deux tableaux triés de taille n/2 se fait en O(n) avec deux index parcourant les sous-tableaux.' },
        ],
      },
    ],
  },
  '2': {
    description: 'Ce cours approfondit les concepts de bases de données relationnelles : modélisation, algèbre relationnelle, SQL avancé, indexation, transactions et optimisation de requêtes.',
    objectifs: [
      'Modéliser un système d\'information avec le modèle E/A',
      'Maîtriser SQL (DDL, DML, requêtes imbriquées, jointures)',
      'Comprendre les mécanismes d\'indexation et d\'optimisation',
      'Gérer les transactions et la concurrence d\'accès',
    ],
    chapitres: [
      {
        id: 'ch1',
        titre: 'Modélisation et algèbre relationnelle',
        sections: [
          { id: 'ch1-s1', titre: 'Le modèle Entité/Association', contenu: 'Le modèle E/A est un formalisme graphique pour concevoir une base de données.\n\nConcepts clés :\n• **Entité** : objet du monde réel (Étudiant, Cours, Professeur)\n• **Association** : lien entre entités (s\'inscrire, enseigner)\n• **Attribut** : propriété d\'une entité ou d\'une association\n• **Identifiant** : attribut(s) identifiant de façon unique une occurrence\n\nCardinalités :\n• 1:1 — un à un\n• 1:N — un à plusieurs\n• M:N — plusieurs à plusieurs\n\nLe passage au modèle relationnel transforme :\n• Chaque entité → une table\n• Chaque association M:N → une table de jointure\n• Les associations 1:N → une clé étrangère' },
          { id: 'ch1-s2', titre: 'Algèbre relationnelle', contenu: 'L\'algèbre relationnelle est le fondement théorique de SQL.\n\nOpérations de base :\n• **Sélection (σ)** : filtre les tuples selon une condition\n• **Projection (π)** : sélectionne certaines colonnes\n• **Produit cartésien (×)** : combine toutes les paires de tuples\n• **Union (∪)** : réunit deux relations de même schéma\n• **Différence (−)** : tuples dans R mais pas dans S\n• **Renommage (ρ)** : renomme attributs ou relation\n\nOpérations dérivées :\n• **Jointure (⋈)** : combinaison de produit cartésien et sélection\n• **Division (÷)** : tuples de R associés à tous les tuples de S\n• **Intersection (∩)** : tuples communs à R et S' },
        ],
      },
      {
        id: 'ch2',
        titre: 'SQL avancé',
        sections: [
          { id: 'ch2-s1', titre: 'Jointures et sous-requêtes', contenu: 'SQL propose plusieurs types de jointures :\n\n• `INNER JOIN` — tuples ayant une correspondance dans les deux tables\n• `LEFT JOIN` — tous les tuples de gauche + correspondances à droite\n• `RIGHT JOIN` — inverse de LEFT JOIN\n• `FULL OUTER JOIN` — union des LEFT et RIGHT JOIN\n• `CROSS JOIN` — produit cartésien\n\nSous-requêtes :\n```sql\nSELECT nom FROM Etudiant\nWHERE id IN (\n  SELECT etudiant_id FROM Inscription\n  WHERE cours_id = 42\n);\n```\n\nSous-requêtes corrélées :\n```sql\nSELECT e.nom FROM Etudiant e\nWHERE EXISTS (\n  SELECT 1 FROM Inscription i\n  WHERE i.etudiant_id = e.id AND i.note > 15\n);\n```' },
          { id: 'ch2-s2', titre: 'Agrégats et fonctions de fenêtrage', contenu: 'Fonctions d\'agrégation : COUNT, SUM, AVG, MIN, MAX.\n\n```sql\nSELECT cours_id, AVG(note) as moyenne\nFROM Inscription\nGROUP BY cours_id\nHAVING AVG(note) > 12;\n```\n\nFonctions de fenêtrage (window functions) — SQL:2003 :\n```sql\nSELECT nom, note,\n  RANK() OVER (ORDER BY note DESC) as rang,\n  AVG(note) OVER (PARTITION BY cours_id) as moy_cours\nFROM Inscription\nJOIN Etudiant ON ...;\n```\n\nLes fonctions de fenêtrage permettent de calculer des valeurs sur un "fenêtre" de lignes sans regrouper les résultats.' },
        ],
      },
    ],
  },
  '3': {
    description: 'Ce cours introduit les principes fondamentaux des réseaux informatiques : modèle OSI, protocoles TCP/IP, adressage, routage et sécurité réseau.',
    objectifs: [
      'Comprendre le modèle en couches OSI et TCP/IP',
      'Configurer l\'adressage IP et le sous-réseautage',
      'Analyser le fonctionnement des protocoles de transport',
      'Connaître les bases de la sécurité réseau',
    ],
    chapitres: [
      {
        id: 'ch1',
        titre: 'Modèle OSI et TCP/IP',
        sections: [
          { id: 'ch1-s1', titre: 'Les 7 couches du modèle OSI', contenu: 'Le modèle OSI (Open Systems Interconnection) définit 7 couches :\n\n7. **Application** — interface avec l\'utilisateur (HTTP, FTP, SMTP)\n6. **Présentation** — formatage, chiffrement, compression\n5. **Session** — gestion des sessions de communication\n4. **Transport** — fiabilité bout-à-bout (TCP, UDP)\n3. **Réseau** — adressage logique et routage (IP)\n2. **Liaison** — adressage physique, contrôle d\'erreur (Ethernet, Wi-Fi)\n1. **Physique** — transmission de bits sur le support\n\nChaque couche fournit des services à la couche supérieure et utilise les services de la couche inférieure.' },
          { id: 'ch1-s2', titre: 'La pile TCP/IP', contenu: 'Le modèle TCP/IP est le modèle pratique utilisé sur Internet.\n\n4 couches :\n• **Application** — HTTP, DNS, DHCP, SSH, FTP\n• **Transport** — TCP (fiable) et UDP (non fiable)\n• **Internet** — IP, ICMP, ARP\n• **Accès réseau** — Ethernet, Wi-Fi\n\nCorrespondance avec OSI :\n- Application TCP/IP ≈ couches 5-6-7 OSI\n- Transport ≈ couche 4\n- Internet ≈ couche 3\n- Accès réseau ≈ couches 1-2' },
        ],
      },
    ],
  },
  '4': {
    description: 'Ce cours couvre les principes et pratiques du génie logiciel : cycle de vie, méthodes agiles, modélisation UML, qualité et tests logiciels.',
    objectifs: [
      'Appliquer les méthodes agiles (Scrum, Kanban)',
      'Modéliser avec UML (cas d\'utilisation, classes, séquences)',
      'Mettre en place une stratégie de tests logiciels',
      'Gérer le versionnement et l\'intégration continue',
    ],
    chapitres: [
      {
        id: 'ch1',
        titre: 'Méthodes agiles',
        sections: [
          { id: 'ch1-s1', titre: 'Principes du Manifeste Agile', contenu: 'Le Manifeste Agile (2001) repose sur 4 valeurs :\n\n1. **Les individus et interactions** plus que les processus et outils\n2. **Un logiciel fonctionnel** plus qu\'une documentation exhaustive\n3. **La collaboration avec le client** plus que la négociation contractuelle\n4. **L\'adaptation au changement** plus que le suivi d\'un plan\n\n12 principes sous-jacents incluent :\n• Livrer fréquemment un logiciel opérationnel\n• Accueillir favorablement les changements\n• Rythme soutenable de développement\n• L\'excellence technique et la qualité de la conception\n• La simplicité — maximiser le travail non fait' },
          { id: 'ch1-s2', titre: 'Scrum en pratique', contenu: 'Scrum est un framework agile itératif.\n\n**Rôles** :\n• Product Owner — gère le backlog, priorise les fonctionnalités\n• Scrum Master — facilitateur, supprime les obstacles\n• Équipe de développement — auto-organisée, pluridisciplinaire\n\n**Artéfacts** :\n• Product Backlog — liste ordonnée de tout ce qui est nécessaire\n• Sprint Backlog — items sélectionnés pour le sprint\n• Incrément — version potentiellement livrable\n\n**Cérémonies** :\n• Sprint Planning — planification du sprint (2-4 semaines)\n• Daily Standup — réunion quotidienne (15 min)\n• Sprint Review — démonstration de l\'incrément\n• Sprint Retrospective — amélioration continue' },
        ],
      },
      {
        id: 'ch2',
        titre: 'Modélisation UML',
        sections: [
          { id: 'ch2-s1', titre: 'Diagrammes structurels', contenu: 'Les diagrammes structurels décrivent l\'architecture statique du système.\n\n**Diagramme de classes** — le plus utilisé :\n• Classes avec attributs et méthodes\n• Relations : association, agrégation, composition, héritage\n• Multiplicités : 1, 0..1, *, 1..*\n\n**Diagramme de packages** :\n• Organisation logique des classes\n• Dépendances entre packages\n\n**Diagramme d\'objets** :\n• Instance concrète du diagramme de classes\n• Utile pour illustrer des exemples' },
          { id: 'ch2-s2', titre: 'Diagrammes comportementaux', contenu: 'Les diagrammes comportementaux décrivent la dynamique du système.\n\n**Diagramme de cas d\'utilisation** :\n• Acteurs et cas d\'utilisation\n• Relations : include, extend, généralisation\n• Vue fonctionnelle du système\n\n**Diagramme de séquence** :\n• Interactions entre objets dans le temps\n• Messages synchrones et asynchrones\n• Fragments (alt, loop, opt, par)\n\n**Diagramme d\'activité** :\n• Flux de travail (workflow)\n• Décisions, parallélisme\n• Similaire aux organigrammes' },
        ],
      },
    ],
  },
  '5': {
    description: 'Ce cours introduit les mathématiques discrètes : logique, ensembles, relations, fonctions, combinatoire et théorie des graphes.',
    objectifs: [
      'Maîtriser le calcul propositionnel et les prédicats',
      'Appliquer les techniques de dénombrement',
      'Résoudre des problèmes sur les graphes',
      'Comprendre les relations de récurrence',
    ],
    chapitres: [
      {
        id: 'ch1',
        titre: 'Logique et ensembles',
        sections: [
          { id: 'ch1-s1', titre: 'Calcul propositionnel', contenu: 'Une **proposition** est un énoncé qui est soit vrai, soit faux.\n\nConnecteurs logiques :\n• **Négation (¬)** : ¬P est vrai ssi P est faux\n• **Conjonction (∧)** : P ∧ Q est vrai ssi P et Q sont vrais\n• **Disjonction (∨)** : P ∨ Q est faux ssi P et Q sont faux\n• **Implication (→)** : P → Q est faux ssi P est vrai et Q est faux\n• **Équivalence (↔)** : P ↔ Q est vrai ssi P et Q ont la même valeur\n\nLois importantes :\n• De Morgan : ¬(P ∧ Q) ≡ ¬P ∨ ¬Q\n• Contraposée : (P → Q) ≡ (¬Q → ¬P)\n• Distributivité : P ∧ (Q ∨ R) ≡ (P ∧ Q) ∨ (P ∧ R)' },
        ],
      },
      {
        id: 'ch2',
        titre: 'Théorie des graphes',
        sections: [
          { id: 'ch2-s1', titre: 'Définitions et représentations', contenu: 'Un **graphe** G = (V, E) est défini par :\n• V : ensemble de sommets (vertices)\n• E : ensemble d\'arêtes (edges) reliant des paires de sommets\n\nTypes :\n• **Graphe non orienté** : arêtes sans direction\n• **Graphe orienté (digraphe)** : arcs avec direction\n• **Graphe pondéré** : arêtes avec un poids\n\nReprésentations :\n• **Matrice d\'adjacence** : M[i][j] = 1 si arête (i,j) existe\n  → O(V²) mémoire, accès O(1)\n• **Liste d\'adjacence** : pour chaque sommet, liste des voisins\n  → O(V + E) mémoire, parcours efficace' },
          { id: 'ch2-s2', titre: 'Parcours BFS et DFS', contenu: '**BFS (Breadth-First Search)** — Parcours en largeur :\n• Utilise une file (FIFO)\n• Explore niveau par niveau\n• Complexité : O(V + E)\n• Application : plus court chemin non pondéré\n\n```\nBFS(G, s)\n  file ← {s}, visité[s] ← vrai\n  tant que file non vide\n    u ← défiler(file)\n    pour chaque voisin v de u\n      si non visité[v]\n        visité[v] ← vrai\n        enfiler(file, v)\n```\n\n**DFS (Depth-First Search)** — Parcours en profondeur :\n• Utilise une pile (LIFO) ou la récursion\n• Explore en profondeur avant de revenir\n• Complexité : O(V + E)\n• Applications : composantes connexes, tri topologique, détection de cycles' },
        ],
      },
    ],
  },
  '6': {
    description: 'Ce cours développe les compétences en communication en anglais technique dans le domaine de l\'informatique.',
    objectifs: [
      'Lire et comprendre la documentation technique en anglais',
      'Rédiger des rapports techniques et des emails professionnels',
      'Présenter un projet informatique en anglais',
      'Maîtriser le vocabulaire spécifique de l\'informatique',
    ],
    chapitres: [
      {
        id: 'ch1',
        titre: 'Technical Writing',
        sections: [
          { id: 'ch1-s1', titre: 'Writing Technical Documentation', contenu: 'Good technical writing is clear, concise, and audience-aware.\n\n**Key principles:**\n• Use active voice: "The function returns a value" not "A value is returned by the function"\n• Be specific: "The algorithm runs in O(n log n)" not "The algorithm is fast"\n• Use consistent terminology throughout the document\n• Structure with headings, lists, and code examples\n\n**Common document types:**\n• API documentation\n• User guides and manuals\n• Technical specifications\n• README files\n• Code comments and docstrings' },
        ],
      },
    ],
  },
}

const MOCK_TIMETABLE = [
  { id: '1',  jour: 'Lundi',    heure_debut: '08:00', heure_fin: '10:00', matiere: 'Algorithmique',         type: 'Cours', salle: 'Amphi A',    professeur: 'Dr. Bensaid'   },
  { id: '2',  jour: 'Lundi',    heure_debut: '10:00', heure_fin: '12:00', matiere: 'Réseaux',               type: 'Cours', salle: 'Amphi B',    professeur: 'M. Hadj'       },
  { id: '3',  jour: 'Mardi',    heure_debut: '08:00', heure_fin: '10:00', matiere: 'Bases de données',      type: 'Cours', salle: 'Salle 203',  professeur: 'Dr. Zerrouki'  },
  { id: '4',  jour: 'Mardi',    heure_debut: '14:00', heure_fin: '16:00', matiere: 'Bases de données',      type: 'TP',    salle: 'Labo 1',     professeur: 'Dr. Zerrouki'  },
  { id: '5',  jour: 'Mercredi', heure_debut: '08:00', heure_fin: '10:00', matiere: 'Génie logiciel',        type: 'Cours', salle: 'Salle 105',  professeur: 'Dr. Messaoudi' },
  { id: '6',  jour: 'Mercredi', heure_debut: '10:00', heure_fin: '12:00', matiere: 'Algorithmique',         type: 'TD',    salle: 'Salle 201',  professeur: 'Dr. Bensaid'   },
  { id: '7',  jour: 'Jeudi',    heure_debut: '08:00', heure_fin: '10:00', matiere: 'Mathématiques discrètes', type: 'Cours', salle: 'Amphi C',  professeur: 'Dr. Belhocine' },
  { id: '8',  jour: 'Jeudi',    heure_debut: '14:00', heure_fin: '16:00', matiere: 'Bases de données',      type: 'TD',    salle: 'Salle 203',  professeur: 'Dr. Zerrouki'  },
  { id: '9',  jour: 'Vendredi', heure_debut: '08:00', heure_fin: '10:00', matiere: 'Anglais technique',     type: 'TD',    salle: 'Salle 301',  professeur: 'Mme. Brahimi'  },
  { id: '10', jour: 'Vendredi', heure_debut: '10:00', heure_fin: '12:00', matiere: 'Génie logiciel',        type: 'TD',    salle: 'Salle 105',  professeur: 'Dr. Messaoudi' },
]

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'info',    titre: 'Nouveau TP disponible',    message: 'Dr. Zerrouki a publié le TP2 de Bases de données avancées.',                             date: '2026-05-10', lu: false },
  { id: '2', type: 'warning', titre: 'Rappel : examen blanc',   message: "L'examen blanc d'Algorithmique se tient vendredi 16 mai à 09h00 en Amphi A.",            date: '2026-05-09', lu: false },
  { id: '3', type: 'info',    titre: 'Planning mis à jour',     message: "L'emploi du temps de la semaine 21 a été révisé. Vérifiez votre agenda.",                 date: '2026-05-08', lu: true  },
  { id: '4', type: 'success', titre: 'Inscription validée',     message: 'Votre inscription au module Anglais technique S5 est confirmée.',                         date: '2026-05-07', lu: true  },
  { id: '5', type: 'info',    titre: 'Cours annulé',            message: 'Le cours de Réseaux du lundi 13 mai est annulé. Récupération à définir.',                 date: '2026-05-06', lu: true  },
]

const MOCK_RESOURCES = [
  { id: '1',  titre: 'Cours – Algorithmique et structures de données (Chapitre 1)',  type: 'Cours',  matiere: 'Algorithmique',    professeur: 'Dr. Bensaid',   date: '2026-04-15', taille: '2.4 Mo', annee: '2025-2026' },
  { id: '2',  titre: 'TD1 – Exercices sur les listes chaînées',                      type: 'TD',     matiere: 'Algorithmique',    professeur: 'Dr. Bensaid',   date: '2026-04-22', taille: '890 Ko', annee: '2025-2026' },
  { id: '3',  titre: 'Cours – Bases de données relationnelles (complet)',             type: 'Cours',  matiere: 'Bases de données', professeur: 'Dr. Zerrouki',  date: '2026-04-18', taille: '5.1 Mo', annee: '2025-2026' },
  { id: '4',  titre: 'TP1 – Requêtes SQL avancées',                                  type: 'TP',     matiere: 'Bases de données', professeur: 'Dr. Zerrouki',  date: '2026-04-25', taille: '1.2 Mo', annee: '2025-2026' },
  { id: '5',  titre: 'Cours – Introduction aux réseaux (OSI & TCP/IP)',               type: 'Cours',  matiere: 'Réseaux',          professeur: 'M. Hadj',       date: '2026-04-20', taille: '3.7 Mo', annee: '2025-2026' },
  { id: '6',  titre: 'Cours – Génie logiciel : méthodes agiles et Scrum',            type: 'Cours',  matiere: 'Génie logiciel',   professeur: 'Dr. Messaoudi', date: '2026-04-17', taille: '4.2 Mo', annee: '2025-2026' },
  { id: '7',  titre: "TD2 – Diagrammes UML (cas d'utilisation & séquences)",         type: 'TD',     matiere: 'Génie logiciel',   professeur: 'Dr. Messaoudi', date: '2026-05-01', taille: '750 Ko', annee: '2025-2026' },
  { id: '8',  titre: 'Examen blanc – Algorithmique S5 (session 2025)',                type: 'Examen', matiere: 'Algorithmique',    professeur: 'Dr. Bensaid',   date: '2026-05-05', taille: '320 Ko', annee: '2025-2026' },
  { id: '9',  titre: 'Cours – Mathématiques discrètes : théorie des graphes',        type: 'Cours',  matiere: 'Mathématiques',    professeur: 'Dr. Belhocine', date: '2026-04-19', taille: '2.8 Mo', annee: '2025-2026' },
  { id: '10', titre: "TP2 – Implémentation d'un mini SGBD en Python",                type: 'TP',     matiere: 'Bases de données', professeur: 'Dr. Zerrouki',  date: '2026-05-08', taille: '1.5 Mo', annee: '2025-2026' },
  { id: '11', titre: 'Examen final – Bases de données S5',                            type: 'Examen', matiere: 'Bases de données', professeur: 'Dr. Zerrouki',  date: '2025-06-20', taille: '410 Ko', annee: '2024-2025' },
  { id: '12', titre: 'Cours – Programmation orientée objet (Java)',                    type: 'Cours',  matiere: 'POO',              professeur: 'Dr. Bensaid',   date: '2025-03-10', taille: '3.2 Mo', annee: '2024-2025' },
  { id: '13', titre: 'TP3 – Héritage et polymorphisme en Java',                       type: 'TP',     matiere: 'POO',              professeur: 'Dr. Bensaid',   date: '2025-04-02', taille: '980 Ko', annee: '2024-2025' },
  { id: '14', titre: 'TD3 – Modélisation relationnelle (exercices)',                   type: 'TD',     matiere: 'Bases de données', professeur: 'Dr. Zerrouki',  date: '2025-03-25', taille: '620 Ko', annee: '2024-2025' },
  { id: '15', titre: 'Examen rattrapage – Réseaux S4',                                type: 'Examen', matiere: 'Réseaux',          professeur: 'M. Hadj',       date: '2025-07-05', taille: '290 Ko', annee: '2024-2025' },
  { id: '16', titre: 'Cours – Systèmes d\'exploitation : processus et threads',       type: 'Cours',  matiere: 'Systèmes',         professeur: 'Dr. Khelifi',   date: '2024-11-12', taille: '4.5 Mo', annee: '2024-2025' },
  { id: '17', titre: 'TP4 – Shell scripting sous Linux',                               type: 'TP',     matiere: 'Systèmes',         professeur: 'Dr. Khelifi',   date: '2024-12-03', taille: '1.1 Mo', annee: '2024-2025' },
  { id: '18', titre: 'Examen – Mathématiques discrètes S3 (session 2024)',             type: 'Examen', matiere: 'Mathématiques',    professeur: 'Dr. Belhocine', date: '2024-06-15', taille: '350 Ko', annee: '2023-2024' },
  { id: '19', titre: 'Cours – Analyse numérique (complet)',                            type: 'Cours',  matiere: 'Mathématiques',    professeur: 'Dr. Belhocine', date: '2024-02-20', taille: '6.1 Mo', annee: '2023-2024' },
  { id: '20', titre: 'TD4 – Intégrales et séries de Fourier',                         type: 'TD',     matiere: 'Mathématiques',    professeur: 'Dr. Belhocine', date: '2024-03-18', taille: '540 Ko', annee: '2023-2024' },
]

export function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,
    models: {
      academicYear: Model,
      level: Model,
      filiere: Model,
      user: Model,
    },
    factories: {
      academicYear: Factory.extend({
        libelle(i) { return `202${i}-202${i + 1}` },
        date_debut() { return '2024-10-01' },
        date_fin() { return '2025-07-01' },
        is_active() { return false },
      }),
      level: Factory.extend({
        code(i) { return ['L1', 'L2', 'L3', 'M1', 'M2'][i % 5] },
        libelle(i) { return `Niveau ${i + 1}` },
        ordre(i) { return i + 1 },
      }),
      filiere: Factory.extend({
        code(i) { return ['GL', 'RT', 'GC', 'GE'][i % 4] },
        libelle(i) { return `Filière ${i + 1}` },
        description() { return '' },
      }),
    },
    seeds(server) {
      server.createList('academicYear', 3)
      server.createList('level', 5)
      server.createList('filiere', 4)
    },
    routes() {
      // ── Établissement ────────────────────────────────────────────────────────
      this.namespace = 'api/etablissement'
      this.get('/anneeacademiques/', (schema) => schema.academicYears.all().models)
      this.post('/anneeacademiques/', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        attrs.id = Math.random().toString(36).slice(2)
        return schema.academicYears.create(attrs)
      })
      this.put('/anneeacademiques/:id', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        return schema.academicYears.find(request.params.id).update(attrs)
      })
      this.delete('/anneeacademiques/:id', (schema, request) => {
        schema.academicYears.find(request.params.id).destroy()
        return new Response(204)
      })
      this.get('/niveaus/', (schema) => schema.levels.all().models)
      this.post('/niveaus/', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        attrs.id = Math.random().toString(36).slice(2)
        return schema.levels.create(attrs)
      })
      this.put('/niveaus/:id', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        return schema.levels.find(request.params.id).update(attrs)
      })
      this.delete('/niveaus/:id', (schema, request) => {
        schema.levels.find(request.params.id).destroy()
        return new Response(204)
      })
      this.get('/filieres/', (schema) => schema.filieres.all().models)
      this.post('/filieres/', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        attrs.id = Math.random().toString(36).slice(2)
        return schema.filieres.create(attrs)
      })
      this.put('/filieres/:id', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        return schema.filieres.find(request.params.id).update(attrs)
      })
      this.delete('/filieres/:id', (schema, request) => {
        schema.filieres.find(request.params.id).destroy()
        return new Response(204)
      })
      this.post('/users/import-csv', () => new Response(200, {}, { message: 'Import mock réussi' }))

      // ── Auth ─────────────────────────────────────────────────────────────────
      // Les routes Auth sont commentées pour permettre la connexion au vrai backend Django
      /*
      this.namespace = 'api/auth'
      this.post('/login/', (schema, request) => {
        const body = JSON.parse(request.requestBody)
        return {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
          user: {
            email: body.email || 'etudiant@esi.dz',
            first_name: 'Ahmed',
            last_name: 'Benali',
            role: null,
            niveau: 'L3',
            filiere: 'GL',
            matricule: '20231GL0042',
          },
        }
      })
      this.post('/token/refresh/', () => ({ access: 'mock-access-token-refreshed' }))
      */

      // ── Étudiant ─────────────────────────────────────────────────────────────
      this.namespace = 'api/student'
      this.get('/courses', () => MOCK_COURSES)
      this.get('/courses/:id', (schema, request) => {
        const course = MOCK_COURSES.find((c) => c.id === request.params.id)
        if (!course) return new Response(404)
        const content = MOCK_COURSE_CONTENT[request.params.id]
        return { ...course, ...(content || {}) }
      })
      this.get('/courses/:id/content', (schema, request) => {
        const content = MOCK_COURSE_CONTENT[request.params.id]
        return content ?? new Response(404)
      })
      this.get('/timetable', () => MOCK_TIMETABLE)

      // ── Ressources & Notifications ────────────────────────────────────────────
      this.namespace = 'api'
      this.get('/notifications', () => MOCK_NOTIFICATIONS)
      this.get('/resources', () => MOCK_RESOURCES)
      this.get('/resources/:id', (schema, request) =>
        MOCK_RESOURCES.find((r) => r.id === request.params.id) ?? new Response(404)
      )
      this.get('/resources/:id/download', (schema, request) => ({
        filename: `document-${request.params.id}.pdf`,
        url: null,
      }))

      // Laisser passer les routes non interceptées vers le réseau
      this.namespace = ''
      this.passthrough()
    },
  })
}

export type ItineraryIdea = {
  name: string;
  type: "Must-See" | "Explore" | "Dining" | "Activity";
  description: string;
  coordinates: [number, number];
};

export type Destination = {
  id: string;
  name: string;
  country: string;
  climate: "cold" | "temperate" | "warm";
  budget: number;
  interests: string[];
  coordinates: [number, number];
  itineraryIdeas?: ItineraryIdea[];
};

export const DESTINATIONS: Destination[] = [
  {
    id: "paris-fr",
    name: "Paris",
    country: "France",
    climate: "temperate",
    budget: 1800,
    interests: ["Culture", "Food", "Architecture"],
    coordinates: [48.8566, 2.3522],
    itineraryIdeas: [
      {
        name: "Eiffel Tower",
        type: "Must-See",
        description: "Iconic landmark with panoramic city views.",
        coordinates: [48.8584, 2.2945],
      },
      {
        name: "Louvre Museum",
        type: "Must-See",
        description: "World-famous museum housing the Mona Lisa.",
        coordinates: [48.8606, 2.3376],
      },
      {
        name: "Le Marais",
        type: "Explore",
        description: "Historic district with boutiques and cafés.",
        coordinates: [48.8575, 2.3622],
      },
      {
        name: "Seine River Cruise",
        type: "Activity",
        description: "Scenic cruise, best enjoyed at sunset.",
        coordinates: [48.8592, 2.3413],
      },
      {
        name: "Le Comptoir du Relais",
        type: "Dining",
        description: "Classic Parisian bistro experience.",
        coordinates: [48.852, 2.3387],
      },
    ],
  },

  {
    id: "lyon-fr",
    name: "Lyon",
    country: "France",
    climate: "temperate",
    budget: 1200,
    interests: ["Food", "Culture"],
    coordinates: [45.764, 4.8357],
    itineraryIdeas: [
      {
        name: "Vieux Lyon",
        type: "Must-See",
        description: "UNESCO old town with Renaissance charm.",
        coordinates: [45.7625, 4.8275],
      },
      {
        name: "Fourvière Basilica",
        type: "Must-See",
        description: "Hilltop basilica with panoramic views.",
        coordinates: [45.7623, 4.8226],
      },
      {
        name: "Traboules",
        type: "Explore",
        description: "Hidden passageways unique to Lyon.",
        coordinates: [45.767, 4.832],
      },
      {
        name: "Les Halles Bocuse",
        type: "Dining",
        description: "Premium indoor food market.",
        coordinates: [45.7621, 4.8512],
      },
      {
        name: "Rhône River Walk",
        type: "Activity",
        description: "Perfect for biking or relaxing strolls.",
        coordinates: [45.7588, 4.84],
      },
    ],
  },

  {
    id: "marseille-fr",
    name: "Marseille",
    country: "France",
    climate: "warm",
    budget: 1300,
    interests: ["Food", "Nature", "Culture"],
    coordinates: [43.2965, 5.3698],
    itineraryIdeas: [
      {
        name: "Old Port",
        type: "Must-See",
        description: "Historic harbor and vibrant center.",
        coordinates: [43.2951, 5.374],
      },
      {
        name: "Calanques National Park",
        type: "Must-See",
        description: "Stunning cliffs and turquoise waters.",
        coordinates: [43.214, 5.4542],
      },
      {
        name: "Le Panier",
        type: "Explore",
        description: "Colorful historic neighborhood.",
        coordinates: [43.2995, 5.3678],
      },
      {
        name: "Boat Tour Calanques",
        type: "Activity",
        description: "Best way to explore hidden coves.",
        coordinates: [43.2938, 5.3705],
      },
      {
        name: "Chez Etienne",
        type: "Dining",
        description: "Famous for traditional Marseille cuisine.",
        coordinates: [43.298, 5.3695],
      },
    ],
  },

  {
    id: "nice-fr",
    name: "Nice",
    country: "France",
    climate: "warm",
    budget: 1600,
    interests: ["Relaxation", "Nature", "Food"],
    coordinates: [43.7102, 7.262],
    itineraryIdeas: [
      {
        name: "Promenade des Anglais",
        type: "Must-See",
        description: "Seafront boulevard with iconic views.",
        coordinates: [43.6942, 7.2514],
      },
      {
        name: "Vieux Nice",
        type: "Explore",
        description: "Old town with colorful streets and markets.",
        coordinates: [43.6967, 7.275],
      },
      {
        name: "Castle Hill",
        type: "Activity",
        description: "Best panoramic viewpoint.",
        coordinates: [43.6944, 7.2794],
      },
      {
        name: "Cours Saleya Market",
        type: "Explore",
        description: "Famous flower and food market.",
        coordinates: [43.6953, 7.273],
      },
      {
        name: "La Petite Maison",
        type: "Dining",
        description: "Top-rated Mediterranean cuisine.",
        coordinates: [43.6958, 7.2678],
      },
    ],
  },

  {
    id: "bordeaux-fr",
    name: "Bordeaux",
    country: "France",
    climate: "temperate",
    budget: 1400,
    interests: ["Food", "Culture"],
    coordinates: [44.8378, -0.5792],
    itineraryIdeas: [
      {
        name: "Place de la Bourse",
        type: "Must-See",
        description: "Iconic square with water mirror.",
        coordinates: [44.8417, -0.5701],
      },
      {
        name: "Cité du Vin",
        type: "Must-See",
        description: "Interactive wine museum.",
        coordinates: [44.8624, -0.55],
      },
      {
        name: "Old Town",
        type: "Explore",
        description: "Elegant streets and architecture.",
        coordinates: [44.8385, -0.574],
      },
      {
        name: "Wine Tasting Tour",
        type: "Activity",
        description: "Explore nearby vineyards.",
        coordinates: [44.837, -0.579],
      },
      {
        name: "Le Chapon Fin",
        type: "Dining",
        description: "Historic fine dining restaurant.",
        coordinates: [44.8421, -0.5775],
      },
    ],
  },

  {
    id: "toulouse-fr",
    name: "Toulouse",
    country: "France",
    climate: "temperate",
    budget: 1200,
    interests: ["Culture", "Food"],
    coordinates: [43.6047, 1.4442],
    itineraryIdeas: [
      {
        name: "Place du Capitole",
        type: "Must-See",
        description: "Main square and historic center.",
        coordinates: [43.6044, 1.444],
      },
      {
        name: "Basilica Saint-Sernin",
        type: "Must-See",
        description: "UNESCO Romanesque church.",
        coordinates: [43.6085, 1.4418],
      },
      {
        name: "Garonne River Walk",
        type: "Activity",
        description: "Relaxing riverside stroll.",
        coordinates: [43.601, 1.437],
      },
      {
        name: "Victor Hugo Market",
        type: "Explore",
        description: "Best local food market.",
        coordinates: [43.6075, 1.447],
      },
      {
        name: "Le Bibent",
        type: "Dining",
        description: "Elegant brasserie with local dishes.",
        coordinates: [43.6045, 1.4435],
      },
    ],
  },

  {
    id: "strasbourg-fr",
    name: "Strasbourg",
    country: "France",
    climate: "cold",
    budget: 1350,
    interests: ["Culture", "Architecture"],
    coordinates: [48.5734, 7.7521],
    itineraryIdeas: [
      {
        name: "Strasbourg Cathedral",
        type: "Must-See",
        description: "Gothic masterpiece.",
        coordinates: [48.5819, 7.7508],
      },
      {
        name: "La Petite France",
        type: "Must-See",
        description: "Charming canals and half-timbered houses.",
        coordinates: [48.581, 7.742],
      },
      {
        name: "Boat Tour",
        type: "Activity",
        description: "Explore the city via canals.",
        coordinates: [48.5805, 7.749],
      },
      {
        name: "Christmas Market",
        type: "Explore",
        description: "One of Europe's oldest markets.",
        coordinates: [48.5839, 7.748],
      },
      {
        name: "Maison Kammerzell",
        type: "Dining",
        description: "Historic Alsatian restaurant.",
        coordinates: [48.582, 7.7501],
      },
    ],
  },

  {
    id: "nantes-fr",
    name: "Nantes",
    country: "France",
    climate: "temperate",
    budget: 1150,
    interests: ["Culture", "Nature"],
    coordinates: [47.2184, -1.5536],
    itineraryIdeas: [
      {
        name: "Machines of the Isle",
        type: "Must-See",
        description: "Giant mechanical elephant attraction.",
        coordinates: [47.2064, -1.5643],
      },
      {
        name: "Château des Ducs de Bretagne",
        type: "Must-See",
        description: "Historic castle museum.",
        coordinates: [47.2163, -1.5492],
      },
      {
        name: "Île de Nantes",
        type: "Explore",
        description: "Creative and cultural hub.",
        coordinates: [47.205, -1.555],
      },
      {
        name: "Loire River Walk",
        type: "Activity",
        description: "Scenic riverside paths.",
        coordinates: [47.212, -1.56],
      },
      {
        name: "La Cigale",
        type: "Dining",
        description: "Famous Belle Époque brasserie.",
        coordinates: [47.2138, -1.5615],
      },
    ],
  },

  {
    id: "annecy-fr",
    name: "Annecy",
    country: "France",
    climate: "cold",
    budget: 1600,
    interests: ["Nature", "Relaxation"],
    coordinates: [45.8992, 6.1294],
    itineraryIdeas: [
      {
        name: "Lake Annecy",
        type: "Must-See",
        description: "Crystal-clear alpine lake.",
        coordinates: [45.86, 6.17],
      },
      {
        name: "Old Town",
        type: "Explore",
        description: "Canals and pastel-colored houses.",
        coordinates: [45.899, 6.126],
      },
      {
        name: "Cycling Lake Loop",
        type: "Activity",
        description: "Popular scenic bike route.",
        coordinates: [45.88, 6.15],
      },
      {
        name: "Boat Cruise",
        type: "Activity",
        description: "Relaxing lake experience.",
        coordinates: [45.898, 6.131],
      },
      {
        name: "Le Freti",
        type: "Dining",
        description: "Famous for fondue and Savoy cuisine.",
        coordinates: [45.8987, 6.1268],
      },
    ],
  },

  {
    id: "cannes-fr",
    name: "Cannes",
    country: "France",
    climate: "warm",
    budget: 2000,
    interests: ["Nightlife", "Culture", "Sea"],
    coordinates: [43.5528, 7.0174],
    itineraryIdeas: [
      {
        name: "La Croisette",
        type: "Must-See",
        description: "Luxury promenade by the sea.",
        coordinates: [43.548, 7.03],
      },
      {
        name: "Palais des Festivals",
        type: "Must-See",
        description: "Home of Cannes Film Festival.",
        coordinates: [43.551, 7.0177],
      },
      {
        name: "Le Suquet",
        type: "Explore",
        description: "Historic old quarter.",
        coordinates: [43.5505, 7.011],
      },
      {
        name: "Beach Clubs",
        type: "Activity",
        description: "Relax on private beaches.",
        coordinates: [43.547, 7.035],
      },
      {
        name: "La Môme",
        type: "Dining",
        description: "Trendy upscale restaurant.",
        coordinates: [43.5522, 7.0225],
      },
    ],
  },
];

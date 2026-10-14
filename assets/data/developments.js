/*
 * ===========================================================================
 *  HARDWICK CONSTRUCTION — SITE CONTENT
 * ===========================================================================
 *  This is the ONLY file that needs editing to keep the website up to date.
 *  Every template reads from it.
 *
 *  • Mark a home as sold      → change   status: "available"   to   status: "sold"
 *    (allowed values: "available", "reserved", "sold", "coming-soon")
 *  • Move a finished site      → change   stage: "current"   to   stage: "completed"
 *    and add   completed: 2026
 *  • Add a new development     → copy an existing { ... } block, paste it,
 *    and change the details. The "slug" must be unique (lower-case, hyphens).
 *  • Photos live in /assets/img — use just the file name here.
 *  • Interactive plots page: a development with "houseTypes" and "sitePlan"
 *    (see Brunt Lane) gets a hover-able site plan. Give each plot a
 *    houseType letter that matches one of its houseTypes.
 *
 *  NOTE: all developments, plots and prices below are SAMPLE CONTENT for the
 *  draft templates and will be replaced with Hardwick's real details.
 * ===========================================================================
 */
window.HARDWICK = {
  company: {
    name: "Hardwick Construction",
    strapline: "Quality new homes, built locally in South Derbyshire",
    phone: "01283 212304",
    mobile: "07595 081891",
    email: "james.hardwick@hardwickconstruction.co.uk",
    address: [
      "Unit 1 Oaktree Business Park",
      "Cadley Hill Road",
      "Swadlincote",
      "Derbyshire",
      "DE11 9DJ"
    ],
    about:
      "Hardwick Construction is a family-run housebuilder based in Swadlincote. " +
      "We build small, carefully planned developments of quality homes across " +
      "South Derbyshire and the surrounding villages — each one finished to a " +
      "standard we would be happy to live in ourselves.",
    stats: [
      { value: 25, suffix: "+", label: "Years building locally" },
      { value: 140, suffix: "+", label: "Homes completed" },
      { value: 10, suffix: "yr", label: "New home warranty" }
    ]
  },

  developments: [
    /* ------------------------------------------------------------------ */
    {
      slug: "brunt-lane",
      name: "Brunt Lane",
      location: "Woodville, Swadlincote",
      postcode: "TBC",
      mapQuery: "Brunt Lane, Woodville, Swadlincote",
      stage: "current",
      headline: "Thirteen four-bedroom homes around a private cul-de-sac",
      summary:
        "A collection of five four-bedroom house types set around a landscaped " +
        "cul-de-sac off Brunt Lane, with an area of biodiversity to the north.",
      description: [
        "Land off Brunt Lane is a small development of four-bedroom family homes, " +
          "arranged around a private, landscaped cul-de-sac with off-road parking to every home.",
        "There are five house types to choose from, ranging from the Type A detached home " +
          "to the larger Type C and Type E, each with an en-suite principal bedroom and an " +
          "open-plan kitchen, dining and living space opening onto the rear garden."
      ],
      hero: "brunt-lane-type-c.webp",
      gallery: ["brunt-lane-siteplan.webp", "brunt-lane-type-a.webp", "brunt-lane-type-b.webp", "brunt-lane-type-e.webp"],
      features: [
        "Five four-bedroom house types",
        "En-suite to every principal bedroom",
        "Open-plan kitchen, dining & living spaces",
        "Integral garages to Types B & C",
        "Area of biodiversity & native planting"
      ],

      /*
       * House types for this development, keyed by the letter used on the site plan.
       * Room sizes are approximate, taken from the architect's drawings (S G Design Studio).
       */
      houseTypes: {
        A: {
          name: "Type A",
          style: "4 bedroom detached house",
          beds: 4, sqm: 99, sqft: 1066,
          image: "brunt-lane-type-a.webp",
          drawing: "226-35-TP-A-10",
          summary: "A well-proportioned detached home with a kitchen and dining room across the rear, a separate utility and pantry, and a principal bedroom with en-suite.",
          ground: [
            ["Lounge", "3.00 × 4.41 m"],
            ["Kitchen / dining", "5.59 × 3.40 m"],
            ["Utility", "2.06 × 1.10 m"],
            ["Pantry", ""],
            ["Cloakroom / WC", ""]
          ],
          first: [
            ["Bedroom 1", "3.00 × 3.57 m"],
            ["En-suite", "2.06 × 1.51 m"],
            ["Bedroom 2", "3.07 × 2.57 m"],
            ["Bedroom 3", "2.45 × 3.44 m"],
            ["Bedroom 4", "2.24 × 2.56 m"],
            ["Bathroom", "2.06 × 2.00 m"]
          ],
          highlights: ["French doors from the dining area to the garden", "Separate utility & walk-in pantry", "Fitted wardrobes to bedroom 1"]
        },
        B: {
          name: "Type B",
          style: "4 bedroom detached house with integral garage",
          beds: 4, sqm: 111, sqft: 1191,
          image: "brunt-lane-type-b.webp",
          drawing: "226-35-TP-B-10",
          summary: "A spacious detached home with an open-plan kitchen, dining and living room across the full width of the rear, a separate lounge and an integral garage.",
          ground: [
            ["Kitchen / dining / living", "7.72 × 3.46 m"],
            ["Lounge", "3.46 × 4.05 m"],
            ["Integral garage", "2.95 × 5.76 m"],
            ["Cloakroom / WC", ""]
          ],
          first: [
            ["Bedroom 1", "3.50 × 3.70 m"],
            ["En-suite", "2.18 × 1.64 m"],
            ["Bedroom 2", "2.64 × 3.70 m"],
            ["Bedroom 3", "2.74 × 3.22 m"],
            ["Bedroom 4", "2.63 × 3.84 m"],
            ["Bathroom", "2.20 × 2.17 m"]
          ],
          highlights: ["Full-width open-plan kitchen, dining & living", "Integral single garage", "Fitted wardrobes to bedroom 1"]
        },
        C: {
          name: "Type C",
          style: "4 bedroom detached house with integral garage",
          beds: 4, sqm: 117, sqft: 1258,
          image: "brunt-lane-type-c.webp",
          drawing: "226-35-TP-C-10",
          summary: "Our widest-fronted home, with an 8.3 metre open-plan living, dining and kitchen space, a separate lounge, an integral garage and a principal suite with dressing area.",
          ground: [
            ["Living / dining / kitchen", "8.29 × 3.46 m"],
            ["Lounge", "3.10 × 4.05 m"],
            ["Integral garage", "2.95 × 5.76 m"],
            ["Cloakroom / WC", ""]
          ],
          first: [
            ["Bedroom 1", "3.20 × 3.70 m"],
            ["Dressing area", "Fitted wardrobes"],
            ["En-suite", "2.10 × 1.64 m"],
            ["Bedroom 2", "2.74 × 4.32 m"],
            ["Bedroom 3", "3.20 × 3.22 m"],
            ["Bedroom 4", "2.74 × 2.17 m"],
            ["Bathroom", "2.20 × 2.17 m"]
          ],
          highlights: ["8.3 m open-plan living, dining & kitchen", "Integral single garage", "Principal suite with dressing area"]
        },
        D: {
          name: "Type D",
          style: "4 bedroom house",
          beds: 4, sqm: null, sqft: null,
          image: null,
          drawing: null,
          summary: "Floor plans and images for the Type D house are to follow. Please get in touch for details.",
          ground: [],
          first: [],
          highlights: []
        },
        E: {
          name: "Type E",
          style: "4 bedroom detached house with study",
          beds: 4, sqm: 119, sqft: 1284,
          image: "brunt-lane-type-e.webp",
          drawing: "226-35-TP-E-10",
          summary: "A classic double-fronted home with a gabled entrance porch, a ground-floor study and utility, and an open-plan kitchen, dining and living room across the rear.",
          ground: [
            ["Kitchen / dining / living", "7.72 × 3.46 m"],
            ["Lounge", "3.46 × 3.94 m"],
            ["Study", "2.35 × 2.24 m"],
            ["Utility", "2.35 × 1.60 m"],
            ["Cloakroom / WC", ""]
          ],
          first: [
            ["Bedroom 1", "2.74 × 3.59 m"],
            ["En-suite", "2.10 × 1.54 m"],
            ["Bedroom 2", "2.73 × 3.59 m"],
            ["Bedroom 3", "2.74 × 3.22 m"],
            ["Bedroom 4", "2.63 × 3.22 m"],
            ["Bathroom", "2.20 × 2.17 m"]
          ],
          highlights: ["Ground-floor study & separate utility", "Gabled entrance porch", "Fitted wardrobes to bedroom 1"]
        }
      },

      /*
       * Interactive site plan. Each hotspot outlines one house on the image
       * (coordinates are pixels on the 1306 × 1204 image). The house type,
       * price and status come from the matching plot below.
       */
      sitePlan: {
        image: "brunt-lane-siteplan.webp",
        width: 1306,
        height: 1204,
        hotspots: [
          { plot: 1,  points: "802,1002 856,878 948,932 892,1040" },
          { plot: 2,  points: "703,915 752,816 848,872 796,970" },
          { plot: 3,  points: "598,846 648,745 744,800 690,900" },
          { plot: 4,  points: "500,792 550,680 640,730 588,836" },
          { plot: 5,  points: "135,655 196,557 296,622 232,722" },
          { plot: 6,  points: "212,543 276,446 380,512 314,612" },
          { plot: 7,  points: "292,428 355,330 458,395 392,495" },
          { plot: 8,  points: "374,318 440,218 540,285 470,385" },
          { plot: 9,  points: "476,190 530,122 632,182 574,282" },
          { plot: 10, points: "764,414 812,320 920,384 866,500" },
          { plot: 11, points: "872,492 915,400 1035,463 980,575" },
          { plot: 12, points: "985,582 1030,487 1150,560 1098,665" },
          { plot: 13, points: "322,802 374,722 460,776 408,860" }
        ]
      },

      plots: [
        { plot: 1,  houseType: "A", type: "Type A", beds: 4, sqft: 1066, price: 339995, status: "available" },
        { plot: 2,  houseType: "A", type: "Type A", beds: 4, sqft: 1066, price: 339995, status: "reserved" },
        { plot: 3,  houseType: "B", type: "Type B", beds: 4, sqft: 1191, price: 379995, status: "available" },
        { plot: 4,  houseType: "B", type: "Type B", beds: 4, sqft: 1191, price: 379995, status: "sold" },
        { plot: 5,  houseType: "E", type: "Type E", beds: 4, sqft: 1284, price: 409995, status: "available" },
        { plot: 6,  houseType: "C", type: "Type C", beds: 4, sqft: 1258, price: 399995, status: "sold" },
        { plot: 7,  houseType: "C", type: "Type C", beds: 4, sqft: 1258, price: 399995, status: "available" },
        { plot: 8,  houseType: "C", type: "Type C", beds: 4, sqft: 1258, price: 402995, status: "available" },
        { plot: 9,  houseType: "E", type: "Type E", beds: 4, sqft: 1284, price: 414995, status: "reserved" },
        { plot: 10, houseType: "C", type: "Type C", beds: 4, sqft: 1258, price: 404995, status: "coming-soon" },
        { plot: 11, houseType: "C", type: "Type C", beds: 4, sqft: 1258, price: 404995, status: "coming-soon" },
        { plot: 12, houseType: "D", type: "Type D", beds: 4, sqft: null, price: 394995, status: "coming-soon" },
        { plot: 13, houseType: "E", type: "Type E", beds: 4, sqft: 1284, price: 409995, status: "available" }
      ]
    },
    /* ------------------------------------------------------------------ */
    {
      slug: "oaktree-meadow",
      name: "Oaktree Meadow",
      location: "Church Gresley, Swadlincote",
      postcode: "DE11 9PL",
      stage: "current",
      headline: "Twelve family homes on the edge of open countryside",
      summary:
        "A collection of 3 and 4 bedroom homes set around a landscaped green, " +
        "a short walk from Church Gresley village centre.",
      description: [
        "Oaktree Meadow is an exclusive development of twelve 3 and 4 bedroom homes, " +
          "arranged around a landscaped green with open views to the south.",
        "Every home is finished with a high specification kitchen, contemporary " +
          "bathrooms, flooring throughout and a turfed rear garden — ready to move straight into."
      ],
      hero: "ext-brick-row.jpg",
      gallery: ["int-kitchen.jpg", "int-living.jpg", "int-bedroom.jpg", "int-bathroom.jpg"],
      features: [
        "Fitted kitchens with integrated appliances",
        "Air source heat pump & underfloor heating to ground floor",
        "EV charging point to every home",
        "Turfed rear gardens with patio",
        "10 year new home warranty"
      ],
      plots: [
        { plot: 1,  type: "The Melbourne", beds: 4, sqft: 1420, price: 389995, status: "sold" },
        { plot: 2,  type: "The Melbourne", beds: 4, sqft: 1420, price: 389995, status: "sold" },
        { plot: 3,  type: "The Calke",     beds: 3, sqft: 1105, price: 314995, status: "sold" },
        { plot: 4,  type: "The Ashby",     beds: 3, sqft: 960,  price: 269995, status: "reserved" },
        { plot: 5,  type: "The Ashby",     beds: 3, sqft: 960,  price: 269995, status: "available" },
        { plot: 6,  type: "The Repton",    beds: 4, sqft: 1560, price: 424995, status: "available" },
        { plot: 7,  type: "The Repton",    beds: 4, sqft: 1560, price: 424995, status: "reserved" },
        { plot: 8,  type: "The Calke",     beds: 3, sqft: 1105, price: 314995, status: "available" },
        { plot: 9,  type: "The Calke",     beds: 3, sqft: 1105, price: 317995, status: "available" },
        { plot: 10, type: "The Melbourne", beds: 4, sqft: 1420, price: 394995, status: "coming-soon" },
        { plot: 11, type: "The Ashby",     beds: 3, sqft: 960,  price: 272995, status: "coming-soon" },
        { plot: 12, type: "The Ashby",     beds: 3, sqft: 960,  price: 272995, status: "coming-soon" }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "cadley-view",
      name: "Cadley View",
      location: "Castle Gresley, Derbyshire",
      postcode: "DE11 9HE",
      stage: "current",
      headline: "Eight spacious detached homes with double garages",
      summary:
        "Generous 4 and 5 bedroom detached homes on wide plots, with private " +
        "driveways, double garages and south-facing gardens.",
      description: [
        "Cadley View is a small, private development of eight detached homes, " +
          "each sitting on a generous plot with a double garage and wide driveway.",
        "Designed for growing families, the homes combine open-plan kitchen and " +
          "family rooms with a separate lounge, study and principal suite with dressing area."
      ],
      hero: "ext-detached.jpg",
      gallery: ["int-kitchen-2.jpg", "int-living-2.jpg", "int-bedroom.jpg", "int-kitchen-3.jpg"],
      features: [
        "Double garage & private driveway",
        "Bi-fold doors to south-facing gardens",
        "Principal suite with dressing area & en-suite",
        "Solar PV panels",
        "10 year new home warranty"
      ],
      plots: [
        { plot: 1, type: "The Bretby",    beds: 5, sqft: 1980, price: 549995, status: "sold" },
        { plot: 2, type: "The Repton",    beds: 4, sqft: 1560, price: 449995, status: "available" },
        { plot: 3, type: "The Repton",    beds: 4, sqft: 1560, price: 449995, status: "reserved" },
        { plot: 4, type: "The Bretby",    beds: 5, sqft: 1980, price: 554995, status: "available" },
        { plot: 5, type: "The Melbourne", beds: 4, sqft: 1420, price: 419995, status: "available" },
        { plot: 6, type: "The Melbourne", beds: 4, sqft: 1420, price: 419995, status: "available" },
        { plot: 7, type: "The Bretby",    beds: 5, sqft: 1980, price: 559995, status: "coming-soon" },
        { plot: 8, type: "The Repton",    beds: 4, sqft: 1560, price: 454995, status: "coming-soon" }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "the-willows",
      name: "The Willows",
      location: "Linton, South Derbyshire",
      postcode: "DE12 6QA",
      stage: "current",
      headline: "Six cottage-style homes in a quiet village setting",
      summary:
        "Characterful 3 bedroom homes in the village of Linton, finished with " +
        "traditional brick detailing and modern, energy-efficient interiors.",
      description: [
        "The Willows is a boutique development of six cottage-style homes in the " +
          "heart of Linton, close to the village school and the National Forest.",
        "Traditional brick and tile exteriors give way to bright, modern interiors " +
          "with a kitchen-diner opening onto the garden."
      ],
      hero: "ext-garden.jpg",
      gallery: ["int-living-3.jpg", "int-kitchen.jpg", "int-bedroom.jpg", "int-bathroom.jpg"],
      features: [
        "Traditional brick & tile exteriors",
        "Kitchen-diner with French doors",
        "Close to the National Forest",
        "Allocated parking for two cars",
        "10 year new home warranty"
      ],
      plots: [
        { plot: 1, type: "The Calke", beds: 3, sqft: 1105, price: 299995, status: "available" },
        { plot: 2, type: "The Calke", beds: 3, sqft: 1105, price: 299995, status: "available" },
        { plot: 3, type: "The Ashby", beds: 3, sqft: 960,  price: 264995, status: "reserved" },
        { plot: 4, type: "The Ashby", beds: 3, sqft: 960,  price: 264995, status: "available" },
        { plot: 5, type: "The Calke", beds: 3, sqft: 1105, price: 304995, status: "coming-soon" },
        { plot: 6, type: "The Calke", beds: 3, sqft: 1105, price: 304995, status: "coming-soon" }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "hill-top-close",
      name: "Hill Top Close",
      location: "Woodville, Swadlincote",
      postcode: "DE11 7DS",
      stage: "completed",
      completed: 2025,
      headline: "Eight family homes, all now sold",
      summary: "A cul-de-sac of eight 3 and 4 bedroom homes, completed in 2025.",
      description: [
        "Hill Top Close was completed in 2025 and every home is now occupied. " +
          "The development of eight homes sits in a quiet cul-de-sac with views across Woodville."
      ],
      hero: "ext-brick-street.jpg",
      gallery: ["int-kitchen-3.jpg", "int-living.jpg"],
      features: ["8 homes", "3 & 4 bedrooms", "Completed 2025"],
      plots: []
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "maple-court",
      name: "Maple Court",
      location: "Midway, Swadlincote",
      postcode: "DE11 7NR",
      stage: "completed",
      completed: 2024,
      headline: "Five detached homes in a mature, tree-lined setting",
      summary: "Five detached 4 bedroom homes set among mature trees, completed in 2024.",
      description: [
        "Maple Court was a small development of five detached homes, carefully " +
          "positioned to retain the mature trees on the site. Completed in 2024."
      ],
      hero: "ext-brick-trees.jpg",
      gallery: ["int-living-2.jpg", "int-kitchen-2.jpg"],
      features: ["5 homes", "4 bedrooms", "Completed 2024"],
      plots: []
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "church-lane",
      name: "Church Lane",
      location: "Overseal, South Derbyshire",
      postcode: "DE12 6LT",
      stage: "completed",
      completed: 2023,
      headline: "Four stone-faced village homes",
      summary: "A sensitive village infill of four stone-faced homes, completed in 2023.",
      description: [
        "Church Lane saw four characterful stone-faced homes built within the " +
          "Overseal conservation area, completed in 2023."
      ],
      hero: "ext-cottage.jpg",
      gallery: ["int-living-3.jpg", "int-bedroom.jpg"],
      features: ["4 homes", "Conservation area", "Completed 2023"],
      plots: []
    }
  ]
};

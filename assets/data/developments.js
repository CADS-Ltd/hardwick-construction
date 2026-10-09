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

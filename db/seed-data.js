export const cities = [
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    costIndex: 72,
    popularity: "High",
    vibe: "sunlit trams and tiled streets",
    image:
      "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    costIndex: 88,
    popularity: "Trending",
    vibe: "quiet temples and tea houses",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "marrakesh",
    name: "Marrakesh",
    country: "Morocco",
    costIndex: 61,
    popularity: "High",
    vibe: "riads, souks, and warm evenings",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "copenhagen",
    name: "Copenhagen",
    country: "Denmark",
    costIndex: 93,
    popularity: "Rising",
    vibe: "harbor loops and design cafes",
    image:
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    costIndex: 79,
    popularity: "High",
    vibe: "late-night food and fast energy",
    image:
      "https://images.unsplash.com/photo-1538485399081-7c8976f6decb?auto=format&fit=crop&w=1200&q=80"
  }
];

export const activities = [
  { id: "tram-tour", cityId: "lisbon", name: "Historic Tram Ride", type: "Sightseeing", cost: 18, duration: 2, time: "10:00" },
  { id: "fado-night", cityId: "lisbon", name: "Fado Dinner Set", type: "Food", cost: 42, duration: 3, time: "19:30" },
  { id: "tea-ceremony", cityId: "kyoto", name: "Tea Ceremony", type: "Culture", cost: 36, duration: 2, time: "14:00" },
  { id: "temple-walk", cityId: "kyoto", name: "Temple Sunrise Walk", type: "Outdoor", cost: 0, duration: 2, time: "06:30" },
  { id: "atlas-spa", cityId: "marrakesh", name: "Hammam Spa", type: "Relax", cost: 44, duration: 2, time: "17:00" },
  { id: "souq-tour", cityId: "marrakesh", name: "Souq Shopping Trail", type: "Sightseeing", cost: 22, duration: 3, time: "11:30" },
  { id: "harbor-bike", cityId: "copenhagen", name: "Harbor Bike Loop", type: "Outdoor", cost: 16, duration: 3, time: "09:00" },
  { id: "bistro-night", cityId: "copenhagen", name: "Canal Bistro Night", type: "Food", cost: 51, duration: 2, time: "20:00" },
  { id: "food-market", cityId: "seoul", name: "Night Market Tasting", type: "Food", cost: 24, duration: 3, time: "19:00" },
  { id: "han-river", cityId: "seoul", name: "Han River Picnic", type: "Relax", cost: 12, duration: 2, time: "16:00" }
];

export const user = {
  name: "Maya",
  email: "maya@traveloop.test"
};

export const trips = [
  {
    id: "trip-1",
    name: "Iberian Color Loop",
    startDate: "2026-06-08",
    endDate: "2026-06-17",
    description: "A sunny balance of food, boutique stays, and rail days.",
    coverImage: cities[0].image,
    budget: 2400,
    shared: true,
    costs: { transport: 620, stay: 940, food: 430, activities: 126 },
    stops: [
      { id: "stop-1", cityId: "lisbon", startDate: "2026-06-08", endDate: "2026-06-11", activities: ["tram-tour", "fado-night"] },
      { id: "stop-2", cityId: "copenhagen", startDate: "2026-06-12", endDate: "2026-06-17", activities: ["harbor-bike"] }
    ],
    packing: [
      { id: "pack-1", label: "Passport", category: "Essentials", packed: true },
      { id: "pack-2", label: "Portable charger", category: "Tech", packed: false },
      { id: "pack-3", label: "Light jacket", category: "Clothing", packed: false }
    ]
  },
  {
    id: "trip-2",
    name: "Kyoto Slow Week",
    startDate: "2026-09-03",
    endDate: "2026-09-10",
    description: "Quiet mornings, tea breaks, and a gentle neighborhood pace.",
    coverImage: cities[1].image,
    budget: 1950,
    shared: false,
    costs: { transport: 480, stay: 760, food: 320, activities: 110 },
    stops: [
      { id: "stop-3", cityId: "kyoto", startDate: "2026-09-03", endDate: "2026-09-10", activities: ["tea-ceremony", "temple-walk"] }
    ],
    packing: [
      { id: "pack-4", label: "Walking shoes", category: "Clothing", packed: false },
      { id: "pack-5", label: "Travel adapter", category: "Tech", packed: true }
    ]
  },
  {
    id: "trip-3",
    name: "Seoul Pulse",
    startDate: "2027-03-05",
    endDate: "2027-03-12",
    description: "Late bites, shopping lanes, and a flexible city rhythm.",
    coverImage: cities[4].image,
    budget: 2100,
    shared: true,
    costs: { transport: 540, stay: 810, food: 360, activities: 120 },
    stops: [
      { id: "stop-4", cityId: "seoul", startDate: "2027-03-05", endDate: "2027-03-12", activities: ["food-market", "han-river"] }
    ],
    packing: [{ id: "pack-6", label: "Skincare pouch", category: "Toiletries", packed: false }]
  }
];

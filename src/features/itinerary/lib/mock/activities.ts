import { Activity } from "../../types";

export async function getMockActivities(): Promise<Activity[]> {
  return [
    {
      id: "act-1",
      name: "Sagrada Familia",
      category: "paid",
      price: 26,
      location: [41.4036, 2.1744],
      city: "Barcelona",
      affiliateUrl: "https://example.com/act1",
    },
    {
      id: "act-2",
      name: "Gothic Quarter Walk",
      category: "free",
      location: [41.3839, 2.1762],
      city: "Barcelona",
    },
    {
      id: "act-3",
      name: "Park Güell",
      category: "paid",
      price: 10,
      location: [41.4145, 2.1527],
      city: "Barcelona",
      affiliateUrl: "https://example.com/act3",
    },
    {
      id: "act-4",
      name: "Beach Day Barceloneta",
      category: "free",
      location: [41.3809, 2.1897],
      city: "Barcelona",
    },
  ];
}

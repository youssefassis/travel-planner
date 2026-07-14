export type StayType = "hotel" | "apartment" | "hostel";

export type StayOption = {
  id: string;
  name: string;
  type: StayType;
  cityId: string;
  city: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
};

// ------------------
// Currency
// ------------------
export interface Currency {
  id: string;
  name: string;
  symbol: string;
}

// ------------------
// Airline
// ------------------
export interface Airline {
  code: string; // IATA or internal code
  name: string;
}

// ------------------
// CarType
// ------------------
export interface CarType {
  id: string;
  name: string;
}

// ------------------
// FlightExtras
// ------------------
export interface FlightExtras {
  seatReservation: number;
  checkedBaggage: number;
  other: number;
}

// ------------------
// FlightOption
// ------------------
export interface FlightSegment {
  fromAirport: string;
  toAirport: string;
  departureDate: string; // ISO string
  arrivalDate: string; // ISO string
}

export interface FlightOption {
  id: string;
  airline: { name: string; symbol: string };
  fromAirport: { name: string; symbol: string };
  toAirport: { name: string; symbol: string };
  flightNumber: string;
  departureDate: string;
  arrivalDate: string;
  stops: number;
  travelClass: "economy" | "premium_economy" | "business";
  baseFare: number;
  extras?: FlightExtras;
  bookingUrl?: string;
  notes?: string;
  durationMin?: number;
  // New fields for calculating stopovers and refined timing
  stopOverDurationMinutes?: number; // total stopover time in minutes
  stopOverAirports?: string[]; // list of IATA codes or airport names
  segments?: FlightSegment[]; // optional detailed legs
  currencyId: string;
  currency?: Currency;
  totalCostEUR: number;
  tripId: string;
  trip?: Trip;
}

// ------------------
// CarRentalOption
// ------------------
export interface CarRentalOption {
  id: string;
  company: string;
  carTypeId: string;
  carType?: CarType;
  pickupDate: string;
  dropOffDate: string;
  pickupLocation: string;
  dropOffLocation: string;
  baseRate: number;
  fees?: number;
  insurancePerDay?: number;
  currencyId: string;
  currency?: Currency;
  totalCostEUR?: number;
  tripId: string;
  trip?: Trip;
}

// ------------------
// AccommodationOption
// ------------------
export interface AccommodationOption {
  id: string;
  title: string;
  provider?: string;
  roomType?: string;
  nightlyRate: number;
  currencyId: string;
  currency?: Currency; // loaded relation
  totalCostEUR?: number;
  url?: string;
  tripStopId?: string;
  tripStop?: TripStop; // optional loaded relation
}

// ------------------
// TripStop
// ------------------
export interface TripStop {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  lat?: number;
  lng?: number;
  selectedAccommodationId?: string;
  selectedAccommodation?: AccommodationOption; // optional loaded relation
  tripId: string;
  trip?: Trip; // optional loaded relation
  accommodations: AccommodationOption[];
}

// ------------------
// Trip
// ------------------
export interface Trip {
  id: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  currencyId: string;
  currency?: Currency; // optional loaded relation
  people: number;
  totalCostEUR: number;
  imageUrl?: string | null;
  selectedFlightId?: string;
  selectedFlight?: FlightOption; // optional loaded relation
  selectedCarRentalId?: string;
  selectedCarRental?: CarRentalOption; // optional loaded relation
  flights: FlightOption[];
  carRentals: CarRentalOption[];
  tripStops: TripStop[];
}

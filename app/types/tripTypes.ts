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
  code: string;
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
// Flight segments (for multi-leg flights)
// ------------------
export interface FlightSegment {
  fromAirport: string;
  toAirport: string;
  departureDate: string;
  arrivalDate: string;
}

// ------------------
// TripOption (scenario for a trip)
// ------------------
export interface TripOption {
  id: string;
  tripId: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  people?: number | null;
  totalCostEUR?: number | null;
  isPreferred: boolean;

  selectedFlightId?: string | null;
  selectedCarRentalId?: string | null;

  selectedFlight?: FlightOption | null;
  selectedCarRental?: CarRentalOption | null;

  createdAt: string;
  updatedAt: string;
}

// ------------------
// FlightOption (canonical frontend flight type)
// ------------------
// This represents a flight as used in the UI.
export interface FlightOption {
  id: string;

  airline: { name: string; symbol: string };
  fromAirport: { name: string; symbol: string };
  toAirport: { name: string; symbol: string };

  flightNumber: string;

  departureDate: string | null;
  arrivalDate: string | null;

  stops: number;
  travelClass: "economy" | "premium_economy" | "business";

  baseFare: number;
  extras?: FlightExtras;

  bookingUrl?: string;
  notes?: string;

  durationMin?: number;
  stopOverDurationMinutes?: number;
  stopOverAirports?: string[];

  // For multi-leg flights
  segments?: FlightSegment[] | null;

  currencyId: string;
  currency?: Currency;
  totalCostEUR: number;

  tripId: string;
  tripOptionId?: string | null;

  // Optional: relation back to trip, used only when you need it
  trip?: Trip;
}

// ------------------
// CarRentalOption
// ------------------
export interface CarRentalOption {
  id: string;
  provider: string;

  carTypeId?: string | null;
  carType?: CarType;

  pickupDate?: string | null;
  dropoffDate?: string | null;

  pickupLocation: string;
  dropoffLocation: string;

  baseRate: number;
  fees?: number | null;
  insurancePerDay?: number | null;

  currencyId: string;
  currency?: Currency;

  totalCostEUR?: number | null;

  // Trip linking
  tripId: string;
  tripOptionId?: string | null;

  // Extra fields
  bookingUrl?: string | null;
  notes?: string | null;

  createdAt: string;
  updatedAt: string;
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
  currency?: Currency;
  totalCostEUR?: number;

  url?: string;

  tripStopId?: string;
  tripStop?: TripStop;
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
  selectedAccommodation?: AccommodationOption;

  tripId: string;
  trip?: Trip;

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
  currency?: Currency;

  people: number;
  totalCostEUR: number;
  imageUrl?: string | null;

  selectedFlightId?: string;
  selectedFlight?: FlightOption;

  selectedCarRentalId?: string;
  selectedCarRental?: CarRentalOption;

  flights: FlightOption[];
  carRentals: CarRentalOption[];
  tripStops: TripStop[];

  tripOptions?: TripOption[];
}

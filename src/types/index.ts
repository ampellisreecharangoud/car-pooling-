export type UserRole = 'passenger' | 'driver' | 'both';
export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';
export type RideStatus = 'published' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';
export type LuggageCapacity = 'small' | 'medium' | 'large';

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  college_or_org?: string;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate_masked: string;
  passenger_capacity: number;
  fuel_type: 'electric' | 'hybrid' | 'gasoline';
  verified: boolean;
}

export interface RideStop {
  id: string;
  ride_id: string;
  location: string;
  latitude: number;
  longitude: number;
  stop_order: number;
}

export interface Ride {
  id: string;
  driver_id: string;
  vehicle_id?: string;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  destination: string;
  dest_lat: number;
  dest_lng: number;
  travel_date: string; // YYYY-MM-DD
  departure_time: string; // HH:MM
  total_trip_cost: number;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  status: RideStatus;
  notes?: string;
  luggage_capacity: LuggageCapacity;
  created_at: string;
  updated_at: string;
  // Joined fields
  driver?: Profile;
  vehicle?: Vehicle;
  stops?: RideStop[];
  // Match metadata (computed at search time)
  matchExplanation?: MatchExplanation;
}

export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats_requested: number;
  total_price: number;
  status: BookingStatus;
  pickup_note?: string;
  created_at: string;
  updated_at: string;
  ride?: Ride;
  passenger?: Profile;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  notification_type: 'booking_request' | 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'ride_cancelled';
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  link_ride_id?: string;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  ride_id?: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved';
  created_at: string;
}

export interface MatchExplanation {
  pickup_distance_miles: number;
  dest_distance_miles: number;
  time_delta_minutes: number;
  match_score: number; // 0 - 100
  reasons: string[];
}

export interface VerificationApplication {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_email: string;
  license_number: string;
  license_state: string;
  license_expiry: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_plate: string;
  insurance_provider: string;
  insurance_policy_no: string;
  document_preview_name?: string;
  status: VerificationStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

export type RealtimeChangeType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeRidePayload {
  eventType: RealtimeChangeType;
  newRide?: Ride;
  oldRide?: Ride;
  timestamp: string;
}

export interface SearchCriteria {
  pickup: string;
  destination: string;
  date: string;
  departureTime?: string;
  seats: number;
  maxPrice?: number;
  sortBy?: 'match' | 'price_low' | 'departure_time' | 'seats_available';
}



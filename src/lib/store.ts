import {
  Profile,
  Vehicle,
  Ride,
  Booking,
  NotificationItem,
  ReportItem,
  LuggageCapacity,
  VerificationApplication,
  VerificationStatus,
  RealtimeRidePayload,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_VEHICLES,
  INITIAL_RIDES,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialDemoData';

const STORAGE_KEYS = {
  PROFILES: 'ridemate_profiles_v1',
  VEHICLES: 'ridemate_vehicles_v1',
  RIDES: 'ridemate_rides_v1',
  BOOKINGS: 'ridemate_bookings_v1',
  NOTIFICATIONS: 'ridemate_notifications_v1',
  REPORTS: 'ridemate_reports_v1',
  APPLICATIONS: 'ridemate_applications_v1',
  CURRENT_USER_ID: 'ridemate_current_user_id_v1',
};

const INITIAL_APPLICATIONS: VerificationApplication[] = [
  {
    id: 'app-alex-01',
    driver_id: 'user-driver-alex',
    driver_name: 'Alex Rivera',
    driver_email: 'alex.rivera@campus.edu',
    license_number: 'DL-98472910',
    license_state: 'California',
    license_expiry: '2028-11-15',
    vehicle_make: 'Toyota',
    vehicle_model: 'Prius Prime (Plug-in Hybrid)',
    vehicle_year: 2023,
    vehicle_plate: '7XY•••9',
    insurance_provider: 'Campus Mobility Mutual Insurance',
    insurance_policy_no: 'POL-7729104',
    document_preview_name: 'CA_Drivers_License_Front_Verified.pdf',
    status: 'verified',
    submitted_at: '2026-08-16T10:00:00Z',
    reviewed_at: '2026-08-16T14:30:00Z',
    reviewer_notes: 'Valid student ID and clean driving record verified.',
  },
  {
    id: 'app-maya-02',
    driver_id: 'user-commuter-maya',
    driver_name: 'Maya Lin',
    driver_email: 'maya.lin@design.edu',
    license_number: 'DL-39281744',
    license_state: 'California',
    license_expiry: '2027-04-20',
    vehicle_make: 'Honda',
    vehicle_model: 'Civic Hybrid',
    vehicle_year: 2022,
    vehicle_plate: '6AB•••2',
    insurance_provider: 'State Farm Campus Protect',
    insurance_policy_no: 'SF-991204',
    document_preview_name: 'Drivers_License_MayaLin_Scan.pdf',
    status: 'pending',
    submitted_at: '2026-10-09T18:00:00Z',
    reviewer_notes: 'Under initial queue review by campus transport team.',
  },
];

class RideMateStore {
  private profiles: Profile[] = [];
  private vehicles: Vehicle[] = [];
  private rides: Ride[] = [];
  private bookings: Booking[] = [];
  private notifications: NotificationItem[] = [];
  private reports: ReportItem[] = [];
  private applications: VerificationApplication[] = [];
  private currentUserId: string = 'user-passenger-sarah';
  private listeners: Set<() => void> = new Set();
  private realtimeRideListeners: Set<(payload: RealtimeRidePayload) => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const savedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      const savedRides = localStorage.getItem(STORAGE_KEYS.RIDES);
      const savedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const savedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
      const savedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

      this.profiles = savedProfiles ? JSON.parse(savedProfiles) : [...INITIAL_PROFILES];
      this.vehicles = savedVehicles ? JSON.parse(savedVehicles) : [...INITIAL_VEHICLES];
      this.rides = savedRides ? JSON.parse(savedRides) : [...INITIAL_RIDES];
      this.bookings = savedBookings ? JSON.parse(savedBookings) : [...INITIAL_BOOKINGS];
      this.notifications = savedNotifications ? JSON.parse(savedNotifications) : [...INITIAL_NOTIFICATIONS];
      this.reports = savedReports ? JSON.parse(savedReports) : [];
      this.applications = savedApps ? JSON.parse(savedApps) : [...INITIAL_APPLICATIONS];
      this.currentUserId = savedUser || 'user-passenger-sarah';
    } catch {
      this.resetToDefaults();
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(this.vehicles));
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(this.rides));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(this.applications));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
  }

  public resetToDefaults() {
    this.profiles = JSON.parse(JSON.stringify(INITIAL_PROFILES));
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    this.rides = JSON.parse(JSON.stringify(INITIAL_RIDES));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.applications = JSON.parse(JSON.stringify(INITIAL_APPLICATIONS));
    this.reports = [];
    this.currentUserId = 'user-passenger-sarah';
    this.persist();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // Realtime Subscriptions (simulating Supabase Realtime Channel)
  public subscribeToRideChanges(listener: (payload: RealtimeRidePayload) => void): () => void {
    this.realtimeRideListeners.add(listener);
    return () => this.realtimeRideListeners.delete(listener);
  }

  private broadcastRideChange(payload: RealtimeRidePayload) {
    for (const listener of this.realtimeRideListeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error in realtime ride listener:', err);
      }
    }
  }

  // Current User Management
  public getCurrentUser(): Profile {
    const user = this.profiles.find((p) => p.id === this.currentUserId);
    if (user) return user;
    return this.profiles[0] || INITIAL_PROFILES[0];
  }

  public setCurrentUserId(id: string) {
    if (this.profiles.some((p) => p.id === id)) {
      this.currentUserId = id;
      this.persist();
    }
  }

  public updateProfile(updated: Partial<Profile>): { success: boolean; error?: string } {
    const idx = this.profiles.findIndex((p) => p.id === this.currentUserId);
    if (idx === -1) return { success: false, error: 'User not found' };
    this.profiles[idx] = { ...this.profiles[idx], ...updated };
    this.persist();
    return { success: true };
  }

  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  // ==========================================
  // DRIVER VERIFICATION WORKFLOW
  // ==========================================
  public submitDriverVerification(params: {
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
  }): { success: boolean; application?: VerificationApplication; error?: string } {
    const user = this.getCurrentUser();

    // Check required fields
    if (!params.license_number.trim() || !params.vehicle_make.trim() || !params.insurance_provider.trim()) {
      return { success: false, error: 'All driver license and insurance fields are required.' };
    }

    const newApp: VerificationApplication = {
      id: `app-${Date.now()}`,
      driver_id: user.id,
      driver_name: user.display_name,
      driver_email: user.email,
      license_number: params.license_number.trim(),
      license_state: params.license_state.trim(),
      license_expiry: params.license_expiry,
      vehicle_make: params.vehicle_make.trim(),
      vehicle_model: params.vehicle_model.trim(),
      vehicle_year: params.vehicle_year || 2023,
      vehicle_plate: params.vehicle_plate.trim(),
      insurance_provider: params.insurance_provider.trim(),
      insurance_policy_no: params.insurance_policy_no.trim(),
      document_preview_name: params.document_preview_name || 'Driver_License_Scan_Front.pdf',
      status: 'pending', // Starts with 'Pending Review' state
      submitted_at: new Date().toISOString(),
      reviewer_notes: 'Under review by Campus Transit Safety Desk.',
    };

    // Remove any previous application for this driver and push new one
    this.applications = this.applications.filter((a) => a.driver_id !== user.id);
    this.applications.unshift(newApp);

    // Update user profile verification status to 'pending'
    const userIdx = this.profiles.findIndex((p) => p.id === user.id);
    if (userIdx !== -1) {
      this.profiles[userIdx].verification_status = 'pending';
      if (this.profiles[userIdx].role === 'passenger') {
        this.profiles[userIdx].role = 'both';
      }
    }

    // Also auto-register the vehicle if not yet present
    const existingVehicle = this.vehicles.find(
      (v) => v.owner_id === user.id && v.make.toLowerCase() === params.vehicle_make.toLowerCase()
    );
    if (!existingVehicle) {
      this.vehicles.push({
        id: `veh-${Date.now()}`,
        owner_id: user.id,
        make: params.vehicle_make.trim(),
        model: params.vehicle_model.trim(),
        year: params.vehicle_year || 2023,
        color: 'Campus Standard',
        license_plate_masked: params.vehicle_plate
          ? `${params.vehicle_plate.substring(0, 3)}•••${params.vehicle_plate.slice(-1)}`
          : '7XY•••9',
        passenger_capacity: 4,
        fuel_type: 'hybrid',
        verified: false,
      });
    }

    // In-app confirmation notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_id: user.id,
      notification_type: 'booking_request',
      title: 'Verification Application Received',
      message: 'Your driver credentials and vehicle documents are now Pending Review by Campus Transport Safety.',
      read_at: null,
      created_at: new Date().toISOString(),
    });

    this.persist();
    return { success: true, application: newApp };
  }

  public reviewDriverVerification(
    applicationId: string,
    status: 'verified' | 'rejected',
    notes?: string
  ): { success: boolean; error?: string } {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    app.status = status;
    app.reviewed_at = new Date().toISOString();
    app.reviewer_notes = notes || (status === 'verified' ? 'Approved after document validation.' : 'Documentation insufficient or expired.');

    // Update target driver profile
    const targetIdx = this.profiles.findIndex((p) => p.id === app.driver_id);
    if (targetIdx !== -1) {
      this.profiles[targetIdx].verification_status = status;
    }

    // If verified, mark driver's vehicles as verified
    if (status === 'verified') {
      this.vehicles.forEach((v) => {
        if (v.owner_id === app.driver_id) {
          v.verified = true;
        }
      });
    }

    // Notify driver
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_id: app.driver_id,
      notification_type: status === 'verified' ? 'booking_confirmed' : 'booking_rejected',
      title: status === 'verified' ? 'Driver Account Verified!' : 'Verification Review Update',
      message:
        status === 'verified'
          ? 'Congratulations! Your driver credentials have been approved. Your verified badge is now active on all offered rides.'
          : `Your driver verification request was declined: ${notes || 'Please resubmit valid documentation.'}`,
      read_at: null,
      created_at: new Date().toISOString(),
    });

    this.persist();
    return { success: true };
  }

  public getVerificationApplications(): VerificationApplication[] {
    return [...this.applications];
  }

  public getVerificationApplicationByDriver(driverId: string): VerificationApplication | undefined {
    return this.applications.find((a) => a.driver_id === driverId);
  }

  // Vehicles
  public getVehiclesByOwner(ownerId: string): Vehicle[] {
    return this.vehicles.filter((v) => v.owner_id === ownerId);
  }

  public addVehicle(vehicle: Omit<Vehicle, 'id' | 'owner_id' | 'verified'>): Vehicle {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh-${Date.now()}`,
      owner_id: this.currentUserId,
      verified: true,
    };
    this.vehicles.push(newVehicle);
    this.persist();
    return newVehicle;
  }

  // Rides
  public getRides(): Ride[] {
    return this.rides.map((ride) => {
      const driver = this.profiles.find((p) => p.id === ride.driver_id);
      const vehicle = this.vehicles.find((v) => v.id === ride.vehicle_id);
      return {
        ...ride,
        driver,
        vehicle,
      };
    });
  }

  public getRideById(id: string): Ride | undefined {
    const ride = this.rides.find((r) => r.id === id);
    if (!ride) return undefined;
    const driver = this.profiles.find((p) => p.id === ride.driver_id);
    const vehicle = this.vehicles.find((v) => v.id === ride.vehicle_id);
    return {
      ...ride,
      driver,
      vehicle,
    };
  }

  public createRide(params: {
    pickup_location: string;
    pickup_lat: number;
    pickup_lng: number;
    destination: string;
    dest_lat: number;
    dest_lng: number;
    travel_date: string;
    departure_time: string;
    total_trip_cost: number;
    price_per_seat: number;
    total_seats: number;
    vehicle_id?: string;
    notes?: string;
    luggage_capacity?: LuggageCapacity;
    stops?: { location: string; latitude: number; longitude: number }[];
  }): { success: boolean; ride?: Ride; error?: string } {
    if (!params.pickup_location.trim() || !params.destination.trim()) {
      return { success: false, error: 'Pickup and destination locations are required' };
    }
    if (params.total_seats <= 0 || params.total_seats > 8) {
      return { success: false, error: 'Total passenger seats must be between 1 and 8' };
    }
    if (params.price_per_seat < 0) {
      return { success: false, error: 'Price per seat cannot be negative' };
    }

    const newRideId = `ride-${Date.now()}`;
    const newRide: Ride = {
      id: newRideId,
      driver_id: this.currentUserId,
      vehicle_id: params.vehicle_id,
      pickup_location: params.pickup_location.trim(),
      pickup_lat: params.pickup_lat || 37.7749,
      pickup_lng: params.pickup_lng || -122.4194,
      destination: params.destination.trim(),
      dest_lat: params.dest_lat || 37.7891,
      dest_lng: params.dest_lng || -122.4014,
      travel_date: params.travel_date,
      departure_time: params.departure_time,
      total_trip_cost: Number(params.total_trip_cost) || 0,
      price_per_seat: Number(params.price_per_seat),
      total_seats: params.total_seats,
      available_seats: params.total_seats,
      status: 'published',
      notes: params.notes,
      luggage_capacity: params.luggage_capacity || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stops:
        params.stops?.map((s, idx) => ({
          id: `stop-${newRideId}-${idx + 1}`,
          ride_id: newRideId,
          location: s.location,
          latitude: s.latitude,
          longitude: s.longitude,
          stop_order: idx + 1,
        })) || [],
    };

    this.rides.unshift(newRide);
    this.persist();

    // Broadcast Realtime Event
    this.broadcastRideChange({
      eventType: 'INSERT',
      newRide,
      timestamp: new Date().toISOString(),
    });

    return { success: true, ride: newRide };
  }

  // Simulate an incoming live ride from another commuter on the corridor
  public simulateIncomingRideOffer(): Ride {
    const driver = this.profiles.find((p) => p.id === 'user-driver-marcus') || this.profiles[0];
    const newRideId = `ride-live-${Date.now()}`;
    const newRide: Ride = {
      id: newRideId,
      driver_id: driver.id,
      vehicle_id: 'veh-marcus-tesla',
      pickup_location: 'Campus Student Union (North Gate)',
      pickup_lat: 37.7749,
      pickup_lng: -122.4194,
      destination: 'Downtown Metro Tech Station',
      dest_lat: 37.7891,
      dest_lng: -122.4014,
      travel_date: '2026-10-12',
      departure_time: '08:45',
      total_trip_cost: 16.0,
      price_per_seat: 4.0,
      total_seats: 3,
      available_seats: 3,
      status: 'published',
      notes: 'Just published via real-time corridor broadcast. Tesla Model 3 with fast charging.',
      luggage_capacity: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stops: [],
      driver,
    };

    this.rides.unshift(newRide);
    this.persist();

    // Broadcast to real-time subscribers
    this.broadcastRideChange({
      eventType: 'INSERT',
      newRide,
      timestamp: new Date().toISOString(),
    });

    return newRide;
  }

  public cancelRide(rideId: string): { success: boolean; error?: string } {
    const ride = this.rides.find((r) => r.id === rideId);
    if (!ride) return { success: false, error: 'Ride not found' };
    if (ride.driver_id !== this.currentUserId) {
      return { success: false, error: 'Unauthorized: You are not the driver of this ride' };
    }

    const oldRide = { ...ride };
    ride.status = 'cancelled';
    ride.updated_at = new Date().toISOString();

    const associatedBookings = this.bookings.filter(
      (b) => b.ride_id === rideId && (b.status === 'confirmed' || b.status === 'pending')
    );
    for (const b of associatedBookings) {
      b.status = 'cancelled';
      b.updated_at = new Date().toISOString();

      this.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        recipient_id: b.passenger_id,
        notification_type: 'ride_cancelled',
        title: 'Ride Cancelled by Driver',
        message: `Your upcoming ride to ${ride.destination} on ${ride.travel_date} was cancelled by the driver.`,
        read_at: null,
        created_at: new Date().toISOString(),
        link_ride_id: rideId,
      });
    }

    this.persist();

    this.broadcastRideChange({
      eventType: 'UPDATE',
      newRide: ride,
      oldRide,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  // Atomic Booking Operations
  public requestBooking(params: {
    ride_id: string;
    seats_requested: number;
    pickup_note?: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const ride = this.rides.find((r) => r.id === params.ride_id);
    if (!ride) return { success: false, error: 'Ride not found' };

    if (ride.driver_id === this.currentUserId) {
      return { success: false, error: 'Drivers cannot book seats on their own ride' };
    }

    if (ride.status !== 'published') {
      return { success: false, error: 'This ride is no longer accepting bookings' };
    }

    if (params.seats_requested <= 0) {
      return { success: false, error: 'Seats requested must be at least 1' };
    }

    if (ride.available_seats < params.seats_requested) {
      return {
        success: false,
        error: `Only ${ride.available_seats} seat(s) available. Cannot reserve ${params.seats_requested}.`,
      };
    }

    const existing = this.bookings.find(
      (b) =>
        b.ride_id === params.ride_id &&
        b.passenger_id === this.currentUserId &&
        (b.status === 'pending' || b.status === 'confirmed')
    );
    if (existing) {
      return {
        success: false,
        error: `You already have an active (${existing.status}) reservation for this ride.`,
      };
    }

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      ride_id: params.ride_id,
      passenger_id: this.currentUserId,
      seats_requested: params.seats_requested,
      total_price: Number((ride.price_per_seat * params.seats_requested).toFixed(2)),
      status: 'pending',
      pickup_note: params.pickup_note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);

    const passenger = this.getCurrentUser();
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_id: ride.driver_id,
      notification_type: 'booking_request',
      title: 'New Seat Request',
      message: `${passenger.display_name} requested ${params.seats_requested} seat(s) for your trip to ${ride.destination}.`,
      read_at: null,
      created_at: new Date().toISOString(),
      link_ride_id: ride.id,
    });

    this.persist();
    return { success: true, booking: newBooking };
  }

  // Driver responds to booking
  public respondToBooking(
    bookingId: string,
    action: 'confirm' | 'reject'
  ): { success: boolean; error?: string } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    const ride = this.rides.find((r) => r.id === booking.ride_id);
    if (!ride) return { success: false, error: 'Associated ride not found' };

    if (ride.driver_id !== this.currentUserId) {
      return { success: false, error: 'Unauthorized: Only the driver can respond to this booking' };
    }

    if (booking.status !== 'pending') {
      return { success: false, error: `Booking has already been ${booking.status}` };
    }

    const oldRide = { ...ride };

    if (action === 'confirm') {
      if (ride.available_seats < booking.seats_requested) {
        return {
          success: false,
          error: `Insufficient seats left (${ride.available_seats} remaining) to confirm ${booking.seats_requested} seats.`,
        };
      }

      ride.available_seats -= booking.seats_requested;
      ride.updated_at = new Date().toISOString();
      booking.status = 'confirmed';
      booking.updated_at = new Date().toISOString();

      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipient_id: booking.passenger_id,
        notification_type: 'booking_confirmed',
        title: 'Ride Confirmed!',
        message: `Your booking for ${booking.seats_requested} seat(s) to ${ride.destination} has been confirmed.`,
        read_at: null,
        created_at: new Date().toISOString(),
        link_ride_id: ride.id,
      });

      this.persist();

      // Realtime Broadcast that ride available_seats has updated!
      this.broadcastRideChange({
        eventType: 'UPDATE',
        newRide: ride,
        oldRide,
        timestamp: new Date().toISOString(),
      });
    } else {
      booking.status = 'rejected';
      booking.updated_at = new Date().toISOString();

      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipient_id: booking.passenger_id,
        notification_type: 'booking_rejected',
        title: 'Request Declined',
        message: `Your request for ${booking.seats_requested} seat(s) to ${ride.destination} was declined by the driver.`,
        read_at: null,
        created_at: new Date().toISOString(),
        link_ride_id: ride.id,
      });

      this.persist();
    }

    return { success: true };
  }

  // Cancel booking
  public cancelBooking(bookingId: string): { success: boolean; error?: string } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    const ride = this.rides.find((r) => r.id === booking.ride_id);
    if (!ride) return { success: false, error: 'Ride not found' };

    const isPassenger = booking.passenger_id === this.currentUserId;
    const isDriver = ride.driver_id === this.currentUserId;

    if (!isPassenger && !isDriver) {
      return { success: false, error: 'Unauthorized: You cannot cancel this booking' };
    }

    if (booking.status === 'cancelled') {
      return { success: false, error: 'Booking is already cancelled' };
    }

    const oldRide = { ...ride };

    // Restore seats if it was confirmed
    if (booking.status === 'confirmed') {
      ride.available_seats = Math.min(ride.total_seats, ride.available_seats + booking.seats_requested);
      ride.updated_at = new Date().toISOString();
    }

    booking.status = 'cancelled';
    booking.updated_at = new Date().toISOString();

    const targetUserId = isPassenger ? ride.driver_id : booking.passenger_id;
    const cancelledBy = isPassenger ? 'Passenger' : 'Driver';

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_id: targetUserId,
      notification_type: 'booking_cancelled',
      title: `Booking Cancelled by ${cancelledBy}`,
      message: `The booking for ${booking.seats_requested} seat(s) on trip to ${ride.destination} was cancelled.`,
      read_at: null,
      created_at: new Date().toISOString(),
      link_ride_id: ride.id,
    });

    this.persist();

    // Broadcast seat change if availability changed
    if (oldRide.available_seats !== ride.available_seats) {
      this.broadcastRideChange({
        eventType: 'UPDATE',
        newRide: ride,
        oldRide,
        timestamp: new Date().toISOString(),
      });
    }

    return { success: true };
  }

  // Bookings getters
  public getBookings(): Booking[] {
    return this.bookings.map((b) => {
      const ride = this.getRideById(b.ride_id);
      const passenger = this.profiles.find((p) => p.id === b.passenger_id);
      return {
        ...b,
        ride,
        passenger,
      };
    });
  }

  public getBookingsByPassenger(passengerId: string): Booking[] {
    return this.getBookings().filter((b) => b.passenger_id === passengerId);
  }

  public getBookingsByRide(rideId: string): Booking[] {
    return this.getBookings().filter((b) => b.ride_id === rideId);
  }

  // Notifications
  public getNotifications(userId?: string): NotificationItem[] {
    const targetId = userId || this.currentUserId;
    return this.notifications.filter((n) => n.recipient_id === targetId);
  }

  public getUnreadNotificationCount(userId?: string): number {
    return this.getNotifications(userId).filter((n) => !n.read_at).length;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif && !notif.read_at) {
      notif.read_at = new Date().toISOString();
      this.persist();
    }
  }

  public markAllNotificationsAsRead() {
    let changed = false;
    for (const notif of this.notifications) {
      if (notif.recipient_id === this.currentUserId && !notif.read_at) {
        notif.read_at = new Date().toISOString();
        changed = true;
      }
    }
    if (changed) this.persist();
  }

  // Reports
  public submitReport(params: {
    reported_user_id: string;
    ride_id?: string;
    reason: string;
    details: string;
  }): { success: boolean } {
    const report: ReportItem = {
      id: `rep-${Date.now()}`,
      reporter_id: this.currentUserId,
      reported_user_id: params.reported_user_id,
      ride_id: params.ride_id,
      reason: params.reason,
      details: params.details,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.reports.push(report);
    this.persist();
    return { success: true };
  }
}

export const store = new RideMateStore();

-- ==============================================================================
-- RIDEMATE AI: SUPABASE & POSTGRESQL PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'both' CHECK (role IN ('passenger', 'driver', 'both')),
    avatar_url TEXT,
    bio TEXT,
    college_or_org TEXT,
    verification_status TEXT NOT NULL DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL CHECK (year >= 1990 AND year <= 2030),
    color TEXT NOT NULL,
    license_plate_masked TEXT NOT NULL,
    passenger_capacity INT NOT NULL CHECK (passenger_capacity >= 1 AND passenger_capacity <= 8),
    fuel_type TEXT NOT NULL DEFAULT 'gasoline' CHECK (fuel_type IN ('electric', 'hybrid', 'gasoline')),
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. RIDES TABLE
CREATE TABLE IF NOT EXISTS public.rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    pickup_location TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    destination TEXT NOT NULL,
    dest_lat DOUBLE PRECISION NOT NULL,
    dest_lng DOUBLE PRECISION NOT NULL,
    travel_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    total_trip_cost NUMERIC(10,2) NOT NULL CHECK (total_trip_cost >= 0),
    price_per_seat NUMERIC(10,2) NOT NULL CHECK (price_per_seat >= 0),
    total_seats INT NOT NULL CHECK (total_seats > 0 AND total_seats <= 8),
    available_seats INT NOT NULL CHECK (available_seats >= 0 AND available_seats <= total_seats),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'completed', 'cancelled')),
    notes TEXT,
    luggage_capacity TEXT NOT NULL DEFAULT 'medium' CHECK (luggage_capacity IN ('small', 'medium', 'large')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. RIDE STOPS (INTERMEDIATE WAYPOINTS)
CREATE TABLE IF NOT EXISTS public.ride_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    stop_order INT NOT NULL DEFAULT 1
);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seats_requested INT NOT NULL CHECK (seats_requested > 0),
    total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
    pickup_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_active_passenger_ride UNIQUE (ride_id, passenger_id)
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('booking_request', 'booking_confirmed', 'booking_rejected', 'booking_cancelled', 'ride_cancelled')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    link_ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_rides_travel_date ON public.rides(travel_date);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride ON public.bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON public.bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view basic info; users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Vehicles: Everyone can view vehicles attached to rides; owners can insert/update
CREATE POLICY "Vehicles viewable by everyone" ON public.vehicles
    FOR SELECT USING (true);
CREATE POLICY "Owners can manage vehicles" ON public.vehicles
    FOR ALL USING (auth.uid() = owner_id);

-- Rides: Everyone can view published rides; drivers can manage their rides
CREATE POLICY "Published rides viewable by all" ON public.rides
    FOR SELECT USING (status != 'cancelled' OR auth.uid() = driver_id);
CREATE POLICY "Drivers can insert their own rides" ON public.rides
    FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Drivers can update their own rides" ON public.rides
    FOR UPDATE USING (auth.uid() = driver_id);

-- Bookings: Passengers see their own bookings; drivers see bookings for their rides
CREATE POLICY "Passengers view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = passenger_id);
CREATE POLICY "Drivers view bookings on their rides" ON public.bookings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.rides WHERE id = bookings.ride_id AND driver_id = auth.uid())
    );
CREATE POLICY "Passengers can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Drivers or passengers can update bookings" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = passenger_id OR
        EXISTS (SELECT 1 FROM public.rides WHERE id = bookings.ride_id AND driver_id = auth.uid())
    );

-- Notifications: Only recipient can see or update
CREATE POLICY "Recipients view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Recipients update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- Reports: Only reporter can insert; admins can view
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ==============================================================================
-- ATOMIC TRANSACTION FUNCTIONS (ANTI-RACE CONDITION SEAT RESERVATION)
-- ==============================================================================

-- Stored procedure to book seats atomically with row lock
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_ride_id UUID,
    p_passenger_id UUID,
    p_seats_requested INT,
    p_pickup_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ride RECORD;
    v_total_price NUMERIC(10,2);
    v_new_booking_id UUID;
BEGIN
    -- 1. Validate requested seats
    IF p_seats_requested <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Seats requested must be greater than zero');
    END IF;

    -- 2. Lock the target ride row to prevent concurrent race condition overbooking
    SELECT * INTO v_ride
    FROM public.rides
    WHERE id = p_ride_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ride not found');
    END IF;

    -- 3. Check driver is not booking own ride
    IF v_ride.driver_id = p_passenger_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Drivers cannot book their own ride');
    END IF;

    -- 4. Check status
    IF v_ride.status != 'published' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ride is no longer open for bookings');
    END IF;

    -- 5. Check seat capacity
    IF v_ride.available_seats < p_seats_requested THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not enough available seats');
    END IF;

    -- 6. Calculate total price
    v_total_price := v_ride.price_per_seat * p_seats_requested;

    -- 7. Insert the booking record
    INSERT INTO public.bookings (
        ride_id,
        passenger_id,
        seats_requested,
        total_price,
        status,
        pickup_note
    ) VALUES (
        p_ride_id,
        p_passenger_id,
        p_seats_requested,
        v_total_price,
        'pending',
        p_pickup_note
    )
    RETURNING id INTO v_new_booking_id;

    -- 8. Create notification for driver
    INSERT INTO public.notifications (
        recipient_id,
        notification_type,
        title,
        message,
        link_ride_id
    ) VALUES (
        v_ride.driver_id,
        'booking_request',
        'New Seat Request',
        'A passenger requested ' || p_seats_requested || ' seat(s) for your trip to ' || v_ride.destination,
        p_ride_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_new_booking_id,
        'status', 'pending'
    );
END;
$$;

-- Stored procedure to confirm booking and deduct seats
CREATE OR REPLACE FUNCTION public.confirm_booking_atomic(
    p_booking_id UUID,
    p_driver_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_ride RECORD;
BEGIN
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    SELECT * INTO v_ride FROM public.rides WHERE id = v_booking.ride_id FOR UPDATE;
    IF v_ride.driver_id != p_driver_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not the driver of this ride');
    END IF;

    IF v_ride.available_seats < v_booking.seats_requested THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient seats left to confirm');
    END IF;

    -- Deduct seats atomically
    UPDATE public.rides
    SET available_seats = available_seats - v_booking.seats_requested,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_ride.id;

    -- Update booking status
    UPDATE public.bookings
    SET status = 'confirmed',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_booking_id;

    -- Notify passenger
    INSERT INTO public.notifications (
        recipient_id,
        notification_type,
        title,
        message,
        link_ride_id
    ) VALUES (
        v_booking.passenger_id,
        'booking_confirmed',
        'Ride Request Confirmed!',
        'Your driver confirmed your reservation for ' || v_booking.seats_requested || ' seat(s).',
        v_ride.id
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

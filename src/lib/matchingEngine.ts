import { Ride, SearchCriteria, MatchExplanation } from '../types';

/**
 * Calculates straight-line distance in miles between two latitude/longitude pairs
 * using the Haversine formula.
 */
export function calculateHaversineDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Computes time difference in minutes between two HH:MM strings.
 */
export function calculateTimeDeltaMinutes(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  return Math.abs(h1 * 60 + m1 - (h2 * 60 + m2));
}

// Known regional landmark coordinates for smart geocoding simulation
export const LANDMARK_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
  campus: { lat: 37.7749, lng: -122.4194, label: 'Campus Student Union' },
  student_union: { lat: 37.7749, lng: -122.4194, label: 'Campus Student Union (North Gate)' },
  science_quad: { lat: 37.7689, lng: -122.4278, label: 'University Science Quad' },
  library: { lat: 37.7795, lng: -122.4170, label: 'Central Library West Plaza' },
  downtown: { lat: 37.7891, lng: -122.4014, label: 'Downtown Metro Tech Station' },
  tech_park: { lat: 37.7955, lng: -122.3937, label: 'BioTech Research Park, South Hub' },
  transit_hub: { lat: 37.7812, lng: -122.4110, label: 'Westside Transit Hub' },
  ferry: { lat: 37.7980, lng: -122.2780, label: 'Oakland Ferry Commuter Terminal' },
};

export function resolveCoordinatesForLocation(query: string): { lat: number; lng: number } {
  const q = query.toLowerCase().trim();
  for (const [key, coords] of Object.entries(LANDMARK_COORDINATES)) {
    if (q.includes(key) || coords.label.toLowerCase().includes(q)) {
      return { lat: coords.lat, lng: coords.lng };
    }
  }
  // Default default urban coords with slight deterministic hash for testing
  let hash = 0;
  for (let i = 0; i < q.length; i++) {
    hash = (hash << 5) - hash + q.charCodeAt(i);
  }
  const latOffset = ((Math.abs(hash) % 100) - 50) * 0.0008;
  const lngOffset = ((Math.abs(hash * 3) % 100) - 50) * 0.0008;
  return { lat: 37.7749 + latOffset, lng: -122.4194 + lngOffset };
}

/**
 * Intelligent Ride-Matching Engine
 * Evaluates candidate rides against passenger criteria and produces a transparent match score (0-100)
 * along with plain-language explanations.
 */
export function scoreAndFilterRides(rides: Ride[], criteria: SearchCriteria): Ride[] {
  const { pickup, destination, date, departureTime, seats, maxPrice, sortBy = 'match' } = criteria;

  const targetPickupCoords = resolveCoordinatesForLocation(pickup || 'Campus');
  const targetDestCoords = resolveCoordinatesForLocation(destination || 'Downtown');

  const eligibleRides: Ride[] = [];

  for (const ride of rides) {
    // Hard Filter 1: Must be published
    if (ride.status !== 'published') continue;

    // Hard Filter 2: Must have enough available seats
    if (ride.available_seats < seats) continue;

    // Hard Filter 3: Travel date check (if date specified)
    const isSameDate = !date || ride.travel_date === date;
    if (date && !isSameDate) continue;

    // Hard Filter 4: Max price check
    if (maxPrice && ride.price_per_seat > maxPrice) continue;

    // Distance metrics (straight-line proximity)
    const pickupDist = calculateHaversineDistanceMiles(
      targetPickupCoords.lat,
      targetPickupCoords.lng,
      ride.pickup_lat,
      ride.pickup_lng
    );

    const destDist = calculateHaversineDistanceMiles(
      targetDestCoords.lat,
      targetDestCoords.lng,
      ride.dest_lat,
      ride.dest_lng
    );

    // Time delta
    let timeDelta = 0;
    if (departureTime) {
      timeDelta = calculateTimeDeltaMinutes(departureTime, ride.departure_time);
    }

    // Check intermediate stops proximity
    let stopsBonus = 0;
    if (ride.stops && ride.stops.length > 0) {
      for (const stop of ride.stops) {
        const stopPickupDist = calculateHaversineDistanceMiles(
          targetPickupCoords.lat,
          targetPickupCoords.lng,
          stop.latitude,
          stop.longitude
        );
        if (stopPickupDist < 2.0) {
          stopsBonus = 10;
          break;
        }
      }
    }

    // Scoring weights:
    // - Pickup proximity: 35 points (max score if <= 1.0 mile)
    // - Destination proximity: 35 points (max score if <= 1.5 miles)
    // - Time compatibility: 20 points (within 30 mins)
    // - Date exact match: 10 points
    const pickupScore = Math.max(0, 35 - pickupDist * 7);
    const destScore = Math.max(0, 35 - destDist * 6);
    const timeScore = departureTime ? Math.max(0, 20 - (timeDelta / 60) * 10) : 20;
    const dateScore = isSameDate ? 10 : 0;

    const totalRaw = pickupScore + destScore + timeScore + dateScore + stopsBonus;
    const matchScore = Math.min(100, Math.max(20, Math.round(totalRaw)));

    // Generate explainable reasons
    const reasons: string[] = [];
    if (pickupDist <= 1.0) {
      reasons.push(`Pickup within ${pickupDist} mi`);
    } else {
      reasons.push(`Pickup ${pickupDist} mi away`);
    }

    if (destDist <= 1.5) {
      reasons.push(`Direct drop-off (${destDist} mi)`);
    }

    if (departureTime) {
      if (timeDelta <= 15) {
        reasons.push('Departing near requested time');
      } else {
        reasons.push(`Departing ${Math.round(timeDelta)}m from target`);
      }
    }

    if (ride.available_seats >= seats + 1) {
      reasons.push(`${ride.available_seats} open seats`);
    }

    if (ride.driver?.verification_status === 'verified') {
      reasons.push('Verified driver');
    }

    const matchExplanation: MatchExplanation = {
      pickup_distance_miles: pickupDist,
      dest_distance_miles: destDist,
      time_delta_minutes: timeDelta,
      match_score: matchScore,
      reasons,
    };

    eligibleRides.push({
      ...ride,
      matchExplanation,
    });
  }

  // Sorting
  eligibleRides.sort((a, b) => {
    if (sortBy === 'price_low') {
      return a.price_per_seat - b.price_per_seat;
    }
    if (sortBy === 'departure_time') {
      return a.departure_time.localeCompare(b.departure_time);
    }
    if (sortBy === 'seats_available') {
      return b.available_seats - a.available_seats;
    }
    // Default: best match score first
    const scoreA = a.matchExplanation?.match_score || 0;
    const scoreB = b.matchExplanation?.match_score || 0;
    return scoreB - scoreA;
  });

  return eligibleRides;
}

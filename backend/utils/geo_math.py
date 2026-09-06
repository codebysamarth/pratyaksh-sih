"""
Geospatial math and transit calculation utility for PRATYAKSH.
"""
import math
from typing import Tuple, List, Dict

# Average urban transit speed in Indian metropolitan / tier-1/2 cities (km/h)
URBAN_SPEED_KMH = 25.0
# Road circuity / route winding factor over straight-line Haversine
ROAD_CIRCUITY_FACTOR = 1.25


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two points in kilometers.
    """
    r = 6371.0  # Earth's radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def estimate_travel_time(
    distance_km: float, speed_kmh: float = URBAN_SPEED_KMH, circuity: float = ROAD_CIRCUITY_FACTOR
) -> float:
    """
    Estimates road travel time in minutes considering urban circuity and congestion factor.
    """
    effective_distance = max(0.05, distance_km * circuity)
    hours = effective_distance / max(1.0, speed_kmh)
    minutes = hours * 60.0
    return round(minutes, 1)


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates initial compass bearing in degrees (0 - 360).
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    x = math.sin(delta_lambda) * math.cos(phi2)
    y = math.cos(phi1) * math.sin(phi2) - (
        math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    )

    initial_bearing = math.atan2(x, y)
    initial_bearing = math.degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360
    return round(compass_bearing, 2)


def generate_corridor_waypoints(
    lat1: float, lon1: float, lat2: float, lon2: float, num_steps: int = 5
) -> List[Dict[str, float]]:
    """
    Generates intermediate corridor coordinates along the route.
    """
    waypoints = []
    for i in range(num_steps + 1):
        fraction = i / float(num_steps)
        lat = lat1 + fraction * (lat2 - lat1)
        lon = lon1 + fraction * (lon2 - lon1)
        waypoints.append({"lat": round(lat, 6), "lon": round(lon, 6)})
    return waypoints

import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models import Hospital

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Haversine formula
    R = 6371.0 # Radius of earth in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def recommend_hospitals(
    db: Session,
    patient_lat: float,
    patient_lng: float,
    required_specialty: str = "TRAUMA"
) -> List[Dict[str, Any]]:
    hospitals = db.query(Hospital).all()
    results = []

    for h in hospitals:
        dist = calculate_distance_km(patient_lat, patient_lng, h.latitude, h.longitude)
        # Average emergency vehicle travel time: 3 min base + 2.2 min per km in traffic
        eta_min = math.ceil(3 + (dist * 2.2))

        has_required_capability = True
        capability_notes = []

        if required_specialty.upper() == "TRAUMA":
            has_required_capability = h.trauma_capability
            capability_notes.append("Level 1 Trauma Center" if h.trauma_capability else "No Level 1 Trauma Facility")
        elif required_specialty.upper() == "CARDIAC":
            has_required_capability = h.cardiac_capability
            capability_notes.append("24x7 Cath Lab Available" if h.cardiac_capability else "No Emergency Cath Lab")
        elif required_specialty.upper() == "BURN":
            has_required_capability = h.burn_unit
            capability_notes.append("Specialized Burn Unit" if h.burn_unit else "No Specialized Burn Unit")

        if h.has_icu:
            capability_notes.append(f"ICU Beds Available ({h.icu_beds_available})")
        else:
            capability_notes.append("ICU Full / Unavailable")

        # Score calculation: weighted score prioritizing capability match > ETA > ICU bed availability
        score = 100.0
        if not has_required_capability:
            score -= 50.0 # Heavy penalty if missing required emergency capability
        
        score -= (eta_min * 2.0) # Penalty for longer travel time
        if h.icu_beds_available > 0:
            score += 15.0
        else:
            score -= 20.0

        results.append({
            "id": h.id,
            "name": h.name,
            "address": h.address,
            "phone": h.phone,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "distance_km": dist,
            "eta_minutes": eta_min,
            "trauma_capability": h.trauma_capability,
            "cardiac_capability": h.cardiac_capability,
            "burn_unit": h.burn_unit,
            "icu_beds_available": h.icu_beds_available,
            "er_status": h.er_status,
            "capability_match": has_required_capability,
            "match_score": round(max(score, 10.0), 1),
            "capability_summary": " | ".join(capability_notes)
        })

    # Sort by match score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)

    # Mark top recommendation
    if results:
        results[0]["is_recommended"] = True
        best = results[0]
        results[0]["recommendation_reason"] = (
            f"RECOMMENDED: {best['name']} is {best['distance_km']} km away (ETA: {best['eta_minutes']} min). "
            f"Required emergency capability '{required_specialty}' is fully operational with {best['icu_beds_available']} ICU beds available."
        )

    for i in range(1, len(results)):
        results[i]["is_recommended"] = False
        r = results[i]
        if not r["capability_match"]:
            results[i]["recommendation_reason"] = f"Not recommended: Lacks required {required_specialty} capability despite proximity."
        else:
            results[i]["recommendation_reason"] = f"Alternative Option: ETA {r['eta_minutes']} min."

    return results

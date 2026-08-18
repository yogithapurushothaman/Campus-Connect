import re
import math

def get_smart_activity_recommendations(user: dict, activities: list) -> list:
    """
    AI Matchmaker - computes similarity score between user and activities
    """
    user_id = user.get("id")
    user_interests = [i.lower() for i in user.get("interests", [])]
    user_major = (user.get("department") or user.get("major") or "").lower()

    recommendations = []
    for act in activities:
        # Check if activity is open and user is not already a participant
        if act.get("status") != "open":
            continue
        participants = act.get("participants", [])
        if any(p.get("userId") == user_id for p in participants):
            continue

        score = 50
        match_reasons = []
        act_tags = [t.lower() for t in act.get("tags", [])]
        act_category = (act.get("category") or "").lower()

        # 1. Interest tag intersection
        matching_interests = []
        for tag in act_tags:
            for ui in user_interests:
                if ui in tag or tag in ui:
                    matching_interests.append(tag.title())
                    break

        if matching_interests:
            score += len(matching_interests) * 20
            match_reasons.append(f"Matches your interest in {', '.join(set(matching_interests))}")

        # 2. Department / Major relevance
        if "computer" in user_major and (act_category == "hackathon" or any(t in act_tags for t in ["ai", "os", "coding", "web"])):
            score += 25
            match_reasons.append("Highly popular in Computer Science & Engineering")

        # 3. Sports profile match
        if any("football" in ui or "sport" in ui for ui in user_interests) and act_category == "sports":
            score += 20
            match_reasons.append("Matches your active sports profile")

        # 4. Squad almost full bonus
        min_p = act.get("minParticipants", 2)
        if len(participants) >= min_p - 1:
            score += 15
            match_reasons.append("Squad almost ready to launch!")

        final_score = min(score, 99)
        recommendations.append({
            "activity": act,
            "score": final_score,
            "matchReasons": match_reasons if match_reasons else ["Recommended based on your campus activity"]
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations

def predict_complaint_attributes(title: str, description: str, building_name: str = "") -> dict:
    """
    AI Complaint Triage: Automated Category & Priority Classifier
    """
    text = f"{title} {description} {building_name}".lower()

    if any(k in text for k in ["wifi", "wi-fi", "internet", "network", "router", "switch", "lan"]):
        is_urgent = "lab" in text or "exam" in text or "urgent" in text
        return {
            "predictedCategory": "wifi",
            "predictedPriority": "urgent" if is_urgent else "high",
            "suggestedTeam": "Campus IT & Network Operations",
            "confidence": 0.94,
        }

    if any(k in text for k in ["dark", "light", "security", "guard", "lock", "harass", "night", "cctv"]):
        return {
            "predictedCategory": "security",
            "predictedPriority": "urgent",
            "suggestedTeam": "Campus Security & Electrical Division",
            "confidence": 0.96,
        }

    if any(k in text for k in ["food", "mess", "hygiene", "canteen", "meal", "taste", "water purifier", "ro filter"]):
        if "hostel" in text or "water purifier" in text or "ro filter" in text:
            return {
                "predictedCategory": "hostel",
                "predictedPriority": "high",
                "suggestedTeam": "Hostel Maintenance & Plumbing Cell",
                "confidence": 0.91,
            }
        return {
            "predictedCategory": "mess",
            "predictedPriority": "high",
            "suggestedTeam": "Food Safety & Hygiene Committee",
            "confidence": 0.93,
        }

    if any(k in text for k in ["hostel", "washing machine", "room", "bathroom", "geyser", "mattress"]):
        return {
            "predictedCategory": "hostel",
            "predictedPriority": "medium",
            "suggestedTeam": "Hostel Estate & Warden Office",
            "confidence": 0.89,
        }

    if any(k in text for k in ["ac", "noise", "projector", "desk", "bench", "library", "class", "fan"]):
        return {
            "predictedCategory": "academic",
            "predictedPriority": "medium",
            "suggestedTeam": "Central Facilities & Academic Services",
            "confidence": 0.88,
        }

    return {
        "predictedCategory": "infrastructure",
        "predictedPriority": "medium",
        "suggestedTeam": "Estate Maintenance Division",
        "confidence": 0.82,
    }

def find_similar_complaints(new_title: str, new_description: str, building_id: str, existing_complaints: list) -> list:
    """
    AI Duplicate Detection: finds existing similar complaints in the same building
    """
    words = re.findall(r'\w+', f"{new_title} {new_description}".lower())
    keywords = [w for w in words if len(w) > 3]

    results = []
    for cmp in existing_complaints:
        if cmp.get("status") == "resolved":
            continue

        existing_text = f"{cmp.get('title', '')} {cmp.get('description', '')}".lower()
        match_count = sum(1 for kw in keywords if kw in existing_text)

        is_same_building = cmp.get("buildingId") == building_id
        base_score = (match_count / max(len(keywords), 1)) * 100
        similarity_score = min(base_score, 100)

        if is_same_building:
            similarity_score += 20

        if similarity_score > 40:
            final_sim = min(round(similarity_score), 99)
            ticket_num = cmp.get("ticketNumber", "")
            title = cmp.get("title", "")
            reason = (
                f"Active ticket #{ticket_num} reported in the same building: \"{title}\""
                if is_same_building
                else f"Similar keyword overlap with ticket #{ticket_num}"
            )
            results.append({
                "complaint": cmp,
                "similarity": final_sim,
                "reason": reason
            })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results

def compute_campus_walking_route(start_building: dict, dest_building: dict) -> dict:
    """
    Campus Wayfinding Calculator: calculates realistic walking route coordinates, meters, & ETA minutes
    """
    start_pos = start_building.get("position", {"x": 50, "y": 50})
    dest_pos = dest_building.get("position", {"x": 50, "y": 50})

    dx = dest_pos["x"] - start_pos["x"]
    dy = dest_pos["y"] - start_pos["y"]

    # Scale: 1% on 2D map ~ 12 meters
    raw_dist = math.hypot(dx, dy)
    distance_meters = round(raw_dist * 12 + 40)
    duration_minutes = max(1, round(distance_meters / 75))  # Average walking speed ~75m/min

    # Waypoints routed through main campus pedestrian spines
    waypoints = [
        {"x": start_pos["x"], "y": start_pos["y"]},
        {"x": start_pos["x"], "y": 50},  # central promenade junction
        {"x": 50, "y": 50},              # central campus circle
        {"x": dest_pos["x"], "y": 50},
        {"x": dest_pos["x"], "y": dest_pos["y"]},
    ]

    start_name = start_building.get("name", "Origin")
    dest_name = dest_building.get("name", "Destination")

    steps = [
        f"Depart from {start_name} main entrance.",
        f"Head towards Central Campus Boulevard promenade ({round(distance_meters * 0.35)}m).",
        "Pass by Central Library Circle & Green Lawn.",
        f"Turn towards {dest_name} entrance concourse ({round(distance_meters * 0.65)}m).",
        f"Arrive at {dest_name}. Estimated travel time: ~{duration_minutes} mins.",
    ]

    return {
        "distanceMeters": distance_meters,
        "durationMinutes": duration_minutes,
        "waypoints": waypoints,
        "steps": steps,
    }

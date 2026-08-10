import { Activity, CampusBuilding, Complaint, ComplaintCategory, ComplaintPriority, User } from '../types';

/**
 * AI Matchmaker - computes similarity score between user and activities
 */
export function getSmartActivityRecommendations(user: User, activities: Activity[]): { activity: Activity; score: number; matchReasons: string[] }[] {
  return activities
    .filter((act) => act.status === 'open' && !act.participants.some((p) => p.userId === user.id))
    .map((act) => {
      let score = 50;
      const matchReasons: string[] = [];

      // Interest tag intersection
      const matchingInterests = act.tags.filter((tag) =>
        user.interests.some((ui) => ui.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ui.toLowerCase()))
      );

      if (matchingInterests.length > 0) {
        score += matchingInterests.length * 20;
        matchReasons.push(`Matches your interest in ${matchingInterests.join(', ')}`);
      }

      // Department / Major relevance
      if (user.major.toLowerCase().includes('computer') && (act.category === 'hackathon' || act.tags.includes('AI') || act.tags.includes('OS'))) {
        score += 25;
        matchReasons.push(`Highly popular in ${user.major}`);
      }

      if (user.interests.includes('Football') && act.category === 'sports') {
        score += 20;
        matchReasons.push('Matches your active sports profile');
      }

      // High reliability creator
      if (act.participants.length >= act.minParticipants - 1) {
        score += 15;
        matchReasons.push('Squad almost ready to launch!');
      }

      return {
        activity: act,
        score: Math.min(score, 99),
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Recommended based on your campus activity'],
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * AI Complaint Triage: Automated Category & Priority Classifier
 */
export function predictComplaintAttributes(
  title: string,
  description: string,
  buildingName: string
): {
  predictedCategory: ComplaintCategory;
  predictedPriority: ComplaintPriority;
  suggestedTeam: string;
  confidence: number;
} {
  const text = `${title} ${description} ${buildingName}`.toLowerCase();

  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('network') || text.includes('router') || text.includes('switch') || text.includes('lan')) {
    return {
      predictedCategory: 'wifi',
      predictedPriority: text.includes('lab') || text.includes('exam') ? 'urgent' : 'high',
      suggestedTeam: 'Campus IT & Network Operations',
      confidence: 0.94,
    };
  }

  if (text.includes('dark') || text.includes('light') || text.includes('security') || text.includes('guard') || text.includes('lock') || text.includes('harass') || text.includes('night')) {
    return {
      predictedCategory: 'security',
      predictedPriority: 'urgent',
      suggestedTeam: 'Campus Security & Electrical Division',
      confidence: 0.96,
    };
  }

  if (text.includes('food') || text.includes('mess') || text.includes('hygiene') || text.includes('canteen') || text.includes('meal') || text.includes('taste') || text.includes('water purifier') || text.includes('ro filter')) {
    if (text.includes('hostel') || text.includes('water purifier') || text.includes('ro filter')) {
      return {
        predictedCategory: 'hostel',
        predictedPriority: 'high',
        suggestedTeam: 'Hostel Maintenance & Plumbing Cell',
        confidence: 0.91,
      };
    }
    return {
      predictedCategory: 'mess',
      predictedPriority: 'high',
      suggestedTeam: 'Food Safety & Hygiene Committee',
      confidence: 0.93,
    };
  }

  if (text.includes('hostel') || text.includes('washing machine') || text.includes('room') || text.includes('bathroom') || text.includes('geyser') || text.includes('mattress')) {
    return {
      predictedCategory: 'hostel',
      predictedPriority: 'medium',
      suggestedTeam: 'Hostel Estate & Warden Office',
      confidence: 0.89,
    };
  }

  if (text.includes('ac') || text.includes('noise') || text.includes('projector') || text.includes('desk') || text.includes('bench') || text.includes('library') || text.includes('class')) {
    return {
      predictedCategory: 'academic',
      predictedPriority: 'medium',
      suggestedTeam: 'Central Facilities & Academic Services',
      confidence: 0.88,
    };
  }

  return {
    predictedCategory: 'infrastructure',
    predictedPriority: 'medium',
    suggestedTeam: 'Estate Maintenance Division',
    confidence: 0.82,
  };
}

/**
 * AI Duplicate Detection: finds existing similar complaints in the same building
 */
export function findSimilarComplaints(
  newTitle: string,
  newDescription: string,
  buildingId: string,
  existingComplaints: Complaint[]
): { complaint: Complaint; similarity: number; reason: string }[] {
  const keywords = `${newTitle} ${newDescription}`
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const results: { complaint: Complaint; similarity: number; reason: string }[] = [];

  for (const cmp of existingComplaints) {
    if (cmp.status === 'resolved') continue;

    let matchCount = 0;
    const existingWords = `${cmp.title} ${cmp.description}`.toLowerCase();

    for (const kw of keywords) {
      if (existingWords.includes(kw)) {
        matchCount++;
      }
    }

    const isSameBuilding = cmp.buildingId === buildingId;
    let similarityScore = Math.min((matchCount / Math.max(keywords.length, 1)) * 100, 100);

    if (isSameBuilding) {
      similarityScore += 20;
    }

    if (similarityScore > 40) {
      results.push({
        complaint: cmp,
        similarity: Math.min(Math.round(similarityScore), 99),
        reason: isSameBuilding
          ? `Active ticket #${cmp.ticketNumber} reported in the same building: "${cmp.title}"`
          : `Similar keyword overlap with ticket #${cmp.ticketNumber}`,
      });
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Campus Wayfinding Calculator (calculates realistic walking route coordinates, meters, & ETA minutes)
 */
export function computeCampusWalkingRoute(
  startBuilding: CampusBuilding,
  destBuilding: CampusBuilding
): {
  distanceMeters: number;
  durationMinutes: number;
  waypoints: { x: number; y: number }[];
  steps: string[];
} {
  const dx = destBuilding.position.x - startBuilding.position.x;
  const dy = destBuilding.position.y - startBuilding.position.y;
  
  // Approximate scale: 1% on map ~ 12 meters
  const rawDist = Math.hypot(dx, dy);
  const distanceMeters = Math.round(rawDist * 12 + 40);
  const durationMinutes = Math.max(1, Math.round(distanceMeters / 75)); // Average walking speed ~75m/min

  // Waypoints through main campus pedestrian spines
  const midX = (startBuilding.position.x + destBuilding.position.x) / 2;
  const midY = (startBuilding.position.y + destBuilding.position.y) / 2;

  const waypoints = [
    { x: startBuilding.position.x, y: startBuilding.position.y },
    { x: startBuilding.position.x, y: 50 }, // central promenade junction
    { x: 50, y: 50 }, // central campus circle
    { x: destBuilding.position.x, y: 50 },
    { x: destBuilding.position.x, y: destBuilding.position.y },
  ];

  const steps = [
    `Depart from ${startBuilding.name} main entrance.`,
    `Head towards Central Campus Boulevard promenade (${Math.round(distanceMeters * 0.35)}m).`,
    `Pass by Central Library Circle & Green Lawn.`,
    `Turn towards ${destBuilding.name} entrance concourse (${Math.round(distanceMeters * 0.65)}m).`,
    `Arrive at ${destBuilding.name}. Estimated travel time: ~${durationMinutes} mins.`,
  ];

  return {
    distanceMeters,
    durationMinutes,
    waypoints,
    steps,
  };
}

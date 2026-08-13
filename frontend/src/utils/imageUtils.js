/**
 * Returns a deterministic, beautiful Unsplash image URL based on the event.
 * Uses category or keywords from the title to pick a relevant image.
 */

const CATEGORY_IMAGES = {
  academic:    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
  technology:  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  tech:        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  sports:      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  cultural:    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  culture:     'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  music:       'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  art:         'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80',
  workshop:    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  seminar:     'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  conference:  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
  graduation:  'https://images.unsplash.com/photo-1627556704302-624286467c65?w=800&q=80',
  competition: 'https://images.unsplash.com/photo-1562516155-e0c1ee44059b?w=800&q=80',
  meetup:      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  career:      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
  health:      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
  science:     'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80',
  food:        'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
  networking:  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
  leadership:  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
  drama:       'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&q=80',
  debate:      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
};

// Fallback pool — beautiful generic event images
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80',
];

export function getEventImage(event) {
  if (event?.image_url) return event.image_url;

  // Try category match
  const cat = (event?.category?.name || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (cat.includes(key)) return url;
  }

  // Try title keyword match
  const title = (event?.title || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (title.includes(key)) return url;
  }

  // Deterministic fallback based on event id
  const idx = (event?.id || 0) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[idx];
}

export function getCategoryColor(category) {
  const cat = (category?.name || '').toLowerCase();
  if (cat.includes('tech'))       return 'from-blue-600 to-cyan-500';
  if (cat.includes('sport'))      return 'from-green-600 to-emerald-500';
  if (cat.includes('cultur') || cat.includes('art') || cat.includes('music')) return 'from-purple-600 to-pink-500';
  if (cat.includes('academic') || cat.includes('seminar') || cat.includes('workshop')) return 'from-amber-600 to-orange-500';
  if (cat.includes('career') || cat.includes('business')) return 'from-teal-600 to-cyan-600';
  return 'from-pcps-blue to-pcps-blue-mid';
}

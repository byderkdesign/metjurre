// -----------------------------------------
// SPOTIFY → WEBFLOW CMS
// Haalt de afleveringen van de TWIcast op via de Spotify API en zet nieuwe
// afleveringen live in de Webflow-collectie "TWI Podcasts".
// Bestaande items worden niet aangepast; de match loopt via het Spotify-episode-ID
// in het veld "Link naar de podcast op Spotify".
//
// Omgevingsvariabelen:
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET  (Spotify developer-app)
//   WEBFLOW_API_TOKEN                         (Webflow site token met CMS lezen/schrijven)
//   SPOTIFY_SHOW_ID, WEBFLOW_COLLECTION_ID    (staan in de workflow)
//   DRY_RUN=1                                 (alleen tonen wat er zou gebeuren)
// -----------------------------------------

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  WEBFLOW_API_TOKEN,
  SPOTIFY_SHOW_ID = '2i8HAziYwroCJqkUB1dsvG',
  WEBFLOW_COLLECTION_ID = '680921a92a62c6ae6069f34c',
  DRY_RUN,
} = process.env;

const PODCAST_NAME = 'TWIcast';

export function episodeIdFromUrl(url) {
  const match = (url || '').match(/open\.spotify\.com\/episode\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

export function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  // Webflow toont "42:44 Min"; boven het uur worden het minuten in totaal
  return `${hours * 60 + minutes}:${seconds}`;
}

export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

// "Geschiedenis #7 - Waarom standaardisatie ..." → { nr: "#07", title: "Waarom standaardisatie ..." }
export function parseEpisodeName(name) {
  const match = name.match(/#\s?(\d+)(?:[-.](\d+))?/);
  const nr = match ? `#${match[1].padStart(2, '0')}${match[2] ? `-${match[2]}` : ''}` : null;
  const title = name.replace(/^.*?#\s?\d+(?:[-.]\d+)?\s*[-–—:|]\s*/, '').trim() || name.trim();
  return { nr, title };
}

export function toFieldData(episode) {
  const { nr, title } = parseEpisodeName(episode.name);
  const image = episode.images?.[0]?.url;
  return {
    name: title,
    slug: slugify(`${nr ? nr.replace('#', '') + '-' : ''}${title}`),
    'podcast-naam': PODCAST_NAME,
    'korte-beschrijving-van-de-podcast': title,
    'langere-beschrijving': (episode.description || '').trim() || null,
    'link-naar-de-podcast-op-spotify': episode.external_urls?.spotify,
    'aflevering-nummer': nr,
    lengte: formatDuration(episode.duration_ms),
    ...(image ? { thumbnail: { url: image, alt: title } } : {}),
  };
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${url} → ${res.status} ${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

async function getSpotifyToken() {
  const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const data = await request('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  return data.access_token;
}

async function getSpotifyEpisodes(token) {
  const episodes = [];
  let url = `https://api.spotify.com/v1/shows/${SPOTIFY_SHOW_ID}/episodes?market=NL&limit=50`;
  while (url) {
    const page = await request(url, { headers: { Authorization: `Bearer ${token}` } });
    episodes.push(...page.items.filter(Boolean));
    url = page.next;
  }
  return episodes;
}

async function getWebflowItems() {
  const items = [];
  let offset = 0;
  while (true) {
    const page = await request(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?limit=100&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_API_TOKEN}` } },
    );
    items.push(...page.items);
    offset += page.items.length;
    if (!page.items.length || offset >= page.pagination.total) break;
  }
  return items;
}

async function createLiveItem(fieldData) {
  return request(`https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items/live`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WEBFLOW_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ isArchived: false, isDraft: false, fieldData }),
  });
}

async function main() {
  const missing = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'WEBFLOW_API_TOKEN'].filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Ontbrekende geheimen: ${missing.join(', ')}`);

  const [episodes, items] = await Promise.all([getSpotifyToken().then(getSpotifyEpisodes), getWebflowItems()]);

  const known = new Set(items.map((item) => episodeIdFromUrl(item.fieldData['link-naar-de-podcast-op-spotify'])).filter(Boolean));
  const knownSlugs = new Set(items.map((item) => item.fieldData.slug));

  // Oudste eerst, zodat de nieuwste aflevering ook als laatste wordt aangemaakt
  const newEpisodes = episodes.filter((ep) => !known.has(ep.id)).reverse();

  console.log(`Spotify: ${episodes.length} afleveringen, Webflow: ${items.length} items, nieuw: ${newEpisodes.length}`);

  for (const episode of newEpisodes) {
    const fieldData = toFieldData(episode);
    if (knownSlugs.has(fieldData.slug)) fieldData.slug = `${fieldData.slug}-${episode.id.slice(0, 6).toLowerCase()}`;

    if (DRY_RUN) {
      console.log('[dry run] zou aanmaken:', JSON.stringify(fieldData));
      continue;
    }
    await createLiveItem(fieldData);
    knownSlugs.add(fieldData.slug);
    console.log(`Aangemaakt: ${fieldData['aflevering-nummer'] || ''} ${fieldData.name}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

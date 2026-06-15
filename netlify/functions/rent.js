/* ============================================================
   Netlify Function: rent + demographics from the U.S. Census ACS 5-year.
   Free, official. A free CENSUS_API_KEY env var avoids rate limits.

   Lookups:  ?state=NY  ·  ?zip=11949  ·  ?city=Manorville&state=NY  ·  ?lat=..&lng=..
   Returns:  current median + by-bedroom, multi-year rent history with a
   trend forecast, population change %, and resident turnover (move-in) data.

   Every sub-request is independent: if one Census table is missing for a
   geography, that section is simply omitted instead of failing the whole call.
   ============================================================ */

const STATE_FIPS = {
  AL:"01",AK:"02",AZ:"04",AR:"05",CA:"06",CO:"08",CT:"09",DE:"10",DC:"11",
  FL:"12",GA:"13",HI:"15",ID:"16",IL:"17",IN:"18",IA:"19",KS:"20",KY:"21",
  LA:"22",ME:"23",MD:"24",MA:"25",MI:"26",MN:"27",MS:"28",MO:"29",MT:"30",
  NE:"31",NV:"32",NH:"33",NJ:"34",NM:"35",NY:"36",NC:"37",ND:"38",OH:"39",
  OK:"40",OR:"41",PA:"42",RI:"44",SC:"45",SD:"46",TN:"47",TX:"48",UT:"49",
  VT:"50",VA:"51",WA:"53",WV:"54",WI:"55",WY:"56",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

const LATEST = 2023;                       // newest ACS 5-year release
const HIST_YEARS = [2013, 2015, 2017, 2019, 2021, 2023]; // points for the trend
const FORECAST_YEARS = [2024, 2025, 2026]; // simple projection
const KEY = process.env.CENSUS_API_KEY ? `&key=${process.env.CENSUS_API_KEY}` : "";

const toNum = (v) => { const n = parseInt(v, 10); return Number.isNaN(n) || n < 0 ? null : n; };

async function censusGet(year, vars, geoQuery) {
  const url = `https://api.census.gov/data/${year}/acs/acs5?get=${vars}&${geoQuery}${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Census ${year} ${res.status}`);
  const data = await res.json();
  if (!data || data.length < 2) throw new Error("empty");
  const [head, ...rows] = data;
  return { head, rows };
}

/* Resolve the geography to a reusable "for/in" query string + display name. */
async function resolveGeo(p) {
  // lat/lng -> county via the Census geocoder
  if (p.lat && p.lng) {
    const geoUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${p.lng}&y=${p.lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties&format=json`;
    const r = await fetch(geoUrl);
    if (!r.ok) throw new Error("Geocoder failed");
    const j = await r.json();
    const counties = j && j.result && j.result.geographies && j.result.geographies.Counties;
    if (!counties || !counties.length) throw new Error("No county for location");
    const c = counties[0];
    return { geoQuery: `for=county:${c.COUNTY}&in=state:${c.STATE}`, name: `${c.BASENAME} County, ${c.STATE}` };
  }
  // zip -> ZCTA (queried nationally for 2020+ ACS)
  if (p.zip && /^\d{5}$/.test(p.zip)) {
    return { geoQuery: `for=zip%20code%20tabulation%20area:${p.zip}`, name: `ZIP ${p.zip}` };
  }
  // city + state -> find the matching place FIPS
  if (p.city && p.state) {
    const fips = STATE_FIPS[String(p.state).toUpperCase()];
    if (!fips) throw new Error("Unknown state");
    const { head, rows } = await censusGet(LATEST, "NAME", `for=place:*&in=state:${fips}`);
    const nameIdx = head.indexOf("NAME");
    const placeIdx = head.indexOf("place");
    const q = p.city.toLowerCase();
    const match = rows.find((r) => r[nameIdx].toLowerCase().startsWith(q));
    if (!match) return null;
    return { geoQuery: `for=place:${match[placeIdx]}&in=state:${fips}`, name: match[nameIdx] };
  }
  // state
  if (p.state) {
    const fips = STATE_FIPS[String(p.state).toUpperCase()];
    if (!fips) throw new Error("Unknown state");
    return { geoQuery: `for=state:${fips}`, name: null };
  }
  return null;
}

/* simple linear regression -> slope/intercept for forecasting */
function linregForecast(history) {
  const pts = history.filter((h) => h.median != null);
  if (pts.length < 2) return [];
  const n = pts.length;
  const sx = pts.reduce((s, p) => s + p.year, 0);
  const sy = pts.reduce((s, p) => s + p.median, 0);
  const sxy = pts.reduce((s, p) => s + p.year * p.median, 0);
  const sxx = pts.reduce((s, p) => s + p.year * p.year, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const last = pts[pts.length - 1].median;
  return FORECAST_YEARS.map((y) => {
    const lin = slope * y + intercept;
    // blend toward the regression line but anchor to last actual to avoid wild swings
    const val = Math.max(0, Math.round(lin / 10) * 10);
    return { year: y, median: val };
  }).filter((f) => f.median > 0 && Math.abs(f.median - last) < last * 1.5);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  const p = event.queryStringParameters || {};

  try {
    let geo;
    try { geo = await resolveGeo(p); }
    catch (e) { return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: String(e.message || e) }) }; }
    if (!geo) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Location not found" }) };

    const { geoQuery } = geo;

    // 1) Current rent + by-bedroom (the must-have)
    const mainVars = "NAME,B25064_001E,B25031_002E,B25031_003E,B25031_004E,B25031_005E";
    const mainP = censusGet(LATEST, mainVars, geoQuery);

    // 2) Multi-year rent + population (for history chart + population change)
    const histP = HIST_YEARS.map((y) =>
      censusGet(y, "B25064_001E,B01003_001E", geoQuery)
        .then(({ head, rows }) => {
          const at = (k) => head.indexOf(k);
          return { year: y, median: toNum(rows[0][at("B25064_001E")]), pop: toNum(rows[0][at("B01003_001E")]) };
        })
        .catch(() => null)
    );

    // 3) Geographic mobility / turnover (moved in the past year)
    const mobVars = "B07003_001E,B07003_004E,B07003_007E,B07003_010E,B07003_013E,B07003_016E";
    const mobP = censusGet(LATEST, mobVars, geoQuery)
      .then(({ head, rows }) => {
        const at = (k) => head.indexOf(k);
        const total = toNum(rows[0][at("B07003_001E")]);
        const same = toNum(rows[0][at("B07003_004E")]);
        const withinCounty = toNum(rows[0][at("B07003_007E")]);
        const diffCounty = toNum(rows[0][at("B07003_010E")]);
        const diffState = toNum(rows[0][at("B07003_013E")]);
        const abroad = toNum(rows[0][at("B07003_016E")]);
        if (!total || same == null) return null;
        const movedIn = total - same;
        return {
          total, movedIn,
          movedInPct: Math.round((movedIn / total) * 1000) / 10,
          fromOutsidePct: Math.round(((diffCounty + diffState + abroad) || 0) / total * 1000) / 10,
          withinCounty, diffCounty, diffState, abroad,
        };
      })
      .catch(() => null);

    const [main, histRaw, mobility] = await Promise.all([mainP, histP.length ? Promise.all(histP) : [], mobP]);

    const at = (k) => main.head.indexOf(k);
    const median = toNum(main.rows[0][at("B25064_001E")]);
    if (!median) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "No rent data for that location" }) };

    const history = (histRaw || []).filter((h) => h && h.median != null).sort((a, b) => a.year - b.year);
    const forecast = linregForecast(history);

    // population change from the history series
    let population = null;
    const popPts = (histRaw || []).filter((h) => h && h.pop != null).sort((a, b) => a.year - b.year);
    if (popPts.length >= 2) {
      const latest = popPts[popPts.length - 1];
      const prev = popPts[popPts.length - 2];
      const yearsApart = latest.year - prev.year || 1;
      const totalPct = ((latest.value || latest.pop) - prev.pop) / prev.pop * 100;
      population = {
        year: latest.year,
        value: latest.pop,
        annualPct: Math.round((totalPct / yearsApart) * 10) / 10,
        spanPct: Math.round(totalPct * 10) / 10,
        spanYears: yearsApart,
      };
    }

    const body = {
      source: "census",
      year: String(LATEST),
      name: geo.name || main.rows[0][at("NAME")],
      median,
      byBed: {
        studio: toNum(main.rows[0][at("B25031_002E")]),
        br1: toNum(main.rows[0][at("B25031_003E")]),
        br2: toNum(main.rows[0][at("B25031_004E")]),
        br3: toNum(main.rows[0][at("B25031_005E")]),
      },
      history,
      forecast,
      population,
      mobility,
    };
    return { statusCode: 200, headers: CORS, body: JSON.stringify(body) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: String((err && err.message) || err) }) };
  }
};

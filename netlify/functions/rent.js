/* ============================================================
   Netlify Function: live median gross rent from the U.S. Census
   American Community Survey (ACS 5-year). Free, official, no key
   required for low volume (a free key avoids rate limits — set the
   CENSUS_API_KEY environment variable in Netlify to use one).

   Request:  /.netlify/functions/rent?state=NY[&year=2023]
   Response: { source, year, name, median, byBed:{studio,br1,br2,br3} }
   ============================================================ */

const STATE_FIPS = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09",
  DE: "10", DC: "11", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17",
  IN: "18", IA: "19", KS: "20", KY: "21", LA: "22", ME: "23", MD: "24",
  MA: "25", MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31",
  NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38",
  OH: "39", OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46",
  TN: "47", TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54",
  WI: "55", WY: "56",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };

  const params = event.queryStringParameters || {};
  const stateAbbr = String(params.state || "").toUpperCase();
  const year = String(params.year || "2023");
  const fips = STATE_FIPS[stateAbbr];

  if (!fips) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Provide a valid ?state= USPS code, e.g. state=NY" }) };
  }

  // B25064 = median gross rent; B25031 = median gross rent by bedrooms
  const vars = "NAME,B25064_001E,B25031_002E,B25031_003E,B25031_004E,B25031_005E";
  let url = `https://api.census.gov/data/${year}/acs/acs5?get=${vars}&for=state:${fips}`;
  if (process.env.CENSUS_API_KEY) url += `&key=${process.env.CENSUS_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Census API returned ${res.status}`);
    const data = await res.json();
    const [head, row] = data;
    const at = (k) => head.indexOf(k);
    const num = (k) => {
      const v = parseInt(row[at(k)], 10);
      return Number.isNaN(v) || v < 0 ? null : v;
    };
    const body = {
      source: "census",
      year,
      name: row[at("NAME")],
      median: num("B25064_001E"),
      byBed: {
        studio: num("B25031_002E"),
        br1: num("B25031_003E"),
        br2: num("B25031_004E"),
        br3: num("B25031_005E"),
      },
    };
    return { statusCode: 200, headers: CORS, body: JSON.stringify(body) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: String((err && err.message) || err) }) };
  }
};

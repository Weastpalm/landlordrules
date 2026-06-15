/* ============================================================
   Reference rent data — approximate median gross rent by location.
   Figures are rounded reference estimates (ACS-era) for offline/demo
   use and should be VERIFIED. The live Census lookup (Netlify function
   at /.netlify/functions/rent) returns current official numbers when
   deployed; this dataset is the fallback so the feature always works.
   ============================================================ */

const r10 = (n) => Math.round(n / 10) * 10;
const mk = (median) => ({ median, avg: r10(median * 1.13) });

export const NATIONAL = mk(1400);

// keyed by USPS state abbreviation
export const STATE_RENT = {
  AL: mk(950),  AK: mk(1290), AZ: mk(1350), AR: mk(870),  CA: mk(1900),
  CO: mk(1620), CT: mk(1420), DE: mk(1300), FL: mk(1500), GA: mk(1280),
  HI: mk(1950), ID: mk(1150), IL: mk(1200), IN: mk(960),  IA: mk(910),
  KS: mk(960),  KY: mk(900),  LA: mk(960),  ME: mk(1100), MD: mk(1600),
  MA: mk(1700), MI: mk(1050), MN: mk(1230), MS: mk(880),  MO: mk(990),
  MT: mk(1010), NE: mk(960),  NV: mk(1420), NH: mk(1430), NJ: mk(1620),
  NM: mk(1000), NY: mk(1500), NC: mk(1180), ND: mk(900),  OH: mk(960),
  OK: mk(900),  OR: mk(1420), PA: mk(1100), RI: mk(1250), SC: mk(1120),
  SD: mk(870),  TN: mk(1120), TX: mk(1300), UT: mk(1300), VT: mk(1120),
  VA: mk(1470), WA: mk(1650), WV: mk(810),  WI: mk(1010), WY: mk(920),
};

// a selection of larger markets for the location search
export const CITY_RENT = [
  { city: "New York", state: "NY", ...mk(1750) },
  { city: "Buffalo", state: "NY", ...mk(950) },
  { city: "Rochester", state: "NY", ...mk(1050) },
  { city: "Albany", state: "NY", ...mk(1200) },
  { city: "Syracuse", state: "NY", ...mk(960) },
  { city: "Plattsburgh", state: "NY", ...mk(1010) },
  { city: "Los Angeles", state: "CA", ...mk(1760) },
  { city: "San Diego", state: "CA", ...mk(2010) },
  { city: "San Francisco", state: "CA", ...mk(2180) },
  { city: "San Jose", state: "CA", ...mk(2470) },
  { city: "Sacramento", state: "CA", ...mk(1650) },
  { city: "Chicago", state: "IL", ...mk(1350) },
  { city: "Houston", state: "TX", ...mk(1250) },
  { city: "San Antonio", state: "TX", ...mk(1150) },
  { city: "Dallas", state: "TX", ...mk(1400) },
  { city: "Austin", state: "TX", ...mk(1550) },
  { city: "Phoenix", state: "AZ", ...mk(1450) },
  { city: "Philadelphia", state: "PA", ...mk(1200) },
  { city: "Jacksonville", state: "FL", ...mk(1350) },
  { city: "Miami", state: "FL", ...mk(1700) },
  { city: "Columbus", state: "OH", ...mk(1150) },
  { city: "Seattle", state: "WA", ...mk(1900) },
  { city: "Denver", state: "CO", ...mk(1700) },
  { city: "Boston", state: "MA", ...mk(2000) },
  { city: "Nashville", state: "TN", ...mk(1450) },
  { city: "Portland", state: "OR", ...mk(1550) },
  { city: "Las Vegas", state: "NV", ...mk(1400) },
  { city: "Atlanta", state: "GA", ...mk(1450) },
  { city: "Minneapolis", state: "MN", ...mk(1300) },
  { city: "Kansas City", state: "MO", ...mk(1100) },
  { city: "Charlotte", state: "NC", ...mk(1400) },
  { city: "Indianapolis", state: "IN", ...mk(1050) },
  { city: "Detroit", state: "MI", ...mk(1010) },
  { city: "Washington", state: "DC", ...mk(1750) },
  { city: "Baltimore", state: "MD", ...mk(1250) },
  { city: "Milwaukee", state: "WI", ...mk(1010) },
  { city: "Salt Lake City", state: "UT", ...mk(1300) },
];

// Model a by-bedroom breakdown from an overall median (used when a source
// doesn't return per-bedroom figures). Live Census data overrides this.
export function modelByBedroom(median) {
  if (!median) return null;
  return {
    studio: r10(median * 0.82),
    br1: r10(median * 0.9),
    br2: r10(median * 1.12),
    br3: r10(median * 1.36),
  };
}

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, User, Search, FileText, Scale, ChevronDown, Printer, Copy, Check,
  ArrowRight, ShieldCheck, ExternalLink, RefreshCw, MapPin, Download, X,
  ClipboardList, ClipboardCheck, Banknote, Receipt, AlertTriangle, PawPrint, FileSignature,
  TrendingUp, KeyRound, Users, Building2, Wallet, Wrench, Lightbulb, Calendar,
  ShieldAlert, CheckCircle2, BookOpen, BadgeCheck, LineChart
} from "lucide-react";
import { STATE_RENT, CITY_RENT, NATIONAL, modelByBedroom, zipToState } from "./rentData";

/* ============================================================
   LandlordRules.com
   Single-file React app. Drops into src/App.jsx of the Vite project.
   ------------------------------------------------------------
   IMPORTANT: The state law data below is a researched STARTING
   POINT and must be verified against each state's current statute
   before you rely on it publicly. Laws change. See the README.
   ============================================================ */

const serif = { fontFamily: "'Source Serif 4','Lora',Georgia,'Times New Roman',serif" };
const WRAP = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const NAVY = "#0B1F3A";
const card = "rounded-2xl border border-[#ECE6DA] bg-white";
const HERO = "bg-gradient-to-br from-[#0B1F3A] via-[#12305F] to-[#1C4B8A]";

/* ---------- State law data (verify before publishing) ---------- */
const JUSTIA = (slug) => `https://law.justia.com/codes/${slug}/`;
const STATES = [
  { name: "Alabama", abbr: "AL", deposit: "1 month's rent", entry: "2 days' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("alabama") },
  { name: "Alaska", abbr: "AK", deposit: "2 months (1 if rent > $2,000/mo)", entry: "24 hours' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("alaska") },
  { name: "Arizona", abbr: "AZ", deposit: "1.5 months' rent", entry: "2 days' notice", vacate: "30 days", lateFee: "Must be reasonable", statute: "https://www.azleg.gov/arsDetail/?title=33" },
  { name: "Arkansas", abbr: "AR", deposit: "2 months (small landlords exempt)", entry: "No statute (reasonable notice)", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("arkansas") },
  { name: "California", abbr: "CA", deposit: "1 month (2 for small landlords)", entry: "24 hours' written notice", vacate: "30 days (60 if tenant ≥1 yr)", lateFee: "Must be reasonable", statute: "https://leginfo.legislature.ca.gov/faces/codes.xhtml" },
  { name: "Colorado", abbr: "CO", deposit: "No statutory limit", entry: "No statute (reasonable notice)", vacate: "21 days", lateFee: "Capped: greater of $50 or 5%", statute: JUSTIA("colorado") },
  { name: "Connecticut", abbr: "CT", deposit: "2 months (1 month if 62+)", entry: "Reasonable notice", vacate: "~30 days (rent interval)", lateFee: "9-day grace period", statute: JUSTIA("connecticut") },
  { name: "Delaware", abbr: "DE", deposit: "1 month (1-yr+ lease)", entry: "48 hours' notice", vacate: "60 days", lateFee: "Capped at 5%; 5-day grace", statute: JUSTIA("delaware") },
  { name: "Florida", abbr: "FL", deposit: "No statutory limit", entry: "12 hours' notice (repairs)", vacate: "30 days (month-to-month)", lateFee: "No statutory cap", statute: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0083/0083.html" },
  { name: "Georgia", abbr: "GA", deposit: "No statutory limit", entry: "No statute (reasonable notice)", vacate: "Landlord 60 / tenant 30 days", lateFee: "No statutory cap", statute: JUSTIA("georgia") },
  { name: "Hawaii", abbr: "HI", deposit: "1 month's rent", entry: "2 days' notice", vacate: "Landlord 45 / tenant 28 days", lateFee: "No statutory cap", statute: JUSTIA("hawaii") },
  { name: "Idaho", abbr: "ID", deposit: "No statutory limit", entry: "No statute (reasonable notice)", vacate: "30 days (one rental period)", lateFee: "No statutory cap", statute: JUSTIA("idaho") },
  { name: "Illinois", abbr: "IL", deposit: "No statewide limit (local rules vary)", entry: "No statute (~24h common)", vacate: "30 days", lateFee: "No statewide cap (local rules vary)", statute: JUSTIA("illinois") },
  { name: "Indiana", abbr: "IN", deposit: "No statutory limit", entry: "Reasonable notice", vacate: "30 days (one month)", lateFee: "No statutory cap", statute: JUSTIA("indiana") },
  { name: "Iowa", abbr: "IA", deposit: "2 months' rent", entry: "24 hours' notice", vacate: "30 days", lateFee: "Capped (rent-based tiers)", statute: JUSTIA("iowa") },
  { name: "Kansas", abbr: "KS", deposit: "1 month (1.5 furnished)", entry: "Reasonable notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("kansas") },
  { name: "Kentucky", abbr: "KY", deposit: "No statutory limit", entry: "2 days' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("kentucky") },
  { name: "Louisiana", abbr: "LA", deposit: "No statutory limit", entry: "No statute (reasonable notice)", vacate: "10 days (month-to-month)", lateFee: "No statutory cap", statute: JUSTIA("louisiana") },
  { name: "Maine", abbr: "ME", deposit: "2 months' rent", entry: "24 hours' notice", vacate: "30 days", lateFee: "Capped at 4%; 15-day grace", statute: JUSTIA("maine") },
  { name: "Maryland", abbr: "MD", deposit: "1 month (since Oct 2024)", entry: "No statute (reasonable notice)", vacate: "30 days (varies by county)", lateFee: "Capped at 5%", statute: JUSTIA("maryland") },
  { name: "Massachusetts", abbr: "MA", deposit: "1 month's rent", entry: "No statute (reasonable notice)", vacate: "~30 days (rent interval)", lateFee: "30-day grace before fee", statute: JUSTIA("massachusetts") },
  { name: "Michigan", abbr: "MI", deposit: "1.5 months' rent", entry: "No statute (reasonable notice)", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("michigan") },
  { name: "Minnesota", abbr: "MN", deposit: "No statutory limit", entry: "Reasonable notice", vacate: "~30 days (rent interval)", lateFee: "Capped at 8%", statute: JUSTIA("minnesota") },
  { name: "Mississippi", abbr: "MS", deposit: "No statutory limit", entry: "No statute (reasonable notice)", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("mississippi") },
  { name: "Missouri", abbr: "MO", deposit: "2 months' rent", entry: "No statute (reasonable notice)", vacate: "30 days (one rental period)", lateFee: "No statutory cap", statute: JUSTIA("missouri") },
  { name: "Montana", abbr: "MT", deposit: "No statutory limit", entry: "24 hours' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("montana") },
  { name: "Nebraska", abbr: "NE", deposit: "1 month (+0.25 mo pet deposit)", entry: "24 hours' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("nebraska") },
  { name: "Nevada", abbr: "NV", deposit: "3 months' rent", entry: "24 hours' notice", vacate: "30 days", lateFee: "Capped at 5%", statute: JUSTIA("nevada") },
  { name: "New Hampshire", abbr: "NH", deposit: "1 month or $100 (greater)", entry: "Adequate/reasonable notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("new-hampshire") },
  { name: "New Jersey", abbr: "NJ", deposit: "1.5 months' rent", entry: "1 day's notice (reasonable)", vacate: "30 days (cause required)", lateFee: "5-day grace (seniors/some)", statute: JUSTIA("new-jersey") },
  { name: "New Mexico", abbr: "NM", deposit: "1 month (<1-yr lease)", entry: "24 hours' notice", vacate: "30 days", lateFee: "Capped at 10%", statute: JUSTIA("new-mexico") },
  { name: "New York", abbr: "NY", deposit: "1 month's rent", entry: "No statute (reasonable notice)", vacate: "30 / 60 / 90 days (by tenancy length)", lateFee: "$50 or 5% (lesser); 5-day grace", statute: "https://www.nysenate.gov/legislation/laws/RPP" },
  { name: "North Carolina", abbr: "NC", deposit: "1.5 months (month-to-month)", entry: "No statute (reasonable notice)", vacate: "7 days (month-to-month)", lateFee: "Greater of $15 or 5%", statute: JUSTIA("north-carolina") },
  { name: "North Dakota", abbr: "ND", deposit: "1 month (more for pets)", entry: "Reasonable notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("north-dakota") },
  { name: "Ohio", abbr: "OH", deposit: "No statutory limit", entry: "24 hours' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("ohio") },
  { name: "Oklahoma", abbr: "OK", deposit: "No statutory limit", entry: "1 day's notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("oklahoma") },
  { name: "Oregon", abbr: "OR", deposit: "No statutory limit", entry: "24 hours' notice", vacate: "30 days (1st yr); 60+ w/ cause after", lateFee: "Reasonable (flat or 5% rules)", statute: JUSTIA("oregon") },
  { name: "Pennsylvania", abbr: "PA", deposit: "2 months (yr 1), 1 month (after)", entry: "No statute (reasonable notice)", vacate: "15–30 days (per lease)", lateFee: "No statutory cap", statute: JUSTIA("pennsylvania") },
  { name: "Rhode Island", abbr: "RI", deposit: "1 month's rent", entry: "2 days' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("rhode-island") },
  { name: "South Carolina", abbr: "SC", deposit: "No statutory limit", entry: "24 hours' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("south-carolina") },
  { name: "South Dakota", abbr: "SD", deposit: "1 month's rent", entry: "24 hours' notice", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("south-dakota") },
  { name: "Tennessee", abbr: "TN", deposit: "No statutory limit", entry: "24 hours' notice (URLTA)", vacate: "30 days", lateFee: "Capped at 10%; 5-day grace", statute: JUSTIA("tennessee") },
  { name: "Texas", abbr: "TX", deposit: "No statutory limit", entry: "No statute (reasonable notice)", vacate: "30 days (month-to-month)", lateFee: "Reasonable (safe harbor ~10–12%)", statute: "https://statutes.capitol.texas.gov/Docs/PR/htm/PR.92.htm" },
  { name: "Utah", abbr: "UT", deposit: "No statutory limit", entry: "24 hours' notice", vacate: "15 days (month-to-month)", lateFee: "No statutory cap", statute: JUSTIA("utah") },
  { name: "Vermont", abbr: "VT", deposit: "No statutory limit", entry: "48 hours' notice", vacate: "30 days (longer w/o cause)", lateFee: "No statutory cap", statute: JUSTIA("vermont") },
  { name: "Virginia", abbr: "VA", deposit: "2 months' rent", entry: "24 hours' notice", vacate: "30 days", lateFee: "Capped at 10%", statute: JUSTIA("virginia") },
  { name: "Washington", abbr: "WA", deposit: "No statutory limit", entry: "2 days' notice", vacate: "20 days (tenant); cause for landlord", lateFee: "No statewide cap (some cities cap)", statute: "https://app.leg.wa.gov/RCW/default.aspx?cite=59.18" },
  { name: "West Virginia", abbr: "WV", deposit: "No statutory limit", entry: "No statute (reasonable notice)", vacate: "30 days (one period)", lateFee: "No statutory cap", statute: JUSTIA("west-virginia") },
  { name: "Wisconsin", abbr: "WI", deposit: "No statutory limit", entry: "12 hours' advance notice", vacate: "28 days (month-to-month)", lateFee: "No statutory cap", statute: JUSTIA("wisconsin") },
  { name: "Wyoming", abbr: "WY", deposit: "No statutory limit", entry: "No statute (reasonable notice)", vacate: "30 days", lateFee: "No statutory cap", statute: JUSTIA("wyoming") },
];
const getState = (abbr) => STATES.find((s) => s.abbr === abbr) || STATES[0];
const HUD = "https://www.hud.gov/topics/rental_assistance/tenantrights";

/* ---------- Tenant Q&A (20 most-searched) ---------- */
// field: pulls the selected state's value from STATES (entry/deposit/vacate/lateFee)
const QA = [
  { id: "enter-no-notice", q: "Can my landlord enter without notice?", v: "DEPENDS", field: "entry",
    a: "In most states a landlord must give advance notice — often 24 to 48 hours — before entering, except in a genuine emergency. A handful of states have no statute and only require “reasonable” notice. Your lease can set stricter rules than the state minimum." },
  { id: "keep-full-deposit", q: "Can my landlord keep my full security deposit?", v: "DEPENDS", field: "deposit",
    a: "Only for legitimate reasons — unpaid rent, damage beyond normal wear and tear, or other lease breaches — and they usually must give you an itemized statement. They cannot keep it for ordinary wear or as a blanket “cleaning fee.”" },
  { id: "raise-rent-midlease", q: "Can my landlord raise rent mid-lease?", v: "NO", law: { label: "HUD — Tenant Rights", url: HUD },
    a: "During a fixed-term lease the rent is locked at the agreed amount unless the lease specifically allows an increase. A landlord can only raise it when the lease renews, or in a month-to-month tenancy — and only with proper notice." },
  { id: "evict-no-court", q: "Can my landlord evict me without going to court?", v: "NO", law: { label: "HUD — Tenant Rights", url: HUD },
    a: "Almost everywhere, a landlord must file a formal eviction case and obtain a court order; only a sheriff or marshal can physically remove a tenant. “Self-help” evictions — changing locks or removing your belongings — are illegal." },
  { id: "shut-off-utilities", q: "Can my landlord shut off my utilities to force me out?", v: "NO", law: { label: "HUD — Tenant Rights", url: HUD },
    a: "Deliberately cutting off heat, water, or electricity to push a tenant out is illegal in virtually every state and can expose the landlord to penalties. Utilities may only be interrupted for genuine, necessary repairs." },
  { id: "wear-and-tear", q: "Can my landlord keep my deposit for normal wear and tear?", v: "NO", field: "deposit",
    a: "Normal wear — faded paint, light carpet wear, small nail holes — is the cost of doing business and cannot be deducted. Deductions are only allowed for actual damage beyond ordinary use of the home." },
  { id: "raise-rent-no-notice", q: "Can my landlord raise my rent without notice?", v: "NO", field: "vacate",
    a: "Rent increases require advance written notice — commonly 30 days, and longer for larger increases or longer tenancies in some states. The exact notice period depends on your state and tenancy type." },
  { id: "refuse-return-deposit", q: "Can my landlord refuse to return my deposit?", v: "DEPENDS", field: "deposit",
    a: "A landlord must return it, minus lawful deductions, within your state’s deadline — usually 14 to 60 days — with an itemized list of any charges. Missing the deadline can forfeit their right to keep any of it, sometimes with penalties." },
  { id: "enter-not-home", q: "Can my landlord enter when I'm not home?", v: "DEPENDS", field: "entry",
    a: "Yes, if they gave proper notice and enter for a lawful reason such as repairs or a scheduled showing — your presence isn’t required. Entering without notice, outside emergencies, is not allowed." },
  { id: "evict-for-complaining", q: "Can my landlord evict me for complaining about repairs?", v: "NO", law: { label: "HUD — Tenant Rights", url: HUD },
    a: "Retaliatory eviction — punishing you for requesting repairs or reporting code violations — is illegal in most states. An eviction filed shortly after a complaint can be challenged in court as retaliation." },
  { id: "any-late-fee", q: "Can my landlord charge any late fee they want?", v: "DEPENDS", field: "lateFee",
    a: "Late fees must generally be “reasonable,” and several states cap them — often around 5 to 10% of rent — and require a grace period. A fee that works as a penalty rather than a real estimate of cost may be unenforceable." },
  { id: "refuse-repairs", q: "Can my landlord refuse to make repairs?", v: "NO", law: { label: "HUD — Tenant Rights", url: HUD },
    a: "Under the implied warranty of habitability, landlords must keep rentals safe and livable — working heat, water, and no serious hazards. If they don’t, you may have remedies like repair-and-deduct or rent withholding, depending on your state." },
  { id: "deposit-break-lease", q: "Can my landlord keep my deposit if I break my lease?", v: "DEPENDS", field: "deposit",
    a: "They can deduct unpaid rent and documented losses, but most states require them to try to re-rent the unit rather than charge you for the entire remaining lease. Anything beyond their actual loss generally isn’t allowed." },
  { id: "raise-rent-renewal", q: "Can my landlord raise rent at lease renewal?", v: "YES", field: "vacate",
    a: "At the end of a lease term, a landlord can generally raise the rent for the next term as long as they give the required notice and aren’t in a rent-controlled area. You’re free to accept, negotiate, or move out." },
  { id: "evict-in-winter", q: "Can my landlord evict me in the winter?", v: "DEPENDS", law: { label: "HUD — Tenant Rights", url: HUD },
    a: "In most places there’s no seasonal ban — evictions can proceed year-round through the courts. A few cities and states limit cold-weather utility shutoffs or lockouts, but the legal eviction process itself usually continues." },
  { id: "enter-for-showings", q: "Can my landlord enter to show the apartment to new tenants?", v: "DEPENDS", field: "entry",
    a: "Yes, showings are a valid reason to enter, but the landlord still has to give the notice your state requires and enter at reasonable times. Endless or harassing visits can cross the line into a violation." },
  { id: "pet-fees", q: "Can my landlord charge extra pet fees or deposits?", v: "DEPENDS", law: { label: "HUD — Assistance Animals", url: HUD },
    a: "Usually yes — landlords can charge pet rent, pet deposits, or pet fees, though some states limit the amount. Service animals and emotional-support animals are different: under fair-housing rules they aren’t “pets,” and pet fees generally can’t be charged for them." },
  { id: "change-locks", q: "Can my landlord change the locks to get me out?", v: "NO", law: { label: "HUD — Tenant Rights", url: HUD },
    a: "Locking a tenant out without a court order is an illegal “self-help” eviction nearly everywhere and can make the landlord liable for damages. Only law enforcement, after a court judgment, can remove you." },
  { id: "charge-painting", q: "Can my landlord charge me for repainting after I move out?", v: "DEPENDS", field: "deposit",
    a: "Not for normal fading or routine repainting between tenants — that’s ordinary wear. They can charge if you caused damage beyond normal use, such as unapproved paint colors or holes needing extra repair." },
  { id: "deny-section-8", q: "Can my landlord refuse my Section 8 voucher?", v: "DEPENDS", law: { label: "HUD — Housing Choice Vouchers", url: HUD },
    a: "It depends where you live: many states and cities have “source of income” laws that ban rejecting tenants just for using a housing voucher, while others still allow it. Check both your state and city rules." },
];

/* ---------- FAQ (10 most-searched, shared) ---------- */
const FAQ = [
  { q: "How much notice does a landlord have to give before entering?", a: "Most states require 24 to 48 hours’ advance notice except in emergencies; some have no statute and only require “reasonable” notice. Always check your lease and your state’s specific rule." },
  { q: "How long does a landlord have to return a security deposit?", a: "Typically 14 to 60 days after move-out, depending on the state, along with an itemized statement of any deductions. Missing the deadline can cost the landlord the right to keep any of it." },
  { q: "What counts as normal wear and tear?", a: "The gradual, expected deterioration from ordinary living — faded paint, worn carpet, small nail holes. It is not damage, so it cannot be deducted from a deposit." },
  { q: "Can a landlord evict a tenant without a court order?", a: "No. A landlord must go through the formal court eviction process, and only law enforcement can remove a tenant. Lockouts and utility shutoffs are illegal." },
  { q: "What is the implied warranty of habitability?", a: "A legal rule requiring landlords to keep rentals safe and livable — heat, water, working plumbing, and no serious hazards. If a landlord fails, tenants usually have remedies under state law." },
  { q: "How much can a landlord charge for a security deposit?", a: "It varies widely: some states cap it at one or two months’ rent, while others set no limit at all. Check your state’s specific cap before paying." },
  { q: "Can a landlord raise the rent during a lease?", a: "Not during a fixed-term lease unless the lease allows it. Increases generally apply only at renewal or in month-to-month tenancies, with the required notice." },
  { q: "What is a notice to vacate?", a: "A written notice ending a tenancy and stating the move-out date, used by either a landlord or a tenant. The required lead time — often 30 to 60 days — depends on the state and tenancy type." },
  { q: "Can a landlord keep a deposit for cleaning?", a: "Only for cleaning beyond normal wear, not routine turnover cleaning. Many states simply require the home to be returned in its original condition, minus ordinary use." },
  { q: "What's the difference between an eviction notice and an eviction?", a: "An eviction notice is a warning that starts the process and gives a chance to fix the issue or move. An actual eviction requires a court judgment and is carried out by law enforcement." },
];

const NOTICE_TYPES = [
  { id: "late-rent", label: "Late Rent Warning" },
  { id: "lease-violation", label: "Lease Violation Notice" },
  { id: "notice-to-vacate", label: "Notice to Vacate (Landlord)" },
  { id: "move-out", label: "Move-Out Notice (Tenant)" },
];

/* ============================================================
   Illustrations (inline SVG — no external assets)
   ============================================================ */
function IllustrationHouse({ className = "" }) {
  return (
    <svg viewBox="0 0 440 340" className={className} role="img" aria-label="Illustration of a home">
      <circle cx="220" cy="162" r="160" fill="#EAF2FF" />
      <circle cx="350" cy="74" r="24" fill="#F2C14E" />
      <path d="M0 286 Q220 250 440 286 L440 340 L0 340 Z" fill="#D7EFE3" />
      <path d="M0 300 Q220 272 440 300 L440 340 L0 340 Z" fill="#2F9E78" opacity="0.85" />
      <rect x="74" y="158" width="104" height="120" rx="6" fill="#2C6BBE" />
      <polygon points="64,160 126,112 188,160" fill="#1E4E8C" />
      <rect x="98" y="186" width="26" height="26" rx="3" fill="#BFE0F5" />
      <rect x="132" y="186" width="26" height="26" rx="3" fill="#BFE0F5" />
      <rect x="176" y="150" width="158" height="128" rx="8" fill="#FFFFFF" stroke="#0B1F3A" strokeWidth="3.5" />
      <rect x="318" y="108" width="16" height="34" rx="2" fill="#B5891F" />
      <polygon points="166,152 255,94 344,152" fill="#C9A227" stroke="#0B1F3A" strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="196" y="176" width="36" height="32" rx="3" fill="#BFE0F5" stroke="#0B1F3A" strokeWidth="3" />
      <line x1="214" y1="176" x2="214" y2="208" stroke="#0B1F3A" strokeWidth="2" />
      <rect x="278" y="176" width="36" height="32" rx="3" fill="#BFE0F5" stroke="#0B1F3A" strokeWidth="3" />
      <line x1="296" y1="176" x2="296" y2="208" stroke="#0B1F3A" strokeWidth="2" />
      <rect x="238" y="216" width="36" height="62" rx="3" fill="#0B1F3A" />
      <circle cx="266" cy="248" r="3" fill="#C9A227" />
      <rect x="392" y="210" width="12" height="70" rx="4" fill="#7A4B25" />
      <circle cx="398" cy="196" r="30" fill="#2F9E78" />
      <circle cx="380" cy="206" r="20" fill="#37B189" />
      <circle cx="52" cy="266" r="18" fill="#37B189" />
    </svg>
  );
}
function IllustrationTenant({ className = "" }) {
  return (
    <svg viewBox="0 0 440 340" className={className} role="img" aria-label="Illustration of a renter and apartment">
      <circle cx="220" cy="162" r="160" fill="#E7F6F1" />
      <path d="M0 290 Q220 258 440 290 L440 340 L0 340 Z" fill="#CFEDE2" />
      <path d="M0 302 Q220 276 440 302 L440 340 L0 340 Z" fill="#16A37B" opacity="0.8" />
      <rect x="150" y="96" width="150" height="188" rx="10" fill="#FFFFFF" stroke="#0B1F3A" strokeWidth="3.5" />
      <rect x="150" y="96" width="150" height="30" rx="10" fill="#0E7A66" />
      <rect x="150" y="116" width="150" height="10" fill="#0E7A66" />
      <g fill="#BFE6DA" stroke="#0B1F3A" strokeWidth="2.5">
        <rect x="170" y="142" width="30" height="26" rx="3" />
        <rect x="212" y="142" width="30" height="26" rx="3" />
        <rect x="254" y="142" width="30" height="26" rx="3" />
        <rect x="170" y="184" width="30" height="26" rx="3" />
        <rect x="212" y="184" width="30" height="26" rx="3" />
        <rect x="254" y="184" width="30" height="26" rx="3" />
      </g>
      <rect x="206" y="232" width="38" height="52" rx="4" fill="#0B1F3A" />
      <circle cx="236" cy="260" r="3" fill="#C9A227" />
      <rect x="300" y="70" width="104" height="78" rx="16" fill="#0E7A66" />
      <polygon points="322,144 322,170 350,144" fill="#0E7A66" />
      <path d="M330 110 l13 14 l24 -30" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="86" cy="196" r="22" fill="#F2C14E" />
      <path d="M58 268 Q58 226 86 226 Q114 226 114 268 Z" fill="#1C4B8A" />
      <circle cx="372" cy="246" r="13" fill="#C9A227" />
      <circle cx="372" cy="246" r="5" fill="#E7F6F1" />
      <line x1="384" y1="252" x2="412" y2="272" stroke="#C9A227" strokeWidth="7" strokeLinecap="round" />
      <line x1="404" y1="266" x2="410" y2="258" stroke="#C9A227" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- rent location resolver ---------- */
function parseInput(raw) {
  const q = (raw || "").trim();
  if (!q) return null;
  const lq = q.toLowerCase();
  // 5-digit zip
  if (/^\d{5}$/.test(q)) return { kind: "zip", zip: q };
  // exact city (matches "City" or "City, ST" from our list) -> use its real numbers
  const city = CITY_RENT.find((c) => c.city.toLowerCase() === lq || `${c.city}, ${c.state}`.toLowerCase() === lq);
  if (city) return { kind: "city", city: city.city, state: city.state, label: `${city.city}, ${city.state}`, fallback: { median: city.median, avg: city.avg } };
  // exact state (name or abbreviation)
  const st = STATES.find((s) => s.name.toLowerCase() === lq || s.abbr.toLowerCase() === lq);
  if (st) return { kind: "state", state: st.abbr, label: st.name };
  // "City, ST" where the city isn't in our list but the state is valid -> live lookup, state fallback
  const comma = q.match(/^(.+),\s*([A-Za-z]{2,})$/);
  if (comma) {
    const cityPart = comma[1].trim();
    const sp = comma[2].trim().toLowerCase();
    const st2 = STATES.find((s) => s.abbr.toLowerCase() === sp || s.name.toLowerCase() === sp);
    if (st2) return { kind: "city", city: cityPart, state: st2.abbr, label: `${cityPart}, ${st2.abbr}` };
  }
  // partial city (bundled)
  const pc = CITY_RENT.find((c) => c.city.toLowerCase().startsWith(lq));
  if (pc) return { kind: "city", city: pc.city, state: pc.state, label: `${pc.city}, ${pc.state}`, fallback: { median: pc.median, avg: pc.avg } };
  // partial state
  const ps = STATES.find((s) => s.name.toLowerCase().startsWith(lq));
  if (ps) return { kind: "state", state: ps.abbr, label: ps.name };
  return { kind: "none", input: q };
}

function resolveLocation(input) {
  return parseInput(input);
}

/* ============================================================
   Shared UI
   ============================================================ */
function AdBanner() {
  // ===== GOOGLE ADSENSE: paste your <ins class="adsbygoogle"> unit here =====
  return (
    <div className={`${WRAP} pt-4`}>
      <div
        role="complementary"
        aria-label="Advertisement"
        className="relative flex h-[90px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400"
      >
        <span className="absolute left-3 top-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Ad
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.2em]">Advertisement</span>
      </div>
    </div>
  );
}

function Wordmark({ onClick }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded">
      <span className="grid h-8 w-8 place-items-center rounded bg-[#0B1F3A] text-white">
        <Scale size={17} strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none text-left">
        <span style={serif} className="text-[17px] font-bold tracking-tight text-[#0B1F3A]">
          Landlord<span className="text-[#C9A227]">Rules</span>
        </span>
        <span className="mt-[3px] h-[2px] w-0 bg-[#C9A227] transition-all duration-300 group-hover:w-full" />
      </span>
    </button>
  );
}

const verdictStyle = {
  YES: { bg: "bg-[#ECFDF5]", text: "text-[#15803D]", border: "border-[#15803D]", dot: "bg-[#15803D]" },
  NO: { bg: "bg-[#FEF2F2]", text: "text-[#B91C1C]", border: "border-[#B91C1C]", dot: "bg-[#B91C1C]" },
  DEPENDS: { bg: "bg-[#FFFBEB]", text: "text-[#B45309]", border: "border-[#B45309]", dot: "bg-[#B45309]" },
};
const verdictLabel = { YES: "Yes", NO: "No", DEPENDS: "It depends" };

function VerdictPill({ v }) {
  const s = verdictStyle[v];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${s.border} ${s.bg} px-3 py-1 text-xs font-bold uppercase tracking-wide ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {verdictLabel[v]}
    </span>
  );
}

function Header({ mode, view, go, switchMode }) {
  const [open, setOpen] = useState(false);
  const landlordNav = [
    { v: "home", label: "Home" },
    { v: "states", label: "State Laws" },
    { v: "rent", label: "Rent Data" },
    { v: "notice", label: "Notices" },
    { v: "forms", label: "Templates" },
    { v: "faq", label: "FAQ" },
  ];
  const tenantNav = [
    { v: "home", label: "Home" },
    { v: "qa", label: "Q&A" },
    { v: "rent", label: "Rent Data" },
    { v: "forms", label: "Templates" },
    { v: "tips", label: "Tips" },
    { v: "faq", label: "FAQ" },
  ];
  const nav = mode === "landlord" ? landlordNav : tenantNav;
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className={`${WRAP} flex h-16 items-center justify-between gap-4`}>
        <Wordmark onClick={() => go("home")} />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <button
              key={n.v}
              onClick={() => go(n.v)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ${
                view === n.v ? "bg-[#0B1F3A] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={switchMode}
            className="hidden items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#0B1F3A] hover:text-[#0B1F3A] sm:flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            aria-label={`Switch to ${mode === "landlord" ? "Tenant" : "Landlord"} view`}
          >
            <RefreshCw size={13} />
            {mode === "landlord" ? "Tenant view" : "Landlord view"}
          </button>
          <button className="md:hidden p-2 text-[#0B1F3A]" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={22} /> : <ChevronDown size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className={`${WRAP} flex flex-col py-2`}>
            {nav.map((n) => (
              <button key={n.v} onClick={() => { go(n.v); setOpen(false); }}
                className={`rounded-md px-3 py-2.5 text-left text-sm font-medium ${view === n.v ? "bg-[#0B1F3A] text-white" : "text-slate-700"}`}>
                {n.label}
              </button>
            ))}
            <button onClick={() => { switchMode(); setOpen(false); }}
              className="mt-1 flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-[#C9A227]">
              <RefreshCw size={14} />{mode === "landlord" ? "Switch to Tenant view" : "Switch to Landlord view"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer({ switchMode, mode, go }) {
  const FLink = ({ v, children }) => (
    <button onClick={() => go(v)} className="text-left text-sm text-slate-400 transition-colors hover:text-white">{children}</button>
  );
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#0B1F3A] text-slate-300">
      <div className={`${WRAP} py-12`}>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-white">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10"><Scale size={15} /></span>
              <span style={serif} className="text-base font-bold">Landlord<span className="text-[#E7B73C]">Rules</span></span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Plain-English landlord and tenant rights, with the law behind every answer — plus free templates and real rent data to help you act with confidence.
            </p>
            <button onClick={switchMode} className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              <RefreshCw size={13} />{mode === "landlord" ? "Switch to Tenant view" : "Switch to Landlord view"}
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Explore</p>
            <FLink v="home">Home</FLink>
            {mode === "landlord" ? <FLink v="states">State Laws</FLink> : <FLink v="qa">Renter Q&A</FLink>}
            <FLink v="rent">Rent Data</FLink>
            <FLink v="forms">Free Templates</FLink>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">More</p>
            {mode === "landlord" ? <FLink v="notice">Notice Generator</FLink> : <FLink v="rent">Am I overpaying?</FLink>}
            <FLink v="tips">{mode === "landlord" ? "Landlord Tips" : "Tenant Tips"}</FLink>
            <FLink v="faq">FAQ</FLink>
            <a href={HUD} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white">HUD Tenant Rights <ExternalLink size={12} /></a>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs leading-relaxed text-slate-400">
            <strong className="text-slate-200">Not legal advice.</strong> LandlordRules provides general information for educational purposes only and is not a substitute for advice from a licensed attorney. Laws change and vary by state and locality — always verify current statutes and consult a lawyer for your specific situation.
          </p>
          <p className="mt-3 text-xs text-slate-500">© {new Date().getFullYear()} LandlordRules.com · All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function Disclaimer({ className = "" }) {
  return (
    <p className={`text-xs leading-relaxed text-slate-500 ${className}`}>
      General information, not legal advice. Verify current law for your state and locality.
    </p>
  );
}

/* ============================================================
   Entry screen
   ============================================================ */
function EntryScreen({ choose }) {
  const cards = [
    { mode: "landlord", title: "I'm a Landlord", Art: IllustrationHouse, blurb: "State laws, rent data, notice letters, and 13 free templates to run your rentals.", cta: "Manage my property", ring: "hover:border-[#C9A227]/70", glow: "from-[#1C4B8A]/40" },
    { mode: "tenant", title: "I'm a Tenant", Art: IllustrationTenant, blurb: "Straight answers to “can my landlord do that?”, rent benchmarks, tips, and free letters.", cta: "Know my rights", ring: "hover:border-[#16A37B]/70", glow: "from-[#0E7A66]/40" },
  ];
  return (
    <div className={`flex min-h-screen flex-col ${HERO} text-white`}>
      <div className="flex items-center justify-center gap-2 pt-10">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10"><Scale size={19} /></span>
        <span style={serif} className="text-xl font-bold">Landlord<span className="text-[#E7B73C]">Rules</span></span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12">
        <div className="mb-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E7B73C]">Know where you stand</p>
          <h1 style={serif} className="mt-3 text-4xl font-bold sm:text-5xl">Welcome — which side are you on?</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-slate-200 sm:text-base">
            Pick your path and we’ll tailor everything to you. You can switch anytime.
          </p>
        </div>
        <div className="mt-10 grid w-full max-w-4xl gap-6 sm:grid-cols-2">
          {cards.map(({ mode, title, Art, blurb, cta, ring, glow }) => (
            <button
              key={mode}
              onClick={() => choose(mode)}
              className={`group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] p-7 text-left transition-all duration-300 hover:-translate-y-1.5 ${ring} hover:bg-white/[0.09] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7B73C]`}
            >
              <div className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`} />
              <div className="relative overflow-hidden rounded-2xl bg-[#FBF7EF]">
                <Art className="h-44 w-full object-cover" />
              </div>
              <h2 style={serif} className="mt-5 text-2xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{blurb}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A] transition-transform group-hover:translate-x-0.5">
                {cta} <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
        <p className="mt-10 max-w-lg text-center text-[11px] leading-relaxed text-slate-300">
          General legal information, not legal advice. Always verify current law for your state.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Landlord — Home
   ============================================================ */
function LandlordHome({ go }) {
  const feats = [
    { Icon: Scale, t: "Laws for all 50 states", d: "Deposit caps, entry notice, vacate periods, and late-fee rules in one clean reference.", v: "states" },
    { Icon: LineChart, t: "Real rent data", d: "See median and average rent for any state or major city to price your units right.", v: "rent" },
    { Icon: FileText, t: "Notice generator", d: "Create late-rent, lease-violation, and vacate letters ready to copy or print.", v: "notice" },
    { Icon: Download, t: "13 free templates", d: "Leases, applications, inspection checklists, and more — as Word docs and PDFs.", v: "forms" },
  ];
  return (
    <div>
      <section className={HERO}>
        <div className={`${WRAP} grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E7B73C]">For Landlords</p>
            <h1 style={serif} className="mt-4 text-4xl font-bold leading-[1.08] text-white sm:text-5xl">
              Know your rights.<br />Run your property.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200">
              Everything you need to manage rentals with confidence — state laws, real rent benchmarks, notice letters, and free, ready-to-use documents.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button onClick={() => go("states")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0B1F3A] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7B73C]">
                <MapPin size={17} /> Look up my state
              </button>
              <button onClick={() => go("forms")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7B73C]">
                <Download size={17} /> Free templates
              </button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-2 text-sm text-slate-300">
              {["All 50 states", "13 free documents", "Real rent data"].map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#37B189]" /> {s}</span>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-3xl bg-[#FBF7EF] shadow-2xl ring-1 ring-black/5">
              <IllustrationHouse className="h-auto w-full" />
            </div>
          </div>
        </div>
      </section>
      <section className={`${WRAP} py-14`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {feats.map(({ Icon, t, d, v }) => (
            <button key={t} onClick={() => go(v)} className={`${card} group p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-md`}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0B1F3A] text-white"><Icon size={20} /></span>
              <h3 style={serif} className="mt-4 text-lg font-bold text-[#0B1F3A]">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1D4ED8]">Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>

        <button onClick={() => go("tips")} className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-[#C9A227]/40 bg-gradient-to-r from-[#FFFBEF] to-[#FFF6E0] p-5 text-left transition-shadow hover:shadow-md">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#C9A227] text-white"><Lightbulb size={22} /></span>
          <span className="flex-1">
            <span style={serif} className="block text-lg font-bold text-[#0B1F3A]">New to this? Read the Landlord Tips</span>
            <span className="mt-0.5 block text-sm text-[#7A5B12]">Screening, deposits, maintenance, and staying legal — a practical playbook for new and busy landlords.</span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-[#9A7A1C]" />
        </button>
        <Disclaimer className="mt-8" />
      </section>
    </div>
  );
}

/* ============================================================
   Landlord — State Laws
   ============================================================ */
function DataRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5 first:border-t-0">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-right text-sm font-semibold text-[#0B1F3A]">{value}</span>
    </div>
  );
}

function StateLaws() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATES;
    return STATES.filter((s) => s.name.toLowerCase().includes(q) || s.abbr.toLowerCase() === q);
  }, [query]);

  return (
    <div className={`${WRAP} py-12`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">Reference</p>
      <h1 style={serif} className="mt-3 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">State Landlord-Tenant Laws</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Security deposit limits, required entry notice, notice to vacate, and late-fee rules for all 50 states. Each card links to the official statute.
      </p>

      <div className="sticky top-16 z-30 -mx-5 mt-7 bg-white/95 px-5 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a state…"
            aria-label="Search a state"
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-[#0B1F3A] outline-none transition focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/15"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-slate-500">No state matches “{query}”. Try the full name, like “Texas.”</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.abbr} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <h2 style={serif} className="text-xl font-bold text-[#0B1F3A]">{s.name}</h2>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold tracking-wide text-slate-500">{s.abbr}</span>
              </div>
              <div className="mt-3 flex-1">
                <DataRow label="Deposit limit" value={s.deposit} />
                <DataRow label="Notice to enter" value={s.entry} />
                <DataRow label="Notice to vacate" value={s.vacate} />
                <DataRow label="Late fees" value={s.lateFee} />
              </div>
              <a href={s.statute} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline">
                Read the official law <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
      <Disclaimer className="mt-10" />
    </div>
  );
}

/* ============================================================
   Landlord — Notice Generator
   ============================================================ */
function buildLetter(t, f, st) {
  const date = f.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const landlord = f.landlordName || "[Landlord Name]";
  const tenant = f.tenantName || "[Tenant Name]";
  const addr = f.propertyAddress || "[Property Address]";
  const head = `${date}\n\nTo: ${tenant}\nProperty: ${addr}\n\n`;
  const sign = `\n\nSincerely,\n${landlord}\nLandlord / Property Manager\n\n—\nThis notice references general ${st.name} requirements and is provided as a template. It is not legal advice; confirm your state and local rules before serving it.`;

  if (t === "late-rent") {
    const amt = f.amountDue || "[amount]";
    const due = f.rentDueDate || "[due date]";
    return head +
`RE: NOTICE OF LATE RENT

Dear ${tenant},

Our records show that rent in the amount of $${amt} for the property at ${addr} was due on ${due} and remains unpaid as of the date of this notice.

Please remit the full outstanding balance of $${amt} immediately. Late fees may apply as permitted under your lease and ${st.name} law (${st.lateFee}).

If you have already sent payment, please disregard this notice and contact me so our records can be updated. If you are experiencing difficulty, please reach out promptly so we can discuss your options.` + sign;
  }

  if (t === "lease-violation") {
    const viol = f.violation || "[describe the lease violation]";
    const cure = f.cureDays || "10";
    return head +
`RE: NOTICE OF LEASE VIOLATION

Dear ${tenant},

This letter serves as formal notice that you are in violation of your lease agreement for the property at ${addr}. Specifically:

${viol}

You are required to correct this violation within ${cure} days of receiving this notice. Failure to remedy the issue within that period may result in further action, including termination of your tenancy, as permitted under your lease and ${st.name} law.

Please treat this matter promptly. I am available to discuss it if helpful.` + sign;
  }

  if (t === "notice-to-vacate") {
    const out = f.moveOutDate || "[move-out date]";
    const reason = f.reason ? `\n\nReason: ${reason_safe(f.reason)}` : "";
    return head +
`RE: NOTICE TO VACATE

Dear ${tenant},

This is formal notice that your tenancy at ${addr} will terminate, and you are required to vacate the premises on or before ${out}.

This notice is intended to comply with the ${st.name} notice period for ending a tenancy (${st.vacate}). Please remove all belongings, return all keys, and leave the unit clean and in good condition, subject to normal wear and tear.${reason}

A move-out inspection can be scheduled at your request. Your security deposit will be handled in accordance with ${st.name} law.` + sign;
  }

  // move-out (tenant -> landlord)
  const out = f.moveOutDate || "[move-out date]";
  const fwd = f.forwardingAddress || "[forwarding address]";
  return `${date}\n\nTo: ${landlord}\nProperty: ${addr}\n\n` +
`RE: NOTICE OF INTENT TO MOVE OUT

Dear ${landlord},

Please accept this letter as my formal notice that I intend to vacate the property at ${addr} on or before ${out}, ending my tenancy in accordance with ${st.name} requirements (${st.vacate}).

I will return all keys and leave the unit clean and in good condition. Please send my security deposit and any itemized statement to my forwarding address:

${fwd}

Kindly confirm receipt of this notice and let me know if a move-out inspection should be scheduled.

Sincerely,
${tenant}
Tenant

—
Template only; not legal advice. Confirm your required notice period before serving.`;
}
function reason_safe(r) { return r; }

/* Stable field component (defined at module scope so the input keeps
   focus across re-renders — never define this inside the component). */
function NGField({ label, value, onChange, placeholder, textarea }) {
  const cls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0B1F3A] outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/15";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      )}
    </label>
  );
}

function NoticeGenerator() {
  const [stateAbbr, setStateAbbr] = useState("NY");
  const [type, setType] = useState("late-rent");
  const [f, setF] = useState({});
  const [copied, setCopied] = useState(false);
  const st = getState(stateAbbr);
  const letter = useMemo(() => buildLetter(type, f, st), [type, f, st]);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const copy = async () => {
    try { await navigator.clipboard.writeText(letter); }
    catch { const ta = document.createElement("textarea"); ta.value = letter; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  const download = () => {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${type}-notice.txt`; a.click();
    URL.revokeObjectURL(url);
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) { alert("Pop-up blocked. Use Copy or Download instead."); return; }
    const esc = letter.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    w.document.write(`<html><head><title>Notice Letter</title><style>body{font-family:Georgia,serif;white-space:pre-wrap;padding:56px;max-width:680px;margin:auto;line-height:1.65;color:#0B1F3A;font-size:15px;}</style></head><body>${esc}</body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 250);
  };

  return (
    <div className={`${WRAP} py-12`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">For Landlords</p>
      <h1 style={serif} className="mt-3 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">Notice Letter Generator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Choose a state and notice type, fill in the details, and copy or print a professionally worded letter.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">State</span>
              <select value={stateAbbr} onChange={(e) => setStateAbbr(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-[#0B1F3A] outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/15">
                {STATES.map((s) => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Notice type</span>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-[#0B1F3A] outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/15">
                {NOTICE_TYPES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4">
            <NGField label="Date" value={f.date || ""} onChange={set("date")} placeholder="Leave blank for today" />
            <div className="grid grid-cols-2 gap-4">
              <NGField label="Landlord name" value={f.landlordName || ""} onChange={set("landlordName")} placeholder="Jane Smith" />
              <NGField label="Tenant name" value={f.tenantName || ""} onChange={set("tenantName")} placeholder="John Doe" />
            </div>
            <NGField label="Property address" value={f.propertyAddress || ""} onChange={set("propertyAddress")} placeholder="123 Main St, Unit 2, City, ST" />

            {type === "late-rent" && (
              <div className="grid grid-cols-2 gap-4">
                <NGField label="Amount due ($)" value={f.amountDue || ""} onChange={set("amountDue")} placeholder="1,200" />
                <NGField label="Rent due date" value={f.rentDueDate || ""} onChange={set("rentDueDate")} placeholder="June 1, 2026" />
              </div>
            )}
            {type === "lease-violation" && (
              <>
                <NGField label="Describe the violation" value={f.violation || ""} onChange={set("violation")} placeholder="Unauthorized pet kept in the unit since May 2026." textarea />
                <NGField label="Days to cure" value={f.cureDays || ""} onChange={set("cureDays")} placeholder="10" />
              </>
            )}
            {type === "notice-to-vacate" && (
              <>
                <NGField label="Move-out date" value={f.moveOutDate || ""} onChange={set("moveOutDate")} placeholder="July 31, 2026" />
                <NGField label="Reason (optional)" value={f.reason || ""} onChange={set("reason")} placeholder="End of month-to-month tenancy." textarea />
              </>
            )}
            {type === "move-out" && (
              <>
                <NGField label="Move-out date" value={f.moveOutDate || ""} onChange={set("moveOutDate")} placeholder="July 31, 2026" />
                <NGField label="Forwarding address" value={f.forwardingAddress || ""} onChange={set("forwardingAddress")} placeholder="456 Oak Ave, City, ST 00000" textarea />
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live preview</span>
            <div className="flex gap-2">
              <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50">
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
              <button onClick={download} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50">
                <Download size={13} /> .txt
              </button>
              <button onClick={print} className="inline-flex items-center gap-1.5 rounded-md bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0B1F3A]/90">
                <Printer size={13} /> Print
              </button>
            </div>
          </div>
          <pre style={serif} className="mt-2 flex-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-[#0B1F3A]">
{letter}
          </pre>
        </div>
      </div>
      <Disclaimer className="mt-8" />
    </div>
  );
}

/* ============================================================
   Tenant — Hub
   ============================================================ */
function TenantHub({ go, askQuestion }) {
  const [q, setQ] = useState("");
  const popular = QA.slice(0, 6);
  const submit = () => { askQuestion(q); go("qa"); };
  const quick = [
    { Icon: LineChart, t: "Am I overpaying?", d: "Check median rent near you", v: "rent" },
    { Icon: FileText, t: "Free letters", d: "Notice, repairs, deposit", v: "forms" },
    { Icon: Lightbulb, t: "Renter tips", d: "Protect your deposit & more", v: "tips" },
  ];
  return (
    <div>
      <section className={HERO}>
        <div className={`${WRAP} grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7FE3C4]">For Tenants</p>
            <h1 style={serif} className="mt-4 text-4xl font-bold leading-[1.08] text-white sm:text-5xl">Can my landlord<br />do that?</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-200">
              Get a straight answer — and the exact law behind it. Plus rent benchmarks, practical tips, and free letters you can send today.
            </p>
            <div className="mt-7 max-w-xl">
              <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="e.g. Can my landlord keep my deposit?"
                  aria-label="Ask a question"
                  className="w-full rounded-xl border border-transparent bg-white py-3.5 pl-11 pr-24 text-sm text-[#0B1F3A] outline-none focus:ring-2 focus:ring-[#7FE3C4]"
                />
                <button onClick={submit} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0E7A66] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6a59]">
                  Ask
                </button>
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-3xl bg-[#FBF7EF] shadow-2xl ring-1 ring-black/5">
              <IllustrationTenant className="h-auto w-full" />
            </div>
          </div>
        </div>
      </section>

      <section className={`${WRAP} py-14`}>
        <div className="grid gap-4 sm:grid-cols-3">
          {quick.map(({ Icon, t, d, v }) => (
            <button key={t} onClick={() => go(v)} className={`${card} group flex items-center gap-4 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md`}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#0E7A66] text-white"><Icon size={22} /></span>
              <span className="flex-1">
                <span style={serif} className="block text-base font-bold text-[#0B1F3A]">{t}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{d}</span>
              </span>
              <ArrowRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>

        <h2 style={serif} className="mt-12 text-2xl font-bold text-[#0B1F3A]">Most-asked questions</h2>
        <p className="mt-2 text-sm text-slate-600">Tap a question to jump straight to the answer and the law behind it.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {popular.map((item) => (
            <button key={item.id} onClick={() => { askQuestion(""); go("qa", item.id); }}
              className={`${card} group flex items-center justify-between gap-3 p-4 text-left transition-colors hover:border-[#0E7A66]`}>
              <span className="flex items-center gap-3">
                <VerdictPill v={item.v} />
                <span className="text-sm font-medium text-[#0B1F3A]">{item.q}</span>
              </span>
              <ArrowRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0E7A66]" />
            </button>
          ))}
        </div>
        <button onClick={() => go("qa")} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline">
          See all 20 questions <ArrowRight size={15} />
        </button>
        <Disclaimer className="mt-8" />
      </section>
    </div>
  );
}

/* ============================================================
   Tenant — Q&A
   ============================================================ */
function QACard({ item, st, open, onToggle }) {
  const stateVal = item.field ? st[item.field] : null;
  const s = verdictStyle[item.v];
  return (
    <div className={`overflow-hidden rounded-xl border bg-white ${open ? s.border : "border-slate-200"}`}>
      <button onClick={onToggle} aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]">
        <span className="flex flex-wrap items-center gap-3">
          <VerdictPill v={item.v} />
          <span style={serif} className="text-base font-bold text-[#0B1F3A] sm:text-lg">{item.q}</span>
        </span>
        <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <p className="text-sm leading-relaxed text-slate-700">{item.a}</p>
          {stateVal && (
            <div className={`mt-4 rounded-lg border ${s.border} ${s.bg} px-4 py-3`}>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">In {st.name}</span>
              <p className={`mt-0.5 text-sm font-bold ${s.text}`}>{stateVal}</p>
            </div>
          )}
          <a
            href={item.field ? st.statute : (item.law ? item.law.url : HUD)}
            target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline"
          >
            {item.field ? `Read ${st.name}’s law` : (item.law ? item.law.label : "Read the law")} <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}

function TenantQA({ stateAbbr, setStateAbbr, query, setQuery, focusId, clearFocus }) {
  const [openId, setOpenId] = useState(focusId || null);
  const st = getState(stateAbbr);
  const topRef = useRef(null);

  useEffect(() => {
    if (focusId) {
      setOpenId(focusId);
      const el = document.getElementById(`qa-${focusId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      clearFocus();
    }
    // eslint-disable-next-line
  }, [focusId]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return QA;
    return QA.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className={`${WRAP} py-12`} ref={topRef}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">For Tenants</p>
      <h1 style={serif} className="mt-3 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">Can My Landlord Do That?</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Clear answers to the most-Googled tenant questions, with the law behind each one. Set your state so the answers adjust to where you live.
      </p>

      <div className="sticky top-16 z-30 -mx-5 mt-7 flex flex-col gap-3 bg-white/95 px-5 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:px-0">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions…"
            aria-label="Search questions"
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-[#0B1F3A] outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/15"
          />
        </div>
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Your state</span>
          <select value={stateAbbr} onChange={(e) => setStateAbbr(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-[#0B1F3A] outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/15">
            {STATES.map((s) => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">No question matches “{query}”. Try a keyword like “deposit” or “evict.”</p>
        )}
        {filtered.map((item) => (
          <div id={`qa-${item.id}`} key={item.id}>
            <QACard item={item} st={st} open={openId === item.id} onToggle={() => setOpenId(openId === item.id ? null : item.id)} />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs leading-relaxed text-slate-600">
          Federal protections (fair housing, discrimination) apply nationwide — see{" "}
          <a href={HUD} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1D4ED8] hover:underline">HUD Tenant Rights</a>.{" "}
          State rules above are a starting point; confirm the current statute for your state and city.
        </p>
      </div>
      <Disclaimer className="mt-6" />
    </div>
  );
}

/* ============================================================
   Shared — FAQ
   ============================================================ */
function FAQPage({ mode }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={`${WRAP} py-12`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">{mode === "landlord" ? "For Landlords & Tenants" : "For Tenants & Landlords"}</p>
      <h1 style={serif} className="mt-3 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">Frequently Asked Questions</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        The questions landlords and tenants search for most, answered in plain English.
      </p>
      <div className="mt-8 grid gap-3">
        {FAQ.map((item, i) => (
          <div key={i} className={`overflow-hidden rounded-xl border bg-white ${open === i ? "border-[#0B1F3A]" : "border-slate-200"}`}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]">
              <span style={serif} className="text-base font-bold text-[#0B1F3A] sm:text-lg">{item.q}</span>
              <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                <p className="text-sm leading-relaxed text-slate-700">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <Disclaimer className="mt-8" />
    </div>
  );
}

/* ============================================================
   Landlord — Forms & Templates (free downloads)
   ============================================================ */
const TEMPLATES = [
  { file: "residential-lease-agreement", title: "Residential Lease Agreement", Icon: FileSignature,
    desc: "A complete fixed-term lease: rent, deposit, utilities, entry, maintenance, and house rules." },
  { file: "rental-application", title: "Rental Application", Icon: ClipboardList,
    desc: "Collect applicant info, employment, rental history, references, and screening authorization." },
  { file: "move-in-move-out-checklist", title: "Move-In / Move-Out Checklist", Icon: ClipboardCheck,
    desc: "A room-by-room condition record that protects the security deposit at both ends of the tenancy." },
  { file: "security-deposit-itemized-statement", title: "Security Deposit Itemized Statement", Icon: Banknote,
    desc: "Itemize deductions and return the balance — required in most states after move-out." },
  { file: "security-deposit-receipt", title: "Security Deposit Receipt", Icon: Receipt,
    desc: "Acknowledge the deposit and disclose where it’s held, as some states require." },
  { file: "lead-based-paint-disclosure", title: "Lead-Based Paint Disclosure", Icon: AlertTriangle,
    desc: "The federally required disclosure for any rental built before 1978." },
  { file: "pet-addendum", title: "Pet Addendum", Icon: PawPrint,
    desc: "Add pet terms, pet rent, and a pet deposit to any existing lease." },
  { file: "lease-renewal-agreement", title: "Lease Renewal / Extension", Icon: FileText,
    desc: "Extend an existing lease and update the rent in a single page." },
  { file: "rent-increase-notice", title: "Rent Increase Notice", Icon: TrendingUp,
    desc: "Notify a tenant of a new rent amount with the proper advance notice." },
  { file: "notice-to-enter", title: "Notice of Entry", Icon: KeyRound,
    desc: "Give written notice before entering for repairs, inspections, or showings." },
  { file: "rent-receipt", title: "Rent Receipt", Icon: Wallet,
    desc: "Confirm a rent payment with amount, period, and method for your records." },
  { file: "cosigner-agreement", title: "Co-Signer / Guarantor Agreement", Icon: Users,
    desc: "Have a guarantor back the lease and guarantee the tenant’s obligations." },
  { file: "sublease-agreement", title: "Sublease Agreement", Icon: Building2,
    desc: "Let a tenant sublet to a subtenant, with landlord consent built in." },
];

const TENANT_TEMPLATES = [
  { file: "tenant-notice-to-vacate", title: "Notice to Vacate", Icon: FileText,
    desc: "Give your landlord proper written notice that you’re moving out." },
  { file: "security-deposit-return-request", title: "Security Deposit Return Request", Icon: Banknote,
    desc: "Politely but firmly request your deposit back after move-out." },
  { file: "repair-request-letter", title: "Repair Request Letter", Icon: Wrench,
    desc: "Ask for repairs in writing and create a paper trail that protects you." },
  { file: "roommate-agreement", title: "Roommate Agreement", Icon: Users,
    desc: "Split rent, deposit, bills, and house rules clearly between roommates." },
  { file: "lease-break-request", title: "Lease Break Request", Icon: Calendar,
    desc: "Request to end your lease early and propose terms to your landlord." },
];

function DownloadBtn({ href, primary, children }) {
  return (
    <a
      href={href}
      download
      className={
        primary
          ? "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
          : "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-[#0B1F3A] transition-colors hover:border-[#0B1F3A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
      }
    >
      {children}
    </a>
  );
}

function TemplateLibrary({ eyebrow, eyebrowColor = "#C9A227", title, intro, items, accent = "#0B1F3A" }) {
  return (
    <div className={`${WRAP} py-12`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: eyebrowColor }}>{eyebrow}</p>
      <h1 style={serif} className="mt-3 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{intro}</p>

      <div className="mt-7 flex gap-3 rounded-2xl border border-[#C9A227]/40 bg-[#FFFBEB] p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#B45309]" />
        <p className="text-sm leading-relaxed text-[#7A5B12]">
          <span className="font-semibold">Read before you use these.</span> They’re general templates, not legal advice.
          Landlord-tenant law varies by state and locality — confirm any dollar limits and notice periods against current
          law, and consider having an attorney review your final documents.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {items.map(({ file, title: t, Icon, desc }) => (
          <div key={file} className={`${card} flex flex-col p-5 transition-shadow hover:shadow-md`}>
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: accent }}>
                <Icon size={20} strokeWidth={1.9} />
              </span>
              <h2 style={serif} className="pt-1.5 text-lg font-bold leading-snug text-[#0B1F3A]">{t}</h2>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{desc}</p>
            <div className="mt-4 flex gap-2">
              <DownloadBtn href={`/templates/${file}.docx`} primary>
                <Download size={14} /> Word (.docx)
              </DownloadBtn>
              <DownloadBtn href={`/templates/${file}.pdf`}>
                <Download size={14} /> PDF
              </DownloadBtn>
            </div>
          </div>
        ))}
      </div>
      <Disclaimer className="mt-10" />
    </div>
  );
}

function FormsTemplates() {
  return (
    <TemplateLibrary
      eyebrow="Free Downloads"
      title="Landlord Forms & Templates"
      intro="Free, ready-to-use rental documents. Download any template as an editable Word file (.docx) to fill in on your computer, or as a print-ready PDF. Each one includes fill-in fields and plain-language terms."
      items={TEMPLATES}
      accent="#0B1F3A"
    />
  );
}

function TenantTemplates() {
  return (
    <TemplateLibrary
      eyebrow="Free Downloads"
      eyebrowColor="#0E7A66"
      title="Tenant Letters & Templates"
      intro="Free letters and agreements for renters — give notice, request repairs, ask for your deposit back, or set things straight with roommates. Download as an editable Word file or a print-ready PDF."
      items={TENANT_TEMPLATES}
      accent="#0E7A66"
    />
  );
}

/* ============================================================
   Tips pages
   ============================================================ */
function TipsPage({ eyebrow, eyebrowColor, title, intro, accent, sections, go }) {
  return (
    <div className={`${WRAP} py-12`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: eyebrowColor }}>{eyebrow}</p>
      <h1 style={serif} className="mt-3 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{intro}</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {sections.map(({ Icon, heading, tips }) => (
          <div key={heading} className={`${card} p-6`}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: accent }}>
                <Icon size={19} />
              </span>
              <h2 style={serif} className="text-lg font-bold text-[#0B1F3A]">{heading}</h2>
            </div>
            <ul className="mt-4 space-y-2.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0" style={{ color: accent }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => go("forms")} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:border-[#0B1F3A]">
          <Download size={15} /> Get the free templates
        </button>
        <button onClick={() => go("rent")} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:border-[#0B1F3A]">
          <LineChart size={15} /> Check rent data
        </button>
      </div>
      <Disclaimer className="mt-8" />
    </div>
  );
}

function TenantTips({ go }) {
  const sections = [
    { Icon: FileText, heading: "Before you sign", tips: [
      "Read the entire lease — including late fees, who pays which utilities, and any parking or pet rules — before you sign anything.",
      "Check your state’s deposit cap so you know the maximum a landlord can legally ask for.",
      "Never pay a deposit or fee before you’ve seen the unit and have a signed lease in hand.",
      "Confirm who actually owns or manages the property so you’re dealing with the right person.",
    ] },
    { Icon: ClipboardCheck, heading: "Moving in", tips: [
      "Do a move-in inspection and take dated photos or video of every room, including existing flaws.",
      "Fill out and sign a move-in/move-out checklist with the landlord and keep your copy.",
      "Test smoke and CO detectors, locks, heat, and AC on day one and report anything broken.",
    ] },
    { Icon: Wallet, heading: "During your tenancy", tips: [
      "Pay rent on time and keep proof — receipts, bank records, or screenshots of transfers.",
      "Put every request or complaint in writing (email or text) so you have a paper trail.",
      "Get renter’s insurance — it’s usually cheap and covers your belongings and liability.",
      "If you’ll be late on rent, tell your landlord early; many will work with you.",
    ] },
    { Icon: ShieldCheck, heading: "Protecting your deposit", tips: [
      "Keep the place clean and report small issues before they become big ones.",
      "Learn the difference between normal wear (not chargeable) and damage (chargeable).",
      "Give proper written notice and a forwarding address so your deposit can be returned.",
      "Take move-out photos the day you leave, after cleaning, as your evidence.",
    ] },
    { Icon: ShieldAlert, heading: "If problems come up", tips: [
      "Lockouts, utility shutoffs, and retaliation for complaining are illegal almost everywhere.",
      "Send repair requests in writing and keep copies — use the free Repair Request letter.",
      "Check your state’s rules on “repair and deduct” or rent withholding before trying either.",
      "For an unreturned deposit, small claims court is designed for exactly this.",
    ] },
    { Icon: KeyRound, heading: "Moving out", tips: [
      "Give written notice with the right lead time for your state and tenancy.",
      "Clean thoroughly, fix what you damaged, and return all keys.",
      "Attend the move-out inspection if offered, and get any agreement in writing.",
      "Follow up if your deposit isn’t returned by your state’s deadline.",
    ] },
  ];
  return (
    <TipsPage
      eyebrow="For Tenants" eyebrowColor="#0E7A66" accent="#0E7A66"
      title="Tenant Tips" go={go}
      intro="Practical, plain-English advice to help you rent smart, avoid disputes, and get your full deposit back — from before you sign to the day you move out."
      sections={sections}
    />
  );
}

function LandlordTips({ go }) {
  const sections = [
    { Icon: Users, heading: "Screening tenants", tips: [
      "Use a written application and the same criteria for every applicant — consistency is your best fair-housing defense.",
      "Run credit, background, and eviction checks with the applicant’s written consent.",
      "Verify income (a common rule of thumb is ~3× the rent) and call previous landlords.",
      "Never make decisions based on race, religion, family status, disability, or other protected classes.",
    ] },
    { Icon: FileSignature, heading: "Leases & documentation", tips: [
      "Always use a written lease and keep signed copies of everything.",
      "Document the unit’s condition with a signed checklist and dated photos at move-in.",
      "Provide required disclosures — including the federal lead-paint disclosure for pre-1978 housing.",
      "Put any change or side agreement in writing and have both parties sign it.",
    ] },
    { Icon: Banknote, heading: "Security deposits", tips: [
      "Know your state’s deposit cap and the deadline to return it after move-out.",
      "Hold deposits properly — some states require a separate account or interest.",
      "Itemize every deduction and keep receipts; return the balance on time.",
      "Returning deposits late or without itemization can cost you penalties.",
    ] },
    { Icon: TrendingUp, heading: "Rent & cash flow", tips: [
      "Price to the market — check median rent for your area before setting or raising rent.",
      "Collect rent consistently and offer easy, trackable payment methods.",
      "Enforce late fees, but only within your state’s legal limits and grace periods.",
      "Keep clean records all year to make tax time painless.",
    ] },
    { Icon: Wrench, heading: "Maintenance & entry", tips: [
      "Respond to repair requests promptly — habitability is a legal obligation, not a favor.",
      "Give proper written notice before entering, except in genuine emergencies.",
      "Do seasonal maintenance to prevent expensive emergency repairs.",
      "Keep a log of requests and completed work in case a dispute arises.",
    ] },
    { Icon: ShieldAlert, heading: "Staying legal", tips: [
      "Never use “self-help” evictions — lockouts and utility shutoffs are illegal; use the courts.",
      "Avoid anything that looks like retaliation after a tenant complains or requests repairs.",
      "Carry landlord insurance and consider an LLC or umbrella policy for liability.",
      "For evictions or serious disputes, consult a local attorney before acting.",
    ] },
  ];
  return (
    <TipsPage
      eyebrow="For Landlords" eyebrowColor="#C9A227" accent="#0B1F3A"
      title="Landlord Tips & Playbook" go={go}
      intro="A practical playbook for running rentals well — screen carefully, document everything, handle deposits and maintenance by the book, and stay on the right side of the law."
      sections={sections}
    />
  );
}

/* ============================================================
   Rent Prices
   ============================================================ */
function RentChart({ byBed, accent }) {
  const items = [["Studio", byBed.studio], ["1 BR", byBed.br1], ["2 BR", byBed.br2], ["3 BR", byBed.br3]].filter(([, v]) => v);
  if (!items.length) return null;
  const max = Math.max(...items.map(([, v]) => v));
  return (
    <div className="flex items-end gap-3 sm:gap-6" style={{ height: 190 }}>
      {items.map(([label, v]) => (
        <div key={label} className="flex flex-1 flex-col items-center justify-end">
          <span className="mb-1.5 text-xs font-bold text-[#0B1F3A]">${v.toLocaleString()}</span>
          <div className="w-full rounded-t-lg" style={{ height: `${Math.max(10, (v / max) * 140)}px`, background: `linear-gradient(to top, ${accent}, ${accent}bb)` }} />
          <span className="mt-2 text-xs font-medium text-slate-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

function HistoryChart({ history, forecast, accent }) {
  const hist = (history || []).filter((h) => h.median != null);
  if (hist.length < 2) return null;
  const fc = forecast || [];
  const all = [...hist, ...fc.map((f) => ({ ...f, projected: true }))];
  const years = all.map((a) => a.year);
  const vals = all.map((a) => a.median);
  const minYear = Math.min(...years), maxYear = Math.max(...years);
  let minV = Math.min(...vals), maxV = Math.max(...vals);
  const padV = Math.max(50, (maxV - minV) * 0.18);
  minV = Math.max(0, Math.floor((minV - padV) / 50) * 50);
  maxV = Math.ceil((maxV + padV) / 50) * 50;
  const W = 620, H = 250, padL = 54, padR = 18, padT = 16, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const xs = (y) => padL + (maxYear === minYear ? 0 : (y - minYear) / (maxYear - minYear)) * plotW;
  const ys = (v) => padT + (1 - (v - minV) / (maxV - minV)) * plotH;
  const histPath = hist.map((h, i) => `${i ? "L" : "M"}${xs(h.year)},${ys(h.median)}`).join(" ");
  const lastH = hist[hist.length - 1];
  const fcPath = fc.length ? `M${xs(lastH.year)},${ys(lastH.median)} ` + fc.map((f) => `L${xs(f.year)},${ys(f.median)}`).join(" ") : "";
  const ticks = [minV, Math.round(((minV + maxV) / 2) / 50) * 50, maxV];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Historical and projected rent trend">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={ys(t)} x2={W - padR} y2={ys(t)} stroke="#ECE6DA" strokeWidth="1" />
          <text x={padL - 8} y={ys(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">${t.toLocaleString()}</text>
        </g>
      ))}
      {all.map((a, i) => (
        <text key={i} x={xs(a.year)} y={H - 9} textAnchor="middle" fontSize="11" fill={a.projected ? "#b0a99a" : "#64748b"}>{a.year}</text>
      ))}
      {fcPath && <path d={fcPath} fill="none" stroke={accent} strokeWidth="2.5" strokeDasharray="5 5" opacity="0.6" />}
      <path d={histPath} fill="none" stroke={accent} strokeWidth="3" strokeLinejoin="round" />
      {hist.map((h, i) => <circle key={i} cx={xs(h.year)} cy={ys(h.median)} r="4" fill={accent} />)}
      {fc.map((f, i) => <circle key={i} cx={xs(f.year)} cy={ys(f.median)} r="4" fill="#FAF8F4" stroke={accent} strokeWidth="2" />)}
    </svg>
  );
}

/* Model a plausible rent history + 3-year forecast from a single median,
   used for local/reference results. Clearly labeled as an estimate in the UI. */
function modelTrend(median) {
  const g = 0.032; // ~3.2%/yr long-run rent growth assumption
  const r = (n) => Math.round(n / 10) * 10;
  const history = [2013, 2015, 2017, 2019, 2021, 2023].map((y) => ({ year: y, median: r(median * Math.pow(1 + g, y - 2023)) }));
  const forecast = [2024, 2025, 2026].map((y) => ({ year: y, median: r(median * Math.pow(1 + g, y - 2023)) }));
  return { history, forecast };
}

function RentPrices({ mode }) {
  const accent = mode === "tenant" ? "#0E7A66" : "#1C4B8A";
  const eyebrowColor = mode === "tenant" ? "#0E7A66" : "#C9A227";
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  function buildFnUrl(p) {
    if (!p || p.kind === "none") return null;
    if (p.kind === "zip") return `/.netlify/functions/rent?zip=${p.zip}`;
    if (p.kind === "city") return `/.netlify/functions/rent?city=${encodeURIComponent(p.city)}&state=${p.state}`;
    if (p.kind === "state") return `/.netlify/functions/rent?state=${p.state}`;
    if (p.kind === "latlng") return `/.netlify/functions/rent?lat=${p.lat}&lng=${p.lng}`;
    return null;
  }

  const parsedFinal = useMemo(() => {
    if (!submitted) return null;
    if (submitted.startsWith("__latlng__")) {
      const [lat, lng] = submitted.replace("__latlng__", "").split(",").map(Number);
      return { kind: "latlng", lat, lng, label: input };
    }
    return parseInput(submitted);
  }, [submitted, input]);

  useEffect(() => {
    const url = buildFnUrl(parsedFinal);
    if (!url) { setLive(null); return; }
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!cancelled) setLive(d && d.median ? d : null); })
      .catch(() => { if (!cancelled) setLive(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [submitted]);

  const submit = (val) => {
    const v = (val !== undefined ? val : input).trim();
    setInput(v); setSubmitted(v); setGeoError("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGeoError("Geolocation isn't supported by your browser."); return; }
    setGeoLoading(true); setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setInput(`Your location (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
        setSubmitted(`__latlng__${lat},${lng}`);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(err.code === 1 ? "Location access denied. Please allow location access and try again." : "Couldn't get your location. Try searching manually.");
      },
      { timeout: 10000 }
    );
  };

  let result = null;
  if (parsedFinal && parsedFinal.kind !== "none") {
    if (live && live.median) {
      const avg = Math.round((live.median * 1.13) / 10) * 10;
      result = { median: live.median, avg, byBed: live.byBed && live.byBed.br2 ? live.byBed : modelByBedroom(live.median), source: `Live data · U.S. Census ACS ${live.year}`, useLive: true, label: live.name || parsedFinal.label, history: live.history, forecast: live.forecast, population: live.population, mobility: live.mobility };
    } else if (!loading) {
      // bundled / reference result
      let base = null, label = parsedFinal.label;
      if (parsedFinal.fallback) {
        base = parsedFinal.fallback;
      } else if (parsedFinal.state && STATE_RENT[parsedFinal.state]) {
        base = STATE_RENT[parsedFinal.state];
        label = parsedFinal.label || getState(parsedFinal.state).name;
      } else if (parsedFinal.kind === "zip") {
        const stAbbr = zipToState(parsedFinal.zip);
        if (stAbbr && STATE_RENT[stAbbr]) { base = STATE_RENT[stAbbr]; label = `ZIP ${parsedFinal.zip} (${getState(stAbbr).name})`; }
      }
      if (base) {
        const t = modelTrend(base.median);
        result = { median: base.median, avg: base.avg, byBed: modelByBedroom(base.median), source: "Estimated (reference)", useLive: false, modeled: true, label, history: t.history, forecast: t.forecast };
      }
    }
  }

  const showNoMatch = parsedFinal && parsedFinal.kind === "none" && !loading;
  const noData = parsedFinal && parsedFinal.kind !== "none" && parsedFinal.kind !== "zip" && !loading && !result;
  const examples = ["New York", "Los Angeles", "Chicago", "Miami", "90210"];

  return (
    <div className={`${WRAP} py-12`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: eyebrowColor }}>Rent Data</p>
      <h1 style={serif} className="mt-3 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">What's the rent where you are?</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Search any U.S. state, city, or zip code — or use your current location — to see median and average rent by bedroom.
        {mode === "tenant" ? " Use it to check whether your rent is fair." : " Use it to price your units to the local market."}
      </p>

      <div className="mt-7 max-w-xl">
        <div className="relative">
          <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            list="rent-locations" placeholder="City, state or zip — e.g. 11949 or Manorville, NY"
            aria-label="Search a location"
            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-24 text-sm text-[#0B1F3A] outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/15" />
          <button onClick={() => submit()} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: accent }}>Search</button>
          <datalist id="rent-locations">
            {CITY_RENT.map((c) => <option key={`${c.city}-${c.state}`} value={`${c.city}, ${c.state}`} />)}
            {STATES.map((s) => <option key={s.abbr} value={s.name} />)}
          </datalist>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={useMyLocation} disabled={geoLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#0B1F3A] hover:text-[#0B1F3A] disabled:opacity-50">
            <MapPin size={13} className={geoLoading ? "animate-pulse" : ""} />
            {geoLoading ? "Detecting…" : "Use my location"}
          </button>
          <span className="text-xs text-slate-400">or try:</span>
          {examples.map((ex) => (
            <button key={ex} onClick={() => submit(ex)} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-[#0B1F3A] hover:text-[#0B1F3A]">{ex}</button>
          ))}
        </div>
        {geoError && <p className="mt-2 text-xs text-red-600">{geoError}</p>}
      </div>

      {loading && (
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#0B1F3A]" />
          Looking up rent data…
        </div>
      )}

      {!loading && result && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 style={serif} className="text-2xl font-bold text-[#0B1F3A]">{result.label}</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: result.useLive ? "#E7F6F1" : "#F4F1EA", color: result.useLive ? "#0E7A66" : "#6B7280" }}>
              {result.useLive ? <BadgeCheck size={13} /> : <LineChart size={13} />}
              {result.source}
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className={`${card} p-6`}>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Median rent</span>
              <p className="mt-1 text-4xl font-bold text-[#0B1F3A]">${result.median.toLocaleString()}<span className="text-base font-medium text-slate-400">/mo</span></p>
              <p className="mt-1 text-xs text-slate-500">Half of renters pay less, half pay more.</p>
            </div>
            <div className={`${card} p-6`}>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average rent <span className="font-normal normal-case text-slate-400">(estimated)</span></span>
              <p className="mt-1 text-4xl font-bold text-[#0B1F3A]">${result.avg.toLocaleString()}<span className="text-base font-medium text-slate-400">/mo</span></p>
              <p className="mt-1 text-xs text-slate-500">Averages run higher because of pricier units.</p>
            </div>
          </div>
          <div className={`${card} mt-4 p-6`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#0B1F3A]">Typical rent by bedrooms</span>
              <span className="text-xs text-slate-400">{result.useLive ? "Census medians" : "modeled estimate"}</span>
            </div>
            <div className="mt-4"><RentChart byBed={result.byBed} accent={accent} /></div>
          </div>

          {result.history && result.history.length >= 2 && (
            <div className={`${card} mt-4 p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#0B1F3A]">Rent trend &amp; projection</span>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 rounded" style={{ background: accent }} /> Actual</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 rounded border-t-2 border-dashed" style={{ borderColor: accent }} /> Projected</span>
                </div>
              </div>
              <div className="mt-4"><HistoryChart history={result.history} forecast={result.forecast} accent={accent} /></div>
              <p className="mt-3 text-xs text-slate-400">
                {result.modeled
                  ? "Estimated trend modeled from the reference median (not Census data). The deployed site shows real year-by-year Census figures."
                  : "Median gross rent by year (U.S. Census ACS). Projection is a simple trend estimate, not a guarantee."}
              </p>
            </div>
          )}

          {result.modeled && (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-xs leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-600">Population change and resident turnover</span> appear here automatically once the site is published on Netlify, where the live U.S. Census connection runs. On <code className="rounded bg-slate-200 px-1">localhost</code> you're seeing reference estimates.
              </p>
            </div>
          )}

          {(result.population || result.mobility) && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {result.population && (
                <div className={`${card} p-6`}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Population change</span>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-bold" style={{ color: result.population.annualPct >= 0 ? "#15803D" : "#B91C1C" }}>
                      {result.population.annualPct >= 0 ? "+" : ""}{result.population.annualPct}%
                    </span>
                    <span className="text-sm text-slate-400">per year</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {result.population.annualPct >= 0 ? "Growing" : "Shrinking"} — {result.population.spanPct >= 0 ? "+" : ""}{result.population.spanPct}% over the last {result.population.spanYears} years. Population ≈ {result.population.value.toLocaleString()}.
                  </p>
                </div>
              )}
              {result.mobility && (
                <div className={`${card} p-6`}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resident turnover</span>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#0B1F3A]">{result.mobility.movedInPct}%</span>
                    <span className="text-sm text-slate-400">moved in last year</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {result.mobility.fromOutsidePct}% came from outside the area. Higher turnover means more move-ins and move-outs; pair it with population change to see net direction.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showNoMatch && (
        <div className={`${card} mt-8 p-5`}>
          <p className="text-sm font-semibold text-[#0B1F3A]">No match for "{parsedFinal.input}"</p>
          <p className="mt-1 text-sm text-slate-500">Try one of these formats:</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• Zip code — <button onClick={() => submit("11949")} className="font-semibold text-[#1D4ED8] hover:underline">11949</button></li>
            <li>• City, State — <button onClick={() => submit("Manorville, NY")} className="font-semibold text-[#1D4ED8] hover:underline">Manorville, NY</button></li>
            <li>• State name — <button onClick={() => submit("New York")} className="font-semibold text-[#1D4ED8] hover:underline">New York</button></li>
            <li>• Or tap <span className="font-semibold">Use my location</span> above</li>
          </ul>
        </div>
      )}

      {noData && (
        <div className={`${card} mt-8 p-5`}>
          <p className="text-sm font-semibold text-[#0B1F3A]">No Census rent data for that location</p>
          <p className="mt-1 text-sm text-slate-500">
            Some small zip codes and towns don't have published rent figures. Try a nearby{" "}
            <button onClick={() => submit("Manorville, NY")} className="font-semibold text-[#1D4ED8] hover:underline">city</button>,
            the <button onClick={() => submit("New York")} className="font-semibold text-[#1D4ED8] hover:underline">state</button>,
            or a larger neighboring zip code.
          </p>
        </div>
      )}

      <div className={`${card} mt-8 p-5`}>
        <div className="flex items-start gap-3">
          <LineChart size={18} className="mt-0.5 shrink-0 text-[#1C4B8A]" />
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-[#0B1F3A]">Where this comes from.</span> Searches pull <span className="font-semibold">live data from the U.S. Census Bureau (ACS 5-year)</span> — rent, multi-year history, population, and resident mobility. Zip codes use the Census ZCTA tables and <span className="font-semibold">Use my location</span> detects your county via the Census geocoder. The rent projection is a simple trend estimate. Reference estimates appear as a fallback when live data isn't available for a place.
          </p>
        </div>
      </div>
      <Disclaimer className="mt-8" />
    </div>
  );
}
/* ---- URL routing: path-based, with browser back/forward + shareable links ---- */
const VIEW_SLUGS = { home: "", states: "state-laws", rent: "rent-data", notice: "notices", forms: "templates", tips: "tips", faq: "faq", qa: "qa" };
const SLUG_TO_VIEW = Object.fromEntries(Object.entries(VIEW_SLUGS).map(([v, s]) => [s, v]));
function pathFor(mode, view) {
  if (!mode) return "/";
  const slug = VIEW_SLUGS[view] || "";
  return slug ? `/${mode}/${slug}` : `/${mode}`;
}
function parsePath(pathname) {
  const parts = String(pathname || "/").split("/").filter(Boolean);
  const mode = parts[0] === "landlord" || parts[0] === "tenant" ? parts[0] : null;
  if (!mode) return { mode: null, view: "home" };
  const view = SLUG_TO_VIEW[parts[1] || ""] || "home";
  return { mode, view };
}

export default function App() {
  const initial = typeof window !== "undefined" ? parsePath(window.location.pathname) : { mode: null, view: "home" };
  const [mode, setMode] = useState(initial.mode); // null | 'landlord' | 'tenant'
  const [view, setView] = useState(initial.view); // home | states | rent | notice | forms | tips | qa | faq
  const [qaState, setQaState] = useState("NY");
  const [qaQuery, setQaQuery] = useState("");
  const [qaFocus, setQaFocus] = useState(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [view, mode]);

  // Keep the URL in sync and respond to the browser back/forward buttons.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState({ mode, view }, "", pathFor(mode, view));
    const onPop = () => { const s = parsePath(window.location.pathname); setMode(s.mode); setView(s.view); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (nextMode, nextView, focusId) => {
    if (focusId) setQaFocus(focusId);
    setMode(nextMode);
    setView(nextView);
    if (typeof window !== "undefined") window.history.pushState({ mode: nextMode, view: nextView }, "", pathFor(nextMode, nextView));
  };
  const go = (v, focusId) => navigate(mode, v, focusId);
  const switchMode = () => navigate(mode === "landlord" ? "tenant" : "landlord", "home");

  if (!mode) return <EntryScreen choose={(m) => navigate(m, "home")} />;

  let page = null;
  if (mode === "landlord") {
    if (view === "home") page = <LandlordHome go={go} />;
    else if (view === "states") page = <StateLaws />;
    else if (view === "rent") page = <RentPrices mode={mode} />;
    else if (view === "notice") page = <NoticeGenerator />;
    else if (view === "forms") page = <FormsTemplates />;
    else if (view === "tips") page = <LandlordTips go={go} />;
    else if (view === "faq") page = <FAQPage mode={mode} />;
    else page = <LandlordHome go={go} />;
  } else {
    if (view === "home") page = <TenantHub go={go} askQuestion={(q) => setQaQuery(q)} />;
    else if (view === "qa") page = (
      <TenantQA stateAbbr={qaState} setStateAbbr={setQaState} query={qaQuery} setQuery={setQaQuery}
        focusId={qaFocus} clearFocus={() => setQaFocus(null)} />
    );
    else if (view === "rent") page = <RentPrices mode={mode} />;
    else if (view === "forms") page = <TenantTemplates />;
    else if (view === "tips") page = <TenantTips go={go} />;
    else if (view === "faq") page = <FAQPage mode={mode} />;
    else page = <TenantHub go={go} askQuestion={(q) => setQaQuery(q)} />;
  }

  // Hero pages render their own gradient band; show Ad below header for non-hero pages too.
  const heroView = view === "home";

  return (
    <div className="min-h-screen bg-[#FAF8F4] font-sans text-[#0B1F3A]">
      <Header mode={mode} view={view} go={go} switchMode={switchMode} />
      {!heroView && <AdBanner />}
      {heroView && <div className={HERO}><AdBannerOnDark /></div>}
      {page}
      <Footer switchMode={switchMode} mode={mode} go={go} />
    </div>
  );
}

/* Ad placeholder styled for the dark hero band */
function AdBannerOnDark() {
  return (
    <div className={`${WRAP} pt-4`}>
      <div role="complementary" aria-label="Advertisement"
        className="relative flex h-[90px] items-center justify-center rounded-lg border border-dashed border-white/25 bg-white/[0.03] text-white/50">
        <span className="absolute left-3 top-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/60">Ad</span>
        <span className="text-xs font-medium uppercase tracking-[0.2em]">Advertisement</span>
      </div>
    </div>
  );
}

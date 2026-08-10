"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { RadarAccount, storageKeys, useStored, writeStored } from "@/lib/account";

type PlatformName = "Instagram" | "TikTok" | "YouTube" | "X";

type PlatformStat = {
  name: PlatformName;
  handle: string;
  followers: number;
  engagement: number;
  url: string;
};

type Creator = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  niche: string;
  location: string;
  bio: string;
  tags: string[];
  followers: number;
  engagement: number;
  avgViews: number;
  fromRate: number;
  responseTime: string;
  availability: string;
  verified: boolean;
  match: number;
  audienceNigeria: number;
  audienceWomen: number;
  ageRange: string;
  color: string;
  platforms: PlatformStat[];
  packages: { title: string; detail: string; price: number }[];
};

const platformMeta: Record<PlatformName, { short: string; className: string }> = {
  Instagram: { short: "IG", className: "instagram" },
  TikTok: { short: "TT", className: "tiktok" },
  YouTube: { short: "YT", className: "youtube" },
  X: { short: "𝕏", className: "x" },
};

const creators: Creator[] = [
  {
    id: 1,
    name: "Ada Nwosu",
    handle: "@adaeatslagos",
    initials: "AN",
    niche: "Food & Lifestyle",
    location: "Lagos",
    bio: "Lagos food storyteller creating warm, high-converting restaurant and everyday lifestyle content.",
    tags: ["Restaurants", "Food reviews", "Lifestyle"],
    followers: 286400,
    engagement: 6.8,
    avgViews: 112000,
    fromRate: 180000,
    responseTime: "Usually replies in 4 hrs",
    availability: "Available this month",
    verified: true,
    match: 97,
    audienceNigeria: 84,
    audienceWomen: 63,
    ageRange: "18–34",
    color: "coral",
    platforms: [
      { name: "Instagram", handle: "@adaeatslagos", followers: 128400, engagement: 6.3, url: "https://instagram.com/adaeatslagos" },
      { name: "TikTok", handle: "@adaeatslagos", followers: 142000, engagement: 7.4, url: "https://tiktok.com/@adaeatslagos" },
      { name: "YouTube", handle: "Ada Eats Lagos", followers: 16000, engagement: 4.1, url: "https://youtube.com/@adaeatslagos" },
    ],
    packages: [
      { title: "TikTok video", detail: "1 original 30–60 sec video", price: 180000 },
      { title: "Instagram bundle", detail: "1 Reel + 3 story frames", price: 240000 },
      { title: "Launch package", detail: "2 videos across 2 platforms", price: 390000 },
    ],
  },
  {
    id: 2,
    name: "Tobi Adebayo",
    handle: "@tobitechng",
    initials: "TA",
    niche: "Tech & Gadgets",
    location: "Lagos",
    bio: "Plain-language reviews of phones, apps and tools for Nigeria's next generation of digital buyers.",
    tags: ["Fintech", "Phones", "How-to"],
    followers: 184700,
    engagement: 5.1,
    avgViews: 74000,
    fromRate: 250000,
    responseTime: "Usually replies in 1 day",
    availability: "2 slots left in August",
    verified: true,
    match: 95,
    audienceNigeria: 78,
    audienceWomen: 31,
    ageRange: "18–34",
    color: "blue",
    platforms: [
      { name: "YouTube", handle: "Tobi Tech NG", followers: 97300, engagement: 4.8, url: "https://youtube.com/@tobitechng" },
      { name: "Instagram", handle: "@tobitechng", followers: 52600, engagement: 5.4, url: "https://instagram.com/tobitechng" },
      { name: "X", handle: "@tobitechng", followers: 34800, engagement: 5.6, url: "https://x.com/tobitechng" },
    ],
    packages: [
      { title: "Product mention", detail: "60–90 sec YouTube integration", price: 250000 },
      { title: "Dedicated review", detail: "6–10 min YouTube review", price: 520000 },
      { title: "Cross-platform launch", detail: "YouTube + Reel + X thread", price: 680000 },
    ],
  },
  {
    id: 3,
    name: "Mariam Bello",
    handle: "@mariammakes",
    initials: "MB",
    niche: "Beauty & Skincare",
    location: "Abuja",
    bio: "Beauty educator known for honest skincare routines, textured-skin tutorials and accessible product picks.",
    tags: ["Skincare", "Beauty", "UGC"],
    followers: 92400,
    engagement: 8.2,
    avgViews: 46300,
    fromRate: 120000,
    responseTime: "Usually replies in 2 hrs",
    availability: "Available this week",
    verified: true,
    match: 94,
    audienceNigeria: 91,
    audienceWomen: 88,
    ageRange: "18–29",
    color: "pink",
    platforms: [
      { name: "TikTok", handle: "@mariammakes", followers: 61400, engagement: 9.1, url: "https://tiktok.com/@mariammakes" },
      { name: "Instagram", handle: "@mariammakes", followers: 31000, engagement: 6.4, url: "https://instagram.com/mariammakes" },
    ],
    packages: [
      { title: "UGC video", detail: "1 edited product video, usage excluded", price: 120000 },
      { title: "TikTok feature", detail: "1 creator-posted tutorial", price: 165000 },
      { title: "Beauty bundle", detail: "1 TikTok + Reel + 3 stories", price: 310000 },
    ],
  },
  {
    id: 4,
    name: "Chinedu Okafor",
    handle: "@fitwithnedu",
    initials: "CO",
    niche: "Fitness & Wellness",
    location: "Port Harcourt",
    bio: "No-gym workouts, practical nutrition and fitness motivation made for busy Nigerian professionals.",
    tags: ["Fitness", "Nutrition", "Men's health"],
    followers: 71800,
    engagement: 7.6,
    avgViews: 38800,
    fromRate: 95000,
    responseTime: "Usually replies in 6 hrs",
    availability: "Available this month",
    verified: false,
    match: 92,
    audienceNigeria: 86,
    audienceWomen: 44,
    ageRange: "21–39",
    color: "green",
    platforms: [
      { name: "Instagram", handle: "@fitwithnedu", followers: 41800, engagement: 7.1, url: "https://instagram.com/fitwithnedu" },
      { name: "TikTok", handle: "@fitwithnedu", followers: 30000, engagement: 8.2, url: "https://tiktok.com/@fitwithnedu" },
    ],
    packages: [
      { title: "Fitness Reel", detail: "1 integrated Instagram Reel", price: 95000 },
      { title: "Challenge partner", detail: "3 videos over 7 days", price: 255000 },
      { title: "Monthly ambassador", detail: "6 posts + content usage", price: 480000 },
    ],
  },
  {
    id: 5,
    name: "Kemi Onasanya",
    handle: "@moneywithkemi",
    initials: "KO",
    niche: "Finance & Business",
    location: "Lagos",
    bio: "Personal finance, small-business money and career advice without the jargon.",
    tags: ["SMEs", "Personal finance", "Career"],
    followers: 153200,
    engagement: 4.7,
    avgViews: 61700,
    fromRate: 220000,
    responseTime: "Usually replies in 1 day",
    availability: "Booking September",
    verified: true,
    match: 90,
    audienceNigeria: 73,
    audienceWomen: 59,
    ageRange: "24–44",
    color: "gold",
    platforms: [
      { name: "Instagram", handle: "@moneywithkemi", followers: 68400, engagement: 4.2, url: "https://instagram.com/moneywithkemi" },
      { name: "YouTube", handle: "Money with Kemi", followers: 52100, engagement: 5.5, url: "https://youtube.com/@moneywithkemi" },
      { name: "X", handle: "@moneywithkemi", followers: 32700, engagement: 4.4, url: "https://x.com/moneywithkemi" },
    ],
    packages: [
      { title: "Finance Reel", detail: "1 educational Instagram Reel", price: 220000 },
      { title: "YouTube integration", detail: "2–3 min brand segment", price: 340000 },
      { title: "Thought-leader bundle", detail: "Video + X thread + stories", price: 510000 },
    ],
  },
  {
    id: 6,
    name: "Zainab Sani",
    handle: "@zainabathome",
    initials: "ZS",
    niche: "Home & Family",
    location: "Kano",
    bio: "Northern Nigerian home, parenting and everyday living content with a deeply engaged community.",
    tags: ["Parenting", "Home", "Northern NG"],
    followers: 64300,
    engagement: 9.4,
    avgViews: 35200,
    fromRate: 85000,
    responseTime: "Usually replies in 3 hrs",
    availability: "Available this week",
    verified: true,
    match: 89,
    audienceNigeria: 95,
    audienceWomen: 92,
    ageRange: "23–39",
    color: "purple",
    platforms: [
      { name: "Instagram", handle: "@zainabathome", followers: 38600, engagement: 8.9, url: "https://instagram.com/zainabathome" },
      { name: "TikTok", handle: "@zainabathome", followers: 25700, engagement: 10.2, url: "https://tiktok.com/@zainabathome" },
    ],
    packages: [
      { title: "Story set", detail: "4 Instagram story frames", price: 85000 },
      { title: "Home feature", detail: "1 Reel or TikTok integration", price: 135000 },
      { title: "Family bundle", detail: "2 videos + 5 stories", price: 295000 },
    ],
  },
  {
    id: 7,
    name: "Femi Oladele",
    handle: "@femirolls",
    initials: "FO",
    niche: "Comedy & Entertainment",
    location: "Ibadan",
    bio: "Sharp, family-friendly comedy sketches that weave brands naturally into everyday Nigerian moments.",
    tags: ["Comedy", "Skits", "Mass market"],
    followers: 410500,
    engagement: 6.1,
    avgViews: 186000,
    fromRate: 350000,
    responseTime: "Usually replies in 2 days",
    availability: "1 slot left in August",
    verified: true,
    match: 87,
    audienceNigeria: 81,
    audienceWomen: 48,
    ageRange: "18–34",
    color: "orange",
    platforms: [
      { name: "TikTok", handle: "@femirolls", followers: 224000, engagement: 6.8, url: "https://tiktok.com/@femirolls" },
      { name: "Instagram", handle: "@femirolls", followers: 167500, engagement: 5.6, url: "https://instagram.com/femirolls" },
      { name: "YouTube", handle: "Femi Rolls", followers: 19000, engagement: 4.9, url: "https://youtube.com/@femirolls" },
    ],
    packages: [
      { title: "Brand integration", detail: "Brand woven into 1 short sketch", price: 350000 },
      { title: "Dedicated sketch", detail: "Concept, production and post", price: 590000 },
      { title: "Campaign trio", detail: "3 linked sketches over 2 weeks", price: 1450000 },
    ],
  },
  {
    id: 8,
    name: "Dami Eze",
    handle: "@damibuilds",
    initials: "DE",
    niche: "Business & Career",
    location: "Enugu",
    bio: "Practical content for founders, freelancers and young professionals building from outside Lagos.",
    tags: ["Startups", "Careers", "Freelancing"],
    followers: 49600,
    engagement: 8.7,
    avgViews: 22100,
    fromRate: 70000,
    responseTime: "Usually replies in 2 hrs",
    availability: "Available this week",
    verified: false,
    match: 86,
    audienceNigeria: 89,
    audienceWomen: 52,
    ageRange: "21–34",
    color: "teal",
    platforms: [
      { name: "X", handle: "@damibuilds", followers: 27100, engagement: 9.2, url: "https://x.com/damibuilds" },
      { name: "Instagram", handle: "@damibuilds", followers: 22500, engagement: 8.1, url: "https://instagram.com/damibuilds" },
    ],
    packages: [
      { title: "X thread", detail: "1 original 6–10 post thread", price: 70000 },
      { title: "Founder Reel", detail: "1 interview-style Reel", price: 110000 },
      { title: "SME launch bundle", detail: "Reel + thread + 3 stories", price: 235000 },
    ],
  },
  {
    id: 9,
    name: "Reni Ajayi",
    handle: "@styledbyreni",
    initials: "RA",
    niche: "Fashion & Style",
    location: "Lagos",
    bio: "Affordable fashion, local designers and expressive styling for young Nigerian women.",
    tags: ["Fashion", "Made in Nigeria", "Gen Z"],
    followers: 121900,
    engagement: 7.3,
    avgViews: 58400,
    fromRate: 175000,
    responseTime: "Usually replies in 5 hrs",
    availability: "Available this month",
    verified: true,
    match: 85,
    audienceNigeria: 79,
    audienceWomen: 91,
    ageRange: "18–29",
    color: "red",
    platforms: [
      { name: "Instagram", handle: "@styledbyreni", followers: 71900, engagement: 6.8, url: "https://instagram.com/styledbyreni" },
      { name: "TikTok", handle: "@styledbyreni", followers: 50000, engagement: 8.1, url: "https://tiktok.com/@styledbyreni" },
    ],
    packages: [
      { title: "Outfit feature", detail: "1 styled Instagram Reel", price: 175000 },
      { title: "Try-on bundle", detail: "1 TikTok + 4 story frames", price: 245000 },
      { title: "Collection launch", detail: "3 videos across 2 weeks", price: 540000 },
    ],
  },
  {
    id: 10,
    name: "Seyi Balogun",
    handle: "@seesouthwithseyi",
    initials: "SB",
    niche: "Travel & Culture",
    location: "Calabar",
    bio: "Visually rich travel stories uncovering food, stays and culture across southern Nigeria.",
    tags: ["Travel", "Hospitality", "Culture"],
    followers: 106800,
    engagement: 6.9,
    avgViews: 51900,
    fromRate: 160000,
    responseTime: "Usually replies in 1 day",
    availability: "Booking September",
    verified: true,
    match: 83,
    audienceNigeria: 76,
    audienceWomen: 57,
    ageRange: "21–39",
    color: "sky",
    platforms: [
      { name: "Instagram", handle: "@seesouthwithseyi", followers: 56300, engagement: 6.5, url: "https://instagram.com/seesouthwithseyi" },
      { name: "TikTok", handle: "@seesouthwithseyi", followers: 39800, engagement: 7.6, url: "https://tiktok.com/@seesouthwithseyi" },
      { name: "YouTube", handle: "See South", followers: 10700, engagement: 5.1, url: "https://youtube.com/@seesouthwithseyi" },
    ],
    packages: [
      { title: "Stay feature", detail: "1 hosted short-form video", price: 160000 },
      { title: "Destination story", detail: "Reel + photo carousel + stories", price: 290000 },
      { title: "Travel mini-series", detail: "3 videos across 2 platforms", price: 690000 },
    ],
  },
];

const niches = ["All niches", ...Array.from(new Set(creators.map((creator) => creator.niche)))];
const locations = ["All locations", ...Array.from(new Set(creators.map((creator) => creator.location)))];
const platforms: PlatformName[] = ["Instagram", "TikTok", "YouTube", "X"];

function formatCount(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}K`;
  return value.toString();
}

function formatNaira(value: number) {
  return `₦${new Intl.NumberFormat("en-NG").format(value)}`;
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    spark: <><path d="m12 3 1.5 4.2L18 9l-4.5 1.8L12 15l-1.5-4.2L6 9l4.5-1.8L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z"/>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    trend: <><path d="M3 17 9 11l4 4 8-9"/><path d="M15 6h6v6"/></>,
    close: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m20 6-11 11-5-5"/>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    external: <><path d="M15 3h6v6"/><path d="m10 14 11-11"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function PlatformPill({ platform, showName = false }: { platform: PlatformName; showName?: boolean }) {
  const meta = platformMeta[platform];
  return (
    <span className={`platform-pill ${meta.className}`} title={platform}>
      <b>{meta.short}</b>{showName && <span>{platform}</span>}
    </span>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [niche, setNiche] = useState("All niches");
  const [location, setLocation] = useState("All locations");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformName[]>([]);
  const [audienceSize, setAudienceSize] = useState("Any size");
  const [budget, setBudget] = useState(600000);
  const [minEngagement, setMinEngagement] = useState(0);
  const [sortBy, setSortBy] = useState("Best match");
  const saved = useStored<number[]>(storageKeys.shortlist, []);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [profileTab, setProfileTab] = useState<"overview" | "rates" | "audience">("overview");
  const [contacting, setContacting] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const account = useStored<RadarAccount | null>(storageKeys.account, null);
  const profileViews = useStored<number[]>(storageKeys.profileViews, []);
  const [signupGate, setSignupGate] = useState(false);

  useEffect(() => {
    const creatorId = Number(new URLSearchParams(window.location.search).get("creator"));
    if (account && creatorId) {
      const creator = creators.find((item) => item.id === creatorId);
      if (creator) {
        const timer = window.setTimeout(() => setSelectedCreator(creator), 0);
        return () => window.clearTimeout(timer);
      }
    }
  }, [account]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = selectedCreator || mobileFilters ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedCreator, mobileFilters]);

  const results = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    let filtered = creators.filter((creator) => {
      const haystack = `${creator.name} ${creator.handle} ${creator.niche} ${creator.location} ${creator.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesNiche = niche === "All niches" || creator.niche === niche;
      const matchesLocation = location === "All locations" || creator.location === location;
      const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.every((platform) => creator.platforms.some((item) => item.name === platform));
      const matchesBudget = creator.fromRate <= budget;
      const matchesEngagement = creator.engagement >= minEngagement;
      const matchesSize = audienceSize === "Any size" ||
        (audienceSize === "Nano · under 10K" && creator.followers < 10000) ||
        (audienceSize === "Micro · 10K–100K" && creator.followers >= 10000 && creator.followers < 100000) ||
        (audienceSize === "Mid-tier · 100K–500K" && creator.followers >= 100000 && creator.followers < 500000) ||
        (audienceSize === "Macro · 500K+" && creator.followers >= 500000);
      return matchesQuery && matchesNiche && matchesLocation && matchesPlatform && matchesBudget && matchesEngagement && matchesSize;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "Highest engagement") return b.engagement - a.engagement;
      if (sortBy === "Largest audience") return b.followers - a.followers;
      if (sortBy === "Lowest rate") return a.fromRate - b.fromRate;
      return b.match - a.match;
    });
    return filtered;
  }, [query, niche, location, selectedPlatforms, budget, minEngagement, audienceSize, sortBy]);

  const hasFilters = niche !== "All niches" || location !== "All locations" || selectedPlatforms.length > 0 || audienceSize !== "Any size" || budget !== 600000 || minEngagement > 0 || query;

  function togglePlatform(platform: PlatformName) {
    setSelectedPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  }

  function clearFilters() {
    setQuery("");
    setNiche("All niches");
    setLocation("All locations");
    setSelectedPlatforms([]);
    setAudienceSize("Any size");
    setBudget(600000);
    setMinEngagement(0);
    setAiSummary("");
  }

  function runAiSearch(event?: FormEvent) {
    event?.preventDefault();
    const prompt = aiPrompt.toLowerCase().trim();
    if (!prompt) return;

    setQuery("");
    setNiche("All niches");
    setLocation("All locations");
    setSelectedPlatforms([]);
    setAudienceSize("Any size");
    setBudget(600000);
    setMinEngagement(0);

    const nicheTerms: [string[], string][] = [
      [["beauty", "skin", "makeup"], "Beauty & Skincare"],
      [["food", "restaurant"], "Food & Lifestyle"],
      [["tech", "phone", "app", "fintech"], "Tech & Gadgets"],
      [["fitness", "gym", "wellness"], "Fitness & Wellness"],
      [["finance", "money", "business", "sme"], "Finance & Business"],
      [["family", "parent", "home", "mum", "mom", "mother"], "Home & Family"],
      [["comedy", "skit", "entertainment"], "Comedy & Entertainment"],
      [["fashion", "style", "clothing"], "Fashion & Style"],
      [["travel", "hotel", "tourism"], "Travel & Culture"],
    ];
    const matchedNiche = nicheTerms.find(([terms]) => terms.some((term) => prompt.includes(term)))?.[1];
    if (matchedNiche) setNiche(matchedNiche);

    const matchedLocation = locations.slice(1).find((item) => prompt.includes(item.toLowerCase()));
    if (matchedLocation) setLocation(matchedLocation);

    const mentionedPlatforms = platforms.filter((item) => prompt.includes(item.toLowerCase()) || (item === "X" && (prompt.includes("twitter") || /\bx\b/.test(prompt))));
    if (mentionedPlatforms.length) setSelectedPlatforms(mentionedPlatforms);
    if (prompt.includes("micro")) setAudienceSize("Micro · 10K–100K");
    if (prompt.includes("mid-tier") || prompt.includes("mid tier")) setAudienceSize("Mid-tier · 100K–500K");

    const budgetMatch = prompt.replace(/,/g, "").match(/(?:₦|ngn|budget(?:\s+of)?|under|below|max(?:imum)?)[\s:]*(\d{2,7})/i);
    if (budgetMatch) setBudget(Math.min(1500000, Math.max(50000, Number(budgetMatch[1]))));
    if (prompt.includes("high engagement")) setMinEngagement(6);

    setAiSummary(`I translated your brief into a creator search${matchedNiche ? ` for ${matchedNiche.toLowerCase()}` : ""}${matchedLocation ? ` in ${matchedLocation}` : " across Nigeria"}. The strongest matches balance audience relevance, engagement quality and your likely spend.`);
    window.setTimeout(() => document.getElementById("creator-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function toggleSaved(id: number) {
    const isSaved = saved.includes(id);
    setToast(isSaved ? "Removed from shortlist" : "Added to shortlist");
    writeStored(storageKeys.shortlist, isSaved ? saved.filter((item) => item !== id) : [...saved, id]);
  }

  function openCreator(creator: Creator) {
    if (!account && !profileViews.includes(creator.id) && profileViews.length >= 3) {
      setSignupGate(true);
      return;
    }
    if (!account && !profileViews.includes(creator.id)) {
      const next = [...profileViews, creator.id];
      writeStored(storageKeys.profileViews, next);
    }
    setSelectedCreator(creator);
    setProfileTab("overview");
    setContacting(false);
    setMessageSent(false);
  }

  return (
    <main>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="CreatorRadar home">
            <span className="radar-logo"><span /></span>
            <span>Creator<span>Radar</span></span>
          </a>
          <nav className={`main-nav ${mobileMenu ? "open" : ""}`} aria-label="Primary navigation">
            <a className="active" href="#creator-results" onClick={() => setMobileMenu(false)}>Explore creators</a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
            <a href="/pricing" onClick={() => setMobileMenu(false)}>Pricing</a>
            <a href="/join/creator" onClick={() => setMobileMenu(false)}>For creators</a>
            <button type="button" onClick={() => { setToast(`${saved.length} creator${saved.length === 1 ? "" : "s"} in your shortlist`); setMobileMenu(false); }}>
              Shortlist <span className="nav-count">{saved.length}</span>
            </button>
          </nav>
          <div className="topbar-actions">
            <span className="market-pill"><span className="flag-dot">NG</span> Nigeria <span className="down">⌄</span></span>
            <a className="business-button" href={account ? (account.role === "creator" ? "/dashboard/creator" : "/dashboard/business") : "/join/business"}>{account ? "Dashboard" : "For businesses"}</a>
            <button className="mobile-menu-button" type="button" aria-label="Toggle menu" onClick={() => setMobileMenu((value) => !value)}><Icon name="menu" /></button>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow"><span className="live-dot" /> Nigeria&apos;s creator intelligence marketplace</span>
            <h1>Find the right creator.<br/><em>Before you spend a kobo.</em></h1>
            <p>Discover Nigerian creators by niche, audience quality and price—across Instagram, TikTok, YouTube and X.</p>
            <div className="source-row" aria-label="Supported platforms">
              {platforms.map((platform) => <PlatformPill key={platform} platform={platform} showName />)}
              <span className="refresh-note"><span /> Public data refreshed daily</span>
            </div>
          </div>

          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-avatar"><Icon name="spark" size={20} /></span>
              <div><strong>Ask Radar AI</strong><small>Describe the creator you need</small></div>
              <span className="online-badge">Online</span>
            </div>
            <div className="ai-bubble">Tell me what you&apos;re promoting, who you want to reach and your budget. I&apos;ll build a shortlist.</div>
            <form className="ai-input-wrap" onSubmit={runAiSearch}>
              <textarea aria-label="Describe your ideal creator" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="e.g. I need 3 beauty creators in Lagos with high engagement, under ₦200,000 each..." />
              <div className="ai-input-footer"><span><Icon name="spark" size={14} /> AI-powered search</span><button type="submit" aria-label="Search with Radar AI"><Icon name="arrow" /></button></div>
            </form>
            <div className="prompt-suggestions">
              {["Food creators in Lagos", "Tech creators under ₦300,000", "High-engagement mums in Kano"].map((prompt) => (
                <button key={prompt} type="button" onClick={() => { setAiPrompt(prompt); window.setTimeout(() => { const form = document.querySelector(".ai-input-wrap") as HTMLFormElement | null; form?.requestSubmit(); }, 0); }}>{prompt}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="demo-notice">
        <span><Icon name="shield" size={16} /></span>
        <p><strong>Product demo:</strong> Profiles and rates below are illustrative. Live creator data should come from permitted platform APIs and creator-submitted rate cards.</p>
        {!account && <a className="guest-profile-meter" href="/join/business"><strong>{Math.max(0, 3 - profileViews.length)}</strong><span>free profile view{3 - profileViews.length === 1 ? "" : "s"} left</span></a>}
      </div>

      <section className="marketplace" id="creator-results">
        <div className="results-heading">
          <div>
            <span className="section-kicker">Creator discovery</span>
            <h2>Creators your customers already trust</h2>
            <p>Compare reach, real engagement signals and starting rates in one place.</p>
          </div>
          <button className="mobile-filter-trigger" type="button" onClick={() => setMobileFilters(true)}><Icon name="filter" /> Filters {hasFilters && <span />}</button>
        </div>

        <div className="market-grid">
          <aside className={`filters ${mobileFilters ? "mobile-open" : ""}`} aria-label="Creator filters">
            <div className="filter-mobile-head"><strong>Filter creators</strong><button type="button" onClick={() => setMobileFilters(false)} aria-label="Close filters"><Icon name="close" /></button></div>
            <div className="filter-title-row"><h3>Filters</h3>{hasFilters && <button type="button" onClick={clearFilters}>Reset all</button>}</div>

            <div className="filter-group">
              <label>Platform</label>
              <div className="platform-filters">
                {platforms.map((platform) => (
                  <button key={platform} type="button" className={selectedPlatforms.includes(platform) ? "selected" : ""} onClick={() => togglePlatform(platform)}>
                    <PlatformPill platform={platform} /> <span>{platform}</span>{selectedPlatforms.includes(platform) && <Icon name="check" size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="niche">Niche</label>
              <select id="niche" value={niche} onChange={(event) => setNiche(event.target.value)}>{niches.map((item) => <option key={item}>{item}</option>)}</select>
            </div>

            <div className="filter-group">
              <label htmlFor="location">Location</label>
              <select id="location" value={location} onChange={(event) => setLocation(event.target.value)}>{locations.map((item) => <option key={item}>{item}</option>)}</select>
            </div>

            <div className="filter-group">
              <label htmlFor="audience">Audience size</label>
              <select id="audience" value={audienceSize} onChange={(event) => setAudienceSize(event.target.value)}>
                {["Any size", "Nano · under 10K", "Micro · 10K–100K", "Mid-tier · 100K–500K", "Macro · 500K+"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div className="filter-group range-group">
              <div className="range-label"><label htmlFor="budget">Starting rate up to</label><strong>{formatNaira(budget)}</strong></div>
              <input id="budget" type="range" min="50000" max="600000" step="25000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
              <div className="range-minmax"><span>₦50K</span><span>₦600K+</span></div>
            </div>

            <div className="filter-group range-group">
              <div className="range-label"><label htmlFor="engagement">Min. engagement</label><strong>{minEngagement.toFixed(1)}%</strong></div>
              <input id="engagement" type="range" min="0" max="10" step="0.5" value={minEngagement} onChange={(event) => setMinEngagement(Number(event.target.value))} />
              <div className="range-minmax"><span>Any</span><span>10%+</span></div>
            </div>

            <div className="filter-tip">
              <span><Icon name="spark" size={16} /></span>
              <p><strong>Not sure what to pick?</strong> Ask Radar AI above and it will set the right filters for your brief.</p>
            </div>
            <button className="mobile-apply" type="button" onClick={() => setMobileFilters(false)}>Show {results.length} creators</button>
          </aside>

          <div className="results-column">
            {aiSummary && (
              <div className="ai-result-note">
                <span><Icon name="spark" /></span>
                <div><strong>Radar AI has refined your search</strong><p>{aiSummary}</p></div>
                <button type="button" onClick={() => setAiSummary("")} aria-label="Dismiss AI summary"><Icon name="close" size={16} /></button>
              </div>
            )}

            <div className="results-toolbar">
              <div className="search-box"><Icon name="search" /><input aria-label="Search creators" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, niche or keyword" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={14} /></button>}</div>
              <div className="result-count"><strong>{results.length}</strong> creator{results.length === 1 ? "" : "s"} found</div>
              <label className="sort-control"><span>Sort:</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>{["Best match", "Highest engagement", "Largest audience", "Lowest rate"].map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>

            {results.length > 0 ? (
              <div className="creator-list">
                {results.map((creator) => (
                  <article className="creator-card" key={creator.id}>
                    <div className="match-rail"><span>{creator.match}%</span><small>match</small></div>
                    <div className={`creator-avatar ${creator.color}`}><span>{creator.initials}</span><i /></div>
                    <div className="creator-main">
                      <div className="creator-name-row">
                        <div><h3>{creator.name}{creator.verified && <span className="verified" title="Identity verified"><Icon name="check" size={11} /></span>}</h3><p>{creator.handle}</p></div>
                        <button className={`save-button ${saved.includes(creator.id) ? "saved" : ""}`} type="button" aria-label={saved.includes(creator.id) ? "Remove from shortlist" : "Add to shortlist"} onClick={() => toggleSaved(creator.id)}><Icon name="heart" size={18} /></button>
                      </div>
                      <div className="creator-meta"><span>{creator.niche}</span><span><Icon name="pin" size={13} />{creator.location}</span></div>
                      <div className="creator-tags">{creator.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                      <div className="platform-row">
                        {creator.platforms.map((platform) => (
                          <a href={platform.url} target="_blank" rel="noreferrer" key={platform.name} aria-label={`Open ${creator.name} on ${platform.name}`}>
                            <PlatformPill platform={platform.name} /><span><strong>{formatCount(platform.followers)}</strong><small>{platform.engagement}% eng.</small></span><Icon name="external" size={12} />
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="creator-stats">
                      <div><span><Icon name="users" size={16} /> Total following</span><strong>{formatCount(creator.followers)}</strong></div>
                      <div><span><Icon name="trend" size={16} /> Engagement</span><strong className="good">{creator.engagement}%</strong></div>
                      <div><span>Starting from</span><strong>{formatNaira(creator.fromRate)}</strong><small>per post · self-reported</small></div>
                    </div>
                    <div className="creator-actions">
                      <button className="view-button" type="button" onClick={() => openCreator(creator)}>View profile <Icon name="chevron" size={15} /></button>
                      <span className="availability"><i /> {creator.availability}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state"><span><Icon name="search" size={28} /></span><h3>No exact matches yet</h3><p>Try widening your budget, location or audience-size filters.</p><button type="button" onClick={clearFilters}>Clear all filters</button></div>
            )}
          </div>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-copy"><span className="section-kicker light">One brief. Better matches.</span><h2>From “who should we use?”<br/>to a confident shortlist.</h2><p>CreatorRadar brings fragmented public signals and creator-submitted commercial information into one clear workflow.</p><button type="button" onClick={() => document.getElementById("top")?.scrollIntoView({ behavior: "smooth" })}>Start a creator search <Icon name="arrow" /></button><div className="role-links"><a href="/join/business">Create business workspace</a><a href="/join/creator">Join as a creator</a></div></div>
        <div className="how-steps">
          <div><span>01</span><section><strong>Describe your campaign</strong><p>Tell Radar AI your product, customer, market and spend.</p></section></div>
          <div><span>02</span><section><strong>Compare verified signals</strong><p>Review audience fit, engagement, platforms and price.</p></section></div>
          <div><span>03</span><section><strong>Contact with context</strong><p>Send your brief, request current rates and build a shortlist.</p></section></div>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="radar-logo"><span /></span><span>Creator<span>Radar</span></span></a>
        <p>Creator intelligence built for Nigerian businesses.</p>
        <span><a href="/pricing">Pricing</a> · <a href="/join/creator">Creator signup</a> · © 2026 CreatorRadar</span>
      </footer>

      {mobileFilters && <button className="mobile-overlay" type="button" aria-label="Close filters" onClick={() => setMobileFilters(false)} />}

      {selectedCreator && (
        <div className="profile-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelectedCreator(null); }}>
          <aside className="profile-drawer" role="dialog" aria-modal="true" aria-label={`${selectedCreator.name} creator profile`}>
            <div className="profile-topbar">
              <button type="button" onClick={() => setSelectedCreator(null)}><Icon name="close" /> Close</button>
              <button className={`save-text-button ${saved.includes(selectedCreator.id) ? "saved" : ""}`} type="button" onClick={() => toggleSaved(selectedCreator.id)}><Icon name="heart" size={17} />{saved.includes(selectedCreator.id) ? "Shortlisted" : "Add to shortlist"}</button>
            </div>
            <div className="profile-scroll">
              <div className="profile-identity">
                <div className={`profile-avatar ${selectedCreator.color}`}>{selectedCreator.initials}<i /></div>
                <div><div className="profile-name"><h2>{selectedCreator.name}</h2>{selectedCreator.verified && <span className="verified"><Icon name="check" size={12} /></span>}</div><p>{selectedCreator.handle}</p><div className="profile-meta"><span>{selectedCreator.niche}</span><span><Icon name="pin" size={13} />{selectedCreator.location}, Nigeria</span></div></div>
              </div>
              <div className="profile-score-row">
                <div><strong>{selectedCreator.match}%</strong><span>Radar match</span></div>
                <div><strong>{formatCount(selectedCreator.followers)}</strong><span>Total following</span></div>
                <div><strong>{selectedCreator.engagement}%</strong><span>Engagement</span></div>
                <div><strong>{formatCount(selectedCreator.avgViews)}</strong><span>Avg. views</span></div>
              </div>
              <div className="profile-tabs" role="tablist">
                {(["overview", "rates", "audience"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={profileTab === tab} className={profileTab === tab ? "active" : ""} onClick={() => setProfileTab(tab)}>{tab}</button>)}
              </div>

              {profileTab === "overview" && (
                <div className="profile-panel">
                  <section><h3>About</h3><p className="bio-text">{selectedCreator.bio}</p><div className="creator-tags profile-tags">{selectedCreator.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></section>
                  <section><div className="panel-heading"><h3>Platform presence</h3><small>Last checked today</small></div><div className="platform-detail-list">{selectedCreator.platforms.map((platform) => <a key={platform.name} href={platform.url} target="_blank" rel="noreferrer"><PlatformPill platform={platform.name} /><div><strong>{platform.name}</strong><span>{platform.handle}</span></div><div><strong>{formatCount(platform.followers)}</strong><span>{platform.engagement}% engagement</span></div><Icon name="external" size={15} /></a>)}</div></section>
                  <section><h3>Performance signals</h3><div className="signal-grid"><div><span>Audience quality</span><strong>Excellent</strong><small>Low suspicious activity</small></div><div><span>Posting consistency</span><strong>4.2×</strong><small>posts per week</small></div><div><span>Brand safety</span><strong>Low risk</strong><small>Public-content scan</small></div></div></section>
                </div>
              )}

              {profileTab === "rates" && (
                <div className="profile-panel">
                  <div className="rate-note"><Icon name="shield" size={18} /><p><strong>Creator-submitted rate card</strong><span>Last confirmed 5 days ago. Final pricing may vary by scope, usage and exclusivity.</span></p></div>
                  <section><h3>Available packages</h3><div className="package-list">{selectedCreator.packages.map((item, index) => <div key={item.title}><span className="package-number">0{index + 1}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div><strong>{formatNaira(item.price)}</strong></div>)}</div></section>
                  <section className="rate-extras"><h3>Commercial notes</h3><div><span>Content usage</span><strong>Quoted separately</strong></div><div><span>Category exclusivity</span><strong>From +20%</strong></div><div><span>Typical turnaround</span><strong>5–7 working days</strong></div></section>
                </div>
              )}

              {profileTab === "audience" && (
                <div className="profile-panel">
                  <section><h3>Audience snapshot</h3><div className="audience-cards"><div><span>Nigeria audience</span><strong>{selectedCreator.audienceNigeria}%</strong><div><i style={{ width: `${selectedCreator.audienceNigeria}%` }} /></div></div><div><span>Women</span><strong>{selectedCreator.audienceWomen}%</strong><div><i style={{ width: `${selectedCreator.audienceWomen}%` }} /></div></div><div><span>Core age</span><strong>{selectedCreator.ageRange}</strong><small>Highest concentration</small></div></div></section>
                  <section><h3>Top audience locations</h3><div className="location-bars"><div><span>Lagos</span><i><b style={{ width: "78%" }} /></i><strong>39%</strong></div><div><span>Abuja</span><i><b style={{ width: "42%" }} /></i><strong>21%</strong></div><div><span>Other Nigeria</span><i><b style={{ width: "56%" }} /></i><strong>28%</strong></div><div><span>Outside Nigeria</span><i><b style={{ width: "24%" }} /></i><strong>12%</strong></div></div></section>
                  <section className="method-note"><Icon name="shield" size={17} /><p>Audience insights combine permitted public platform signals with creator-submitted analytics. Figures are directional until verified for a campaign.</p></section>
                </div>
              )}
            </div>
            <div className="profile-contact-bar">
              <div><span>Starting from</span><strong>{formatNaira(selectedCreator.fromRate)}</strong><small><Icon name="clock" size={12} /> {selectedCreator.responseTime}</small></div>
              <button type="button" onClick={() => { if (account?.role === "business") { setContacting(true); setMessageSent(false); } else { setSignupGate(true); } }}>Request rate & availability <Icon name="arrow" /></button>
            </div>

            {contacting && (
              <div className="contact-sheet">
                <button className="contact-backdrop" type="button" aria-label="Close contact form" onClick={() => setContacting(false)} />
                <div className="contact-card" role="dialog" aria-modal="true" aria-label={`Contact ${selectedCreator.name}`}>
                  <button className="contact-close" type="button" onClick={() => setContacting(false)} aria-label="Close"><Icon name="close" /></button>
                  {!messageSent ? (
                    <form onSubmit={(event) => { event.preventDefault(); setMessageSent(true); }}>
                      <span className="contact-icon"><Icon name="message" /></span>
                      <h3>Contact {selectedCreator.name}</h3>
                      <p>Share a short campaign brief. We&apos;ll request their latest rate and availability without exposing private contact details.</p>
                      <label>Business name<input required placeholder="e.g. Naya Skincare" /></label>
                      <label>Work email<input required type="email" placeholder="you@business.com" /></label>
                      <label>Campaign brief<textarea required defaultValue={`Hi ${selectedCreator.name.split(" ")[0]}, we're interested in working with you on an upcoming campaign. Please share your latest rates and availability.`} /></label>
                      <button type="submit">Send rate request <Icon name="arrow" /></button>
                      <small>By sending, you agree to keep communication professional and campaign-related.</small>
                    </form>
                  ) : (
                    <div className="sent-state"><span><Icon name="check" size={28} /></span><h3>Request sent</h3><p>{selectedCreator.name} will receive your brief. We&apos;ll notify you when their latest rate and availability come in.</p><button type="button" onClick={() => setContacting(false)}>Done</button></div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {signupGate && (
        <div className="access-gate-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSignupGate(false); }}>
          <section className="access-gate" role="dialog" aria-modal="true" aria-label="Create an account to continue">
            <button className="gate-close" type="button" onClick={() => setSignupGate(false)} aria-label="Close"><Icon name="close" /></button>
            <span className="gate-icon"><span className="radar-logo"><span /></span></span>
            <span className="section-kicker">Keep exploring</span>
            <h2>You&apos;ve viewed your three free creator profiles.</h2>
            <p>Create a free business workspace to unlock unlimited profile access, keep your shortlist and request current rates.</p>
            <div className="gate-benefits"><span><Icon name="check" size={15} /> Unlimited creator profiles</span><span><Icon name="check" size={15} /> Persistent shortlists</span><span><Icon name="check" size={15} /> Rate requests</span></div>
            <a className="gate-primary" href="/join/business">Create free business workspace <Icon name="arrow" /></a>
            <a className="gate-secondary" href="/join/creator">I&apos;m a creator</a>
            <small>No card required. Your shortlist will be waiting.</small>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><Icon name="check" size={15} />{toast}</div>}
    </main>
  );
}

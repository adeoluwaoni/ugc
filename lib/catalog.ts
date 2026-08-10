export type CatalogCreator = {
  id: number;
  name: string;
  handle: string;
  niche: string;
  location: string;
  followers: string;
  engagement: string;
  rate: string;
  initials: string;
  color: string;
};

export const creatorCatalog: CatalogCreator[] = [
  { id: 1, name: "Ada Nwosu", handle: "@adaeatslagos", niche: "Food & Lifestyle", location: "Lagos", followers: "286K", engagement: "6.8%", rate: "₦180,000", initials: "AN", color: "coral" },
  { id: 2, name: "Tobi Adebayo", handle: "@tobitechng", niche: "Tech & Gadgets", location: "Lagos", followers: "185K", engagement: "5.1%", rate: "₦250,000", initials: "TA", color: "blue" },
  { id: 3, name: "Mariam Bello", handle: "@mariammakes", niche: "Beauty & Skincare", location: "Abuja", followers: "92K", engagement: "8.2%", rate: "₦120,000", initials: "MB", color: "pink" },
  { id: 4, name: "Chinedu Okafor", handle: "@fitwithnedu", niche: "Fitness & Wellness", location: "Port Harcourt", followers: "72K", engagement: "7.6%", rate: "₦95,000", initials: "CO", color: "green" },
  { id: 5, name: "Kemi Onasanya", handle: "@moneywithkemi", niche: "Finance & Business", location: "Lagos", followers: "153K", engagement: "4.7%", rate: "₦220,000", initials: "KO", color: "gold" },
  { id: 6, name: "Zainab Sani", handle: "@zainabathome", niche: "Home & Family", location: "Kano", followers: "64K", engagement: "9.4%", rate: "₦85,000", initials: "ZS", color: "purple" },
  { id: 7, name: "Femi Oladele", handle: "@femirolls", niche: "Comedy & Entertainment", location: "Ibadan", followers: "411K", engagement: "6.1%", rate: "₦350,000", initials: "FO", color: "orange" },
  { id: 8, name: "Dami Eze", handle: "@damibuilds", niche: "Business & Career", location: "Enugu", followers: "50K", engagement: "8.7%", rate: "₦70,000", initials: "DE", color: "teal" },
  { id: 9, name: "Reni Ajayi", handle: "@styledbyreni", niche: "Fashion & Style", location: "Lagos", followers: "122K", engagement: "7.3%", rate: "₦175,000", initials: "RA", color: "red" },
  { id: 10, name: "Seyi Balogun", handle: "@seesouthwithseyi", niche: "Travel & Culture", location: "Calabar", followers: "107K", engagement: "6.9%", rate: "₦160,000", initials: "SB", color: "sky" },
];


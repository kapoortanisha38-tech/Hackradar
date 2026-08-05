export interface Hackathon {
  id: number;
  title: string;
  organizer: string;
  mode: string;
  location: string;
  prize: string;
  deadline: string;
  teamSize: string;
  tags: string[];
  requiredSkills: string[];
  applyLink: string;
  description?: string;
  isBeginnerFriendly?: boolean;
  isStudentOnly?: boolean;
}

export const hackathons: Hackathon[] = [
  {
    id: 1,
    title: "AI Innovation Challenge",
    organizer: "Google",
    mode: "Online",
    location: "Worldwide",
    prize: "$10,000",
    deadline: "15 July 2026",
    teamSize: "4 Members",
    tags: ["AI", "ML", "GenAI", "Online"],
    requiredSkills: ["Python", "Machine Learning", "AI", "React"],
    applyLink: "https://developers.google.com/community",
    description: "An online global AI challenge open to developers building innovative ML tools.",
    isBeginnerFriendly: true,
    isStudentOnly: false,
  },
  {
    id: 2,
    title: "Smart India Hackathon",
    organizer: "Government of India",
    mode: "Offline",
    location: "India",
    prize: "₹1,00,000",
    deadline: "30 July 2026",
    teamSize: "6 Members",
    tags: ["Web", "IoT", "AI", "Offline"],
    requiredSkills: ["React", "Firebase", "JavaScript", "Python"],
    applyLink: "https://www.sih.gov.in/",
    description: "Nationwide offline hackathon for college students solving real-world problems.",
    isBeginnerFriendly: true,
    isStudentOnly: true,
  },
  {
    id: 3,
    title: "Microsoft Imagine Cup",
    organizer: "Microsoft",
    mode: "Online",
    location: "Global",
    prize: "$100,000",
    deadline: "20 August 2026",
    teamSize: "3 Members",
    tags: ["Cloud", "AI", "Web", "Online"],
    requiredSkills: ["Azure", "Python", "AI", "Cloud"],
    applyLink: "https://imaginecup.microsoft.com/",
    description: "Global online technology competition for student entrepreneurs.",
    isBeginnerFriendly: false,
    isStudentOnly: true,
  },
  {
    id: 4,
    title: "Open Source Sprint",
    organizer: "GitHub",
    mode: "Online",
    location: "Worldwide",
    prize: "$5,000",
    deadline: "5 August 2026",
    teamSize: "5 Members",
    tags: ["Open Source", "React", "Node", "Online"],
    requiredSkills: ["React", "Node", "Git", "JavaScript"],
    applyLink: "https://github.com/events",
    description: "Collaborative online open-source sprint for web developers.",
    isBeginnerFriendly: true,
    isStudentOnly: false,
  },
];
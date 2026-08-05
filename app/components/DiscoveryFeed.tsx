"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { hackathons } from "../data/hackathons";
import { calculateMatchScore } from "../utils/calculateMatchScore";
import { calculateDaysLeft } from "../utils/calculateDaysLeft";

type DiscoveryFeedProps = {
  resumeSkills: string[];
};

const filterChips = [
  "All",
  "Online",
  "Offline",
  "Beginner Friendly",
  "Student Only",
  "Team",
  "Prize ₹1L+",
];

export default function DiscoveryFeed({ resumeSkills }: DiscoveryFeedProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const loadFavorites = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const favoritesRef = collection(db, "users", user.uid, "favorites");
      const snapshot = await getDocs(favoritesRef);

      const savedTitles = snapshot.docs.map((doc) => doc.id);
      setFavorites(savedTitles);
    };

    loadFavorites();
  }, []);

  const saveFavorite = async (hackathon: any) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in first!");
      return;
    }

    const favoriteRef = doc(
      db,
      "users",
      user.uid,
      "favorites",
      hackathon.title
    );

    try {
      if (favorites.includes(hackathon.title)) {
        await deleteDoc(favoriteRef);

        setFavorites((prev) =>
          prev.filter((title) => title !== hackathon.title)
        );

        alert("Removed from favorites!");
      } else {
        await setDoc(favoriteRef, {
          ...hackathon,
          savedAt: new Date(),
        });

        setFavorites((prev) => [...prev, hackathon.title]);

        alert("Hackathon added to favorites!");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

const filteredHackathons = hackathons.filter((hackathon: any) => {
    const searchableText = [
      hackathon.title,
      hackathon.organizer,
      hackathon.mode,
      hackathon.description,
      (hackathon.tags || []).join(" "),
      (hackathon.requiredSkills || []).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchTerm
      ? searchableText.includes(searchTerm.toLowerCase())
      : true;

    const tags = (hackathon.tags || []).map((t: string) => t.toLowerCase());
    const mode = (hackathon.mode || "").toLowerCase();
    const title = (hackathon.title || "").toLowerCase();
    const description = (hackathon.description || "").toLowerCase();
    const fullContent = `${title} ${description} ${tags.join(" ")}`.toLowerCase();

    let matchesFilter = activeFilter === "All";

    if (activeFilter === "Online") {
      matchesFilter =
        mode.includes("online") ||
        tags.some((t: string) => t.includes("online")) ||
        title.includes("online");
    } else if (activeFilter === "Offline") {
      matchesFilter =
        mode.includes("offline") ||
        mode.includes("in-person") ||
        tags.some((t: string) => t.includes("offline") || t.includes("in-person")) ||
        title.includes("offline");
    } else if (activeFilter === "Beginner Friendly") {
      matchesFilter =
        Boolean(hackathon.isBeginnerFriendly) ||
        fullContent.includes("beginner") ||
        fullContent.includes("easy") ||
        fullContent.includes("novice") ||
        fullContent.includes("starter") ||
        fullContent.includes("open to all");
    } else if (activeFilter === "Student Only") {
      matchesFilter =
        Boolean(hackathon.isStudentOnly) ||
        fullContent.includes("student") ||
        fullContent.includes("college") ||
        fullContent.includes("university") ||
        fullContent.includes("sih") || // Smart India Hackathon
        fullContent.includes("imagine cup"); // Imagine Cup
    } else if (activeFilter === "Team") {
      matchesFilter =
        (hackathon.teamSize &&
          hackathon.teamSize !== "1" &&
          hackathon.teamSize.toLowerCase() !== "solo") ||
        tags.some((t: string) => t.includes("team") || t.includes("group"));
    } else if (activeFilter === "Prize ₹1L+") {
      matchesFilter =
        hackathon.prize?.includes("₹1,00,000") ||
        hackathon.prize?.includes("1L") ||
        hackathon.prize?.includes("1,00,000") ||
        hackathon.prize?.includes("$");
    }

    return matchesSearch && matchesFilter;
  });

  const hackathonsWithScore = filteredHackathons.map((hackathon: any) => {
    const match = calculateMatchScore(resumeSkills, hackathon.requiredSkills);

    return {
      ...hackathon,
      match,
    };
  });

  const recommendedHackathons = hackathonsWithScore
    .filter((hackathon: any) => hackathon.match.score >= 70)
    .sort((a: any, b: any) => b.match.score - a.match.score);

  const exploreMoreHackathons = hackathonsWithScore.filter(
    (hackathon: any) => hackathon.match.score < 70
  );

  const renderHackathonCard = (hackathon: any) => (
    <div
      key={hackathon.title}
      className="rounded-2xl border border-gray-800 bg-[#11151D] p-6 hover:border-cyan-400/40"
    >
      <p className="text-xs uppercase tracking-wider text-gray-500">
        {hackathon.organizer}
      </p>

      <h3 className="mt-3 text-xl font-bold">{hackathon.title}</h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {hackathon.tags.map((tag: string) => (
          <span
            key={tag}
            className="rounded-md bg-[#161B25] px-3 py-1 text-xs text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3">
        <p className="text-sm font-semibold text-cyan-300">
          AI Match Score: {hackathon.match.score}%
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Matched skills: {hackathon.match.matchedSkills.length}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-800 bg-[#161B25] p-3">
        <p className="text-sm font-semibold text-green-300">You Have</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {hackathon.match.matchedSkills.length > 0 ? (
            hackathon.match.matchedSkills.map((skill: string) => (
              <span
                key={skill}
                className="rounded-md bg-green-500/10 px-2 py-1 text-xs text-green-300"
              >
                ✓ {skill}
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-500">
              No matching skills found yet.
            </p>
          )}
        </div>

        <p className="mt-4 text-sm font-semibold text-amber-300">
          Need to Learn
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {hackathon.requiredSkills
            .filter(
              (skill: string) =>
                !hackathon.match.matchedSkills
                  .map((matchedSkill: string) => matchedSkill.toLowerCase())
                  .includes(skill.toLowerCase())
            )
            .map((skill: string) => (
              <span
                key={skill}
                className="rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-300"
              >
                {skill}
              </span>
            ))}
        </div>
      </div>

      <div className="mt-6 space-y-2 text-sm text-gray-400">
        <div className="flex justify-between">
          <span>Prize pool</span>
          <span className="font-bold text-amber-400">{hackathon.prize}</span>
        </div>

        <div className="flex justify-between">
          <span>Team size</span>
          <span>{hackathon.teamSize}</span>
        </div>

        <div className="flex justify-between">
          <span>Closes in</span>
          <span className="font-bold text-red-300">
            ⏰ {calculateDaysLeft(hackathon.deadline)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => saveFavorite(hackathon)}
          className="text-2xl hover:scale-110 transition cursor-pointer"
        >
          {favorites.includes(hackathon.title) ? "❤️" : "🤍"}
        </button>

        <button
          onClick={() => window.open(hackathon.applyLink, "_blank")}
          className="font-semibold text-cyan-300 cursor-pointer hover:text-cyan-200"
        >
          Apply →
        </button>
      </div>
    </div>
  );

  return (
    <section className="bg-[#0B0E14] px-8 py-20 text-white border-t border-gray-800">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold">Discovery Feed</h2>

        <p className="mt-2 text-gray-400">
          Personalized hackathons based on your resume skills
        </p>

        {resumeSkills.length === 0 && (
          <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            Upload your resume above to see your personalized AI Match Score.
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-800 bg-[#11151D] p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-[#161B25] px-4 py-3 text-white outline-none"
            placeholder="Search: AI, Web Dev, Blockchain, Online..."
          />

          <div className="mt-4 flex flex-wrap gap-3">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`rounded-full border px-4 py-2 text-sm cursor-pointer transition ${
                  activeFilter === chip
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                    : "border-gray-700 text-gray-300 hover:border-cyan-400/50"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {recommendedHackathons.length > 0 && (
          <div className="mt-10">
            <h3 className="text-2xl font-bold">Recommended for You</h3>
            <p className="mt-1 text-sm text-gray-400">
              Best matches based on your uploaded resume skills.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {recommendedHackathons.map(renderHackathonCard)}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h3 className="text-2xl font-bold">Explore More</h3>
          <p className="mt-1 text-sm text-gray-400">
            Other hackathons you can still explore and apply for.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {exploreMoreHackathons.map(renderHackathonCard)}
          </div>
        </div>

      {filteredHackathons.length === 0 && (
          <p className="mt-8 text-center text-gray-400">
            No hackathons found for "{searchTerm.trim() ? searchTerm : activeFilter}".
          </p>
        )}
      </div>
    </section>
  );
}
"use client";

import { useState, useEffect } from "react";
import { getDaysLeft } from "../utils/getDaysLeft";
import { calculateMatch } from "../utils/calculateMatch";
import { getRecommendationReason } from "../utils/getRecommendationReason";
import { hackathons as staticHackathons } from "../data/hackathons";

// Replace with Firestore imports if fetching directly from Firebase
// import { db } from "../firebase";
// import { collection, getDocs } from "firebase/firestore";

type Hackathon = {
  id: number;
  title: string;
  organizer: string;
  prize: string;
  deadline: string;
  teamSize: string;
  mode: string;
  tags: string[];
};

const userSkills = [
  "AI",
  "ML",
  "React",
  "Next.js",
  "Firebase",
  "TypeScript",
  "Python",
];

type TrendingSectionProps = {
  searchText: string;
  selectedTag: string;
  sortOrder: string;
  savedHackathons: number[];
  setSavedHackathons: (ids: number[]) => void;
};

export default function TrendingSection({
  searchText,
  selectedTag,
  sortOrder,
  savedHackathons,
  setSavedHackathons,
}: TrendingSectionProps) {
  const [allHackathons, setAllHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch dynamic hackathons (e.g. from Firebase or an API route)
  useEffect(() => {
    async function fetchHackathons() {
      try {
        setLoading(true);
        
        // Option A: API Endpoint Fetch
        const res = await fetch("/api/hackathons");
        if (res.ok) {
          const data = await res.json();
          setAllHackathons(data);
        } else {
          // Fallback to static dataset if API route isn't set up yet
          setAllHackathons(staticHackathons);
        }

        /* 
        // Option B: Direct Firebase Firestore Fetch
        const querySnapshot = await getDocs(collection(db, "hackathons"));
        const fetchedData: Hackathon[] = querySnapshot.docs.map((doc) => ({
          id: doc.id as unknown as number,
          ...doc.data(),
        })) as Hackathon[];
        setAllHackathons(fetchedData);
        */
      } catch (err) {
        console.error("Failed to load live hackathons, using static fallback:", err);
        setAllHackathons(staticHackathons);
      } finally {
        setLoading(false);
      }
    }

    fetchHackathons();
  }, []);

  const filteredHackathons = allHackathons
    .filter((hackathon) => {
      const matchesSearch =
        hackathon.title.toLowerCase().includes(searchText.toLowerCase()) ||
        hackathon.organizer.toLowerCase().includes(searchText.toLowerCase()) ||
        hackathon.tags.some((tag) =>
          tag.toLowerCase().includes(searchText.toLowerCase())
        );

      const matchesTag =
        selectedTag === "All" || hackathon.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortOrder === "match") {
        const matchA = calculateMatch(userSkills, a.tags).score;
        const matchB = calculateMatch(userSkills, b.tags).score;
        return matchB - matchA;
      }

      if (sortOrder === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }

      if (sortOrder === "prize") {
        const prizeA = Number(a.prize.replace(/[^0-9]/g, "")) || 0;
        const prizeB = Number(b.prize.replace(/[^0-9]/g, "")) || 0;
        return prizeB - prizeA;
      }

      if (sortOrder === "team") {
        const teamA = Number(a.teamSize.replace(/[^0-9]/g, "")) || 0;
        const teamB = Number(b.teamSize.replace(/[^0-9]/g, "")) || 0;
        return teamA - teamB;
      }

      return 0;
    });

  function toggleSave(id: number) {
    if (savedHackathons.includes(id)) {
      setSavedHackathons(savedHackathons.filter((savedId) => savedId !== id));
    } else {
      setSavedHackathons([...savedHackathons, id]);
    }
  }

  return (
    <section className="border-t border-gray-800 bg-[#0B0E14] px-8 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold">Trending This Week</h2>

        <p className="mt-2 text-gray-400">
          Ranked by saves, applications, and AI relevance
        </p>

        {loading ? (
          <div className="mt-8 text-center text-cyan-400 font-semibold animate-pulse">
            Loading trending hackathons...
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {filteredHackathons.length > 0 ? (
              filteredHackathons.map((item) => {
                const match = calculateMatch(userSkills, item.tags);

                const recommendation = getRecommendationReason({
                  score: match.score,
                  matchedSkills: match.matchedSkills,
                  prize: item.prize,
                  mode: item.mode,
                });

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-800 bg-[#11151D] p-5 transition hover:border-cyan-500"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        onClick={() => toggleSave(item.id)}
                        className="text-2xl"
                      >
                        {savedHackathons.includes(item.id) ? "❤️" : "🤍"}
                      </button>

                      <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                        🤖 {match.score}% Match
                      </div>
                    </div>

                    <p className="text-sm font-bold text-amber-400">
                      {item.organizer}
                    </p>

                    <h3 className="mt-3 font-bold">{item.title}</h3>

                    <div className="mt-4 flex justify-between text-sm text-gray-400">
                      <span>{item.prize}</span>
                      <span>📅 {item.deadline}</span>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          getDaysLeft(item.deadline) === "Expired"
                            ? "bg-red-900/30 text-red-300"
                            : getDaysLeft(item.deadline) === "Last day"
                            ? "bg-orange-900/30 text-orange-300"
                            : "bg-yellow-900/30 text-yellow-300"
                        }`}
                      >
                        ⏳ {getDaysLeft(item.deadline)}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-400">
                      Team Size: {item.teamSize}
                    </div>

                    <div className="mt-4 rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-3">
                      <p className="text-xs font-bold text-cyan-300">
                        🧠 AI Recommendation
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white">
                        {recommendation.level}
                      </p>

                      <ul className="mt-2 space-y-1 text-xs text-gray-300">
                        {recommendation.reasons.map((reason) => (
                          <li key={reason}>✔ {reason}</li>
                        ))}
                      </ul>

                      <p className="mt-2 text-xs text-gray-400">
                        Confidence: {recommendation.confidence}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-400">
                        Matching Skills:
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {match.matchedSkills.length > 0 ? (
                          match.matchedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-green-900/30 px-3 py-1 text-xs text-green-300"
                            >
                              ✔ {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">
                            No direct skill match
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-cyan-900/30 px-3 py-1 text-xs text-cyan-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="col-span-4 text-center text-gray-400">
                No hackathons found.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
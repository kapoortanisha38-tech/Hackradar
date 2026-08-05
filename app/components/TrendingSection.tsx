"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { hackathons } from "../data/hackathons";
import { calculateMatchScore } from "../utils/calculateMatchScore";
import { calculateDaysLeft } from "../utils/calculateDaysLeft";

type TrendingSectionProps = {
  resumeSkills: string[];
};

export default function TrendingSection({ resumeSkills }: TrendingSectionProps) {
  const [favorites, setFavorites] = useState<string[]>([]);

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

    const favoriteRef = doc(db, "users", user.uid, "favorites", hackathon.title);

    try {
      if (favorites.includes(hackathon.title)) {
        await deleteDoc(favoriteRef);
        setFavorites((prev) => prev.filter((title) => title !== hackathon.title));
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

  return (
    <section className="bg-[#0B0E14] px-8 py-16 text-white border-t border-gray-800">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold">Trending This Week</h2>
        <p className="mt-2 text-gray-400">
          Ranked by saves, applications, and AI relevance
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {hackathons.map((hackathon: any) => {
            const match = calculateMatchScore(
              resumeSkills,
              hackathon.requiredSkills
            );

            return (
              <div
                key={hackathon.title}
                className="flex flex-col justify-between rounded-2xl border border-gray-800 bg-[#11151D] p-5 hover:border-cyan-400/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-amber-500 font-semibold">
                      {hackathon.organizer}
                    </p>
                    <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/20">
                      🤖 {match.score}% Match
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold">{hackathon.title}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-400">
                    <p>💰 <span className="text-white font-medium">{hackathon.prize}</span></p>
                    <p>📅 {hackathon.deadline}</p>
                    <p>⏰ <span className="text-amber-300">{calculateDaysLeft(hackathon.deadline)}</span></p>
                    <p>👥 Team Size: {hackathon.teamSize}</p>
                  </div>

                  <div className="mt-4 rounded-xl border border-gray-800 bg-[#161B25] p-3 text-xs">
                    <p className="font-semibold text-cyan-300">🧠 AI Recommendation</p>
                    <p className="mt-1 font-bold text-white">
                      {match.score >= 70 ? "Excellent Match" : "Low Match"}
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-400">
                      <li>✓ Matches your skills: {match.matchedSkills.join(", ") || "None"}</li>
                      <li>✓ Easy to join because it is {hackathon.mode?.toLowerCase() || "online"}</li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-400">Matching Skills:</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {match.matchedSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs text-green-300"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer with Apply Link & Favorite Button */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4">
                  <button
                    onClick={() => saveFavorite(hackathon)}
                    className="text-2xl hover:scale-110 transition cursor-pointer"
                  >
                    {favorites.includes(hackathon.title) ? "❤️" : "🤍"}
                  </button>

                  <button
                    onClick={() => window.open(hackathon.applyLink, "_blank")}
                    className="font-semibold text-cyan-300 cursor-pointer hover:text-cyan-200 text-sm"
                  >
                    Apply →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
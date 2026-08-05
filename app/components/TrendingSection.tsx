"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { calculateMatchScore } from "../utils/calculateMatchScore";
import { calculateDaysLeft } from "../utils/calculateDaysLeft";

type TrendingSectionProps = {
  resumeSkills?: string[];
  searchText?: string;
  selectedTag?: string;
  sortOrder?: string;
  savedHackathons?: (string | number)[];
  setSavedHackathons?: any;
};

export default function TrendingSection({ resumeSkills = [] }: TrendingSectionProps) {
  const [hackathonsList, setHackathonsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch live hackathons from Firestore
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const hackathonsRef = collection(db, "hackathons");
        const snapshot = await getDocs(hackathonsRef);
        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHackathonsList(fetchedData);
      } catch (error) {
        console.error("Error fetching live hackathons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  return (
    <section className="bg-[#0B0E14] px-8 py-16 text-white border-t border-gray-800">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold">Trending This Week</h2>
        <p className="mt-2 text-gray-400">
          Ranked dynamically by saves, applications, and AI relevance
        </p>

        {loading ? (
          <p className="mt-8 text-cyan-400">Loading live trending hackathons...</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {hackathonsList.map((hackathon: any) => {
              const match = calculateMatchScore(
                resumeSkills,
                hackathon.requiredSkills || []
              );

              return (
                <div
                  key={hackathon.id || hackathon.title}
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
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4">
                    <button className="text-2xl cursor-pointer">🤍</button>

                    <button
                      onClick={() => window.open(hackathon.applyLink, "_blank")}
                      className="font-semibold text-cyan-300 hover:text-cyan-200 text-sm cursor-pointer"
                    >
                      Apply →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
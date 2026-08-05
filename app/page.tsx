"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import SortBar from "./components/SortBar";
import LoginButton from "./components/LoginButton";
import TrendingSection from "./components/TrendingSection";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import Profile from "./components/Profile";
import DashboardStats from "./components/DashboardStats";
import DiscoveryFeed from "./components/DiscoveryFeed";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortOrder, setSortOrder] = useState("none");
 const [savedHackathons, setSavedHackathons] = useState<(string | number)[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    const savedSkills = localStorage.getItem("resumeSkills");

    if (savedSkills) {
      setResumeSkills(JSON.parse(savedSkills));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("resumeSkills", JSON.stringify(resumeSkills));
  }, [resumeSkills]);

  return (
    <main className="min-h-screen bg-[#0B0E14]">
      <Navbar />

      <div className="mx-auto flex max-w-6xl justify-end px-8 pt-6">
        <LoginButton user={user} setUser={setUser} />
      </div>

      <Hero />

      <SearchBar searchText={searchText} setSearchText={setSearchText} />

      <FilterBar selectedTag={selectedTag} setSelectedTag={setSelectedTag} />

      <SortBar sortOrder={sortOrder} setSortOrder={setSortOrder} />

      <TrendingSection
        searchText={searchText}
        selectedTag={selectedTag}
        sortOrder={sortOrder}
        savedHackathons={savedHackathons}
        setSavedHackathons={setSavedHackathons}
      />

      <ResumeAnalyzer setResumeSkills={setResumeSkills} />

      <Profile resumeSkills={resumeSkills} />

      <DashboardStats resumeSkills={resumeSkills} />

      <DiscoveryFeed resumeSkills={resumeSkills} />

      <Features />

      <Testimonials />

      <Footer />
    </main>
  );
}
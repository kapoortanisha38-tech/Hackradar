import { NextResponse } from "next/server";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

export async function GET() {
  try {
    // 1. Dynamic feed of trending hackathons with complete schema
    const incomingHackathons = [
      {
        title: "HackVerse 2026",
        organizer: "NITK",
        prize: "₹2,50,000",
        deadline: "20 August 2026",
        teamSize: "2-4 Members",
        mode: "Offline",
        location: "India",
        tags: ["Web", "AI", "Cloud", "Offline"],
        requiredSkills: ["React", "Node.js", "Python", "AI"],
        applyLink: "https://hackverse.nitk.ac.in",
        description: "National level offline student hackathon hosted by NITK.",
        isBeginnerFriendly: true,
        isStudentOnly: true,
      },
      {
        title: "Devfolio Buildathon",
        organizer: "Devfolio",
        prize: "$10,000",
        deadline: "15 September 2026",
        teamSize: "1-3 Members",
        mode: "Online",
        location: "Global",
        tags: ["React", "Next.js", "Firebase", "Online"],
        requiredSkills: ["React", "Next.js", "Firebase", "Tailwind"],
        applyLink: "https://devfolio.co",
        description: "Global online buildathon for web developers and UI designers.",
        isBeginnerFriendly: true,
        isStudentOnly: false,
      },
      {
        title: "Kaggle GrandPrix",
        organizer: "Kaggle",
        prize: "$50,000",
        deadline: "05 October 2026",
        teamSize: "1-5 Members",
        mode: "Online",
        location: "Global",
        tags: ["AI", "ML", "Python", "Online"],
        requiredSkills: ["Python", "Machine Learning", "TensorFlow", "Pandas"],
        applyLink: "https://kaggle.com/competitions",
        description: "High-stakes global machine learning and data science competition.",
        isBeginnerFriendly: false,
        isStudentOnly: false,
      },
    ];

    const hackathonsRef = collection(db, "hackathons");
    let newlyAdded = 0;

    // 2. Loop through incoming items and deduplicate by title
    for (const item of incomingHackathons) {
      const duplicateQuery = query(
        hackathonsRef,
        where("title", "==", item.title)
      );
      const existingDocs = await getDocs(duplicateQuery);

      // 3. Add to Firestore only if it doesn't already exist
      if (existingDocs.empty) {
        await addDoc(hackathonsRef, {
          ...item,
          createdAt: new Date().toISOString(),
        });
        newlyAdded++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ingestion complete. Added ${newlyAdded} new hackathons.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
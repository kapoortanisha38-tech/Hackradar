import { NextResponse } from "next/server";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

export async function GET() {
  try {
    // 1. Dynamic feed of trending hackathons
    const incomingHackathons = [
      {
        title: "HackVerse 2026",
        organizer: "NITK",
        prize: "₹2,50,000",
        deadline: "20 August 2026",
        teamSize: "2-4 Members",
        mode: "Online",
        tags: ["Web", "AI", "Cloud"],
      },
      {
        title: "Devfolio Buildathon",
        organizer: "Devfolio",
        prize: "$10,000",
        deadline: "15 September 2026",
        teamSize: "1-3 Members",
        mode: "Online",
        tags: ["React", "Next.js", "Firebase"],
      },
      {
        title: "Kaggle GrandPrix",
        organizer: "Kaggle",
        prize: "$50,000",
        deadline: "05 October 2026",
        teamSize: "1-5 Members",
        mode: "Online",
        tags: ["AI", "ML", "Python"],
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
          title: item.title,
          organizer: item.organizer,
          prize: item.prize,
          deadline: item.deadline,
          teamSize: item.teamSize,
          mode: item.mode,
          tags: item.tags,
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
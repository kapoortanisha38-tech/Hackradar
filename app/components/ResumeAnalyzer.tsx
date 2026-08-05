"use client";

import { useState } from "react";
import { extractSkillsFromText } from "../utils/extractSkills";

type ResumeAnalyzerProps = {
  setResumeSkills: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function ResumeAnalyzer({
  setResumeSkills,
}: ResumeAnalyzerProps) {
  const [fileName, setFileName] = useState("");
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualSkills, setManualSkills] = useState("");

  function handleManualSkills() {
    const skills = manualSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    setExtractedSkills(skills);
    setResumeSkills(skills);
  }

  async function handleResumeUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
    setExtractedSkills([]);
    setIsAnalyzing(true);

    try {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        alert("Please upload a PDF resume.");
        return;
      }

      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

      // IMPORTANT:
      // Make sure this version matches package.json
     pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

      const buffer = await file.arrayBuffer();

     const loadingTask = pdfjsLib.getDocument({
  data: new Uint8Array(buffer),
 
});

const pdf = await loadingTask.promise;
      let resumeText = "";

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");

        resumeText += pageText + " ";
      }

      resumeText = resumeText.trim();

      if (!resumeText) {
        alert(
          "No readable text was found in this PDF. It may be a scanned document. Please enter your skills manually."
        );
        return;
      }

      const skills = extractSkillsFromText(resumeText);

      if (skills.length === 0) {
        alert(
          "Resume was read successfully, but no matching skills were detected.\n\nYou can still enter them manually below."
        );
      }

      setExtractedSkills(skills);
      setResumeSkills(skills);
    } catch (error) {
      console.error("Resume reading error:", error);

      alert(
        "Unable to analyze this PDF on your device.\n\nTry another PDF or use the Manual Skills option."
      );
    } finally {
      setIsAnalyzing(false);
      event.target.value = "";
    }
  }

  return (
    <section className="border-t border-gray-800 bg-[#0B0E14] px-8 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-4xl font-bold">📄 Resume Skill Analyzer</h2>

        <p className="mt-3 text-gray-400">
          Upload your PDF resume and HackRadar will detect your skills.
        </p>

        <div className="mt-10 rounded-2xl border border-gray-800 bg-[#11151D] p-8">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-500/50 bg-cyan-500/5 px-6 py-10 text-center hover:bg-cyan-500/10">
            <span className="text-5xl">⬆️</span>

            <span className="mt-4 text-lg font-semibold">
              Upload Resume
            </span>

            <span className="mt-2 text-sm text-gray-400">
              PDF file only
            </span>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </label>

          <div className="mt-6 rounded-xl bg-[#0B0E14] p-4">
            <p className="text-sm text-gray-400">
              If resume upload does not work, enter skills manually:
            </p>

            <input
              value={manualSkills}
              onChange={(e) => setManualSkills(e.target.value)}
              placeholder="Python, React, Firebase, AI"
              className="mt-3 w-full rounded-xl border border-gray-700 bg-[#11151D] px-4 py-3 text-white outline-none"
            />

            <button
              onClick={handleManualSkills}
              className="mt-4 rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-black hover:bg-cyan-400"
            >
              Use Manual Skills
            </button>
          </div>

          {fileName && (
            <div className="mt-6 rounded-xl bg-[#0B0E14] p-4">
              <p className="text-sm text-gray-400">Uploaded File:</p>

              <p className="mt-1 font-semibold text-cyan-300">
                {fileName}
              </p>
            </div>
          )}

          {isAnalyzing && (
            <p className="mt-6 text-cyan-300">
              🔍 Analyzing resume...
            </p>
          )}

          {extractedSkills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold">Skills Found</h3>

              <div className="mt-4 flex flex-wrap gap-3">
                {extractedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-green-900/30 px-4 py-2 text-sm text-green-300"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>

              <button className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400">
                Use These Skills for AI Match
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
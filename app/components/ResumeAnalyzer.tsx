"use client";

import { useState } from "react";
import { extractSkillsFromText } from "../utils/extractSkills";

type ResumeAnalyzerProps = {
  setResumeSkills: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function ResumeAnalyzer({ setResumeSkills }: ResumeAnalyzerProps) {
  const [fileName, setFileName] = useState("");
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleResumeUpload(event: React.ChangeEvent<HTMLInputElement>) {
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
        alert("For now, please upload a PDF resume.");
        return;
      }

      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        useSystemFonts: true,
      }).promise;

      let resumeText = "";

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");

        resumeText += pageText + " ";
      }

      if (!resumeText.trim()) {
        alert("No readable text found in this PDF. Try uploading a text-based resume PDF.");
        return;
      }

      const skills = extractSkillsFromText(resumeText);

      setExtractedSkills(skills);
      setResumeSkills(skills);
    } catch (error) {
      console.error("Resume reading error:", error);
      alert("Something went wrong while reading the resume. Please try another PDF.");
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

            <span className="mt-4 text-lg font-semibold">Upload Resume</span>

            <span className="mt-2 text-sm text-gray-400">PDF file only</span>

            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </label>

          {fileName && (
            <div className="mt-6 rounded-xl bg-[#0B0E14] p-4">
              <p className="text-sm text-gray-400">Uploaded File:</p>
              <p className="mt-1 font-semibold text-cyan-300">{fileName}</p>
            </div>
          )}

          {isAnalyzing && (
            <p className="mt-6 text-cyan-300">Analyzing resume...</p>
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
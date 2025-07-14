import { useState } from "react";
import {
  Mail,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// For rendering Markdown results
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CoverLetterGenerator() {
  const [resumeSummary, setResumeSummary] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<
    string | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const resultVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const handleGenerateCoverLetter = async () => {
    if (!resumeSummary.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description:
          "Please provide both your resume summary and the job description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedCoverLetter(null); // Clear previous result

    try {
      const prompt = `Generate a professional and compelling cover letter based on the following candidate's resume summary and job description.
      
      Focus on highlighting how the candidate's skills and experiences align with the requirements of the job.
      Structure the letter with an introduction, body paragraphs detailing relevant qualifications, and a strong conclusion.
      Keep it concise and impactful.

      ---
      **Candidate's Resume Summary/Key Skills:**
      ${resumeSummary}

      ---
      **Job Description:**
      ${jobDescription}
      ---
      `;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Ensure this is set up
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const geminiResult = await response.json();

      if (
        geminiResult.candidates &&
        geminiResult.candidates.length > 0 &&
        geminiResult.candidates[0].content &&
        geminiResult.candidates[0].content.parts &&
        geminiResult.candidates[0].content.parts.length > 0
      ) {
        const letterText =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setGeneratedCoverLetter(letterText);
        toast({
          title: "Cover Letter Generated!",
          description: "Your tailored cover letter is ready.",
        });
      } else {
        console.error("Unexpected API response structure:", geminiResult);
        toast({
          title: "Generation Failed",
          description: "Could not generate cover letter. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        title: "Generation Error",
        description:
          "An error occurred while connecting to the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLetter = async () => {
    if (!generatedCoverLetter) return;
    try {
      await navigator.clipboard.writeText(generatedCoverLetter);
      toast({
        title: "Copied!",
        description: "Generated cover letter copied to clipboard.",
      });
    } catch (error) {
      // Fallback for older browsers or iframes without clipboard API access
      const textarea = document.createElement("textarea");
      textarea.value = generatedCoverLetter;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: "Cover letter copied to clipboard (fallback).",
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard.",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleDownloadLetter = () => {
    if (!generatedCoverLetter) return;
    const blob = new Blob([generatedCoverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Cover letter text file downloaded successfully.",
    });
  };

  const handleReset = () => {
    setResumeSummary("");
    setJobDescription("");
    setGeneratedCoverLetter(null);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready to generate a new cover letter.",
    });
  };

  return (
    <ToolLayout
      title="AI Cover Letter Generator"
      description="Generate tailored and professional cover letters for any job application using AI."
      icon={<Mail className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-purple-500 to-indigo-500" // A professional gradient
    >
      <div className="space-y-6">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-purple-500/10 text-white">
            <CardHeader>
              <CardTitle className="text-purple-400">
                Generate Your Cover Letter
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="resume-summary" className="text-slate-400">
                  Your Resume Summary / Key Skills
                </Label>
                <Textarea
                  id="resume-summary"
                  value={resumeSummary}
                  onChange={(e) => setResumeSummary(e.target.value)}
                  placeholder="e.g., 'Full Stack Developer with 5 years experience in React, Node.js, and MongoDB, building scalable web applications.' or paste key bullet points from your resume."
                  rows={10}
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description" className="text-slate-400">
                  Job Description
                </Label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={10}
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="md:col-span-2 text-center">
                <Button
                  onClick={handleGenerateCoverLetter}
                  disabled={
                    isGenerating ||
                    !resumeSummary.trim() ||
                    !jobDescription.trim()
                  }
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Cover
                      Letter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Cover Letter Result Card */}
        <AnimatePresence mode="wait">
          {(generatedCoverLetter || isGenerating) && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-indigo-500/10 text-white">
                <CardHeader>
                  <CardTitle className="text-indigo-400">
                    Your Generated Cover Letter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[200px] flex items-center justify-center text-slate-400">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Drafting
                      your letter...
                    </div>
                  ) : (
                    <div className="min-h-[200px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-auto max-h-[600px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={generatedCoverLetter || "empty"}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={resultVariants}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {generatedCoverLetter || ""}
                          </ReactMarkdown>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      onClick={handleCopyLetter}
                      disabled={!generatedCoverLetter || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md transition-all duration-200 rounded-full px-4 py-2"
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadLetter}
                      disabled={!generatedCoverLetter || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-black font-semibold hover:from-indigo-600 hover:to-purple-600 shadow-md transition-all duration-200 rounded-full px-4 py-2"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      onClick={handleReset}
                      size="lg"
                      className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Generate New Letter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#FFD700] mb-3 text-lg">
                Tips for a Strong Cover Letter
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>
                  Provide a concise yet comprehensive summary of your relevant
                  skills and experience.
                </li>
                <li>
                  Paste the full job description to help the AI tailor the
                  letter accurately.
                </li>
                <li>
                  Always review and personalize the generated letter to reflect
                  your unique voice and specific interest in the role.
                </li>
                <li>
                  Highlight achievements and quantifiable results where
                  possible.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}

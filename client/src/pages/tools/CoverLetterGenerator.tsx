import { useState } from "react";
import {
  Mail,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  FileSignature, // A more specific icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Blue-500 to Teal-500
// - Tips/Info Accent: Amber

export default function CoverLetterGenerator() {
  const [resumeSummary, setResumeSummary] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<
    string | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const resultVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  // --- Core logic functions (handleGenerate, handleCopy, etc.) are unchanged ---
  const handleGenerateCoverLetter = async () => {
    if (!resumeSummary.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your skills and the job description.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedCoverLetter(null);

    try {
      const prompt = `Generate a professional cover letter based on the candidate's skills and the job description. Highlight how the candidate's experience aligns with the job requirements. Structure it with an introduction, body, and a strong conclusion.
      ---
      **Candidate's Resume Summary/Key Skills:**
      ${resumeSummary}
      ---
      **Job Description:**
      ${jobDescription}
      ---`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const geminiResult = await response.json();

      if (geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
        const letterText =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setGeneratedCoverLetter(letterText);
        toast({
          title: "Cover Letter Generated!",
          description: "Your tailored cover letter is ready.",
        });
      } else {
        console.error("API Error:", geminiResult);
        toast({
          title: "Generation Failed",
          description: "Could not generate the letter. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the AI.",
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
        description: "Cover letter copied to clipboard.",
      });
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = generatedCoverLetter;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: "Cover letter copied (fallback).",
        });
      } catch (err) {
        toast({ title: "Copy Failed", variant: "destructive" });
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
      description: "Cover letter saved as a .txt file.",
    });
  };

  const handleReset = () => {
    setResumeSummary("");
    setJobDescription("");
    setGeneratedCoverLetter(null);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready for a new cover letter.",
    });
  };

  return (
    <ToolLayout
      title="AI Cover Letter Generator"
      description="Generate tailored and professional cover letters for any job application."
      icon={<FileSignature className="text-white" />}
      iconBg="bg-gradient-to-br from-blue-500 to-teal-500"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div
          variants={cardInViewVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="text-blue-600">
                Enter Your Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="resume-summary"
                    className="font-medium text-slate-700"
                  >
                    Your Resume Summary / Key Skills
                  </Label>
                  <Textarea
                    id="resume-summary"
                    value={resumeSummary}
                    onChange={(e) => setResumeSummary(e.target.value)}
                    placeholder="e.g., 'Full Stack Developer with 5 years of experience in React, Node.js, and MongoDB...' or paste key bullet points from your resume."
                    rows={10}
                    className="bg-white"
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="job-description"
                    className="font-medium text-slate-700"
                  >
                    Job Description
                  </Label>
                  <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={10}
                    className="bg-white"
                    disabled={isGenerating}
                  />
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button
                  onClick={handleGenerateCoverLetter}
                  disabled={
                    isGenerating ||
                    !resumeSummary.trim() ||
                    !jobDescription.trim()
                  }
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" /> Generate Cover
                      Letter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result Card */}
        <AnimatePresence>
          {(generatedCoverLetter || isGenerating) && (
            <motion.div
              variants={cardInViewVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-teal-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-teal-600">
                    Your Generated Cover Letter
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyLetter}
                      disabled={!generatedCoverLetter || isGenerating}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadLetter}
                      disabled={!generatedCoverLetter || isGenerating}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                      <p className="font-semibold text-lg">
                        Drafting your perfect letter...
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      key={generatedCoverLetter}
                      variants={resultVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm lg:prose-base prose-slate max-w-none"
                      >
                        {generatedCoverLetter || ""}
                      </ReactMarkdown>
                    </motion.div>
                  )}
                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleReset}
                      size="lg"
                      variant="ghost"
                      className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full px-8 py-3 font-semibold"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Card */}
        <motion.div
          variants={cardInViewVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6">
              <h4 className="font-semibold text-amber-700 mb-3 text-lg">
                Tips for a Strong Cover Letter
              </h4>
              <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                <li>
                  Provide a concise summary of your most relevant skills and
                  experiences.
                </li>
                <li>
                  Paste the complete job description for the most accurate and
                  tailored letter.
                </li>
                <li>
                  Always review and personalize the generated letter to add your
                  own voice.
                </li>
                <li>
                  Highlight achievements with quantifiable results (e.g.,
                  "increased sales by 15%").
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}

import { useState } from "react";
import { CopyCheck, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Lime-500 to Emerald-500
// - Disclaimer/Info Accent: Amber

export default function PlagiarismChecker() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const resultVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // --- Core logic functions (handleCheck, reset) are unchanged ---
  const handleCheckPlagiarism = async () => {
    if (!text1.trim() || !text2.trim()) {
      toast({ title: "Missing Text", description: "Please enter text in both fields to compare.", variant: "destructive" });
      return;
    }
    setIsChecking(true);
    setResult(null);

    try {
      const prompt = `Compare the following two texts for semantic similarity. Provide a concise analysis highlighting similar phrases and ideas, and conclude with a percentage estimate of their similarity (e.g., "Estimated semantic similarity: 75%").
      Text 1: "${text1}"
      Text 2: "${text2}"`;
      
      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const geminiResult = await response.json();

      if (geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
        const analysis = geminiResult.candidates[0].content.parts[0].text.trim();
        setResult(analysis);
        toast({ title: "Analysis Complete!", description: "Review the similarity report below." });
      } else {
        console.error("API Error:", geminiResult);
        toast({ title: "Analysis Failed", description: "Could not perform the check. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({ title: "Connection Error", description: "Could not connect to the AI.", variant: "destructive" });
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleReset = () => {
      setText1("");
      setText2("");
      setResult(null);
      setIsChecking(false);
      toast({ title: "Tool Reset", description: "Ready for a new comparison." });
  }

  return (
    <ToolLayout
      title="AI Plagiarism Checker"
      description="Compare two pieces of text for semantic similarity and potential rephrasing."
      icon={<CopyCheck className="text-white" />}
      iconBg="bg-gradient-to-br from-lime-500 to-emerald-500"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-lime-500/10">
            <CardHeader><CardTitle className="text-lime-600">Enter Texts for Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="text1" className="font-medium text-slate-700">Text 1 (Original / Reference)</Label>
                  <Textarea id="text1" value={text1} onChange={(e) => setText1(e.target.value)} placeholder="Paste the first text here..." rows={10} className="bg-white" disabled={isChecking}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text2" className="font-medium text-slate-700">Text 2 (To be Checked)</Label>
                  <Textarea id="text2" value={text2} onChange={(e) => setText2(e.target.value)} placeholder="Paste the second text here..." rows={10} className="bg-white" disabled={isChecking}/>
                </div>
              </div>
               <div className="mt-6 text-center">
                <Button onClick={handleCheckPlagiarism} disabled={isChecking || !text1.trim() || !text2.trim()} size="lg" className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white shadow-lg shadow-lime-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold">
                  {isChecking ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>) : (<><Sparkles className="mr-2 h-5 w-5" /> Analyze Similarity</>)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result Card */}
        <AnimatePresence>
          {(isChecking || result) && (
            <motion.div variants={cardInViewVariants} initial="hidden" animate="visible" exit="hidden">
              <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-emerald-500/10">
                <CardHeader><CardTitle className="text-emerald-600">Similarity Analysis Report</CardTitle></CardHeader>
                <CardContent>
                  {isChecking ? (
                     <div className="min-h-[200px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-lime-500 mb-3" />
                      <p className="font-semibold text-lg">Comparing texts for similarity...</p>
                    </div>
                  ) : (
                     <motion.div key={result} variants={resultVariants} initial="initial" animate="animate" exit="exit" className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg prose prose-sm lg:prose-base prose-slate max-w-none">
                      {result}
                    </motion.div>
                  )}
                   <div className="mt-6 text-center">
                    <Button onClick={handleReset} size="lg" variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full px-8 py-3 font-semibold">
                      <RefreshCw className="mr-2 h-4 w-4" /> Start New Comparison
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Disclaimer Card */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6">
              <h4 className="font-semibold text-amber-700 mb-3 text-lg">About This Plagiarism Checker</h4>
              <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                <li>This tool uses AI to compare the <strong>semantic meaning</strong> of two texts you provide.</li>
                <li>It's designed to identify rephrased content or very similar ideas between two specific documents.</li>
                <li><strong>It does not scan the entire internet</strong> or a large database for plagiarism.</li>
                <li>For comprehensive academic or professional plagiarism detection, a specialized service is recommended.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
import { useState } from "react";
import {
  Mic,
  Loader2,
  RefreshCw,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Sky-500 to Blue-600
// - Feedback Accent: Emerald-600
// - Tips/Info Accent: Amber

export default function AiInterviewPracticeTool() {
  const [jobRole, setJobRole] = useState("");
  const [questionType, setQuestionType] = useState("Any");
  const [programmingLanguage, setProgrammingLanguage] = useState("N/A");
  const [outputLanguage, setOutputLanguage] = useState("English");

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants are theme-independent
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // --- Core logic functions (generateQuestion, getFeedback, etc.) are unchanged ---
  const generateQuestion = async () => {
    if (!jobRole.trim()) {
      toast({
        title: "Missing Job Role",
        description: "Please enter a job role or industry to start.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingQuestion(true);
    setCurrentQuestion("");
    setUserAnswer("");
    setAiFeedback("");

    try {
      let prompt = `Generate a realistic and challenging interview question for a "${jobRole}" role.`;
      if (questionType !== "Any") {
        prompt += ` This should be a ${questionType} question.`;
      }
      if (questionType === "Technical" && programmingLanguage !== "N/A") {
        prompt += ` Focus specifically on ${programmingLanguage}.`;
      }
      prompt += ` Respond only with the question itself, without any introductory remarks. The question must be in ${outputLanguage}.`;

      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const question = result.candidates[0].content.parts[0].text.trim();
        setCurrentQuestion(question);
        toast({ title: "Question Generated!", description: "Think carefully before you answer." });
      } else {
        console.error("API Error:", result);
        toast({ title: "Generation Failed", description: "Could not generate a question. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({ title: "Connection Error", description: "Could not connect to the AI. Please check your connection.", variant: "destructive" });
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const getFeedback = async () => {
    if (!userAnswer.trim()) {
      toast({ title: "Missing Answer", description: "Please provide an answer before getting feedback.", variant: "destructive" });
      return;
    }
    setIsGettingFeedback(true);
    setAiFeedback("");

    try {
      let prompt = `I was asked the interview question: "${currentQuestion}" (for a ${jobRole} role). My answer was: "${userAnswer}". Provide concise, actionable feedback on my answer. Focus on one or two key areas for improvement or suggest a related follow-up question. Do not start with "Feedback:". Keep it brief and professional. The feedback must be in ${outputLanguage}.`;

      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const feedback = result.candidates[0].content.parts[0].text.trim();
        setAiFeedback(feedback);
        toast({ title: "Feedback Received!", description: "Review the suggestions below." });
      } else {
        console.error("API Error:", result);
        toast({ title: "Feedback Failed", description: "Could not get feedback. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({ title: "Connection Error", description: "Could not connect to the AI. Please check your connection.", variant: "destructive" });
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const resetPractice = () => {
    setJobRole("");
    setQuestionType("Any");
    setProgrammingLanguage("N/A");
    setOutputLanguage("English");
    setCurrentQuestion("");
    setUserAnswer("");
    setAiFeedback("");
    toast({ title: "Practice Reset", description: "Ready for a new session!" });
  };

  return (
    <ToolLayout
      title="AI Interview Practice Tool"
      description="Practice your interview skills with AI-generated questions and feedback."
      icon={<Mic className="text-white" />}
      iconBg="bg-gradient-to-br from-sky-500 to-blue-600"
    >
      <div className="space-y-8">
        {/* Setup Card */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-sky-500/10">
            <CardHeader>
              <CardTitle className="text-sky-600">Setup Your Practice Session</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="job-role-input" className="font-medium text-slate-700">Job Role / Industry</Label>
                <Input id="job-role-input" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="e.g., 'Software Engineer'" className="bg-white" disabled={isGeneratingQuestion} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-type-select" className="font-medium text-slate-700">Question Type</Label>
                <Select value={questionType} onValueChange={setQuestionType} disabled={isGeneratingQuestion}>
                  <SelectTrigger id="question-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Any">Any</SelectItem><SelectItem value="Technical">Technical</SelectItem><SelectItem value="Behavioral">Behavioral</SelectItem><SelectItem value="Situational">Situational</SelectItem></SelectContent>
                </Select>
              </div>
               <AnimatePresence>
                {questionType === "Technical" && (
                  <motion.div className="space-y-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                    <Label htmlFor="prog-lang-select" className="font-medium text-slate-700">Technology</Label>
                    <Select value={programmingLanguage} onValueChange={setProgrammingLanguage} disabled={isGeneratingQuestion}>
                      <SelectTrigger id="prog-lang-select"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="N/A">General</SelectItem><SelectItem value="JavaScript">JavaScript</SelectItem><SelectItem value="Python">Python</SelectItem><SelectItem value="Java">Java</SelectItem><SelectItem value="React">React</SelectItem><SelectItem value="Node.js">Node.js</SelectItem><SelectItem value="SQL">SQL</SelectItem><SelectItem value="System Design">System Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="md:col-span-2 lg:col-span-3 text-center pt-2">
                <Button onClick={generateQuestion} disabled={isGeneratingQuestion || !jobRole.trim()} size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold">
                  {isGeneratingQuestion ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>) : (<><MessageSquare className="mr-2 h-5 w-5" /> Generate Question</>)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question & Answer Card */}
        <AnimatePresence>
          {currentQuestion && (
            <motion.div variants={cardInViewVariants} initial="hidden" animate="visible" exit="hidden">
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-blue-500/10">
                <CardHeader><CardTitle className="text-blue-600">Interview Question</CardTitle></CardHeader>
                <CardContent>
                  <motion.div key={currentQuestion} variants={itemVariants} className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-800 font-medium text-lg">
                    {currentQuestion}
                  </motion.div>
                  <div className="mt-6 space-y-2">
                    <Label htmlFor="user-answer-textarea" className="font-medium text-slate-700">Your Answer</Label>
                    <Textarea id="user-answer-textarea" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Type your answer here..." rows={8} className="bg-white" disabled={isGettingFeedback} />
                  </div>
                   <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button onClick={getFeedback} disabled={isGettingFeedback || !userAnswer.trim()} size="lg" className="w-full sm:w-auto flex-grow bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold">
                      {isGettingFeedback ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Getting Feedback...</>) : (<><Lightbulb className="mr-2 h-5 w-5" /> Get Feedback</>)}
                    </Button>
                     <Button onClick={generateQuestion} disabled={isGeneratingQuestion} size="lg" variant="outline" className="w-full sm:w-auto border-sky-500 text-sky-600 hover:bg-sky-50 hover:text-sky-700 rounded-full px-10 py-3 text-base font-semibold">
                       <RefreshCw className="mr-2 h-5 w-5" /> New Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Card */}
        <AnimatePresence>
          {aiFeedback && (
             <motion.div variants={cardInViewVariants} initial="hidden" animate="visible" exit="hidden">
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-emerald-500/10">
                <CardHeader><CardTitle className="text-emerald-600">AI Feedback</CardTitle></CardHeader>
                <CardContent>
                   <motion.div key={aiFeedback} variants={itemVariants} className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900">
                    {aiFeedback}
                  </motion.div>
                   <div className="mt-6 text-center">
                    <Button onClick={resetPractice} size="lg" variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full px-8 py-3 font-semibold">
                      <RefreshCw className="mr-2 h-4 w-4" /> Start New Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}
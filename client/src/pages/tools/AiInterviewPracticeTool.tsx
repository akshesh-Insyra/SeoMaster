// src/pages/AiInterviewPracticeTool.tsx

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

  // Framer Motion variants (reused)
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const questionVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

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

      prompt += ` Respond only with the question itself, without any introductory or concluding remarks. The question must be in ${outputLanguage}.`;

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

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const question = result.candidates[0].content.parts[0].text.trim();
        setCurrentQuestion(question);
        toast({
          title: "Question Generated!",
          description: "Think carefully before you answer.",
        });
      } else {
        console.error("Unexpected API response structure:", result);
        toast({
          title: "Generation Failed",
          description: "Could not generate question. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating question:", error);
      toast({
        title: "Generation Error",
        description:
          "An error occurred while connecting to the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const getFeedback = async () => {
    if (!currentQuestion.trim() || !userAnswer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please generate a question and provide an answer first.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingFeedback(true);
    setAiFeedback(""); // Clear previous feedback

    try {
      let prompt = `I was asked the interview question: "${currentQuestion}" (for a ${jobRole} role, ${questionType} type, potentially related to ${programmingLanguage}). My answer was: "${userAnswer}".`;
      prompt += ` Provide concise, actionable feedback on my answer. Focus on one or two key areas for improvement or suggest a related follow-up question. Do not start with "Feedback:" or "Based on your answer". Keep it brief, professional, and in ${outputLanguage}.`;

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

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const feedback = result.candidates[0].content.parts[0].text.trim();
        setAiFeedback(feedback);
        toast({
          title: "Feedback Received!",
          description: "Review the suggestions below.",
        });
      } else {
        console.error("Unexpected API response structure:", result);
        toast({
          title: "Feedback Failed",
          description: "Could not get feedback. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting feedback:", error);
      toast({
        title: "Feedback Error",
        description:
          "An error occurred while connecting to the AI. Please try again.",
        variant: "destructive",
      });
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
    setIsGeneratingQuestion(false);
    setIsGettingFeedback(false);
    toast({
      title: "Practice Reset",
      description: "Ready for a new session!",
    });
  };

  return (
    <ToolLayout
      title="AI Interview Practice Tool"
      description="Practice your interview skills with AI-generated questions and feedback tailored to your needs."
      icon={<Mic className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-[#17D4FE] to-[#0070F3]"
    >
      <div className="space-y-6">
        {/* Setup Your Practice Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#17D4FE]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#17D4FE]">
                Setup Your Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-role-input" className="text-slate-400">
                  Job Role / Industry:
                </Label>
                <Input
                  id="job-role-input"
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g., 'Software Engineer', 'Marketing Manager'"
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#17D4FE]/50 focus:border-[#17D4FE] rounded-md shadow-sm"
                  disabled={isGeneratingQuestion}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="question-type-select"
                  className="text-slate-400"
                >
                  Question Type:
                </Label>
                <Select
                  value={questionType}
                  onValueChange={setQuestionType}
                  disabled={isGeneratingQuestion}
                >
                  <SelectTrigger
                    id="question-type-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-[#17D4FE]/50 focus:border-[#17D4FE] rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Lead">Lead/Managerial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {questionType === "Technical" && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label htmlFor="prog-lang-select" className="text-slate-400">
                    Programming Language/Framework:
                  </Label>
                  <Select
                    value={programmingLanguage}
                    onValueChange={setProgrammingLanguage}
                    disabled={isGeneratingQuestion}
                  >
                    <SelectTrigger
                      id="prog-lang-select"
                      className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-[#17D4FE]/50 focus:border-[#17D4FE] rounded-md shadow-sm"
                    >
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                      <SelectItem value="N/A">Not Applicable</SelectItem>
                      {/* --- General Programming Languages --- */}
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="Rust">Rust</SelectItem>
                      <SelectItem value="PHP">PHP</SelectItem>
                      <SelectItem value="Ruby">Ruby</SelectItem>
                      <SelectItem value="Swift">Swift</SelectItem>
                      <SelectItem value="Kotlin">Kotlin</SelectItem>
                      <SelectItem value="C#">C#</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>

                      {/* --- Web Development Frameworks/Technologies --- */}
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Angular">Angular</SelectItem>
                      <SelectItem value="Vue.js">Vue.js</SelectItem>
                      <SelectItem value="Node.js">Node.js</SelectItem>
                      <SelectItem value="Express.js">Express.js</SelectItem>
                      <SelectItem value="Next.js">Next.js</SelectItem>
                      <SelectItem value="Spring Boot">
                        Spring Boot (Java)
                      </SelectItem>
                      <SelectItem value="Django">Django (Python)</SelectItem>
                      <SelectItem value="Flask">Flask (Python)</SelectItem>
                      <SelectItem value="Ruby on Rails">
                        Ruby on Rails (Ruby)
                      </SelectItem>
                      <SelectItem value="ASP.NET">ASP.NET (C#)</SelectItem>
                      <SelectItem value="Laravel">Laravel (PHP)</SelectItem>

                      {/* --- Mobile Development --- */}
                      <SelectItem value="Android Development">
                        Android Development
                      </SelectItem>
                      <SelectItem value="iOS Development">
                        iOS Development
                      </SelectItem>
                      <SelectItem value="React Native">React Native</SelectItem>
                      <SelectItem value="Flutter">Flutter</SelectItem>

                      {/* --- Databases --- */}
                      <SelectItem value="MySQL">MySQL</SelectItem>
                      <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                      <SelectItem value="MongoDB">MongoDB</SelectItem>
                      <SelectItem value="Redis">Redis</SelectItem>
                      <SelectItem value="Cassandra">Cassandra</SelectItem>

                      {/* --- Cloud/DevOps --- */}
                      <SelectItem value="AWS">AWS</SelectItem>
                      <SelectItem value="Azure">Azure</SelectItem>
                      <SelectItem value="Google Cloud Platform (GCP)">
                        Google Cloud Platform (GCP)
                      </SelectItem>
                      <SelectItem value="Docker">Docker</SelectItem>
                      <SelectItem value="Kubernetes">Kubernetes</SelectItem>

                      {/* --- Computer Science Fundamentals --- */}
                      <SelectItem value="Data Structures and Algorithms">
                        Data Structures and Algorithms
                      </SelectItem>
                      <SelectItem value="Operating Systems">
                        Operating Systems
                      </SelectItem>
                      <SelectItem value="Networking">Networking</SelectItem>
                      <SelectItem value="Object-Oriented Programming (OOP)">
                        Object-Oriented Programming (OOP)
                      </SelectItem>
                      <SelectItem value="System Design">
                        System Design
                      </SelectItem>
                      <SelectItem value="Distributed Systems">
                        Distributed Systems
                      </SelectItem>
                      <SelectItem value="Cybersecurity">
                        Cybersecurity
                      </SelectItem>

                      {/* --- Data Science/ML --- */}
                      <SelectItem value="Machine Learning">
                        Machine Learning
                      </SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="output-language-select"
                  className="text-slate-400"
                >
                  Output Language:
                </Label>
                <Select
                  value={outputLanguage}
                  onValueChange={setOutputLanguage}
                  disabled={isGeneratingQuestion}
                >
                  <SelectTrigger
                    id="output-language-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-[#17D4FE]/50 focus:border-[#17D4FE] rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Chinese">
                      Chinese (Simplified)
                    </SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Russian">Russian</SelectItem>
                    {/* Add more languages as needed */}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 mt-4 text-center">
                <Button
                  onClick={generateQuestion}
                  disabled={isGeneratingQuestion || !jobRole.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-[#17D4FE] to-[#0070F3] hover:from-[#00BFFF] hover:to-[#005bb0] text-white shadow-lg shadow-[#17D4FE]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGeneratingQuestion ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generating Question...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" /> Generate
                      Question
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interview Question Card */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#0070F3]/10 text-white">
                <CardHeader>
                  <CardTitle className="text-[#0070F3]">
                    Interview Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[80px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white overflow-y-auto max-h-48">
                    <AnimatePresence mode="wait">
                      {isGeneratingQuestion ? (
                        <motion.div
                          key="loading-question"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center h-full text-slate-400"
                        >
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating question...
                        </motion.div>
                      ) : (
                        <motion.p
                          key={currentQuestion}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={questionVariants}
                          className="text-lg font-medium whitespace-pre-wrap break-words"
                        >
                          {currentQuestion}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <Label
                    htmlFor="user-answer-textarea"
                    className="text-slate-400 mt-6 mb-2 block"
                  >
                    Your Answer:
                  </Label>
                  <Textarea
                    id="user-answer-textarea"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={`Type your answer in ${outputLanguage} here...`}
                    rows={8}
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#0070F3]/50 focus:border-[#0070F3] rounded-md shadow-sm"
                    disabled={isGettingFeedback}
                  />
                  <div className="mt-4 flex justify-between items-center gap-2">
                    <Button
                      onClick={getFeedback}
                      disabled={isGettingFeedback || !userAnswer.trim()}
                      size="lg"
                      className="bg-gradient-to-r from-[#0070F3] to-[#17D4FE] hover:from-[#005bb0] hover:to-[#00BFFF] text-white shadow-lg shadow-[#0070F3]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-6 py-3 font-semibold flex-grow"
                    >
                      {isGettingFeedback ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Getting Feedback...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="mr-2 h-4 w-4" /> Get Feedback
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={generateQuestion}
                      disabled={isGeneratingQuestion}
                      size="lg"
                      variant="outline"
                      className="bg-transparent border border-[#17D4FE] text-[#17D4FE] hover:bg-[#17D4FE]/10 hover:text-white shadow-lg shadow-[#17D4FE]/10 transform hover:scale-105 transition-all duration-300 rounded-full px-6 py-3 font-semibold"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> New Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Feedback Card */}
        <AnimatePresence mode="wait">
          {aiFeedback && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
                <CardHeader>
                  <CardTitle className="text-[#00A389]">AI Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[100px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-auto max-h-64">
                    <AnimatePresence mode="wait">
                      {isGettingFeedback ? (
                        <motion.div
                          key="loading-feedback"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center h-full text-slate-400"
                        >
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing answer...
                        </motion.div>
                      ) : (
                        <motion.p
                          key={aiFeedback}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={questionVariants}
                        >
                          {aiFeedback}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      onClick={resetPractice}
                      size="lg"
                      className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Start New Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions/Tips Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#FFD700] mb-3 text-lg">
                Tips for Effective Practice:
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>
                  Be specific with the job role for more targeted questions.
                </li>
                <li>Practice answering out loud, even if you're typing.</li>
                <li>Aim for concise yet comprehensive answers.</li>
                <li>
                  Focus on the STAR method (Situation, Task, Action, Result) for
                  behavioral questions.
                </li>
                <li>
                  Review the AI feedback and try to incorporate it into your
                  next answer.
                </li>
                <li>
                  Experiment with different question types and programming
                  languages.
                </li>
              </ul>
              <p className="text-[#17D4FE] text-sm mt-4">
                <strong>Note:</strong> This tool provides practice questions and
                generalized feedback. For personalized coaching, consider
                professional interview preparation.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}

// src/pages/AiInterviewStudyGuide.tsx

import { useState } from "react";
import { BookOpen, Loader2, Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// For rendering Markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiInterviewStudyGuide() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("Concepts & Questions");
  const [difficulty, setDifficulty] = useState("Any");
  const [experienceLevel, setExperienceLevel] = useState("Any");
  const [outputLanguage, setOutputLanguage] = useState("English");

  const [rawGeneratedContent, setRawGeneratedContent] = useState("");
  const [concepts, setConcepts] = useState<Array<{ title: string; content: string }>>([]);
  const [questions, setQuestions] = useState<Array<{ question: string; answer?: string }>>([]);

  const [isGenerating, setIsGenerating] = useState(false);
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

  const contentItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  // --- Core Parsing Logic (Slightly refined for answer capture) ---
  const parseGeneratedContent = (markdownText: string) => {
    const newConcepts: { title: string; content: string }[] = [];
    const newQuestions: { question: string; answer?: string }[] = [];

    setConcepts([]); // Reset current parsed states
    setQuestions([]);

    // --- Parsing Concepts ---
    const conceptsSectionMatch = markdownText.match(/(^#+\s*Concepts[\s\S]*?)(?:^#+\s*Interview Questions|$)/im);
    if (conceptsSectionMatch) {
      const conceptsContent = conceptsSectionMatch[1];
      const conceptPattern = /^##\s*(.*?)\n([\s\S]*?)(?=(^##\s*|\s*#+\s*|$))/gm;
      let match;
      let lastIndex = 0; // Track position to append remaining content
      let foundConcepts = false;

      while ((match = conceptPattern.exec(conceptsContent)) !== null) {
        const title = match[1]?.trim();
        const content = match[2]?.trim();
        if (title && content) {
          newConcepts.push({ title, content });
          foundConcepts = true;
        }
        lastIndex = conceptPattern.lastIndex; // Update lastIndex after exec
      }

      // Handle any introductory text or content not captured by sub-headings
      if (newConcepts.length === 0 && conceptsContent.trim()) {
        newConcepts.push({ title: `Introduction to ${topic} Concepts`, content: conceptsContent.trim() });
      } else if (lastIndex < conceptsContent.length) {
          const remainingContent = conceptsContent.substring(lastIndex).trim();
          if (remainingContent) {
              if (newConcepts.length > 0) {
                  newConcepts[newConcepts.length - 1].content += "\n\n" + remainingContent;
              } else {
                  newConcepts.push({ title: `General ${topic} Concepts`, content: remainingContent });
              }
          }
      }
    }

    // --- Parsing Questions ---
    const questionsSectionMatch = markdownText.match(/(^#+\s*Interview Questions[\s\S]*)/im);
    if (questionsSectionMatch) {
      const questionsContent = questionsSectionMatch[1];
      // Updated Regex:
      // - ^[*-]\s*\*\*Question:\*\*\s*(.*?) : Matches bullet point, then "**Question:**", captures question text
      // - (?:                     : Non-capturing group for optional answer
      // -   \n\s*[*-]\s*\*\*Answer:\*\*\s*([\s\S]*?) : Matches newline, bullet point, "**Answer:**", captures answer text
      // - )?                      : Makes the answer part optional
      // - (?=\n[*-]\s*\*\*Question:\*\*|^\s*$|\n\s*#|$): Lookahead for next question, end of string, or new heading
      const questionPattern = /^[*-]\s*\*\*Question:\*\*\s*(.*?)(?:\n\s*[*-]\s*\*\*Answer:\*\*\s*([\s\S]*?))?(?=\n[*-]\s*\*\*Question:\*\*|^\s*$|\n\s*#\s*\S+|$)/gm;
      let match;
      let foundQuestions = false;
      while ((match = questionPattern.exec(questionsContent)) !== null) {
        const question = match[1]?.trim();
        const answer = match[2]?.trim(); // answer will be undefined if the pattern for it wasn't matched
        if (question) {
          newQuestions.push({ question, answer: answer || undefined });
          foundQuestions = true;
        }
      }

      // Fallback for simpler bulleted question lists if the **Question:** marker isn't found consistently
      // This is a less preferred fallback but can help if Gemini doesn't follow the **Question:** prompt
      if (!foundQuestions && questionsContent) {
          const lines = questionsContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          let currentQ: string | null = null;
          let currentA: string[] = [];

          for (const line of lines) {
              if (line.startsWith('*') || line.startsWith('-')) {
                  const content = line.substring(1).trim();
                  if (content.toLowerCase().startsWith('question:')) {
                      if (currentQ) { // Save previous if exists
                          newQuestions.push({ question: currentQ, answer: currentA.length > 0 ? currentA.join('\n') : undefined });
                      }
                      currentQ = content.substring('question:'.length).trim();
                      currentA = [];
                  } else if (content.toLowerCase().startsWith('answer:')) {
                      currentA.push(content.substring('answer:'.length).trim());
                  } else if (currentQ) { // If a question is active, treat subsequent bullets as part of answer if no new Q/A marker
                      currentA.push(content);
                  }
              }
          }
          if (currentQ) { // Add the last question
              newQuestions.push({ question: currentQ, answer: currentA.length > 0 ? currentA.join('\n') : undefined });
          }
      }
    }

    setConcepts(newConcepts);
    setQuestions(newQuestions);

    // If no structured content was parsed but raw content exists, log for debugging
    if (newConcepts.length === 0 && newQuestions.length === 0 && markdownText.length > 0) {
      console.warn("Could not parse structured content. Raw content might not follow expected format.", markdownText);
      toast({
        title: "Parsing Warning",
        description: "AI generated content, but couldn't parse it into structured sections. Displaying raw output.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateStudyContent = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic/language to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setRawGeneratedContent(""); // Clear all previous content before new generation
    setConcepts([]);
    setQuestions([]);

    try {
      let prompt = `Generate comprehensive interview preparation material for a job role involving "${topic}".
      
      You MUST structure the response strictly using Markdown.
      
      Always start with a level 1 heading '# Concepts'. Under this, provide clear and concise explanations for core concepts. Each distinct concept explanation MUST begin with a level 2 heading '## [Concept Name]', followed by its detailed explanation. Include all relevant sub-points within the concept's body.
      
      Following the Concepts section, start a new level 1 heading '# Interview Questions'. Under this, provide a bulleted list of common interview questions. Each question MUST start with a bullet point and then '**Question:**' (e.g., "* **Question:** Explain X?").
      
      For EVERY question, you MUST also provide a short, concise, and accurate example answer in a nested bullet point immediately following the question. This answer MUST start with '**Answer:**' (e.g., "* **Answer:** Y is Z.").

      `;

      // Adjust prompt based on content type
      if (contentType === "Concepts Only") {
        prompt = `Generate only theoretical concepts related to "${topic}". Strictly use Markdown. Each concept explanation MUST begin with a level 2 heading '## [Concept Name]', followed by its detailed explanation. Do not include any questions or answers. Ensure the response begins with '# Concepts'.`;
      } else if (contentType === "Questions Only") {
        prompt = `Generate a list of common interview questions related to "${topic}". Strictly use Markdown. Each question MUST start with a bullet point and then '**Question:**'. For EVERY question, you MUST also provide a short, concise, and accurate example answer in a nested bullet point immediately following the question. This answer MUST start with '**Answer:**'. Do not include concepts. Ensure the response begins with '# Interview Questions'.`;
      } else {
        // Default prompt handles "Concepts & Questions"
      }

      // Add difficulty and experience level
      if (difficulty !== "Any") {
        prompt += ` The content and questions should be suitable for a ${difficulty} difficulty level.`;
      }
      if (experienceLevel !== "Any") {
        prompt += ` Tailor the material for someone with ${experienceLevel} years of experience.`;
      }

      prompt += ` Ensure the response is well-structured, easy to read, and comprehensive. Provide the entire output in ${outputLanguage}.`;


      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
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
        const text = result.candidates[0].content.parts[0].text.trim();
        setRawGeneratedContent(text);
        parseGeneratedContent(text);
        toast({
          title: "Content Generated!",
          description: "Your study material is ready.",
        });
      } else {
        console.error("Unexpected API response structure:", result);
        toast({
          title: "Generation Failed",
          description: "Could not generate content. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating study content:", error);
      toast({
        title: "Generation Error",
        description:
          "An error occurred while connecting to the AI. Please try again. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetTool = () => {
    setTopic("");
    setContentType("Concepts & Questions");
    setDifficulty("Any");
    setExperienceLevel("Any");
    setOutputLanguage("English");
    setRawGeneratedContent("");
    setConcepts([]);
    setQuestions([]);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready for a new study session!",
    });
  };

  return (
    <ToolLayout
      title="AI Interview Study Guide"
      description="Get comprehensive theoretical concepts and interview questions tailored by topic, difficulty, and experience level."
      icon={<BookOpen className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-[#9B59B6] to-[#8E44AD]" // Purple theme
    >
      <div className="space-y-6">
        {/* Setup Your Practice Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#9B59B6]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#9B59B6]">
                Customize Your Study Material
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 lg:col-span-3">
                <Label htmlFor="topic-input" className="text-slate-400">
                  Topic / Programming Language:
                </Label>
                <Input
                  id="topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'Java Core Concepts', 'React Hooks', 'System Design'"
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#9B59B6]/50 focus:border-[#9B59B6] rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-type-select" className="text-slate-400">
                  Content Type:
                </Label>
                <Select
                  value={contentType}
                  onValueChange={setContentType}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="content-type-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-[#9B59B6]/50 focus:border-[#9B59B6] rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="Concepts & Questions">
                      Concepts & Questions
                    </SelectItem>
                    <SelectItem value="Concepts Only">Concepts Only</SelectItem>
                    <SelectItem value="Questions Only">
                      Questions Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty-select" className="text-slate-400">
                  Difficulty Level:
                </Label>
                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="difficulty-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-[#9B59B6]/50 focus:border-[#9B59B6] rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience-select" className="text-slate-400">
                  Years of Experience:
                </Label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="experience-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-[#9B59B6]/50 focus:border-[#9B59B6] rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="0-2 years">
                      0-2 years (Junior)
                    </SelectItem>
                    <SelectItem value="3-5 years">
                      3-5 years (Mid-Level)
                    </SelectItem>
                    <SelectItem value="6-10 years">
                      6-10 years (Senior)
                    </SelectItem>
                    <SelectItem value="10+ years">
                      10+ years (Lead/Architect)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="output-language-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-[#9B59B6]/50 focus:border-[#9B59B6] rounded-md shadow-sm"
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
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 lg:col-span-3 mt-4 text-center">
                <Button
                  onClick={handleGenerateStudyContent}
                  disabled={isGenerating || !topic.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] hover:from-[#7D3C9D] hover:to-[#6C3483] text-white shadow-lg shadow-[#9B59B6]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" /> Generate Study
                      Material
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Study Content Output Card */}
        <AnimatePresence mode="wait">
          {(concepts.length > 0 || questions.length > 0 || isGenerating || (rawGeneratedContent && !isGenerating)) && (
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
                  <CardTitle className="text-[#00A389]">
                    Your Study Material
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <motion.div
                      key="loading-content-output"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="min-h-[200px] flex items-center justify-center text-slate-400"
                    >
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Building your personalized study guide...
                    </motion.div>
                  ) : (
                    <div className="space-y-8">
                      {concepts.length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-[#FFD700] mb-4">
                            Concepts
                          </h3>
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            {concepts.map((concept, index) => (
                              <motion.div
                                key={`concept-${index}`}
                                variants={contentItemVariants}
                                initial="hidden"
                                animate="visible"
                              >
                                <AccordionItem
                                  value={`item-${index}`}
                                  className="border-b border-[#363A4D]"
                                >
                                  <AccordionTrigger className="text-lg font-semibold text-[#17D4FE] hover:no-underline text-left">
                                    {" "}
                                    {/* Added text-left */}
                                    {concept.title}
                                  </AccordionTrigger>
                                  <AccordionContent className="p-4 text-slate-300 bg-[#141624] rounded-b-md">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {concept.content}
                                    </ReactMarkdown>
                                  </AccordionContent>
                                </AccordionItem>
                              </motion.div>
                            ))}
                          </Accordion>
                        </div>
                      )}

                      {questions.length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-[#FFD700] mb-4 mt-8">
                            Interview Questions
                          </h3>
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            {questions.map((qItem, index) => (
                              <motion.div
                                key={`question-${index}`}
                                variants={contentItemVariants}
                                initial="hidden"
                                animate="visible"
                              >
                                <AccordionItem
                                  value={`q-item-${index}`}
                                  className="border-b border-[#363A4D]"
                                >
                                  <AccordionTrigger className="text-lg font-semibold text-[#17D4FE] hover:no-underline text-left">
                                    {" "}
                                    {/* Added text-left */}
                                    {qItem.question}
                                  </AccordionTrigger>
                                  <AccordionContent className="p-4 text-slate-300 bg-[#141624] rounded-b-md">
                                    {qItem.answer ? (
                                      <div className="space-y-2">
                                        <p className="font-semibold text-slate-200">
                                          Suggested Answer:
                                        </p>
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                        >
                                          {qItem.answer}
                                        </ReactMarkdown>
                                      </div>
                                    ) : (
                                      <p className="text-slate-400 italic">
                                        No example answer provided for this
                                        question by the AI.
                                      </p>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              </motion.div>
                            ))}
                          </Accordion>
                        </div>
                      )}

                      {/* Fallback to display raw content if structured parsing failed, and we're not generating */}
                      {concepts.length === 0 &&
                        questions.length === 0 &&
                        !isGenerating &&
                        rawGeneratedContent && (
                          <div className="text-center text-slate-400">
                            <p className="mb-4">
                              We couldn't perfectly structure the content, but
                              here's the raw output from the AI:
                            </p>
                            <div className="mt-4 p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-y-auto max-h-[400px] text-left">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {rawGeneratedContent}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                  <div className="mt-8 text-center">
                    <Button
                      onClick={resetTool}
                      size="lg"
                      className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Start New Study
                      Session
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
                Tips for Effective Learning:
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>
                  Be specific with your topic (e.g., "Java Concurrency" instead
                  of just "Java").
                </li>
                <li>
                  Adjust difficulty and experience levels to match your current
                  understanding.
                </li>
                <li>
                  Use the generated questions with the "AI Interview Practice
                  Tool" for hands-on practice.
                </li>
                <li>
                  Break down large topics into smaller, manageable chunks.
                </li>
                <li>Review concepts thoroughly before attempting questions.</li>
                <li>
                  The AI's generated answers are suggestions; always aim to
                  formulate your own understanding.
                </li>
              </ul>
              <p className="text-[#9B59B6] text-sm mt-4">
                <strong>Note:</strong> While AI provides comprehensive material,
                supplement with official documentation and hands-on coding for
                best results.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
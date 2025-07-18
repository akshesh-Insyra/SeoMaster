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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Violet-500 to Indigo-500
// - Tips/Info Accent: Amber

export default function AiInterviewStudyGuide() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("Concepts & Questions");
  const [difficulty, setDifficulty] = useState("Any");
  const [experienceLevel, setExperienceLevel] = useState("Any");
  const [outputLanguage, setOutputLanguage] = useState("English");

  const [rawGeneratedContent, setRawGeneratedContent] = useState("");
  const [concepts, setConcepts] = useState<
    Array<{ title: string; content: string }>
  >([]);
  const [questions, setQuestions] = useState<
    Array<{ question: string; answer?: string }>
  >([]);

  const [isGenerating, setIsGenerating] = useState(false);
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

  const contentItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  // --- Core logic functions (parsing, generation, reset) are unchanged ---
  const parseGeneratedContent = (markdownText: string) => {
    const newConcepts: { title: string; content: string }[] = [];
    const newQuestions: { question: string; answer?: string }[] = [];
    const conceptPattern = /^##\s*(.*?)\n([\s\S]*?)(?=(^##\s*|\s*#+\s*|$))/gm;
    const questionPattern =
      /^[*-]\s*\*\*Question:\*\*\s*(.*?)(?:\n\s*[*-]\s*\*\*Answer:\*\*\s*([\s\S]*?))?(?=\n[*-]\s*\*\*Question:\*\*|^\s*$|\n\s*#\s*\S+|$)/gm;
    const conceptsSectionMatch = markdownText.match(
      /(^#+\s*Concepts[\s\S]*?)(?:^#+\s*Interview Questions|$)/im
    );
    const questionsSectionMatch = markdownText.match(
      /(^#+\s*Interview Questions[\s\S]*)/im
    );

    if (conceptsSectionMatch) {
      let match;
      while ((match = conceptPattern.exec(conceptsSectionMatch[1])) !== null) {
        if (match[1]?.trim() && match[2]?.trim()) {
          newConcepts.push({
            title: match[1].trim(),
            content: match[2].trim(),
          });
        }
      }
    }

    if (questionsSectionMatch) {
      let match;
      while (
        (match = questionPattern.exec(questionsSectionMatch[1])) !== null
      ) {
        if (match[1]?.trim()) {
          newQuestions.push({
            question: match[1].trim(),
            answer: match[2]?.trim() || undefined,
          });
        }
      }
    }

    setConcepts(newConcepts);
    setQuestions(newQuestions);

    if (newConcepts.length === 0 && newQuestions.length === 0 && markdownText) {
      console.warn("Could not parse structured content.", markdownText);
      toast({
        title: "Parsing Warning",
        description:
          "AI output might not be structured. Displaying raw content.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateStudyContent = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic to generate content.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setRawGeneratedContent("");
    setConcepts([]);
    setQuestions([]);

    try {
      let prompt = `Generate comprehensive interview prep material for "${topic}". Structure the response STRICTLY with Markdown. Always start with a '# Concepts' heading, where each concept begins with a '## [Concept Name]' heading. Following that, use a '# Interview Questions' heading. Each question must start with '* **Question:**'. EVERY question must be followed by a concise answer starting with '* **Answer:**'.`;

      if (contentType === "Concepts Only") {
        prompt = `Generate only theoretical concepts for "${topic}". Structure the response STRICTLY with Markdown. Start with '# Concepts', and each concept must begin with '## [Concept Name]'.`;
      } else if (contentType === "Questions Only") {
        prompt = `Generate only interview questions for "${topic}". Structure the response STRICTLY with Markdown. Start with '# Interview Questions'. Each question must start with '* **Question:**', followed by a concise answer starting with '* **Answer:**'.`;
      }

      if (difficulty !== "Any")
        prompt += ` The difficulty should be ${difficulty}.`;
      if (experienceLevel !== "Any")
        prompt += ` Tailor it for someone with ${experienceLevel}.`;
      prompt += ` The entire output must be in ${outputLanguage}.`;

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

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = result.candidates[0].content.parts[0].text.trim();
        setRawGeneratedContent(text);
        parseGeneratedContent(text);
        toast({
          title: "Content Generated!",
          description: "Your study material is ready.",
        });
      } else {
        console.error("API Error:", result);
        toast({
          title: "Generation Failed",
          description: "Could not generate content. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({
        title: "Connection Error",
        description:
          "Could not connect to the AI. Please check your connection.",
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
    toast({
      title: "Tool Reset",
      description: "Ready for a new study session!",
    });
  };

  return (
    <ToolLayout
      title="AI Interview Study Guide"
      description="Get comprehensive concepts and questions tailored by topic, difficulty, and experience."
      icon={<BookOpen className="text-white" />}
      iconBg="bg-gradient-to-br from-violet-500 to-indigo-500"
    >
      <div className="space-y-8">
        {/* Setup Card */}
        <motion.div
          variants={cardInViewVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-violet-500/10">
            <CardHeader>
              <CardTitle className="text-violet-600">
                Customize Your Study Material
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="topic-input"
                  className="font-medium text-slate-700"
                >
                  Topic / Technology
                </Label>
                <Input
                  id="topic-input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'React Hooks', 'Java Concurrency', 'System Design'"
                  className="bg-white"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="content-type-select"
                  className="font-medium text-slate-700"
                >
                  Content Type
                </Label>
                <Select
                  value={contentType}
                  onValueChange={setContentType}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="content-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label
                  htmlFor="difficulty-select"
                  className="font-medium text-slate-700"
                >
                  Difficulty Level
                </Label>
                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="difficulty-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="experience-select"
                  className="font-medium text-slate-700"
                >
                  Years of Experience
                </Label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="experience-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="output-language-select"
                  className="font-medium text-slate-700"
                >
                  Output Language
                </Label>
                <Select
                  value={outputLanguage}
                  onValueChange={setOutputLanguage}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="output-language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 text-center pt-2">
                <Button
                  onClick={handleGenerateStudyContent}
                  disabled={isGenerating || !topic.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white shadow-lg shadow-violet-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-5 w-5" /> Generate Study Guide
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Content Card */}
        <AnimatePresence>
          {(isGenerating ||
            concepts.length > 0 ||
            questions.length > 0 ||
            rawGeneratedContent) && (
            <motion.div
              variants={cardInViewVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-indigo-500/10">
                <CardHeader>
                  <CardTitle className="text-indigo-600">
                    Your Study Material for "{topic}"
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[250px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
                      <p className="font-semibold text-lg">
                        Building your personalized study guide...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {concepts.length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-slate-700 mb-4">
                            Concepts
                          </h3>
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            {concepts.map((concept, index) => (
                              <AccordionItem
                                key={`concept-${index}`}
                                value={`item-${index}`}
                                className="border-b border-slate-200"
                              >
                                <AccordionTrigger className="text-lg font-semibold text-violet-700 hover:no-underline text-left">
                                  {concept.title}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 text-slate-700 bg-slate-50/70 rounded-b-md">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    className="prose prose-sm lg:prose-base prose-slate max-w-none"
                                  >
                                    {concept.content}
                                  </ReactMarkdown>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}
                      {questions.length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-slate-700 mb-4">
                            Interview Questions
                          </h3>
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            {questions.map((qItem, index) => (
                              <AccordionItem
                                key={`question-${index}`}
                                value={`q-item-${index}`}
                                className="border-b border-slate-200"
                              >
                                <AccordionTrigger className="text-lg font-semibold text-indigo-700 hover:no-underline text-left">
                                  {qItem.question}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 text-slate-700 bg-slate-50/70 rounded-b-md">
                                  {qItem.answer ? (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      className="prose prose-sm lg:prose-base prose-slate max-w-none"
                                    >{`**Answer:** ${qItem.answer}`}</ReactMarkdown>
                                  ) : (
                                    <p className="italic text-slate-500">
                                      No suggested answer was provided.
                                    </p>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}
                      {concepts.length === 0 &&
                        questions.length === 0 &&
                        rawGeneratedContent && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-semibold text-red-700">
                              Parsing Issue
                            </h4>
                            <p className="text-red-600">
                              The AI's response could not be structured. Here is
                              the raw output:
                            </p>
                            <div className="mt-2 p-2 bg-white border rounded text-slate-700 text-sm max-h-60 overflow-y-auto">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                className="prose prose-sm max-w-none"
                              >
                                {rawGeneratedContent}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      <div className="mt-8 text-center">
                        <Button
                          onClick={resetTool}
                          size="lg"
                          variant="ghost"
                          className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full px-8 py-3 font-semibold"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" /> Start New Study
                          Session
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}

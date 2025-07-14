import { useState } from "react";
import {
  Lightbulb,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  Brain,
} from "lucide-react"; // Added Brain icon
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

// For rendering Markdown results
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AiBrainstormingAssistant() {
  const [topic, setTopic] = useState("");
  const [ideaType, setIdeaType] = useState("General Ideas"); // Default idea type
  const [numIdeas, setNumIdeas] = useState("5"); // Default number of ideas
  const [generatedIdeas, setGeneratedIdeas] = useState<string | null>(null); // Raw markdown from AI
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

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic or keywords for brainstorming.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedIdeas(null); // Clear previous result

    try {
      let prompt = `Generate ${numIdeas} unique and creative ${ideaType.toLowerCase()} based on the following topic/keywords: "${topic}".
      
      Present each idea as a clear, concise bullet point.
      ${
        ideaType === "Startup Concepts"
          ? "For each startup concept, briefly mention the problem it solves, its unique selling proposition, and target audience."
          : ""
      }
      ${
        ideaType === "Story Plots"
          ? "For each story plot, include a brief premise, main characters, and a potential conflict or twist."
          : ""
      }
      ${
        ideaType === "Problem Solutions"
          ? "For each solution, briefly describe the problem and the core idea of the solution."
          : ""
      }
      
      Ensure the ideas are diverse, actionable, and inspiring.`;

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
        const ideasText =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setGeneratedIdeas(ideasText);
        toast({
          title: "Ideas Generated!",
          description: "Check out your new ideas below.",
        });
      } else {
        console.error("Unexpected API response structure:", geminiResult);
        toast({
          title: "Generation Failed",
          description: "Could not generate ideas. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
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

  const handleCopyIdeas = async () => {
    if (!generatedIdeas) return;
    try {
      await navigator.clipboard.writeText(generatedIdeas);
      toast({
        title: "Copied!",
        description: "Generated ideas copied to clipboard.",
      });
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = generatedIdeas;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: "Ideas copied to clipboard (fallback).",
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

  const handleDownloadIdeas = () => {
    if (!generatedIdeas) return;
    const blob = new Blob([generatedIdeas], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brainstorming-ideas-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Ideas text file downloaded successfully.",
    });
  };

  const handleReset = () => {
    setTopic("");
    setIdeaType("General Ideas");
    setNumIdeas("5");
    setGeneratedIdeas(null);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready to brainstorm new ideas.",
    });
  };

  return (
    <ToolLayout
      title="AI Brainstorming Assistant"
      description="Generate unique and creative ideas for various purposes with AI assistance."
      icon={<Brain className="text-white text-2xl" />} // Using Brain icon
      iconBg="bg-gradient-to-br from-indigo-500 to-pink-500" // A new creative gradient
    >
      <div className="space-y-6">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-indigo-500/10 text-white">
            <CardHeader>
              <CardTitle className="text-indigo-400">
                Generate New Ideas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                {" "}
                {/* Topic input takes full width */}
                <Label htmlFor="topic-input" className="text-slate-400">
                  Topic / Keywords
                </Label>
                <Input
                  id="topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'future of remote work', 'healthy fast food options', 'sci-fi story about time travel'"
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idea-type-select" className="text-slate-400">
                  Type of Ideas
                </Label>
                <Select
                  value={ideaType}
                  onValueChange={setIdeaType}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="idea-type-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select idea type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="General Ideas">General Ideas</SelectItem>
                    <SelectItem value="Blog Post Ideas">
                      Blog Post Ideas
                    </SelectItem>
                    <SelectItem value="Startup Concepts">
                      Startup Concepts
                    </SelectItem>
                    <SelectItem value="Story Plots">Story Plots</SelectItem>
                    <SelectItem value="Marketing Slogans">
                      Marketing Slogans
                    </SelectItem>
                    <SelectItem value="Product Features">
                      Product Features
                    </SelectItem>
                    <SelectItem value="Problem Solutions">
                      Problem Solutions
                    </SelectItem>
                    <SelectItem value="Creative Writing Prompts">
                      Creative Writing Prompts
                    </SelectItem>
                    <SelectItem value="Social Media Content Ideas">
                      Social Media Content Ideas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="num-ideas-select" className="text-slate-400">
                  Number of Ideas
                </Label>
                <Select
                  value={numIdeas}
                  onValueChange={setNumIdeas}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="num-ideas-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 text-center">
                <Button
                  onClick={handleGenerateIdeas}
                  disabled={isGenerating || !topic.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Brainstorm Ideas
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Ideas Result Card */}
        <AnimatePresence mode="wait">
          {(generatedIdeas || isGenerating) && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-pink-500/10 text-white">
                <CardHeader>
                  <CardTitle className="text-pink-400">
                    Your Brainstormed Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[200px] flex items-center justify-center text-slate-400">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Brainstorming ideas...
                    </div>
                  ) : (
                    <div className="min-h-[200px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-auto max-h-[600px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={generatedIdeas || "empty"}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={resultVariants}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {generatedIdeas || ""}
                          </ReactMarkdown>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      onClick={handleCopyIdeas}
                      disabled={!generatedIdeas || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-md transition-all duration-200 rounded-full px-4 py-2"
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadIdeas}
                      disabled={!generatedIdeas || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-indigo-500 text-black font-semibold hover:from-pink-600 hover:to-indigo-600 shadow-md transition-all duration-200 rounded-full px-4 py-2"
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
                      <RefreshCw className="mr-2 h-4 w-4" /> Generate New Ideas
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
                Tips for Effective Brainstorming
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>Be specific with your topic to get more targeted ideas.</li>
                <li>
                  Experiment with different "Type of Ideas" to explore various
                  angles.
                </li>
                <li>
                  Don't filter ideas initially; quantity over quality in early
                  stages.
                </li>
                <li>
                  Use the generated ideas as a springboard for further thought.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}

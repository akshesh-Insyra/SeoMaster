import { useState } from "react";
import {
  Lightbulb,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  Brain,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// For rendering Markdown results
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function AiBrainstormingAssistant() {
  const [topic, setTopic] = useState("");
  const [ideaType, setIdeaType] = useState("General Ideas");
  const [numIdeas, setNumIdeas] = useState("5");
  const [generatedIdeas, setGeneratedIdeas] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants (remain the same, they are independent of theme)
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
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
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
    setGeneratedIdeas(null);

    try {
        // --- PROMPT AND API CALL LOGIC (UNCHANGED) ---
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
      
      Ensure the ideas are diverse, actionable, and inspiring. Format the output nicely using Markdown.`;

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
          description: "Your new ideas are ready below.",
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

  // --- UTILITY FUNCTIONS (handleCopy, handleDownload, handleReset) ---
  // The logic inside these functions remains unchanged.
  const handleCopyIdeas = async () => {
    if (!generatedIdeas) return;
    try {
      await navigator.clipboard.writeText(generatedIdeas);
      toast({
        title: "Copied!",
        description: "Generated ideas copied to clipboard.",
      });
    } catch (error) {
        // Fallback for older browsers
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
    a.download = `brainstorming-ideas-${new Date().toISOString().split("T")[0]}.txt`;
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
      description: "Ready for your next big idea!",
    });
  };

  return (
    <ToolLayout
      title="AI Brainstorming Assistant"
      description="Generate unique and creative ideas for various purposes with AI assistance."
      icon={<Brain className="text-white" />}
      iconBg="bg-gradient-to-br from-teal-400 to-cyan-500"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-teal-500/10">
            <CardHeader>
              <CardTitle className="text-teal-600">
                Start Your Brainstorm
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="topic-input" className="text-slate-600 font-medium">
                  Topic / Keywords
                </Label>
                <Input
                  id="topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'sustainable packaging', 'fantasy novel for young adults'"
                  className="w-full font-sans text-base bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idea-type-select" className="text-slate-600 font-medium">
                  Type of Ideas
                </Label>
                <Select
                  value={ideaType}
                  onValueChange={setIdeaType}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="idea-type-select"
                    className="w-full font-sans text-base bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select idea type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-800 border-slate-200">
                    <SelectItem value="General Ideas">General Ideas</SelectItem>
                    <SelectItem value="Blog Post Ideas">Blog Post Ideas</SelectItem>
                    <SelectItem value="Startup Concepts">Startup Concepts</SelectItem>
                    <SelectItem value="Story Plots">Story Plots</SelectItem>
                    <SelectItem value="Marketing Slogans">Marketing Slogans</SelectItem>
                    <SelectItem value="Product Features">Product Features</SelectItem>
                    <SelectItem value="Problem Solutions">Problem Solutions</SelectItem>
                    <SelectItem value="Creative Writing Prompts">Creative Writing Prompts</SelectItem>
                    <SelectItem value="Social Media Content Ideas">Social Media Content Ideas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="num-ideas-select" className="text-slate-600 font-medium">
                  Number of Ideas
                </Label>
                <Select
                  value={numIdeas}
                  onValueChange={setNumIdeas}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="num-ideas-select"
                    className="w-full font-sans text-base bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-800 border-slate-200">
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 text-center pt-2">
                <Button
                  onClick={handleGenerateIdeas}
                  disabled={isGenerating || !topic.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Brainstorm Ideas
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
                key="result-card"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={cardInViewVariants}
            >
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-cyan-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-cyan-700">
                    Your Brainstormed Ideas
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyIdeas}
                      disabled={!generatedIdeas || isGenerating}
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-full"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadIdeas}
                      disabled={!generatedIdeas || isGenerating}
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-full"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[250px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-500 mb-3" />
                      <p className="font-semibold text-lg">Thinking up some great ideas...</p>
                      <p>This should only take a moment.</p>
                    </div>
                  ) : (
                    <div className="min-h-[250px] p-4 bg-slate-50/70 border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={generatedIdeas || "empty"}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={resultVariants}
                          className="prose prose-sm lg:prose-base prose-slate max-w-none"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {generatedIdeas || ""}
                          </ReactMarkdown>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                   <div className="mt-6 text-center">
                    <Button
                      onClick={handleReset}
                      size="lg"
                      variant="ghost"
                      className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full px-8 py-3 font-semibold"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Start Over & Reset
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
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6 flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2 text-lg">
                    Tips for Effective Brainstorming
                  </h4>
                  <ul className="text-amber-900/80 space-y-1.5 text-sm list-disc list-outside ml-4">
                    <li>Be specific with your topic to get more targeted ideas.</li>
                    <li>Experiment with different "Type of Ideas" to explore various angles.</li>
                    <li>Don't filter ideas initially—quantity can lead to quality.</li>
                    <li>Use the generated ideas as a springboard for further, deeper thought.</li>
                  </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
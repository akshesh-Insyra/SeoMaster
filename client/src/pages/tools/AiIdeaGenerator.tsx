import { useState } from "react";
import {
  Lightbulb,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
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

// For rendering Markdown results
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Rose-500 to Orange-500
// - Tips/Info Accent: Amber

export default function AiIdeaGenerator() {
  const [topic, setTopic] = useState("");
  const [ideaType, setIdeaType] = useState("Blog Post Ideas");
  const [generatedIdeas, setGeneratedIdeas] = useState<string | null>(null);
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
  const handleGenerateIdeas = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic or keywords to generate ideas.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedIdeas(null);

    try {
      const prompt = `Generate 5-7 unique and creative ${ideaType.toLowerCase()} based on the following topic/keywords: "${topic}".
      
      Present each idea as a clear, concise bullet point using Markdown.
      ${
        ideaType === "Startup Concepts"
          ? "For each startup concept, briefly mention the problem it solves or its unique selling proposition."
          : ""
      }
      ${
        ideaType === "Story Plots"
          ? "For each story plot, include a brief premise and a potential conflict."
          : ""
      }
      
      Ensure the ideas are diverse and inspiring.`;

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
    a.download = `${ideaType.toLowerCase().replace(/\s+/g, "-")}-ideas.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Ideas saved as a .txt file.",
    });
  };

  const handleReset = () => {
    setTopic("");
    setIdeaType("Blog Post Ideas");
    setGeneratedIdeas(null);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready for your next big idea.",
    });
  };

  return (
    <ToolLayout
      title="AI Idea Generator"
      description="Brainstorm and generate creative ideas for any purpose with AI."
      icon={<Lightbulb className="text-white" />}
      iconBg="bg-gradient-to-br from-rose-500 to-orange-500"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-rose-500/10">
            <CardHeader>
              <CardTitle className="text-rose-600">
                Find Your Next Great Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="topic-input"
                  className="font-medium text-slate-700"
                >
                  Topic / Keywords
                </Label>
                <Input
                  id="topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'sustainable living', 'the future of AI', 'space exploration'"
                  className="w-full bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 rounded-md"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="idea-type-select"
                  className="font-medium text-slate-700"
                >
                  Type of Ideas
                </Label>
                <Select
                  value={ideaType}
                  onValueChange={setIdeaType}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="idea-type-select"
                    className="w-full bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 rounded-md"
                  >
                    <SelectValue placeholder="Select idea type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-800 border-slate-200">
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
                    <SelectItem value="Creative Writing Prompts">
                      Creative Writing Prompts
                    </SelectItem>
                    <SelectItem value="Social Media Content Ideas">
                      Social Media Content Ideas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 text-center pt-2">
                <Button
                  onClick={handleGenerateIdeas}
                  disabled={isGenerating || !topic.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-lg shadow-rose-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" /> Generate Ideas
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
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-orange-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-orange-600">
                    Your Generated Ideas
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
                      <Loader2 className="h-8 w-8 animate-spin text-rose-500 mb-3" />
                      <p className="font-semibold text-lg">
                        Brainstorming great ideas...
                      </p>
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6">
              <h4 className="font-semibold text-amber-700 mb-3 text-lg">
                Tips for Generating Great Ideas
              </h4>
              <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                <li>Be specific with your topic for more relevant ideas.</li>
                <li>
                  Experiment with different "Type of Ideas" to explore various
                  angles.
                </li>
                <li>
                  Combine multiple generated ideas to create something truly
                  unique.
                </li>
                <li>
                  Use the AI's output as a starting point, then add your own
                  creative touch!
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}

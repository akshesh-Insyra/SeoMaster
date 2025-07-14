import { useState } from "react";
import { Palette, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

const isValidHex = (hex: string) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);

export default function ColorPaletteGenerator() {
  const [moodOrTheme, setMoodOrTheme] = useState("");
  const [generatedPalette, setGeneratedPalette] = useState<string[]>([]); // Array of hex codes
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

  const paletteItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const handleGeneratePalette = async () => {
    if (!moodOrTheme.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter a mood or theme for your palette.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedPalette([]);

    try {
      let chatHistory = [];
      const palettePrompt = `Generate a harmonious color palette of 5 distinct colors based on the theme/mood: "${moodOrTheme}". Provide the colors as comma-separated HEX codes only, without any other text or descriptions. For example: #RRGGBB, #RRGGBB, #RRGGBB, #RRGGBB, #RRGGBB.`;
      chatHistory.push({ role: "user", parts: [{ text: palettePrompt }] });
      const payload = { contents: chatHistory };
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
        const text = result.candidates[0].content.parts[0].text;
        // Attempt to parse hex codes from the generated text
        const hexCodes = text
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => isValidHex(s)); // Only keep valid hex codes

        if (hexCodes.length > 0) {
          setGeneratedPalette(hexCodes);
          toast({
            title: "Success!",
            description: "Color palette generated successfully.",
          });
        } else {
          toast({
            title: "Generation Failed",
            description:
              "Could not parse valid color codes. Try a different prompt.",
            variant: "destructive",
          });
        }
      } else {
        console.error("Unexpected API response structure:", result);
        toast({
          title: "Generation Failed",
          description: "Could not generate palette. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating palette:", error);
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

  const handleCopyHex = async (hex: string) => {
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
      toast({ title: "Copied!", description: `${hex} copied to clipboard.` });
    } catch (error) {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = hex;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: `${hex} copied to clipboard (fallback).`,
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

  return (
    <ToolLayout
      title="AI Color Palette Generator"
      description="Generate harmonious color palettes based on moods, themes, or keywords using AI."
      icon={<Palette className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-[#FFD700] to-[#AF00C3]" // Adjusted theme accent
    >
      <div className="space-y-6">
        {/* Input Mood/Theme Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">
                Describe Your Palette
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label
                htmlFor="mood-theme-input"
                className="text-slate-400 mb-2 block"
              >
                Enter a mood, theme, or concept for your color palette:
              </Label>
              <Input
                id="mood-theme-input"
                type="text"
                value={moodOrTheme}
                onChange={(e) => setMoodOrTheme(e.target.value)}
                placeholder="e.g., 'calm forest', 'vibrant city', 'retro 80s', 'winter morning'"
                className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] rounded-md shadow-sm"
              />
              <div className="mt-4 text-center">
                <Button
                  onClick={handleGeneratePalette}
                  disabled={isGenerating || !moodOrTheme.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-[#FFD700] to-[#AF00C3] hover:from-[#E6C200] hover:to-[#9600AA] text-white shadow-lg shadow-[#FFD700]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Palette className="mr-2 h-4 w-4" /> Generate Palette
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Palette Output Card */}
        <AnimatePresence mode="wait">
          {generatedPalette.length > 0 && (
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
                    Generated Color Palette
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap justify-center gap-4 p-4 min-h-[120px] items-center">
                    <AnimatePresence>
                      {generatedPalette.map((hex, index) => (
                        <motion.div
                          key={hex} // Use hex as key for unique identity
                          className="flex flex-col items-center gap-2"
                          variants={paletteItemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                        >
                          <div
                            className="w-20 h-20 rounded-lg border border-slate-600 cursor-pointer transition-transform hover:scale-105 shadow-md"
                            style={{ backgroundColor: hex }}
                            onClick={() => handleCopyHex(hex)}
                            title={`Click to copy ${hex}`}
                          ></div>
                          <span className="text-sm font-mono text-slate-300">
                            {hex.toUpperCase()}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-slate-400 text-sm">
                      Click on a color swatch to copy its HEX code.
                    </p>
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
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#00A389] mb-3 text-lg">
                Tips for Best Results:
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>Be descriptive with your mood or theme (e.g., "autumn harvest," "deep space").</li>
                <li>Try adjectives like "vibrant," "muted," "dark," or "light."</li>
                <li>Experiment with different inputs to discover unique combinations.</li>
                <li>
                  The AI's interpretation of color can be subjective; refine your
                  prompt if needed.
                </li>
              </ul>
              <p className="text-[#FFD700] text-sm mt-4">
                <strong>Note:</strong> This tool suggests colors based on AI's
                understanding of text descriptions. Always review and adjust
                for your specific design needs.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
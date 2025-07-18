import { useState } from "react";
import { Palette, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// Helper to validate if a string is a hex code
const isValidHex = (hex: string) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-600 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Rose-500 -> Orange-400 -> Amber-500

export default function ColorPaletteGenerator() {
  const [moodOrTheme, setMoodOrTheme] = useState("");
  const [generatedPalette, setGeneratedPalette] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const paletteItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  // --- Core logic functions (handleGenerate, handleCopy) are unchanged ---
  const handleGeneratePalette = async () => {
    if (!moodOrTheme.trim()) {
      toast({ title: "Empty Input", description: "Please enter a mood or theme.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGeneratedPalette([]);

    try {
      const palettePrompt = `Generate a harmonious color palette of 5 distinct colors based on the theme/mood: "${moodOrTheme}". Provide the colors as comma-separated HEX codes only, without any other text. Example: #RRGGBB, #RRGGBB, #RRGGBB, #RRGGBB, #RRGGBB.`;
      const payload = { contents: [{ role: "user", parts: [{ text: palettePrompt }] }] };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = result.candidates[0].content.parts[0].text;
        const hexCodes = text.split(",").map((s: string) => s.trim()).filter(isValidHex);
        
        if (hexCodes.length > 0) {
          setGeneratedPalette(hexCodes);
          toast({ title: "Success!", description: "Color palette generated." });
        } else {
          toast({ title: "Generation Failed", description: "Could not parse valid colors. Try another prompt.", variant: "destructive" });
        }
      } else {
        console.error("API Error:", result);
        toast({ title: "Generation Failed", description: "Could not generate a palette. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({ title: "Connection Error", description: "Could not connect to the AI.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyHex = async (hex: string) => {
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
      toast({ description: `${hex.toUpperCase()} copied to clipboard.` });
    } catch (error) {
        const textarea = document.createElement("textarea");
        textarea.value = hex;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          toast({ description: `${hex.toUpperCase()} copied (fallback).` });
        } catch (err) {
          toast({ title: "Copy Failed", variant: "destructive" });
        } finally {
          document.body.removeChild(textarea);
        }
    }
  };

  return (
    <ToolLayout
      title="AI Color Palette Generator"
      description="Generate harmonious color palettes from any mood, theme, or keyword."
      icon={<Palette className="text-white" />}
      iconBg="bg-gradient-to-br from-rose-500 via-orange-400 to-amber-500"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-rose-500/10">
            <CardHeader>
              <CardTitle className="text-rose-600">Describe Your Palette's Vibe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="mood-theme-input" className="font-medium text-slate-700">
                  Enter a mood, theme, or concept:
                </Label>
                <Input
                  id="mood-theme-input"
                  type="text"
                  value={moodOrTheme}
                  onChange={(e) => setMoodOrTheme(e.target.value)}
                  placeholder="e.g., 'calm forest', 'vibrant city sunrise', 'retro 80s synthwave'"
                  className="w-full bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 rounded-md"
                />
              </div>
              <div className="mt-6 text-center">
                <Button
                  onClick={handleGeneratePalette}
                  disabled={isGenerating || !moodOrTheme.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>) : (<><Palette className="mr-2 h-5 w-5" /> Generate Palette</>)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Palette Output Card */}
        <AnimatePresence>
          {(isGenerating || generatedPalette.length > 0) && (
            <motion.div variants={cardInViewVariants} initial="hidden" animate="visible" exit="hidden">
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-orange-500/10">
                <CardHeader>
                  <CardTitle className="text-orange-600">Generated Color Palette</CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[150px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-rose-500 mb-3" />
                      <p className="font-semibold text-lg">Mixing the perfect colors...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 p-4 min-h-[120px] items-center bg-slate-50/70 border border-slate-200 rounded-lg">
                        {generatedPalette.map((hex, index) => (
                          <motion.div
                            key={hex + index}
                            className="flex flex-col items-center gap-2 group"
                            variants={paletteItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                          >
                            <div
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-slate-200 cursor-pointer transition-transform group-hover:scale-110 shadow-md"
                              style={{ backgroundColor: hex }}
                              onClick={() => handleCopyHex(hex)}
                              title={`Click to copy ${hex}`}
                            ></div>
                            <span className="text-sm font-mono text-slate-600 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="w-3 h-3 text-slate-400"/>
                              {hex.toUpperCase()}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                       <p className="text-center text-slate-500 text-sm mt-4">
                        Click on a color swatch to copy its HEX code.
                      </p>
                    </>
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
import { useState } from "react";
import { Type, Pilcrow, Baseline } from "lucide-react"; // Added more specific icons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ToolLayout from "@/components/ToolLayout";
import { motion } from "framer-motion";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-600 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Fuchsia-500 to Rose-500
// - Tips/Info Accent: Amber

export default function CharacterCounter() {
  const [text, setText] = useState("");

  // Framer Motion variants are theme-independent
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // Real-time calculations
  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = text.split("\n").filter(Boolean).length || (text ? 1 : 0);
  const paragraphCount = text.split(/\n\s*\n/).filter(Boolean).length;

  return (
    <ToolLayout
      title="Character & Word Counter"
      description="Instantly count characters, words, lines, and paragraphs in your text."
      icon={<Type className="text-white" />}
      iconBg="bg-gradient-to-br from-fuchsia-500 to-rose-500"
    >
      <div className="space-y-8">
        {/* Input & Counter Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-fuchsia-500/10">
            <CardHeader>
              <CardTitle className="text-fuchsia-600">
                Enter Your Text Below
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your content here to see the magic happen..."
                rows={12}
                className="w-full font-sans text-base bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 rounded-md shadow-sm"
              />
              {/* Statistics Display */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">
                    Characters
                  </p>
                  <p className="text-3xl font-bold text-fuchsia-600">
                    {characterCount}
                  </p>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">Words</p>
                  <p className="text-3xl font-bold text-fuchsia-600">
                    {wordCount}
                  </p>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">Lines</p>
                  <p className="text-3xl font-bold text-fuchsia-600">
                    {lineCount}
                  </p>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">
                    Paragraphs
                  </p>
                  <p className="text-3xl font-bold text-fuchsia-600">
                    {paragraphCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
                Why Use a Character Counter?
              </h4>
              <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                <li>
                  Essential for social media posts with character limits (like
                  X/Twitter).
                </li>
                <li>
                  Helps meet word count requirements for essays, reports, or
                  articles.
                </li>
                <li>
                  Useful for optimizing meta descriptions and titles for SEO.
                </li>
                <li>
                  Quickly assess the length and readability of any piece of
                  text.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}

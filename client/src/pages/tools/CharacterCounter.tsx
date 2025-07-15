import { useState } from "react";
import { Type, Loader2 } from "lucide-react"; // Reusing Type icon, or could use 'Hash' or 'TextCursorInput'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion } from "framer-motion";

export default function CharacterCounter() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  // Framer Motion variants (reused from your theme)
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const characterCount = text.length;
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const lineCount = text.split("\n").length; // Basic line count

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <ToolLayout
      title="Character & Word Counter"
      description="Instantly count characters, words, and lines in your text."
      icon={<Type className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-purple-500 to-pink-500" // Example gradient
    >
      <div className="space-y-6">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-purple-500/10 text-white">
            <CardHeader>
              <CardTitle className="text-purple-400">Enter Your Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="text-input" className="text-slate-400 mb-2 block">
                Paste or type your text here:
              </Label>
              <Textarea
                id="text-input"
                value={text}
                onChange={handleTextChange}
                placeholder="Start typing or paste your content..."
                rows={10}
                className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 rounded-md shadow-sm"
              />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-[#202230] rounded-md border border-[#363A4D]">
                  <p className="text-slate-400 text-sm">Characters</p>
                  <p className="text-xl font-bold text-white">
                    {characterCount}
                  </p>
                </div>
                <div className="p-3 bg-[#202230] rounded-md border border-[#363A4D]">
                  <p className="text-slate-400 text-sm">Words</p>
                  <p className="text-xl font-bold text-white">{wordCount}</p>
                </div>
                <div className="p-3 bg-[#202230] rounded-md border border-[#363A4D]">
                  <p className="text-slate-400 text-sm">Lines</p>
                  <p className="text-xl font-bold text-white">{lineCount}</p>
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
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#FFD700] mb-3 text-lg">
                Why Use a Character Counter?
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>Essential for social media posts with character limits.</li>
                <li>
                  Helps meet word count requirements for essays or articles.
                </li>
                <li>Useful for SEO content optimization.</li>
                <li>Quickly assess readability and length of any text.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}

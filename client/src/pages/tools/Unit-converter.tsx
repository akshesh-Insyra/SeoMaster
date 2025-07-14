import { useState, useRef, useEffect, useCallback } from "react";
import { Ruler, RefreshCcw, Loader2 } from "lucide-react";
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

const unitConversions = {
  length: {
    base: "meters", // Base unit for length
    units: {
      meters: 1,
      kilometers: 1000,
      centimeters: 0.01,
      millimeters: 0.001,
      micrometers: 0.000001,
      nanometers: 0.000000001,
      miles: 1609.34,
      yards: 0.9144,
      feet: 0.3048,
      inches: 0.0254,
      "nautical miles": 1852,
    },
    labels: {
      meters: "Meters (m)",
      kilometers: "Kilometers (km)",
      centimeters: "Centimeters (cm)",
      millimeters: "Millimeters (mm)",
      micrometers: "Micrometers (µm)",
      nanometers: "Nanometers (nm)",
      miles: "Miles (mi)",
      yards: "Yards (yd)",
      feet: "Feet (ft)",
      inches: "Inches (in)",
      "nautical miles": "Nautical Miles (nmi)",
    },
  },
  mass: {
    base: "kilograms", // Base unit for mass
    units: {
      kilograms: 1,
      grams: 0.001,
      milligrams: 0.000001,
      micrograms: 0.000000001,
      "metric tons": 1000,
      pounds: 0.453592,
      ounces: 0.0283495,
      carats: 0.0002,
    },
    labels: {
      kilograms: "Kilograms (kg)",
      grams: "Grams (g)",
      milligrams: "Milligrams (mg)",
      micrograms: "Micrograms (µg)",
      "metric tons": "Metric Tons (t)",
      pounds: "Pounds (lb)",
      ounces: "Ounces (oz)",
      carats: "Carats (ct)",
    },
  },
  volume: {
    base: "liters", // Base unit for volume
    units: {
      liters: 1,
      milliliters: 0.001,
      "cubic meters": 1000,
      "cubic centimeters": 0.001,
      gallons: 3.78541,
      quarts: 0.946353,
      pints: 0.473176,
      cups: 0.236588,
      "fluid ounces": 0.0295735,
      tablespoons: 0.0147868,
      teaspoons: 0.00492892,
    },
    labels: {
      liters: "Liters (L)",
      milliliters: "Milliliters (mL)",
      "cubic meters": "Cubic Meters (m³)",
      "cubic centimeters": "Cubic Centimeters (cm³)",
      gallons: "Gallons (gal)",
      quarts: "Quarts (qt)",
      pints: "Pints (pt)",
      cups: "Cups (cup)",
      "fluid ounces": "Fluid Ounces (fl oz)",
      tablespoons: "Tablespoons (tbsp)",
      teaspoons: "Teaspoons (tsp)",
    },
  },
  temperature: {
    base: "celsius", // Base unit for temperature (special case: linear conversion, not multiplicative)
    units: {
      celsius: { toBase: (val) => val, fromBase: (val) => val },
      fahrenheit: {
        toBase: (val) => ((val - 32) * 5) / 9,
        fromBase: (val) => (val * 9) / 5 + 32,
      },
      kelvin: {
        toBase: (val) => val - 273.15,
        fromBase: (val) => val + 273.15,
      },
    },
    labels: {
      celsius: "Celsius (°C)",
      fahrenheit: "Fahrenheit (°F)",
      kelvin: "Kelvin (K)",
    },
  },
  time: {
    base: "seconds", // Base unit for time
    units: {
      seconds: 1,
      milliseconds: 0.001,
      minutes: 60,
      hours: 3600,
      days: 86400,
      weeks: 604800,
      months: 2629800, // Approximate (30.44 days avg)
      years: 31557600, // Approximate (365.25 days avg)
    },
    labels: {
      seconds: "Seconds (s)",
      milliseconds: "Milliseconds (ms)",
      minutes: "Minutes (min)",
      hours: "Hours (hr)",
      days: "Days (day)",
      weeks: "Weeks (week)",
      months: "Months (approx)",
      years: "Years (approx)",
    },
  },
  speed: {
    base: "meters/second", // Base unit for speed
    units: {
      "meters/second": 1,
      "kilometers/hour": 1 / 3.6, // 1 km/h = 1000m / 3600s
      "miles/hour": 0.44704, // 1 mph = 1609.34m / 3600s
      knots: 0.514444, // 1 knot = 1 nautical mile / hour
      "feet/second": 0.3048,
    },
    labels: {
      "meters/second": "Meters/Second (m/s)",
      "kilometers/hour": "Kilometers/Hour (km/h)",
      "miles/hour": "Miles/Hour (mph)",
      knots: "Knots (kn)",
      "feet/second": "Feet/Second (ft/s)",
    },
  },
  area: {
    base: "square meters", // Base unit for area
    units: {
      "square meters": 1,
      "square kilometers": 1000000,
      "square centimeters": 0.0001,
      "square millimeters": 0.000001,
      "square miles": 2589988.11,
      "square yards": 0.836127,
      "square feet": 0.092903,
      "square inches": 0.00064516,
      acres: 4046.86,
      hectares: 10000,
    },
    labels: {
      "square meters": "Square Meters (m²)",
      "square kilometers": "Square Kilometers (km²)",
      "square centimeters": "Square Centimeters (cm²)",
      "square millimeters": "Square Millimeters (mm²)",
      "square miles": "Square Miles (mi²)",
      "square yards": "Square Yards (yd²)",
      "square feet": "Square Feet (ft²)",
      "square inches": "Square Inches (in²)",
      acres: "Acres (ac)",
      hectares: "Hectares (ha)",
    },
  },
  "data storage": {
    base: "bytes", // Base unit for data storage
    units: {
      bits: 1 / 8,
      bytes: 1,
      kilobytes: 1024,
      megabytes: 1024 * 1024,
      gigabytes: 1024 * 1024 * 1024,
      terabytes: 1024 * 1024 * 1024 * 1024,
    },
    labels: {
      bits: "Bits (b)",
      bytes: "Bytes (B)",
      kilobytes: "Kilobytes (KB)",
      megabytes: "Megabytes (MB)",
      gigabytes: "Gigabytes (GB)",
      terabytes: "Terabytes (TB)",
    },
  },
};

export default function UnitConverter() {
  const [inputValue, setInputValue] = useState("");
  const [unitCategory, setUnitCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("meters");
  const [toUnit, setToUnit] = useState("kilometers");
  const [result, setResult] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const currentUnits = unitConversions[unitCategory].units;
  const currentLabels = unitConversions[unitCategory].labels;

  // Update 'from' and 'to' units when category changes
  useEffect(() => {
    const defaultFrom = Object.keys(currentUnits)[0];
    const defaultTo =
      Object.keys(currentUnits)[1] || Object.keys(currentUnits)[0]; // Ensure 'to' unit exists
    setFromUnit(defaultFrom);
    setToUnit(defaultTo);
    setResult(""); // Clear result on category change
  }, [unitCategory, currentUnits]);

  const convertUnits = useCallback(() => {
    if (!inputValue || isNaN(parseFloat(inputValue))) {
      setResult("");
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number to convert.",
        variant: "destructive",
      });
      return;
    }

    const value = parseFloat(inputValue);
    setIsConverting(true);
    setResult(""); // Clear previous result for animation

    // Simulate conversion delay for animation
    setTimeout(() => {
      let convertedValue;
      const categoryData = unitConversions[unitCategory];

      if (unitCategory === "temperature") {
        // Temperature requires special handling for linear conversions
        const fromConversion = categoryData.units[fromUnit];
        const toConversion = categoryData.units[toUnit];

        // Convert from 'fromUnit' to base (Celsius)
        const valueInBase = fromConversion.toBase(value);
        // Convert from base (Celsius) to 'toUnit'
        convertedValue = toConversion.fromBase(valueInBase);
      } else {
        // Multiplicative conversions for other categories
        const fromFactor = categoryData.units[fromUnit];
        const toFactor = categoryData.units[toUnit];

        if (!fromFactor || !toFactor) {
          toast({
            title: "Conversion Error",
            description: "Selected units are not valid for this category.",
            variant: "destructive",
          });
          setIsConverting(false);
          return;
        }

        // Convert input value to base unit, then from base unit to target unit
        convertedValue = (value * fromFactor) / toFactor;
      }

      setResult(convertedValue.toFixed(6).replace(/\.?0+$/, "")); // Format to 6 decimal places, remove trailing zeros
      setIsConverting(false);
    }, 500); // Half-second delay for conversion animation
  }, [inputValue, unitCategory, fromUnit, toUnit, toast]);

  // Trigger conversion whenever input value, unit category, or selected units change
  useEffect(() => {
    const handler = setTimeout(() => {
      convertUnits();
    }, 300); // Debounce conversion slightly
    return () => clearTimeout(handler);
  }, [inputValue, unitCategory, fromUnit, toUnit, convertUnits]);

  // Framer Motion variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Framer Motion variants for card entrance on scroll
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // Framer Motion variants for result text change
  const resultVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between various units of measurement instantly."
      icon={<Ruler className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-[#00A389] to-[#FFD700]" // Theme accent
      className="bg-[#1A1C2C] text-white" // Main background
    >
      <div className="space-y-6">
        {/* Unit Category Selection */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#00A389]">
                Select Unit Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <Label
                  htmlFor="unit-category"
                  className="text-slate-400 mb-2 block"
                >
                  Category
                </Label>
                <Select value={unitCategory} onValueChange={setUnitCategory}>
                  <SelectTrigger className="bg-[#141624] border border-[#363A4D] text-white focus:ring-[#00A389] focus:border-[#00A389] transition-all duration-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1C2C] text-white border-[#2d314d]">
                    {Object.keys(unitConversions).map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="hover:bg-[#202230] focus:bg-[#202230] text-white capitalize transition-colors duration-150"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Input Value and Unit Selection */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">
                Enter Value and Select Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Value */}
                <div>
                  <Label
                    htmlFor="input-value"
                    className="text-slate-400 mb-2 block"
                  >
                    Value
                  </Label>
                  <Input
                    id="input-value"
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter value to convert"
                    className="w-full bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00A389]/50 focus:border-[#00A389] rounded-md shadow-sm"
                  />
                </div>

                {/* From Unit */}
                <div>
                  <Label
                    htmlFor="from-unit"
                    className="text-slate-400 mb-2 block"
                  >
                    From Unit
                  </Label>
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger className="w-full bg-[#141624] border border-[#363A4D] text-white focus:ring-[#00A389] focus:border-[#00A389] transition-all duration-200">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1C2C] text-white border-[#2d314d]">
                      {Object.keys(currentUnits).map((unit) => (
                        <SelectItem
                          key={unit}
                          value={unit}
                          className="hover:bg-[#202230] focus:bg-[#202230] text-white transition-colors duration-150"
                        >
                          {currentLabels[unit]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To Unit */}
                <div>
                  <Label
                    htmlFor="to-unit"
                    className="text-slate-400 mb-2 block"
                  >
                    To Unit
                  </Label>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger className="w-full bg-[#141624] border border-[#363A4D] text-white focus:ring-[#00A389] focus:border-[#00A389] transition-all duration-200">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1C2C] text-white border-[#2d314d]">
                      {Object.keys(currentUnits).map((unit) => (
                        <SelectItem
                          key={unit}
                          value={unit}
                          className="hover:bg-[#202230] focus:bg-[#202230] text-white transition-colors duration-150"
                        >
                          {currentLabels[unit]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversion Result */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardInViewVariants}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#AF00C3]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#AF00C3]">
                Conversion Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center min-h-[80px]">
                <AnimatePresence mode="wait">
                  {isConverting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center text-slate-400"
                    >
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Converting...
                    </motion.div>
                  ) : (
                    <motion.p
                      key={result} // Key changes to trigger animation on result change
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={resultVariants}
                      className="text-3xl font-bold text-white break-words text-center"
                    >
                      {result || "Enter values to see result"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#00A389] mb-3 text-lg">
                How to use:
              </h4>
              <ol className="text-slate-400 space-y-2 text-sm list-decimal list-inside">
                <li>
                  Select the category of units you want to convert (e.g.,
                  Length, Mass).
                </li>
                <li>
                  Enter the numeric value you wish to convert in the "Value"
                  field.
                </li>
                <li>
                  Choose the "From Unit" (your current unit) and the "To Unit"
                  (your desired unit).
                </li>
                <li>
                  The converted result will appear automatically in the
                  "Conversion Result" section.
                </li>
              </ol>
              <p className="text-[#AF00C3] text-sm mt-4">
                <strong>Note:</strong> This tool supports a wide range of common
                units across various categories.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}

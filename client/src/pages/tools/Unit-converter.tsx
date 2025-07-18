import { useState, useEffect, useCallback } from "react";
import { Ruler, RefreshCcw, ArrowRightLeft } from "lucide-react";
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
import ToolLayout from "@/components/ToolLayout";
import { motion } from "framer-motion";

const unitConversions: Record<string, any> = {
  length: {
    base: "meters",
    units: {
      meters: 1,
      kilometers: 1000,
      centimeters: 0.01,
      millimeters: 0.001,
      miles: 1609.34,
      yards: 0.9144,
      feet: 0.3048,
      inches: 0.0254,
    },
    labels: {
      meters: "Meters (m)",
      kilometers: "Kilometers (km)",
      centimeters: "Centimeters (cm)",
      millimeters: "Millimeters (mm)",
      miles: "Miles (mi)",
      yards: "Yards (yd)",
      feet: "Feet (ft)",
      inches: "Inches (in)",
    },
  },
  mass: {
    base: "kilograms",
    units: {
      kilograms: 1,
      grams: 0.001,
      milligrams: 1e-6,
      pounds: 0.453592,
      ounces: 0.0283495,
    },
    labels: {
      kilograms: "Kilograms (kg)",
      grams: "Grams (g)",
      milligrams: "Milligrams (mg)",
      pounds: "Pounds (lb)",
      ounces: "Ounces (oz)",
    },
  },
  temperature: {
    base: "celsius",
    units: {
      celsius: { toBase: (c: number) => c, fromBase: (c: number) => c },
      fahrenheit: {
        toBase: (f: number) => ((f - 32) * 5) / 9,
        fromBase: (c: number) => (c * 9) / 5 + 32,
      },
      kelvin: {
        toBase: (k: number) => k - 273.15,
        fromBase: (c: number) => c + 273.15,
      },
    },
    labels: {
      celsius: "Celsius (°C)",
      fahrenheit: "Fahrenheit (°F)",
      kelvin: "Kelvin (K)",
    },
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [valueA, setValueA] = useState("1");
  const [valueB, setValueB] = useState("");
  const [unitA, setUnitA] = useState("meters");
  const [unitB, setUnitB] = useState("feet");

  const currentCategory = unitConversions[category];
  const currentUnits = currentCategory.units;
  const currentLabels = currentCategory.labels;

  useEffect(() => {
    const unitKeys = Object.keys(currentUnits);
    setUnitA(unitKeys[0]);
    setUnitB(unitKeys[1] || unitKeys[0]);
  }, [category, currentUnits]);

  const performConversion = useCallback(() => {
    // FIX: Add a guard clause to ensure units are valid for the current category
    if (!currentUnits[unitA] || !currentUnits[unitB]) {
      // This prevents the calculation from running with mismatched units
      // while the state is updating after a category change.
      return;
    }

    const valA = parseFloat(valueA);
    if (isNaN(valA)) {
      setValueB("");
      return;
    }

    let result;
    if (category === "temperature") {
      const baseValue = currentUnits[unitA].toBase(valA);
      result = currentUnits[unitB].fromBase(baseValue);
    } else {
      const baseValue = valA * currentUnits[unitA];
      result = baseValue / currentUnits[unitB];
    }

    setValueB(Number(result.toPrecision(6)).toString());
  }, [valueA, unitA, unitB, category, currentUnits]);

  useEffect(() => {
    performConversion();
  }, [performConversion]);

  const handleSwap = () => {
    const tempValue = valueA;
    setValueA(valueB);
    setValueB(tempValue);
    const tempUnit = unitA;
    setUnitA(unitB);
    setUnitB(tempUnit);
  };

  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <ToolLayout
      title="Unit Converter"
      description="Instantly convert between length, mass, temperature, and more."
      icon={<Ruler className="text-white" />}
      iconBg="bg-gradient-to-br from-sky-500 to-slate-600"
    >
      <motion.div
        variants={cardInViewVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-sky-500/10">
          <CardHeader>
            <div className="w-full max-w-sm">
              <Label
                htmlFor="unit-category"
                className="font-medium text-slate-700"
              >
                Conversion Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="unit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(unitConversions).map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
              <div className="w-full space-y-2">
                <Label
                  htmlFor="from-value"
                  className="font-medium text-slate-700"
                >
                  From
                </Label>
                <Input
                  id="from-value"
                  type="number"
                  value={valueA}
                  onChange={(e) => setValueA(e.target.value)}
                  className="text-lg"
                />
                <Select value={unitA} onValueChange={setUnitA}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(currentUnits).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {currentLabels[unit]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleSwap}
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:bg-sky-100 hover:text-sky-600 rounded-full"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </Button>
              </div>

              <div className="w-full space-y-2">
                <Label
                  htmlFor="to-value"
                  className="font-medium text-slate-700"
                >
                  To
                </Label>
                <Input
                  id="to-value"
                  type="text"
                  value={valueB}
                  readOnly
                  className="text-lg bg-slate-50 font-semibold text-sky-700"
                />
                <Select value={unitB} onValueChange={setUnitB}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(currentUnits).map((unit) => (
                      <SelectItem key={unit} value={unit}>
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
    </ToolLayout>
  );
}

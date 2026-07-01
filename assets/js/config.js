export const DEFAULT_WATER_GOAL = 8;
export const MAX_ARCHIVE_DAYS = 7;

// hydrationScore: 0–100 kidney-friendly hydration efficiency
// caffeineMg: milligrams of caffeine per ~240 mL serving
// sodiumMg:   milligrams of sodium   per ~240 mL serving
// sugarG:     grams of sugar         per ~240 mL serving
export const DRINK_TYPES = [
  { id: "water",                label: "Water",                category: "hydration",  icon: "drop",       hydrationScore: 100, caffeineMg:  0, sodiumMg:   5, sugarG:  0 },
  { id: "tea",                  label: "Tea",                  category: "hot",        icon: "tea",        hydrationScore:  85, caffeineMg: 47, sodiumMg:   7, sugarG:  0 },
  { id: "coffee",               label: "Coffee",               category: "hot",        icon: "coffee",     hydrationScore:  80, caffeineMg: 95, sodiumMg:   5, sugarG:  0 },
  { id: "cocoa",                label: "Cocoa",                category: "hot",        icon: "cocoa",      hydrationScore:  72, caffeineMg: 12, sodiumMg: 140, sugarG: 24 },
  { id: "orange-juice",         label: "Orange Juice",         category: "juice",      icon: "orange",     hydrationScore:  90, caffeineMg:  0, sodiumMg:   2, sugarG: 26 },
  { id: "cola",                 label: "Cola",                 category: "soft-drink", icon: "can",        hydrationScore:  50, caffeineMg: 34, sodiumMg:  45, sugarG: 27 },
  { id: "diet-cola",            label: "Diet Cola",            category: "soft-drink", icon: "can-light",  hydrationScore:  55, caffeineMg: 46, sodiumMg:  57, sugarG:  0 },
  { id: "lemon-lime-soda",      label: "Lemon-Lime Soda",      category: "soft-drink", icon: "lime",       hydrationScore:  55, caffeineMg:  0, sodiumMg:  45, sugarG: 26 },
  { id: "ginger-ale",           label: "Ginger Ale",           category: "soft-drink", icon: "ginger",     hydrationScore:  60, caffeineMg:  0, sodiumMg:  26, sugarG: 22 },
  { id: "root-beer",            label: "Root Beer",            category: "soft-drink", icon: "root",       hydrationScore:  55, caffeineMg: 23, sodiumMg:  50, sugarG: 26 },
  { id: "tonic-water",          label: "Tonic Water",          category: "soft-drink", icon: "tonic",      hydrationScore:  62, caffeineMg:  0, sodiumMg:  44, sugarG: 22 },
  { id: "iced-tea-soda",        label: "Iced Tea Soda",        category: "soft-drink", icon: "iced",       hydrationScore:  60, caffeineMg: 18, sodiumMg:  35, sugarG: 24 },
  { id: "orange-soda",          label: "Orange Soda",          category: "soft-drink", icon: "orange-can", hydrationScore:  50, caffeineMg:  0, sodiumMg:  40, sugarG: 29 },
  { id: "grape-soda",           label: "Grape Soda",           category: "soft-drink", icon: "grape",      hydrationScore:  50, caffeineMg:  0, sodiumMg:  40, sugarG: 30 },
  { id: "sparkling-fruit-soda", label: "Sparkling Fruit Soda", category: "soft-drink", icon: "sparkle",    hydrationScore:  58, caffeineMg:  0, sodiumMg:  35, sugarG: 22 }
];

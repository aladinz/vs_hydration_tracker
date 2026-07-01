import { DRINK_TYPES, DEFAULT_WATER_GOAL } from "./config.js";
import { archiveCurrentDay, loadState, rotateDayIfNeeded, saveState } from "./storage.js";

const dom = {
  drinkGrid: document.getElementById("drinkGrid"),
  totalsList: document.getElementById("totalsList"),
  overallTotal: document.getElementById("overallTotal"),
  waterIntake: document.getElementById("waterIntake"),
  goalPercent: document.getElementById("goalPercent"),
  ringPercent: document.getElementById("ringPercent"),
  ringValue: document.getElementById("ringValue"),
  goalBar: document.getElementById("goalBar"),
  goalStatus: document.getElementById("goalStatus"),
  goalForm: document.getElementById("goalForm"),
  calculatorForm: document.getElementById("calculatorForm"),
  waterGoalInput: document.getElementById("waterGoalInput"),
  goalMessage: document.getElementById("goalMessage"),
  goalTabs: document.querySelectorAll(".goal-tab"),
  bodyWeight: document.getElementById("bodyWeight"),
  weightUnit: document.getElementById("weightUnit"),
  activityLevel: document.getElementById("activityLevel"),
  climate: document.getElementById("climate"),
  calculateBtn: document.getElementById("calculateBtn"),
  applyCalcBtn: document.getElementById("applyCalcBtn"),
  calculatorResult: document.getElementById("calculatorResult"),
  recommendedGlasses: document.getElementById("recommendedGlasses"),
  dailySummary: document.getElementById("dailySummary"),
  summaryContent: document.getElementById("summaryContent"),
  summaryToggleBtn: document.getElementById("summaryToggleBtn"),
  summaryDateLabel: document.getElementById("summaryDateLabel"),
  drinkBars: document.getElementById("drinkBars"),
  chartScaleMid: document.getElementById("chartScaleMid"),
  chartScaleMax: document.getElementById("chartScaleMax"),
  archiveTodayBtn: document.getElementById("archiveTodayBtn"),
  startNewDayBtn: document.getElementById("startNewDayBtn"),
  timeLogContainer: document.getElementById("timeLogContainer"),
  logCount: document.getElementById("logCount"),
  historyContainer: document.getElementById("historyContainer"),
  errorBanner: document.getElementById("errorBanner"),
  newDayDialog: document.getElementById("newDayDialog"),
  confirmNewDay: document.getElementById("confirmNewDay"),
  cancelNewDay: document.getElementById("cancelNewDay"),
  // Kidney Health Metrics
  healthIndexValue: document.getElementById("healthIndexValue"),
  healthIndexChip: document.getElementById("healthIndexChip"),
  healthIndexDesc: document.getElementById("healthIndexDesc"),
  caffeineValue: document.getElementById("caffeineValue"),
  caffeineFill: document.getElementById("caffeineFill"),
  caffeineStatus: document.getElementById("caffeineStatus"),
  caffeineWarning: document.getElementById("caffeineWarning"),
  caffeineWarningText: document.getElementById("caffeineWarningText"),
  sodiumValue: document.getElementById("sodiumValue"),
  sodiumFill: document.getElementById("sodiumFill"),
  sodiumStatus: document.getElementById("sodiumStatus"),
  kidneyTipText: document.getElementById("kidneyTipText"),
  tipDayChip: document.getElementById("tipDayChip"),
  // Drink Reminders
  reminderToggle: document.getElementById("reminderToggle"),
  reminderStatusChip: document.getElementById("reminderStatusChip"),
  reminderIntervalSelect: document.getElementById("reminderIntervalSelect"),
  reminderIntervalRow: document.getElementById("reminderIntervalRow"),
  reminderNext: document.getElementById("reminderNext"),
  reminderPermNote: document.getElementById("reminderPermNote"),
  // Hourly Heatmap
  hourlyHeatmap: document.getElementById("hourlyHeatmap"),
  // Streak & Consistency
  streakCount: document.getElementById("streakCount"),
  streakChip: document.getElementById("streakChip"),
  streakDesc: document.getElementById("streakDesc"),
  weekDots: document.getElementById("weekDots"),
  weekDotLabels: document.getElementById("weekDotLabels"),
  // Budget Breakdown (Feature 8)
  budgetBreakdown: document.getElementById("budgetBreakdown"),
  morningGoal: document.getElementById("morningGoal"),
  morningFill: document.getElementById("morningFill"),
  morningLogged: document.getElementById("morningLogged"),
  afternoonGoal: document.getElementById("afternoonGoal"),
  afternoonFill: document.getElementById("afternoonFill"),
  afternoonLogged: document.getElementById("afternoonLogged"),
  eveningGoal: document.getElementById("eveningGoal"),
  eveningFill: document.getElementById("eveningFill"),
  eveningLogged: document.getElementById("eveningLogged"),
  // Diuretic Offset (Feature 9)
  diureticInfo: document.getElementById("diureticInfo"),
  diureticText: document.getElementById("diureticText"),
  // Trend Insights (Feature 12)
  trendText: document.getElementById("trendText"),
  trendStats: document.getElementById("trendStats"),
  trendChip: document.getElementById("trendChip"),
  // Theme Toggle (Feature 14)
  themeToggle: document.getElementById("themeToggle"),
  themeIconMoon: document.getElementById("themeIconMoon"),
  themeIconSun: document.getElementById("themeIconSun"),
  // Undo Toast (Feature 15)
  undoToast: document.getElementById("undoToast"),
  undoMsg: document.getElementById("undoMsg"),
  undoBtn: document.getElementById("undoBtn"),
  undoProgress: document.getElementById("undoProgress")
};

let state = loadState();
const ringRadius = 48;
const ringCircumference = 2 * Math.PI * ringRadius;
let reminderIntervalId = null;
let undoTimeoutId = null;
let undoProgressId = null;
let lastLoggedDrinkSnapshot = null; // { drinkId, counts, log } for undo
let isSummaryExpanded = false;

// Kidney health thresholds
const CAFFEINE_CAUTION_MG = 200;
const CAFFEINE_HIGH_MG = 300;
const CAFFEINE_LIMIT_MG = 400;
const SODIUM_CAUTION_MG = 1500;
const SODIUM_LIMIT_MG = 2300;

const KIDNEY_TIPS = [
  "Drink water consistently through the day — don't wait until you feel thirsty, as thirst is a late signal of dehydration.",
  "Aim for pale yellow urine as a reliable daily guide to good hydration; dark urine signals you need more water.",
  "Staying well-hydrated helps flush uric acid and oxalates, significantly reducing your risk of kidney stones.",
  "Limit sodium intake to under 2,300 mg per day — excess sodium raises blood pressure and forces your kidneys to work harder.",
  "Caffeine is a mild diuretic. For each caffeinated drink, follow up with a glass of plain water to stay in balance.",
  "Drinking water before and between meals helps dissolve minerals and prevents crystal formation in the urinary tract.",
  "Chronic dehydration is a leading preventable cause of kidney disease progression — consistent daily hydration matters.",
  "If you have chronic kidney disease (CKD) or only one kidney, consult your doctor about your ideal fluid intake target.",
  "Hot weather, exercise, and fever all increase fluid losses — adjust your daily hydration goal accordingly.",
  "Herbal teas such as chamomile, ginger, or peppermint are caffeine-free and count toward your hydration goal.",
  "Avoid high-sugar soft drinks daily — excess dietary fructose raises uric acid levels and can contribute to kidney damage.",
  "Spreading fluid intake evenly throughout the day is healthier than drinking large amounts all at once.",
  "A morning glass of water after waking helps rehydrate your body and kickstarts kidney filtration for the day.",
  "Green tea in moderate amounts (1–2 cups/day) provides antioxidants that may support kidney health.",
  "Consistently high protein intake without adequate water can strain the kidneys' filtration capacity over time.",
  "Dark colas contain phosphoric acid, which can contribute to kidney stone formation — prefer lighter beverages.",
  "Diluting fruit juice 50/50 with water reduces the sugar load while preserving some of its nutritional benefit.",
  "Unsweetened sparkling water is just as hydrating as still water and can help you reach your daily fluid goal.",
  "Adequate hydration reduces your risk of urinary tract infections, a common cause of kidney damage if left untreated.",
  "Alcohol is a strong diuretic — plan to drink one extra glass of water for every alcoholic beverage consumed.",
  "People with a history of kidney stones should target at least 2.5 liters of total fluid per day.",
  "High-sugar beverages consumed repeatedly spike insulin and raise inflammation markers that stress the kidneys.",
  "Drinking water with a slice of lemon can increase citrate levels in urine, helping prevent calcium kidney stones.",
  "Even mild dehydration (1–2% fluid loss) can measurably reduce kidney filtration efficiency.",
  "Potassium-rich beverages like coconut water are healthy for most people but should be limited if you have CKD."
];

const PICTURE_ICONS = {
  water: "💧",
  tea: "🍵",
  coffee: "☕",
  cocoa: "🍫",
  "orange-juice": "🍊",
  cola: "🥤",
  "diet-cola": "🫗",
  "lemon-lime-soda": "🍋",
  "ginger-ale": "🫚",
  "root-beer": "🧋",
  "tonic-water": "🧊",
  "iced-tea-soda": "🧋",
  "orange-soda": "🍹",
  "grape-soda": "🍇",
  "sparkling-fruit-soda": "✨"
};

function getDrinkIcon(drink) {
  const picture = PICTURE_ICONS[drink.id] || "🥤";
  return `<span class="drink-icon-picture">${picture}</span>`;
}

function getTotalFromCounts(counts) {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function getSafeWaterGoal() {
  const value = Number(state.waterGoal);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_WATER_GOAL;
}

function formatDate(dateKey) {
  const safeDate = new Date(`${dateKey}T00:00:00`);
  return Number.isNaN(safeDate.getTime())
    ? dateKey
    : safeDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function showError(message) {
  dom.errorBanner.textContent = message;
  dom.errorBanner.hidden = false;
}

function clearError() {
  dom.errorBanner.hidden = true;
  dom.errorBanner.textContent = "";
}

function persistStateOrWarn() {
  const ok = saveState(state);
  if (!ok) {
    showError("Your browser blocked saving data locally. Changes may not persist after refresh.");
  } else {
    clearError();
  }
}

function calculateGoal() {
  const unit = dom.weightUnit?.value || "lb";
  const fallbackWeight = unit === "kg" ? 70 : 154;
  const weightInput = parseFloat(dom.bodyWeight.value) || fallbackWeight;
  const weightKg = unit === "lb" ? weightInput / 2.20462 : weightInput;
  const activity = dom.activityLevel.value;
  const climate = dom.climate.value;
  
  let baseAmount = weightKg * 35; // mL per kg
  
  const activityMultipliers = {
    sedentary: 1,
    light: 1.1,
    moderate: 1.2,
    active: 1.35,
    intense: 1.5
  };
  
  const climateMultipliers = {
    cool: 1,
    temperate: 1,
    hot: 1.15
  };
  
  baseAmount *= activityMultipliers[activity] || 1.1;
  baseAmount *= climateMultipliers[climate] || 1;
  
  const glassSize = 240; // mL per glass
  const recommendedGlasses = Math.round(baseAmount / glassSize);
  
  return Math.max(3, Math.min(20, recommendedGlasses));
}

// ── Kidney Health helpers ──────────────────────────────────
function getTodayCaffeineTotal() {
  return DRINK_TYPES.reduce((total, drink) => {
    return total + (state.todayCounts[drink.id] || 0) * (drink.caffeineMg || 0);
  }, 0);
}

function getTodaySodiumTotal() {
  return DRINK_TYPES.reduce((total, drink) => {
    return total + (state.todayCounts[drink.id] || 0) * (drink.sodiumMg || 0);
  }, 0);
}

// ── Diuretic & Budget Helpers ──────────────────────────────────
function getDiureticDrinks() {
  // List of drink IDs that are diuretics (caffeine-containing)
  const diureticIds = ['coffee', 'tea', 'cola', 'iced-tea-cola', 'iced-tea-soda', 'root-beer', 'cocoa'];
  return diureticIds.filter(id => (state.todayCounts[id] || 0) > 0);
}

function getDiureticCount() {
  return getDiureticDrinks().reduce((total, drinkId) => {
    return total + (state.todayCounts[drinkId] || 0);
  }, 0);
}

function getDiureticOffset() {
  // +0.5 glasses per diuretic drink logged
  return getDiureticCount() * 0.5;
}

function calculateBudgetBreakdown(goalGlasses) {
  // Distribute daily goal across 3 time periods
  // Morning (6am-12pm): 30% of goal
  // Afternoon (12pm-6pm): 40% of goal
  // Evening (6pm-10pm): 30% of goal
  const morning = Math.ceil(goalGlasses * 0.3);
  const afternoon = Math.ceil(goalGlasses * 0.4);
  const evening = Math.floor(goalGlasses - morning - afternoon); // remainder
  
  return { morning, afternoon, evening };
}

function countDrinksByPeriod(period) {
  // period: 'morning' | 'afternoon' | 'evening'
  let startHour, endHour;
  
  if (period === 'morning') {
    startHour = 6;
    endHour = 12;
  } else if (period === 'afternoon') {
    startHour = 12;
    endHour = 18;
  } else if (period === 'evening') {
    startHour = 18;
    endHour = 22;
  }
  
  return state.drinkLog.reduce((count, entry) => {
    const hour = new Date(entry.timestamp).getHours();
    return (hour >= startHour && hour < endHour) ? count + 1 : count;
  }, 0);
}

function getKidneyHealthIndex() {
  const totalCount = getTotalFromCounts(state.todayCounts);
  if (totalCount === 0) return null;
  const weightedScore = DRINK_TYPES.reduce((sum, drink) => {
    return sum + (state.todayCounts[drink.id] || 0) * (drink.hydrationScore || 50);
  }, 0);
  return Math.round(weightedScore / totalCount);
}

function getKhiStatus(khi) {
  if (khi === null) return { label: "—", cls: "muted", desc: "Log drinks to see your kidney-friendly hydration quality score." };
  if (khi >= 85) return { label: "Excellent", cls: "success", desc: "Outstanding hydration quality. Your drink choices today are highly kidney-friendly." };
  if (khi >= 70) return { label: "Good", cls: "khi-good", desc: "Good hydration quality. Keep prioritizing water and low-caffeine drinks." };
  if (khi >= 55) return { label: "Fair", cls: "khi-fair", desc: "Fair hydration quality. Try replacing some caffeinated or high-sugar drinks with plain water." };
  if (khi >= 40) return { label: "Low", cls: "khi-warn", desc: "Low hydration quality. Your beverage mix has high sugar or caffeine — add more water." };
  return { label: "Poor", cls: "khi-danger", desc: "Poor hydration quality. Excess caffeine and sugar can stress kidneys — drink more water now." };
}

function getCaffeinatedDrinkCount() {
  return DRINK_TYPES.reduce((total, drink) => {
    if ((drink.caffeineMg || 0) <= 0) return total;
    return total + (state.todayCounts[drink.id] || 0);
  }, 0);
}

function getCaffeineLevel(mg) {
  const waterCount = state.todayCounts.water || 0;
  const caffeinatedCount = getCaffeinatedDrinkCount();
  const hasStrongWaterBuffer = waterCount >= caffeinatedCount && caffeinatedCount > 0;

  if (mg < CAFFEINE_CAUTION_MG) return { cls: "level-ok", text: "Within safe range" };
  if (mg < CAFFEINE_HIGH_MG) return { cls: "level-caution", text: "Moderate — drink water between caffeinated beverages" };

  if (mg < CAFFEINE_LIMIT_MG) {
    if (hasStrongWaterBuffer) {
      return { cls: "level-caution", text: "Moderate — good water balance; keep spacing caffeinated drinks" };
    }
    return { cls: "level-high", text: "High caffeine — consider switching to herbal tea or water" };
  }

  return { cls: "level-danger", text: "Daily limit reached — excess caffeine stresses kidneys" };
}

function getSodiumLevel(mg) {
  if (mg < SODIUM_CAUTION_MG) return { cls: "level-ok",      text: "Within safe range" };
  if (mg < SODIUM_LIMIT_MG)   return { cls: "level-caution", text: "Approaching limit — drink plain water to dilute sodium" };
  return                              { cls: "level-danger",  text: "Daily sodium limit reached — high sodium strains kidney filtration" };
}

function renderHealthPanel() {
  const caffeineMg = getTodayCaffeineTotal();
  const sodiumMg   = getTodaySodiumTotal();
  const khi        = getKidneyHealthIndex();
  const khiStatus  = getKhiStatus(khi);

  // Kidney Health Index
  dom.healthIndexValue.textContent = khi !== null ? String(khi) : "—";
  dom.healthIndexChip.textContent  = khiStatus.label;
  dom.healthIndexChip.className    = `chip ${khiStatus.cls}`;
  dom.healthIndexDesc.textContent  = khiStatus.desc;

  // Caffeine meter
  const caffeinePercent = Math.min(100, Math.round((caffeineMg / CAFFEINE_LIMIT_MG) * 100));
  const caffeineLevel   = getCaffeineLevel(caffeineMg);
  dom.caffeineValue.textContent = String(caffeineMg);
  dom.caffeineFill.style.width  = `${caffeinePercent}%`;
  dom.caffeineFill.className    = `health-meter-fill ${caffeineLevel.cls}`;
  dom.caffeineFill.parentElement.setAttribute("aria-valuenow", String(caffeinePercent));
  dom.caffeineStatus.textContent = caffeineLevel.text;
  dom.caffeineStatus.className   = `health-meter-status status-${caffeineLevel.cls}`;

  // Sodium meter
  const sodiumPercent = Math.min(100, Math.round((sodiumMg / SODIUM_LIMIT_MG) * 100));
  const sodiumLevel   = getSodiumLevel(sodiumMg);
  dom.sodiumValue.textContent = String(sodiumMg);
  dom.sodiumFill.style.width  = `${sodiumPercent}%`;
  dom.sodiumFill.className    = `health-meter-fill ${sodiumLevel.cls}`;
  dom.sodiumFill.parentElement.setAttribute("aria-valuenow", String(sodiumPercent));
  dom.sodiumStatus.textContent = sodiumLevel.text;
  dom.sodiumStatus.className   = `health-meter-status status-${sodiumLevel.cls}`;

  // Caffeine warning banner
  const showWarning = caffeineMg >= CAFFEINE_CAUTION_MG;
  dom.caffeineWarning.hidden = !showWarning;
  if (showWarning) {
    const caffeineLevelClass = caffeineLevel.cls;
    const warningText =
      caffeineMg >= CAFFEINE_LIMIT_MG || caffeineLevelClass === "level-danger"
        ? "Daily caffeine limit reached! Excess caffeine causes kidney strain and dehydration. Switch to water now."
        : caffeineLevelClass === "level-high"
        ? "High caffeine detected. Switch to water or herbal tea to protect your kidneys."
        : "Moderate caffeine level. Balance each caffeinated drink with a glass of plain water.";
    dom.caffeineWarningText.textContent = warningText;
  }
}

function renderKidneyTip() {
  const dateKey  = state.currentDate;
  const dayNum   = parseInt(dateKey.replace(/-/g, ""), 10);
  const tipIndex = dayNum % KIDNEY_TIPS.length;
  dom.kidneyTipText.textContent = KIDNEY_TIPS[tipIndex];
  dom.tipDayChip.textContent    = `Tip ${tipIndex + 1} of ${KIDNEY_TIPS.length}`;
}

// ── Drink Reminders ────────────────────────────────────
async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") {
    dom.reminderPermNote.hidden = false;
    return false;
  }
  const result = await Notification.requestPermission();
  dom.reminderPermNote.hidden = result !== "granted";
  return result === "granted";
}

function fireReminderNotification(minutesSince) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const body = minutesSince > 0
    ? `You haven't logged a drink in ${minutesSince} min. Keep those kidneys happy!`
    : "Time to hydrate! Log your next drink to stay on track.";
  new Notification("Hydration Reminder", { body, tag: "hydration-reminder", renotify: true });
}

function checkAndFireReminder() {
  if (!state.reminderEnabled) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const intervalMs = (state.reminderInterval || 60) * 60_000;
  const lastMs = state.lastLoggedTimestamp ? new Date(state.lastLoggedTimestamp).getTime() : 0;
  const elapsed = Date.now() - lastMs;
  if (elapsed >= intervalMs) {
    const minutesSince = Math.floor(elapsed / 60_000);
    fireReminderNotification(minutesSince);
    // Advance baseline so we don’t spam every tick
    state.lastLoggedTimestamp = new Date(Date.now()).toISOString();
    saveState(state);
  }
}

function startReminderScheduler() {
  if (reminderIntervalId) clearInterval(reminderIntervalId);
  reminderIntervalId = setInterval(() => {
    checkAndFireReminder();
    renderReminderStatus();
  }, 60_000);
}

function renderReminderStatus() {
  const enabled = state.reminderEnabled;
  dom.reminderToggle.textContent = enabled ? "On" : "Off";
  dom.reminderToggle.setAttribute("aria-pressed", String(enabled));
  dom.reminderToggle.classList.toggle("toggle-on", enabled);
  dom.reminderStatusChip.textContent = enabled ? "Active" : "Off";
  dom.reminderStatusChip.className = `chip ${enabled ? "success" : "muted"}`;
  dom.reminderIntervalSelect.value = String(state.reminderInterval || 60);

  if (enabled && state.lastLoggedTimestamp) {
    const elapsed = Date.now() - new Date(state.lastLoggedTimestamp).getTime();
    const intervalMs = (state.reminderInterval || 60) * 60_000;
    const remainingMs = intervalMs - elapsed;
    dom.reminderNext.textContent = remainingMs > 0
      ? `Next reminder in ~${Math.ceil(remainingMs / 60_000)} min`
      : "Reminder due — tap a drink button to log!";
  } else if (enabled) {
    dom.reminderNext.textContent = "Active — log your first drink to start the timer";
  } else {
    dom.reminderNext.textContent = "";
  }

  dom.reminderPermNote.hidden =
    !("Notification" in window) ||
    Notification.permission !== "denied" ||
    !enabled;
}

// ── Hourly Distribution Heatmap ───────────────────────────
function renderHourlyHeatmap() {
  const hourCounts = new Array(24).fill(0);
  const log = state.drinkLog || [];
  log.forEach((entry) => {
    const h = new Date(entry.timestamp).getHours();
    hourCounts[h]++;
  });
  const maxCount = Math.max(1, ...hourCounts);
  const nowHour  = new Date().getHours();

  dom.hourlyHeatmap.innerHTML = "";
  for (let h = 0; h < 24; h++) {
    const count = hourCounts[h];
    const level = count === 0 ? 0 : Math.min(4, Math.ceil((count / maxCount) * 4));
    const cell  = document.createElement("div");
    cell.className = `heatmap-cell lvl-${level}${h === nowHour ? " now" : ""}`;
    const lbl = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
    cell.setAttribute("role", "img");
    cell.setAttribute("aria-label", `${lbl}: ${count} drink${count !== 1 ? "s" : ""}`);
    cell.title = `${lbl} — ${count} drink${count !== 1 ? "s" : ""}`;
    if (h % 6 === 0) {
      const tick = document.createElement("span");
      tick.className = "heatmap-hour-label";
      tick.textContent = h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
      cell.appendChild(tick);
    }
    dom.hourlyHeatmap.appendChild(cell);
  }
}

// ── Streak & Consistency ───────────────────────────────
function getDayGoalStatus(counts, goal) {
  const total = getTotalFromCounts(counts);
  if (total === 0) return "missed";
  const pct = total / Math.max(1, goal);
  if (pct >= 1)    return "met";
  if (pct >= 0.75) return "near";
  return "partial";
}

function formatShortDay(dateKey) {
  return new Date(`${dateKey}T00:00:00`)
    .toLocaleDateString(undefined, { weekday: "short" })
    .slice(0, 2);
}

function renderStreakCard() {
  const goal    = getSafeWaterGoal();
  const today   = state.currentDate;
  const todaySt = getDayGoalStatus(state.todayCounts, goal);

  // Consecutive streak (today + consecutive archived days backwards)
  let streak = todaySt === "met" ? 1 : 0;
  if (todaySt === "met") {
    const sorted = Object.keys(state.archive).sort((a, b) => b.localeCompare(a));
    for (const key of sorted) {
      const rec = state.archive[key];
      if (getDayGoalStatus(rec.counts || {}, rec.waterGoal || goal) === "met") {
        streak++;
      } else {
        break;
      }
    }
  }

  // Build 7-day calendar (oldest → today)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    let status;
    if (key === today) {
      status = todaySt;
    } else if (state.archive[key]) {
      const rec = state.archive[key];
      status = getDayGoalStatus(rec.counts || {}, rec.waterGoal || goal);
    } else {
      status = "no-data";
    }
    days.push({ key, status });
  }

  // DOM updates
  dom.streakCount.textContent = String(streak);
  dom.streakChip.textContent  = `${streak} day${streak !== 1 ? "s" : ""}`;
  dom.streakChip.className    = `chip ${streak >= 7 ? "success" : streak >= 3 ? "khi-good" : streak >= 1 ? "khi-fair" : "muted"}`;
  dom.streakDesc.textContent  =
    streak === 0 ? "Log drinks today to start your streak."
    : streak === 1 ? "Great start! Keep it going tomorrow."
    : streak < 7  ? `${streak} days in a row — you’re building a great habit!`
    : `${streak} day streak — outstanding consistency! Your kidneys thank you.`;

  const dotCls  = { met: "dot-met", near: "dot-near", partial: "dot-partial", missed: "dot-missed", "no-data": "dot-empty" };
  const dotHint = { met: "Goal met", near: "75%+ reached", partial: "Some logged", missed: "Not met", "no-data": "No data" };

  dom.weekDots.innerHTML = days
    .map((d) => `<div class="week-dot ${dotCls[d.status] || "dot-empty"}" title="${d.key === today ? "Today" : formatShortDay(d.key)}: ${dotHint[d.status]}"></div>`)
    .join("");

  dom.weekDotLabels.innerHTML = days
    .map((d) => `<span class="dot-label">${d.key === today ? "Tdy" : formatShortDay(d.key)}</span>`)
    .join("");
}

// ── Trend Insights (Feature 12) ───────────────────────────────
function getWeeklyAverage(dateKeys) {
  if (!dateKeys.length) return null;
  const totals = dateKeys.map((key) => {
    if (key === state.currentDate) return getTotalFromCounts(state.todayCounts);
    const rec = state.archive[key];
    return rec ? getTotalFromCounts(rec.counts || {}) : null;
  }).filter((v) => v !== null);
  if (!totals.length) return null;
  return totals.reduce((s, v) => s + v, 0) / totals.length;
}

function getDateKeysForRange(daysAgo, count) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function getBestDayLabel(dateKeys) {
  let best = null;
  let bestCount = -1;
  for (const key of dateKeys) {
    const count = key === state.currentDate
      ? getTotalFromCounts(state.todayCounts)
      : getTotalFromCounts((state.archive[key] || {}).counts || {});
    if (count > bestCount) { bestCount = count; best = key; }
  }
  if (!best || bestCount === 0) return null;
  return {
    label: new Date(`${best}T00:00:00`).toLocaleDateString(undefined, { weekday: "long" }),
    count: bestCount
  };
}

function renderTrendInsights() {
  const thisWeekKeys = getDateKeysForRange(0, 7);
  const lastWeekKeys = getDateKeysForRange(7, 7);

  // Only count days that actually have data
  const thisWeekDataKeys = thisWeekKeys.filter((k) =>
    k === state.currentDate
      ? getTotalFromCounts(state.todayCounts) > 0
      : state.archive[k] && getTotalFromCounts(state.archive[k].counts || {}) > 0
  );
  const lastWeekDataKeys = lastWeekKeys.filter((k) =>
    state.archive[k] && getTotalFromCounts(state.archive[k].counts || {}) > 0
  );

  const thisAvg = getWeeklyAverage(thisWeekDataKeys);
  const lastAvg = getWeeklyAverage(lastWeekDataKeys);
  const best = getBestDayLabel(thisWeekKeys);

  if (thisWeekDataKeys.length < 2) {
    dom.trendText.textContent = "Log at least 2 days this week to see your trend insights.";
    dom.trendStats.innerHTML = "";
    dom.trendChip.textContent = "Needs more data";
    return;
  }

  // Build insight sentence
  let sentence = `This week you averaged ${thisAvg.toFixed(1)} glasses/day`;
  if (lastAvg !== null && lastWeekDataKeys.length >= 2) {
    const diff = thisAvg - lastAvg;
    const sign = diff >= 0 ? "up" : "down";
    sentence += ` — ${sign} from ${lastAvg.toFixed(1)} last week`;
  }
  sentence += ".";
  if (best) {
    sentence += ` Your best day was ${best.label} (${best.count} drink${best.count !== 1 ? "s" : ""}).`;
  }
  dom.trendText.textContent = sentence;

  // Build stat pills
  const goal = getSafeWaterGoal();
  const daysMetGoal = thisWeekDataKeys.filter((k) => {
    const count = k === state.currentDate
      ? getTotalFromCounts(state.todayCounts)
      : getTotalFromCounts((state.archive[k] || {}).counts || {});
    return count >= goal;
  }).length;

  dom.trendChip.textContent = `${thisWeekDataKeys.length} days tracked`;
  dom.trendStats.innerHTML = `
    <div class="trend-stat">
      <span class="trend-stat-val">${thisAvg.toFixed(1)}</span>
      <span class="trend-stat-label">Avg / day</span>
    </div>
    ${lastAvg !== null && lastWeekDataKeys.length >= 2 ? `
    <div class="trend-stat">
      <span class="trend-stat-val ${thisAvg >= lastAvg ? "up" : "down"}">${thisAvg >= lastAvg ? "+" : ""}${(thisAvg - lastAvg).toFixed(1)}</span>
      <span class="trend-stat-label">vs last week</span>
    </div>` : ""}
    <div class="trend-stat">
      <span class="trend-stat-val">${daysMetGoal}</span>
      <span class="trend-stat-label">Goal days</span>
    </div>
    ${best ? `
    <div class="trend-stat">
      <span class="trend-stat-val">${best.count}</span>
      <span class="trend-stat-label">Best (${best.label.slice(0, 3)})</span>
    </div>` : ""}
  `;
}

// ── Theme Toggle (Feature 14) ──────────────────────────────────
const THEME_KEY = "hydration-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isLight = theme === "light";
  dom.themeIconMoon.style.display = isLight ? "none" : "";
  dom.themeIconSun.style.display = isLight ? "" : "none";
  dom.themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
}

// ── Undo Last Drink (Feature 15) ──────────────────────────────
function showUndoToast(drinkLabel) {
  clearTimeout(undoTimeoutId);
  clearInterval(undoProgressId);

  dom.undoMsg.textContent = `Logged ${drinkLabel}`;
  dom.undoProgress.style.transition = "none";
  dom.undoProgress.style.width = "100%";
  dom.undoToast.hidden = false;

  // Animate the progress bar draining over 5 s
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dom.undoProgress.style.transition = "width 5000ms linear";
      dom.undoProgress.style.width = "0%";
    });
  });

  undoTimeoutId = setTimeout(() => {
    hideUndoToast();
  }, 5000);
}

function hideUndoToast() {
  clearTimeout(undoTimeoutId);
  dom.undoToast.hidden = true;
  lastLoggedDrinkSnapshot = null;
}

function renderBudgetBreakdown() {
  const goal = getSafeWaterGoal();
  const budget = calculateBudgetBreakdown(goal);
  
  const morningCount = countDrinksByPeriod('morning');
  const afternoonCount = countDrinksByPeriod('afternoon');
  const eveningCount = countDrinksByPeriod('evening');
  
  // Update morning
  dom.morningGoal.textContent = `${budget.morning} gl`;
  dom.morningLogged.textContent = `${morningCount} / ${budget.morning}`;
  const morningPct = Math.min(100, Math.round((morningCount / budget.morning) * 100));
  dom.morningFill.style.width = `${morningPct}%`;
  
  // Update afternoon
  dom.afternoonGoal.textContent = `${budget.afternoon} gl`;
  dom.afternoonLogged.textContent = `${afternoonCount} / ${budget.afternoon}`;
  const afternoonPct = Math.min(100, Math.round((afternoonCount / budget.afternoon) * 100));
  dom.afternoonFill.style.width = `${afternoonPct}%`;
  
  // Update evening
  dom.eveningGoal.textContent = `${budget.evening} gl`;
  dom.eveningLogged.textContent = `${eveningCount} / ${budget.evening}`;
  const eveningPct = Math.min(100, Math.round((eveningCount / budget.evening) * 100));
  dom.eveningFill.style.width = `${eveningPct}%`;
}

function renderDiureticOffset() {
  const count = getDiureticCount();
  if (count === 0) {
    dom.diureticInfo.hidden = true;
    return;
  }
  
  const offset = getDiureticOffset();
  const waterCount = state.todayCounts.water || 0;
  const remaining = Math.max(0, offset - waterCount);

  const drinkSummary = getDiureticDrinks()
    .map((id) => {
      const label = DRINK_TYPES.find((d) => d.id === id)?.label || id;
      const servings = state.todayCounts[id] || 0;
      return `${servings} ${label}`;
    })
    .join(", ");

  if (remaining === 0) {
    dom.diureticText.textContent =
      `${drinkSummary} logged. Diuretic balance is covered by your water intake today (${waterCount} glass${waterCount === 1 ? "" : "es"}).`;
  } else {
    const glassLabel = remaining > 1 ? "glasses" : "glass";
    dom.diureticText.textContent =
      `${drinkSummary} logged. Add ~${remaining.toFixed(1)} ${glassLabel} of water to compensate.`;
  }
  dom.diureticInfo.hidden = false;
}

function renderDrinkButtons() {
  dom.drinkGrid.innerHTML = "";

  DRINK_TYPES.forEach((drink) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = drink.id === "water" ? "drink-btn water" : "drink-btn";
    button.dataset.drinkId = drink.id;
    button.innerHTML = `
      <span class="drink-btn-inner">
        <span class="drink-icon" aria-hidden="true">${getDrinkIcon(drink)}</span>
        <span class="drink-label">${drink.label}</span>
      </span>
    `;

    dom.drinkGrid.appendChild(button);
  });
}

function logDrink(drinkId) {
  const drink = DRINK_TYPES.find((item) => item.id === drinkId);
  if (!drink) {
    return;
  }

  if (!state.todayCounts || typeof state.todayCounts !== "object") {
    state.todayCounts = {};
  }

  // Ensure every drink key exists so legacy/localStorage shape changes cannot drop logs.
  DRINK_TYPES.forEach((item) => {
    if (!Number.isFinite(Number(state.todayCounts[item.id]))) {
      state.todayCounts[item.id] = 0;
    }
  });

  // Save snapshot for undo before mutating state
  lastLoggedDrinkSnapshot = {
    drinkId: drink.id,
    drinkLabel: drink.label,
    counts: { ...state.todayCounts },
    logLength: (state.drinkLog || []).length
  };

  state.todayCounts[drink.id] += 1;
  state.drinkLog = Array.isArray(state.drinkLog) ? state.drinkLog : [];
  state.drinkLog.push({
    drinkId: drink.id,
    drinkLabel: drink.label,
    timestamp: new Date().toISOString()
  });
  state.lastLoggedTimestamp = new Date().toISOString();

  persistStateOrWarn();
  renderAll();
  showUndoToast(drink.label);
}

function renderTotals() {
  dom.totalsList.innerHTML = "";

  DRINK_TYPES.forEach((drink) => {
    const row = document.createElement("article");
    row.className = drink.id === "water" ? "total-row water-row" : "total-row";

    const count = state.todayCounts[drink.id] || 0;

    row.innerHTML = `
      <p class="drink-name">
        <span class="drink-icon small" aria-hidden="true">${getDrinkIcon(drink)}</span>
        <span>${drink.label}</span>
      </p>
      <p class="drink-count">${count}</p>
    `;

    dom.totalsList.appendChild(row);
  });
}

function renderTimeLog() {
  dom.logCount.textContent = `${state.drinkLog?.length || 0} entries`;
  dom.timeLogContainer.innerHTML = "";

  const log = state.drinkLog || [];
  if (log.length === 0) {
    dom.timeLogContainer.innerHTML = "<p class=\"empty\">No drinks logged yet today.</p>";
    return;
  }

  const grouped = {};
  log.forEach((entry) => {
    const time = formatTime(entry.timestamp);
    if (!grouped[time]) {
      grouped[time] = [];
    }
    grouped[time].push(entry);
  });

  Object.keys(grouped)
    .reverse()
    .forEach((time) => {
      const entries = grouped[time];
      const entry = document.createElement("div");
      entry.className = "time-log-entry";

      const drinksList = entries
        .map((e) => `<span class="log-badge">${e.drinkLabel}</span>`)
        .join("");

      entry.innerHTML = `
        <div class="log-time">${time}</div>
        <div class="log-drinks">${drinksList}</div>
      `;

      dom.timeLogContainer.appendChild(entry);
    });
}

function renderWaterProgress() {
  const waterCount = state.todayCounts.water || 0;
  const overallCount = getTotalFromCounts(state.todayCounts);
  const goal = Math.max(1, getSafeWaterGoal());
  const diureticOffset = getDiureticOffset();
  const adjustedGoal = goal + diureticOffset;

  // Ring and progress bar track ALL drinks vs adjusted goal (including diuretic offset)
  const totalPercentRaw = Math.round((overallCount / adjustedGoal) * 100);
  const totalPercent = Math.max(0, Math.min(100, totalPercentRaw));
  const isGoalMet = overallCount >= adjustedGoal;

  // Water-specific percent for the Goal Progress metric tile
  const waterPercentRaw = Math.round((waterCount / goal) * 100);

  dom.waterIntake.textContent = String(waterCount);
  dom.overallTotal.textContent = String(overallCount);
  dom.goalPercent.textContent = String(waterPercentRaw < 0 ? 0 : waterPercentRaw);
  dom.ringPercent.textContent = String(totalPercentRaw < 0 ? 0 : totalPercentRaw);

  dom.goalBar.style.width = `${totalPercent}%`;
  dom.goalBar.parentElement.setAttribute("aria-valuenow", String(totalPercent));

  dom.ringValue.style.strokeDasharray = `${ringCircumference}`;
  dom.ringValue.style.strokeDashoffset = String(ringCircumference - (totalPercent / 100) * ringCircumference);

  dom.goalStatus.textContent = isGoalMet ? "Goal met" : "In progress";
  dom.goalStatus.classList.toggle("success", isGoalMet);

  const remaining = Math.max(0, adjustedGoal - overallCount);
  let message = isGoalMet
    ? "Great work. You reached your daily hydration goal!"
    : `${remaining.toFixed(1)} more drink${remaining > 1.1 ? "s" : ""} to reach your adjusted goal.`;
  
  if (diureticOffset > 0) {
    message += ` (+${diureticOffset.toFixed(1)} for diuretics)`;
  }
  
  dom.goalMessage.textContent = message;
  dom.waterGoalInput.value = String(goal);
}

function renderDrinkBars() {
  const rows = DRINK_TYPES.map((drink) => ({
    id: drink.id,
    label: drink.label,
    icon: getDrinkIcon(drink),
    value: state.todayCounts[drink.id] || 0
  })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  const maxValue = Math.max(1, ...rows.map((row) => row.value));
  dom.chartScaleMid.textContent = String(Math.ceil(maxValue / 2));
  dom.chartScaleMax.textContent = String(maxValue);

  dom.drinkBars.innerHTML = rows
    .map((row) => {
      const width = row.value === 0 ? 0 : Math.max(4, Math.round((row.value / maxValue) * 100));
      return `
        <article class="bar-row" aria-label="${row.label}: ${row.value} servings">
          <p class="bar-label">
            <span class="drink-icon small" aria-hidden="true">${row.icon}</span>
            <span>${row.label}</span>
          </p>
          <div class="bar-track">
            <div class="bar-fill" style="width:${width}%"></div>
            <span class="bar-value">${row.value}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSummaryForCounts(counts, goal, dateLabel) {
  const water = counts.water || 0;
  const total = getTotalFromCounts(counts);
  const met = water >= goal;

  const tips = [
    "Spread water intake through the day instead of drinking large amounts at once.",
    "Limit high-sugar soft drinks and balance caffeine with water.",
    "If your urine is consistently dark yellow, increase plain water intake.",
    "For kidney health, discuss ideal fluid targets with your clinician if you have kidney disease."
  ];

  const breakdown = DRINK_TYPES.map((drink) => `
      <li><span>${drink.label}</span><strong>${counts[drink.id] || 0}</strong></li>
    `).join("");

  return `
    <p class="summary-date">${dateLabel}</p>
    <p class="summary-stat">Total drinks: <strong>${total}</strong></p>
    <p class="summary-stat">Water goal: <strong>${goal}</strong> glasses</p>
    <p class="summary-stat">Goal status: <strong>${met ? "Met" : "Not met"}</strong></p>
    <h3>Drink Breakdown</h3>
    <ul class="summary-breakdown">${breakdown}</ul>
    <h3>Kidney-Friendly Hydration Tips</h3>
    <ul class="summary-tips">
      ${tips.map((tip) => `<li>${tip}</li>`).join("")}
    </ul>
  `;
}

function renderTodaySummary() {
  const dateLabel = `Today (${formatDate(state.currentDate)})`;
  dom.summaryDateLabel.textContent = dateLabel;

  dom.dailySummary.innerHTML = renderSummaryForCounts(
    state.todayCounts,
    getSafeWaterGoal(),
    dateLabel
  );
}

function setSummaryExpanded(expanded) {
  isSummaryExpanded = expanded;
  dom.summaryContent.hidden = !expanded;
  dom.summaryToggleBtn.setAttribute("aria-expanded", String(expanded));
  dom.summaryToggleBtn.classList.toggle("is-open", expanded);
}

function renderHistory() {
  const entries = Object.entries(state.archive).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  dom.historyContainer.innerHTML = "";

  if (entries.length === 0) {
    dom.historyContainer.innerHTML = "<p class=\"empty\">No archived days yet.</p>";
    return;
  }

  entries.forEach(([dateKey, record]) => {
    const card = document.createElement("article");
    card.className = "history-card";

    const water = record.counts?.water || 0;
    const total = getTotalFromCounts(record.counts || {});
    const met = water >= record.waterGoal;

    card.innerHTML = `
      <div class="history-head">
        <h3>${formatDate(dateKey)}</h3>
        <p class="chip ${met ? "success" : "muted"}">${met ? "Goal met" : "Goal not met"}</p>
      </div>
      <p>Total drinks: <strong>${total}</strong></p>
      <p>Water: <strong>${water}</strong> / ${record.waterGoal}</p>
    `;

    dom.historyContainer.appendChild(card);
  });
}

function renderAll() {
  state = rotateDayIfNeeded(state);
  renderTotals();
  renderWaterProgress();
  renderBudgetBreakdown();
  renderDiureticOffset();
  renderHealthPanel();
  renderKidneyTip();
  renderReminderStatus();
  renderTimeLog();
  renderHourlyHeatmap();
  renderStreakCard();
  renderTrendInsights();
  renderTodaySummary();
  renderDrinkBars();
  renderHistory();
}

function bindEvents() {
  dom.drinkGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-drink-id]");
    if (!button) {
      return;
    }

    logDrink(button.dataset.drinkId);
  });

  // Goal tab switching
  dom.goalTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      dom.goalTabs.forEach((t) => t.classList.toggle("active", t === tab));
      
      document.querySelectorAll(".goal-tab-content").forEach((content) => {
        content.style.display = content.dataset.tabContent === tabName ? "block" : "none";
      });
    });
  });

  // Manual goal form
  dom.goalForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const parsedGoal = Number(dom.waterGoalInput.value);

    if (!Number.isInteger(parsedGoal) || parsedGoal < 1 || parsedGoal > 30) {
      showError("Please enter a valid whole-number water goal between 1 and 30.");
      return;
    }

    state.waterGoal = parsedGoal;
    persistStateOrWarn();
    renderWaterProgress();
    renderTodaySummary();
  });

  // Calculator
  dom.calculateBtn.addEventListener("click", () => {
    const recommended = calculateGoal();
    dom.recommendedGlasses.textContent = String(recommended);
    dom.calculatorResult.style.display = "block";
    dom.applyCalcBtn.style.display = "inline-block";
  });

  dom.calculatorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const recommended = calculateGoal();
    state.waterGoal = recommended;
    persistStateOrWarn();
    renderWaterProgress();
    renderTodaySummary();
    dom.goalTabs[0].click();
    showError("");
  });

  if (dom.weightUnit && dom.bodyWeight) {
    const syncWeightInputToUnit = () => {
      if (dom.weightUnit.value === "kg") {
        dom.bodyWeight.min = "30";
        dom.bodyWeight.max = "200";
        dom.bodyWeight.placeholder = "70";
      } else {
        dom.bodyWeight.min = "66";
        dom.bodyWeight.max = "440";
        dom.bodyWeight.placeholder = "154";
      }
      dom.bodyWeight.value = "";
    };

    dom.weightUnit.addEventListener("change", syncWeightInputToUnit);
    syncWeightInputToUnit();
  }

  // Archive today
  dom.archiveTodayBtn.addEventListener("click", () => {
    state = archiveCurrentDay(state);
    renderAll();
  });

  // Start new day
  dom.startNewDayBtn.addEventListener("click", () => {
    dom.newDayDialog.showModal?.() || (dom.newDayDialog.style.display = "block");
  });

  dom.confirmNewDay.addEventListener("click", () => {
    state = archiveCurrentDay(state);
    renderAll();
    dom.newDayDialog.close?.() || (dom.newDayDialog.style.display = "none");
  });

  dom.cancelNewDay.addEventListener("click", () => {
    dom.newDayDialog.close?.() || (dom.newDayDialog.style.display = "none");
  });

  // Reminders
  dom.reminderToggle.addEventListener("click", async () => {
    if (!state.reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    state.reminderEnabled = !state.reminderEnabled;
    persistStateOrWarn();
    renderReminderStatus();
  });

  dom.reminderIntervalSelect.addEventListener("change", () => {
    state.reminderInterval = Number(dom.reminderIntervalSelect.value);
    persistStateOrWarn();
    renderReminderStatus();
  });

  // Theme toggle
  dom.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // End-of-day summary toggle
  dom.summaryToggleBtn.addEventListener("click", () => {
    setSummaryExpanded(!isSummaryExpanded);
  });

  // Undo last drink
  dom.undoBtn.addEventListener("click", () => {
    if (!lastLoggedDrinkSnapshot) return;
    state.todayCounts = lastLoggedDrinkSnapshot.counts;
    state.drinkLog = Array.isArray(state.drinkLog)
      ? state.drinkLog.slice(0, lastLoggedDrinkSnapshot.logLength)
      : [];
    lastLoggedDrinkSnapshot = null;
    persistStateOrWarn();
    hideUndoToast();
    renderAll();
  });
}

function init() {
  initTheme();
  dom.ringValue.style.transform = "rotate(-90deg)";
  dom.ringValue.style.transformOrigin = "50% 50%";
  dom.ringValue.style.strokeLinecap = "round";
  dom.ringValue.style.strokeDasharray = `${ringCircumference}`;
  dom.ringValue.style.strokeDashoffset = `${ringCircumference}`;
  renderDrinkButtons();
  bindEvents();
  setSummaryExpanded(false);
  renderAll();
  startReminderScheduler();
}

init();

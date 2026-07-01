import { DEFAULT_WATER_GOAL, DRINK_TYPES, MAX_ARCHIVE_DAYS } from "./config.js";

const STORAGE_KEY = "hydration-tracker-data-v1";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyCounts() {
  return DRINK_TYPES.reduce((acc, drink) => {
    acc[drink.id] = 0;
    return acc;
  }, {});
}

function buildDefaultState() {
  return {
    currentDate: getTodayKey(),
    waterGoal: DEFAULT_WATER_GOAL,
    todayCounts: createEmptyCounts(),
    drinkLog: [],
    reminderInterval: 60,
    reminderEnabled: false,
    lastLoggedTimestamp: null,
    archive: {}
  };
}

function isValidNumber(value) {
  return Number.isFinite(value) && value >= 0;
}

function normalizeCounts(rawCounts = {}) {
  const normalized = createEmptyCounts();

  DRINK_TYPES.forEach((drink) => {
    const maybeValue = Number(rawCounts[drink.id]);
    if (isValidNumber(maybeValue)) {
      normalized[drink.id] = maybeValue;
    }
  });

  return normalized;
}

function limitArchive(archive) {
  const keys = Object.keys(archive).sort((a, b) => (a < b ? 1 : -1));
  const trimmed = {};

  keys.slice(0, MAX_ARCHIVE_DAYS).forEach((key) => {
    trimmed[key] = archive[key];
  });

  return trimmed;
}

function safeParseState(rawValue) {
  if (!rawValue) {
    return buildDefaultState();
  }

  try {
    const parsed = JSON.parse(rawValue);
    const state = buildDefaultState();

    state.currentDate = typeof parsed.currentDate === "string" ? parsed.currentDate : state.currentDate;
    state.waterGoal = Number.isFinite(Number(parsed.waterGoal)) ? Math.max(1, Number(parsed.waterGoal)) : state.waterGoal;
    state.todayCounts = normalizeCounts(parsed.todayCounts);
    state.drinkLog = Array.isArray(parsed.drinkLog) ? parsed.drinkLog : [];

    const validIntervals = [30, 45, 60, 90, 120];
    state.reminderInterval = validIntervals.includes(Number(parsed.reminderInterval)) ? Number(parsed.reminderInterval) : 60;
    state.reminderEnabled = typeof parsed.reminderEnabled === "boolean" ? parsed.reminderEnabled : false;
    state.lastLoggedTimestamp = typeof parsed.lastLoggedTimestamp === "string" ? parsed.lastLoggedTimestamp : null;

    if (parsed.archive && typeof parsed.archive === "object") {
      Object.keys(parsed.archive).forEach((dateKey) => {
        state.archive[dateKey] = {
          counts: normalizeCounts(parsed.archive[dateKey]?.counts),
          waterGoal: Number.isFinite(Number(parsed.archive[dateKey]?.waterGoal))
            ? Math.max(1, Number(parsed.archive[dateKey].waterGoal))
            : state.waterGoal
        };
      });

      state.archive = limitArchive(state.archive);
    }

    return state;
  } catch (error) {
    console.error("Hydration data could not be parsed. Starting fresh.", error);
    return buildDefaultState();
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const state = safeParseState(raw);

    return rotateDayIfNeeded(state);
  } catch (error) {
    console.error("Could not load hydration data.", error);
    return buildDefaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Could not save hydration data.", error);
    return false;
  }
}

export function rotateDayIfNeeded(state) {
  const today = getTodayKey();

  if (state.currentDate === today) {
    return state;
  }

  if (state.currentDate && state.todayCounts) {
    state.archive[state.currentDate] = {
      counts: normalizeCounts(state.todayCounts),
      waterGoal: state.waterGoal
    };
  }

  state.currentDate = today;
  state.todayCounts = createEmptyCounts();
  state.drinkLog = [];
  state.lastLoggedTimestamp = null;
  state.archive = limitArchive(state.archive);

  saveState(state);
  return state;
}

export function archiveCurrentDay(state) {
  state.archive[state.currentDate] = {
    counts: normalizeCounts(state.todayCounts),
    waterGoal: state.waterGoal
  };

  state.todayCounts = createEmptyCounts();
  state.drinkLog = [];
  state.lastLoggedTimestamp = null;
  state.archive = limitArchive(state.archive);

  saveState(state);
  return state;
}

export function createInitialCounts() {
  return createEmptyCounts();
}

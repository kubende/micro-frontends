// Async boundary: required by Module Federation so shared deps initialise
// before the app's first sync code runs.
import("./bootstrap");

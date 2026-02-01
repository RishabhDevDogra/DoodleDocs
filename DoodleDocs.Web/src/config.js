// Frontend configuration constants
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5116';
export const HUB_URL = `${API_URL}/hubs/document`;

// Auto-save delays (milliseconds)
export const TITLE_SAVE_DELAY_MS = 1000;
export const CANVAS_SAVE_DELAY_MS = 500;

// SignalR configuration
export const SIGNALR_RECONNECT_DELAYS = [1000, 2000, 5000, 10000];
export const SIGNALR_STARTUP_DELAY_MS = 500;

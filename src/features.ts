// UI opt-in, not an authorization or security boundary. Production always disables AI.
export const AI_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_AI === 'true';

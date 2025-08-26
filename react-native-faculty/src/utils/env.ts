// Central API configuration. Use Expo public env (process.env.* in Metro) but avoid Node typings by indexing globalThis.
// Falls back to the local dev server used by the web frontend utils (see web src/utils/config.ts).
// In Expo, public env vars are injected at build time; we defensively access via (globalThis as any)?.process?.env.
const env = (globalThis as any)?.process?.env || {};
function normalizeBase(raw?: string) {
	let base = (raw && raw.trim()) || 'http://127.0.0.1:8000/api';
	// Remove trailing slash for normalization
	base = base.replace(/\/$/, '');
	// Append /api if not already present as a path segment
	if (!/\/api($|\/)/.test(base)) {
		base = base + '/api';
	}
	return base;
}
export const API_BASE_URL = normalizeBase(env.EXPO_PUBLIC_API_BASE_URL);
export const TOKEN_REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 min

const SAFE_URL_PATTERN = /^https?:\/\//i;

export function sanitizeUrl(url: string | undefined | null): string {
    if (!url) return '';
    const trimmed = url.trim();
    if (SAFE_URL_PATTERN.test(trimmed)) return trimmed;
    return '';
}

export function sanitizeImageUrl(url: string | undefined | null, fallback: string = ''): string {
    const sanitized = sanitizeUrl(url);
    if (sanitized) return sanitized;
    return fallback;
}

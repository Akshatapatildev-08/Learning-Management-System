export function extractYouTubeVideoId(input) {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '');
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const parts = url.pathname.split('/').filter(Boolean);
      const maybeId = parts[1];
      if ((parts[0] === 'embed' || parts[0] === 'shorts') && /^[a-zA-Z0-9_-]{11}$/.test(maybeId)) {
        return maybeId;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function toEmbedUrl(input) {
  const id = extractYouTubeVideoId(input);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

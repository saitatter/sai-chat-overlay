export function createEmoteCache(maxEntries = 256) {
  const cache = new Map();

  function touch(url, image) {
    if (cache.has(url)) cache.delete(url);
    cache.set(url, image);

    while (cache.size > maxEntries) {
      const firstKey = cache.keys().next().value;
      if (firstKey === undefined) break;
      cache.delete(firstKey);
    }
  }

  function prefetch(url) {
    if (typeof url !== "string" || !url) return;
    if (cache.has(url)) {
      const image = cache.get(url);
      touch(url, image);
      return;
    }

    const image = new Image();
    image.loading = "eager";
    image.decoding = "async";
    image.src = url;
    touch(url, image);
  }

  return {
    prefetch,
  };
}

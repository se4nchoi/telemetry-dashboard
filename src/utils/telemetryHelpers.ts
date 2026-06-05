export function getStats(buffer: number[]) {
  if (buffer.length === 0) return { min: 0, max: 0, avg: 0 };
  const validPoints = buffer.filter((v) => !isNaN(v));
  if (validPoints.length === 0) return { min: 0, max: 0, avg: 0 };

  const min = Math.min(...validPoints);
  const max = Math.max(...validPoints);
  const sum = validPoints.reduce((s, v) => s + v, 0);
  const avg = sum / validPoints.length;

  return { min, max, avg };
}

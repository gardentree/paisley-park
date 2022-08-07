const ANGLE = 180;

export class Heat {
  hierarchy: number;
  max: number;

  constructor(max: number) {
    this.hierarchy = Math.floor(Math.sqrt(max));
    this.max = Math.pow(this.hierarchy, 2);
  }

  score(value: number): number {
    return Math.floor((Math.sqrt(Math.min(this.max, value)) * 100) / this.hierarchy);
  }
  measure(value: number) {
    const point = this.score(value);
    const hue = ANGLE - (point * ANGLE) / 100;
    const saturation = 100;
    const brightness = point;
    const rgb = hsv2rgb(hue, saturation, brightness);

    return rgb.map((value) => Math.floor(value).toString(16).padStart(2, "0")).join("");
  }
}

function hsv2rgb(hue: number, saturation: number, brightness: number): [number, number, number] {
  const h = hue / 60;
  const s = saturation / 100;
  const b = brightness / 100;
  const hi = Math.floor(h) % 6;

  const f = h - Math.floor(h);
  const p = 255 * b * (1 - s);
  const q = 255 * b * (1 - s * f);
  const t = 255 * b * (1 - s * (1 - f));
  const max = 255 * b;

  switch (hi) {
    case 0:
      return [max, t, p];
    case 1:
      return [q, max, p];
    case 2:
      return [p, max, t];
    case 3:
      return [p, q, max];
    case 4:
      return [t, p, max];
    case 5:
      return [max, p, q];
    default:
      throw new Error(`hsv: ${hue},${saturation},${brightness}`);
  }
}

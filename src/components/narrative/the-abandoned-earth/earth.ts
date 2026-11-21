/**
 * The Abandoned Earth's globe: simplified continent outlines in real
 * longitude/latitude, and an orthographic projection (a sphere seen from
 * space) so they curve round the edge as it turns. Shared by the server
 * (first frame, no JS needed) and the browser (animation).
 */

export const CONTINENTS: [number, number][][] = [
  // north-america
  [[-165, 65], [-140, 70], [-95, 72], [-80, 62], [-60, 55], [-65, 45], [-75, 38], [-80, 30], [-82, 25], [-90, 29], [-97, 26], [-105, 20], [-97, 16], [-88, 15], [-83, 9], [-78, 8], [-85, 12], [-95, 15], [-110, 23], [-117, 32], [-124, 40], [-125, 48], [-135, 57], [-150, 60], [-165, 60]],
  // greenland
  [[-55, 82], [-25, 80], [-20, 70], [-42, 60], [-55, 68]],
  // south-america
  [[-80, 10], [-62, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -27], [-58, -38], [-65, -48], [-68, -55], [-74, -50], [-72, -35], [-71, -20], [-76, -12], [-81, -4]],
  // europe
  [[-10, 36], [-9, 43], [-2, 48], [-5, 54], [3, 51], [8, 55], [5, 60], [12, 65], [20, 70], [30, 70], [40, 66], [40, 55], [30, 46], [28, 41], [22, 37], [15, 40], [12, 44], [8, 44], [3, 42]],
  // uk
  [[-5, 50], [1, 51], [-2, 57], [-6, 58]],
  // africa
  [[-17, 21], [-16, 14], [-12, 7], [-5, 5], [5, 5], [9, 4], [9, -2], [13, -12], [12, -18], [17, -29], [20, -35], [26, -34], [33, -26], [36, -18], [40, -11], [41, -2], [51, 11], [43, 12], [37, 20], [33, 30], [25, 32], [11, 37], [-6, 36], [-10, 30]],
  // madagascar
  [[44, -13], [50, -15], [47, -25], [44, -22]],
  // arabia
  [[36, 30], [35, 28], [43, 13], [52, 16], [59, 22], [56, 26], [48, 30]],
  // asia
  [[40, 66], [60, 70], [80, 73], [100, 77], [115, 73], [140, 72], [170, 68], [178, 65], [165, 60], [155, 58], [142, 53], [140, 45], [135, 35], [122, 30], [120, 22], [108, 20], [106, 10], [100, 13], [98, 7], [103, 1], [97, 17], [92, 22], [88, 21], [80, 15], [77, 8], [73, 20], [66, 25], [57, 25], [52, 30], [48, 30], [36, 35], [28, 41], [30, 46], [40, 55]],
  // japan
  [[130, 31], [141, 36], [142, 44], [140, 41], [133, 34]],
  // indonesia
  [[95, 5], [105, -6], [115, -8], [120, -5], [110, 2]],
  // australia
  [[114, -22], [114, -34], [125, -33], [135, -35], [140, -38], [148, -38], [153, -28], [153, -25], [146, -19], [142, -11], [136, -12], [131, -12], [122, -17]],
  // antarctica
  [[-180, -81], [-120, -80], [-60, -78], [0, -79], [60, -77], [120, -78], [180, -81], [180, -89], [-180, -89]],
];

const R = 96; // disc radius in the 200x200 viewBox
const TILT = (18 * Math.PI) / 180; // seen slightly from above, like a desk globe
const STEP = 3; // densify outlines every ~3 degrees so edges curve smoothly

/** Fill in points along each edge so the outline curves on the sphere. */
function densify(poly: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < poly.length; i++) {
    const [a1, b1] = poly[i];
    const [a2, b2] = poly[(i + 1) % poly.length];
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(a2 - a1), Math.abs(b2 - b1)) / STEP));
    for (let k = 0; k < n; k++) out.push([a1 + ((a2 - a1) * k) / n, b1 + ((b2 - b1) * k) / n]);
  }
  return out;
}
const DENSE = CONTINENTS.map(densify);

/**
 * SVG path data for every continent, with the globe turned so that
 * longitude `centerDeg` faces the viewer. Land on the far side is hidden;
 * outlines crossing the edge are pinned to it, so they wrap round the rim.
 */
export function projectEarth(centerDeg: number): string[] {
  const l0 = (centerDeg * Math.PI) / 180;
  const sT = Math.sin(TILT), cT = Math.cos(TILT);
  return DENSE.map(poly => {
    let anyFront = false;
    const pts = poly.map(([lonD, latD]) => {
      const lon = (lonD * Math.PI) / 180, lat = (latD * Math.PI) / 180;
      const cl = Math.cos(lat), d = lon - l0;
      const front = sT * Math.sin(lat) + cT * cl * Math.cos(d);
      let x = cl * Math.sin(d);
      let y = cT * Math.sin(lat) - sT * cl * Math.cos(d);
      if (front < 0) {
        // Behind: pin just outside the rim. The disc's clip path then hides
        // it, so far-side land can't show as an amber sliver along the edge,
        // while land crossing the edge still wraps round it.
        const h = (Math.hypot(x, y) || 1) / 1.08;
        x /= h;
        y /= h;
      } else anyFront = true;
      return [100 + R * x, 100 - R * y];
    });
    if (!anyFront) return "";
    return "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
  });
}

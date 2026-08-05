"use client";
import { useMemo } from "react";
import { Center, Channel } from "@/types/chart";

interface BodygraphProps {
  centers: Center[];
  channels: Channel[];
  gates: { conscious: string[]; unconscious: string[] };
  variableCode?: string;
}

// Gate positions [x, y] in SVG coordinate space
const GP: Record<number, [number, number]> = {
  64:[244,110], 61:[265,110], 63:[286,110],
  47:[244,156], 24:[265,156],  4:[286,156],
  17:[243,184], 43:[265,218], 11:[287,184],
  62:[235,274], 23:[265,274], 56:[287,274],
  16:[234,286], 20:[234,314],
  31:[235,338],  8:[265,340], 33:[288,338],
  35:[305,286], 12:[305,314], 45:[305,333],
   1:[265,386],
   7:[244,407], 13:[286,410],
  10:[224,430], 25:[306,430],
  15:[242,454], 46:[288,454],
   2:[265,475],
  51:[343,464], 21:[354,447],
  40:[383,491], 26:[325,486],
  48:[ 48,526], 57:[ 76,542], 44:[ 88,562],
  50:[107,578], 32:[ 90,590], 28:[ 73,594], 18:[ 42,606],
  36:[481,535], 22:[454,555], 37:[431,563],
   6:[417,578], 49:[433,589], 55:[456,597], 30:[485,607],
   5:[243,554], 14:[265,561], 29:[287,555],
  34:[234,575], 27:[234,603], 59:[304,604],
  42:[237,627],  3:[265,628],  9:[287,628],
  53:[244,682], 60:[265,683], 52:[287,682],
  54:[237,695], 38:[237,714], 58:[237,738],
  19:[296,695], 39:[296,714], 41:[296,739],
};

// All 36 canonical channels [lo, hi] (lo < hi)
const ALL_CHS: [number, number][] = [
  [47,64],[24,61],[4,63],
  [17,62],[23,43],[11,56],
  [16,48],[20,57],[7,31],[1,8],[13,33],[35,36],[12,22],[21,45],
  [25,51],
  [10,20],[10,34],[10,57],[5,15],[2,14],[29,46],
  [26,44],[37,40],
  [20,34],[34,57],[6,59],[9,52],[3,60],[42,53],[27,50],
  [32,54],[28,38],[18,58],
  [19,49],[39,55],[30,41],
];

// Center → gates
const CG: Record<string, number[]> = {
  head:   [64,61,63],
  ajna:   [47,24,4,17,43,11],
  throat: [62,23,56,16,20,31,8,33,35,12,45],
  g:      [1,7,13,10,25,15,46,2],
  heart:  [21,51,26,40],
  sacral: [34,5,14,29,59,9,3,42,27],
  spleen: [48,57,44,50,32,28,18],
  solar:  [36,22,37,6,49,55,30],
  root:   [53,60,52,54,38,58,19,39,41],
};

// Perpendicular unit vector scaled by d
function perp(ax: number, ay: number, bx: number, by: number, d = 2.5): [number, number] {
  const len = Math.hypot(bx - ax, by - ay) || 1;
  return [-(by - ay) / len * d, (bx - ax) / len * d];
}

export default function Bodygraph({ centers, channels, gates, variableCode }: BodygraphProps) {
  const pGates = useMemo(
    () => new Set(gates.conscious.map(g => parseInt(g))),
    [gates.conscious],
  );
  const dGates = useMemo(
    () => new Set(gates.unconscious.map(g => parseInt(g))),
    [gates.unconscious],
  );
  const colGates = useMemo(
    () => new Set([...pGates].filter(g => dGates.has(g))),
    [pGates, dGates],
  );
  const activeChs = useMemo(
    () => new Set(channels.map(c => c.code)),
    [channels],
  );
  const cDef = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of centers) m[c.code] = c.definitionType;
    return m;
  }, [centers]);

  function cFill(code: string) {
    const t = cDef[code] ?? "open";
    if (t === "defined") return "fill-col_personality";
    if (t === "unconscious") return "fill-col_design";
    return "fill-secondary";
  }

  function segCls(gate: number) {
    if (colGates.has(gate)) return "stroke-col_cta";
    if (pGates.has(gate)) return "stroke-col_personality";
    if (dGates.has(gate)) return "stroke-col_design";
    return "stroke-secondary";
  }

  function renderCh(ga: number, gb: number) {
    const pa = GP[ga], pb = GP[gb];
    if (!pa || !pb) return null;
    const [ax, ay] = pa, [bx, by] = pb;
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const ux = (bx - ax) / len, uy = (by - ay) / len;
    const ext = 15, ax2 = ax - ux*ext, ay2 = ay - uy*ext, bx2 = bx + ux*ext, by2 = by + uy*ext;
    const [nx, ny] = perp(ax, ay, bx, by);
    const lo = Math.min(ga, gb), hi = Math.max(ga, gb);
    const key = `${lo}-${hi}`;
    const isActive = activeChs.has(key);
    const cA = isActive ? segCls(ga) : "stroke-secondary";
    const cB = isActive ? segCls(gb) : "stroke-secondary";

    return (
      <g key={key} id={key} className={isActive ? "cursor-pointer" : undefined}>
        {/* personality stripe */}
        <line id={`personality-${ga}`}
          x1={ax2+nx} y1={ay2+ny} x2={mx+nx} y2={my+ny}
          className={cA} strokeWidth="5" strokeLinecap="butt" />
        <line id={`personality-${gb}`}
          x1={mx+nx} y1={my+ny} x2={bx2+nx} y2={by2+ny}
          className={cB} strokeWidth="5" strokeLinecap="butt" />
        {/* design stripe */}
        <line id={`design-${ga}`}
          x1={ax2-nx} y1={ay2-ny} x2={mx-nx} y2={my-ny}
          className={cA} strokeWidth="5" strokeLinecap="butt" />
        <line id={`design-${gb}`}
          x1={mx-nx} y1={my-ny} x2={bx2-nx} y2={by2-ny}
          className={cB} strokeWidth="5" strokeLinecap="butt" />
      </g>
    );
  }

  function renderGate(gate: number) {
    const pos = GP[gate];
    if (!pos) return null;
    const [x, y] = pos;
    const isP = pGates.has(gate);
    const isD = dGates.has(gate);
    const isCol = isP && isD;

    if (!isP && !isD) {
      return <circle key={gate} id={`gate-${gate}`} cx={x} cy={y} r="7" fill="none" stroke="none" />;
    }

    return (
      <g key={gate} id={`gate-${gate}`}>
        <circle
          cx={x} cy={y} r="7"
          className={isCol ? "fill-none stroke-col_cta" : isP ? "fill-col_personality" : "fill-col_design"}
          strokeWidth={isCol ? 1.5 : 0}
        />
        <text
          x={x} y={y + 3.5}
          textAnchor="middle"
          fontSize="7"
          fontWeight="600"
          className={isCol ? "fill-col_cta" : isP ? "fill-white" : "fill-col_personality"}
        >
          {gate}
        </text>
      </g>
    );
  }

  function renderVarTriangle(x: number, y: number, dir: string, colorCls: string) {
    // "R" → apex right, "L" → apex left
    const pts = dir === "R" ? "50,40 0,0 0,80" : "0,40 50,0 50,80";
    return <polygon key={`${x}-${y}`} points={pts} transform={`translate(${x},${y})`} className={colorCls} />;
  }

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <svg viewBox="0 0 520 758.4" className="w-full h-auto">

        {/* ── Layer 1: Channel dual-stripes ── */}
        <g id="channels" fill="none">
          {ALL_CHS.map(([a, b]) => renderCh(a, b))}
        </g>

        {/* ── Layer 2: Centers + gate circles ── */}
        <g id="centers" strokeLinejoin="round">

          <g id="head-center" stroke="#c8c8c8" strokeWidth="1.5">
            <polygon id="head-shape"
              points="265,34 216,151 314,151"
              className={cFill("head")} />
            {CG.head.map(renderGate)}
          </g>

          <g id="ajna-center" stroke="#c8c8c8" strokeWidth="1.5">
            <polygon id="ajna-shape"
              points="221,158 309,158 265,250"
              className={cFill("ajna")} />
            {CG.ajna.map(renderGate)}
          </g>

          <g id="throat-center" stroke="#c8c8c8" strokeWidth="1.5">
            <rect id="throat-shape"
              x="225" y="270" width="80" height="75"
              className={cFill("throat")} />
            {CG.throat.map(renderGate)}
          </g>

          <g id="g-center" stroke="#c8c8c8" strokeWidth="1.5">
            <polygon id="g-shape"
              points="265,386 326,430 265,485 205,430"
              className={cFill("g")} />
            {CG.g.map(renderGate)}
          </g>

          <g id="heart-center" stroke="#c8c8c8" strokeWidth="1.5">
            <polygon id="heart-shape"
              points="322,463 352,438 385,490 337,492"
              className={cFill("heart")} />
            {CG.heart.map(renderGate)}
          </g>

          <g id="spleen-center" stroke="#c8c8c8" strokeWidth="1.5">
            <polygon id="spleen-shape"
              points="42,520 132,562 42,607"
              className={cFill("spleen")} />
            {CG.spleen.map(renderGate)}
          </g>

          <g id="solar-center" stroke="#c8c8c8" strokeWidth="1.5">
            <polygon id="solar-shape"
              points="489,515 402,563 489,615"
              className={cFill("solar")} />
            {CG.solar.map(renderGate)}
          </g>

          <g id="sacral-center" stroke="#c8c8c8" strokeWidth="1.5">
            <rect id="sacral-shape"
              x="224" y="548" width="82" height="80"
              className={cFill("sacral")} />
            {CG.sacral.map(renderGate)}
          </g>

          <g id="root-center" stroke="#c8c8c8" strokeWidth="1.5">
            <rect id="root-shape"
              x="225" y="667" width="80" height="84"
              className={cFill("root")} />
            {CG.root.map(renderGate)}
          </g>

        </g>

        {/* ── Layer 3: Variable triangles (optional) ── */}
        {variableCode && variableCode.length >= 4 && (
          <g id="variable" stroke="none">
            {/* Awareness: Personality Sun – right side */}
            {renderVarTriangle(370, 52, variableCode[0], "fill-col_personality")}
            {/* Perspective: Personality NN – right side */}
            {renderVarTriangle(370, 148, variableCode[1], "fill-col_personality")}
            {/* Digestion: Design Sun – left side */}
            {renderVarTriangle(98, 52, variableCode[2], "fill-col_design")}
            {/* Environment: Design NN – left side */}
            {renderVarTriangle(98, 148, variableCode[3], "fill-col_design")}
          </g>
        )}

      </svg>
    </div>
  );
}

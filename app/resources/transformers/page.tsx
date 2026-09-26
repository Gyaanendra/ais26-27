"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import MathTex from "@/components/MathTex";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Static Constants (lifted outside component to prevent re-allocation)
// ─────────────────────────────────────────────────────────────────────────────
interface VecToken {
  text: string;
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
  cluster: "ml" | "royalty" | "sequence";
}

const PRESET_VEC_TOKENS: readonly VecToken[] = [
  // ML Architecture Cluster (Top-Right: x > 0, y > 0)
  {
    text: "attention",
    id: 3721,
    x: 55,
    y: 60,
    baseX: 70,
    baseY: 65,
    baseZ: 40,
    color: "#DE5D35",
    cluster: "ml",
  },
  {
    text: "all",
    id: 477,
    x: -20,
    y: -55,
    baseX: -40,
    baseY: 30,
    baseZ: -20,
    color: "#75716B",
    cluster: "sequence",
  },
  {
    text: "you",
    id: 345,
    x: 20,
    y: -65,
    baseX: 35,
    baseY: -50,
    baseZ: 30,
    color: "#75716B",
    cluster: "sequence",
  },
  {
    text: "need",
    id: 761,
    x: -35,
    y: -75,
    baseX: -65,
    baseY: -35,
    baseZ: 50,
    color: "#75716B",
    cluster: "sequence",
  },
  {
    text: "transformer",
    id: 10928,
    x: 75,
    y: 75,
    baseX: 85,
    baseY: 80,
    baseZ: 45,
    color: "#DE5D35",
    cluster: "ml",
  },
  {
    text: "king",
    id: 2891,
    x: -65,
    y: 45,
    baseX: -80,
    baseY: 40,
    baseZ: 60,
    color: "#1A1816",
    cluster: "royalty",
  },
  {
    text: "queen",
    id: 3122,
    x: -55,
    y: 65,
    baseX: -75,
    baseY: 42,
    baseZ: -55,
    color: "#1A1816",
    cluster: "royalty",
  },
  {
    text: "man",
    id: 187,
    x: -70,
    y: -35,
    baseX: -85,
    baseY: -20,
    baseZ: 58,
    color: "#1A1816",
    cluster: "royalty",
  },
  {
    text: "woman",
    id: 241,
    x: -60,
    y: -15,
    baseX: -80,
    baseY: -18,
    baseZ: -57,
    color: "#1A1816",
    cluster: "royalty",
  },
  {
    text: "neural",
    id: 4210,
    x: 40,
    y: 35,
    baseX: 55,
    baseY: 50,
    baseZ: -45,
    color: "#DE5D35",
    cluster: "ml",
  },
  {
    text: "sequence",
    id: 3110,
    x: 45,
    y: -45,
    baseX: 45,
    baseY: -30,
    baseZ: -60,
    color: "#75716B",
    cluster: "sequence",
  },
  {
    text: "model",
    id: 894,
    x: 65,
    y: 30,
    baseX: 60,
    baseY: 35,
    baseZ: 30,
    color: "#DE5D35",
    cluster: "ml",
  },
];

const SENTENCE_TOKENS = [
  { id: "sent-lead-the-0", text: "The", idx: 0 },
  { id: "sent-animal-1", text: "animal", idx: 1 },
  { id: "sent-didnt-2", text: "didn't", idx: 2 },
  { id: "sent-cross-3", text: "cross", idx: 3 },
  { id: "sent-mid-the-4", text: "the", idx: 4 },
  { id: "sent-street-5", text: "street", idx: 5 },
  { id: "sent-because-6", text: "because", idx: 6 },
  { id: "sent-it-7", text: "it", idx: 7 },
  { id: "sent-was-8", text: "was", idx: 8 },
  { id: "sent-too-9", text: "too", idx: 9 },
  { id: "sent-tired-10", text: "tired", idx: 10 },
] as const;

const RAW_LOGITS = [
  { word: "transduction", logit: 6.8 },
  { word: "modeling", logit: 5.4 },
  { word: "generation", logit: 4.9 },
  { word: "translation", logit: 4.2 },
  { word: "synthesis", logit: 3.1 },
  { word: "learning", logit: 2.4 },
  { word: "prediction", logit: 1.8 },
  { word: "recognition", logit: 0.9 },
] as const;

const AR_SEQUENCE = [
  {
    stepId: "ar-step-bos-0",
    stepIdx: 0,
    token: "<BOS>",
    logits: [
      { word: "The", p: "88%" },
      { word: "Attention", p: "8%" },
      { word: "A", p: "4%" },
    ],
  },
  {
    stepId: "ar-step-attention-1",
    stepIdx: 1,
    token: "Attention",
    logits: [
      { word: "is", p: "94%" },
      { word: "mechanism", p: "4%" },
      { word: "model", p: "2%" },
    ],
  },
  {
    stepId: "ar-step-is-2",
    stepIdx: 2,
    token: "is",
    logits: [
      { word: "all", p: "97%" },
      { word: "a", p: "2%" },
      { word: "the", p: "1%" },
    ],
  },
  {
    stepId: "ar-step-all-3",
    stepIdx: 3,
    token: "all",
    logits: [
      { word: "you", p: "99%" },
      { word: "we", p: "0.8%" },
      { word: "that", p: "0.2%" },
    ],
  },
  {
    stepId: "ar-step-you-4",
    stepIdx: 4,
    token: "you",
    logits: [
      { word: "need", p: "98%" },
      { word: "want", p: "1.5%" },
      { word: "have", p: "0.5%" },
    ],
  },
  {
    stepId: "ar-step-need-5",
    stepIdx: 5,
    token: "need",
    logits: [
      { word: "<EOS>", p: "92%" },
      { word: "for", p: "6%" },
      { word: ".", p: "2%" },
    ],
  },
] as const;

const CAUSAL_MASK_CELLS = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 5 }, (_, col) => ({
    row,
    col,
    isAllowed: col <= row,
    id: `cell-r${row}-c${col}`,
  })),
).flat();

const LAYERS = [1, 2, 3, 4, 5, 6] as const;

// ── Table of Contents Module Index ──
interface TocSection {
  id: string;
  num: string;
  title: string;
  desc: string;
  tag: string;
}

const TABLE_OF_CONTENTS: readonly TocSection[] = [
  {
    id: "sec-01",
    num: "01",
    title: "BPE Tokenizer & Subwords",
    desc: "Interactive vocabulary merging, morphemes & byte pairs",
    tag: "Byte-Pair Encoding",
  },
  {
    id: "sec-02",
    num: "02",
    title: "2D Semantic Plane",
    desc: "Token vector clusters, 2D coordinates & angular geometry",
    tag: "Vector Space",
  },
  {
    id: "sec-03",
    num: "03",
    title: "Positional Encoding",
    desc: "Harmonic sine & cosine spectrum across sequence positions",
    tag: "Harmonic Waves",
  },
  {
    id: "sec-04",
    num: "04",
    title: "Attention Mechanics",
    desc: "Scaled dot-product, multi-head projections & coreference",
    tag: "Scaled Dot-Product",
  },
  {
    id: "sec-05",
    num: "05",
    title: "Two-Layer FFN",
    desc: "Expansion projection, ReLU/GELU activations & shrinkage",
    tag: "Feed-Forward",
  },
  {
    id: "sec-06",
    num: "06",
    title: "Residual Connections",
    desc: "Identity skip highways, gradient preservation & LayerNorm",
    tag: "Add & Norm",
  },
  {
    id: "sec-07",
    num: "07",
    title: "Vaswani Paper Architecture",
    desc: "Dual 6-layer Encoder & Decoder stacks from original 2017 paper",
    tag: "Dual Towers (N=6)",
  },
  {
    id: "sec-08",
    num: "08",
    title: "Attention Matrix & KV Cache",
    desc: "QK^T matrix, causal KQ masking lockout & step-by-step KV cache",
    tag: "KV Cache & Masking",
  },
  {
    id: "sec-09",
    num: "09",
    title: "Projection & Softmax Sampling",
    desc: "Vocabulary un-embedding, temperature scaling & Top-K sampling",
    tag: "Softmax Studio",
  },
];

// ── Vaswani et al. (2017) Paper Architecture Layer Definitions ──
interface PaperLayerInfo {
  id: string;
  name: string;
  tower: "encoder" | "decoder" | "both";
  shape: string;
  formula: string;
  explanation: string;
}

const PAPER_LAYERS: readonly PaperLayerInfo[] = [
  {
    id: "enc-self-attn",
    name: "Encoder Multi-Head Attention",
    tower: "encoder",
    shape: "X_enc ∈ ℝ^{N × 512} (h=8, d_k=64)",
    formula:
      "\\mathrm{MultiHead}(Q, K, V) = \\mathrm{Concat}(\\mathrm{head}_1, \\dots, \\mathrm{head}_h)W^O",
    explanation:
      "All tokens in the source sequence attend to all other tokens bidirectionally. Every token integrates global context from across the entire prompt simultaneously.",
  },
  {
    id: "enc-ffn",
    name: "Encoder Position-Wise FFN",
    tower: "encoder",
    shape: "d_{model} = 512 → d_{ff} = 2048 → 512",
    formula: "\\mathrm{FFN}(x) = \\max(0, xW_1 + b_1)W_2 + b_2",
    explanation:
      "A two-layer fully-connected feed-forward network applied to each token vector independently. Expands dimension 4× before non-linear compression.",
  },
  {
    id: "dec-masked-attn",
    name: "Decoder Masked Multi-Head Attention",
    tower: "decoder",
    shape: "X_{dec} ∈ ℝ^{M × 512} (Causal Masked)",
    formula:
      "\\mathrm{Attention}(Q, K, V) = \\mathrm{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right)V",
    explanation:
      "Prevents leftward information flow. Position t cannot attend to positions > t, preserving autoregressive causality during parallelized training.",
  },
  {
    id: "dec-cross-attn",
    name: "Decoder Cross-Attention (Enc-Dec)",
    tower: "decoder",
    shape: "Q ∈ Decoder, K,V ∈ Encoder (512)",
    formula:
      "\\mathrm{Attention}(Q_{dec}, K_{enc}, V_{enc}) = \\mathrm{softmax}\\left(\\frac{Q_{dec}K_{enc}^T}{\\sqrt{d_k}}\\right)V_{enc}",
    explanation:
      "Decoder queries pull relevant source representations from the top of the encoder tower. This connects the generated sequence back to source semantics.",
  },
  {
    id: "dec-ffn",
    name: "Decoder FFN & Linear Output",
    tower: "decoder",
    shape: "d_{model} = 512 → |V| = 32,000 logits",
    formula: "P(y_t | y_{<t}) = \\mathrm{softmax}(W_{vocab} h_t + b)",
    explanation:
      "After 6 decoder blocks, a final learned linear transformation projects the 512-d hidden representation into vocabulary logits for token selection.",
  },
];

// ── Attention Matrix, Causal Mask & KV Cache Constants ──
const ATTN_TOKENS = ["The", "neural", "network", "learns", "fast"] as const;

// 5x5 Raw dot-product scores Q * K^T
const RAW_QK_SCORES: readonly (readonly number[])[] = [
  [24.0, 12.8, 8.0, 4.0, 0.8],
  [10.4, 32.0, 25.6, 9.6, 4.0],
  [7.2, 28.0, 36.0, 16.0, 8.8],
  [4.8, 11.2, 18.4, 30.4, 22.4],
  [2.4, 6.4, 10.4, 24.0, 34.4],
];

// Scaled scores: S_ij / sqrt(d_k), d_k = 64 => sqrt(d_k) = 8
const SCALED_QK_SCORES: readonly (readonly number[])[] = RAW_QK_SCORES.map(
  (row) => row.map((val) => Number((val / 8).toFixed(2))),
);

interface KvCacheStep {
  step: number;
  prompt: boolean;
  token: string;
  newQuery: string;
  keysStored: readonly string[];
  valuesStored: readonly string[];
  flopsUncached: number;
  flopsCached: number;
  desc: string;
}

const KV_CACHE_STEPS: readonly KvCacheStep[] = [
  {
    step: 0,
    prompt: true,
    token: "network",
    newQuery: "q_0, q_1, q_2 (Prefill)",
    keysStored: ["k_0 [The]", "k_1 [neural]", "k_2 [network]"],
    valuesStored: ["v_0 [The]", "v_1 [neural]", "v_2 [network]"],
    flopsUncached: 9,
    flopsCached: 9,
    desc: "Prompt Prefill: Tokens ['The', 'neural', 'network'] computed in parallel. Initial Keys & Values cached into GPU VRAM.",
  },
  {
    step: 1,
    prompt: false,
    token: "learns",
    newQuery: "q_3 [learns]",
    keysStored: ["k_0 [The]", "k_1 [neural]", "k_2 [network]", "k_3 [learns]"],
    valuesStored: [
      "v_0 [The]",
      "v_1 [neural]",
      "v_2 [network]",
      "v_3 [learns]",
    ],
    flopsUncached: 16,
    flopsCached: 4,
    desc: "Decode Step 1: Generates 'learns'. Computes single query q_3 and reuses cached k_0..k_2. Appends k_3, v_3 to cache.",
  },
  {
    step: 2,
    prompt: false,
    token: "fast",
    newQuery: "q_4 [fast]",
    keysStored: [
      "k_0 [The]",
      "k_1 [neural]",
      "k_2 [network]",
      "k_3 [learns]",
      "k_4 [fast]",
    ],
    valuesStored: [
      "v_0 [The]",
      "v_1 [neural]",
      "v_2 [network]",
      "v_3 [learns]",
      "v_4 [fast]",
    ],
    flopsUncached: 25,
    flopsCached: 5,
    desc: "Decode Step 2: Generates 'fast'. Reuses 4 cached keys; only 5 dot products evaluated instead of 25 recomputations!",
  },
  {
    step: 3,
    prompt: false,
    token: "<EOS>",
    newQuery: "q_5 [<EOS>]",
    keysStored: [
      "k_0 [The]",
      "k_1 [neural]",
      "k_2 [network]",
      "k_3 [learns]",
      "k_4 [fast]",
      "k_5 [<EOS>]",
    ],
    valuesStored: [
      "v_0 [The]",
      "v_1 [neural]",
      "v_2 [network]",
      "v_3 [learns]",
      "v_4 [fast]",
      "v_5 [<EOS>]",
    ],
    flopsUncached: 36,
    flopsCached: 6,
    desc: "Decode Step 3: Predicts <EOS>. Total incremental cost per token stayed O(t) instead of quadratic O(t^2) recomputation.",
  },
];

// Pure helper function for coreference weights calculation
function computeAttentionWeights(idx: number, head: number): readonly number[] {
  if (idx === 7) {
    return head === 1
      ? [0.02, 0.76, 0.01, 0.03, 0.01, 0.04, 0.02, 0.05, 0.02, 0.01, 0.03]
      : [0.01, 0.05, 0.01, 0.04, 0.02, 0.68, 0.03, 0.08, 0.02, 0.02, 0.04];
  }
  const remainingShare = 0.35 / (SENTENCE_TOKENS.length - 1);
  return SENTENCE_TOKENS.map((t) => (t.idx === idx ? 0.65 : remainingShare));
}

// 2D Cartesian helper for the angle arc sector path between two vectors
function getAngleArcSector(
  xA: number,
  yA: number,
  xB: number,
  yB: number,
  r = 22,
): string {
  const angleA = Math.atan2(yA, xA);
  const angleB = Math.atan2(yB, xB);
  let diff = angleB - angleA;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  while (diff > Math.PI) diff -= 2 * Math.PI;

  const sweep = diff >= 0 ? 1 : 0;
  const p1x = r * Math.cos(angleA);
  const p1y = r * Math.sin(angleA);
  const p2x = r * Math.cos(angleB);
  const p2y = r * Math.sin(angleB);

  return `M 0 0 L ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${r} ${r} 0 0 ${sweep} ${p2x.toFixed(2)} ${p2y.toFixed(2)} Z`;
}

function getAngleMidpoint(
  xA: number,
  yA: number,
  xB: number,
  yB: number,
  r = 34,
): { x: number; y: number } {
  const angleA = Math.atan2(yA, xA);
  const angleB = Math.atan2(yB, xB);
  let diff = angleB - angleA;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  const midAngle = angleA + diff / 2;
  return {
    x: r * Math.cos(midAngle),
    y: r * Math.sin(midAngle),
  };
}

export default function TransformersArticlePage() {
  // ── 1. BPE Tokenizer State ──
  const [customText, setCustomText] = useState(
    "Attention is all you need for neural sequence transduction",
  );
  const [tokens, setTokens] = useState<
    { text: string; id: number; bytes: string }[]
  >([]);
  const [inspectedToken, setInspectedToken] = useState<{
    text: string;
    id: number;
    bytes: string;
  } | null>(null);

  // ── 2. 2D Semantic Plane Interactive State ──
  const [vecMode, setVecMode] = useState<"static" | "context" | "autoregress">(
    "static",
  );
  const [contextLayer, setContextLayer] = useState<number>(3);
  const [autoStepIdx, setAutoStepIdx] = useState<number>(0);
  const [selectedTokenA, setSelectedTokenA] = useState<number | null>(0);
  const [selectedTokenB, setSelectedTokenB] = useState<number | null>(4);

  // Compute displayed 2D token coordinates based on vector mode
  const displayedTokens = useMemo(() => {
    return PRESET_VEC_TOKENS.map((t, i) => {
      let curX = t.x;
      let curY = t.y;

      if (vecMode === "context") {
        const shiftRatio = (contextLayer - 1) / 5;
        const displacements: Record<number, { dx: number; dy: number }> = {
          0: { dx: -18, dy: -25 },
          1: { dx: 14, dy: 22 },
          2: { dx: -10, dy: 16 },
          3: { dx: 24, dy: 36 },
          4: { dx: -16, dy: -12 },
          5: { dx: 10, dy: -12 },
          6: { dx: 12, dy: -14 },
          7: { dx: 8, dy: 14 },
          8: { dx: 10, dy: 12 },
          9: { dx: -12, dy: -15 },
          10: { dx: -15, dy: 20 },
          11: { dx: -14, dy: 12 },
        };
        const disp = displacements[i] || { dx: 0, dy: 0 };
        curX += disp.dx * shiftRatio;
        curY += disp.dy * shiftRatio;
      }

      return {
        ...t,
        x: curX,
        y: curY,
      };
    });
  }, [vecMode, contextLayer]);

  // Compute live 2D cosine similarity: cos(theta) = (u . v) / (||u|| ||v||)
  const cosineSim = useMemo(() => {
    if (selectedTokenA === null || selectedTokenB === null) return 0;
    const a = displayedTokens[selectedTokenA];
    const b = displayedTokens[selectedTokenB];
    if (!a || !b) return 0;
    const dot = a.x * b.x + a.y * b.y;
    const magA = Math.hypot(a.x, a.y);
    const magB = Math.hypot(b.x, b.y);
    if (magA === 0 || magB === 0) return 0;
    return Math.max(-1, Math.min(1, dot / (magA * magB)));
  }, [selectedTokenA, selectedTokenB, displayedTokens]);

  // ── 3. Positional Encoding Canvas State ──
  const posCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [posSeqLen, setPosSeqLen] = useState<number>(20);
  const posSeqLenRef = useRef(posSeqLen);
  posSeqLenRef.current = posSeqLen;

  // ── 4. Coreference Attention Simulator State ──
  const [selectedAttentionIdx, setSelectedAttentionIdx] = useState<number>(7);
  const [activeHead, setActiveHead] = useState<number>(1);
  const weights = useMemo(
    () => computeAttentionWeights(selectedAttentionIdx, activeHead),
    [selectedAttentionIdx, activeHead],
  );

  // ── 5. Position-Wise FFN Interactive State ──
  const [ffnInputVal, setFfnInputVal] = useState<number>(1.4);
  const [ffnActivation, setFfnActivation] = useState<"relu" | "gelu">("relu");

  // ── 6. Residual Connection Interactive Toggle State ──
  const [residualEnabled, setResidualEnabled] = useState<boolean>(true);

  // ── 7. Cross-Layer Decoder Stepper & Vaswani Architecture State ──
  const [decoderStep, setDecoderStep] = useState<number>(2);
  const [selectedPaperLayer, setSelectedPaperLayer] =
    useState<string>("enc-self-attn");

  // ── 8. Attention Matrix, KV Cache & Causal Masking Studio State ──
  const [sec08Tab, setSec08Tab] = useState<"attention" | "masking" | "kvcache">(
    "attention",
  );
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{
    row: number;
    col: number;
  }>({ row: 2, col: 1 });
  const [isCausalMaskActive, setIsCausalMaskActive] = useState<boolean>(true);
  const [kvStepIdx, setKvStepIdx] = useState<number>(1);

  // Compute 5x5 Softmax Attention Matrix with optional causal lockout
  const attentionMatrix = useMemo(() => {
    return SCALED_QK_SCORES.map((rowScores, rowIdx) => {
      let maxVal = -Infinity;
      for (let colIdx = 0; colIdx < rowScores.length; colIdx++) {
        if (!isCausalMaskActive || colIdx <= rowIdx) {
          if (rowScores[colIdx] > maxVal) {
            maxVal = rowScores[colIdx];
          }
        }
      }
      if (!Number.isFinite(maxVal)) maxVal = 0;

      let sumExp = 0;
      const expVals = rowScores.map((score, colIdx) => {
        if (isCausalMaskActive && colIdx > rowIdx) {
          return 0;
        }
        const ev = Math.exp(score - maxVal);
        sumExp += ev;
        return ev;
      });

      const safeSum = sumExp > 0 ? sumExp : 1;
      return expVals.map((ev, colIdx) => {
        if (isCausalMaskActive && colIdx > rowIdx) {
          return 0;
        }
        return ev / safeSum;
      });
    });
  }, [isCausalMaskActive]);

  // ── 8. Final Softmax & Temperature Sampling State ──
  const [temperature, setTemperature] = useState<number>(0.8);
  const [topK, setTopK] = useState<number>(5);
  const [samplingMethod, setSamplingMethod] = useState<
    "temperature" | "topk" | "greedy"
  >("temperature");

  // Dynamically compute softmax probabilities with full numerical stability (Log-Sum-Exp & NaN protection)
  const softmaxProbabilities = useMemo(() => {
    if (samplingMethod === "greedy") {
      return RAW_LOGITS.map((item, idx) => ({
        word: item.word,
        logit: item.logit,
        prob: idx === 0 ? 1 : 0,
        percent: idx === 0 ? "100.0" : "0.0",
        isFilteredOut: idx !== 0,
      }));
    }

    const safeTemp = Math.max(
      0.01,
      Number.isFinite(temperature) ? temperature : 1.0,
    );

    const safeK =
      samplingMethod === "topk"
        ? Math.max(
            1,
            Math.min(
              RAW_LOGITS.length,
              Math.floor(Number.isFinite(topK) ? topK : 1),
            ),
          )
        : RAW_LOGITS.length;

    let maxScaledLogit = -Infinity;
    const scaledLogits: number[] = new Array(RAW_LOGITS.length);

    for (let i = 0; i < RAW_LOGITS.length; i++) {
      if (i < safeK) {
        const scaled = RAW_LOGITS[i].logit / safeTemp;
        scaledLogits[i] = scaled;
        if (scaled > maxScaledLogit) {
          maxScaledLogit = scaled;
        }
      } else {
        scaledLogits[i] = -Infinity;
      }
    }

    if (!Number.isFinite(maxScaledLogit)) {
      maxScaledLogit = 0;
    }

    let sumExp = 0;
    const expVals = new Array(RAW_LOGITS.length);

    for (let i = 0; i < RAW_LOGITS.length; i++) {
      if (i < safeK) {
        const ev = Math.exp(scaledLogits[i] - maxScaledLogit);
        const safeEv = Number.isFinite(ev) ? ev : 0;
        expVals[i] = safeEv;
        sumExp += safeEv;
      } else {
        expVals[i] = 0;
      }
    }

    const safeSum = sumExp > 0 && Number.isFinite(sumExp) ? sumExp : 1;

    return RAW_LOGITS.map((item, i) => {
      const isFilteredOut = i >= safeK;
      const prob = isFilteredOut ? 0 : expVals[i] / safeSum;
      const safeProb = Number.isFinite(prob)
        ? Math.max(0, Math.min(1, prob))
        : 0;
      return {
        word: item.word,
        logit: item.logit,
        prob: safeProb,
        percent: (safeProb * 100).toFixed(1),
        isFilteredOut,
      };
    });
  }, [temperature, topK, samplingMethod]);

  // ── Simple BPE Tokenization Rule Simulator ──
  const runTokenizer = useCallback((textToTokenize: string) => {
    const trimmed = textToTokenize.trim();
    if (!trimmed) {
      setTokens([]);
      setInspectedToken(null);
      return;
    }

    const rawWords = trimmed.split(/\s+/);
    const subwords: { text: string; id: number; bytes: string }[] = [];

    for (const word of rawWords) {
      const lower = word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
      if (!lower) continue;

      if (lower.length > 7) {
        const part1 = lower.slice(0, 5);
        const part2 = `##${lower.slice(5)}`;

        let h1 = 7;
        for (let i = 0; i < part1.length; i++) {
          h1 = (h1 * 31 + part1.charCodeAt(i)) | 0;
        }
        let h2 = 13;
        for (let i = 0; i < part2.length; i++) {
          h2 = (h2 * 31 + part2.charCodeAt(i)) | 0;
        }

        const hash1 = Math.abs(h1) % 32000;
        const hash2 = Math.abs(h2) % 32000;

        const bytes1 = Array.from(part1)
          .map((c) =>
            c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase(),
          )
          .join(" ");
        const bytes2 = Array.from(part2)
          .map((c) =>
            c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase(),
          )
          .join(" ");

        subwords.push({ text: part1, id: hash1, bytes: bytes1 });
        subwords.push({ text: part2, id: hash2, bytes: bytes2 });
      } else {
        let h = 11;
        for (let i = 0; i < lower.length; i++) {
          h = (h * 31 + lower.charCodeAt(i)) | 0;
        }
        const hash = Math.abs(h) % 32000;
        const bytes = Array.from(lower)
          .map((c) =>
            c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase(),
          )
          .join(" ");
        subwords.push({ text: lower, id: hash, bytes });
      }
    }

    setTokens(subwords);
    if (subwords.length > 0) {
      setInspectedToken(subwords[0]);
    } else {
      setInspectedToken(null);
    }
  }, []);

  useEffect(() => {
    runTokenizer(customText);
  }, [runTokenizer, customText]);

  // ── Positional Encoding Spectrum Wave Renderer (Warm Editorial 2D Theme) ──
  useEffect(() => {
    const canvas = posCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number | null = null;
    let isVisible = false;
    let waveOffset = 0;

    let width = canvas.clientWidth || 800;
    let height = Math.max(120, canvas.clientHeight || 180);
    let dpr = window.devicePixelRatio || 1;

    const updateWaveDimensions = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = Math.floor(rect.width) || 300;
      height = Math.max(120, Math.floor(rect.height) || 180);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    updateWaveDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateWaveDimensions();
    });
    resizeObserver.observe(canvas);

    const renderWave = () => {
      const curPosSeqLen = posSeqLenRef.current;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Warm editorial inner stage ground
      ctx.fillStyle = "#F4F1EA";
      ctx.fillRect(0, 0, width, height);

      waveOffset += 0.03;

      const numCurves = 8;
      for (let c = 0; c < numCurves; c++) {
        const isSine = c % 2 === 0;
        const freq = 0.01 + c * 0.018;
        const alpha = 0.8 - c * 0.08;

        // Sine in charcoal #1A1816, Cosine in terracotta #DE5D35
        ctx.strokeStyle = isSine
          ? `rgba(26, 24, 22, ${alpha})`
          : `rgba(222, 93, 53, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        for (let x = 0; x < width; x += 3) {
          const pos = (x / width) * curPosSeqLen;
          const y = isSine
            ? Math.sin(pos * freq * 10 + waveOffset + c) * 35 + height / 2
            : Math.cos(pos * freq * 10 + waveOffset + c) * 35 + height / 2;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Neutral center axis
      ctx.strokeStyle = "rgba(26, 24, 22, 0.15)";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.restore();
      if (isVisible) {
        animId = requestAnimationFrame(renderWave);
      } else {
        animId = null;
      }
    };

    const startAnimation = () => {
      if (!animId && isVisible) {
        animId = requestAnimationFrame(renderWave);
      }
    };

    const stopAnimation = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(canvas);

    return () => {
      stopAnimation();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  // Compute selected token objects for live cosine rays
  const tokenAObj =
    selectedTokenA !== null ? displayedTokens[selectedTokenA] : null;
  const tokenBObj =
    selectedTokenB !== null ? displayedTokens[selectedTokenB] : null;

  // Compute sector arc path and mid-point for angle theta in 2D Semantic Plane
  const angleArcSector = useMemo(() => {
    if (!tokenAObj || !tokenBObj) return null;
    return getAngleArcSector(
      tokenAObj.x,
      -tokenAObj.y,
      tokenBObj.x,
      -tokenBObj.y,
      24,
    );
  }, [tokenAObj, tokenBObj]);

  const angleMidpoint = useMemo(() => {
    if (!tokenAObj || !tokenBObj) return null;
    return getAngleMidpoint(
      tokenAObj.x,
      -tokenAObj.y,
      tokenBObj.x,
      -tokenBObj.y,
      34,
    );
  }, [tokenAObj, tokenBObj]);

  // Autoregressive Trajectory points for Vector Mode 3
  const arPoints = useMemo(() => {
    return [
      { x: 0, y: 0, text: "<BOS>" },
      { x: 55, y: -60, text: "Attention" },
      { x: 15, y: -15, text: "is" },
      { x: -20, y: 55, text: "all" },
      { x: 20, y: 65, text: "you" },
      { x: -35, y: 75, text: "need" },
    ];
  }, []);

  // FFN Layer calculations for Two-Layer Visualizer
  const ffnActiveNeurons = Math.round(ffnInputVal * 280);
  const ffnSparsityPct = (100 - (ffnActiveNeurons / 2048) * 100).toFixed(1);
  const numActiveNodes = Math.min(
    13,
    Math.max(1, Math.round((ffnInputVal / 3.0) * 13)),
  );

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen overflow-x-hidden">
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            *, ::before, ::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
        <div className="shell max-w-5xl">
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              href="/resources"
              aria-label="Return to Published Articles Archive"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[2px] bg-[#FAF9F5] border border-[#1A1816] text-[#1A1816] font-mono text-[12px] font-bold tracking-wider uppercase transition-all duration-200 hover:bg-[#1A1816] hover:text-[#FAF9F5] group"
            >
              <span className="text-[#DE5D35] group-hover:text-[#FAF9F5] transition-transform duration-200 group-hover:-translate-x-1 font-bold">
                ←
              </span>
              <span>Back to 03 / Published Articles</span>
            </Link>

            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.16em] uppercase text-[#75716B]">
              <Link
                href="/resources"
                className="hover:text-[#1A1816] transition-colors"
              >
                03 / Resources
              </Link>
              <span>/</span>
              <span className="text-[#DE5D35] font-semibold">
                Deep Learning · Transformers
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 16
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              The Transformer: Attention Is All You Need
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              A complete first-principles architectural breakdown: from subword
              Byte-Pair Encoding and 2D semantic token spaces, to sinusoidal
              positional encoding, two-layer feed-forward expansion, residual
              highways, 6-layer dual towers, and final softmax temperature
              sampling.
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-6 font-mono text-[11px] uppercase tracking-wider text-[#75716B]">
              <span>Read Time: 16 min</span>
              <span>•</span>
              <span>Vaswani et al. (NeurIPS 2017)</span>
              <span>•</span>
              <span className="text-[#DE5D35] font-bold">
                AIS Research Cohort
              </span>
            </div>
          </header>

          {/* Table of Contents / Curriculum Quick Jump */}
          <nav
            aria-label="Table of Contents"
            className="mb-14 border border-[#1A1816]/15 bg-[#FAF9F5] p-5 sm:p-6 rounded-[2px]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1816]/10 pb-3 mb-4 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#1A1816]">
                  Table of Contents · 9 First-Principles Modules
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#DE5D35] uppercase tracking-wider">
                Canonical Vaswani Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TABLE_OF_CONTENTS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group flex flex-col justify-between p-3 rounded-[2px] border border-[#1A1816]/10 bg-[#FAF9F5] hover:bg-[#F4F1EA] hover:border-[#DE5D35] transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#DE5D35] px-1.5 py-0.5 rounded-[2px] bg-[#DE5D35]/10 border border-[#DE5D35]/20">
                      {item.num}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#75716B] group-hover:text-[#1A1816] transition-colors">
                      {item.tag}
                    </span>
                  </div>
                  <div className="font-bold text-[13px] text-[#1A1816] group-hover:text-[#DE5D35] transition-colors leading-tight mb-1">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#75716B] leading-snug line-clamp-2">
                    {item.desc}
                  </div>
                </a>
              ))}
            </div>
          </nav>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 01: TOKENIZER & BPE SUBWORDS
              ────────────────────────────────────────────────────────────────── */}
          <section id="sec-01" className="mb-16 scroll-mt-24">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / Tokenization &amp; Vocabulary
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Byte-Pair Encoding (BPE) &amp; Subword Representation
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                Transformers cannot ingest raw characters or arbitrary-length
                string words directly. Word-level vocabularies suffer from
                out-of-vocabulary (OOV) tokens, while character-level
                tokenization inflates sequence length by 10× (and self-attention
                scales quadratically <MathTex math="O(N^2)" />
                ).
                <strong> Byte-Pair Encoding (BPE)</strong> merges frequent
                character pairs into morphemic subwords:
              </p>

              {/* Interactive Tokenizer Input Box */}
              <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5 rounded-[2px] mb-6 font-mono">
                <div className="text-[11px] text-[#1A1816] uppercase mb-3 font-bold flex flex-wrap justify-between items-center gap-2 border-b border-[#1A1816]/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
                    <span>INTERACTIVE BPE TOKENIZER STUDIO</span>
                  </div>
                  <span className="text-[#DE5D35] font-bold">
                    {tokens.length} TOKENS EXTRACTED
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomText(val);
                      runTokenizer(val);
                    }}
                    className="grow bg-[#F4F1EA] border border-[#1A1816]/20 rounded-[2px] px-3 py-2 text-[12px] text-[#1A1816] focus:outline-none focus:border-[#DE5D35]"
                    placeholder="Type any sentence to tokenize..."
                    aria-label="Sentence to tokenize"
                  />
                  <button
                    type="button"
                    onClick={() => runTokenizer(customText)}
                    className="px-4 py-2 bg-[#DE5D35] text-[#FAF9F5] text-[11px] font-bold uppercase rounded-[2px] hover:bg-[#DE5D35]/90 transition-colors cursor-pointer"
                  >
                    TOKENIZE
                  </button>
                </div>

                {/* Extracted Token Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tokens.map((tok) => (
                    <button
                      type="button"
                      key={`token-chip-${tok.id}-${tok.text}`}
                      onClick={() => setInspectedToken(tok)}
                      className={`px-3 py-1.5 rounded-[2px] text-[12px] border transition-all cursor-pointer ${
                        inspectedToken?.text === tok.text
                          ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816] font-bold"
                          : "bg-[#F4F1EA] text-[#1A1816] border-[#1A1816]/15 hover:border-[#DE5D35]"
                      }`}
                    >
                      <span className="opacity-60 text-[10px] mr-1">
                        #{tok.id}:
                      </span>
                      <span>&ldquo;{tok.text}&rdquo;</span>
                    </button>
                  ))}
                </div>

                {/* Token Byte & Embedding Inspector */}
                {inspectedToken && (
                  <div className="p-3 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[#1A1816]">
                    <div>
                      <span className="text-[#DE5D35] font-bold block mb-1">
                        TOKEN TEXT
                      </span>
                      <span>&ldquo;{inspectedToken.text}&rdquo;</span>
                    </div>
                    <div>
                      <span className="text-[#1A1816] font-bold block mb-1">
                        VOCABULARY ID
                      </span>
                      <span>
                        Index {inspectedToken.id} in{" "}
                        <MathTex math="\mathbb{R}^{37000 \times 512}" />
                      </span>
                    </div>
                    <div>
                      <span className="text-[#75716B] font-bold block mb-1">
                        ASCII / UTF-8 BYTES
                      </span>
                      <span>0x{inspectedToken.bytes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 02: 2D INTERACTIVE SEMANTIC PLANE & VECTOR GEOMETRY
              ────────────────────────────────────────────────────────────────── */}
          <section
            id="sec-02"
            className="mb-16 border-t border-[#1A1816]/15 pt-12 scroll-mt-24"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                02 / Vector Geometry
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Tokens on the 2D Semantic Plane &amp; Cosine Angular Geometry
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                Each token ID is projected into a dense continuous embedding
                space <MathTex math="d_{model} = 512" />. High-dimensional
                embeddings organize semantic meaning geometrically: tokens with
                similar contextual roles cluster together. On the 2D semantic
                plane below, observe semantic cluster hulls, select token pairs,
                and inspect vector alignment{" "}
                <MathTex math="\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}" />
                :
              </p>

              {/* 2D Semantic Plane Visualizer Container */}
              <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5 rounded-[2px] font-mono mb-6">
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#1A1816]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
                    <span className="text-[11px] font-bold text-[#1A1816] tracking-wider uppercase">
                      2D SEMANTIC PLANE SIMULATOR ·{" "}
                      <MathTex math="\mathbb{R}^{512} \to \mathbb{R}^2" />
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-[#F4F1EA] border border-[#1A1816]/15 text-[#75716B]">
                    INTERACTIVE 2D VECTOR SPACE · EMBEDDING GEOMETRY
                  </span>
                </div>

                {/* Mode Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[11px]">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setVecMode("static")}
                      className={`px-3 py-1.5 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        vecMode === "static"
                          ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#1A1816]"
                      }`}
                    >
                      1. STATIC SEMANTIC SPACE
                    </button>
                    <button
                      type="button"
                      onClick={() => setVecMode("context")}
                      className={`px-3 py-1.5 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        vecMode === "context"
                          ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#1A1816]"
                      }`}
                    >
                      2. CONTEXTUALIZED LAYER SHIFT
                    </button>
                    <button
                      type="button"
                      onClick={() => setVecMode("autoregress")}
                      className={`px-3 py-1.5 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        vecMode === "autoregress"
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#1A1816]"
                      }`}
                    >
                      3. AUTOREGRESSIVE TRAJECTORY
                    </button>
                  </div>

                  {/* Mode-Specific Sub-Controls */}
                  {vecMode === "context" && (
                    <div className="flex items-center gap-2 text-[10px] p-1.5 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px]">
                      <span className="text-[#DE5D35] font-bold">
                        LAYER DEPTH:
                      </span>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        value={contextLayer}
                        onChange={(e) =>
                          setContextLayer(Number(e.target.value))
                        }
                        className="accent-[#DE5D35] cursor-pointer touch-none"
                        aria-label="Context Layer Depth"
                      />
                      <span className="font-bold text-[#1A1816]">
                        LAYER {contextLayer} / 6
                      </span>
                    </div>
                  )}

                  {vecMode === "autoregress" && (
                    <div className="flex items-center gap-2 text-[10px] p-1.5 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px]">
                      <button
                        type="button"
                        onClick={() =>
                          setAutoStepIdx((prev) => Math.max(0, prev - 1))
                        }
                        className="px-2 py-1 bg-[#FAF9F5] border border-[#1A1816]/20 rounded-[2px] text-[#1A1816] font-bold hover:border-[#1A1816] cursor-pointer"
                      >
                        ◀ PREV
                      </button>
                      <span className="text-[#DE5D35] font-bold">
                        STEP {autoStepIdx + 1} / {arPoints.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAutoStepIdx((prev) =>
                            Math.min(arPoints.length - 1, prev + 1),
                          )
                        }
                        className="px-2 py-1 bg-[#DE5D35] text-[#FAF9F5] rounded-[2px] font-bold hover:bg-[#DE5D35]/90 cursor-pointer"
                      >
                        NEXT ▶
                      </button>
                    </div>
                  )}
                </div>

                {/* 2D Coordinate Plane Stage (SVG) */}
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px] mb-4 overflow-hidden">
                  <svg
                    viewBox="-115 -105 230 210"
                    className="w-full h-[320px] sm:h-[400px] block select-none"
                    role="img"
                    aria-label="2D Semantic Plane Coordinate System"
                  >
                    <title>2D Semantic Plane Coordinate System</title>
                    <defs>
                      <marker
                        id="arrow-token-a"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#DE5D35" />
                      </marker>
                      <marker
                        id="arrow-token-b"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#1A1816" />
                      </marker>
                      <marker
                        id="arrow-axis"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto-start-reverse"
                      >
                        <path
                          d="M 0 2 L 8 5 L 0 8 z"
                          fill="rgba(26, 24, 22, 0.4)"
                        />
                      </marker>
                    </defs>

                    {/* Background Gridlines */}
                    {[-75, -50, -25, 25, 50, 75].map((val) => (
                      <g key={`gridline-${val}`}>
                        <line
                          x1="-100"
                          y1={val}
                          x2="100"
                          y2={val}
                          stroke="rgba(26, 24, 22, 0.08)"
                          strokeWidth="0.8"
                          strokeDasharray="2 2"
                        />
                        <line
                          x1={val}
                          y1="-95"
                          x2={val}
                          y2="95"
                          stroke="rgba(26, 24, 22, 0.08)"
                          strokeWidth="0.8"
                          strokeDasharray="2 2"
                        />
                      </g>
                    ))}

                    {/* Center Axes */}
                    <line
                      x1="-102"
                      y1="0"
                      x2="102"
                      y2="0"
                      stroke="rgba(26, 24, 22, 0.3)"
                      strokeWidth="1"
                      markerEnd="url(#arrow-axis)"
                    />
                    <line
                      x1="0"
                      y1="97"
                      x2="0"
                      y2="-97"
                      stroke="rgba(26, 24, 22, 0.3)"
                      strokeWidth="1"
                      markerEnd="url(#arrow-axis)"
                    />

                    {/* Axis Labels */}
                    <text
                      x="104"
                      y="3"
                      fill="#75716B"
                      fontSize="5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      +X (Syntactic)
                    </text>
                    <text
                      x="2"
                      y="-98"
                      fill="#75716B"
                      fontSize="5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      +Y (Semantic)
                    </text>
                    <text
                      x="-8"
                      y="8"
                      fill="#75716B"
                      fontSize="5"
                      fontFamily="monospace"
                    >
                      (0,0)
                    </text>

                    {/* Semantic Cluster Hulls */}
                    {/* 1. ML Architecture Cluster */}
                    <polygon
                      points="30,-25 32,-68 72,-92 92,-75 80,-22 50,-18"
                      fill="rgba(222, 93, 53, 0.05)"
                      stroke="rgba(222, 93, 53, 0.3)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="42"
                      y="-82"
                      fill="#DE5D35"
                      fontSize="5.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.05em"
                    >
                      ML ARCHITECTURE
                    </text>

                    {/* 2. Analogy / Royalty Cluster */}
                    <polygon
                      points="-82,45 -82,-55 -45,-78 -42,-35 -48,45"
                      fill="rgba(26, 24, 22, 0.04)"
                      stroke="rgba(26, 24, 22, 0.25)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="-80"
                      y="-60"
                      fill="#1A1816"
                      fontSize="5.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.05em"
                    >
                      ANALOGY / ROYALTY
                    </text>

                    {/* 3. Grammar / Sequence Cluster */}
                    <polygon
                      points="-45,85 -45,45 58,35 58,75 15,88"
                      fill="rgba(117, 113, 107, 0.05)"
                      stroke="rgba(117, 113, 107, 0.3)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="-5"
                      y="82"
                      fill="#75716B"
                      fontSize="5.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.05em"
                    >
                      GRAMMAR / SEQUENCE
                    </text>

                    {/* Autoregressive Trajectory Path (Mode 3) */}
                    {vecMode === "autoregress" && (
                      <g>
                        <polyline
                          points={arPoints
                            .slice(0, autoStepIdx + 1)
                            .map((p) => `${p.x},${p.y}`)
                            .join(" ")}
                          fill="none"
                          stroke="#DE5D35"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        {arPoints.slice(0, autoStepIdx + 1).map((p, idx) => (
                          <g key={`ar-traj-node-${p.text}`}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={idx === autoStepIdx ? 5 : 3}
                              fill={idx === autoStepIdx ? "#DE5D35" : "#1A1816"}
                            />
                            {idx === autoStepIdx && (
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="8"
                                fill="none"
                                stroke="#DE5D35"
                                strokeWidth="1"
                                opacity="0.6"
                              />
                            )}
                          </g>
                        ))}
                      </g>
                    )}

                    {/* Live Cosine Angle Sector Arc */}
                    {angleArcSector && (
                      <path
                        d={angleArcSector}
                        fill="rgba(222, 93, 53, 0.15)"
                        stroke="#DE5D35"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Angle theta label */}
                    {angleMidpoint && (
                      <text
                        x={angleMidpoint.x}
                        y={angleMidpoint.y}
                        textAnchor="middle"
                        fill="#DE5D35"
                        fontSize="6"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        θ ({cosineSim.toFixed(2)})
                      </text>
                    )}

                    {/* Live Ray to Token A (Terracotta) */}
                    {tokenAObj && (
                      <line
                        x1="0"
                        y1="0"
                        x2={tokenAObj.x}
                        y2={-tokenAObj.y}
                        stroke="#DE5D35"
                        strokeWidth="1.8"
                        markerEnd="url(#arrow-token-a)"
                      />
                    )}

                    {/* Live Ray to Token B (Charcoal) */}
                    {tokenBObj && (
                      <line
                        x1="0"
                        y1="0"
                        x2={tokenBObj.x}
                        y2={-tokenBObj.y}
                        stroke="#1A1816"
                        strokeWidth="1.8"
                        markerEnd="url(#arrow-token-b)"
                      />
                    )}

                    {/* Connecting Chord Between Token A and Token B */}
                    {tokenAObj && tokenBObj && (
                      <line
                        x1={tokenAObj.x}
                        y1={-tokenAObj.y}
                        x2={tokenBObj.x}
                        y2={-tokenBObj.y}
                        stroke="#DE5D35"
                        strokeWidth="0.8"
                        strokeDasharray="3 3"
                        opacity="0.6"
                      />
                    )}

                    {/* Render All Tokens on the Semantic Plane */}
                    {displayedTokens.map((t, idx) => {
                      const isA = selectedTokenA === idx;
                      const isB = selectedTokenB === idx;
                      const svgY = -t.y;

                      return (
                        <g key={`plane-token-${t.id}-${t.text}`}>
                          {/* Active Halo */}
                          {(isA || isB) && (
                            <circle
                              cx={t.x}
                              cy={svgY}
                              r="8"
                              fill="none"
                              stroke={isA ? "#DE5D35" : "#1A1816"}
                              strokeWidth="1"
                              strokeDasharray="2 2"
                            />
                          )}

                          {/* Token Node */}
                          <circle
                            cx={t.x}
                            cy={svgY}
                            r={isA || isB ? 5 : 3.5}
                            fill={isA ? "#DE5D35" : isB ? "#1A1816" : "#FAF9F5"}
                            stroke={
                              isA ? "#DE5D35" : isB ? "#1A1816" : "#75716B"
                            }
                            strokeWidth="1.5"
                          />

                          {/* Label */}
                          <text
                            x={t.x + 6}
                            y={svgY + 2.5}
                            fill={isA ? "#DE5D35" : isB ? "#1A1816" : "#4A4742"}
                            fontSize="6"
                            fontFamily="monospace"
                            fontWeight={isA || isB ? "bold" : "normal"}
                          >
                            {t.text}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Token Selector for Cosine Similarity Calculation */}
                <div className="p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] flex flex-wrap items-center justify-between gap-4 text-[11px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#DE5D35]" />
                      <span className="text-[#DE5D35] font-bold">
                        VECTOR A:
                      </span>
                      <select
                        value={selectedTokenA ?? 0}
                        onChange={(e) =>
                          setSelectedTokenA(Number(e.target.value))
                        }
                        className="bg-[#FAF9F5] border border-[#DE5D35] rounded-[2px] px-2 py-1 text-[#DE5D35] font-bold cursor-pointer"
                        aria-label="Select Vector A"
                      >
                        {PRESET_VEC_TOKENS.map((t, idx) => (
                          <option key={`vec-token-a-${t.id}`} value={idx}>
                            &ldquo;{t.text}&rdquo; ({t.cluster})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="w-2 h-2 rounded-full bg-[#1A1816]" />
                      <span className="text-[#1A1816] font-bold">
                        VECTOR B:
                      </span>
                      <select
                        value={selectedTokenB ?? 4}
                        onChange={(e) =>
                          setSelectedTokenB(Number(e.target.value))
                        }
                        className="bg-[#FAF9F5] border border-[#1A1816] rounded-[2px] px-2 py-1 text-[#1A1816] font-bold cursor-pointer"
                        aria-label="Select Vector B"
                      >
                        {PRESET_VEC_TOKENS.map((t, idx) => (
                          <option key={`vec-token-b-${t.id}`} value={idx}>
                            &ldquo;{t.text}&rdquo; ({t.cluster})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#DE5D35] font-bold text-[12px]">
                      COSINE SIMILARITY: {cosineSim.toFixed(3)}
                    </span>
                    <span className="text-[#75716B] text-[10px]">
                      <MathTex math="\frac{u \cdot v}{\|u\| \|v\|}" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 03: POSITIONAL ENCODINGS (HARMONIC SINE/COSINE SPECTRUM)
              ────────────────────────────────────────────────────────────────── */}
          <section
            id="sec-03"
            className="mb-16 border-t border-[#1A1816]/15 pt-12 scroll-mt-24"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Harmonic Geometry
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Sinusoidal Positional Encoding &amp; Frequency Harmonics
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                Because self-attention operates across all positions in parallel
                with zero recurrence, it is completely permutation-invariant.
                Shuffling input words computes identical outputs. Vaswani et al.
                solved this by adding harmonic sine and cosine waves directly
                into the embedding vectors:
              </p>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] font-mono text-[13px] text-center my-4 overflow-x-auto">
                <MathTex
                  math="PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right), \quad PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)"
                  block
                />
              </div>

              {/* Live Animated Waveform Canvas Container */}
              <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5 rounded-[2px] font-mono mb-6">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
                    <span className="text-[11px] text-[#1A1816] font-bold uppercase">
                      HARMONIC SINE (CHARCOAL) &amp; COSINE (TERRACOTTA)
                      SPECTRUM
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-[#75716B]">SEQUENCE LENGTH:</span>
                    <input
                      type="range"
                      min="8"
                      max="48"
                      value={posSeqLen}
                      onChange={(e) => setPosSeqLen(Number(e.target.value))}
                      className="accent-[#DE5D35] cursor-pointer touch-none"
                      aria-label="Sequence Length"
                    />
                    <span className="text-[#DE5D35] font-bold">
                      {posSeqLen} POS
                    </span>
                  </div>
                </div>

                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-2 rounded-[2px] mb-3">
                  <canvas
                    ref={posCanvasRef}
                    className="w-full h-[160px] sm:h-[180px] rounded-[2px] block"
                  />
                </div>

                <div className="text-[10px] text-[#75716B] flex flex-wrap justify-between gap-2">
                  <span>
                    HIGH FREQUENCIES (Local syntax &amp; immediate neighbours)
                  </span>
                  <span>
                    LOW FREQUENCIES (Long-range global context up to 10,000·2π)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 04: SCALED DOT-PRODUCT & MULTI-HEAD ATTENTION
              ────────────────────────────────────────────────────────────────── */}
          <section
            id="sec-04"
            className="mb-16 border-t border-[#1A1816]/15 pt-12 scroll-mt-24"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / Attention Mechanics
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Scaled Dot-Product &amp; Multi-Head Projections
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                Queries (<MathTex math="Q" />
                ), Keys (<MathTex math="K" />
                ), and Values (<MathTex math="V" />) are computed via learned
                projections. Scaling by <MathTex math="1/\sqrt{d_k}" /> prevents
                softmax gradients from vanishing for large vector dimensions:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-3.5 sm:p-4 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-mono text-[12px] font-bold uppercase text-[#DE5D35]">
                      Scaled Dot-Product Attention
                    </h3>
                    <span className="font-mono text-[9px] text-[#75716B] uppercase tracking-wider">
                      Scrollable →
                    </span>
                  </div>
                  <div className="py-2 overflow-x-auto min-w-0 max-w-full text-[11px] xs:text-[13px] sm:text-base scrollbar-thin">
                    <div className="min-w-max">
                      <MathTex
                        math="\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V"
                        block
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-mono text-[12px] font-bold uppercase text-[#DE5D35]">
                      Multi-Head Projections (<MathTex math="h=8" />)
                    </h3>
                    <span className="font-mono text-[9px] text-[#75716B] uppercase tracking-wider">
                      Scrollable →
                    </span>
                  </div>
                  <div className="py-2 overflow-x-auto min-w-0 max-w-full text-[11px] xs:text-[13px] sm:text-base scrollbar-thin">
                    <div className="min-w-max">
                      <MathTex
                        math="\mathrm{MultiHead}(Q, K, V) = \mathrm{Concat}(\mathrm{head}_1, \dots, \mathrm{head}_h)W^O"
                        block
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coreference Resolution Attention Simulator */}
              <div className="p-5 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] mb-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <span className="font-mono text-[11px] font-bold text-[#DE5D35] uppercase">
                    INTERACTIVE COREFERENCE ATTENTION RESOLUTION
                  </span>
                  <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActiveHead(1)}
                      className={`px-3 py-1 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        activeHead === 1
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      Head 1 · Coreference (&rarr; animal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveHead(2)}
                      className={`px-3 py-1 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        activeHead === 2
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      Head 2 · Syntactic (&rarr; street)
                    </button>
                  </div>
                </div>

                {/* Sentence Tokens */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {SENTENCE_TOKENS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedAttentionIdx(item.idx)}
                      className={`relative px-3 py-2 rounded-[2px] font-mono text-[12px] transition-all border cursor-pointer ${
                        item.idx === selectedAttentionIdx
                          ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816] font-bold"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      {item.text}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#DE5D35] rounded-b-[2px] transition-all"
                        style={{
                          opacity: weights[item.idx],
                          transform: `scaleX(${weights[item.idx]})`,
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Weight Distribution Bars */}
                <div className="space-y-1.5 font-mono text-[12px]">
                  {SENTENCE_TOKENS.map((item) => (
                    <div
                      key={`weight-bar-${item.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="w-16 text-right font-medium text-[#1A1816]">
                        {item.text}:
                      </span>
                      <div className="grow bg-[#EFECE6] h-3.5 rounded-[2px] overflow-hidden">
                        <div
                          className="h-full bg-[#DE5D35] transition-all duration-300"
                          style={{ width: `${weights[item.idx] * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-[#DE5D35]">
                        {(weights[item.idx] * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 05: TWO-LAYER FEED-FORWARD NETWORK REDESIGN
              ────────────────────────────────────────────────────────────────── */}
          <section
            id="sec-05"
            className="mb-16 border-t border-[#1A1816]/15 pt-12 scroll-mt-24"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / Deep Layers
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Two-Layer Position-Wise Feed-Forward Networks as Associative
                Memories
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                While self-attention connects different tokens across sequence
                space, the <strong>Feed-Forward Network (FFN)</strong> processes
                each token independently. It projects the embedding dimension 4×
                from <MathTex math="d_{model} = 512" /> up to{" "}
                <MathTex math="d_{ff} = 2048" /> via <MathTex math="W_1" /> with
                non-linear activation (ReLU or GELU), and contracts back down to{" "}
                <MathTex math="d_{model} = 512" /> via <MathTex math="W_2" />:
              </p>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] font-mono text-[13px] text-center my-4 overflow-x-auto">
                <MathTex
                  math="\mathrm{FFN}(x) = \max(0, xW_1 + b_1)W_2 + b_2 = \mathrm{ReLU}(xW_1 + b_1)W_2 + b_2"
                  block
                />
              </div>

              {/* Two-Layer FFN Neural Architecture Visualizer */}
              <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5 rounded-[2px] font-mono mb-6">
                <div className="text-[11px] text-[#1A1816] uppercase font-bold mb-4 flex flex-wrap justify-between items-center gap-2 border-b border-[#1A1816]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
                    <span>
                      TWO-LAYER NEURAL ARCHITECTURE · W₁ EXPANSION &amp; W₂
                      PROJECTION
                    </span>
                  </div>
                  <span className="text-[#DE5D35] font-bold">
                    2/3 OF MODEL WEIGHTS LIVE IN FFN
                  </span>
                </div>

                {/* Interactive Parameter Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] mb-4 text-[11px]">
                  {/* Activation Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#75716B] font-bold">
                      ACTIVATION:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFfnActivation("relu")}
                      className={`px-3 py-1 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        ffnActivation === "relu"
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      ReLU (max(0, z))
                    </button>
                    <button
                      type="button"
                      onClick={() => setFfnActivation("gelu")}
                      className={`px-3 py-1 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        ffnActivation === "gelu"
                          ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#1A1816]"
                      }`}
                    >
                      GELU (x·Φ(x))
                    </button>
                  </div>

                  {/* Input Magnitude Slider */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#75716B]">INPUT MAGNITUDE (x):</span>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={ffnInputVal}
                      onChange={(e) => setFfnInputVal(Number(e.target.value))}
                      className="accent-[#DE5D35] cursor-pointer touch-none"
                      aria-label="Input Magnitude"
                    />
                    <span className="text-[#DE5D35] font-bold min-w-[36px]">
                      {ffnInputVal.toFixed(1)}x
                    </span>
                  </div>
                </div>

                {/* Neural Network SVG Visualizer */}
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-4 rounded-[2px] mb-4 overflow-hidden">
                  <svg
                    viewBox="0 0 700 280"
                    className="w-full h-[220px] sm:h-[280px] block select-none"
                    role="img"
                    aria-label="Two-Layer Feed Forward Neural Network Architecture"
                  >
                    <title>
                      Two-Layer Feed Forward Neural Network Architecture
                    </title>
                    {/* Stage Zone Labels */}
                    <text
                      x="80"
                      y="24"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      INPUT VECTOR x (d=512)
                    </text>
                    <text
                      x="350"
                      y="16"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      EXPANDED HIDDEN LAYER (d_ff = 2048) · 4×
                    </text>
                    <text
                      x="620"
                      y="24"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      PROJECTED OUTPUT (d=512)
                    </text>

                    {/* Weight Matrix Equation Annotations */}
                    <text
                      x="215"
                      y="268"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      W₁ ∈ ℝ^(512 × 2048) + b₁
                    </text>
                    <text
                      x="485"
                      y="268"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      W₂ ∈ ℝ^(2048 × 512) + b₂
                    </text>

                    {/* Synaptic Connection Lines: W1 (Input -> Hidden) */}
                    {[45, 90, 135, 180, 225].map((inY) =>
                      [
                        28, 46, 64, 82, 100, 118, 136, 154, 172, 190, 208, 226,
                        244,
                      ].map((hidY, hidIdx) => {
                        const isNodeActive = hidIdx < numActiveNodes;
                        return (
                          <line
                            key={`w1-syn-${inY}-${hidY}`}
                            x1="80"
                            y1={inY}
                            x2="350"
                            y2={hidY}
                            stroke={
                              isNodeActive
                                ? "rgba(222, 93, 53, 0.18)"
                                : "rgba(26, 24, 22, 0.05)"
                            }
                            strokeWidth={isNodeActive ? 0.9 : 0.5}
                          />
                        );
                      }),
                    )}

                    {/* Synaptic Connection Lines: W2 (Hidden -> Output) */}
                    {[
                      28, 46, 64, 82, 100, 118, 136, 154, 172, 190, 208, 226,
                      244,
                    ].map((hidY, hidIdx) =>
                      [45, 90, 135, 180, 225].map((outY) => {
                        const isNodeActive = hidIdx < numActiveNodes;
                        return (
                          <line
                            key={`w2-syn-${hidY}-${outY}`}
                            x1="350"
                            y1={hidY}
                            x2="620"
                            y2={outY}
                            stroke={
                              isNodeActive
                                ? "rgba(222, 93, 53, 0.18)"
                                : "rgba(26, 24, 22, 0.05)"
                            }
                            strokeWidth={isNodeActive ? 0.9 : 0.5}
                          />
                        );
                      }),
                    )}

                    {/* Animated Signal Traversal Pulses (Moving Left to Right) */}
                    {[
                      { inY: 45, hidY: 28, outY: 45, d1: "0s", d2: "0.9s" },
                      { inY: 90, hidY: 64, outY: 90, d1: "0.3s", d2: "1.2s" },
                      {
                        inY: 135,
                        hidY: 100,
                        outY: 135,
                        d1: "0.6s",
                        d2: "1.5s",
                      },
                      {
                        inY: 180,
                        hidY: 136,
                        outY: 180,
                        d1: "0.9s",
                        d2: "1.8s",
                      },
                      {
                        inY: 225,
                        hidY: 172,
                        outY: 225,
                        d1: "1.2s",
                        d2: "2.1s",
                      },
                    ].map((pulse) => (
                      <g key={`signal-pulse-${pulse.inY}-${pulse.hidY}`}>
                        {/* W1 pulse */}
                        <circle r="2.8" fill="#DE5D35">
                          <animateMotion
                            path={`M 80 ${pulse.inY} L 350 ${pulse.hidY}`}
                            dur="1.8s"
                            repeatCount="indefinite"
                            begin={pulse.d1}
                          />
                        </circle>
                        {/* W2 pulse */}
                        <circle r="2.8" fill="#1A1816">
                          <animateMotion
                            path={`M 350 ${pulse.hidY} L 620 ${pulse.outY}`}
                            dur="1.8s"
                            repeatCount="indefinite"
                            begin={pulse.d2}
                          />
                        </circle>
                      </g>
                    ))}

                    {/* Input Layer Nodes (5 nodes representing d=512) */}
                    {[45, 90, 135, 180, 225].map((y, i) => (
                      <g key={`in-node-${y}`}>
                        <circle
                          cx="80"
                          cy={y}
                          r="9"
                          fill="#1A1816"
                          stroke="#FAF9F5"
                          strokeWidth="1.5"
                        />
                        <text
                          x="80"
                          y={y + 3.5}
                          textAnchor="middle"
                          fill="#FAF9F5"
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          x{i + 1}
                        </text>
                      </g>
                    ))}

                    {/* Hidden Layer Nodes (13 nodes representing d_ff=2048) */}
                    {[
                      28, 46, 64, 82, 100, 118, 136, 154, 172, 190, 208, 226,
                      244,
                    ].map((y, i) => {
                      const isActive = i < numActiveNodes;
                      return (
                        <g key={`hid-node-${y}`}>
                          {isActive && (
                            <circle
                              cx="350"
                              cy={y}
                              r="11"
                              fill="none"
                              stroke="#DE5D35"
                              strokeWidth="1"
                              opacity="0.4"
                            />
                          )}
                          <circle
                            cx="350"
                            cy={y}
                            r="7.5"
                            fill={isActive ? "#DE5D35" : "#FAF9F5"}
                            stroke={
                              isActive ? "#DE5D35" : "rgba(26, 24, 22, 0.3)"
                            }
                            strokeWidth={isActive ? 2 : 1}
                            strokeDasharray={isActive ? "none" : "2 2"}
                          />
                          <text
                            x="350"
                            y={y + 3}
                            textAnchor="middle"
                            fill={isActive ? "#FAF9F5" : "#75716B"}
                            fontSize="6"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {isActive ? "1" : "0"}
                          </text>
                        </g>
                      );
                    })}

                    {/* Output Layer Nodes (5 nodes representing d=512) */}
                    {[45, 90, 135, 180, 225].map((y, i) => (
                      <g key={`out-node-${y}`}>
                        <circle
                          cx="620"
                          cy={y}
                          r="9"
                          fill="#1A1816"
                          stroke="#FAF9F5"
                          strokeWidth="1.5"
                        />
                        <text
                          x="620"
                          y={y + 3.5}
                          textAnchor="middle"
                          fill="#FAF9F5"
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          y{i + 1}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Live Readouts Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] text-[12px]">
                  <div>
                    <span className="text-[#75716B] block mb-0.5 text-[10px] uppercase">
                      DIMENSIONAL PROJECTION
                    </span>
                    <span className="font-bold text-[#1A1816]">
                      512 → 2048 → 512 (4×)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#75716B] block mb-0.5 text-[10px] uppercase">
                      ACTIVE NEURONS (FIRING)
                    </span>
                    <span className="font-bold text-[#DE5D35]">
                      {ffnActiveNeurons} / 2048 Neurons Active
                    </span>
                  </div>
                  <div>
                    <span className="text-[#75716B] block mb-0.5 text-[10px] uppercase">
                      {ffnActivation === "relu"
                        ? "RELU SPARSITY"
                        : "GELU ATTENUATION"}
                    </span>
                    <span className="font-bold text-[#1A1816]">
                      {ffnSparsityPct}% dead neurons
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 06: RESIDUAL CONNECTIONS & GRADIENT HIGHWAYS
              ────────────────────────────────────────────────────────────────── */}
          <section
            id="sec-06"
            className="mb-16 border-t border-[#1A1816]/15 pt-12 scroll-mt-24"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                06 / Stability &amp; Backprop
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Residual Connections &amp; Layer Normalization Gradient Highways
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                Without residual skip connections, gradients vanish
                exponentially in deep architectures. By formulating each
                sub-layer as <MathTex math="x + \mathrm{Sublayer}(x)" />, the
                gradient derivative contains an unbroken identity term{" "}
                <MathTex math="\frac{\partial L}{\partial x} = \frac{\partial L}{\partial y} \cdot \left(1 + \frac{\partial \mathrm{Sublayer}}{\partial x}\right)" />
                :
              </p>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] font-mono text-[13px] text-center my-4 overflow-x-auto">
                <MathTex
                  math="\mathrm{Output} = \mathrm{LayerNorm}\left(x + \mathrm{Sublayer}(x)\right) = \left[\frac{(x + \mathrm{Sublayer}(x)) - \mu}{\sqrt{\sigma^2 + \epsilon}}\right] \odot \gamma + \beta"
                  block
                />
              </div>

              {/* Interactive Residual Connection Comparison Studio */}
              <div className="p-5 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] mb-6 font-mono">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <span className="text-[11px] text-[#DE5D35] uppercase font-bold">
                    SIGNAL RETENTION THROUGH 6 DEEP LAYERS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setResidualEnabled(true)}
                      className={`px-3 py-1.5 rounded-[2px] text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                        residualEnabled
                          ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#1A1816]"
                      }`}
                    >
                      ✓ RESIDUAL SKIP ENABLED (x + Sublayer(x))
                    </button>
                    <button
                      type="button"
                      onClick={() => setResidualEnabled(false)}
                      className={`px-3 py-1.5 rounded-[2px] text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                        !residualEnabled
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      ✗ DISABLE (VANISHING GRADIENT)
                    </button>
                  </div>
                </div>

                {/* Layer Signal Propagation Bar Chart */}
                <div className="space-y-3">
                  {LAYERS.map((layer) => {
                    const signal = residualEnabled
                      ? Math.max(95, 100 - (layer - 1) * 0.8)
                      : Math.round(100 * 0.42 ** (layer - 1));

                    return (
                      <div
                        key={`layer-sig-${layer}`}
                        className="flex items-center gap-3 text-[12px]"
                      >
                        <span className="w-20 font-bold text-[#1A1816]">
                          LAYER {layer}:
                        </span>
                        <div className="grow bg-[#EFECE6] h-4 rounded-[2px] overflow-hidden relative">
                          <div
                            className={`h-full transition-all duration-500 ${
                              residualEnabled ? "bg-[#1A1816]" : "bg-[#DE5D35]"
                            }`}
                            style={{ width: `${signal}%` }}
                          />
                        </div>
                        <span
                          className={`w-16 text-right font-bold ${
                            residualEnabled
                              ? "text-[#1A1816]"
                              : "text-[#DE5D35]"
                          }`}
                        >
                          {signal}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] text-[11px] text-[#75716B]">
                  {residualEnabled ? (
                    <span className="text-[#1A1816] font-semibold">
                      ✓ Gradient Highway Active: Signal flows undiminished
                      across all 6 layers via the identity skip path.
                    </span>
                  ) : (
                    <span className="text-[#DE5D35] font-semibold">
                      ✗ Vanishing Gradient Failure: Without skip connections,
                      signal degrades by Layer 4 and vanishes completely by
                      Layer 6.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 07: THE ENCODER & DECODER TOWERS (6 ACTUAL LAYERS)
              ────────────────────────────────────────────────────────────────── */}
          {/* ──────────────────────────────────────────────────────────────────
              SECTION 07: THE ENCODER & DECODER TOWERS (6 ACTUAL LAYERS)
              ────────────────────────────────────────────────────────────────── */}
          <section
            id="sec-07"
            className="mb-16 border-t border-[#1A1816]/15 pt-12 scroll-mt-24"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                07 / Canonical Paper Architecture
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Transformer: Vaswani et al. (2017) Dual-Tower Blueprint
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                The authentic architecture from{" "}
                <em>&ldquo;Attention Is All You Need&rdquo;</em> (Vaswani et
                al., 2017) consists of an Encoder stack that creates rich
                contextual embeddings and an Autoregressive Decoder stack that
                consumes target prefix tokens and cross-attends into the encoder
                states:
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
                {/* Canonical Paper Architecture SVG Blueprint */}
                <div className="lg:col-span-7 flex justify-center p-4 sm:p-6 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] overflow-x-auto">
                  <svg
                    viewBox="0 0 520 680"
                    className="w-full min-w-[360px] max-w-[480px] h-auto"
                    style={{ fontFamily: "monospace" }}
                    role="img"
                    aria-label="Vaswani et al. 2017 Canonical Transformer Architecture Blueprint"
                  >
                    <title>
                      Vaswani et al. (2017) Canonical Transformer Architecture
                    </title>
                    <defs>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1A1816" />
                      </marker>
                      <marker
                        id="arrow-accent"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#DE5D35" />
                      </marker>
                    </defs>

                    {/* Output Probabilities */}
                    <rect
                      x="300"
                      y="10"
                      width="170"
                      height="26"
                      rx="2"
                      fill="#1A1816"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="27"
                      textAnchor="middle"
                      fill="#FAF9F5"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Output Probabilities
                    </text>
                    <line
                      x1="385"
                      y1="48"
                      x2="385"
                      y2="38"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Softmax */}
                    <rect
                      x="315"
                      y="48"
                      width="140"
                      height="26"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="65"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Softmax
                    </text>
                    <line
                      x1="385"
                      y1="86"
                      x2="385"
                      y2="76"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Linear */}
                    <rect
                      x="315"
                      y="86"
                      width="140"
                      height="26"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="103"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Linear Projection
                    </text>
                    <line
                      x1="385"
                      y1="126"
                      x2="385"
                      y2="114"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* ═══ ENCODER TOWER BOX (Nx = 6) ═══ */}
                    <rect
                      x="35"
                      y="160"
                      width="180"
                      height="330"
                      rx="3"
                      fill="#FAF9F5"
                      stroke={
                        selectedPaperLayer.startsWith("enc")
                          ? "#DE5D35"
                          : "#1A1816"
                      }
                      strokeWidth={
                        selectedPaperLayer.startsWith("enc") ? "2" : "1.5"
                      }
                      strokeDasharray="4 4"
                    />
                    <text
                      x="45"
                      y="180"
                      fill="#75716B"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ENCODER (Nx = 6)
                    </text>

                    {/* Encoder Add & Norm 2 */}
                    <rect
                      x="55"
                      y="195"
                      width="140"
                      height="26"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                    />
                    <text
                      x="125"
                      y="212"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Add &amp; Norm
                    </text>
                    <line
                      x1="125"
                      y1="235"
                      x2="125"
                      y2="223"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Encoder Feed Forward */}
                    <rect
                      x="55"
                      y="235"
                      width="140"
                      height="38"
                      rx="2"
                      fill={
                        selectedPaperLayer === "enc-ffn"
                          ? "rgba(222, 93, 53, 0.15)"
                          : "#F4F1EA"
                      }
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="125"
                      y="258"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Feed Forward
                    </text>
                    <line
                      x1="125"
                      y1="287"
                      x2="125"
                      y2="275"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Encoder Add & Norm 1 */}
                    <rect
                      x="55"
                      y="287"
                      width="140"
                      height="26"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                    />
                    <text
                      x="125"
                      y="304"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Add &amp; Norm
                    </text>
                    <line
                      x1="125"
                      y1="327"
                      x2="125"
                      y2="315"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Encoder Multi-Head Attention */}
                    <rect
                      x="55"
                      y="327"
                      width="140"
                      height="46"
                      rx="2"
                      fill={
                        selectedPaperLayer === "enc-self-attn"
                          ? "rgba(222, 93, 53, 0.15)"
                          : "#FAF9F5"
                      }
                      stroke="#1A1816"
                      strokeWidth="1.5"
                    />
                    <text
                      x="125"
                      y="348"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Multi-Head
                    </text>
                    <text
                      x="125"
                      y="363"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="10"
                    >
                      Attention
                    </text>

                    {/* Encoder Skip Connections (Residual Highways) */}
                    <path
                      d="M 45 405 L 45 300 L 53 300"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                      markerEnd="url(#arrow-accent)"
                    />
                    <path
                      d="M 45 280 L 45 208 L 53 208"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                      markerEnd="url(#arrow-accent)"
                    />

                    {/* Encoder Positional Addition */}
                    <line
                      x1="125"
                      y1="420"
                      x2="125"
                      y2="375"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    <circle
                      cx="125"
                      cy="432"
                      r="12"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="125"
                      y="436"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      +
                    </text>

                    {/* Positional Encoding (Left) */}
                    <path
                      d="M 22 432 L 111 432"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                      markerEnd="url(#arrow-accent)"
                    />
                    <rect
                      x="18"
                      y="442"
                      width="70"
                      height="20"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1"
                    />
                    <text
                      x="53"
                      y="455"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      Pos. Encoding
                    </text>

                    {/* Input Embedding & Input */}
                    <line
                      x1="125"
                      y1="490"
                      x2="125"
                      y2="446"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    <rect
                      x="55"
                      y="490"
                      width="140"
                      height="28"
                      rx="2"
                      fill="#EFECE6"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="125"
                      y="508"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Input Embedding
                    </text>
                    <line
                      x1="125"
                      y1="540"
                      x2="125"
                      y2="520"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    <rect
                      x="45"
                      y="540"
                      width="160"
                      height="30"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="125"
                      y="559"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Inputs
                    </text>

                    {/* ═══ CROSS-ATTENTION BRIDGE (Enc -> Dec) ═══ */}
                    {/* Path from top of Encoder to Decoder Cross Attention */}
                    <path
                      d="M 125 195 L 125 140 L 255 140 L 255 250 L 313 250"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="1.6"
                      strokeDasharray="4 3"
                      markerEnd="url(#arrow-accent)"
                    />
                    <rect
                      x="235"
                      y="180"
                      width="40"
                      height="18"
                      rx="2"
                      fill="#DE5D35"
                    />
                    <text
                      x="255"
                      y="193"
                      textAnchor="middle"
                      fill="#FAF9F5"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      K, V
                    </text>

                    {/* ═══ DECODER TOWER BOX (Nx = 6) ═══ */}
                    <rect
                      x="295"
                      y="126"
                      width="180"
                      height="364"
                      rx="3"
                      fill="#FAF9F5"
                      stroke={
                        selectedPaperLayer.startsWith("dec")
                          ? "#DE5D35"
                          : "#1A1816"
                      }
                      strokeWidth={
                        selectedPaperLayer.startsWith("dec") ? "2" : "1.5"
                      }
                      strokeDasharray="4 4"
                    />
                    <text
                      x="305"
                      y="146"
                      fill="#75716B"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      DECODER (Nx = 6)
                    </text>

                    {/* Decoder Add & Norm 3 */}
                    <rect
                      x="315"
                      y="156"
                      width="140"
                      height="26"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="173"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Add &amp; Norm
                    </text>
                    <line
                      x1="385"
                      y1="194"
                      x2="385"
                      y2="184"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Decoder Feed Forward */}
                    <rect
                      x="315"
                      y="194"
                      width="140"
                      height="36"
                      rx="2"
                      fill={
                        selectedPaperLayer === "dec-ffn"
                          ? "rgba(222, 93, 53, 0.15)"
                          : "#F4F1EA"
                      }
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="216"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Feed Forward
                    </text>
                    <line
                      x1="385"
                      y1="240"
                      x2="385"
                      y2="232"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Decoder Add & Norm 2 */}
                    <rect
                      x="315"
                      y="240"
                      width="140"
                      height="26"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="257"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Add &amp; Norm
                    </text>
                    <line
                      x1="385"
                      y1="278"
                      x2="385"
                      y2="268"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Decoder Cross-Attention (Multi-Head) */}
                    <rect
                      x="315"
                      y="278"
                      width="140"
                      height="46"
                      rx="2"
                      fill={
                        selectedPaperLayer === "dec-cross-attn"
                          ? "rgba(222, 93, 53, 0.15)"
                          : "#FAF9F5"
                      }
                      stroke="#DE5D35"
                      strokeWidth="1.5"
                    />
                    <text
                      x="385"
                      y="299"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Multi-Head
                    </text>
                    <text
                      x="385"
                      y="314"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="10"
                    >
                      Cross Attention
                    </text>
                    <line
                      x1="385"
                      y1="334"
                      x2="385"
                      y2="326"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Decoder Add & Norm 1 */}
                    <rect
                      x="315"
                      y="334"
                      width="140"
                      height="26"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="351"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Add &amp; Norm
                    </text>
                    <line
                      x1="385"
                      y1="372"
                      x2="385"
                      y2="362"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />

                    {/* Decoder Masked Multi-Head Attention */}
                    <rect
                      x="315"
                      y="372"
                      width="140"
                      height="46"
                      rx="2"
                      fill={
                        selectedPaperLayer === "dec-masked-attn"
                          ? "rgba(222, 93, 53, 0.15)"
                          : "#FAF9F5"
                      }
                      stroke="#1A1816"
                      strokeWidth="1.5"
                    />
                    <text
                      x="385"
                      y="393"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Masked Multi-Head
                    </text>
                    <text
                      x="385"
                      y="408"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="10"
                    >
                      Attention
                    </text>

                    {/* Decoder Skip Connections */}
                    <path
                      d="M 465 425 L 465 347 L 457 347"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                      markerEnd="url(#arrow-accent)"
                    />
                    <path
                      d="M 465 328 L 465 253 L 457 253"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                      markerEnd="url(#arrow-accent)"
                    />
                    <path
                      d="M 465 233 L 465 169 L 457 169"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                      markerEnd="url(#arrow-accent)"
                    />

                    {/* Decoder Positional Addition */}
                    <line
                      x1="385"
                      y1="420"
                      x2="385"
                      y2="420"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="385"
                      cy="432"
                      r="12"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="436"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      +
                    </text>

                    {/* Positional Encoding (Right) */}
                    <path
                      d="M 488 432 L 399 432"
                      stroke="#DE5D35"
                      strokeWidth="1.2"
                      markerEnd="url(#arrow-accent)"
                    />
                    <rect
                      x="428"
                      y="442"
                      width="70"
                      height="20"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1"
                    />
                    <text
                      x="463"
                      y="455"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      Pos. Encoding
                    </text>

                    {/* Output Embedding & Output */}
                    <line
                      x1="385"
                      y1="490"
                      x2="385"
                      y2="446"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    <rect
                      x="315"
                      y="490"
                      width="140"
                      height="28"
                      rx="2"
                      fill="#EFECE6"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="508"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Output Embedding
                    </text>
                    <line
                      x1="385"
                      y1="540"
                      x2="385"
                      y2="520"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    <rect
                      x="295"
                      y="540"
                      width="180"
                      height="30"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <text
                      x="385"
                      y="559"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Outputs (shifted right)
                    </text>
                  </svg>
                </div>

                {/* Interactive Layer Breakdown & Inspector */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="font-mono text-[11px] font-bold text-[#DE5D35] uppercase tracking-wider mb-2">
                    INTERACTIVE LAYER INSPECTOR
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {PAPER_LAYERS.map((layer) => (
                      <button
                        type="button"
                        key={layer.id}
                        onClick={() => setSelectedPaperLayer(layer.id)}
                        className={`px-2.5 py-1.5 rounded-[2px] font-mono text-[10px] sm:text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                          selectedPaperLayer === layer.id
                            ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                            : "bg-[#FAF9F5] border-[#1A1816]/15 text-[#1A1816] hover:border-[#1A1816]"
                        }`}
                      >
                        {layer.name.split(" ")[0]} {layer.name.split(" ")[1]}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const active =
                      PAPER_LAYERS.find((l) => l.id === selectedPaperLayer) ||
                      PAPER_LAYERS[0];
                    return (
                      <div className="p-4 sm:p-5 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px]">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] font-bold text-[#DE5D35] px-2 py-0.5 rounded-[2px] bg-[#DE5D35]/10 border border-[#DE5D35]/20 uppercase">
                            {active.tower} TOWER
                          </span>
                          <span className="font-mono text-[10px] text-[#75716B]">
                            {active.shape}
                          </span>
                        </div>

                        <h3 className="font-bold text-[15px] text-[#1A1816] mb-3">
                          {active.name}
                        </h3>

                        <div className="py-2.5 px-3 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] overflow-x-auto mb-3 scrollbar-thin">
                          <div className="min-w-max text-[12px]">
                            <MathTex math={active.formula} block />
                          </div>
                        </div>

                        <p className="text-[13px] text-[#4A4742] leading-[1.6]">
                          {active.explanation}
                        </p>
                      </div>
                    );
                  })()}

                  <div className="p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] text-[12px] text-[#4A4742] space-y-2">
                    <div className="font-mono font-bold text-[11px] text-[#1A1816] uppercase">
                      Hyperparameters (Base Vaswani Model)
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>
                        • Layers:{" "}
                        <span className="font-bold text-[#1A1816]">N = 6</span>
                      </div>
                      <div>
                        • d_model:{" "}
                        <span className="font-bold text-[#1A1816]">512</span>
                      </div>
                      <div>
                        • Heads:{" "}
                        <span className="font-bold text-[#1A1816]">h = 8</span>
                      </div>
                      <div>
                        • d_k = d_v:{" "}
                        <span className="font-bold text-[#1A1816]">64</span>
                      </div>
                      <div>
                        • d_ff:{" "}
                        <span className="font-bold text-[#1A1816]">2048</span>
                      </div>
                      <div>
                        • Vocab:{" "}
                        <span className="font-bold text-[#1A1816]">37,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 08: AUTOREGRESSIVE NATURE & CAUSAL MASKING
              ────────────────────────────────────────────────────────────────── */}
          {/* ──────────────────────────────────────────────────────────────────
              SECTION 08: AUTOREGRESSIVE NATURE & CAUSAL MASKING
              ────────────────────────────────────────────────────────────────── */}
          <section
            id="sec-08"
            className="mb-16 border-t border-[#1A1816]/15 pt-12 scroll-mt-24"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                08 / Generation Dynamics &amp; Memory
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Attention Matrix, Causal Masking &amp; Incremental KV Cache
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                In autoregressive generation, each token attends only to prior
                positions. Naive inference re-computes all previous
                representations at each step in <MathTex math="O(N^2)" /> time.
                The <strong>KV Cache</strong> eliminates redundant projections
                by storing past Key and Value matrices in GPU VRAM, turning each
                decoding step into an <MathTex math="O(N)" /> operation:
              </p>

              {/* Step By Step Generation Box */}
              <div className="p-5 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] mb-6 font-mono">
                <div className="text-[11px] text-[#DE5D35] uppercase font-bold mb-4 flex justify-between items-center">
                  <span>AUTOREGRESSIVE GENERATION SEQUENCE</span>
                  <span>
                    STEP {decoderStep + 1} OF {AR_SEQUENCE.length}
                  </span>
                </div>

                {/* Steps Navigator */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {AR_SEQUENCE.map((step) => (
                    <button
                      type="button"
                      key={step.stepId}
                      onClick={() => setDecoderStep(step.stepIdx)}
                      className={`px-3 py-1.5 rounded-[2px] text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                        decoderStep === step.stepIdx
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#1A1816]"
                      }`}
                    >
                      Step {step.stepIdx + 1}: &ldquo;{step.token}&rdquo;
                    </button>
                  ))}
                </div>

                {/* Context Window & Next Token Probabilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px]">
                    <div className="text-[10px] text-[#75716B] uppercase mb-2">
                      Context Window (Input to Decoder)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AR_SEQUENCE.slice(0, decoderStep + 1).map((s) => (
                        <span
                          key={`ctx-tok-${s.stepId}`}
                          className="px-2.5 py-1 bg-[#FAF9F5] border border-[#1A1816]/20 text-[12px] font-bold text-[#1A1816] rounded-[2px]"
                        >
                          {s.token}
                        </span>
                      ))}
                      <span className="px-2.5 py-1 bg-[#DE5D35]/10 border border-[#DE5D35] text-[#DE5D35] text-[12px] font-bold rounded-[2px]">
                        ? &rarr; Next Token
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px]">
                    <div className="text-[10px] text-[#75716B] uppercase mb-2">
                      Top Softmax Predictions
                    </div>
                    <div className="space-y-1.5 text-[12px]">
                      {AR_SEQUENCE[decoderStep].logits.map((l) => (
                        <div
                          key={`pred-word-${l.word}`}
                          className="flex justify-between items-center py-0.5 border-b border-[#1A1816]/5"
                        >
                          <span className="font-semibold text-[#1A1816]">
                            &ldquo;{l.word}&rdquo;
                          </span>
                          <span className="text-[#DE5D35] font-bold">
                            {l.p}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── INTERACTIVE ATTENTION MATRIX, CAUSAL MASK & KV CACHE STUDIO ── */}
              <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5 sm:p-6 rounded-[2px]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1816]/10 pb-4 mb-5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1816]">
                      ATTENTION MATRIX, CAUSAL MASK &amp; KV CACHE STUDIO
                    </span>
                  </div>

                  {/* Mode Navigation Tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSec08Tab("attention")}
                      className={`px-3 py-1 rounded-[2px] text-[10px] sm:text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                        sec08Tab === "attention"
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      QK^T Attention Matrix
                    </button>
                    <button
                      type="button"
                      onClick={() => setSec08Tab("masking")}
                      className={`px-3 py-1 rounded-[2px] text-[10px] sm:text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                        sec08Tab === "masking"
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      KQ Causal Mask (-∞)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSec08Tab("kvcache")}
                      className={`px-3 py-1 rounded-[2px] text-[10px] sm:text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                        sec08Tab === "kvcache"
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      KV Cache Simulator
                    </button>
                  </div>
                </div>

                {/* ── TAB 1: QK^T ATTENTION MATRIX ── */}
                {sec08Tab === "attention" && (
                  <div className="space-y-6">
                    <p className="text-[13px] text-[#4A4742] leading-[1.6]">
                      Click any cell <MathTex math="(i, j)" /> in the 5×5
                      attention matrix to inspect how Query token{" "}
                      <MathTex math="q_i" /> takes the dot-product with Key
                      token <MathTex math="k_j" />, scales by{" "}
                      <MathTex math="1/\sqrt{d_k}" /> (
                      <MathTex math="1/\sqrt{64} = 1/8" />
                      ), and produces the final softmax attention weight:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* 5x5 Matrix Display */}
                      <div className="lg:col-span-7 bg-[#F4F1EA] p-3 sm:p-5 border border-[#1A1816]/10 rounded-[2px] overflow-x-auto">
                        <div className="min-w-[320px]">
                          {/* Column Headers (Keys) */}
                          <div className="grid grid-cols-6 gap-1 mb-1 font-mono text-[10px] text-center">
                            <div className="text-[#75716B] text-[9px] uppercase flex items-center justify-center font-bold">
                              Q \ K
                            </div>
                            {ATTN_TOKENS.map((kTok, ki) => (
                              <div
                                key={`col-hdr-${kTok}`}
                                className={`p-1 font-bold truncate rounded-[2px] ${
                                  selectedMatrixCell.col === ki
                                    ? "bg-[#DE5D35] text-[#FAF9F5]"
                                    : "text-[#1A1816]"
                                }`}
                              >
                                {kTok}
                              </div>
                            ))}
                          </div>

                          {/* Matrix Rows (Queries) */}
                          {ATTN_TOKENS.map((qTok, ri) => (
                            <div
                              key={`row-${qTok}`}
                              className="grid grid-cols-6 gap-1 mb-1 font-mono"
                            >
                              {/* Row Header */}
                              <div
                                className={`p-1.5 text-[10px] font-bold truncate rounded-[2px] flex items-center justify-center ${
                                  selectedMatrixCell.row === ri
                                    ? "bg-[#DE5D35] text-[#FAF9F5]"
                                    : "text-[#1A1816]"
                                }`}
                              >
                                {qTok}
                              </div>

                              {/* Matrix Cells */}
                              {ATTN_TOKENS.map((kTok, ci) => {
                                const isSelected =
                                  selectedMatrixCell.row === ri &&
                                  selectedMatrixCell.col === ci;
                                const weight = attentionMatrix[ri][ci];
                                const isLockedOut =
                                  isCausalMaskActive && ci > ri;

                                return (
                                  <button
                                    type="button"
                                    key={`cell-${qTok}-${kTok}`}
                                    onClick={() =>
                                      setSelectedMatrixCell({
                                        row: ri,
                                        col: ci,
                                      })
                                    }
                                    className={`p-2 rounded-[2px] border text-center transition-all cursor-pointer relative min-h-[44px] flex flex-col items-center justify-center ${
                                      isSelected
                                        ? "ring-2 ring-[#DE5D35] border-[#DE5D35] z-10"
                                        : "border-[#1A1816]/15 hover:border-[#1A1816]"
                                    } ${
                                      isLockedOut
                                        ? "bg-[#FAF9F5] text-[#DE5D35]"
                                        : "text-[#1A1816]"
                                    }`}
                                    style={{
                                      backgroundColor: isLockedOut
                                        ? "#FAF9F5"
                                        : `rgba(222, 93, 53, ${Math.max(0.04, weight * 0.85)})`,
                                    }}
                                  >
                                    <span className="text-[10px] font-bold">
                                      {isLockedOut
                                        ? "-∞"
                                        : `${(weight * 100).toFixed(0)}%`}
                                    </span>
                                    <span className="text-[8px] opacity-75">
                                      {isLockedOut
                                        ? "mask"
                                        : SCALED_QK_SCORES[ri][ci].toFixed(1)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cell Inspector Details */}
                      <div className="lg:col-span-5 p-4 sm:p-5 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] space-y-3 font-mono">
                        <div className="flex items-center justify-between border-b border-[#1A1816]/10 pb-2">
                          <span className="text-[11px] font-bold text-[#DE5D35] uppercase">
                            CELL ({selectedMatrixCell.row},{" "}
                            {selectedMatrixCell.col}) BREAKDOWN
                          </span>
                          <span className="text-[10px] text-[#75716B]">
                            {isCausalMaskActive &&
                            selectedMatrixCell.col > selectedMatrixCell.row
                              ? "CAUSALLY MASKED"
                              : "ACTIVE ATTENTION"}
                          </span>
                        </div>

                        <div className="space-y-2 text-[12px]">
                          <div className="flex justify-between py-1 border-b border-[#1A1816]/5">
                            <span className="text-[#75716B]">
                              Query Token (i):
                            </span>
                            <span className="font-bold text-[#1A1816]">
                              &ldquo;{ATTN_TOKENS[selectedMatrixCell.row]}
                              &rdquo; (row {selectedMatrixCell.row})
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#1A1816]/5">
                            <span className="text-[#75716B]">
                              Key Token (j):
                            </span>
                            <span className="font-bold text-[#1A1816]">
                              &ldquo;{ATTN_TOKENS[selectedMatrixCell.col]}
                              &rdquo; (col {selectedMatrixCell.col})
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#1A1816]/5">
                            <span className="text-[#75716B]">
                              Raw Dot Product <MathTex math="q_i \cdot k_j" />:
                            </span>
                            <span className="font-bold text-[#1A1816]">
                              {RAW_QK_SCORES[selectedMatrixCell.row][
                                selectedMatrixCell.col
                              ].toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#1A1816]/5">
                            <span className="text-[#75716B]">
                              Scale Factor{" "}
                              <MathTex math="\sqrt{d_k} = \sqrt{64}" />:
                            </span>
                            <span className="font-bold text-[#1A1816]">
                              8.0
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#1A1816]/5">
                            <span className="text-[#75716B]">
                              Scaled Score{" "}
                              <MathTex math="S_{ij} / \sqrt{d_k}" />:
                            </span>
                            <span className="font-bold text-[#DE5D35]">
                              {isCausalMaskActive &&
                              selectedMatrixCell.col > selectedMatrixCell.row
                                ? "-∞ (Locked Out)"
                                : SCALED_QK_SCORES[selectedMatrixCell.row][
                                    selectedMatrixCell.col
                                  ].toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 bg-[#F4F1EA] px-2.5 rounded-[2px]">
                            <span className="font-bold text-[#1A1816]">
                              Softmax Weight <MathTex math="A_{ij}" />:
                            </span>
                            <span className="font-bold text-[#DE5D35] text-[13px]">
                              {(
                                attentionMatrix[selectedMatrixCell.row][
                                  selectedMatrixCell.col
                                ] * 100
                              ).toFixed(2)}
                              %
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#75716B] leading-relaxed pt-2 font-sans">
                          {isCausalMaskActive &&
                          selectedMatrixCell.col > selectedMatrixCell.row
                            ? "Position j > i is in the future. The causal mask forces this entry to -∞, guaranteeing exp(-∞) = 0 so no gradient or information leaks backwards."
                            : `Token "${ATTN_TOKENS[selectedMatrixCell.row]}" directs ${(attentionMatrix[selectedMatrixCell.row][selectedMatrixCell.col] * 100).toFixed(1)}% of its attention context towards "${ATTN_TOKENS[selectedMatrixCell.col]}".`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: KQ CAUSAL MASKING ── */}
                {sec08Tab === "masking" && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] font-mono">
                      <div>
                        <div className="font-bold text-[12px] text-[#1A1816] uppercase">
                          Causal Lookahead Mask Status
                        </div>
                        <div className="text-[11px] text-[#75716B]">
                          {isCausalMaskActive
                            ? "Strict Decoder Causality (Upper triangle set to -∞)"
                            : "Bidirectional Attention (All tokens attend freely)"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCausalMaskActive((prev) => !prev)}
                        className={`px-4 py-2 rounded-[2px] text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                          isCausalMaskActive
                            ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                            : "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816]"
                        }`}
                      >
                        {isCausalMaskActive
                          ? "✓ Causal Mask Active"
                          : "Unmasked (Encoder Mode)"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center font-mono">
                      {/* Mask Matrix Visualizer */}
                      <div className="p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px]">
                        <div className="text-[10px] text-[#75716B] uppercase mb-3 text-center font-bold">
                          Mask Matrix M ∈ ℝ^{"{5×5}"}
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 max-w-xs mx-auto">
                          {CAUSAL_MASK_CELLS.map((cell) => {
                            const isAllowed =
                              !isCausalMaskActive || cell.isAllowed;
                            return (
                              <div
                                key={cell.id}
                                className={`p-2 rounded-[2px] border text-center text-[10px] font-bold min-h-[34px] flex items-center justify-center transition-all ${
                                  isAllowed
                                    ? "bg-[#1A1816] border-[#1A1816] text-[#FAF9F5]"
                                    : "bg-[#FAF9F5] border-[#DE5D35] text-[#DE5D35]"
                                }`}
                              >
                                {isAllowed ? "0" : "-∞"}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mathematical Explanation */}
                      <div className="space-y-3 text-[13px] text-[#4A4742]">
                        <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px]">
                          <span className="font-mono text-[10px] font-bold text-[#DE5D35] uppercase block mb-1">
                            Additive Mask Formulation
                          </span>
                          <div className="py-1">
                            <MathTex
                              math="M_{ij} = \begin{cases} 0 & j \le i \\ -\infty & j > i \end{cases}"
                              block
                            />
                          </div>
                        </div>

                        <p className="leading-relaxed">
                          By adding matrix <MathTex math="M" /> directly inside
                          the softmax before exponentiation, values at{" "}
                          <MathTex math="j > i" /> evaluate to{" "}
                          <MathTex math="\exp(-\infty) = 0" />:
                        </p>
                        <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px]">
                          <MathTex
                            math="\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{QK^T}{\sqrt{d_k}} + M\right)V"
                            block
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: KV CACHE SIMULATOR ── */}
                {sec08Tab === "kvcache" && (
                  <div className="space-y-6">
                    <p className="text-[13px] text-[#4A4742] leading-[1.6]">
                      Without a KV Cache, generating token <MathTex math="t" />{" "}
                      forces the model to re-project and re-attend over all{" "}
                      <MathTex math="t-1" /> previous tokens, incurring
                      quadratic <MathTex math="O(N^2)" /> latency. With the KV
                      Cache, previous Key and Value tensors are retained in GPU
                      memory, requiring only the current token&apos;s query{" "}
                      <MathTex math="q_t" />:
                    </p>

                    {/* KV Cache Stepper Navigation */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#1A1816] uppercase">
                          KV CACHE STEP:
                        </span>
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#DE5D35] text-[#FAF9F5] text-[11px] font-bold">
                          Step {kvStepIdx} ({KV_CACHE_STEPS[kvStepIdx].token})
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setKvStepIdx((prev) => Math.max(0, prev - 1))
                          }
                          disabled={kvStepIdx === 0}
                          className="px-3 py-1 bg-[#FAF9F5] border border-[#1A1816]/20 text-[#1A1816] text-[11px] font-bold rounded-[2px] hover:border-[#DE5D35] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                          ◀ Prev
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setKvStepIdx((prev) =>
                              Math.min(KV_CACHE_STEPS.length - 1, prev + 1),
                            )
                          }
                          disabled={kvStepIdx === KV_CACHE_STEPS.length - 1}
                          className="px-3 py-1 bg-[#DE5D35] text-[#FAF9F5] border border-[#DE5D35] text-[11px] font-bold rounded-[2px] hover:bg-[#1A1816] hover:border-[#1A1816] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Next Step ▶
                        </button>
                        <button
                          type="button"
                          onClick={() => setKvStepIdx(0)}
                          className="px-3 py-1 bg-[#FAF9F5] border border-[#1A1816]/20 text-[#75716B] text-[11px] font-bold rounded-[2px] hover:text-[#1A1816] cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Step Description */}
                    <div className="p-3 bg-[#FAF9F5] border border-[#DE5D35]/30 rounded-[2px] font-mono text-[12px] text-[#1A1816]">
                      <span className="font-bold text-[#DE5D35] mr-2">
                        PHASE:
                      </span>
                      {KV_CACHE_STEPS[kvStepIdx].desc}
                    </div>

                    {/* KV Cache Matrix Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-mono">
                      {/* Stored Keys Cache */}
                      <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px]">
                        <div className="flex items-center justify-between mb-3 border-b border-[#1A1816]/10 pb-2">
                          <span className="text-[11px] font-bold text-[#DE5D35] uppercase">
                            KEY CACHE (K_cache ∈ ℝ^{"{t × d_k}"})
                          </span>
                          <span className="text-[10px] text-[#75716B]">
                            {KV_CACHE_STEPS[kvStepIdx].keysStored.length}{" "}
                            VECTORS STORED
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {KV_CACHE_STEPS[kvStepIdx].keysStored.map(
                            (kEntry, ki) => {
                              const isNew =
                                ki ===
                                  KV_CACHE_STEPS[kvStepIdx].keysStored.length -
                                    1 && !KV_CACHE_STEPS[kvStepIdx].prompt;
                              return (
                                <div
                                  key={kEntry}
                                  className={`flex items-center justify-between p-2 rounded-[2px] text-[11px] border ${
                                    isNew
                                      ? "bg-[#DE5D35]/10 border-[#DE5D35] text-[#1A1816] font-bold"
                                      : "bg-[#F4F1EA] border-[#1A1816]/10 text-[#4A4742]"
                                  }`}
                                >
                                  <span>{kEntry}</span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded-[2px] font-bold ${
                                      isNew
                                        ? "bg-[#DE5D35] text-[#FAF9F5]"
                                        : "bg-[#1A1816]/10 text-[#75716B]"
                                    }`}
                                  >
                                    {isNew ? "NEW STEP" : "CACHED (0 FLOPs)"}
                                  </span>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>

                      {/* Stored Values Cache */}
                      <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px]">
                        <div className="flex items-center justify-between mb-3 border-b border-[#1A1816]/10 pb-2">
                          <span className="text-[11px] font-bold text-[#DE5D35] uppercase">
                            VALUE CACHE (V_cache ∈ ℝ^{"{t × d_v}"})
                          </span>
                          <span className="text-[10px] text-[#75716B]">
                            {KV_CACHE_STEPS[kvStepIdx].valuesStored.length}{" "}
                            VECTORS STORED
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {KV_CACHE_STEPS[kvStepIdx].valuesStored.map(
                            (vEntry, vi) => {
                              const isNew =
                                vi ===
                                  KV_CACHE_STEPS[kvStepIdx].valuesStored
                                    .length -
                                    1 && !KV_CACHE_STEPS[kvStepIdx].prompt;
                              return (
                                <div
                                  key={vEntry}
                                  className={`flex items-center justify-between p-2 rounded-[2px] text-[11px] border ${
                                    isNew
                                      ? "bg-[#DE5D35]/10 border-[#DE5D35] text-[#1A1816] font-bold"
                                      : "bg-[#F4F1EA] border-[#1A1816]/10 text-[#4A4742]"
                                  }`}
                                >
                                  <span>{vEntry}</span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded-[2px] font-bold ${
                                      isNew
                                        ? "bg-[#DE5D35] text-[#FAF9F5]"
                                        : "bg-[#1A1816]/10 text-[#75716B]"
                                    }`}
                                  >
                                    {isNew ? "NEW STEP" : "CACHED (0 FLOPs)"}
                                  </span>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Efficiency Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                      <div className="p-3 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] text-center">
                        <span className="text-[10px] text-[#75716B] uppercase block mb-1">
                          Cached Compute / Step
                        </span>
                        <span className="text-[18px] font-bold text-[#DE5D35]">
                          {KV_CACHE_STEPS[kvStepIdx].flopsCached} FLOPs
                        </span>
                        <span className="text-[9px] text-[#75716B] block mt-0.5">
                          O(t) Linear
                        </span>
                      </div>

                      <div className="p-3 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] text-center">
                        <span className="text-[10px] text-[#75716B] uppercase block mb-1">
                          Without KV Cache
                        </span>
                        <span className="text-[18px] font-bold text-[#1A1816] line-through">
                          {KV_CACHE_STEPS[kvStepIdx].flopsUncached} FLOPs
                        </span>
                        <span className="text-[9px] text-[#75716B] block mt-0.5">
                          O(t²) Quadratic
                        </span>
                      </div>

                      <div className="p-3 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] text-center">
                        <span className="text-[10px] text-[#75716B] uppercase block mb-1">
                          Compute Speedup
                        </span>
                        <span className="text-[18px] font-bold text-[#DE5D35]">
                          {(
                            (1 -
                              KV_CACHE_STEPS[kvStepIdx].flopsCached /
                                KV_CACHE_STEPS[kvStepIdx].flopsUncached) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                        <span className="text-[9px] text-[#75716B] block mt-0.5">
                          FLOPs Eliminated
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────────────
              SECTION 09: FINAL LINEAR PROJECTION & SOFTMAX SAMPLING STUDIO
              ────────────────────────────────────────────────────────────────── */}
          <section
            id="sec-09"
            className="mb-16 border-t border-[#1A1816]/15 pt-12 scroll-mt-24"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                09 / Output Head
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Final Linear Projection, Softmax Probabilities &amp; Temperature
              </h2>
            </div>

            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-6 sm:p-8 rounded-[2px] mb-8">
              <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-6">
                The top decoder output vector{" "}
                <MathTex math="h_{final} \in \mathbb{R}^{d_{model}}" /> is
                projected by a final linear weight matrix{" "}
                <MathTex math="W_v \in \mathbb{R}^{d_{model} \times |V|}" />{" "}
                into raw vocabulary logits{" "}
                <MathTex math="z \in \mathbb{R}^{|V|}" />. A calibrated softmax
                with{" "}
                <strong>
                  Temperature (<MathTex math="T" />)
                </strong>{" "}
                converts logits into normalized probability distribution{" "}
                <MathTex math="P(w_i)" />:
              </p>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] font-mono text-[13px] text-center my-4 overflow-x-auto">
                <MathTex
                  math="P(w_i) = \frac{\exp\left(z_i / T\right)}{\sum_{j=1}^{|V|} \exp\left(z_j / T\right)}"
                  block
                />
              </div>

              {/* Interactive Softmax Temperature Studio Box */}
              <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5 rounded-[2px] font-mono text-[#1A1816] mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-[#1A1816]/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
                    <span className="text-[11px] text-[#1A1816] font-bold uppercase">
                      INTERACTIVE SOFTMAX TEMPERATURE &amp; TOP-K STUDIO
                    </span>
                  </div>
                  {/* Sampling Method Radio Buttons */}
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSamplingMethod("temperature")}
                      className={`px-3 py-1 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        samplingMethod === "temperature"
                          ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#1A1816]"
                      }`}
                    >
                      Temperature (T)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSamplingMethod("topk")}
                      className={`px-3 py-1 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        samplingMethod === "topk"
                          ? "bg-[#DE5D35] text-[#FAF9F5] border-[#DE5D35]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#DE5D35]"
                      }`}
                    >
                      Top-K Truncation
                    </button>
                    <button
                      type="button"
                      onClick={() => setSamplingMethod("greedy")}
                      className={`px-3 py-1 rounded-[2px] border font-bold transition-all cursor-pointer ${
                        samplingMethod === "greedy"
                          ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816]"
                          : "bg-[#FAF9F5] border-[#1A1816]/20 text-[#1A1816] hover:border-[#1A1816]"
                      }`}
                    >
                      Greedy (ArgMax)
                    </button>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px]">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-[11px]">
                      <span className="text-[#75716B]">TEMPERATURE (T):</span>
                      <span className="text-[#DE5D35] font-bold">
                        {temperature.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full accent-[#DE5D35] cursor-pointer touch-none"
                      aria-label="Temperature"
                    />
                    <div className="flex justify-between text-[9px] text-[#75716B] mt-1">
                      <span>0.1 (Greedy / Deterministic)</span>
                      <span>1.0 (Standard)</span>
                      <span>2.0 (High Entropy / Creative)</span>
                    </div>
                  </div>

                  {samplingMethod === "topk" && (
                    <div>
                      <div className="flex justify-between items-center mb-1 text-[11px]">
                        <span className="text-[#75716B]">TOP-K CUTOFF:</span>
                        <span className="text-[#DE5D35] font-bold">
                          K = {topK}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="1"
                        value={topK}
                        onChange={(e) => setTopK(Number(e.target.value))}
                        className="w-full accent-[#DE5D35] cursor-pointer touch-none"
                        aria-label="Top-K Cutoff"
                      />
                      <div className="flex justify-between text-[9px] text-[#75716B] mt-1">
                        <span>K=1 (Only #1 token)</span>
                        <span>K=5 (Top 5 tokens)</span>
                        <span>K=8 (All tokens)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Softmax Probabilities Bar Chart */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[10px] text-[#75716B] uppercase border-b border-[#1A1816]/10 pb-1">
                    <span>CANDIDATE TOKEN (LOGIT z_i)</span>
                    <span>SOFTMAX PROBABILITY P(w_i)</span>
                  </div>

                  {softmaxProbabilities.map((item, i) => (
                    <div
                      key={`soft-item-${item.word}`}
                      className={`flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[12px] p-1.5 sm:p-0 rounded-[2px] ${
                        item.isFilteredOut ? "opacity-35" : "opacity-100"
                      }`}
                    >
                      <div className="w-full sm:w-36 flex items-center justify-between text-left shrink-0">
                        <span className="font-bold text-[#1A1816] truncate max-w-[130px] sm:max-w-none">
                          &ldquo;{item.word}&rdquo;
                        </span>
                        <span className="text-[10px] text-[#75716B] ml-1">
                          (z={item.logit})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 grow w-full">
                        <div className="grow bg-[#EFECE6] h-3.5 sm:h-4 rounded-[2px] overflow-hidden relative">
                          <div
                            className={`h-full transition-all duration-200 ${
                              item.isFilteredOut
                                ? "bg-[#1A1816]/10"
                                : i === 0
                                  ? "bg-[#DE5D35]"
                                  : "bg-[#1A1816]"
                            }`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>

                        <span
                          className={`w-12 sm:w-14 text-right font-bold text-[11px] sm:text-[12px] shrink-0 ${
                            item.isFilteredOut
                              ? "text-[#75716B] line-through"
                              : i === 0
                                ? "text-[#DE5D35]"
                                : "text-[#1A1816]"
                          }`}
                        >
                          {item.isFilteredOut ? "CUT" : `${item.percent}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-[#4A4742] p-3 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px]">
                  💡 Notice: Lowering temperature to{" "}
                  <span className="text-[#DE5D35] font-bold">T=0.2</span>{" "}
                  collapses entropy onto the highest logit
                  (&ldquo;transduction&rdquo;), while raising to{" "}
                  <span className="text-[#1A1816] font-bold">T=1.8</span>{" "}
                  flattens the distribution across all candidates.
                </div>
              </div>
            </div>
          </section>

          {/* Reference Citation */}
          <footer className="border-t border-[#1A1816]/15 pt-8 text-[13px] font-mono text-[#75716B]">
            <p className="mb-2">
              <strong>Primary Reference:</strong> Vaswani, A., Shazeer, N.,
              Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł.,
              &amp; Polosukhin, I. (2017). <em>Attention Is All You Need</em>.
              Advances in Neural Information Processing Systems (NeurIPS 2017).
            </p>
            <p>AI Society — Bennett University Research Curriculum Archive.</p>
          </footer>
        </div>
      </main>
    </FoldLayout>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";

interface ArticleMeta {
  index: string;
  slug: string;
  category:
    | "REGRESSION"
    | "CLASSIFICATION"
    | "EVALUATION"
    | "VALIDATION"
    | "TREE ENSEMBLES"
    | "DEEP LEARNING"
    | "ENSEMBLE LEARNING"
    | "FOUNDATIONS"
    | "FAIRNESS"
    | "SEQUENTIAL";
  title: string;
  subtitle: string;
  readTime: string;
  date: string;
  author: string;
  status: "PUBLISHED" | "UPCOMING";
  featured?: boolean;
}

const PUBLISHED_ARTICLES: ArticleMeta[] = [
  {
    index: "01",
    slug: "linear-regression",
    category: "REGRESSION",
    title: "Linear Regression: Ordinary Least Squares",
    subtitle:
      "Minimizing orthogonal Euclidean residuals in parameter space. Closed-form normal equations versus iterative gradient descent steps.",
    readTime: "6 min read",
    date: "February 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "02",
    slug: "logistic-regression",
    category: "CLASSIFICATION",
    title: "Logistic Regression & The Sigmoid Curve",
    subtitle:
      "Projecting continuous feature combinations onto calibrated probability bounds. Analyzing logit slopes, odds ratios, and linear decision boundaries.",
    readTime: "7 min read",
    date: "March 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "03",
    slug: "precision-recall",
    category: "EVALUATION",
    title: "Confusion Matrix, Precision-Recall & F1",
    subtitle:
      "Navigating severe class imbalance where baseline accuracy fails. Harmonic balance between false positive alarms, missed detections, and F1 optimization.",
    readTime: "9 min read",
    date: "January 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "04",
    slug: "roc-auc",
    category: "EVALUATION",
    title: "ROC & AUC: Diagnostic Power",
    subtitle:
      "Mapping the sensitivity vs. specificity tradeoff across continuous decision thresholds with confusion matrix projections and integral AUC estimation.",
    readTime: "8 min read",
    date: "April 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "05",
    slug: "cross-validation",
    category: "VALIDATION",
    title: "K-Fold Partitioning & Generalization",
    subtitle:
      "Mitigating sample bias and estimating performance variance through rotational holdout splits and out-of-fold validation.",
    readTime: "7 min read",
    date: "December 2023",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "06",
    slug: "decision-trees",
    category: "TREE ENSEMBLES",
    title: "Decision Trees & Random Forests",
    subtitle:
      "Recursive feature space partitioning, Gini impurity minimization, and bootstrap aggregation (bagging) with random feature sub-sampling to suppress variance.",
    readTime: "10 min read",
    date: "June 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "07",
    slug: "neural-networks",
    category: "DEEP LEARNING",
    title: "Neural Networks: A Visual Introduction",
    subtitle:
      "Constructing feed-forward computational graphs from first principles: layer activations, synaptic weights, Adam optimization, and live backpropagation feedback loops.",
    readTime: "15 min read",
    date: "May 2024",
    author: "AIS Research Cohort",
    featured: true,
    status: "PUBLISHED",
  },
  {
    index: "08",
    slug: "convolutional-networks",
    category: "DEEP LEARNING",
    title: "Convolutional Neural Networks (CNNs)",
    subtitle:
      "Spatial receptive fields, 2D discrete convolution kernels, hierarchical feature maps, and spatial invariance through pooling layers.",
    readTime: "12 min read",
    date: "July 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "09",
    slug: "recurrent-networks",
    category: "DEEP LEARNING",
    title: "Recurrent Networks (RNNs, LSTMs & Sequence Models)",
    subtitle:
      "Sequential temporal dynamics, Backpropagation Through Time (BPTT), vanishing gradients, LSTM memory gates, and Transformer self-attention.",
    readTime: "14 min read",
    date: "August 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "10",
    slug: "random-forest",
    category: "ENSEMBLE LEARNING",
    title: "The Random Forest Algorithm",
    subtitle:
      "Bagging, random feature sub-sampling, and majority voting. How averaging many decorrelated trees collapses variance without adding bias.",
    readTime: "11 min read",
    date: "September 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "11",
    slug: "bias-variance",
    category: "FOUNDATIONS",
    title: "The Bias-Variance Tradeoff",
    subtitle:
      "Decomposing expected error into bias squared, variance, and irreducible noise. Underfitting, overfitting, and the KNN knob that dials between them.",
    readTime: "10 min read",
    date: "September 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "12",
    slug: "train-test-validation",
    category: "FOUNDATIONS",
    title: "Train, Test & Validation: The Honest Split",
    subtitle:
      "Why one dataset must become three, what each partition is actually for, and how a single careless peek turns your final number into fiction.",
    readTime: "9 min read",
    date: "September 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "13",
    slug: "double-descent",
    category: "FOUNDATIONS",
    title: "Double Descent",
    subtitle:
      "Error that rises at the interpolation threshold and then falls again. Why over-parameterised models generalise, and what minimum-norm bias has to do with it.",
    readTime: "12 min read",
    date: "September 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "14",
    slug: "equality-of-odds",
    category: "FAIRNESS",
    title: "Equality of Odds",
    subtitle:
      "Defining and measuring parity in true and false positive rates across groups, the equal-opportunity relaxation, and the three stages at which you can intervene.",
    readTime: "11 min read",
    date: "September 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "15",
    slug: "reinforcement-learning",
    category: "SEQUENTIAL",
    title: "Reinforcement Learning",
    subtitle:
      "Learning from delayed consequences instead of labels. Markov decision processes, the explore-exploit dilemma, grid worlds, and the Bellman recursion.",
    readTime: "13 min read",
    date: "September 2024",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
  {
    index: "16",
    slug: "transformers",
    category: "DEEP LEARNING",
    title: "The Transformer: Attention Is All You Need",
    subtitle:
      "Eliminating recurrence with constant-path multi-head self-attention. Interactive dual-tower architecture, coreference attention simulator, and autoregressive generation.",
    readTime: "12 min read",
    date: "September 2026",
    author: "AIS Research Cohort",
    status: "PUBLISHED",
  },
];

const CATEGORIES = [
  "ALL",
  "REGRESSION",
  "CLASSIFICATION",
  "EVALUATION",
  "VALIDATION",
  "TREE ENSEMBLES",
  "ENSEMBLE LEARNING",
  "DEEP LEARNING",
  "FOUNDATIONS",
  "FAIRNESS",
  "SEQUENTIAL",
] as const;

// ── Transformer Causal Attention Matrix Picker (Card 16) ──
const TRANSFORMER_MATRIX_TOKENS = [
  "The",
  "neural",
  "network",
  "learns",
  "fast",
] as const;

interface MatrixCellData {
  weight: string;
  score: string;
  isMasked: boolean;
  bgOpacity: number;
}

const TRANSFORMER_MATRIX_DATA: readonly (readonly MatrixCellData[])[] = [
  // Row 0: The
  [
    { weight: "100%", score: "3.0", isMasked: false, bgOpacity: 0.8 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
  ],
  // Row 1: neural
  [
    { weight: "6%", score: "1.3", isMasked: false, bgOpacity: 0.08 },
    { weight: "94%", score: "4.0", isMasked: false, bgOpacity: 0.78 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
  ],
  // Row 2: network
  [
    { weight: "2%", score: "0.9", isMasked: false, bgOpacity: 0.06 },
    { weight: "26%", score: "3.5", isMasked: false, bgOpacity: 0.35 },
    { weight: "72%", score: "4.5", isMasked: false, bgOpacity: 0.65 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
  ],
  // Row 3: learns
  [
    { weight: "3%", score: "0.6", isMasked: false, bgOpacity: 0.06 },
    { weight: "7%", score: "1.4", isMasked: false, bgOpacity: 0.12 },
    { weight: "16%", score: "2.3", isMasked: false, bgOpacity: 0.22 },
    { weight: "74%", score: "3.8", isMasked: false, bgOpacity: 0.68 },
    { weight: "-∞", score: "mask", isMasked: true, bgOpacity: 0 },
  ],
  // Row 4: fast
  [
    { weight: "1%", score: "0.3", isMasked: false, bgOpacity: 0.04 },
    { weight: "2%", score: "0.8", isMasked: false, bgOpacity: 0.06 },
    { weight: "4%", score: "1.3", isMasked: false, bgOpacity: 0.08 },
    { weight: "20%", score: "3.0", isMasked: false, bgOpacity: 0.25 },
    { weight: "73%", score: "4.3", isMasked: false, bgOpacity: 0.68 },
  ],
];

function TransformersAttentionPicker() {
  const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({
    row: 2,
    col: 1,
  });

  return (
    <svg
      viewBox="0 0 280 152"
      className="w-full max-w-[270px] h-auto select-none relative z-10"
      style={{ fontFamily: "monospace" }}
      role="img"
      aria-label="Transformer Causal Attention Matrix Picker"
    >
      <title>Transformer Causal Attention Matrix Picker</title>
      {/* Top Left Header */}
      <text
        x="22"
        y="14"
        fill="#75716B"
        fontSize="7.5"
        textAnchor="middle"
        fontWeight="bold"
      >
        Q \ K
      </text>

      {/* Column Headers (Keys) */}
      {TRANSFORMER_MATRIX_TOKENS.map((token, ci) => {
        const isColActive = activeCell.col === ci;
        const xCenter = 68 + ci * 46;
        return (
          <g
            key={`col-hdr-${token}`}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveCell((prev) => ({ ...prev, col: ci }));
            }}
          >
            {isColActive && (
              <rect
                x={xCenter - 21}
                y="3"
                width="42"
                height="15"
                rx="2"
                fill="#DE5D35"
              />
            )}
            <text
              x={xCenter}
              y="14"
              fill={isColActive ? "#FAF9F5" : "#1A1816"}
              fontSize="7.5"
              fontWeight="bold"
              textAnchor="middle"
            >
              {token}
            </text>
          </g>
        );
      })}

      {/* Matrix Rows (Queries) */}
      {TRANSFORMER_MATRIX_TOKENS.map((qToken, ri) => {
        const isRowActive = activeCell.row === ri;
        const yTop = 22 + ri * 25;
        const yCenter = yTop + 14;

        return (
          <g key={`row-${qToken}`}>
            {/* Row Header */}
            <g
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveCell((prev) => ({ ...prev, row: ri }));
              }}
            >
              {isRowActive && (
                <rect
                  x="2"
                  y={yTop + 1}
                  width="41"
                  height="22"
                  rx="2"
                  fill="#DE5D35"
                />
              )}
              <text
                x="22"
                y={yCenter}
                fill={isRowActive ? "#FAF9F5" : "#1A1816"}
                fontSize="7.5"
                fontWeight="bold"
                textAnchor="middle"
              >
                {qToken}
              </text>
            </g>

            {/* Row Cells */}
            {TRANSFORMER_MATRIX_DATA[ri].map((cell, ci) => {
              const isSelected = activeCell.row === ri && activeCell.col === ci;
              const cellX = 47 + ci * 46;
              const cellY = yTop + 1;
              const colToken = TRANSFORMER_MATRIX_TOKENS[ci];
              const fill = cell.isMasked
                ? "#FAF9F5"
                : `rgba(222, 93, 53, ${cell.bgOpacity})`;

              return (
                <g
                  key={`cell-${qToken}-${colToken}`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveCell({ row: ri, col: ci });
                  }}
                >
                  <rect
                    x={cellX}
                    y={cellY}
                    width="42"
                    height="22"
                    rx="2"
                    fill={fill}
                    stroke={isSelected ? "#DE5D35" : "#1A1816"}
                    strokeWidth={isSelected ? "1.8" : "0.5"}
                    strokeOpacity={isSelected ? 1 : 0.2}
                  />
                  {cell.isMasked ? (
                    <>
                      <text
                        x={cellX + 21}
                        y={cellY + 10}
                        textAnchor="middle"
                        fill="#DE5D35"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        -∞
                      </text>
                      <text
                        x={cellX + 21}
                        y={cellY + 18}
                        textAnchor="middle"
                        fill="#DE5D35"
                        opacity="0.65"
                        fontSize="6"
                      >
                        mask
                      </text>
                    </>
                  ) : (
                    <>
                      <text
                        x={cellX + 21}
                        y={cellY + 10}
                        textAnchor="middle"
                        fill={cell.bgOpacity > 0.5 ? "#FAF9F5" : "#1A1816"}
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {cell.weight}
                      </text>
                      <text
                        x={cellX + 21}
                        y={cellY + 18}
                        textAnchor="middle"
                        fill={cell.bgOpacity > 0.5 ? "#FAF9F5" : "#1A1816"}
                        opacity="0.75"
                        fontSize="6"
                      >
                        {cell.score}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [upcomingNotice, setUpcomingNotice] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    return PUBLISHED_ARTICLES.filter((article) => {
      const matchesCategory =
        selectedCategory === "ALL" || article.category === selectedCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen">
        <div className="shell relative">
          {/* Hairline Section Numeral Watermark (DESIGN.md signature element) */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-6 text-[clamp(120px,20vw,240px)] font-extralight text-black/[0.04] leading-none select-none pointer-events-none tracking-tighter"
          >
            03
          </div>

          {/* Section Header */}
          <header className="relative z-10 max-w-[64ch] mb-12 sm:mb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DD6E2D]" />
              <span className="text-[11px] font-mono font-medium tracking-[0.18em] uppercase text-[#75716B]">
                03 / LEARNING CENTER · AIS BENNETT UNIVERSITY
              </span>
            </div>

            <h1 className="text-[40px] sm:text-[64px] font-black tracking-[-0.035em] leading-[0.98] uppercase text-[#1A1816] mb-5 font-display">
              Learning Center.
            </h1>

            <p className="text-[16px] text-[#75716B] leading-[1.65]">
              Visual essays, mathematical derivations, and interactive
              simulations. Follow the pedagogical curriculum from linear
              regression and classification to tree ensembles, deep neural
              networks, and sequence models.
            </p>
          </header>

          {/* Curriculum Progression Banner */}
          <div className="mb-12 p-4 sm:p-5 bg-[#FAF9F5] border border-[#1A1816] rounded-[2px]">
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#1A1816]/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DE5D35] animate-ping" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#1A1816] uppercase">
                  CANONICAL CURRICULUM SEQUENCE
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#75716B]">
                16 MODULES · FIRST PRINCIPLES
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-mono">
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                01 Linear Regression
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                02 Logistic Regression
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                03 Confusion Matrix & F1
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                04 ROC & AUC
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                05 Cross-Validation
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                06 Trees & Random Forests
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#DE5D35] bg-[#DE5D35]/10 px-1.5 py-0.5 rounded-[1px]">
                07 Neural Networks & Deep Learning (CNNs / RNNs)
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                08 Random Forests
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                09 Bias-Variance
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                10 Train / Test / Validation
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                11 Double Descent
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                12 Equality of Odds
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <span className="font-bold text-[#1A1816] bg-[#1A1816]/5 px-1.5 py-0.5 rounded-[1px]">
                13 Reinforcement Learning
              </span>
              <span className="text-[#DE5D35] font-bold">→</span>
              <Link
                href="/resources/transformers"
                className="font-bold text-[#DE5D35] bg-[#DE5D35]/10 px-1.5 py-0.5 rounded-[1px] hover:bg-[#DE5D35] hover:text-[#FAF9F5] transition-colors"
              >
                16 The Transformer: Attention Is All You Need
              </Link>
            </div>
          </div>

          {/* Upcoming Module Notice Modal / Toast */}
          {upcomingNotice && (
            <div className="mb-8 p-4 bg-[#1A1816] text-[#FAF9F5] rounded-[2px] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3 text-[12px] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#DE5D35] shrink-0" />
                <span>
                  <strong>CURRICULUM MODULE IN PEER REVIEW:</strong>{" "}
                  {upcomingNotice} is currently undergoing laboratory simulation
                  calibration and will unlock in the next curriculum cohort.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUpcomingNotice(null)}
                className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#DE5D35] hover:text-[#FAF9F5] px-2 py-1 border border-white/20 rounded-[2px] transition-colors shrink-0"
              >
                Dismiss [✕]
              </button>
            </div>
          )}

          {/* Swiss Filter & Search Bar */}
          <div className="border-t border-b border-[#1A1816]/15 py-4 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Text Links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-mono tracking-wider uppercase">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1.5 transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? "text-[#1A1816] font-bold"
                        : "text-[#75716B] hover:text-[#1A1816]"
                    }`}
                  >
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-[#DE5D35]" />
                    )}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search curriculum archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-transparent border-b border-[#1A1816]/20 text-[12px] font-mono placeholder:text-[#75716B] focus:outline-none focus:border-[#1A1816] transition-colors"
              />
            </div>
          </div>

          {/* Grid of Articles (Pure Swiss Grid, sharp 1px borders, zero drop shadows) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((article) => {
              const isPublished = article.status === "PUBLISHED";
              const cardClassName = `group flex flex-col justify-between border border-[#1A1816]/15 bg-[#FAF9F5] rounded-[2px] transition-all duration-200 hover:border-[#1A1816] cursor-pointer ${
                article.featured ? "md:col-span-2 lg:col-span-2" : ""
              }`;

              const cardInner = (
                <>
                  {/* SVG Schematic Canvas */}
                  <div className="relative h-48 sm:h-52 border-b border-[#1A1816]/10 p-6 flex items-center justify-center bg-[#F4F1EA] overflow-hidden">
                    {/* Subtle Grid Lines */}
                    <div
                      className="absolute inset-0 opacity-40 pointer-events-none"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgba(26,24,22,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,22,0.08) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* 01: LINEAR REGRESSION */}
                    {article.slug === "linear-regression" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[200px] h-auto select-none relative z-10"
                      >
                        <line
                          x1="25"
                          y1="10"
                          x2="25"
                          y2="105"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="25"
                          y1="105"
                          x2="220"
                          y2="105"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="35"
                          y1="95"
                          x2="205"
                          y2="20"
                          stroke="#1A1816"
                          strokeWidth="1.8"
                        />
                        {[
                          { x: 55, y: 70, pred: 85 },
                          { x: 85, y: 80, pred: 72 },
                          { x: 125, y: 45, pred: 55 },
                          { x: 165, y: 35, pred: 38 },
                          { x: 190, y: 15, pred: 26 },
                        ].map((pt, i) => (
                          <g key={i}>
                            <line
                              x1={pt.x}
                              y1={pt.y}
                              x2={pt.x}
                              y2={pt.pred}
                              stroke="#DE5D35"
                              strokeWidth="1"
                              strokeDasharray="2 2"
                            />
                            <circle cx={pt.x} cy={pt.y} r="3" fill="#1A1816" />
                          </g>
                        ))}
                      </svg>
                    )}

                    {/* 02: LOGISTIC REGRESSION */}
                    {article.slug === "logistic-regression" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[200px] h-auto select-none relative z-10"
                      >
                        <line
                          x1="20"
                          y1="60"
                          x2="220"
                          y2="60"
                          stroke="#1A1816"
                          strokeWidth="0.8"
                          strokeDasharray="2 2"
                        />
                        <line
                          x1="120"
                          y1="10"
                          x2="120"
                          y2="110"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M 20 105 C 85 105, 95 15, 220 15"
                          fill="none"
                          stroke="#1A1816"
                          strokeWidth="1.8"
                        />
                        <line
                          x1="120"
                          y1="10"
                          x2="120"
                          y2="110"
                          stroke="#DE5D35"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                        <text
                          x="130"
                          y="30"
                          fill="#DE5D35"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          σ(z)
                        </text>
                      </svg>
                    )}

                    {/* 03: PRECISION-RECALL & CONFUSION MATRIX */}
                    {article.slug === "precision-recall" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[200px] h-auto select-none relative z-10"
                      >
                        <line
                          x1="25"
                          y1="10"
                          x2="25"
                          y2="105"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="25"
                          y1="105"
                          x2="220"
                          y2="105"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M 25 20 C 130 20, 160 45, 205 105"
                          fill="none"
                          stroke="#1A1816"
                          strokeWidth="1.8"
                        />
                        <circle cx="140" cy="35" r="4" fill="#DE5D35" />
                        <text
                          x="100"
                          y="70"
                          fill="#DE5D35"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          F1 Max (0.84)
                        </text>
                        {/* Mini confusion matrix icon */}
                        <g transform="translate(160, 20)">
                          <rect
                            width="28"
                            height="28"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <line
                            x1="0"
                            y1="14"
                            x2="28"
                            y2="14"
                            stroke="#1A1816"
                            strokeWidth="0.8"
                          />
                          <line
                            x1="14"
                            y1="0"
                            x2="14"
                            y2="28"
                            stroke="#1A1816"
                            strokeWidth="0.8"
                          />
                          <rect
                            x="1"
                            y="1"
                            width="12"
                            height="12"
                            fill="rgba(43,108,176,0.3)"
                          />
                          <rect
                            x="15"
                            y="15"
                            width="12"
                            height="12"
                            fill="rgba(43,108,176,0.3)"
                          />
                        </g>
                      </svg>
                    )}

                    {/* 04: ROC & AUC */}
                    {article.slug === "roc-auc" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[200px] h-auto select-none relative z-10"
                      >
                        <line
                          x1="25"
                          y1="10"
                          x2="25"
                          y2="105"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="25"
                          y1="105"
                          x2="220"
                          y2="105"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="25"
                          y1="105"
                          x2="220"
                          y2="10"
                          stroke="#75716B"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                        <path
                          d="M 25 105 C 25 35, 60 15, 220 10 L 220 105 Z"
                          fill="rgba(222,93,53,0.08)"
                        />
                        <path
                          d="M 25 105 C 25 35, 60 15, 220 10"
                          fill="none"
                          stroke="#DE5D35"
                          strokeWidth="1.8"
                        />
                        <circle cx="85" cy="35" r="4" fill="#1A1816" />
                        <text
                          x="140"
                          y="65"
                          fill="#1A1816"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          AUC = 0.89
                        </text>
                      </svg>
                    )}

                    {/* 05: CROSS-VALIDATION */}
                    {article.slug === "cross-validation" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[200px] h-auto select-none relative z-10"
                      >
                        {[0, 20, 40, 60, 80].map((yOff, foldIdx) => (
                          <g
                            key={foldIdx}
                            transform={`translate(25, ${15 + yOff})`}
                          >
                            {[0, 1, 2, 3, 4].map((partIdx) => (
                              <rect
                                key={partIdx}
                                x={partIdx * 38}
                                y="0"
                                width="34"
                                height="14"
                                rx="1"
                                fill={
                                  partIdx === foldIdx ? "#DE5D35" : "#FAF9F5"
                                }
                                stroke="#1A1816"
                                strokeWidth="1"
                              />
                            ))}
                          </g>
                        ))}
                      </svg>
                    )}

                    {/* 06: DECISION TREES & RANDOM FORESTS */}
                    {article.slug === "decision-trees" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[210px] h-auto select-none relative z-10"
                      >
                        {/* Tree branches */}
                        <line
                          x1="120"
                          y1="20"
                          x2="65"
                          y2="55"
                          stroke="#1A1816"
                          strokeWidth="1.5"
                        />
                        <line
                          x1="120"
                          y1="20"
                          x2="175"
                          y2="55"
                          stroke="#1A1816"
                          strokeWidth="1.5"
                        />
                        <line
                          x1="65"
                          y1="55"
                          x2="40"
                          y2="90"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="65"
                          y1="55"
                          x2="90"
                          y2="90"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="175"
                          y1="55"
                          x2="150"
                          y2="90"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="175"
                          y1="55"
                          x2="200"
                          y2="90"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />

                        {/* Root Node */}
                        <rect
                          x="100"
                          y="10"
                          width="40"
                          height="20"
                          rx="2"
                          fill="#1A1816"
                        />
                        <text
                          x="120"
                          y="24"
                          fill="#FAF9F5"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          X ≤ 3.5
                        </text>

                        {/* Level 1 Nodes */}
                        <rect
                          x="45"
                          y="45"
                          width="40"
                          height="18"
                          rx="2"
                          fill="#FAF9F5"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <text
                          x="65"
                          y="57"
                          fill="#1A1816"
                          fontSize="7.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          Gini: 0.12
                        </text>
                        <rect
                          x="155"
                          y="45"
                          width="40"
                          height="18"
                          rx="2"
                          fill="#FAF9F5"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <text
                          x="175"
                          y="57"
                          fill="#1A1816"
                          fontSize="7.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          Gini: 0.28
                        </text>

                        {/* Leaf Nodes */}
                        <circle cx="40" cy="95" r="7" fill="#DE5D35" />
                        <circle cx="90" cy="95" r="7" fill="#2B6CB0" />
                        <circle cx="150" cy="95" r="7" fill="#DE5D35" />
                        <circle cx="200" cy="95" r="7" fill="#2B6CB0" />
                        <text
                          x="120"
                          y="112"
                          fill="#75716B"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          ENSEMBLE FOREST BAGGING
                        </text>
                      </svg>
                    )}

                    {/* 07: NEURAL NETWORKS (FEATURED FLAGSHIP) */}
                    {article.slug === "neural-networks" && (
                      <svg
                        viewBox="0 0 340 140"
                        className="w-full max-w-[320px] h-auto select-none relative z-10"
                      >
                        {/* Connections */}
                        <path
                          d="M 60 45 C 100 45, 110 70, 150 70"
                          fill="none"
                          stroke="#2B6CB0"
                          strokeWidth="1.8"
                          strokeDasharray="4 3"
                        />
                        <path
                          d="M 60 95 C 100 95, 110 70, 150 70"
                          fill="none"
                          stroke="#2B6CB0"
                          strokeWidth="1.8"
                          strokeDasharray="4 3"
                        />
                        <path
                          d="M 210 70 L 260 70"
                          fill="none"
                          stroke="#2B6CB0"
                          strokeWidth="1.8"
                          strokeDasharray="4 3"
                        />

                        {/* Feedback Loop */}
                        <path
                          d="M 270 55 C 270 20, 150 20, 140 55"
                          fill="none"
                          stroke="#DE5D35"
                          strokeWidth="1.8"
                          strokeDasharray="4 3"
                        />
                        <polygon points="140,60 135,50 145,52" fill="#DE5D35" />
                        <text
                          x="200"
                          y="26"
                          fill="#DE5D35"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ← ∂L/∂w BACKPROP
                        </text>

                        {/* Input Nodes */}
                        <g transform="translate(20, 30)">
                          <rect
                            width="42"
                            height="28"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1.5"
                          />
                          <text
                            x="21"
                            y="18"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            x₁
                          </text>
                        </g>
                        <g transform="translate(20, 80)">
                          <rect
                            width="42"
                            height="28"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1.5"
                          />
                          <text
                            x="21"
                            y="18"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            x₂
                          </text>
                        </g>

                        {/* Function Node */}
                        <g transform="translate(150, 56)">
                          <rect
                            width="60"
                            height="28"
                            rx="2"
                            fill="#1A1816"
                            stroke="#1A1816"
                            strokeWidth="1.5"
                          />
                          <text
                            x="30"
                            y="18"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#FAF9F5"
                          >
                            f(x)
                          </text>
                        </g>

                        {/* Output Node */}
                        <g transform="translate(260, 56)">
                          <rect
                            width="50"
                            height="28"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#DE5D35"
                            strokeWidth="1.5"
                          />
                          <text
                            x="25"
                            y="18"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#DE5D35"
                          >
                            ŷ
                          </text>
                        </g>
                      </svg>
                    )}

                    {/* 08: CONVOLUTIONAL NEURAL NETWORKS (CNNs) */}
                    {article.slug === "convolutional-networks" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[210px] h-auto select-none relative z-10"
                      >
                        {/* 4x4 Input Image Matrix */}
                        <g transform="translate(30, 20)">
                          {[0, 1, 2, 3].map((r) =>
                            [0, 1, 2, 3].map((c) => (
                              <rect
                                key={`in-${r}-${c}`}
                                x={c * 16}
                                y={r * 16}
                                width="14"
                                height="14"
                                rx="1"
                                fill={
                                  r < 2 && c < 2
                                    ? "rgba(222,93,53,0.25)"
                                    : "#FAF9F5"
                                }
                                stroke="#1A1816"
                                strokeWidth="0.8"
                              />
                            )),
                          )}
                          <rect
                            x="0"
                            y="0"
                            width="30"
                            height="30"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="1.5"
                            strokeDasharray="3 2"
                          />
                          <text
                            x="32"
                            y="76"
                            fill="#75716B"
                            fontSize="8"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            2D Input
                          </text>
                        </g>

                        {/* Kernel Mapping Lines */}
                        <path
                          d="M 62 35 L 140 45"
                          stroke="#DE5D35"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                        <path
                          d="M 62 50 L 140 60"
                          stroke="#DE5D35"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />

                        {/* 3x3 Filter Kernel & Feature Map */}
                        <g transform="translate(140, 30)">
                          {[0, 1, 2].map((r) =>
                            [0, 1, 2].map((c) => (
                              <rect
                                key={`fm-${r}-${c}`}
                                x={c * 16}
                                y={r * 16}
                                width="14"
                                height="14"
                                rx="1"
                                fill={
                                  r === 0 && c === 0 ? "#2B6CB0" : "#FAF9F5"
                                }
                                stroke="#1A1816"
                                strokeWidth="0.8"
                              />
                            )),
                          )}
                          <text
                            x="24"
                            y="66"
                            fill="#75716B"
                            fontSize="8"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            Feature Map
                          </text>
                        </g>
                      </svg>
                    )}

                    {/* 09: RECURRENT NETWORKS (RNNs / LSTMs) */}
                    {article.slug === "recurrent-networks" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[210px] h-auto select-none relative z-10"
                      >
                        {/* Unfolded sequence timeline */}
                        {[
                          { t: "t-1", x: 45 },
                          { t: "t", x: 120 },
                          { t: "t+1", x: 195 },
                        ].map((step, idx) => (
                          <g key={step.t}>
                            {/* Input x_t */}
                            <circle
                              cx={step.x}
                              cy="95"
                              r="10"
                              fill="#FAF9F5"
                              stroke="#1A1816"
                              strokeWidth="1.2"
                            />
                            <text
                              x={step.x}
                              y="98"
                              fill="#1A1816"
                              fontSize="8"
                              fontFamily="monospace"
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              x_{step.t}
                            </text>
                            <line
                              x1={step.x}
                              y1="85"
                              x2={step.x}
                              y2="60"
                              stroke="#1A1816"
                              strokeWidth="1.2"
                            />

                            {/* Hidden State Cell h_t */}
                            <rect
                              x={step.x - 16}
                              y="35"
                              width="32"
                              height="24"
                              rx="2"
                              fill={idx === 1 ? "#1A1816" : "#FAF9F5"}
                              stroke="#1A1816"
                              strokeWidth="1.2"
                            />
                            <text
                              x={step.x}
                              y="50"
                              fill={idx === 1 ? "#FAF9F5" : "#1A1816"}
                              fontSize="8"
                              fontFamily="monospace"
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              h_{step.t}
                            </text>

                            {/* Output y_t */}
                            <line
                              x1={step.x}
                              y1="35"
                              x2={step.x}
                              y2="15"
                              stroke="#1A1816"
                              strokeWidth="1.2"
                            />
                            <circle cx={step.x} cy="12" r="6" fill="#DE5D35" />
                          </g>
                        ))}

                        {/* Recurrent Temporal Transmission Arcs */}
                        <path
                          d="M 61 47 L 104 47"
                          stroke="#2B6CB0"
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                        />
                        <polygon points="104,47 98,44 98,50" fill="#2B6CB0" />
                        <path
                          d="M 136 47 L 179 47"
                          stroke="#2B6CB0"
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                        />
                        <polygon points="179,47 173,44 173,50" fill="#2B6CB0" />
                      </svg>
                    )}

                    {/* 10: RANDOM FOREST */}
                    {article.slug === "random-forest" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[210px] h-auto select-none relative z-10"
                      >
                        {[35, 120, 205].map((cx, i) => (
                          <g key={cx}>
                            {/* trunk + branches */}
                            <line
                              x1={cx}
                              y1="78"
                              x2={cx}
                              y2="94"
                              stroke="#1A1816"
                              strokeWidth="1.4"
                            />
                            <line
                              x1={cx}
                              y1="60"
                              x2={cx - 13}
                              y2="78"
                              stroke="#1A1816"
                              strokeWidth="1.1"
                            />
                            <line
                              x1={cx}
                              y1="60"
                              x2={cx + 13}
                              y2="78"
                              stroke="#1A1816"
                              strokeWidth="1.1"
                            />
                            {/* canopy */}
                            <circle
                              cx={cx}
                              cy="46"
                              r="15"
                              fill={i === 1 ? "#1A1816" : "#FAF9F5"}
                              stroke="#1A1816"
                              strokeWidth="1.3"
                            />
                            <text
                              x={cx}
                              y="50"
                              fill={i === 1 ? "#FAF9F5" : "#1A1816"}
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              T{i + 1}
                            </text>
                          </g>
                        ))}
                        {/* vote tally */}
                        <line
                          x1="25"
                          y1="106"
                          x2="215"
                          y2="106"
                          stroke="#1A1816"
                          strokeWidth="1"
                          opacity="0.25"
                        />
                        {[0, 1, 2].map((k) => (
                          <circle
                            key={k}
                            cx={92 + k * 18}
                            cy="106"
                            r="4"
                            fill={k < 2 ? "#DE5D35" : "#FAF9F5"}
                            stroke="#DE5D35"
                            strokeWidth="1"
                          />
                        ))}
                        <text
                          x="163"
                          y="110"
                          fill="#1A1816"
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          MAJORITY
                        </text>
                      </svg>
                    )}

                    {/* 11: BIAS-VARIANCE */}
                    {article.slug === "bias-variance" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[200px] h-auto select-none relative z-10"
                      >
                        {/* target rings */}
                        {[46, 32, 18].map((r) => (
                          <circle
                            key={r}
                            cx="110"
                            cy="60"
                            r={r}
                            fill="none"
                            stroke="#1A1816"
                            strokeWidth="1"
                            opacity="0.35"
                          />
                        ))}
                        <circle cx="110" cy="60" r="5" fill="#1A1816" />
                        {/* throws: cluster offset up-right from the bullseye */}
                        {[
                          { x: 138, y: 40 },
                          { x: 148, y: 47 },
                          { x: 133, y: 52 },
                          { x: 144, y: 34 },
                          { x: 152, y: 39 },
                        ].map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="3.5"
                            fill="#DE5D35"
                          />
                        ))}
                        {/* bias arrow from bullseye to cluster centre */}
                        <line
                          x1="110"
                          y1="60"
                          x2="142"
                          y2="42"
                          stroke="#DE5D35"
                          strokeWidth="1.4"
                          strokeDasharray="3 2"
                        />
                        <text
                          x="172"
                          y="36"
                          fill="#DE5D35"
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          BIAS
                        </text>
                        <text
                          x="172"
                          y="50"
                          fill="#75716B"
                          fontSize="8"
                          fontFamily="monospace"
                        >
                          + VARIANCE
                        </text>
                      </svg>
                    )}

                    {/* 12: TRAIN / TEST / VALIDATION */}
                    {article.slug === "train-test-validation" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[210px] h-auto select-none relative z-10"
                      >
                        {/* one dataset bar, split three ways */}
                        <rect
                          x="20"
                          y="40"
                          width="120"
                          height="26"
                          fill="#1A1816"
                        />
                        <rect
                          x="142"
                          y="40"
                          width="40"
                          height="26"
                          fill="#DE5D35"
                        />
                        <rect
                          x="184"
                          y="40"
                          width="36"
                          height="26"
                          fill="#FAF9F5"
                          stroke="#1A1816"
                          strokeWidth="1.3"
                        />
                        <text
                          x="80"
                          y="57"
                          fill="#FAF9F5"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          TRAIN 60%
                        </text>
                        <text
                          x="162"
                          y="57"
                          fill="#FAF9F5"
                          fontSize="7.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          VAL 20%
                        </text>
                        <text
                          x="202"
                          y="57"
                          fill="#1A1816"
                          fontSize="7.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          TEST
                        </text>
                        {/* the test block is read once */}
                        <text
                          x="202"
                          y="82"
                          fill="#75716B"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          ONCE
                        </text>
                        <text
                          x="162"
                          y="82"
                          fill="#DE5D35"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          ↻ REUSED
                        </text>
                        <text
                          x="80"
                          y="82"
                          fill="#1A1816"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          FITS PARAMS
                        </text>
                        <text
                          x="120"
                          y="104"
                          fill="#75716B"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          ONE DATASET · THREE JOBS
                        </text>
                      </svg>
                    )}

                    {/* 13: DOUBLE DESCENT */}
                    {article.slug === "double-descent" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[210px] h-auto select-none relative z-10"
                      >
                        <line
                          x1="22"
                          y1="100"
                          x2="222"
                          y2="100"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="22"
                          y1="12"
                          x2="22"
                          y2="100"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        {/* threshold */}
                        <line
                          x1="112"
                          y1="12"
                          x2="112"
                          y2="100"
                          stroke="#1A1816"
                          strokeWidth="1"
                          strokeDasharray="4 3"
                          opacity="0.4"
                        />
                        {/* classical U then the spike, then descent */}
                        <path
                          d="M28 30 C 50 62 72 76 96 74 C 106 72 112 24 122 26 C 140 30 168 56 216 76"
                          fill="none"
                          stroke="#DE5D35"
                          strokeWidth="2.6"
                        />
                        <circle cx="112" cy="24" r="4.5" fill="#DE5D35" />
                        <text
                          x="112"
                          y="16"
                          fill="#DE5D35"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          THRESHOLD
                        </text>
                        <text
                          x="122"
                          y="114"
                          fill="#1A1816"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          capacity →
                        </text>
                        <text
                          x="64"
                          y="60"
                          fill="#75716B"
                          fontSize="8"
                          fontFamily="monospace"
                        >
                          second descent ↘
                        </text>
                      </svg>
                    )}

                    {/* 14: EQUALITY OF ODDS */}
                    {article.slug === "equality-of-odds" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[200px] h-auto select-none relative z-10"
                      >
                        <line
                          x1="24"
                          y1="100"
                          x2="220"
                          y2="100"
                          stroke="#1A1816"
                          strokeWidth="1.2"
                        />
                        {/* TPR pair — matched */}
                        {[
                          { x: 44, h: 54, c: "#1A1816" },
                          { x: 66, h: 54, c: "#DE5D35" },
                        ].map((b) => (
                          <rect
                            key={b.x}
                            x={b.x}
                            y={100 - b.h}
                            width="16"
                            height={b.h}
                            fill={b.c}
                          />
                        ))}
                        <text
                          x="63"
                          y="112"
                          fill="#1A1816"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          TPR ✓
                        </text>
                        {/* FPR pair — unequal, gap marked */}
                        {[
                          { x: 140, h: 16, c: "#1A1816" },
                          { x: 162, h: 40, c: "#DE5D35" },
                        ].map((b) => (
                          <rect
                            key={b.x}
                            x={b.x}
                            y={100 - b.h}
                            width="16"
                            height={b.h}
                            fill={b.c}
                          />
                        ))}
                        <line
                          x1="186"
                          y1={100 - 16}
                          x2="186"
                          y2={100 - 40}
                          stroke="#DE5D35"
                          strokeWidth="1.6"
                          strokeDasharray="3 2"
                        />
                        <text
                          x="164"
                          y="112"
                          fill="#1A1816"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          FPR ✗
                        </text>
                        <text
                          x="122"
                          y="20"
                          fill="#75716B"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          PARITY PER GROUP
                        </text>
                      </svg>
                    )}

                    {/* 15: REINFORCEMENT LEARNING */}
                    {article.slug === "reinforcement-learning" && (
                      <svg
                        viewBox="0 0 240 120"
                        className="w-full max-w-[210px] h-auto select-none relative z-10"
                      >
                        {/* 4x4 grid */}
                        {[0, 1, 2, 3].map((r) =>
                          [0, 1, 2, 3].map((c) => {
                            const isGoal = r === 3 && c === 3;
                            const isPit = r === 1 && c === 1;
                            return (
                              <rect
                                key={`g-${r}-${c}`}
                                x={40 + c * 20}
                                y={14 + r * 20}
                                width="20"
                                height="20"
                                fill={
                                  isGoal
                                    ? "rgba(222,93,53,0.28)"
                                    : isPit
                                      ? "rgba(239,68,68,0.18)"
                                      : "#FAF9F5"
                                }
                                stroke="#1A1816"
                                strokeWidth="0.8"
                              />
                            );
                          }),
                        )}
                        {/* greedy path */}
                        <path
                          d="M50 24 L50 44 L70 44 L70 64 L90 64 L90 84 L110 84"
                          fill="none"
                          stroke="#DE5D35"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <circle cx="50" cy="24" r="4" fill="#1A1816" />
                        <circle cx="110" cy="84" r="4.5" fill="#DE5D35" />
                        <text
                          x="90"
                          y="78"
                          fill="#EF4444"
                          fontSize="7"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          PIT
                        </text>
                        <text
                          x="110"
                          y="78"
                          fill="#DE5D35"
                          fontSize="7"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          GOAL
                        </text>
                        <text
                          x="175"
                          y="46"
                          fill="#1A1816"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          STATE →
                        </text>
                        <text
                          x="175"
                          y="60"
                          fill="#1A1816"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          ACTION →
                        </text>
                        <text
                          x="175"
                          y="74"
                          fill="#DE5D35"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          REWARD
                        </text>
                      </svg>
                    )}

                    {/* 16: THE TRANSFORMER (ATTENTION MATRIX PICKER) */}
                    {article.slug === "transformers" && (
                      <TransformersAttentionPicker />
                    )}

                    {/* Corner Index */}
                    <span className="absolute top-3 left-3 text-[11px] font-mono text-[#75716B]">
                      {article.index} /
                    </span>

                    {/* Status Badge */}
                    <span className="absolute top-3 right-3 text-[10px] font-mono font-bold tracking-wider">
                      {isPublished ? (
                        <span className="text-[#75716B]">
                          {article.readTime}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#DE5D35]/10 text-[#DE5D35] border border-[#DE5D35]/30">
                          CALIBRATION
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Article Copy Block */}
                  <div className="p-6 sm:p-7 flex flex-col justify-between grow">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold tracking-[0.14em] uppercase text-[#DE5D35]">
                          {article.category}
                        </span>
                        {!isPublished && (
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#75716B]">
                            IN LAB REVIEW
                          </span>
                        )}
                      </div>

                      <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1A1816] group-hover:text-[#DE5D35] transition-colors leading-[1.2] mb-3">
                        {article.title}
                      </h2>

                      <p className="text-[14px] text-[#75716B] leading-[1.65] line-clamp-2 mb-6">
                        {article.subtitle}
                      </p>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-4 border-t border-[#1A1816]/10 flex items-center justify-between text-[11px] font-mono text-[#75716B]">
                      <span>{article.date}</span>
                      {isPublished ? (
                        <span className="font-bold text-[#1A1816] group-hover:text-[#DE5D35] transition-colors inline-flex items-center gap-1 group-hover:translate-x-1 duration-200">
                          READ ESSAY →
                        </span>
                      ) : (
                        <span className="font-bold text-[#DE5D35] inline-flex items-center gap-1 group-hover:translate-x-1 duration-200">
                          PREVIEW NOTICE →
                        </span>
                      )}
                    </div>
                  </div>
                </>
              );

              return isPublished ? (
                <Link
                  key={article.slug}
                  href={`/resources/${article.slug}`}
                  className={cardClassName}
                >
                  {cardInner}
                </Link>
              ) : (
                <div
                  key={article.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => setUpcomingNotice(article.title)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setUpcomingNotice(article.title);
                    }
                  }}
                  className={cardClassName}
                >
                  {cardInner}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}

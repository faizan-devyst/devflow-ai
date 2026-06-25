import Anthropic from "@anthropic-ai/sdk";
import type { StandupWithAuthor } from "@/types";

const MODEL = "claude-opus-4-8";

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  cachedClient ??= new Anthropic();
  return cachedClient;
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function formatStandups(standups: StandupWithAuthor[]): string {
  return standups
    .map((standup) => {
      const author = standup.user.name || standup.user.email;
      const date = new Date(standup.date).toISOString().slice(0, 10);
      const blockers = standup.blockers?.trim() ? standup.blockers : "None";
      return [
        `### ${author} (${date})`,
        `Yesterday: ${standup.yesterday}`,
        `Today: ${standup.today}`,
        `Blockers: ${blockers}`,
      ].join("\n");
    })
    .join("\n\n");
}

export async function generateDailySummary(
  teamName: string,
  dateLabel: string,
  standups: StandupWithAuthor[]
): Promise<string> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system:
      "You are an engineering manager's assistant. Write concise, skimmable daily standup summaries for a dev team. Group related work, surface blockers prominently, and stay factual and brief. Use short Markdown sections.",
    messages: [
      {
        role: "user",
        content: `Summarize the daily standup for the team "${teamName}" on ${dateLabel}. There ${standups.length === 1 ? "is 1 update" : `are ${standups.length} updates`
          }:\n\n${formatStandups(
            standups
          )}\n\nProduce: a two or three sentence overview, a short bulleted list of the key work, and a "Blockers" section (write "No blockers reported" if there are none). Do not use em dashes or en dashes anywhere in your response.`,
      },
    ],
  });
  return extractText(message);
}

export async function generateOnboardingDoc(options: {
  repoName: string;
  paths: string[];
  totalFiles: number;
  excerpts: { path: string; content: string }[];
}): Promise<string> {
  const tree = options.paths.join("\n");
  const files = options.excerpts
    .map((excerpt) => `--- ${excerpt.path} ---\n${excerpt.content}`)
    .join("\n\n");

  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system:
      "You are a staff engineer writing an onboarding guide for a developer who just joined the team and needs to get productive in this repository. Write a clear, accurate Markdown document grounded ONLY in the provided file tree and file excerpts. Do not invent files, commands, or architecture you cannot see. Reference real file paths in backticks. Do not use em dashes or en dashes anywhere in your response.",
    messages: [
      {
        role: "user",
        content:
          `Repository: ${options.repoName} (${options.totalFiles} indexed files).\n\n` +
          `File tree (subset):\n${tree}\n\nKey file excerpts:\n${files}\n\n` +
          "Write an onboarding document with exactly these sections:\n\n" +
          "## Overview\nWhat this project is and does, in two to four sentences.\n\n" +
          "## Architecture\nHow the codebase is organized: the main directories and how they fit together.\n\n" +
          "## Key modules\nA bulleted list of the most important files/directories, each with a one-line description (use real paths).\n\n" +
          "## Start here\nA short, ordered list of where a new developer should look first and why.\n\n" +
          "Keep it skimmable.",
      },
    ],
  });
  return extractText(message);
}

export interface ChatExcerpt {
  n: number;
  path: string;
  startLine: number;
  endLine: number;
  content: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Streams a grounded answer about a codebase: the model must answer only from the
 * supplied excerpts and cite them inline as [n]. Returns the SDK message stream.
 */
export function streamCodebaseAnswer(options: {
  repoName: string;
  question: string;
  history: ChatTurn[];
  excerpts: ChatExcerpt[];
}) {
  const excerptsText = options.excerpts
    .map(
      (excerpt) =>
        `[${excerpt.n}] ${excerpt.path}:${excerpt.startLine}-${excerpt.endLine}\n\`\`\`\n${excerpt.content}\n\`\`\``
    )
    .join("\n\n");

  return getClient().messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system:
      `You are a senior engineer helping a teammate understand the codebase "${options.repoName}". ` +
      "Answer the question using ONLY the provided code excerpts. Cite the excerpts you rely on " +
      "inline using their bracket numbers, e.g. [1], [2]. If the excerpts do not contain the answer, " +
      "say you couldn't find it in the indexed code rather than guessing. Respond directly with the " +
      "answer, with no preamble or meta commentary. Do not use em dashes or en dashes anywhere in your response.",
    messages: [
      ...options.history.map((turn) => ({ role: turn.role, content: turn.content })),
      {
        role: "user" as const,
        content: `Question: ${options.question}\n\nCode excerpts from the repository:\n\n${excerptsText}`,
      },
    ],
  });
}

export async function generateWeeklyDigest(
  teamName: string,
  rangeLabel: string,
  standups: StandupWithAuthor[]
): Promise<string> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system:
      "You are an engineering manager's assistant. Write a weekly sprint digest for a dev team and its stakeholders. Synthesize themes of progress, highlight shipped work, surface recurring or unresolved blockers, and keep it professional and skimmable with clear Markdown headings.",
    messages: [
      {
        role: "user",
        content: `Write the weekly sprint digest for the team "${teamName}" covering ${rangeLabel}, based on ${standups.length
          } standup update(s):\n\n${formatStandups(
            standups
          )}\n\nStructure with these Markdown headings: "## Summary" (three or four sentences), "## Highlights" (bullets of notable progress), "## Blockers and risks" (bullets, or "None reported"), and "## By the numbers" (number of updates and active contributors). Do not use em dashes or en dashes anywhere in your response.`,
      },
    ],
  });
  return extractText(message);
}

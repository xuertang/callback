import type { Problem } from "./types";

// Companies that ask a question another bank already holds. A question is
// authored once; when a second company's interview reports include it, the
// company is added here instead of copying the problem. seed-data.ts applies
// the map to the assembled list.

export const extraCompanyTags: Record<string, string[]> = {
  // Disney (reports read 8 Nov 2026).
  "shortest-path-with-obstacles": ["disney"],
  "mentoring-someone": ["disney"],
  // TikTok and ByteDance (reports read 10 Nov 2026), with Disney where it
  // shares the question.
  "lru-cache": ["disney", "bytedance", "tiktok"],
  "conflict-with-teammate": ["disney", "bytedance", "tiktok"],
  "project-you-are-most-proud-of": ["disney", "bytedance", "tiktok"],
  "hardest-situation-at-work": ["disney", "bytedance", "tiktok"],
  "course-schedule": ["bytedance", "tiktok"],
  "topological-sort": ["bytedance", "tiktok"],
  "number-of-islands": ["bytedance", "tiktok"],
  "merge-intervals": ["bytedance", "tiktok"],
  "min-stack": ["bytedance", "tiktok"],
  "streaming-median": ["bytedance", "tiktok"],
  "basic-calculator-ii": ["bytedance", "tiktok"],
  "word-search-trie": ["bytedance", "tiktok"],
  "square-root-binary-search": ["bytedance", "tiktok"],
  "design-rate-limiter": ["bytedance"],
  "design-url-shortener": ["bytedance"],
  "design-distributed-job-scheduler": ["bytedance"],
  "design-notification-system": ["tiktok"],
  "design-distributed-kv-store": ["tiktok"],
  "design-personalized-recommendations": ["bytedance", "tiktok"],
  "how-do-you-use-ai-tools": ["bytedance", "tiktok"],
  "ambiguous-requirements": ["bytedance", "tiktok"],
  "competing-priorities": ["bytedance", "tiktok"],
  "implement-promise-all": ["tiktok"],
  "top-earners-per-department": ["tiktok"],
};

/**
 * The problems with the extra company tags merged in, each company once and
 * the authored ones first. An entry for a slug no problem has is a mistake.
 */
export function withCompanyTags(problems: Problem[]): Problem[] {
  const slugs = new Set(problems.map((problem) => problem.slug));
  for (const slug of Object.keys(extraCompanyTags)) {
    if (!slugs.has(slug)) {
      throw new Error(`seed-company-tags: no problem has the slug "${slug}"`);
    }
  }
  return problems.map((problem) => {
    const extra = extraCompanyTags[problem.slug];
    if (!extra) return problem;
    return {
      ...problem,
      companies: [...new Set([...problem.companies, ...extra])],
    };
  });
}

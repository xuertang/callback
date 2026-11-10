import type { Problem } from "./types";

// TikTok and ByteDance behavioral bank: the resume deep dive that opens
// almost every round, and the hiring-manager and director questions that
// close the loop. One prompt per problem, with what a strong answer contains.

const CLOSE =
  "Answer in the first person with your own decisions, in under three minutes, and have a 60-second version ready for a round that keeps interrupting.";

function behavioral(
  slug: string,
  title: string,
  summary: string,
  prompt: string[],
  hints: string[],
  strong: string[],
): Problem {
  return {
    slug,
    title,
    category: "behavioral",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary,
    prompt: [...prompt, "", CLOSE].join("\n"),
    hints,
    solution: [
      "## What a strong answer contains",
      "",
      ...strong.map((s) => `- ${s}`),
    ].join("\n"),
  };
}

export const tiktokBehavioralProblems: Problem[] = [
  behavioral(
    "resume-project-deep-dive",
    "Walk Me Through a Project on Your Resume",
    "Fifteen to thirty minutes of drilling on one project: the decisions, the alternatives you rejected, the numbers, and what you would do differently.",
    [
      "Pick one project from your resume and walk me through it. Expect to be interrupted: why did you choose this approach over the alternative, what was the hardest part, what were the scale, latency and cost targets, what exactly did you build yourself, and what would you change now?",
      "",
      "Nearly every technical round opens this way, and it can take half the hour before any coding. Every tool you list is fair game down to its internals: name Elasticsearch and you will be asked about mapping design and how an inverted index works. Later rounds expect a different project, so prepare at least two.",
    ],
    [
      "Structure it top-down: the problem and why it mattered, the constraints, the design, your part, the result. Then let the interviewer choose where to dig.",
      "For each major decision, have the alternative you considered and the reason it lost. A choice with no rejected alternative sounds inherited.",
      "Know your numbers: request rates, data sizes, latency before and after, team size, how long it took.",
    ],
    [
      "A one-minute framing: the user or business problem, the constraints, and the outcome with a number.",
      "The architecture at a level you can draw, and the two or three decisions that shaped it, each with the option you rejected and why.",
      "A precise account of your own contribution, separate from the team's.",
      "The hardest technical problem, how you diagnosed it and what fixed it.",
      "Honest hindsight: what you would do differently, and what you learned about a tool you used at the level of how it works.",
    ],
  ),
  behavioral(
    "biggest-weakness",
    "What Is Your Biggest Weakness?",
    "A real weakness with a real cost, what you changed, and evidence that the change held; not a strength in disguise.",
    [
      "What is your biggest professional weakness? Give an example of it costing you or your team something, what you have done about it, and how you know it is improving.",
      "",
      "Hiring managers ask this in the final round, and it also turns up inside technical phone screens between the resume questions and the coding.",
    ],
    [
      "Choose something true that a colleague would recognise, and that is not disqualifying for this role.",
      "The answer is mostly about the change: a specific habit or system you adopted, and a recent situation where it worked.",
    ],
    [
      "A weakness stated plainly, without turning it into a virtue.",
      "One concrete incident where it had a cost.",
      "The specific practice you put in place, not a resolution to try harder.",
      "Evidence of progress: feedback from a review, a recent example handled differently.",
      "Awareness that it is still something you manage.",
    ],
  ),
  behavioral(
    "why-this-team-and-why-leave",
    "Why This Team, and Why Are You Leaving?",
    "Motivation that is specific to the team's product and problems, a reason for moving that is not a complaint, and a direction for the next few years.",
    [
      "Why do you want to join this team at TikTok or ByteDance, why are you leaving your current role, and where do you want to be in a few years?",
      "",
      "The hiring manager asks this as a fit check, and directors ask a shorter version. Recruiters sometimes pitch a different team after the technical rounds, so be ready to answer it for a team you learned about that week.",
    ],
    [
      "Connect something you have done to something this team works on. A reason that would fit any company is not a reason.",
      "Describe leaving as moving toward something: scope, a kind of problem, scale. Keep criticism of your current employer out of it.",
    ],
    [
      "A specific pull: the product, the scale, or a technical problem the team owns, tied to your own experience.",
      "A forward-looking reason for changing roles, stated without blaming people or the current company.",
      "What you would bring in the first six months.",
      "A career direction that this role plausibly leads to.",
      "One good question back about the team's roadmap or how it works.",
    ],
  ),
  behavioral(
    "high-intensity-environment",
    "Can You Work in a High-Intensity Environment?",
    "A direct culture question: evidence that you have delivered under sustained pressure, how you prioritise and protect quality, and the boundaries you keep.",
    [
      "This team moves fast, priorities change at short notice, and some colleagues are in other time zones. Can you work in a high-intensity environment? Tell me about a period of sustained pressure, how you handled it, and how you set priorities and boundaries so that you could keep it up.",
      "",
      "Asked plainly by hiring managers, and inside phone screens as a question about acceptable pace and cross-time-zone meetings.",
    ],
    [
      "Answer the question that was asked, yes or no with conditions, then give the evidence.",
      "Show a system rather than stamina: how you decide what matters this week, what you drop, and how you say so.",
      "It is reasonable to ask what intensity means on this team: on-call load, release cadence, meeting hours.",
    ],
    [
      "A direct answer, followed by a real period of pressure with its duration and stakes.",
      "How you prioritised: what was cut or deferred, who you told, and how quality was protected.",
      "How you work across time zones: written hand-offs, agreed overlap hours, decisions recorded.",
      "The boundaries and habits that made the pace sustainable, stated without apology.",
      "What you would want to know about the team's pace, asked as a practical question.",
    ],
  ),
  behavioral(
    "a-time-you-failed",
    "Tell Me About a Time You Failed",
    "A failure that was yours, told without excuses: the decision, the impact, the recovery, and the change in how you work.",
    [
      "Tell me about a time you failed. What happened, what was your part in it, what did it cost, and what do you do differently now?",
      "",
      "Part of the standard set in the hiring-manager round, alongside the most challenging project, a conflict and handling ambiguity.",
    ],
    [
      "Pick a failure with consequences that traces to a decision you made, not bad luck or someone else's mistake.",
      "Spend less time on the story and more on the recovery and the change; that is the part being assessed.",
    ],
    [
      "The situation and your decision, with the reasoning you had at the time.",
      "The impact in concrete terms: users, money, time, trust.",
      "What you did once you knew: how fast you raised it and how you limited the damage.",
      "The root cause, in your own process rather than in circumstances.",
      "A lasting change and a later situation where it made the difference.",
    ],
  ),
  behavioral(
    "why-did-this-project-matter",
    "Why Did This Project Matter?",
    "The director's version of the deep dive: twenty minutes on outcome and scope, where the answer starts with users and the business and reaches the technology only if asked.",
    [
      "Choose a recent piece of work, different from the projects you discussed in earlier rounds, and tell me why it mattered. What was the outcome for users or the business, was that the right problem to work on, and what would you have done with more time or more people?",
      "",
      "Senior interviewers in the final round challenge whether the project was effective as a product and whether the impact justified the engineering. They are not asking how it was built.",
    ],
    [
      "Lead with the outcome and a number, then the reason the problem was worth solving. Keep the implementation to a sentence unless asked.",
      "Be ready for the challenge that the scope was wrong. Having considered a smaller or different version, and being able to say why you did not build it, is the strong position.",
    ],
    [
      "The outcome first: a metric that moved, a cost removed, a risk retired, with the baseline.",
      "Why this problem, compared with what else the team could have done.",
      "How you know the result was caused by the work: an experiment, a before and after, a counterfactual.",
      "An honest view of the scope: what was over-built or under-built.",
      "What more time or headcount would have bought, in order of value.",
    ],
  ),
];

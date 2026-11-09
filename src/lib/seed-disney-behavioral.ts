import type { Problem } from "./types";

// Disney behavioral bank: the prompts the recruiter screens, hiring-manager
// rounds and culture-fit onsites report across the Streaming, Experiences
// and data-engineering loops. One prompt per problem, with what a strong
// answer contains.

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
    companies: ["disney"],
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

export const disneyBehavioralProblems: Problem[] = [
  behavioral(
    "working-with-stakeholders",
    "How Do You Work With Stakeholders?",
    "Collaboration style, a requirements disagreement, aligning competing priorities and leading without authority, each with a real example.",
    [
      "How do you work with backend, design, product and program partners, and what does good collaboration look like to you? Give an example of aligning stakeholders with competing priorities, say shipping versus quality versus performance, and how you communicated the trade-offs. How do you keep execution moving when you do not manage the people involved?",
      "",
      "Asked of lead front-end candidates and again as a post-onsite follow-up on stakeholder management. Prepare one story that covers the alignment and one that covers influence without authority.",
    ],
    [
      "Pick a story where the stakeholders wanted genuinely different things, and show the trade-off you made visible rather than the one you won.",
      "Name the mechanism: a written options doc, a decision meeting with the data, a prototype, a phased plan. Interviewers want to see the move, not the sentiment.",
    ],
    [
      "A description of your working style with concrete habits: early design review, shared docs, explicit owners, regular demos.",
      "One alignment story with the competing priorities stated fairly, the options you laid out, the decision and who made it.",
      "How you influence without authority: data, small proofs, finding the shared goal, escalating cleanly when needed.",
      "A measurable outcome and what you would do differently.",
    ],
  ),
  behavioral(
    "critical-feedback",
    "A Time You Received Critical Feedback",
    "Feedback that was genuinely uncomfortable, the first reaction, and a change in behaviour with evidence it lasted.",
    [
      "Tell me about a time you received critical feedback. How did you react in the moment, what did you do with it, and what changed afterwards?",
      "",
      "Part of a behavioral panel that also covers conflict and competing priorities. Choose feedback with real stakes, not a style note.",
    ],
    [
      "Say what the feedback was in plain words; softening it tells the interviewer you have not fully taken it on board.",
      "Describe the first reaction honestly, then the step from reaction to understanding, then the concrete change and how you know it stuck.",
    ],
    [
      "The feedback stated plainly, who gave it and in what setting.",
      "Your first reaction, including the defensive part if there was one, and how you moved past it.",
      "A specific behaviour you changed and evidence over time: a later review, a metric, a colleague's remark.",
      "What you now do to invite that kind of feedback earlier.",
    ],
  ),
  behavioral(
    "competing-priorities",
    "More Work Than You Could Deliver",
    "Explicit prioritisation criteria, the conversation with the people whose work slipped, and what you cut on purpose.",
    [
      "Tell me about a time you had more work than you could deliver. How did you decide what to do first, and how did you handle what you did not do?",
      "",
      "Interviewers are listening for criteria, not heroics: impact, urgency, dependencies, risk, and a plan for the rest that the stakeholders heard before it slipped.",
    ],
    [
      "Make the criteria visible: write them down as you talk, in the order you applied them.",
      "The strongest part of the story is the message you sent about the work you would not do, and when you sent it.",
    ],
    [
      "The competing demands and the real constraint behind each.",
      "The criteria you used, applied consistently, and the resulting order.",
      "How you communicated what would slip, to whom, and early enough to matter.",
      "The outcome, including anything that was cut for good and turned out not to matter.",
    ],
  ),
  behavioral(
    "team-culture-mismatch",
    "A Team Culture Mismatch",
    "Spotting that your way of working did not fit the team, adapting your own behaviour, and nudging the team where it helped.",
    [
      "Describe a time you faced a mismatch between how you work and how a team worked. How did you identify the misalignment, how did you adapt your own behaviour, and how did you influence positive change?",
      "",
      "Asked in culture-fit rounds, where the interviewer wants to see adaptation before influence.",
    ],
    [
      "Lead with what you changed about yourself; a story that is only about fixing the team reads as the mismatch continuing.",
      "Pick a mismatch about work (communication cadence, review norms, planning style), not a personality clash.",
    ],
    [
      "The mismatch described neutrally, with the signal that told you it existed.",
      "What you adapted first, and what you kept because it mattered.",
      "One change you proposed to the team, how you earned buy-in and what came of it.",
      "What the relationship with the team was like afterwards.",
    ],
  ),
  behavioral(
    "ambiguous-requirements",
    "Handling Ambiguous Requirements",
    "Turning a vague or shifting ask into a decision: the questions you asked, the assumptions you wrote down, and how you kept moving.",
    [
      "How do you handle ambiguous or evolving requirements? Walk through a real case: what was unclear, how you found out what was actually needed, what you built first, and how you handled the requirements changing under you.",
    ],
    [
      "Show the sequence: clarify, write the assumptions down, build the smallest thing that tests them, revisit.",
      "Evolving requirements are not a complaint; show the mechanism that absorbed the change (short iterations, a visible backlog, a demo cadence).",
    ],
    [
      "What was ambiguous and why nobody could answer it yet.",
      "The questions you asked and the assumptions you documented and shared.",
      "The first increment you shipped to learn, and what it taught.",
      "How you handled the change when it came, and the outcome.",
    ],
  ),
  behavioral(
    "influence-without-authority",
    "Influencing Without Authority",
    "A proposal that was not your assigned task, how you earned buy-in, and what changed as a result.",
    [
      "Have you ever proposed something that influenced the team? Describe an idea, practice or technical direction that was not your assigned task, how you earned buy-in from people you did not manage, and what changed as a result.",
      "",
      "Hiring managers probe this after the project walkthrough; the data-engineering loop asks it almost verbatim.",
    ],
    [
      "Pick a proposal with friction; an idea everyone instantly loved shows nothing about influence.",
      "Name the evidence you brought (a prototype, numbers, a pilot on your own work) and the person you convinced first.",
    ],
    [
      "The problem you saw that was not yours to solve, and why you took it on.",
      "The proposal, the objections, and what you did about each.",
      "How buy-in actually happened: who, in what forum, convinced by what.",
      "What changed, how you know it lasted, and what you would do differently.",
    ],
  ),
  behavioral(
    "explain-docker-to-non-engineers",
    "Explain Docker to a Non-Technical Audience",
    "The worked example of the hiring-manager round's communication question: a container explained to someone who will never run one, and how you check they got it.",
    [
      "How do you communicate with non-technical people? Give a concrete example of explaining a technical concept to a non-technical audience. In this round the worked example was: explain what Docker is and why we use it, as you would to a producer or a finance partner.",
      "",
      "Then say how you check that the explanation landed and what you leave out on purpose.",
    ],
    [
      'Start from their problem ("it worked on my machine", a release that broke because two servers differed), then introduce the idea as the fix.',
      "One analogy, carried through; switching analogies mid-way loses the room.",
    ],
    [
      "An explanation in plain words: a container packages a program with everything it needs so it runs the same everywhere, and we use it so laptops, test and production stop disagreeing.",
      "What you deliberately leave out (images versus containers, orchestration) and why.",
      "A check for understanding: ask them to say it back, or connect it to a decision they care about (cost, release speed, risk).",
      "A real example of doing this at work and what it changed.",
    ],
  ),
  behavioral(
    "why-disney",
    "Why Disney, and Why This Role?",
    "Motivation tied to the actual products and the confirmed responsibilities of the role, without invented facts.",
    [
      "Why are you interested in Disney, and why this role? Recruiters and hiring managers ask this in the first ten minutes, and product engineer loops return to it in the culture-fit round.",
      "",
      "Speak to what specifically attracts you (the products, the scale of the audience, the engineering problems in streaming or parks, the role's team), how the role fits your skills and next step, and the value you expect to bring. Use only facts you have confirmed about the role.",
    ],
    [
      "Be specific about a product you use and an engineering problem it implies; generic admiration for the brand is what everyone else says.",
      "Tie the role to the next thing you want to learn or own, and name one unanswered question about it you intend to ask.",
    ],
    [
      "A concrete pull: a product, an audience, a technical domain, a team you have spoken with.",
      "How the role's confirmed responsibilities match your experience and your next step.",
      "What you bring that the team is missing, said plainly.",
      "Honesty about what you still need to find out, and the question you will ask.",
    ],
  ),
  behavioral(
    "productive-in-unfamiliar-codebase",
    "Getting Productive in an Unfamiliar Codebase",
    "Joining a large codebase: what made it hard, the ramp-up steps you took, how soon you contributed, and what you left behind for the next person.",
    [
      "Describe joining a team or project with a large, unfamiliar codebase and becoming productive quickly. What made it hard to navigate, what concrete steps did you take, how long until you contributed something meaningful, and what did you put in place to make the next engineer's onboarding easier?",
    ],
    [
      "List the actual techniques: reading the tests, tracing one request end to end, pairing, small fixes in the path you were learning, writing down what nobody had.",
      "The onboarding artefact you left behind is the part that distinguishes a good answer.",
    ],
    [
      "The size and shape of the codebase and the specific things that made it hard.",
      "A ramp-up plan with concrete steps and the order you did them in.",
      "The first meaningful contribution and roughly when it landed.",
      "What you documented, automated or simplified so the next person ramped faster.",
    ],
  ),
  behavioral(
    "traits-you-would-hire-for",
    "Which Traits Would You Hire For?",
    "The reverse behavioral: as the hiring manager of a new team, the traits you would screen for, the signals for each, and how you would assess adaptability.",
    [
      "You are the hiring manager building a new team. Which behavioural traits would you screen for to ensure the team works, and how would you assess adaptability in particular? Cover the traits in priority order, the interview signals and prompts for each, how you would keep interviewers calibrated, and how you would avoid hiring copies of yourself.",
    ],
    [
      "Pick three or four traits and justify them from the team's situation (new, ambiguous, cross-functional), not from a generic list.",
      "For adaptability, describe a prompt that shows it (a story of a plan that changed) and the signal you listen for (what they did with the change, not how they felt).",
    ],
    [
      "A short, prioritised list of traits with the reason each matters for this team.",
      "For each trait, a prompt and the observable signal that distinguishes a strong answer.",
      "A calibration mechanism: shared rubric, written feedback before discussion, a debrief that compares evidence.",
      "Awareness of bias: structured questions, diverse panels, and separating culture add from culture fit.",
    ],
  ),
  behavioral(
    "infrastructure-as-code-experience",
    "Your Infrastructure-as-Code Experience",
    "A concrete infrastructure change you owned in Terraform or similar on AWS: review, state, access boundaries, and what went wrong.",
    [
      "Discuss your experience with infrastructure as code, Terraform and AWS. Walk through a concrete infrastructure change you worked on: how it was planned and reviewed, how it was applied, how you handled state, permissions and drift, and what happened when something failed.",
      "",
      "Recruiter screens ask this early. Use only experience you actually have; if a named tool is new to you, say so and describe the closest thing you have done and the gap.",
    ],
    [
      "Explain the state boundary: where state lives, who can write it, and what stops two people applying at once.",
      "Have a failure ready: an unexpected resource replacement in a plan, a partial apply, drift from a console change, and what you did.",
    ],
    [
      "Accurate scope: which services you managed, which parts of the lifecycle you owned.",
      "The change workflow: modules, plan in review, apply from a pipeline with least-privilege credentials, environments isolated.",
      "State management, locking and drift detection, in concrete terms.",
      "One failure, how it was contained and what you changed afterwards.",
    ],
  ),
  behavioral(
    "prompting-an-llm-for-migration",
    "Prompting an LLM to Migrate a Codebase and Clean Data",
    "Two verbal tech questions from a data-engineering loop: how you would instruct a model to port Java to Python and to clean an inconsistent table, with the safeguards around it.",
    [
      "Your team wants a large language model to speed up two jobs: migrating an entire codebase from Java to Python, and cleaning a database table with tens of thousands of rows of inconsistent data. Explain how you would prompt the model for each task, and how you would ensure data quality and security throughout, including sensitive data.",
      "",
      "The model, the tooling and the contents are not specified; state your assumptions. The focus is how you instruct the model and the safeguards around it, not any one product.",
    ],
    [
      "One prompt will not do: split the migration by module in dependency order, carry shared conventions in every prompt, and define done as passing the original tests.",
      "For the cleaning job, prompt for rules and code, not for cleaned rows: have the model propose normalisation rules from a sample, review them, run them as code, and keep the originals.",
      "Security is about what leaves your boundary: an enterprise deployment with retention guarantees, redaction or synthetic samples for anything sensitive, and secrets never in a prompt.",
    ],
    [
      "A migration plan: module-by-module prompts with conventions and library mappings, verification against the existing tests and recorded outputs, human review of each piece.",
      "A cleaning plan: profile the data, prompt for rules and transformation code on a redacted sample, validate on a holdout, run as a reproducible job with the raw table kept.",
      "Quality controls: tests, diffs, spot checks, and metrics on what changed.",
      "Security controls: where the model runs, what data it may see, redaction, no credentials in prompts, audit of what was sent.",
    ],
  ),
];

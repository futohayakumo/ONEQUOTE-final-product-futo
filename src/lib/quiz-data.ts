import type { QuizQuestion } from "@/types/quiz";

export const QUIZ: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "Under the Agile Delivery Protocol, which commit message structure is mandatory?",
    options: [
      { id: "a", text: "Free-form text describing the change" },
      { id: "b", text: "[Ticket_ID] Commit Message" },
      { id: "c", text: "type(scope): message, and nothing else" },
      { id: "d", text: "The branch name repeated as the subject line" },
    ],
    correctId: "b",
    whyItMatters:
      "Every commit stays traceable to a ticket. Release notes and audit trails are generated from the tag, and the pre-receive hook rejects any subject line that does not open with the ticket id — so the convention is enforced by the repository, not by reviewer goodwill.",
  },
  {
    id: "q2",
    prompt:
      "At what TEU milestone interval does a Blue Wave customer earn a performance reward?",
    options: [
      { id: "a", text: "Every 1 TEU" },
      { id: "b", text: "Every 5 TEUs" },
      { id: "c", text: "Every 10 TEUs" },
      { id: "d", text: "Every 20 TEUs" },
    ],
    correctId: "b",
    whyItMatters:
      "Blue Wave is the entry tier and carries no rate discount at all — its entire value is the coupon granted every 5 TEUs of accrued volume. Get the interval wrong and the whole entry-tier incentive is mispriced.",
  },
  {
    id: "q3",
    prompt:
      "How many peer approvals must a Pull Request carry before it can be merged?",
    options: [
      { id: "a", text: "One approval" },
      { id: "b", text: "Two or more approvals" },
      { id: "c", text: "None — a green build is sufficient" },
      { id: "d", text: "Only the Technical Advisor (TA)'s approval" },
    ],
    correctId: "b",
    whyItMatters:
      "The Agile Delivery Protocol requires at least two independent approvals so that no single reviewer becomes a bottleneck or a single point of failure. Branch protection enforces it; a green build alone never unlocks the merge.",
  },
  {
    id: "q4",
    prompt: "In ocean freight capacity, what does one TEU represent?",
    options: [
      { id: "a", text: "One tonne of cargo" },
      { id: "b", text: "One twenty-foot equivalent container unit" },
      { id: "c", text: "One cubic metre of cargo volume" },
      { id: "d", text: "One forty-foot high-cube container" },
    ],
    correctId: "b",
    whyItMatters:
      "TEU is the normalising unit for the entire Volume Loyalty Framework. A 40' High Cube counts as 2 TEU, so five of them accrue 10 TEU rather than 5 — misreading this doubles or halves every reward calculation downstream.",
  },
  {
    id: "q5",
    prompt: "What is the Quotation Flex Cart responsible for?",
    options: [
      { id: "a", text: "Issuing the final bill of lading" },
      {
        id: "b",
        text: "Holding short-term freight rates across multiple ports so a customer can compare and book later",
      },
      { id: "c", text: "Segmenting customers into marketing cohorts" },
      { id: "d", text: "Persisting booking records in the Legacy ERP Engine" },
    ],
    correctId: "b",
    whyItMatters:
      "The Quotation Flex Cart is a rate-hold layer, not a booking system. It keeps quotes valid for a fixed window across several lanes; the transaction is only committed once the Legacy ERP Engine confirms the booking.",
  },
] as const;

# CLAUDE DEVELOPER INSTRUCTION: Secure Streamlit Portfolio App Spec Sheet

This document serves as the **complete, self-contained development specification** for building the **Interactive Portfolio Web Application** using Python and Streamlit. 

As a Developer AI (Claude), you must follow this document **strictly and exhaustively**. It contains all the context, visual design principles, secure name mappings, and page-by-page functional requirements needed to generate highly polished, production-grade Streamlit code.

---

## 1. System Overview & Development Philosophy

### 1.1 The Ultimate Goal
The goal is to build an **Interactive Portfolio Web Application** (an "Interactive Hub") that showcases a software engineer's end-to-end understanding of **complex logistics business domains, modern system architectures, and advanced agile workflows**. 
Instead of a crowded data dashboard or a casual personal website, this application must look like a **premium enterprise product showcase** (reminiscent of Stripe, Linear, or Vercel's product sites).

### 1.2 The Secure Virtual Model Rule (Zero-Leakage Policy)
To prevent any leakage of proprietary enterprise information, **all corporate names, legacy system terms, and internal identifiers are 100% abstracted into a Secure Virtual Model**. 
*   Never use raw client names, specific marine transport brand names, or internal proprietary project codes.
*   All features, simulated API payloads, and text strings must strictly use the **Global Secure Name Mapping** provided in Section 2.

### 1.3 Core UX Principles
*   **Single Purpose per Page**: The UI is divided into 4 cohesive sections using a clean navigation system. Never cram unrelated views into a single crowded page.
*   **Progressive Disclosure**: Keep initial information density low. Hide details, complex diagrams, or raw log payloads until the user explicitly clicks or acts to inspect them.
*   **Cause-and-Effect Alignment (Cockpit Layout)**: Use a 2-column layout. The **Left Column** contains controls or selection inputs (the "Cause"), and the **Right Column** dynamically displays interactive visual feedback (the "Effect") with minimal reload latency.

---

## 2. Global Secure Name Mapping

When writing Python code, generating simulation logs, or displaying descriptive cards, you must **exclusively** use the mapped virtual names on the right:

| Real-World Domain / Internal Term | Mapped Virtual Name (Use in Code/UI) | Mapped Sub-component / Description |
| :--- | :--- | :--- |
| **ONE QUOTE** | `Core Quotation Module` | The instant freight quoting engine. |
| **ONE QUOTE Flex** | `Quotation Flex Cart` | A flexible multi-port cart system allowing users to hold short-term freight rates. |
| **Loyalty Program** | `Volume Loyalty Framework` | Tiered reward logic granting coupons based on shipping volume (TEU). |
| **Digital Campaign / Marketing** | `Campaign Cohort Hub` | The AI-driven targeting and audience segmentation engine. |
| **OPUS (Legacy Base System)** | `Legacy ERP Engine` | The underlying core transactional and ocean booking system. |
| **Ocean Network Express (ONE)** | `Global Liner Alliance` | The overarching organization. |
| **Linh (Technical Advisor)** | `Technical Lead (TA)` | Engineering stakeholder. |
| **Denis (Product Owner)** | `Product Lead (PO)` | Business stakeholder. |
| **Jira / Git Flow / PR Rules** | `Agile Delivery Protocol` | The process requiring 2 peer approvals, standardized branch prefixes, and strict commit tags. |

---

## 3. Visual System & Design Tokens (Design System v2)

The application must be styled strictly according to these visual tokens. **No shadows, no gradients, no neon glow, and no rounded borders larger than 4px.** The aesthetic is **hard-edged, flat, and editorial (Enterprise-Grade UI)**.

### 3.1 Color Tokens
*   **Studio White** (`#FFFFFF`): Panel backgrounds, active containers, card faces.
*   **Clean Off-White** (`#F8FAFC`): Global application background.
*   **Neutral Border** (`#CBD5E1`): Sharp, 1px solid outlines for all containers, inputs, and buttons.
*   **Deep Charcoal** (`#0F172A`): Primary headers, page action titles, high-contrast text.
*   **Muted Slate** (`#64748B`): Secondary text, labels, metadata, and captions.
*   **Deep Crimson (Accent)** (`#E1127A`): The corporate accent. **Limit to <10% of total screen area.** Used ONLY for primary CTA buttons, active state indicators, or highlighted architecture nodes.
*   **Active Tint Background** (`#FDF2F8`): Extremely light pink background for highlighting active items.
*   **Dark Slate (Console)** (`#0F172A`): Background for simulated code blocks and API log terminals.
*   **Terminal Green** (`#34D399`): text color inside log terminals representing successful operations.

### 3.2 Fine Typography Scale
```text
Page Header Title : 32px / Bold / Deep Charcoal
Section Header    : 22px / Bold / Deep Charcoal
Body / Form Label : 15px / Regular / Deep Charcoal
Captions / Muted  : 13px / Regular / Muted Slate
Console Log / Code: 12px / Monospace / Terminal Green (or Muted Slate on Dark Slate)
```

### 3.3 Sharp Geometry
*   `border-radius`: **Strictly 4px** for all buttons, containers, cards, and input fields. Round pill-shaped buttons or 12px+ rounded edges are forbidden.
*   `border-width`: **Strictly 1px solid** for structural cards and dividers. Highlighted or active states may use **2px solid** Deep Crimson.

---

## 4. Detailed Page Architecture & Content

The Streamlit app is organized into a clean sidebar or top-nav routing system representing **4 pages (Journeys)**.

### Page 1: HOME (Portfolio Overview & Persona Entrance)
*   **Objective**: Introduce the portfolio, explain the design philosophy, and let stakeholders select a persona-based tour.
*   **Layout**: Single column, structured like a premium minimalist slide.
*   **Header Section**: 
    *   Title: `INTEGRATED PORTFOLIO: DEMONSTRATING ENTERPRISE DELIVERY`
    *   Subtitle: `A responsive case study bridging global shipping domains, modern C4 architectures, and AI-driven workflows.`
*   **Left Container (Core Concept)**:
    Explain that this hub was built using an advanced **AI-Driven Development Lifecycle (AI DLC)**—where the human architect designs strict standards, and AI acts as the compiler to achieve highly refined, production-ready code in hours.
*   **Right Container (Persona Gateways)**:
    Provide 3 horizontal cards (or elegant bordered buttons) for stakeholders to quickly understand who this site is built for:
    1.  **Business Lead Journey**: Focuses on business rules, quoting logic, and reward metrics.
    2.  **Engineering Lead Journey**: Focuses on microservices vs. monolith trade-offs and C4 architecture drill-downs.
    3.  **Process Architect Journey**: Focuses on Agile delivery protocol comparison and interactive quizzes.

---

### Page 2: CUSTOMER JOURNEY (Core Logistics & System Log Simulator)
*   **Objective**: Show an understanding of how ocean freight quotes translate into back-end technical logs.
*   **Layout**: 2-Column Cockpit.
*   **Left Column (Interactive Quotation Form)**:
    *   **POL/POD Selector**: Elegant dropdowns for Port of Loading (POL) and Port of Discharge (POD) (e.g., Tokyo, Yokohama, Singapore, Rotterdam).
    *   **Cargo Volume**: Number input for Volume in Cubic Meters (CBM).
    *   **Container Type**: Selectbox: `20' Standard GP`, `40' High Cube HC`, `40' Reefer RF`.
    *   **Loyalty Tier Toggle**: Simulates the customer's `Volume Loyalty Framework` tier (`Blue Wave`, `Silver Sail`, `Golden Sea`, `Million Magenta`).
    *   **Primary CTA Button**: A solid Deep Crimson (`#E1127A`) button labeled `Generate Quote & Simulate Call`.
*   **Right Column (Progressive Feedback Console)**:
    *   Initially displays a clean placeholder: *"Adjust parameters on the left and trigger simulation to inspect transaction sequence."*
    *   Upon clicking the CTA, render a **Dark Slate Console (`#0F172A`)** showing a simulated JSON payload flowing between the `Core Quotation Module` and the `Legacy ERP Engine`.
    *   **Simulated Log Content**: Show exact timestamps, request headers, container rates calculated based on CBM/Type, loyalty discounts automatically deducted, and a `status: 200 OK` tag in Terminal Green.

---

### Page 3: DEVELOPER JOURNEY (C4 Architecture & Tech Stack Explorer)
*   **Objective**: Prove deep comprehension of modern system architectures (Next.js, NestJS, Nginx, PostgreSQL, Kubernetes) and SaaS integrations (LaunchDarkly, Lokalise) in a microservices ecosystem.
*   **Layout**: 2-Column Cockpit.
*   **Left Column (Interactive Architecture Map)**:
    *   Embed a clean, flat **Mermaid.js C4 Diagram** representing the secure system flow:
      ```mermaid
      graph TD
          subgraph Frontend
              A[Web Portal: Next.js]
          end
          subgraph Gateway
              B[Routing Gateway: Nginx]
          end
          subgraph Microservices
              C[Quotation Service: NestJS]
              D[Campaign Service: NestJS]
          end
          subgraph Storage
              E[Relational DB: PostgreSQL]
          end
          A --> B
          B --> C
          B --> D
          C --> E
          D --> E
      ```
    *   Provide a dropdown or radio button list to select a component to inspect:
        `[Routing Gateway (Nginx)]`, `[API Services (NestJS)]`, `[Data Warehouse (PostgreSQL)]`, `[Feature Flag Service (LaunchDarkly Mapped)]`, `[Translation API (Lokalise Mapped)]`.
*   **Right Column (What / When / How Technical Explorer)**:
    *   Dynamically render a clean, bordered white card matching the selected tech.
    *   The card must have three clear sections:
        *   **WHAT is this?**: Clear definition of the technology.
        *   **WHEN is it used?**: Realistic business or scaling scenario.
        *   **HOW does it operate?**: Safe, abstracted conceptual configuration or connection code snippet (e.g., config YAML, API gateway mapping, block of connection code).

---

### Page 4: PROCESS JOURNEY (Agile Scrum vs. AI DLC Showcases)
*   **Objective**: Show expertise in delivery processes and test understanding of the organization's rules.
*   **Layout**: 2-Column Cockpit.

#### 4.1 Left Column (The Metaphor of the Two Rooms - Interactive Slider)
Instead of boring process bullet points, present an interactive comparison using the **Metaphor of the Two Rooms (Logistics Cargo Sorting)** to explain Agile Scrum vs. AWS AI DLC.
*   Provide a toggle or selectbox: `[View Room A: Traditional Agile]` vs. `[View Room B: AWS AI DLC]`.
*   **Room A (Traditional Agile - Manual Bottleneck)**:
    *   *Visual representation*: Display a structured grid using standard ASCII art or a clean Streamlit table showing separated compartments.
    *   *Explanation*: "Imagine an enclosed warehouse room partitioned by high partition walls. Human workers must assemble cardboard boxes (tasks), hand-write shipping labels (commit formatting), manually inspect each item (unit test), and stack boxes in front of a narrow security gate waiting for 2 managers' schedules to free up (PR approvals). The room is highly structured, but cargo is constantly piling up in front of the gate (Review Bottleneck)."
*   **Room B (AWS AI DLC - High-Speed Conveyor)**:
    *   *Visual representation*: A clean grid showing a continuous line flowing through automated checkpoints.
    *   *Explanation*: "The partition walls are entirely removed. Workers sit at a centralized console, making strategic decisions on which cargo to ship. The moment cargo is placed on the conveyor belt, an AI-powered robotic arm instantly wraps the boxes, automatically prints flawless labels, and runs automated laser scanning (AI automated tests and PR reviews) to fix defects in 2 milliseconds before streaming cargo directly into the container trucks. Flow is continuous, friction-less, and instantaneous."

#### 4.2 Right Column (The Ultimate Onboarding Mini-Quiz)
An interactive 5-question multiple-choice quiz designed to test knowledge on the team's onboarding rules, Loyalty program TEU milestones, and logistics definitions.
*   **Quiz Content**:
    *   *Q1: What is the mandatory commit message tag structure under the Agile Delivery Protocol?* 
        *   Options: A) Just free text, B) `[Ticket_ID] Commit Message`, C) Standard GitHub format. (Correct: B)
    *   *Q2: Under the Volume Loyalty Framework, what is the TEU milestone interval required for a "Blue Wave" customer to earn performance rewards?* 
        *   Options: A) Every 1 TEU, B) Every 5 TEUs, C) Every 10 TEUs. (Correct: B)
    *   *Q3: How many peer approvals are strictly required before a Pull Request can be merged in the repository?* 
        *   Options: A) 1 approval, B) 2 or more approvals, C) None, only green build. (Correct: B)
*   **Interactive behavior**: Use `st.radio` for inputs. When a user submits their answers, display immediate, clear green/red status boxes with professional educational explanations for each question.

---

## 5. Streamlit Code Construction Guidelines

To implement this perfectly in Python/Streamlit, use the following code patterns:

### 5.1 CSS Custom Styling (Sharp & Minimalist Injection)
Inject this CSS block globally using `st.markdown(..., unsafe_allow_html=True)` to enforce Design System v2 borders, roundings, and clean off-white background:

```python
import streamlit as st

st.set_page_config(
    page_title="PORTFOLIO: Interactive Hub",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Premium Enterprise Aesthetics (V2 Design System)
st.markdown("""
<style>
    /* Global Background and Fonts */
    .stApp {
        background-color: #F8FAFC !important;
        font-family: 'Inter', system-ui, sans-serif !important;
    }
    
    /* Strict Hard-Edged Structural Elements */
    div[data-testid="stVerticalBlock"] > div {
        background-color: #FFFFFF;
        border: 1px solid #CBD5E1 !important;
        border-radius: 4px !important;
        padding: 1.5rem !important;
        margin-bottom: 1rem !important;
    }
    
    /* Disable round edges on buttons and forms */
    .stButton>button {
        border: 1px solid #CBD5E1 !important;
        border-radius: 4px !important;
        background-color: #FFFFFF !important;
        color: #0F172A !important;
        font-weight: 500 !important;
        transition: all 0.2s ease;
    }
    
    /* Primary Action Highlight (Accent Color Limit < 10%) */
    .stButton>button:hover {
        border-color: #E1127A !important;
        color: #E1127A !important;
        background-color: #FDF2F8 !important;
    }
    
    /* Console Terminal Box */
    .console-box {
        background-color: #0F172A !important;
        color: #34D399 !important;
        font-family: 'SFMono-Regular', Consolas, monospace !important;
        padding: 1rem !important;
        border-radius: 4px !important;
        border: 1px solid #0F172A !important;
        font-size: 12px !important;
        line-height: 1.6 !important;
    }
</style>
""", unsafe_allow_html=True)
```

### 5.2 Embedding C4 Mermaid.js Charts Elegantly
To render C4 models with pure HTML integration in Streamlit (preventing laggy external image fetching), use this pattern:

```python
import streamlit.components.v1 as components

def draw_mermaid_chart(selected_tech=None):
    # Set default styles
    nx_style = "style NX fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1px;"
    ns_style = "style NS fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1px;"
    pg_style = "style PG fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1px;"
    
    # Highlight matching node with Magenta and Active Tint
    if selected_tech == "Nginx":
        nx_style = "style NX fill:#FDF2F8,stroke:#E1127A,stroke-width:2px;"
    elif selected_tech == "NestJS":
        ns_style = "style NS fill:#FDF2F8,stroke:#E1127A,stroke-width:2px;"
    elif selected_tech == "PostgreSQL":
        pg_style = "style PG fill:#FDF2F8,stroke:#E1127A,stroke-width:2px;"

    mermaid_code = f"""
    <div class="mermaid">
    graph TD
        A[Next.js Portal] --> NX[Routing Gateway: Nginx]
        NX --> NS[API Service: NestJS]
        NS --> PG[Relational DB: PostgreSQL]
        
        {nx_style}
        {ns_style}
        {pg_style}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>mermaid.initialize({{startOnLoad:true, theme:'neutral'}});</script>
    """
    components.html(mermaid_code, height=350)
```

By adhering to this spec sheet, you will generate structured, clean, and bug-free Streamlit scripts that Futo can execute locally to build an enterprise-grade portfolio. Prioritize typographic hierarchy, sharp lines, and semantic precision over flashy widgets.

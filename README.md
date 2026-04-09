<div align="center">

<img src="https://picsum.photos/seed/codementor/200" alt="CodeMentor AI" width="120" style="border-radius: 24px; margin-bottom: 20px;"/>

# CodeMentor AI

### *The only coding mentor that remembers every mistake you've ever made*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge)](https://ai-coding-mentor-eight.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge)](https://github.com/amankr2776/ai-coding-mentor)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)](https://groq.com)
[![Hindsight](https://img.shields.io/badge/Hindsight-Memory-purple?style=for-the-badge)](https://hindsight.vectorize.io)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com)

> Built for the **Hindsight Hackathon** — *AI Agents That Learn Using Hindsight*

</div>

---

## The Problem Nobody Is Solving

As software engineers, we've all been there. You spend hours debugging a race condition or a complex recursion base case, finally solve it, and move on. Two weeks later, you're staring at a similar problem on a different platform, and you've forgotten the specific nuance that tripped you up last time. You're stuck in a **linear learning loop**, effectively starting from zero every single day.

Existing platforms like LeetCode, HackerRank, and Codecademy are excellent for volume, but they suffer from **"Context Amnesia."** They treat every session as a fresh start. They don't know that you consistently struggle with off-by-one errors in binary search, or that you have a habit of forgetting to handle empty list inputs in Python. They serve you generic problems that might not even touch your actual "neural weaknesses."

CodeMentor AI is the first platform to solve this by connecting your past failures to your future challenges. We've built an environment where **failures are assets**. By capturing the exact vector of every logic error, syntax slip, and requested hint, we create a persistent "Living Mental Model" of the student. We don't just teach you how to code; we ensure you never make the same mistake twice.

## What Makes CodeMentor AI Different

| Feature | LeetCode / HackerRank | CodeMentor AI |
| :--- | :---: | :--- |
| **Long-Term Memory** | ❌ None (Session-based) | ✅ **Hindsight-Powered (Permanent)** |
| **Problem Generation** | Static / Random | ✅ **Adaptive (Targets your specific errors)** |
| **Logic Diagnostics** | Basic Test Cases | ✅ **Deep Neural Scan (Line-by-line why)** |
| **Learning Path** | Linear | ✅ **Recursive (Closes your logic gaps)** |
| **Mental Modeling** | ❌ No | ✅ **Automated Neural Profiling** |

## How Hindsight Powers Everything

Hindsight isn't just an add-on in this project; it is the **architectural backbone**. We utilize the Hindsight SDK to transform a standard coding environment into a truly intelligent agent.

### `retain()` — Saving Every Mistake
We don't just track "Correct" or "Wrong." Every time a user interacts with the platform, we archive the semantic context of that event.
```typescript
// From src/app/api/problems/submit/route.ts
await hindsight.retain(
  `User practiced ${topic} in ${language}. Result: failure. Error: ${rootCause}`,
  { type: 'failure', topic, language, difficulty, title }
);
```
**When it's called:** Immediately after a code submission, a quiz finalization, or a hint request. This ensures that every "struggle" is immortalized in your personal learning matrix.

### `recall()` — Personalized Intelligence
Before generating a challenge, the AI Mentor "remembers" your history. It doesn't just guess; it retrieves the most relevant struggles.
```typescript
// From src/app/actions/practice.ts
const memories = await hindsight.getHistory();
const weaknessSummary = memories.slice(0, 20).map(m => m.content).join("\n");
// This context is injected into the Groq Llama-3 prompt to shape the next problem.
```
**The Impact:** If you've failed "Dynamic Programming" problems three times this week, the system identifies that cluster and generates a tailored challenge focusing specifically on your identified "logic resistance."

### `reflect()` — Pattern Recognition
Every 5 practice sessions, the system triggers a `reflect` task. Hindsight analyzes the history to find high-level patterns that a human might miss.
*   **Result:** "User is proficient in Python syntax but consistently fails at Space Complexity optimization in Matrix problems."
*   **Action:** This updates the Dashboard's **Neural Insights**, giving the user a meta-view of their cognitive behavior.

### `createMentalModel()` — Deep Learning Profile
Every 10 interactions, we generate a formal **Mental Model**. This is a synthesized profile of the user's technical identity.
*   **Goal:** It summarizes strengths (e.g., "Fast logic implementation") and critical weaknesses (e.g., "Weak edge-case handling").
*   **Usage:** This model acts as the "system prompt override" for the AI Mentor, ensuring it talks to you like a coach who knows your entire career history.

## Architecture

Our architecture is designed for high-velocity inference and deep state persistence. We've eliminated the need for external code execution hardware by implementing a **Neural Simulation Engine**.

```text
┌─────────────────────────────────────────────────────────┐
│                    CodeMentor AI                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   Next.js    │───▶│  API Routes  │───▶│  Groq AI  │  │
│  │   Frontend   │    │ (Serverless) │    │  LLaMA 3  │  │
│  └──────────────┘    └──────┬───────┘    └───────────┘  │
│                             │             (Brain & Sim)  │
│                    ┌────────▼────────┐                   │
│                    │    Hindsight    │                   │
│                    │  Memory System  │                   │
│                    │                 │                   │
│                    │ • retain() logs │                   │
│                    │ • recall() ctx  │                   │
│                    │ • reflect()     │                   │
│                    │ • mentalModels  │                   │
│                    └─────────────────┘                   │
│                             │                            │
│                    ┌────────▼────────┐                   │
│                    │ Unified Neural  │                   │
│                    │ Logic Gate      │                   │
│                    │ (Zero-Hardware) │                   │
│                    └─────────────────┘                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Features

### 🧠 Memory-Powered Learning
*   **Adaptive Problem Generation**: Challenges evolve based on your Hindsight memory bank.
*   **Neural Insights Dashboard**: Visual breakdown of real cognitive patterns retrieved from history.
*   **Pattern-Aware Hints**: AI provides "nudges" based on where you usually get stuck.
*   **Logic Persistence**: Every mistake is archived as a vector for long-term improvement.
*   **Automated Mental Models**: The system builds a technical persona of the user automatically.

### 💻 Code Practice
*   **14+ Languages Supported**: From Python and Rust to SQL and Kotlin.
*   **Neural Execution Simulation**: Mentally execute code via Groq for instant, keyless feedback.
*   **Line-by-Line Neural Explain**: High-fidelity breakdown of any code snippet's logic.
*   **Free Practice Mode**: Submit any custom code for an architectural and complexity scan.
*   **Strict Evaluation Protocol**: Syntax, logic, and output verified by a unified AI gate.

### 🎯 Personalization
*   **Engineer Persona**: Customize your primary stack and daily goals in your profile.
*   **Cross-Vector Conversion**: Instantly translate logic patterns between all 14 languages.
*   **Smart Tips**: Punchy, highly-specific technical advice generated from your real history.
*   **History Archive**: Search and review every past session synchronized with the cloud.
*   **Difficulty Calibration**: Manually adjust neural intensity from Easy to Hard.

### 📊 Progress Tracking
*   **Mastery Heatmaps**: Track your success rate across different algorithmic topics.
*   **Activity Streams**: Real-time visualization of memory sync and session events.
*   **Language Distribution**: See where your technical strengths lie across different stacks.
*   **Solving Velocity**: Analyze your consistency through the weekly activity chart.
*   **Neural Leveling**: Advance your rank from "Junior Learner" to "Senior Architect."

### 🎮 Gamification
*   **XP System**: Earn experience points based on the difficulty of solved challenges.
*   **Neural Streak**: Maintain daily consistency to keep your streak alive.
*   **Achievement Badges**: Unlock status markers based on accuracy and topic mastery.
*   **Dynamic Quote Engine**: Start every session with a technically-inspired logic quote.
*   **Premium Dark UI**: A high-fidelity "Engineer Persona" interface with smooth animations.

## Tech Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js | 15.x | App Router, Server Components |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first responsive design |
| **UI Components** | Radix UI / Shadcn | Latest | Accessible, high-fidelity components |
| **Memory** | **Hindsight** | 0.4.x | Long-term vector memory & reflection |
| **LLM Engine** | **Groq SDK** | 0.15+ | Hyper-fast Llama-3.3 inference |
| **API Layer** | Next.js Routes | - | Serverless execution logic |
| **Simulation** | Pure Neural | - | Mentally executed logic simulation |

## Environment Variables

To run CodeMentor AI locally, you must configure these variables in your `.env.local` file:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Groq API key for hyper-fast inference | ✅ Yes | `gsk_...` |
| `HINDSIGHT_API_KEY` | Hindsight Cloud API key from Vectorize.io | ✅ Yes | `hsk_...` |
| `HINDSIGHT_BANK_ID` | Your specific memory bank identifier | ✅ Yes | `abhimanu` |
| `NEXT_PUBLIC_API_URL` | Base URL for API requests (internal) | ⚠️ Optional | `http://localhost:3000` |

## Getting Started

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/amankr2776/ai-coding-mentor
    cd ai-coding-mentor
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file and add your `GROQ_API_KEY` and `HINDSIGHT_API_KEY`.

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Navigate to [http://localhost:3000](http://localhost:3000) to initialize your first neural session.

## The Memory Flow in Action

Imagine **Aman**, a learner struggling with Recursion.
1.  **Monday**: Aman attempts a Fibonacci problem. He fails because he forgot the base case. Hindsight `retain()` saves: *"User failed Fibonacci in JS. Error: Infinite recursion (missing base case)."*
2.  **Wednesday**: Aman logs back in. The AI Mentor calls `recall()`. It sees the Monday failure. Instead of a random problem, it generates a **Tailored Recursion Challenge** specifically designed to test base-case logic.
3.  **Friday**: After 10 sessions, `reflect()` identifies a pattern: *"Aman is excellent at iterative loops but lacks 'Base Case Integrity' in recursive structures."*
4.  **The Result**: The Dashboard now shows "Recursion" as an **Optimization Priority**, and the AI Mentor provides specific "Smart Tips" on identifying recursive termination points.

## Judging Criteria Alignment

| Criterion | Weight | Our Approach |
|-----------|--------|--------------|
| **Innovation** | First-of-its-kind "Recursive Learning" platform using long-term semantic memory. |
| **Hindsight Memory** | Deep, structural integration of `retain`, `recall`, and `reflect` to drive core logic. |
| **Technical Implementation** | High-fidelity stack with Next.js 15, Groq Llama-3, and a zero-hardware simulation engine. |
| **User Experience** | Premium, low-latency UI with a "Software Architect" aesthetic and gamified progression. |
| **Real-world Impact**  | Directly addresses the "Learning Plateau" for developers by closing logic gaps permanently. |

## Supported Languages

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)
![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=flat-square&logo=c%2B%2B&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=java&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=flat-square&logo=postgresql&logoColor=white)


## Contributing

We welcome contributions from the engineering community. Please ensure your PRs include appropriate Hindsight memory tracking for any new learning modes.

## License

This project is licensed under the MIT License.

## Acknowledgments

*   **Hindsight Team (Vectorize.io)**: For the incredible memory infrastructure.
*   **Groq**: For the hyper-fast inference speeds that make neural simulation possible.
*   **Hackathon Organizers**: For pushing the boundaries of AI Agent development.

---
Built with ❤️.

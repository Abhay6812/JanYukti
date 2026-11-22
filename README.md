# 🌱 JanYukti (Haq) — Farmer Benefits Finder

> **Making government benefits accessible to every farmer through AI-powered guidance, simple language, and transparent eligibility checks.**

JanYukti is a voice-friendly, multilingual platform designed specifically for small farmers in Maharashtra. It helps farmers discover government schemes relevant to their situation, understand their eligibility, identify required documents, and follow application procedures without navigating complicated government portals or relying on intermediaries.

🔗 **Live Demo:** https://janyukti.vercel.app/ 
💻 **GitHub Repository:** https://github.com/Abhay6812/JanYukti

---

## 🎯 The Problem

Government welfare schemes are designed to support farmers, but many eligible beneficiaries struggle to access them because:

- Scheme information is scattered across multiple government portals.
- Eligibility criteria are often difficult to understand.
- Farmers may be unaware of benefits available to them.
- Language barriers and digital literacy create additional challenges.
- Many farmers depend on intermediaries for information and application assistance.

As a result, eligible farmers may miss benefits they are entitled to receive.

---

## 💡 Our Solution

JanYukti simplifies the process of discovering and understanding government schemes through an accessible, AI-assisted experience.

Farmers can describe their land, crops, and circumstances using voice or text. The platform processes this information, checks it against predefined scheme eligibility rules, and presents understandable results along with guidance on what to do next.

Our goal is to make government benefits easier to discover, understand, and access—without unnecessary complexity.

---

## 👥 Target Users

- Small and marginal farmers in Maharashtra.
- Farmers with limited digital literacy.
- Users who prefer Marathi or Hindi over English.
- Farmers unfamiliar with government scheme portals.
- Community service centres and field workers assisting beneficiaries.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎙️ Voice-Based Input | Farmers can describe their situation using voice instead of typing. |
| 🌐 Multilingual Experience | Supports English, Hindi, and Marathi. |
| 👤 Farmer Profile Understanding | Identifies relevant details such as landholding, crop, and ownership circumstances. |
| 📋 Eligibility Assessment | Checks user information against predefined scheme rules. |
| 🤖 AI-Powered Assistance | Simplifies user input and explains scheme information in understandable language. |
| 📑 Document Checklist | Displays documents required for the respective scheme. |
| 🧭 Application Guidance | Provides application steps and relevant official links. |
| 📊 Scheme Tracker | Helps users track application progress. |
| 🔔 Deadline Awareness | Displays scheme-related deadline reminders. |
| 🔍 Transparent Results | Explains why a farmer may qualify or may not qualify for a scheme. |

---

## ⚙️ How JanYukti Works

### Step 1 — Tell Us About Your Situation
Farmers can describe their agricultural circumstances using voice or text, including details such as land size, crop, and ownership.

### Step 2 — Profile Confirmation
The system summarizes the information it understood and allows the user to confirm or correct it.

### Step 3 — Eligibility Questions
JanYukti asks additional questions only when the missing information is required to evaluate a scheme.

### Step 4 — Scheme Evaluation
A rule-based eligibility engine evaluates the farmer's profile against available scheme criteria.

### Step 5 — Personalized Results
Farmers receive scheme-specific results, including:

- Eligibility status
- Reason behind the eligibility decision
- Missing requirements
- Required documents
- Application procedure
- Official application links

### Step 6 — Track Progress
Users can track the status of schemes they are interested in and keep track of their application journey.

---

## 🛠️ Our Development Journey

Our journey with JanYukti began with brainstorming ideas using pen and paper. We discussed the core problem, explored possible solutions, and mapped our initial concepts against the problem statement. Before moving forward, we carefully examined the hackathon requirements, eligibility criteria, and feasibility of our proposed approach. This helped us identify what was genuinely necessary and refine our initial ideas into a more practical solution.

As development progressed, we revisited our original plan, evaluated our proposed features, and made several changes to the functionality and user experience. We explored CodeBenders' development environment and its capabilities during our workflow, while continuously refining the project's architecture, feature priorities, and implementation approach. Our focus throughout these iterations was to build a solution that was practical, accessible, and aligned with the actual needs of Maharashtra's farmers.

---

## 🧠 AI + Rule-Based Architecture

JanYukti uses AI for understanding and communication—not for making unchecked eligibility decisions.

### AI Layer
Responsible for:

- Understanding natural-language farmer input.
- Processing voice or text responses.
- Extracting relevant profile information.
- Asking contextual follow-up questions.
- Explaining scheme information in simpler language.

### Eligibility Engine
Responsible for:

- Evaluating structured farmer information.
- Applying predefined scheme eligibility criteria.
- Identifying missing requirements.
- Generating consistent eligibility results.

### Why This Approach?

Combining AI with a rule-based eligibility system helps reduce unpredictable results.

AI interprets the user's input, while the eligibility engine applies structured conditions. This makes scheme evaluations more explainable and prevents AI-generated assumptions from directly determining eligibility.

---

## 🏛️ Design Principles

### Maharashtra-Focused
Instead of attempting to cover every state, JanYukti focuses on Maharashtra to provide a more relevant experience for its target users.

### Accessibility First
The interface prioritizes simple language, voice interaction, and clear actions.

### No Unnecessary Login
Farmers can begin using the platform without being forced through complicated signup or login procedures.

### Privacy-Conscious
The platform avoids collecting unnecessary sensitive personal information.

### Explainable Decisions
Every eligibility result should provide understandable reasons rather than simply displaying a result.

### Honest Guidance
The platform provides guidance about likely eligibility and never promises guaranteed government approval.

---

## 📊 Advantages & Impact

- Reduces the difficulty of discovering government schemes.
- Makes scheme information easier to understand.
- Helps farmers identify potentially available benefits.
- Reduces dependence on middlemen for basic scheme information.
- Supports Marathi and Hindi-speaking users.
- Makes eligibility requirements more transparent.
- Provides a structured path from scheme discovery to application.
- Promotes awareness of government benefits among rural communities.

---

## ⚠️ Limitations

- Currently covers a limited set of government schemes.
- Scheme information requires periodic manual verification and updates.
- AI responses may take several seconds.
- Voice recognition may be affected by dialects and background noise.
- Application tracking is currently device-based.
- No automated submission to government portals.
- Deadline reminders are currently limited to the application experience.

---

## 🚀 Future Roadmap

- Expand coverage to more government schemes across Maharashtra.
- Add more regional-language and dialect support.
- Improve voice recognition for rural environments.
- Introduce a centralized database for scheme updates.
- Implement automatic scheme-change monitoring.
- Add optional secure user accounts and synchronization.
- Enable offline access for essential scheme information.
- Introduce notifications for important deadlines.
- Build an analytics dashboard to measure community impact.

---

## 💻 Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript |
| Build Tool | Vite |
| Styling | Modern CSS / Tailwind-based UI |
| AI Integration | Gemini API |
| Eligibility Logic | Rule-based evaluation engine |
| Data Management | JSON-based scheme information |
| Backend / Services | Application-integrated services |
| Deployment | Web deployment platform |

*The technology stack may evolve as development progresses.*

---

## 📂 Project Structure

```text
JanYukti/
├── public/
├── src/
│   ├── components/
│   ├── screens/
│   ├── data/
│   ├── rules/
│   ├── ai/
│   └── ...
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

*The structure above represents the logical organization of the application.*

---

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Abhay6812/JanYukti.git
```

### 2. Navigate to the Project

```bash
cd JanYukti
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file using `.env.example` as a reference and configure the required API credentials.

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit API keys or secrets to GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

---

## 🌍 Vision

We envision a future where every farmer can access the government support available to them without confusion, technical barriers, or unnecessary dependency on intermediaries.

**JanYukti aims to bridge the gap between government welfare schemes and the people they are designed to serve.**

---

## ⚖️ Disclaimer

JanYukti is an independent informational platform and is not affiliated with or endorsed by any government department.

It provides guidance based on available scheme information and does not guarantee eligibility, approval, or financial assistance. Final eligibility and approval are determined by the respective government authorities.

Government scheme applications are generally free through official channels. Users should verify information through official government sources before applying.

---

## 👥 Contributors

Developed as part of a hackathon project focused on solving real-world problems through technology.

---

<p align="center">
  <b>JanYukti — Making every farmer aware of their rightful benefits. 🌱</b>
</p>

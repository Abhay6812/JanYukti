# JanYukti (Haq) – Farmer Benefits Finder

**Live demo:**

A voice-friendly web app built **only for small farmers of Maharashtra**. A farmer describes their land and crop by voice or tap, and the app shows which government schemes they are **likely** eligible for, why, which documents to gather, how to apply, and when deadlines fall.

> Haq means "right": a farmer's right to the benefits made for them, explained in their own language, for free.

---

## The problem

- Scheme rules are scattered across many portals and written in complex language.
- Eligible families miss benefits.
- Many farmers pay middlemen for help that is free.

## Who it is for

- A small farmer in Maharashtra, often with low literacy and a basic phone.
- A field worker or service-centre operator helping many farmers.

---

## Features

| Area | What it does |
|---|---|
| Home | Speak or type about land, crop and situation. Language: English, Hindi, Marathi. Demo profile buttons for quick testing. |
| Confirm | Reads back what was understood (e.g. "2 acres, cotton, land in father's name"). Farmer taps Yes or Edit. |
| Questions | Only questions that change the result, one at a time, big tap buttons. |
| Results | Per-scheme card: Likely eligible / Not eligible / Need more info, the exact rule behind it, near-miss tip, document checklist, apply steps, official link, "Last verified" date, and a "Never pay anyone, applying is free" banner. |
| Tracker | Status per scheme (Not started, In progress, Submitted, Approved) with season-based deadline reminders. |
| Voice assistant | Same flow as typing: speak, confirm, answer, results. |
| Admin | Account creation only (see limitations). |

## How it works

1. **AI reads and explains only.** The Gemini API turns speech or text into structured facts and writes the explanation in simple language.
2. **A plain rules engine decides eligibility.** Scheme rules are stored as editable data, not hidden in code.
3. **Missing fact → "Need more info".** The app never guesses.

Because the AI cannot decide eligibility, a wrong AI guess cannot change a result. The Confirm screen lets the farmer correct misheard input.

## Design decisions

- **Maharashtra only.** One state, one user, one pain.
- **No login or signup for farmers.** Many small farmers forget passwords, share phones, or get confused by signup screens, so the app opens straight to the input box. No password, no OTP.
- **Zero personal data.** No Aadhaar or ID numbers are collected. Only public scheme data and sample profiles are used.
- **Honest wording.** The app says "likely eligible", never "guaranteed". The government office makes the final decision.

---

## Advantages

- Voice and multilingual support for low-literacy users
- Explainable results: every decision shows its rule
- No farmer login; nothing personal collected
- Free for the farmer, reduces dependence on middlemen
- Clear, readable explanations from Gemini
- Scheme rules can be updated as data

## Limitations

- Covers a small set of real schemes, verified by hand from official sites; data can go out of date until re-checked
- No automatic scheme-change detection yet
- Gemini responses can be slow (a few seconds); the voice assistant is also limited by credits
- Speech recognition may struggle with dialects and background noise
- No farmer accounts, so progress is saved only on the device and does not sync across phones
- Admin portal implements account creation only. Rule editing with live results and change history needs an extra database, which our credits did not allow
- Tracker reminders are in-app only; no real push notifications
- No payments, and no auto-submission of applications on government portals

---

## Roadmap

- Full admin portal with a proper database: rule editing, live result preview, change history
- Optional farmer accounts using simple phone-number OTP
- More schemes and districts in Maharashtra
- Automatic scheme-change detection
- Real push notifications and offline mode
- Impact dashboard for partners

## Business viability

NGOs, CSR teams, banks and service centres could pay per farmer helped or monthly, and receive an impact dashboard (farmers reached, schemes unlocked).

---

## Tech stack

> Update this section to match the repository.

- Frontend: web app deployed on Google Cloud Run
- AI: Gemini API (speech understanding and explanations)
- Eligibility: rules engine reading scheme data as JSON
- Storage: on the user's device
- Languages: English, Hindi, Marathi

## Getting started

> Replace with the real commands for your repo.

```bash
git clone <your-repo-url>
cd <repo-folder>
npm install
cp .env.example .env     # add your Gemini API key
npm run dev
```

Never commit API keys. Keep them in environment variables on the server.

## Project structure

> Fill in once final.

```
/src
  /screens      Home, Confirm, Questions, Results, Tracker, Admin
  /rules        Rules engine
  /data         Scheme data (JSON)
  /ai           Gemini calls
```

## Disclaimer

JanYukti gives guidance on **likely** eligibility based on public scheme information. It is not an official government service and does not guarantee approval. Always confirm on the official scheme website or at the relevant office. Applying for government schemes is free; never pay anyone for it.

## License

Add your open-source license here (for example MIT).

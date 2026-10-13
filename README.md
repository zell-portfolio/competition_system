# Offline Competition

A web-based competition system that runs without a backend server. Participants complete the questions while **offline**; if an internet connection is detected during the exam, the session is terminated. Once they have finished, participants reconnect to the internet to submit their answers to Google Sheets.

**Tech Stack:** HTML + CSS + JavaScript (single file) · Google Apps Script · Google Sheets · GitHub Pages

## Features

- Per-question countdown timers with different durations for each question.
- Online connection detection using periodic pings (rather than relying solely on `navigator.onLine`, which is often inaccurate).
- Configurable tolerance for online connection detection (`TOLERANSI`).
- Answers and state are saved in `localStorage`; timers use timestamps so they do not reset when the page is reloaded.
- Questions and answer options are randomized for each participant (grading remains accurate because answer keys are matched using the original option indices).
- Start schedules and entry deadlines; late submissions or unusual durations are flagged in the _Notes_ column.
- Tab switching, app switching, split-screen mode, and screen size changes are detected; questions are locked when the page becomes inactive.
- Page reloading, right-clicking, copying, and common keyboard shortcuts are disabled.
- Grading is performed in Apps Script, so answer keys are not stored in the HTML file.
- Each participant code can be used to submit answers only once.

## Participant Workflow

1. Open the link and enter a name and participant code while online.
2. Turn off mobile data/Wi-Fi (airplane mode); the Start button becomes active once the system detects that the device is offline.
3. Answer the questions one at a time until the allotted time runs out.
4. Once finished, reconnect to the internet and click **Submit Answers**.

## Installation Guide

### 1. Set Up Google Sheets

1. Create a new Google Sheet.
2. Open **Extensions > Apps Script** and paste the contents of `Code.gs`.
3. Configure `KUNCI` (the correct answer option indices, starting from 0, in the same order as the original `SOAL` array—not the randomized order). Then configure `WAKTU_MULAI`, `BATAS_KIRIM`, and `TOTAL_DETIK` (the total duration of all questions in seconds).
4. Click **Deploy > New deployment > Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL (ending in `/exec`).

### 2. Configure `index.html`

Update the `CONFIG` and `SOAL` sections inside the `<script>` tag.

| Setting                       | Description                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `APPS_SCRIPT_URL`             | The Web App URL from the previous step                                                                   |
| `TOLERANSI`                   | Online detection tolerance (`0` = immediate termination)                                                 |
| `TOLERANSI_TAB`               | Tolerance for tab switching/split-screen (`0` = immediate termination)                                   |
| `WAKTU_MULAI` / `WAKTU_TUTUP` | Competition schedule, using ISO format with a time zone (e.g., `+08:00` for Central Indonesia Time/WITA) |
| `PING_MS`                     | Connection check interval in milliseconds                                                                |
| `SOAL[].waktu`                | Duration of each question in seconds                                                                     |

### 3. Publish the Website

Push the files to GitHub, then enable **Settings > Pages > Deploy from branch (main)**. Share the GitHub Pages link with participants.

> Whenever `Code.gs` is modified, create a **New deployment** (or go to Manage deployments and edit the version) for the changes to take effect.

## Important Limitations

- Screenshots cannot be blocked on the web. Randomizing questions and answer options only reduces the impact.
- Strict mode may terminate a participant's session unfairly (e.g., due to incoming calls or full-screen notifications). Adjust `TOLERANSI_TAB` according to your needs.
- During testing, clear the browser's site data whenever you change the code, because old state may remain stored in `localStorage`.
- **This system is not completely cheat-proof.** Participants can still use a second phone or laptop. The system only prevents internet access on the same device used for the exam.
- Questions are loaded when participants are initially online, so they may be accessible through browser DevTools. This system is suitable for small-scale competitions, not high-stakes examinations.
- Do not refresh the page while offline: the browser cannot reload the page without an internet connection.
- Participants can change their device clocks. Compare the _Submission Time_ and _Duration_ columns in Google Sheets to identify suspicious anomalies.
- Participants who close the browser or clear browser data before submitting will lose their answers.
- Test the system on several devices (Android and iPhone) before competition day.

## Project Structure

```text
.
├── index.html   # Participant interface and exam logic
├── Code.gs      # Google Apps Script: receives answers, grades them, and saves results to Sheets
└── README.md
```

## License

MIT

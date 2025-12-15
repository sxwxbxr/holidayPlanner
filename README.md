# holidayPlanner – Shared Time & Gaming Planner

holidayPlanner ist eine kleine Next.js-App, gehostet auf Vercel, mit der du zusammen mit deiner Freundin und deinem Freund eure Zeit planen kannst. Ziel: Schnell sehen, wann wer verfügbar ist, Paarzeit und Gaming-Sessions (z.B. R6) synchron planen und Konflikte vermeiden.[1][2][3][4]

## Features

- Gemeinsame, webbasierte Wochen-/Tagesansicht (responsive) für alle Beteiligten.[4][1]
- Benutzerrollen: „Ich“, „Partner:in“, „Freund“ mit eigenen Farben.  
- Slots für: „Gym“, „Paarzeit“, „Gaming mit Freund“, „Busy/Blocked“.  
- Gemeinsames Board (z.B. 19.12.25–04.01.26) mit übersichtlicher Darstellung der verfügbaren Zeiten.[5][6]
- Änderungen werden über einfache API-Calls gespeichert, Seite kann per Refresh/Revalidate aktualisiert werden (kein schweres Realtime nötig).[7][8]

## Tech Stack

- Framework: Next.js (App Router, TypeScript).[1]
- Hosting: Vercel (Preview Deployments pro Branch, Auto-Builds).[2][9]
- UI: Tailwind CSS + shadcn/ui für schnelle, konsistente Komponenten.[1]
- Datenbank: Neon Serverless Postgres (über `@neondatabase/serverless` oder `postgres.js`).[10][7]

## Datenbankmodell (Neon)

Minimaler Vorschlag:

- `users`  
  - `id` (uuid)  
  - `name` (text)  
  - `color` (text)  

- `boards`  
  - `id` (uuid)  
  - `title` (text)  
  - `date_from` (date)  
  - `date_to` (date)  

- `slots`  
  - `id` (uuid)  
  - `board_id` (uuid, FK)  
  - `user_id` (uuid, FK)  
  - `start` (timestamptz)  
  - `end` (timestamptz)  
  - `type` (text, z.B. `GYM`, `COUPLE_TIME`, `R6_WITH_FRIEND`, `BUSY`)  

Die App liest/schreibt diese Daten über Next.js Route-Handler oder Server Actions, die direkt auf Neon zugreifen.[8][7]

## Getting Started

### Voraussetzungen

- Node.js LTS installiert.  
- pnpm / npm / yarn installiert.  
- GitHub-Repo (für Vercel Deployment).
- Neon-Account + ein Postgres-Project (Connection String).

### Installation

```bash
# Projekt klonen
git clone <REPO_URL> webplanner
cd webplanner

# Dependencies installieren
pnpm install
# oder: npm install / yarn install
```



## Grundkonzept der App

- Kalender-Grid (z.B. 7 Tage x Zeit-Slots), in dem jede Person ihre Verfügbarkeit setzt.  
- Slot-Typen (Enum/Union im Code):  
  - `GYM`  
  - `COUPLE_TIME`  
  - `R6_WITH_FRIEND`  
  - `BUSY` / `FREE`  
- Logik:  
  - Zeigt Überschneidungen und gemeinsame freie Zeitfenster an.  
  - Markiert Konflikte, z.B. wenn R6-Session in einem Paarzeit-Slot geplant wird.[5]

## Beispiel-Userflow

1. Du legst ein Board für 19.12.25–04.01.26 an.  
2. Du, deine Freundin und dein Freund öffnen denselben Link (Name/Farbe wählen oder vordefinierte User).  
3. Jeder markiert seine Zeitfenster (Gym, Paarzeit, Gaming, Busy).  
4. Die App speichert Slots in Neon; beim Laden oder nach einer Aktion werden die Slots neu geladen.[8][7]
5. Ihr seht sofort, wann ihr zusammen Gym/Paarzeit habt und wann R6-Sessions sinnvoll sind.[6][5]

## Deployment auf Vercel

1. Repository zu GitHub pushen.  
2. Auf `https://vercel.com` einloggen und „New Project“ wählen.[2][9]
3. Repo auswählen – Vercel erkennt Next.js automatisch.[2]
4. Unter „Environment Variables“ `DATABASE_URL` mit deinem Neon-Connection-String setzen.[11][7]
5. Auf „Deploy“ klicken – nach dem Build ist die App unter `<projektname>.vercel.app` erreichbar.[12][2]

## Nächste Schritte / Ideen

- Einfache „Auth“ per Name + URL-Secret (z.B. `?u=stephan`), keine richtige Userverwaltung nötig.  
- Farbcodierung für jede Person und Slot-Art.  
- Export als ICS / Copy-Paste-Hilfe für Kalender (Google/Proton).![13]

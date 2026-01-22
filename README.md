# 🎀 The Jasmine Dashboard

> A personalized, all-in-one life tracker built with ❤️ for Jasmine.

![Project Status](https://img.shields.io/badge/Status-In%20Development-purple?style=flat-square)
![Made With Love](https://img.shields.io/badge/Made%20With-Love-pink?style=flat-square)

## 📖 About The Project

This isn't just a To-Do list; it's a dedicated space designed specifically for you to manage your day-to-day life, track your goals, and keep everything organized in one cute place.

Whether it's school deadlines, work tasks, or just remembering to drink water, this dashboard has got your back.

## ✨ Features

### ✅ Current Features
- **Smart Deadline Tracker**: See exactly how many days are left until a deadline (no more mental math!).
- **Priority To-Do List**: Drag and drop tasks based on urgency.
- **Daily Overview**: A clean snapshot of what you need to focus on today.

### 🚀 Upcoming Features (The Roadmap)
- [ ] **Journal/Diary**: A private space to write down your thoughts, rants, or happy moments.
- [ ] **Period & Cycle Tracker**: Predicts your next cycle and tracks symptoms.
- [ ] **Mood Tracker**: Log how you're feeling to see patterns over time.
- [ ] **"Notes from Jasmine"**: A widget where I can leave you sticky notes and messages.
- [ ] **Dark Mode**: Because we care about your eyes. 🌙

## 🛠️ Tech Stack (Under the Hood)

This project is built using a modern, robust stack to ensure it runs smoothly.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [Angular](https://angular.io/) | The user interface (what you see). |
| **Backend** | [NestJS](https://nestjs.com/) | The server logic (the brain). |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Where all your data lives safely. |
| **ORM** | [Prisma](https://www.prisma.io/) | Helps the app talk to the database easily. |

## 🏁 Getting Started

If you want to run this locally on your machine (or if llegaspo hehe is setting it up for you), follow these steps.

### Prerequisites
* Node.js installed
* PostgreSQL installed (or Docker running)

### 1. Clone the Repository
```bash
git clone [https://github.com/llegaspo/Jasm_Tine.git](https://github.com/llegaspo/Jasm_Tine.git)
cd Jasm_Tine
```
2
### 2. Setup Backend (NestJS + Prisma)
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env
# (Update .env with your database credentials)

# Run Database Migrations
npx prisma migrate dev

# Start the Server
npm run start:dev
```
*Server will start on `http://localhost:3000`*

### 4. Setup Frontend (Angular)
```bash
# Open a new terminal and navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the Application
ng serve
```
*Visit `http://localhost:4200/` to see the app!*

## 🤝 Contribution Guidelines

We follow a strict (but loving) contribution policy:

* **Repository Owner**: llegaspo (Responsible for coding and bug fixes).
* **Product Manager**: Jasmine (Responsible for ideas and feedback).
* **Bug Reporting**: Please report bugs via direct message or during dinner.
* **Feature Requests**: Open to discussion 24/7.

## 💌 Personal Note

I built this because I know how busy you get in school, and I wanted to make your life atleast a bit easier. I hope this helps you achieve your goals!

Love,
**llegaspo**

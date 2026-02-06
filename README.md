# 🎓 JEE Main College Predictor

A web-based tool designed to help engineering aspirants predict their potential college admissions based on their JEE Main rank. This application analyzes previous years' cutoff data (JoSAA/CSAB) to provide a tailored list of eligible NITs, IIITs, and GFTIs.

![Status](https://img.shields.io/badge/Status-Active-success) ![Stack](https://img.shields.io/badge/Tech-MERN_Stack-blue)

## 🚀 Features

* **Rank-Based Prediction:** Accurately filters colleges based on your specific rank and category.
* **Category Support:** Supports General, EWS, OBC-NCL, SC, ST, and PwD categories.
* **Quota Filtering:** Distinguishes between Home State (HS) and All India (AI) quotas.
* **Detailed Insights:** Displays the Branch, Institute Name, and previous year's Opening/Closing ranks for transparency.
* **Responsive UI:** Built with React for a seamless experience on mobile and desktop.

## 🧠 How the Logic Works

The core prediction algorithm works by comparing user input against a database of past cutoff ranks. Here is the step-by-step logic:

1.  **Input Collection:** The user provides:
    * **JEE Main Rank** (e.g., 15000)
    * **Category** (e.g., General, OBC-NCL)
    * **Home State** (e.g., Nagaland, Delhi) - *Crucial for Home State quota eligibility.*

2.  **Database Query & Filtering:**
    The backend searches the database for records where:
    * **Category Match:** `record.category === user.category`
    * **Quota Check:**
        * If the institute is in the user's Home State $\rightarrow$ Check both **HS** (Home State) and **AI** (All India) quotas.
        * If the institute is *not* in the user's Home State $\rightarrow$ Check only **AI** (All India) or **OS** (Other State) quotas.

3.  **The "Closing Rank" Condition:**
    A college branch is considered "Eligible" if:
    $$\text{User Rank} \leq \text{Closing Rank}$$
    *(e.g., If your rank is 15,000 and NIT Trichy CSE closes at 18,000, you are eligible. If it closes at 5,000, you are not.)*

4.  **Sorting:** Results are typically sorted by "Closing Rank" (ascending) to show the most prestigious/competitive options first, or by probability of admission.

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS (or Bootstrap)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Stores college Cutoff data)

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone 

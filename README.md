# QueueLess – Smart College Queue and Token Management System

> **Tagline:** *"Your Time Matters. Skip the Queue."*

A modern, responsive, client-side virtual queue and token management system designed specifically for college administrative offices (Academic Section, Accounts & Finance, Examination Cell, Student Affairs, and Support Desks).

Built purely with **HTML5, CSS3, and Vanilla JavaScript**, leveraging **browser LocalStorage** for real-time frontend persistence and multi-tab synchronization.

---

## 🚀 Key Features

### 1. Authentication & Role-Based Access
- **3 Distinct Roles:** Student, Staff, and Administrator.
- **One-Click Demo Logins:** Instant access buttons for faculty review and evaluation.
  - **Student Account:** `student@college.edu` (Aarav Patel, 21BCE1042)
  - **Staff Account:** `staff@college.edu` (Mrs. Rekha Sharma, Counter 1 – Admin Office)
  - **Admin Account:** `admin@college.edu` (Dr. K. Narayanan, Dean of Academic Admin)
  - **Demo Password:** `Queue123!` for all demo accounts.
- Password show/hide toggle and forgot password interface.
- Role switcher pill in top navigation for rapid demonstration without repeated logins.

### 2. Student Experience
- **Personalized Dashboard:** Live KPI cards for active tokens, completed requests, pending applications, and dynamic wait times.
- **16 College Services Catalog:**
  1. Bonafide Certificate
  2. Transfer Certificate (TC)
  3. Conduct Certificate
  4. Course Completion Certificate
  5. Semester Marksheet / Transcript
  6. Fee Payment Receipt
  7. Scholarship Enquiry
  8. Tuition Fee & Payment Enquiry
  9. Examination and Hall Ticket Enquiry
  10. Admission Enquiry
  11. ID Card Issue or Replacement
  12. Hostel Office Enquiry
  13. Transport Office Enquiry
  14. Library Clearance
  15. No-Due Certificate
  16. General Student Enquiry
- **Smart Token Generation:** Service-specific forms, document checklists, duplicate active token prevention, and unique token generation (e.g., `CERT-025`, `FEE-018`).
- **Live 5-Stage Queue Tracker:**
  - `Token Generated` ➔ `Waiting in Queue` ➔ `Your Turn (Called)` ➔ `Processing at Counter` ➔ `Completed`
  - Dynamic display of currently serving token, queue position, people ahead, estimated wait time, and assigned counter.
  - Interactive **Demo Advance Step** button to simulate queue movement directly on screen.
- **Digital Token Receipt & Print:** Printable pass with QR placeholder and verification details.
- **Token Cancellation:** Confirmation modal and automated queue recalculation.
- **Request History:** Searchable and filterable archive of past requests.
- **Profile Management:** Edit profile fields and persist to LocalStorage.

### 3. Staff Control Console
- **Counter Selection Toolbar:** Switch between 4 counters (Counter 1 – Certificate Section, Counter 2 – Accounts, Counter 3 – Examination Cell, Counter 4 – Student Support) with live operational status (`Serving`, `Available`, `Paused`, `Offline`).
- **Comprehensive Control Deck:**
  - **Call Next Student:** Selects next waiting token respecting administrative priority and creation timestamp.
  - **Recall Current Token:** Re-announces student and triggers notification.
  - **Start Processing:** Records processing start timestamp.
  - **Mark as Completed:** Computes actual handling duration, frees counter, updates statistics.
  - **Skip Token & Re-queue:** Handles student no-shows.
  - **Cancel & Reject Request:** Mandatory justification requirement.
- **Inspect Service Applications:** Modal reviewing student info, remarks, and document checklist status.
- **Urgent Administrative Priority:** Flag urgent administrative cases with mandatory justification.
- **Simulation Helper:** "Simulate New Student Arrival" button to generate realistic tokens on demand.
- **Productivity & Counter Analytics:** CSS bar charts for service volume and counter uptime.

### 4. Administrator Command Center
- **System Metrics:** Total students served today, active tokens, SLA average waiting times, active counters, peak-hour indicator.
- **Service Management:** Full CRUD management to add, edit, or toggle services, customize token code prefixes, set maximum daily capacity, and adjust average service durations.
- **Staff & Counter Management:** Add demo staff accounts, assign counters, and toggle availability.
- **Queue Analytics:** Interactive visual charts for service volume, wait times by department, hourly queue demand curve (9 AM to 4:30 PM), and desk efficiency.
- **System Settings & Reset:** Configure college name, office hours, max active tokens, and single-click **Factory Reset Demo Data** button.

### 5. Smart Waiting-Time Estimation
Implements the exact mathematical queue formula:
$$\text{Estimated Waiting Time} = \frac{\text{Total Expected Service Time of Students Ahead}}{\text{Number of Active Counters Serving that Queue/Department}}$$

---

## 📂 Project Structure

```
queueless/
├── index.html               # Public Login & One-Click Demo Access
├── student-dashboard.html   # Student Portal (Services, Tracker, Tokens, History)
├── staff-dashboard.html     # Staff Console (Call Next, Desk Controls, Counters)
├── admin-dashboard.html     # Admin Center (Services CRUD, Staff, Analytics, Settings)
├── css/
│   └── style.css            # Premium SaaS Dashboard Design System & Mobile Responsiveness
├── js/
│   ├── data.js              # Central Store, Mock Seed Data, Formulas, LocalStorage Engine
│   ├── app.js               # Global UI, Toast Engine, Modals, Session Guards, Dropdowns
│   ├── student.js           # Student Dashboard Controller
│   ├── staff.js             # Staff Console Controller
│   └── admin.js             # Admin Console Controller
└── README.md                # Project Documentation & Run Guide
```

---

## 🛠️ How to Run Locally

### Option 1: VS Code with Live Server (Recommended)
1. Open Visual Studio Code.
2. Open the project folder:
   `File` ➔ `Open Folder...` ➔ Navigate to `C:\Users\Vinoth\.gemini\antigravity\scratch\queueless`
3. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Extensions marketplace (`Ctrl+Shift+X`).
4. Right-click on `index.html` in the file explorer.
5. Select **"Open with Live Server"**.
6. The application will launch in your default browser at `http://127.0.0.1:5500/index.html`.

### Option 2: Open Directly in Browser
- Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari. All features (LocalStorage, modal dialogues, toasts, CSS layouts) work out of the box without requiring a web server.

---

## 🧪 Demonstration & Faculty Evaluation Walkthrough

Follow this step-by-step test procedure to demonstrate the full workflow:

1. **Sign In:**
   - Open `index.html`.
   - Click the green **Student** one-click demo login button.
2. **Request a Token:**
   - In the Student Dashboard, click **"Get a Token"** in the sidebar.
   - Click **"Get Token"** on **"Bonafide Certificate"**.
   - Enter purpose: `Passport verification appointment` and confirm document checklist.
   - Click **"Generate Token Now"**. A unique token (e.g., `CERT-025`) is generated.
3. **Track Queue Progress:**
   - Click **"View in Live Tracker"**. Notice queue position, estimated wait time (~10-12 mins), and stepper progress.
4. **Switch to Staff View (Multi-Tab or Role Pill):**
   - Click the **Role Switcher Pill** in the top navigation bar and select **"Staff View"** (or open `staff-dashboard.html` in another tab/window).
   - In the Staff Queue Desk, see your token in the queue table!
   - Click **"Call Next Student"**. The student token turns **Called** and is assigned to Counter 1.
5. **Observe Real-Time Student Synchronization:**
   - Check the student tab or switch to student view: The live tracker immediately advances to **"Your Turn (Called)"** with a toast notification!
6. **Process & Complete Request:**
   - In the Staff view, click **"Start Processing"** (status changes to `Processing`).
   - Click **"Mark Completed"** (calculates actual duration, moves token to completed archive, updates counter stats).
7. **View Completed Receipt & Analytics:**
   - In the Student view under **"Request History"**, click **"Details"** to view and print the official digital receipt.
   - Switch to **Admin View** (`admin-dashboard.html`) to inspect the updated analytics charts and counter metrics!

## 🎓 EduConnect — Functional Requirements

---

### 🧑‍💼 **User Roles**

| Role        | Access Level                  |
| ----------- | ----------------------------- |
| **Admin**   | Full system access (only you) |
| **Student** | Core platform features        |

---

### 🔐 **Authentication & Security**

- User Sign-up and Login (JWT-based)
- Email verification on registration
- Password reset via email
- Role-based route guards
- Device-based refresh token handling

---

### 👤 **Student Profile**

- Basic info: fullName, username, email, university, course, bio, skills, profile photo
- Additional info: location, year, social links, interests
- Editable profile with privacy options (e.g., show/hide contact info)
- Resume upload for career-focused networking (PDF only)

---

### 🌐 **Student Discovery & Connection**

- Browse or search other students

  - 🔍 Filter by: university, course, skills, year, location, interests

- "Suggested Friends" based on skill similarity or mutual connections
- Send, accept, reject, cancel friend requests
- View friends list and mutual connections

---

### 💬 **Messaging & Communication**

#### 1. **Private Chat**

- 1-to-1 messaging with:

  - Text
  - File sharing (images, docs, videos)
  - Emoji support
  - Typing indicator and read receipts
  - Message timestamps

- Video Call Integration (WebRTC or 3rd-party like Twilio/Jitsi)

#### 2. **Group Chat**

- Create group (max N members)
- Name, group image, description
- Group owner can:

  - Add/remove members
  - Delete group

- Chat features:

  - Mention users
  - Reply threads (optional)
  - Share files
  - View group participants

---

### 📅 **Event System**

- Student can **create events** with:

  - Title, date, time, location (physical/online), description
  - Banner image (optional)
  - File attachments (optional)

- Invite students by:

  - University
  - Friends
  - Manually selected users

- Send invite emails using selected filters
- RSVP system: Interested / Going / Not Going
- Event page showing list of attendees and chat section (optional)

---

### 🛠️ **Admin Panel**

- View all users and filter by university, registration date, etc.
- View all chats and groups (read-only or delete abusive content)
- Moderate reports (reported messages, users, events)
- View and delete events
- Manage system-level settings (e.g., blocked words, banned files)
- Analytics:

  - Number of active users
  - Most active universities
  - Friend connections made
  - Events organized

---

### 📁 **File Uploads (S3)**

- Profile image
- Message attachments
- Event materials (like PDFs, PPTs)
- Resumes

All uploads:

- Virus scanned (future enhancement)
- Auto-expire old files (optional)

---

### 🔔 **Notifications**

- In-app notification system for:

  - New messages
  - Friend requests
  - Event invites

- Email notifications (toggle in settings)
- Push notifications (future: via Firebase)

---

### 🧠 **Advanced Ideas (Stretch Goals)**

- 🧪 **Discussion rooms / Q\&A boards**

  - Like Reddit/StackOverflow but per university or interest

- 🎨 **Theme customization (light/dark mode)**
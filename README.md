# 🚀 Kidokool - Premium WebRTC SFU Video Conferencing

Kidokool is a powerful, real-time video conferencing platform built with **Node.js**, **WebRTC**, and **Mediasoup**. It provides a simple, secure, and fast solution for video calls, messaging, and screen sharing directly in the browser.

---

## ✨ Key Features

- **🌐 High-Performance Media**: Powered by **Mediasoup (SFU)** for high-capacity, low-latency video and audio rooms.
- **🛡️ Secure Communications**: End-to-end encryption using SRTP and DTLS.
- **💻 Full-Featured Meetings**:
  - Real-time Chat & Polling
  - High-resolution Screen Sharing
  - Interactive Whiteboard
  - File Sharing & Recording
- **🛠️ Developer Portal**: A dedicated portal for developers to manage API Keys, access integration guides, and build atop the Kidokool infrastructure.
- **📊 Admin Dashboard**: Comprehensive system oversight for managing rooms, monitoring server health, and user administration.
- **🎨 Modern UI**: A premium "Glassmorphism" aesthetic with full dark/light theme support.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Media**: Mediasoup (SFU), WebRTC
- **Database**: SQLite (via Sequelize)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Glassmorphism)
- **Deployment**: Scalable Docker support and AWS-ready configuration.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v22 or higher
- **npm**: v10 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Kidokool.git
   cd Kidokool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the template and update your settings:
   ```bash
   cp .env.template .env
   ```

4. **Run the server**:
   ```bash
   # Production mode
   npm start

   # Development mode (with nodemon)
   npm run start-dev
   ```

The application will be available at `http://localhost:3010`.

---

## ☁️ Deployment

For production deployment on AWS, please refer to our detailed guide:
👉 [**AWS Deployment Guide**](Documents/AWS_DEPLOYMENT_GUIDE.md)

---

## 👨‍💻 Developed By

**Sanket Mane**
- **Role**: Full Stack Developer
- **Phone**: 7310013030
- **Email**: sanketmane7170@gmail.com

---

## 📄 License

This project is licensed under the **AGPL-3.0 License**. See the [LICENSE](LICENSE) file for details (if available).

---

© 2026 Kidokool. Real-time Simple Secure Fast.

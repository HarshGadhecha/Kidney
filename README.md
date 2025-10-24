# Kidney Care & Dialysis Tracker App

A comprehensive mobile and tablet application designed to help dialysis patients track their health, manage medications, monitor lab results, and maintain vital signs records.

## Features (Phase 1 - MVP)

### Core Features
- **Dashboard**: Modern home screen with health overview and quick actions
- **Vitals Tracking**: Log daily vitals including:
  - Weight, Blood Pressure, Heart Rate
  - Oxygen Saturation
  - Fluid Intake and Urine Output
  - Temperature
- **Lab Reports**: Manual entry of lab results
- **Medications**: Track medications and set reminders
- **Offline-First**: SQLite database for offline storage with cloud sync
- **Modern UI**: Beautiful, healthcare-focused design with smooth animations

### Free Tier Features
- Basic vitals logging
- Limited medication reminders
- Basic food log
- Ad-supported

### Premium Features (Coming in Phase 2)
- Unlimited lab report uploads with OCR
- Advanced food tracking with dialysis meal plans
- Critical health alerts and notifications
- Doctor/caregiver data sharing
- Full analytics and trends
- Ad-free experience

## Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **React Native Reanimated** for smooth animations
- **Zustand** for state management
- **expo-sqlite** for offline storage

### Backend (Phase 2)
- Node.js with Cloud Functions
- MongoDB/PostgreSQL for cloud storage
- Google Vision API for OCR
- Firebase Cloud Messaging for notifications

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Home dashboard
│   │   ├── vitals.tsx     # Vitals tracking
│   │   ├── labs.tsx       # Lab reports
│   │   ├── medications.tsx # Medication management
│   │   └── more.tsx       # Settings and more
├── components/            # Reusable components
│   └── ui/               # UI components (Button, Card, Input, etc.)
├── constants/            # App constants and theme
├── lib/                  # Core libraries
│   ├── database/         # SQLite database setup
│   ├── utils/            # Utility functions
│   └── api/              # API clients
├── services/             # Business logic
│   ├── vitals/          # Vitals service
│   ├── labs/            # Lab reports service
│   ├── medication/      # Medication service
│   └── auth/            # Authentication service
├── store/               # State management (Zustand)
└── types/               # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on your device:
   - Scan the QR code with Expo Go app
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

## Development Roadmap

### Phase 1: MVP (Current)
- [x] Project setup and architecture
- [x] Modern UI theme and components
- [x] Offline database with SQLite
- [x] Home dashboard
- [x] Vitals tracking (manual entry)
- [x] Tab navigation
- [ ] Authentication system
- [ ] Basic food logging
- [ ] Medication reminders
- [ ] AdMob integration

### Phase 2: Enhanced Features
- [ ] OCR for lab reports
- [ ] Advanced alerts system
- [ ] Premium subscription
- [ ] Cloud sync
- [ ] Data visualization (charts/graphs)
- [ ] Export and sharing

### Phase 3: Advanced Features
- [ ] Food database integration
- [ ] Caregiver/doctor sharing
- [ ] AI-powered diet recommendations
- [ ] Appointment reminders
- [ ] Multi-language support

## Design Philosophy

- **Patient-First**: Designed specifically for dialysis patients' needs
- **Offline-First**: Works without internet connection
- **Privacy-Focused**: Data stored locally, synced securely
- **Accessible**: Clear typography, good contrast, easy navigation
- **Modern**: Beautiful animations and intuitive interactions

## Color Scheme

The app uses a calming medical-inspired color palette:
- **Primary Blue**: #0066CC (Medical trust and calm)
- **Secondary Green**: #00B894 (Health and healing)
- **Error Red**: #EF4444 (Critical alerts)
- **Warning Orange**: #F59E0B (Caution)
- **Success Green**: #10B981 (Positive outcomes)

## Contributing

This is a PRD implementation project. For feature requests or improvements, please refer to the original PRD document.

## License

MIT License - see LICENSE file for details

## Support

For questions or support, please contact the development team or open an issue.

---

**Built with care for kidney patients worldwide** 💙

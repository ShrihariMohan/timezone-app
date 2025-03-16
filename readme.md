# Timezone App for Developers & Multi-Region Employees

## Overview
A modern timezone application designed for developers and remote employees working across multiple time zones. This app allows users to view, edit, and manage multiple timezones with an interactive and customizable UI.

## Features

### Core Features
- **Multiple Timezones in Grid Format**: Displays timezones in a **3-column grid layout** for easy comparison.
- **Default Local Timezone**: The first timezone is always set to the user’s **local timezone**.
- **Randomized Timezones with UTC as Mandatory**: The next two timezones are **randomly chosen**, ensuring UTC is always included.
- **Editable Date & Time Fields**: Users can **modify date & time**, and changes reflect across all grids.
- **Add New Timezones**: Users can select and add a new timezone via a **floating toolbar** with a **glassmorphism effect**.
- **Persistent Storage**: All user settings (timezones, theme, and layout) are stored in **local storage** and loaded on refresh.
- **Copy to Clipboard**: Each grid has a copy button to copy the **formatted date-time**.

### Design & UI Enhancements
- **Floating Toolbar for Adding Timezones**: Replaces the traditional navbar dropdown with a modern, **center-aligned floating toolbar**.
- **Minimalist Grid Design**: Uses **subtle pastel gradients**, rounded corners, and modern typography.
- **UTC Offset in Dropdown**: Timezone dropdown displays UTC offsets for better visibility.
- **Theme Customization**: Users can switch themes, and the selection is stored for future sessions.

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v14+ recommended)
- **npm** or **yarn**

### Clone the Repository
```sh
git clone https://github.com/yourusername/timezone-app.git
cd timezone-app
```

### Install Dependencies
```sh
npm install
# or
yarn install
```

### Run the Application
```sh
npm start
# or
yarn start
```

The app will be available at `http://localhost:3000`.

## Technologies Used
- **Frontend**: React, TailwindCSS
- **State Management**: Context API / Redux (if needed)
- **Date & Time Handling**: Luxon / date-fns
- **Storage**: Local Storage / IndexedDB

## Future Enhancements
- **Cloud Syncing**: Store user preferences in Firebase or Supabase.
- **Real-Time Updates**: Implement WebSockets for live collaboration.
- **Export Feature**: Allow users to download timezone data as CSV/JSON.
- **Daylight Saving Time Notifications**: Alert users about upcoming DST changes.

## Contribution
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request.

## License
This project is licensed under the **MIT License**.

---
Developed with ❤️ for global teams and developers working across timezones.


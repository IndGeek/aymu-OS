# aymu OS

A modern, web-based operating system built with **React**, **TypeScript**, and **Vite**. Experience a fully interactive desktop environment with a sleek glassmorphism UI, complete with native-like applications and a dynamic app ecosystem.

![aymu OS Preview](./public/assets/aymuos-preview.png)

## ✨ Features

### 🗂️ **File Manager**
A full-featured file explorer with context menus (Open, Delete, Rename, Download, About), drag-and-drop support, and seamless navigation through your virtual filesystem. Features glassmorphic design with smooth animations.

### ✍️ **Split Editor & Notepad**
A powerful split-pane text editor supporting custom file types. Edit multiple files side-by-side with syntax awareness, perfect for coding and note-taking within the OS environment.

### 🎵 **Music Player**
Integrated music player with manifest-based library management. Play, pause, skip tracks, and browse your music collection with a beautiful, responsive interface.

### 🌐 **Browser**
**Full-featured web browser** built right into the OS! Navigate the web and enjoy a complete browsing experience without leaving the desktop environment. The browser is a standout feature that brings true web capabilities to your virtual OS.

### 💻 **Terminal**
Interactive terminal emulator with support for basic Linux commands. Not a full-fledged shell, but powerful enough for file operations, navigation, and system interactions—perfect for power users who want command-line access.

### 🏪 **App Store**
Discover and install new applications directly from the built-in app store. Expand your OS capabilities with curated apps and tools designed for the aymu ecosystem.

## 🛠️ Tech Stack

- **Framework:** Vite + React (TSX)
- **Language:** TypeScript
- **Styling:** Vanilla CSS with custom design tokens
- **State Management:** Custom stores (`src/stores/systemStore.ts`)
- **Build Tool:** Vite dev server (`npm run dev`)

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/indgeek/aymu-os.git
cd aymu-os

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open `http://localhost:8080` in your browser to see the OS in action.

## 📁 Project Structure

```
aymu-os/
├── index.html              # Root entrypoint
├── src/
│   ├── components/
│   │   └── os/            # Core OS UI components (BootScreen, Desktop, TopBar)
│   ├── stores/
│   │   └── systemStore.ts # Global state management
│   └── ...
└── ...
```

**Entrypoint:** The application starts from `index.html` in the root directory, which loads the React application. Core OS components live in `src/components/os/`, and global state is managed through `src/stores/systemStore.ts`.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Ensure code follows the existing style and passes linting.
4. Submit a pull request with a clear description of changes.

## 📄 License

This project is licensed under the MIT License – see the `LICENSE` file for details.

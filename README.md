# PySketch - visual programming for Python Turtle

PySketch is a cutting-edge visual programming platform that revolutionizes how users interact with Python's Turtle graphics. By seamlessly transforming freehand sketches into clean, executable Python code, it empowers both artists and creative coders to prototype, learn, and create generative art without writing a single line of syntax manually. Built with the latest web technologies including **Next.js 15** and **React 19**, PySketch offers a professional-grade environment with layer management, real-time compilation, and a fluid, responsive interface designed for the modern web.

## ✨ Technical Features & Capabilities

### Core Functionality
- **Real-time Code Compilation**: Instantaneously converts vector strokes into optimized Python `turtle` scripts using a custom compiler engine.
- **Intelligent Stroke Smoothing**: Applies smart simplification algorithms to reduce node count and eliminate jitter, producing human-readable and efficient code.
- **Layer-Based Architecture**: Professional-grade layer system allowing visibility toggling, reordering, and independent management of complex compositions.
- **Responsive Canvas Engine**: High-performance drawing surface that dynamically adapts to viewport dimensions while maintaining coordinate precision.

### Developer Experience
- **Integrated Code Inspector**: Real-time code panel with custom-built lightweight syntax highlighting for Python.
- **One-Click Export**: seamless generation of standalone `.py` files that function in any standard Python environment.
- **Configurable Runtime**: Adjustable execution parameters including global animation speed (Instant to Slow) and canvas background settings.

### Application Architecture
- **State Management**: Robust `localStorage` persistence layer for auto-saving projects, preserving full edit history, stroke data, and application state.
- **Modern UI/UX**: Premium dark-mode aesthetic utilizing **Tailwind CSS**, featuring glassmorphic headers and a responsive 3-panel layout (Tools, Canvas, Code).
- **Type Safety**: Fully typed codebase using **TypeScript** for reliability and maintainability.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Solez-ai/PySketch.git
   cd PySketch/pysketch
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to start creating!

## 🛠️ Built With

- **[Next.js 15](https://nextjs.org/)** - The React Framework for the Web
- **[React 19](https://react.dev/)** - The library for web and native user interfaces
- **[Tailwind CSS](https://tailwindcss.com/)** - Rapidly build modern websites without ever leaving your HTML
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript with syntax for types

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## ❤️ Credits

Made with ❤️ by [Samin Yeasar](https://github.com/SaminYeasar) @ [Solez-ai](https://github.com/Solez-ai)

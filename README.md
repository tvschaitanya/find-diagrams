# Diagrams Icons Search

A searchable web interface for all architecture icons from the [diagrams library](https://diagrams.mingrammer.com/).

## Why This Project?

When building architecture diagrams with the diagrams library, finding the right icon is tedious. You need to know the exact name, module, and import statement. This tool lets you search, browse, and copy icon imports instantly instead of digging through documentation.

## Features

- **Search icons** by name or import path
- **Browse all** icons available in the diagrams library
- **Copy import statements** with one click
- **Dark mode** toggle for comfortable viewing
- **Keyboard shortcuts** for faster navigation
- **Responsive design** that works on mobile and desktop

## Keyboard Shortcuts

- `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) - Focus search box
- `Esc` twice - Clear search and unfocus

## Getting Started

### Prerequisites

- Python 3.7+
- Node.js 16+
- Diagrams library (`pip install diagrams`)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pip install diagrams
   npm install
   ```

3. Generate the icons database:

   ```bash
   python gen_icons.py
   ```

   This creates `icons.json` with all available icons.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

## How It Works

- **gen_icons.py** - Extracts all icon classes from the diagrams library and saves them to `icons.json`
- **SearchClient.tsx** - React component that displays and filters icons
- **SearchClient.css** - Styling with light/dark theme support
- **index.astro** - Astro page that loads the search interface

## Project Structure

```
src/
├── components/
│   ├── SearchClient.tsx    # Main search component
│   └── SearchClient.css    # Styling
├── pages/
│   └── index.astro         # Home page
└── gen_icons.py            # Icon extraction script
```

## Built With

- [Astro](https://astro.build/) - Web framework
- [React](https://react.dev/) - UI component library
- [Lucide React](https://lucide.dev/) - Icons
- [Diagrams](https://diagrams.mingrammer.com/) - Architecture icon library

## License

This project uses icons from the diagrams library. Check the diagrams documentation for license details.

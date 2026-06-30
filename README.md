# 💘 Valentine Mini-App

link: https://valentine-app-rosy.vercel.app/

An interactive Valentine's Day mini-app with a playful twist! This web application features a fun mechanism where the "No" button intelligently runs away from your cursor, making it nearly impossible to reject the Valentine's proposal.

## ✨ Features

- **Smart Evasion Algorithm**: The "No" button dynamically calculates distance from cursor and moves away intelligently
- **Personalization**: Pass a name via URL parameter (`?name=YourName`) to personalize the experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Uses CSS transitions and `requestAnimationFrame` for butter-smooth movement
- **Collision Detection**: The "No" button avoids overlapping with the "Yes" button
- **Celebration Screen**: Beautiful success animation when "Yes" is clicked

## 🎮 Demo

Try it yourself:

```
http://localhost:5173/?name=Katy
```

The "No" button will:

- Move away when your cursor gets within 120px
- Jump to random positions if cornered
- Never overlap with the "Yes" button
- Increase movement intensity as you get closer

## 🛠 Tech Stack

- **React 19.2** - UI library with latest features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Lightning-fast build tool with HMR
- **CSS3** - Modern animations and transitions
- **Rolldown** - Next-generation bundler (Vite integration)

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd valentine-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Usage

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Outputs optimized files to `dist/` directory

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## 🎯 How It Works

### URL Parameters

- `?name=Alice` - Personalizes the greeting to "Alice, will you be my valentine?"
- No name provided - Defaults to "Friend"

### Button Mechanics

**"Yes" Button**:

- Fixed position in the center
- Triggers celebration screen on click

**"No" Button**:

- Uses absolute positioning with CSS transforms
- Calculates distance from cursor in real-time
- Implements "danger zone" radius of 120px
- Applies vector-based movement away from cursor
- Adds randomized jitter to prevent predictable patterns
- Collision detection prevents overlap with "Yes" button
- Responsive to window resize events

### Key Technical Features

1. **Performance Optimization**:

   - Uses `requestAnimationFrame` for smooth 60fps animations
   - Throttling to prevent excessive DOM updates
   - `useMemo` and `useCallback` hooks for optimized re-renders

2. **Smart Positioning**:

   - Boundary detection keeps button within arena
   - Safe zones around "Yes" button
   - Random repositioning when cornered

3. **Event Handling**:
   - `onPointerMove` for cursor tracking
   - `onPointerEnter` for direct button hover
   - `onFocus` for keyboard navigation accessibility

## 📁 Project Structure

```
valentine-app/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css          # Component styles and animations
│   ├── App.tsx          # Main application logic
│   ├── index.css        # Global styles
│   └── main.tsx         # Application entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Customization

### Change Colors

Edit `src/App.css`:

```css
.btnYes {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btnNo {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

### Adjust Evasion Behavior

Edit constants in `src/App.tsx`:

```typescript
const dangerRadius = 120; // Detection radius in pixels
const step = 100 * intensity; // Movement speed
const jitter = 18; // Randomness factor
const safeMargin = 20; // Distance from "Yes" button
```

### Change Success Message

Edit the result section in `src/App.tsx`:

```tsx
<h2 className="resultTitle">Yay! 💖</h2>
<p className="resultText">Best decision of the day.</p>
```

## 🌐 Deployment

### Vercel

```bash
npm run build
vercel --prod
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

---

Made with ❤️ for Valentine's Day

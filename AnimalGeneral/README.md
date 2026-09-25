# 🐾 Animal Atlas

A modern, animated React application for exploring animals and biodiversity.

Animal Atlas is designed as a frontend-first project. The current version uses temporary development data, but the architecture is intentionally prepared for a real backend API.

---

## ✨ Features

- Beautiful responsive interface
- Modern dark/forest visual design
- Animated hero section
- Animal search
- Category filtering
- Animal cards
- Animal detail modal
- Favorite animals
- Persistent favorites with localStorage
- Loading skeletons
- Empty search state
- Responsive mobile design
- Keyboard-friendly modal
- Smooth scrolling
- Lazy-loaded animal images
- API-ready architecture

---

## 🛠️ Tech Stack

- React
- Vite
- JavaScript
- CSS
- LocalStorage

Future backend:

- Node.js
- Express
- iNaturalist API
- Wikipedia API

---

## 📁 Project Structure

```text
animal-atlas/
│
├── src/
│   ├── components/
│   │   ├── AnimalCard.jsx
│   │   ├── AnimalGrid.jsx
│   │   ├── AnimalModal.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── Navbar.jsx
│   │
│   ├── hooks/
│   │   ├── useAnimals.js
│   │   └── useFavorites.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

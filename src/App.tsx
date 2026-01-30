import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Feed from './components/NeuralWeb/Feed';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <AuthProvider>
      <div className="app">
        <Header
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <main className="app-main">
          <Feed activeCategory={activeCategory} />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;

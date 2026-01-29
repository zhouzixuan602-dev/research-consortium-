import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Feed from './components/NeuralWeb/Feed';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="app-main">
          <Feed />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;

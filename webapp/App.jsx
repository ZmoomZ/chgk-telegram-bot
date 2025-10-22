import { useEffect, useState } from 'react';
import { initMiniApp, useLaunchParams, useInitData } from '@telegram-apps/sdk-react';
import './App.css';
import Home from './components/Home';
import Register from './components/Register';
import Answer from './components/Answer';
import MyTeam from './components/MyTeam';
import Answers from './components/Answers';

function App() {
  const [page, setPage] = useState('home');
  const [teamName, setTeamName] = useState(null);
  
  useEffect(() => {
    // Инициализация Telegram Mini App
    const miniApp = initMiniApp();
    miniApp.ready();
    miniApp.expand();
    
    // Устанавливаем цвет header bar
    miniApp.setHeaderColor('#7C3AED');
    
    // Проверяем, есть ли команда в localStorage
    const savedTeam = localStorage.getItem('teamName');
    if (savedTeam) {
      setTeamName(savedTeam);
    }
  }, []);

  const renderPage = () => {
    switch(page) {
      case 'register':
        return <Register setPage={setPage} setTeamName={setTeamName} />;
      case 'answer':
        return <Answer setPage={setPage} teamName={teamName} />;
      case 'myteam':
        return <MyTeam setPage={setPage} teamName={teamName} />;
      case 'answers':
        return <Answers setPage={setPage} teamName={teamName} />;
      default:
        return <Home setPage={setPage} teamName={teamName} />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
}

export default App;

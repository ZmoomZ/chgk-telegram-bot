import { Users, ClipboardList, User, ListChecks } from 'lucide-react';

function Home({ setPage, teamName }) {
  return (
    <div className="page">
      <div className="header">
        <h1>🎉 ЧГК Новый Год 2025</h1>
        <p>Добро пожаловать в игру!</p>
      </div>

      {teamName && (
        <div className="team-info">
          <h2>Ваша команда</h2>
          <p>{teamName}</p>
        </div>
      )}

      <div className="menu-grid">
        {!teamName && (
          <button className="menu-item" onClick={() => setPage('register')}>
            <Users size={32} />
            <span>Регистрация</span>
          </button>
        )}

        <button 
          className="menu-item" 
          onClick={() => setPage('answer')}
          disabled={!teamName}
          style={{ opacity: !teamName ? 0.5 : 1 }}
        >
          <ClipboardList size={32} />
          <span>Ответить</span>
        </button>

        {teamName && (
          <>
            <button className="menu-item" onClick={() => setPage('myteam')}>
              <User size={32} />
              <span>Моя команда</span>
            </button>

            <button className="menu-item" onClick={() => setPage('answers')}>
              <ListChecks size={32} />
              <span>Мои ответы</span>
            </button>
          </>
        )}
      </div>

      {!teamName && (
        <div className="card" style={{ marginTop: '20px' }}>
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            Сначала зарегистрируйте команду, чтобы начать игру
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;

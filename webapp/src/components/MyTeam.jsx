import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar } from 'lucide-react';

function MyTeam({ setPage, teamName }) {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const chatId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || Date.now();
      const response = await fetch(`https://host.bimview.ru/api/team?chatId=${chatId}`);
      const data = await response.json();
      
      if (data.success) {
        setTeamData(data.team);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => setPage('home')}>
        <ArrowLeft size={20} />
        Назад
      </button>

      <div className="header">
        <Users size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <h1>Моя команда</h1>
      </div>

      {loading ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Загрузка...</p>
        </div>
      ) : teamData ? (
        <>
          <div className="team-info">
            <h2>{teamData.name || teamName}</h2>
            <p>{teamData.members || 'Информация об участниках недоступна'}</p>
            
            {teamData.registrationDate && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  Зарегистрирована: {new Date(teamData.registrationDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Статистика</h3>
            <div className="stats" style={{ background: 'transparent' }}>
              <div className="stat-item" style={{ background: '#f3f4f6', color: '#1f2937' }}>
                <div className="stat-value">{teamData.answersCount || 0}</div>
                <div className="stat-label">Ответов</div>
              </div>
              <div className="stat-item" style={{ background: '#f3f4f6', color: '#1f2937' }}>
                <div className="stat-value">{teamData.membersCount || 0}</div>
                <div className="stat-label">Участников</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            Команда не найдена
          </p>
        </div>
      )}
    </div>
  );
}

export default MyTeam;

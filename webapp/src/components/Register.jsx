import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Users } from 'lucide-react';

function Register({ setPage, setTeamName }) {
  const [formData, setFormData] = useState({
    teamName: '',
    members: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const chatId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || Date.now();
  const initData = window.Telegram?.WebApp?.initDataUnsafe;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.teamName || !formData.members) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://host.bimview.ru/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: formData.teamName,
          members: formData.members,
          chatId: chatId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        localStorage.setItem('teamName', formData.teamName);
        setTeamName(formData.teamName);
        
        setTimeout(() => {
          setPage('home');
        }, 2000);
      } else {
        setError(data.message || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
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
        <h1>Регистрация команды</h1>
        <p>Создайте свою команду для участия в игре</p>
      </div>

      {success && (
        <div className="success-message">
          <CheckCircle size={24} />
          <span>Команда успешно зарегистрирована!</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <XCircle size={24} />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название команды</label>
            <input
              type="text"
              placeholder="Например: Знатоки"
              value={formData.teamName}
              onChange={(e) => setFormData({...formData, teamName: e.target.value})}
              disabled={loading || success}
            />
            <div className="hint">Придумайте уникальное название для вашей команды</div>
          </div>

          <div className="form-group">
            <label>Участники команды</label>
            <textarea
              placeholder="Например: Иван Иванов, Петр Петров, Мария Сидорова"
              value={formData.members}
              onChange={(e) => setFormData({...formData, members: e.target.value})}
              disabled={loading || success}
            />
            <div className="hint">Перечислите участников через запятую</div>
          </div>

          <button 
            type="submit" 
            className={success ? "btn btn-success" : "btn btn-primary"}
            disabled={loading || success}
          >
            {loading ? 'Регистрация...' : success ? '✓ Зарегистрирована' : 'Зарегистрировать команду'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;

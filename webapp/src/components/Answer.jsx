import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react';


function Answer({ setPage, teamName }) {
  const [formData, setFormData] = useState({
    questionNumber: '',
    answer: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  

  const handleSubmit = async (e) => {
    const chatId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || Date.now();
    e.preventDefault();
    
    if (!formData.questionNumber || !formData.answer) {
      setError('Заполните все поля');
      return;
    }

    if (isNaN(formData.questionNumber)) {
      setError('Номер вопроса должен быть числом');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://host.bimview.ru/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: teamName,
          questionNumber: formData.questionNumber,
          answer: formData.answer,
          chatId: chatId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        
        setTimeout(() => {
          setFormData({ questionNumber: '', answer: '' });
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.message || 'Ошибка отправки ответа');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  if (!teamName) {
    return (
      <div className="page">
        <button className="back-btn" onClick={() => setPage('home')}>
          <ArrowLeft size={20} />
          Назад
        </button>
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            Сначала зарегистрируйте команду
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={() => setPage('home')}>
        <ArrowLeft size={20} />
        Назад
      </button>

      <div className="header">
        <Send size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <h1>Отправить ответ</h1>
        <p>Команда: {teamName}</p>
      </div>

      {success && (
        <div className="success-message">
          <CheckCircle size={24} />
          <span>Ответ успешно отправлен!</span>
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
            <label>Номер вопроса</label>
            <input
              type="number"
              placeholder="Например: 1"
              value={formData.questionNumber}
              onChange={(e) => setFormData({...formData, questionNumber: e.target.value})}
              disabled={loading || success}
              min="1"
            />
            <div className="hint">Введите номер вопроса (число)</div>
          </div>

          <div className="form-group">
            <label>Ваш ответ</label>
            <textarea
              placeholder="Введите ваш ответ на вопрос"
              value={formData.answer}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              disabled={loading || success}
            />
            <div className="hint">Будьте внимательны при написании ответа</div>
          </div>

          <button 
            type="submit" 
            className={success ? "btn btn-success" : "btn btn-primary"}
            disabled={loading || success}
          >
            {loading ? 'Отправка...' : success ? '✓ Отправлен' : 'Отправить ответ'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Answer;

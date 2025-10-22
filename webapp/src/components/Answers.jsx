import { useState, useEffect } from 'react';
import { ArrowLeft, ListChecks, FileText } from 'lucide-react';

function Answers({ setPage, teamName }) {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnswers();
  }, []);

  const fetchAnswers = async () => {
    try {
      const chatId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || Date.now();
      const response = await fetch(`https://host.bimview.ru/api/answers?chatId=${chatId}`);
      const data = await response.json();
      
      if (data.success) {
        setAnswers(data.answers);
      }
    } catch (err) {
      console.error('Error fetching answers:', err);
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
        <ListChecks size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <h1>Мои ответы</h1>
        <p>Команда: {teamName}</p>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Загрузка...</p>
        ) : answers.length > 0 ? (
          <div className="answers-list">
            {answers.map((answer, index) => (
              <div key={index} className="answer-item">
                <div className="question-num">Вопрос {answer.questionNumber}</div>
                <div className="answer-text">{answer.answer}</div>
                <div className="timestamp">
                  {new Date(answer.timestamp).toLocaleString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={48} />
            <p>Вы ещё не отправили ни одного ответа</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Answers;

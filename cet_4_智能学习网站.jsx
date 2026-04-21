import { useState, useEffect } from "react";

export default function CET4App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">📚 AI英语四级学习平台</h1>
        <div className="bg-white p-6 rounded-2xl shadow">
          <ReadingExam />
        </div>
      </div>
    </div>
  );
}

// ================= 📖 阅读考试模式 =================
function ReadingExam() {
  const [list, setList] = useState([]);
  const [index, setIndex] = useState(0);
  const [data, setData] = useState(null);

  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [time, setTime] = useState(900); // 15分钟

  // 获取所有真题
  useEffect(() => {
    fetch("http://localhost:3001/api/reading")
      .then(res => res.json())
      .then(res => {
        setList(res);
        if (res.length > 0) setData(res[0]);
      });
  }, []);

  // 切换年份
  const handleChange = (i) => {
    setIndex(i);
    setData(list[i]);
    setAnswers({});
    setScore(null);
    setTime(900);
  };

  // 倒计时
  useEffect(() => {
    if (time <= 0) return;
    const timer = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [time]);

  if (!data) return <div>加载中...</div>;

  // 提交评分
  const handleSubmit = async () => {
    let correct = 0;

    data.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
      else {
        // ❌ 错题记录
        fetch("http://localhost:3001/api/wrong-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token")
          },
          body: JSON.stringify({
            question: q.question,
            correct: q.answer,
            userAnswer: answers[i]
          })
        });
      }
    });

    setScore(`${correct} / ${data.questions.length}`);
  };

  return (
    <div className="space-y-4">

      {/* 年份选择 */}
      <select
        onChange={(e) => handleChange(e.target.value)}
        className="border p-2"
      >
        {list.map((item, i) => (
          <option key={i} value={i}>{item.year}</option>
        ))}
      </select>

      {/* 倒计时 */}
      <div className="text-red-500 font-bold">
        ⏱ 剩余时间：{Math.floor(time / 60)}:{time % 60}
      </div>

      {/* 文章 */}
      <div className="bg-gray-100 p-4 rounded">
        {data.passage}
      </div>

      {/* 题目 */}
      {data.questions.map((q, i) => (
        <div key={i} className="space-y-2">
          <p className="font-bold">Q{i + 1}: {q.question}</p>

          <select
            onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
            className="border p-2"
          >
            <option value="">请选择</option>
            {q.options.map((op, idx) => (
              <option key={idx} value={op[0]}>{op}</option>
            ))}
          </select>
        </div>
      ))}

      {/* 提交 */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        提交试卷
      </button>

      {/* 成绩 */}
      {score && (
        <div className="bg-green-100 p-4 rounded">
          🎯 得分：{score}
        </div>
      )}
    </div>
  );
}


/* ================= 后端新增 =================

// 错题记录
const WrongQuestionSchema = new mongoose.Schema({
  userId: String,
  question: String,
  correct: String,
  userAnswer: String
});

const WrongQuestion = mongoose.model('WrongQuestion', WrongQuestionSchema);

app.post('/api/wrong-question', auth, async (req, res) => {
  await WrongQuestion.create({
    userId: req.userId,
    ...req.body
  });
  res.json({ ok: true });
});

*/

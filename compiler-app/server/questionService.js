const fs = require('fs');
const path = require('path');

class QuestionService {
  constructor() {
    this.questionsFilePath = path.join(__dirname, 'data', 'questions.json');
    this.questions = [];
    this.loadQuestions();
  }

  loadQuestions() {
    try {
      const data = fs.readFileSync(this.questionsFilePath, 'utf-8');
      this.questions = JSON.parse(data);
    } catch (err) {
      console.error('Failed to load questions.json:', err.message);
      this.questions = [];
    }
  }

  // Sanitize question for client: NEVER include hiddenTestCases
  sanitizeForClient(question) {
    if (!question) return null;
    const { hiddenTestCases, ...safeQuestion } = question;
    return safeQuestion;
  }

  // Get all questions without hidden test cases
  getAllQuestions() {
    return this.questions.map(q => this.sanitizeForClient(q));
  }

  // Get single question by ID without hidden test cases
  getQuestionById(id) {
    const question = this.questions.find(q => q.id === id);
    if (!question) return null;
    return this.sanitizeForClient(question);
  }

  // Get hidden test cases strictly for backend evaluation
  getHiddenTestCases(id) {
    const question = this.questions.find(q => q.id === id);
    if (!question || !question.hiddenTestCases) return null;
    return question.hiddenTestCases;
  }
}

module.exports = new QuestionService();

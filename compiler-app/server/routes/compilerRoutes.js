const express = require('express');
const router = express.Router();
const judge0Service = require('../judge0Service');
const questionService = require('../questionService');

const SUPPORTED_LANGUAGES = [
  {
    id: 71,
    name: 'Python',
    version: '3.8.1',
    mode: 'python',
    extension: '.py'
  },
  {
    id: 50,
    name: 'C',
    version: 'GCC 9.2.0',
    mode: 'c',
    extension: '.c'
  },
  {
    id: 54,
    name: 'C++',
    version: 'GCC 9.2.0',
    mode: 'cpp',
    extension: '.cpp'
  },
  {
    id: 62,
    name: 'Java',
    version: 'OpenJDK 13.0.1',
    mode: 'java',
    extension: '.java'
  }
];

// GET /api/health
router.get('/health', async (req, res) => {
  try {
    const judge0Health = await judge0Service.checkHealth();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      backend: 'Online',
      judge0: judge0Health
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// GET /api/languages
router.get('/languages', (req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES
  });
});

// GET /api/questions - List all questions (hiddenTestCases NEVER returned)
router.get('/questions', (req, res) => {
  try {
    const questions = questionService.getAllQuestions();
    res.json({
      success: true,
      questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve questions list.'
    });
  }
});

// GET /api/questions/:id - Get single question (hiddenTestCases NEVER returned)
router.get('/questions/:id', (req, res) => {
  try {
    const question = questionService.getQuestionById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: `Question '${req.params.id}' not found.`
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve question details.'
    });
  }
});

// POST /api/run - Run code with custom input (Preserved exactly as before)
router.post('/run', async (req, res) => {
  try {
    const { language_id, source_code, stdin } = req.body;

    if (!language_id || !source_code) {
      return res.status(400).json({
        error: 'Both language_id and source_code are required.'
      });
    }

    const result = await judge0Service.executeCode({
      language_id,
      source_code,
      stdin
    });

    res.json({
      success: true,
      action: 'run',
      result
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      action: 'run',
      error: error.message || 'Error communicating with execution engine.'
    });
  }
});

// POST /api/submit - Submit code against hidden test cases
router.post('/submit', async (req, res) => {
  try {
    const { question_id, language_id, source_code, stdin } = req.body;

    if (!language_id || !source_code) {
      return res.status(400).json({
        success: false,
        error: 'Both language_id and source_code are required.'
      });
    }

    // If question_id is provided: evaluate against predefined hidden test cases
    if (question_id) {
      const hiddenCases = questionService.getHiddenTestCases(question_id);

      if (!hiddenCases || hiddenCases.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No hidden test cases configured for question '${question_id}'.`
        });
      }

      let passed = 0;
      const total = hiddenCases.length;
      const testCases = [];
      let finalVerdict = 'Accepted';
      let peakMemory = 0;
      let maxTime = 0;

      for (const tc of hiddenCases) {
        const result = await judge0Service.executeCode({
          language_id,
          source_code,
          stdin: tc.input,
          expected_output: tc.expected_output
        });

        // 1. Compilation Error: Halt immediately on first failure
        if (result.status && result.status.id === 6) {
          return res.json({
            success: true,
            action: 'submit',
            question_id,
            verdict: 'Compilation Error',
            passed: 0,
            total,
            compile_output: result.compile_output,
            testCases: []
          });
        }

        // Track time & memory
        if (result.time) {
          const numTime = parseFloat(result.time);
          if (!isNaN(numTime) && numTime > maxTime) maxTime = numTime;
        }
        if (result.memory) {
          const numMem = parseInt(result.memory, 10);
          if (!isNaN(numMem) && numMem > peakMemory) peakMemory = numMem;
        }

        // 2. Time Limit Exceeded
        if (result.status && result.status.id === 5) {
          testCases.push({
            case: tc.id,
            status: 'Time Limit Exceeded',
            time: result.time,
            memory: result.memory
          });
          finalVerdict = 'Time Limit Exceeded';
          break;
        }

        // 3. Runtime Error
        if (result.status && result.status.id >= 7) {
          testCases.push({
            case: tc.id,
            status: 'Runtime Error',
            time: result.time,
            memory: result.memory,
            stderr: result.stderr
          });
          finalVerdict = 'Runtime Error';
          break;
        }

        // 4. Output verification (Check both Judge0 status and trimmed content)
        const actualOutput = (result.stdout || '').trim().replace(/\r\n/g, '\n');
        const expectedOutput = (tc.expected_output || '').trim().replace(/\r\n/g, '\n');

        if (result.status && result.status.id === 3 && actualOutput === expectedOutput) {
          passed++;
          testCases.push({
            case: tc.id,
            status: 'Passed',
            time: result.time,
            memory: result.memory
          });
        } else {
          // Wrong Answer
          testCases.push({
            case: tc.id,
            status: 'Wrong Answer',
            time: result.time,
            memory: result.memory
          });
          finalVerdict = 'Wrong Answer';
          break;
        }
      }

      return res.json({
        success: true,
        action: 'submit',
        question_id,
        verdict: finalVerdict,
        passed,
        total,
        time: maxTime ? `${maxTime}s` : null,
        memory: peakMemory ? `${peakMemory} KB` : null,
        testCases
      });
    }

    // Fallback: If no question_id is provided, execute single code snippet
    const singleResult = await judge0Service.executeCode({
      language_id,
      source_code,
      stdin
    });

    res.json({
      success: true,
      action: 'submit',
      verdict: singleResult.status.description,
      result: singleResult
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      action: 'submit',
      error: error.message || 'Error evaluating submission.'
    });
  }
});

module.exports = router;

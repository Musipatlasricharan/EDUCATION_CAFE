const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

// Create a temp directory for local execution fallback
const TEMP_DIR = path.join(__dirname, '..', 'tmp_executions');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Execute code via OneCompiler API (Primary) or Local execution (Fallback)
 */
exports.runCode = async (code, language, stdin = '') => {
  // 1. Try OneCompiler Remote Execution API if credentials exist
  if (process.env.ONECOMPILER_API_KEY) {
    return await runWithOneCompiler(code, language, stdin);
  }

  // 2. Fallback to Local Host Execution if no API keys
  console.log('OneCompiler key missing. Falling back to local execution.');
  return await runLocally(code, language, stdin);
};

async function runWithOneCompiler(code, language, stdin) {
  const oneCompilerPayload = {
    language: language.toLowerCase() === 'python' ? 'python' : (language.toLowerCase() === 'c++' || language.toLowerCase() === 'cpp' ? 'cpp' : language.toLowerCase()),
    stdin: stdin || '',
    files: [
      {
        name: 'main.' + (language.toLowerCase() === 'python' ? 'py' : language.toLowerCase()),
        content: code
      }
    ]
  };

  const options = {
    method: 'POST',
    url: 'https://onecompiler-apis.p.rapidapi.com/api/v1/run',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.ONECOMPILER_API_KEY.trim(),
      'X-RapidAPI-Host': 'onecompiler-apis.p.rapidapi.com'
    },
    data: oneCompilerPayload,
    timeout: 20000
  };

  try {
    const response = await axios.request(options);

    const data = response.data;
    // OneCompiler returns: { status, stdout, stderr, executionTime, exception }
    const rawOutput = data.stdout || '';
    const rawError = data.stderr || data.exception || '';
    
    const isError = data.status === 'failed' || rawError.length > 0;
    const compileFailed = isError && !rawOutput; 

    const exitCode = isError ? 1 : 0;

    return {
      stdout: compileFailed ? '' : rawOutput,
      stderr: compileFailed ? rawOutput : rawError,
      output: rawOutput || rawError,
      exitCode,
      isCompileError: compileFailed
    };
  } catch (error) {
    console.error('OneCompiler API failed, falling back to local...', error?.response?.data || error.message);
    return await runLocally(code, language, stdin);
  }
}

async function runLocally(code, language, stdin = '') {
  const jobId = crypto.randomBytes(8).toString('hex');
  const jobDir = path.join(TEMP_DIR, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  let sourceFile, compileCmd, runCmd;
  
  if (language === 'python') {
    sourceFile = path.join(jobDir, 'solution.py');
    fs.writeFileSync(sourceFile, code);
    // Python 3.13 on Windows registers as both 'python' and 'py'
    // Use 'python' with -u for unbuffered; works for 3.13.x
    runCmd = { cmd: 'python', args: ['-u', sourceFile] };
  } else if (language === 'c') {
    sourceFile = path.join(jobDir, 'solution.c');
    const outFile = path.join(jobDir, 'solution.exe');
    fs.writeFileSync(sourceFile, code);
    compileCmd = { cmd: 'gcc', args: [sourceFile, '-o', outFile] };
    runCmd = { cmd: outFile, args: [] };
  } else if (language === 'cpp') {
    sourceFile = path.join(jobDir, 'solution.cpp');
    const outFile = path.join(jobDir, 'solution.exe');
    fs.writeFileSync(sourceFile, code);
    compileCmd = { cmd: 'g++', args: [sourceFile, '-o', outFile] };
    runCmd = { cmd: outFile, args: [] };
  } else if (language === 'java') {
    sourceFile = path.join(jobDir, 'Main.java');
    fs.writeFileSync(sourceFile, code);
    compileCmd = { cmd: 'javac', args: [sourceFile] };
    runCmd = { cmd: 'java', args: ['-cp', jobDir, 'Main'] };
  } else {
    throw new Error(`Unsupported language: ${language}`);
  }

  try {
    if (compileCmd) {
      const compileResult = await executeCommand(compileCmd.cmd, compileCmd.args, '', 10000, jobDir);
      if (compileResult.exitCode !== 0) {
        return {
          stdout: '', stderr: compileResult.stderr, output: compileResult.stderr,
          exitCode: compileResult.exitCode, isCompileError: true
        };
      }
    }

    const runResult = await executeCommand(runCmd.cmd, runCmd.args, stdin, 5000, jobDir);
    return {
      stdout: runResult.stdout, stderr: runResult.stderr,
      output: runResult.stdout || runResult.stderr,
      exitCode: runResult.exitCode, isCompileError: false
    };
  } finally {
    try { fs.rmSync(jobDir, { recursive: true, force: true }); } catch (e) { }
  }
}

function executeCommand(cmd, args, stdin, timeout, cwd) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let isTerminated = false;

    const processInstance = spawn(cmd, args, { cwd, shell: true });

    let timeoutId = setTimeout(() => {
      isTerminated = true;
      processInstance.kill('SIGKILL');
      resolve({ stdout, stderr: stderr || 'Time Limit Exceeded', exitCode: 124 });
    }, timeout);

    if (stdin) {
      processInstance.stdin.write(stdin);
      processInstance.stdin.end();
    }

    processInstance.stdout.on('data', (data) => stdout += data.toString());
    processInstance.stderr.on('data', (data) => stderr += data.toString());

    processInstance.on('close', (code) => {
      if (!isTerminated) {
        clearTimeout(timeoutId);
        resolve({ stdout, stderr, exitCode: code });
      }
    });
    
    processInstance.on('error', (err) => {
      if (!isTerminated) {
        clearTimeout(timeoutId);
        resolve({ stdout, stderr: stderr || err.message, exitCode: 1 });
      }
    });
  });
}

/**
 * Test code against an array of test cases
 */
exports.testCode = async (code, language, testCases) => {
  const results = [];
  let passedCount = 0;

  for (const testCase of testCases) {
    try {
      const result = await exports.runCode(code, language, testCase.input || '');

      const actualOutput = (result.stdout || '').trim();
      const expectedOutput = (testCase.output || '').trim();
      const passed = actualOutput === expectedOutput && result.exitCode === 0;

      if (passed) passedCount++;

      // Determine verdict
      let verdict = 'accepted';
      if (result.isCompileError) {
        verdict = 'compilation_error';
      } else if (result.exitCode === 124) {
        verdict = 'time_limit_exceeded';
      } else if (result.exitCode !== 0) {
        verdict = 'runtime_error';
      } else if (!passed) {
        verdict = 'wrong_answer';
      }

      results.push({
        input: testCase.input,
        expected: expectedOutput,
        actual: actualOutput,
        passed,
        verdict,
        error: result.isCompileError ? result.stderr : (result.exitCode !== 0 ? result.stderr : ''),
        exitCode: result.exitCode
      });
    } catch (error) {
      results.push({
        input: testCase.input,
        expected: testCase.output,
        actual: '',
        passed: false,
        verdict: 'error',
        error: error.message
      });
    }
  }

  return {
    passed: passedCount,
    total: testCases.length,
    results
  };
};

/**
 * Submit code - alias for testCode (runs ALL test cases)
 */
exports.submitCode = exports.testCode;

/**
 * Basic complexity analysis (regex-based, not language-accurate)
 */
exports.analyzeComplexity = (code) => {
  const hasNestedLoops = /for\s*\(.*\)\s*{[\s\S]*?for\s*\(/i.test(code) ||
                         /while\s*\([\s\S]*?for\s*\(/i.test(code);
  const hasTripleNested = /for\s*\([\s\S]*?for\s*\([\s\S]*?for\s*\(/i.test(code);

  let estimatedTimeComplexity = 'O(1)';
  if (hasTripleNested) estimatedTimeComplexity = 'O(n³)';
  else if (hasNestedLoops) estimatedTimeComplexity = 'O(n²)';
  else if (/for\s*\(|while\s*\(/i.test(code)) estimatedTimeComplexity = 'O(n)';

  const hasRecursion = /function\s+\w+|def\s+\w+|void\s+\w+|int\s+\w+\s*\(/i.test(code) &&
                       /return\s+\w+\s*\(/i.test(code);

  return {
    estimatedTimeComplexity,
    estimatedSpaceComplexity: hasRecursion ? 'O(n)' : 'O(1)'
  };
};

module.exports = exports;

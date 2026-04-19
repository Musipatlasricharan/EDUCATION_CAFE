const CodingProblem = require('../models/CodingProblem');

const problems = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `### Problem Description
Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to target*.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

### Constraints
- $2 \le nums.length \le 10^4$
- $-10^9 \le nums[i] \le 10^9$
- $-10^9 \le target \le 10^9$

### Example
**Input:**
\`\`\`
nums = [2, 7, 11, 15]
target = 9
\`\`\`

**Output:**
\`\`\`
[0, 1]
\`\`\`

**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].
`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    testCases: [
      { input: "4 9\n2 7 11 15", expectedOutput: "0 1", isHidden: false },
      { input: "3 6\n3 2 4", expectedOutput: "1 2", isHidden: false },
      { input: "2 6\n3 3", expectedOutput: "0 1", isHidden: true }
    ],
    starterCode: {
      python: "import sys\ndef solve():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n, target = int(input_data[0]), int(input_data[1])\n    nums = list(map(int, input_data[2:]))\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            print(f\"{prevMap[diff]} {i}\")\n            return\n        prevMap[n] = i\nsolve()",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nconst n = parseInt(input[0]);\nconst target = parseInt(input[1]);\nconst nums = input.slice(2).filter(x => x !== '').map(Number);\nconst map = new Map();\nfor(let i=0; i<n; i++) {\n    const diff = target - nums[i];\n    if(map.has(diff)) {\n        console.log(`${map.get(diff)} ${i}`);\n        process.exit();\n    }\n    map.set(nums[i], i);\n}"
    }
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['Stack', 'String'],
    description: `### Problem Description
Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

### Constraints
- $1 \le s.length \le 10^4$
- \`s\` consists of parentheses only \`()[]{}\`.

### Example
**Input:**
\`\`\`
s = "()[]{}"
\`\`\`

**Output:**
\`\`\`
true
\`\`\`
`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    testCases: [
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "([)]", expectedOutput: "false", isHidden: false },
      { input: "{[]}", expectedOutput: "true", isHidden: true }
    ],
    starterCode: {
      python: "import sys\ndef solve():\n    s = sys.stdin.read().strip()\n    stack = []\n    m = {')':'(', '}':'{', ']':'['}\n    for char in s:\n        if char in m:\n            if stack and stack[-1] == m[char]:\n                stack.pop()\n            else:\n                print(\"false\")\n                return\n        else:\n            stack.append(char)\n    print(\"true\" if not stack else \"false\")\nsolve()",
      javascript: "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf8').trim();\nconst stack = [];\nconst m = {')':'(', '}':'{', ']':'['};\nfor(const char of s) {\n    if(m[char]) {\n        if(stack.length && stack[stack.length-1] === m[char]) stack.pop();\n        else { console.log(\"false\"); process.exit(); }\n    } else stack.push(char);\n}\nconsole.log(stack.length === 0 ? \"true\" : \"false\");"
    }
  },
  {
    title: 'Linear Search',
    difficulty: 'Easy',
    tags: ['Array', 'Search'],
    description: `### Problem Description
Given an array \`arr\` of \`n\` integers and an integer \`target\`, return the index of the \`target\` if it exists in the array. Otherwise, return -1.

### Constraints
- $1 \le n \le 10^5$

### Example
**Input:**
\`\`\`
n = 5, target = 30, arr = [10, 20, 30, 40, 50]
\`\`\`

**Output:**
\`\`\`
2
\`\`\`
`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    testCases: [
      { input: "5 30\n10 20 30 40 50", expectedOutput: "2", isHidden: false },
      { input: "3 100\n10 20 30", expectedOutput: "-1", isHidden: false }
    ],
    starterCode: {
      python: "import sys\ndef solve():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n, target = int(input_data[0]), int(input_data[1])\n    arr = list(map(int, input_data[2:]))\n    for i in range(len(arr)):\n        if arr[i] == target:\n            print(i)\n            return\n    print(\"-1\")\nsolve()",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nconst n = parseInt(input[0]);\nconst target = parseInt(input[1]);\nconst arr = input.slice(2).filter(x => x !== '').map(Number);\nlet found = -1;\nfor(let i=0; i<n; i++) { if(arr[i] === target) { found = i; break; } }\nconsole.log(found);"
    }
  },
  {
    title: 'Merge Sorted Array',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    description: `### Problem Description
You are given two integer arrays \`nums1\` and \`nums2\`, sorted in non-decreasing order, and two integers \`m\` and \`n\`, representing the number of elements in \`nums1\` and \`nums2\` respectively.

Merge \`nums1\` and \`nums2\` into a single array sorted in non-decreasing order.

### Constraints
- $nums1.length == m + n$
- $nums2.length == n$
- $0 \le m, n \le 200$

### Example
**Input:**
\`\`\`
nums1 = [1, 2, 3, 0, 0, 0], m = 3
nums2 = [2, 5, 6], n = 3
\`\`\`

**Output:**
\`\`\`
[1, 2, 2, 3, 5, 6]
\`\`\`
`,
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(1)',
    testCases: [
      { input: "3 3\n1 2 3\n2 5 6", expectedOutput: "1 2 2 3 5 6", isHidden: false },
      { input: "1 0\n1\n", expectedOutput: "1", isHidden: false }
    ],
    starterCode: {
      python: "import sys\ndef solve():\n    input = sys.stdin.read().split()\n    m, n = int(input[0]), int(input[1])\n    nums1 = list(map(int, input[2:2+m]))\n    nums2 = list(map(int, input[2+m:2+m+n]))\n    res = sorted(nums1 + nums2)\n    print(\" \".join(map(str, res)))\nsolve()",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nconst m = parseInt(input[0]);\nconst n = parseInt(input[1]);\nconst nums1 = input.slice(2, 2+m).map(Number);\nconst nums2 = input.slice(2+m, 2+m+n).map(Number);\nconst res = [...nums1, ...nums2].sort((a,b)=>a-b);\nconsole.log(res.join(' '));"
    }
  },
  {
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    description: `### Problem Description
Given the head of a singly linked list, reverse the list, and return the reversed list.

### Constraints
- The number of nodes in the list is in the range $[0, 5000]$.
- $-5000 \le Node.val \le 5000$

### Example
**Input:**
\`\`\`
head = [1, 2, 3, 4, 5]
\`\`\`

**Output:**
\`\`\`
[5, 4, 3, 2, 1]
\`\`\`
`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1", isHidden: false },
      { input: "2\n1 2", expectedOutput: "2 1", isHidden: false }
    ],
    starterCode: {
      python: "import sys\ndef solve():\n    input = sys.stdin.read().split()\n    if not input: return\n    n = int(input[0])\n    vals = input[1:]\n    print(\" \".join(vals[::-1]))\nsolve()",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif(!input[0]) return;\nconst n = parseInt(input[0]);\nconst vals = input.slice(1, 1+n);\nconsole.log(vals.reverse().join(' '));"
    }
  }
];

const seedProblems = async () => {
  try {
    for (const p of problems) {
      await CodingProblem.findOneAndUpdate(
        { title: p.title },
        p,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Coding problems seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding problems:', err.message);
  }
};

module.exports = seedProblems;

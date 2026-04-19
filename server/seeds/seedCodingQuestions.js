/**
 * Seed Script: Coding Questions
 * Run: node seeds/seedCodingQuestions.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const CodingQuestion = require('../models/CodingQuestion');

const MONGO_URI = process.env.MONGO_URI;

const questions = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Find two numbers in an array that add up to a target.',
    problemStatement: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Input Format:**
- First line: space-separated integers (the array)  
- Second line: the target integer

**Output Format:**
- Two space-separated indices (0-indexed)`,
    difficulty: 'Easy',
    tags: ['array', 'hash-map'],
    category: 'Array',
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists'
    ],
    examples: [
      {
        input: '2 7 11 15\n9',
        output: '0 1',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9 = target'
      },
      {
        input: '3 2 4\n6',
        output: '1 2',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6 = target'
      }
    ],
    testCases: [
      { input: '2 7 11 15\n9', output: '0 1', isExample: true },
      { input: '3 2 4\n6', output: '1 2', isExample: true },
      { input: '3 3\n6', output: '0 1', isExample: false },
      { input: '1 2 3 4 5\n9', output: '3 4', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(n)',
    boilerplateCode: {
      python: `import sys

def two_sum(nums, target):
    # Write your solution here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().split('\\n')
    nums = list(map(int, lines[0].strip().split()))
    target = int(lines[1].strip())
    result = two_sum(nums, target)
    print(result[0], result[1])
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
    return {};
}

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> nums;
    int x;
    while (iss >> x) nums.push_back(x);
    
    int target;
    cin >> target;
    
    auto result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

void twoSum(int* nums, int numsSize, int target, int* idx1, int* idx2) {
    // Write your solution here
}

int main() {
    int nums[10000], n = 0, target;
    char line[100000];
    fgets(line, sizeof(line), stdin);
    char* token = strtok(line, " ");
    while (token != NULL) {
        nums[n++] = atoi(token);
        token = strtok(NULL, " \\n");
    }
    scanf("%d", &target);
    
    int i, j;
    twoSum(nums, n, target, &i, &j);
    printf("%d %d\\n", i, j);
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().trim().split(" ");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = sc.nextInt();
        
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}
`
    }
  },
  {
    title: 'Reverse a String',
    slug: 'reverse-a-string',
    description: 'Reverse the characters of a given string.',
    problemStatement: `Write a program that takes a string as input and outputs the reversed string.

**Input Format:**
- A single line containing the string to reverse.

**Output Format:**
- The reversed string on a single line.`,
    difficulty: 'Easy',
    tags: ['string', 'basics'],
    category: 'String',
    constraints: [
      '1 ≤ length of string ≤ 10⁵',
      'String contains only printable ASCII characters'
    ],
    examples: [
      { input: 'hello', output: 'olleh', explanation: 'Reverse of "hello" is "olleh"' },
      { input: 'OpenAI', output: 'IAnepO', explanation: 'Reverse of "OpenAI" is "IAnepO"' }
    ],
    testCases: [
      { input: 'hello', output: 'olleh', isExample: true },
      { input: 'OpenAI', output: 'IAnepO', isExample: true },
      { input: 'abcde', output: 'edcba', isExample: false },
      { input: 'racecar', output: 'racecar', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(n)',
    boilerplateCode: {
      python: `s = input().strip()
# Write your solution here
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s;
    getline(cin, s);
    // Write your solution here
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>
int main() {
    char s[100001];
    fgets(s, sizeof(s), stdin);
    int n = strlen(s);
    if (s[n-1] == '\\n') s[--n] = '\\0';
    // Write your solution here
    return 0;
}
`,
      java: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        // Write your solution here
    }
}
`
    }
  },
  {
    title: 'FizzBuzz',
    slug: 'fizzbuzz',
    description: 'Classic FizzBuzz: print Fizz, Buzz, or FizzBuzz based on multiples.',
    problemStatement: `Given a number N, print numbers from 1 to N with the following rules:
- If a number is divisible by 3, print **Fizz**
- If a number is divisible by 5, print **Buzz**
- If a number is divisible by both 3 and 5, print **FizzBuzz**
- Otherwise, print the number itself

**Input Format:**
- A single integer N

**Output Format:**
- N lines, one result per line`,
    difficulty: 'Easy',
    tags: ['math', 'basics', 'loops'],
    category: 'Math',
    constraints: ['1 ≤ N ≤ 10⁵'],
    examples: [
      {
        input: '5',
        output: '1\n2\nFizz\n4\nBuzz',
        explanation: '3 → Fizz, 5 → Buzz'
      }
    ],
    testCases: [
      { input: '5', output: '1\n2\nFizz\n4\nBuzz', isExample: true },
      { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(1)',
    boilerplateCode: {
      python: `n = int(input())
for i in range(1, n + 1):
    # Write your solution here
    pass
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        // Write your solution here
    }
    return 0;
}
`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        // Write your solution here
    }
    return 0;
}
`,
      java: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= n; i++) {
            // Write your solution here
        }
    }
}
`
    }
  },
  {
    title: 'Fibonacci Number',
    slug: 'fibonacci-number',
    description: 'Return the N-th Fibonacci number (0-indexed).',
    problemStatement: `The Fibonacci sequence is defined as:
- F(0) = 0
- F(1) = 1
- F(n) = F(n-1) + F(n-2) for n ≥ 2

Given N, return F(N).

**Input Format:**
- A single integer N

**Output Format:**
- A single integer: the N-th Fibonacci number`,
    difficulty: 'Easy',
    tags: ['dynamic-programming', 'recursion', 'math'],
    category: 'Dynamic Programming',
    constraints: ['0 ≤ N ≤ 30'],
    examples: [
      { input: '5', output: '5', explanation: 'F(5) = 0,1,1,2,3,5 → 5' },
      { input: '10', output: '55', explanation: 'F(10) = 55' }
    ],
    testCases: [
      { input: '0', output: '0', isExample: false },
      { input: '1', output: '1', isExample: false },
      { input: '5', output: '5', isExample: true },
      { input: '10', output: '55', isExample: true },
      { input: '15', output: '610', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(1)',
    boilerplateCode: {
      python: `n = int(input())
def fib(n):
    # Write your solution here
    pass
print(fib(n))
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int fib(int n) {
    // Write your solution here
    return 0;
}
int main() {
    int n; cin >> n;
    cout << fib(n) << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
int fib(int n) {
    // Write your solution here
    return 0;
}
int main() {
    int n; scanf("%d", &n);
    printf("%d\\n", fib(n));
    return 0;
}
`,
      java: `import java.util.Scanner;
public class Main {
    static int fib(int n) {
        // Write your solution here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(fib(n));
    }
}
`
    }
  },
  {
    title: 'Check Palindrome',
    slug: 'check-palindrome',
    description: 'Determine if a given string is a palindrome.',
    problemStatement: `A palindrome is a string that reads the same forward and backward (case-sensitive).

Given a string, print **YES** if it is a palindrome, or **NO** otherwise.

**Input Format:**
- A single line containing the string.

**Output Format:**
- Print YES or NO`,
    difficulty: 'Easy',
    tags: ['string', 'two-pointers'],
    category: 'String',
    constraints: [
      '1 ≤ length ≤ 10⁵',
      'String consists of printable ASCII characters'
    ],
    examples: [
      { input: 'racecar', output: 'YES', explanation: '"racecar" reads the same backwards' },
      { input: 'hello', output: 'NO', explanation: '"hello" ≠ "olleh"' }
    ],
    testCases: [
      { input: 'racecar', output: 'YES', isExample: true },
      { input: 'hello', output: 'NO', isExample: true },
      { input: 'madam', output: 'YES', isExample: false },
      { input: 'OpenAI', output: 'NO', isExample: false },
      { input: 'A', output: 'YES', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(1)',
    boilerplateCode: {
      python: `s = input().strip()
# Write your solution here
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s;
    getline(cin, s);
    // Write your solution here
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>
int main() {
    char s[100001];
    fgets(s, sizeof(s), stdin);
    int n = strlen(s);
    if (s[n-1] == '\\n') s[--n] = '\\0';
    // Write your solution here
    return 0;
}
`,
      java: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        // Write your solution here
    }
}
`
    }
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    description: "Find the contiguous subarray with the largest sum (Kadane's Algorithm).",
    problemStatement: `Given an integer array \`nums\`, find the subarray with the largest sum and return its sum.

**Input Format:**
- A single line of space-separated integers.

**Output Format:**
- A single integer: the maximum subarray sum.`,
    difficulty: 'Medium',
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    category: 'Dynamic Programming',
    constraints: [
      '1 ≤ nums.length ≤ 10⁵',
      '-10⁴ ≤ nums[i] ≤ 10⁴'
    ],
    examples: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6' },
      { input: '1', output: '1', explanation: 'Only one element' }
    ],
    testCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', isExample: true },
      { input: '1', output: '1', isExample: true },
      { input: '5 4 -1 7 8', output: '23', isExample: false },
      { input: '-1 -2 -3 -4', output: '-1', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(1)',
    boilerplateCode: {
      python: `nums = list(map(int, input().split()))
def max_subarray(nums):
    # Write your solution here (Kadane's Algorithm)
    pass
print(max_subarray(nums))
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    vector<int> nums;
    int x;
    string line;
    getline(cin, line);
    istringstream iss(line);
    while (iss >> x) nums.push_back(x);
    
    // Write your solution here (Kadane's Algorithm)
    int maxSum = nums[0];
    cout << maxSum << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
int main() {
    int nums[100001], n = 0;
    while (scanf("%d", &nums[n]) == 1) n++;
    
    // Write your solution here (Kadane's Algorithm)
    int maxSum = nums[0];
    printf("%d\\n", maxSum);
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().trim().split(" ");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        
        // Write your solution here (Kadane's Algorithm)
        int maxSum = nums[0];
        System.out.println(maxSum);
    }
}
`
    }
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    description: 'Determine if a string of brackets is valid.',
    problemStatement: `Given a string containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print **YES** if valid, **NO** otherwise.

**Input Format:**
- A single line containing the bracket string.

**Output Format:**
- YES or NO`,
    difficulty: 'Medium',
    tags: ['stack', 'string'],
    category: 'Stack',
    constraints: [
      '1 ≤ s.length ≤ 10⁴',
      's consists of parentheses only'
    ],
    examples: [
      { input: '()', output: 'YES', explanation: 'Simple matching pair' },
      { input: '()[]{} ', output: 'YES', explanation: 'All pairs match in order' },
      { input: '(]', output: 'NO', explanation: 'Mismatched bracket types' }
    ],
    testCases: [
      { input: '()', output: 'YES', isExample: true },
      { input: '()[]{}', output: 'YES', isExample: true },
      { input: '(]', output: 'NO', isExample: true },
      { input: '([)]', output: 'NO', isExample: false },
      { input: '{[]}', output: 'YES', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(n)',
    boilerplateCode: {
      python: `s = input().strip()
def is_valid(s):
    # Write your solution here using a stack
    pass
print("YES" if is_valid(s) else "NO")
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
bool isValid(string s) {
    // Write your solution here using a stack
    return false;
}
int main() {
    string s;
    getline(cin, s);
    cout << (isValid(s) ? "YES" : "NO") << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>
bool isValid(char* s) {
    // Write your solution here using a stack
    return false;
}
int main() {
    char s[10001];
    fgets(s, sizeof(s), stdin);
    int n = strlen(s);
    if (s[n-1] == '\\n') s[--n] = '\\0';
    printf("%s\\n", isValid(s) ? "YES" : "NO");
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    static boolean isValid(String s) {
        // Write your solution here using a stack
        return false;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        System.out.println(isValid(s) ? "YES" : "NO");
    }
}
`
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const q of questions) {
      const exists = await CodingQuestion.findOne({ slug: q.slug });
      if (exists) {
        console.log(`  ⏭  Skipped (already exists): ${q.title}`);
        skipped++;
        continue;
      }
      await CodingQuestion.create({ ...q, isActive: true, isPremium: false });
      console.log(`  ✅  Created: ${q.title}`);
      created++;
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();

const mongoose = require('mongoose');
const CodingQuestion = require('../models/CodingQuestion');
const User = require('../models/User');
const dotenv = require('dotenv');
const dns = require('dns');

// DNS Fixes for restrictive environments
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleQuestions = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Given an array of integers and a target, find two numbers that add up to the target.',
    problemStatement: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    tags: ['array', 'hashtable', 'two-pointers'],
    category: 'Array',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] == 9, so we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6, so we return [1, 2].'
      }
    ],
    testCases: [
      { input: '2\n7\n11\n15\n9', output: '0 1', isExample: true },
      { input: '3\n2\n4\n6', output: '1 2', isExample: true },
      { input: '3\n3\n4\n3', output: '0 1', isExample: false },
      { input: '2\n5\n5\n10', output: '0 1', isExample: false },
      { input: '4\n1\n2\n3\n7\n10', output: '3 2', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(n)',
    boilerplateCode: {
      python: `def twoSum(nums, target):
    """
    Args:
        nums: List of integers
        target: Target sum
    Returns:
        List of two indices
    """
    # TODO: Write your solution here
    pass`,
      cpp: `#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // TODO: Write your solution here
    return {};
}`,
      c: `#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // TODO: Write your solution here
    returnSize[0] = 2;
    return (int*)malloc(2 * sizeof(int));
}`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // TODO: Write your solution here
        return new int[]{};
    }
}`
    },
    isPremium: false
  },
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    description: 'Write a function that reverses a string.',
    problemStatement: `Given a string s, write a function that reverses it.

For this problem, assume the string does not contain any special characters, and there are no spaces in the string.`,
    difficulty: 'Easy',
    tags: ['string', 'two-pointers'],
    category: 'String',
    constraints: [
      '1 <= s.length <= 10^5',
      's consists of printable ASCII characters.'
    ],
    examples: [
      {
        input: 'hello',
        output: 'olleh',
        explanation: 'Reverse the order of characters.'
      }
    ],
    testCases: [
      { input: 'hello', output: 'olleh', isExample: true },
      { input: 'a', output: 'a', isExample: false },
      { input: 'ab', output: 'ba', isExample: false },
      { input: 'abcd', output: 'dcba', isExample: false }
    ],
    timeComplexityExpected: 'O(n)',
    spaceComplexityExpected: 'O(1)',
    boilerplateCode: {
      python: `def reverseString(s):
    """
    Args:
        s: String to reverse
    Returns:
        Reversed string
    """
    # TODO: Write your solution here
    pass`,
      cpp: `#include <string>
using namespace std;

string reverseString(string s) {
    // TODO: Write your solution here
    return "";
}`,
      c: `#include <string.h>

char* reverseString(char* s) {
    // TODO: Write your solution here
    return s;
}`,
      java: `class Solution {
    public String reverseString(String s) {
        // TODO: Write your solution here
        return "";
    }
}`
    },
    isPremium: false
  }
];

async function seedSampleQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Get an admin user (or use a system ID)
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      // Create a system admin user if none exists
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@educafe.com',
        password: 'Admin@123456',
        college: 'EduCafe',
        role: 'admin'
      });
      console.log('Created system admin user');
    }

    for (const questionData of sampleQuestions) {
      const question = await CodingQuestion.findOneAndUpdate(
        { slug: questionData.slug },
        {
          ...questionData,
          createdBy: adminUser._id
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded question: ${question.title}`);
    }

    console.log('All sample questions seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample questions:', error);
    process.exit(1);
  }
}

seedSampleQuestions();

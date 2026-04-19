const axios = require('axios');

exports.verifyGithub = async (username) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`);
    const data = response.data;
    return {
      success: true,
      username: data.login,
      stats: {
        publicRepos: data.public_repos,
        followers: data.followers,
        created_at: data.created_at
      }
    };
  } catch (error) {
    return { success: false, message: 'Github user not found' };
  }
};

exports.verifyLeetcode = async (username) => {
  try {
    const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`);
    const data = response.data;
    if (data.status === 'error' || !data.totalSolved) throw new Error('Not found');
    
    return {
      success: true,
      username: username,
      stats: {
        totalSolved: data.totalSolved,
        easySolved: data.easySolved,
        mediumSolved: data.mediumSolved,
        hardSolved: data.hardSolved,
        ranking: data.ranking
      }
    };
  } catch (error) {
    return { success: false, message: 'LeetCode user not found or private profile' };
  }
};

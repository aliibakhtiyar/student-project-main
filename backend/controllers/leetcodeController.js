const leetcodeAPI = require("../config/leetcode");

const getLeetCodeProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "LeetCode username is required",
      });
    }

    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username

          profile {
            realName
            userAvatar
            aboutMe
            ranking
            reputation
            starRating
          }

          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }

          badges {
            id
            name
            icon
            creationDate
          }
        }

        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
        }
      }
    `;

    const response = await leetcodeAPI.post("/graphql", {
      query,
      variables: {
        username,
      },
    });

    const data = response.data?.data;

    const user = data?.matchedUser;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "LeetCode user not found",
      });
    }

    const solvedStats =
      user.submitStats?.acSubmissionNum || [];

    const getSolved = (difficulty) => {
      const item = solvedStats.find(
        (item) => item.difficulty === difficulty
      );

      return item?.count || 0;
    };

    const total =
      getSolved("All");

    const contest =
      data?.userContestRanking;

    res.json({
      success: true,

      leetcode: {
        username: user.username,

        realName:
          user.profile?.realName || "",

        avatar:
          user.profile?.userAvatar || "",

        about:
          user.profile?.aboutMe || "",

        ranking:
          user.profile?.ranking || null,

        reputation:
          user.profile?.reputation || 0,

        starRating:
          user.profile?.starRating || 0,

        solved: {
          total,
          easy: getSolved("Easy"),
          medium: getSolved("Medium"),
          hard: getSolved("Hard"),
        },

        contest: contest
          ? {
              rating: contest.rating,
              globalRanking:
                contest.globalRanking,
              totalParticipants:
                contest.totalParticipants,
              topPercentage:
                contest.topPercentage,
              attendedContests:
                contest.attendedContestsCount,
            }
          : null,

        badges:
          user.badges || [],

        profileUrl:
          `https://leetcode.com/u/${user.username}/`,
      },
    });

  } catch (error) {
    console.error(
      "LeetCode API error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch LeetCode profile",
    });
  }
};

module.exports = {
  getLeetCodeProfile,
};
const axios = require("axios");
const githubAPI = require("../config/github");

/*
|--------------------------------------------------------------------------
| GitHub OAuth
|--------------------------------------------------------------------------
*/

const connectGitHub = (req, res) => {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,

      // read:user -> profile
      // user:email -> email
      // repo -> repositories
      scope: "read:user user:email repo",
    });

    const githubURL =
      `https://github.com/login/oauth/authorize?${params.toString()}`;

    return res.redirect(githubURL);
  } catch (error) {
    console.error("GitHub Connect Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to connect GitHub",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GitHub OAuth Callback
|--------------------------------------------------------------------------
*/

const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "GitHub authorization code missing",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Exchange code for access token
    |--------------------------------------------------------------------------
    */

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken =
      tokenResponse.data.access_token;

    if (!accessToken) {
      console.error(
        "GitHub Token Response:",
        tokenResponse.data
      );

      throw new Error(
        "GitHub access token not received"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | TEMPORARY TOKEN STORAGE
    |--------------------------------------------------------------------------
    */

    global.githubAccessToken = accessToken;

    /*
    |--------------------------------------------------------------------------
    | Test GitHub connection
    |--------------------------------------------------------------------------
    */

    const profileResponse =
      await githubAPI.get("/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

    console.log(
      "================================"
    );

    console.log(
      "GitHub Connected Successfully"
    );

    console.log(
      "Username:",
      profileResponse.data.login
    );

    console.log(
      "================================"
    );

    /*
    |--------------------------------------------------------------------------
    | Redirect frontend
    |--------------------------------------------------------------------------
    */

    return res.redirect(
      "https://student-project-main.onrender.com/public-profile?github=connected"
    );

  } catch (error) {
    console.error(
      "========== GITHUB CALLBACK ERROR =========="
    );

    console.error(
      error.response?.data ||
      error.message
    );

    console.error(
      "============================================"
    );

    return res.status(500).json({
      success: false,
      message: "GitHub authorization failed",
      error:
        error.response?.data ||
        error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Helper: GitHub Headers
|--------------------------------------------------------------------------
*/

const getGitHubHeaders = () => {
  return {
    Authorization:
      `Bearer ${global.githubAccessToken}`,

    Accept:
      "application/vnd.github+json",

    "X-GitHub-Api-Version":
      "2022-11-28",
  };
};


/*
|--------------------------------------------------------------------------
| Get GitHub Profile
|--------------------------------------------------------------------------
*/

const getGitHubProfile = async (req, res) => {
  try {

    if (!global.githubAccessToken) {
      return res.status(401).json({
        success: false,
        message: "GitHub is not connected",
      });
    }

    const response =
      await githubAPI.get(
        "/user",
        {
          headers:
            getGitHubHeaders(),
        }
      );

    const user =
      response.data;

    return res.status(200).json({

      success: true,

      github: {

        login:
          user.login,

        name:
          user.name,

        avatar_url:
          user.avatar_url,

        bio:
          user.bio,

        html_url:
          user.html_url,

        public_repos:
          user.public_repos,

        followers:
          user.followers,

        following:
          user.following,

        public_gists:
          user.public_gists,

        company:
          user.company,

        location:
          user.location,

        blog:
          user.blog,

        created_at:
          user.created_at,
      },
    });

  } catch (error) {

    console.error(
      "GitHub Profile Error:",
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch GitHub profile",
    });
  }
};


/*
|--------------------------------------------------------------------------
| Get GitHub Repositories
|--------------------------------------------------------------------------
*/

const getGitHubRepositories = async (req, res) => {
  try {

    if (!global.githubAccessToken) {
      return res.status(401).json({
        success: false,
        message: "GitHub is not connected",
      });
    }

    const response =
      await githubAPI.get(
        "/user/repos",
        {
          headers:
            getGitHubHeaders(),

          params: {
            visibility: "public",
            affiliation: "owner,collaborator,organization_member",
            sort: "updated",
            direction: "desc",
            per_page: 100,
          },
        }
      );

    const repositories =
      response.data.map((repo) => ({
        id: repo.id,

        name:
          repo.name,

        full_name:
          repo.full_name,

        description:
          repo.description,

        html_url:
          repo.html_url,

        language:
          repo.language,

        stars:
          repo.stargazers_count,

        forks:
          repo.forks_count,

        watchers:
          repo.watchers_count,

        is_private:
          repo.private,

        updated_at:
          repo.updated_at,
      }));

    return res.status(200).json({
      success: true,

      count:
        repositories.length,

      repositories,
    });

  } catch (error) {

    console.error(
      "GitHub Repository Error:",
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch GitHub repositories",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GitHub Contribution Graph
|--------------------------------------------------------------------------
|
| GitHub contribution calendar is fetched using GraphQL.
|
*/

const getGitHubContributions = async (req, res) => {
  try {

    if (!global.githubAccessToken) {
      return res.status(401).json({
        success: false,
        message: "GitHub is not connected",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate previous 365 days
    |--------------------------------------------------------------------------
    */

    const to =
      new Date();

    const from =
      new Date();

    from.setDate(
      from.getDate() - 365
    );


    const fromDate =
      from.toISOString();

    const toDate =
      to.toISOString();


    /*
    |--------------------------------------------------------------------------
    | GraphQL Query
    |--------------------------------------------------------------------------
    */

    const query = `
      query {
        viewer {
          contributionsCollection(
            from: "${fromDate}"
            to: "${toDate}"
          ) {
            contributionCalendar {
              totalContributions

              weeks {
                contributionDays {
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }
        }
      }
    `;


    /*
    |--------------------------------------------------------------------------
    | GitHub GraphQL Request
    |--------------------------------------------------------------------------
    */

    const response =
      await axios.post(
        "https://api.github.com/graphql",

        {
          query,
        },

        {
          headers: {
            Authorization:
              `Bearer ${global.githubAccessToken}`,

            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            "X-GitHub-Api-Version":
              "2022-11-28",
          },
        }
      );


    /*
    |--------------------------------------------------------------------------
    | GraphQL Errors
    |--------------------------------------------------------------------------
    */

    if (response.data.errors) {

      console.error(
        "GitHub GraphQL Errors:",
        response.data.errors
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to fetch GitHub contributions",

        errors:
          response.data.errors,
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Contribution Calendar
    |--------------------------------------------------------------------------
    */

    const calendar =
      response.data.data.viewer
        .contributionsCollection
        .contributionCalendar;


    /*
    |--------------------------------------------------------------------------
    | Flatten contribution days
    |--------------------------------------------------------------------------
    */

    const contributionDays =
      calendar.weeks.flatMap(
        (week) =>
          week.contributionDays
      );


    /*
    |--------------------------------------------------------------------------
    | Find maximum contribution
    |--------------------------------------------------------------------------
    */

    const maxContribution =
      Math.max(
        ...contributionDays.map(
          (day) =>
            day.contributionCount
        ),
        1
      );


    /*
    |--------------------------------------------------------------------------
    | Convert count into 0-4 levels
    |--------------------------------------------------------------------------
    */

    const contributionGraph =
      contributionDays.map(
        (day) => {

          const count =
            day.contributionCount;

          let level = 0;

          if (count === 0) {
            level = 0;
          } else if (
            count <=
            maxContribution * 0.25
          ) {
            level = 1;
          } else if (
            count <=
            maxContribution * 0.5
          ) {
            level = 2;
          } else if (
            count <=
            maxContribution * 0.75
          ) {
            level = 3;
          } else {
            level = 4;
          }

          return {
            date:
              day.date,

            count,

            weekday:
              day.weekday,

            level,
          };
        }
      );


    return res.status(200).json({

      success: true,

      total:
        calendar.totalContributions,

      maxContribution,

      weeks:
        calendar.weeks,

      contributionGraph,

    });

  } catch (error) {

    console.error(
      "========== GITHUB CONTRIBUTION ERROR =========="
    );

    console.error(
      error.response?.data ||
      error.message
    );

    console.error(
      "================================================"
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to fetch GitHub contributions",

      error:
        error.response?.data ||
        error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {

  connectGitHub,

  githubCallback,

  getGitHubProfile,

  getGitHubRepositories,

  getGitHubContributions,

};  
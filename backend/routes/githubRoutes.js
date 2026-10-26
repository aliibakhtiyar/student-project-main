const express = require("express");

const router = express.Router();

const {
  connectGitHub,
  githubCallback,
  getGitHubProfile,
  getGitHubRepositories,
  getGitHubContributions,
} = require("../controllers/githubController");


/*
|--------------------------------------------------------------------------
| OAuth
|--------------------------------------------------------------------------
*/

router.get(
  "/connect",
  connectGitHub
);


router.get(
  "/callback",
  githubCallback
);


/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/profile",
  getGitHubProfile
);


/*
|--------------------------------------------------------------------------
| Repositories
|--------------------------------------------------------------------------
*/

router.get(
  "/repositories",
  getGitHubRepositories
);


/*
|--------------------------------------------------------------------------
| Contributions
|--------------------------------------------------------------------------
*/

router.get(
  "/contributions",
  getGitHubContributions
);


module.exports = router;
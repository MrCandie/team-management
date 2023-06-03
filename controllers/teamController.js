const Team = require("../models/team-model");
const User = require("../models/user-model");

exports.createTeam = async (req, res, next) => {
  const reqBody = {
    name: req.body.name,
    // remember we stored this user's data on the req object inside the middleware we created.
    userId: req.user.id,
  };
  try {
    // while creating a team, we want to immediately add the creator of the team as an admin of the team.
    const team = await Team.create(reqBody);
    // let us create a member data

    const user = await User.findById(req.user.id);
    const memberDetail = {
      name: user.name || "",
      email: user.email,
      id: req.user.id,
      role: "admin",
    };

    // let us push this member detail inside the member array on the team model
    team.members.push(memberDetail);

    // let us push the team id into the team array on the user model
    user.teams.push(team.id);

    // let us save these changes
    await team.save();
    await user.save();

    return res.status(201).json({
      status: "success",
      data: team,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.sendInvitation = async (req, res, next) => {
  // pass the team id as a parameter
  const { teamId } = req.params;
  // use the member email to send the invitation,
  // so the member email will be the payload
  const { email } = req.body;

  try {
    // find this user in the database
    const member = await User.findOne({ email });

    // if user doesnt exist
    if (!member) {
      return res.status(404).json({
        status: "failed",
        message: "member not found",
      });
    }

    // if member exist, check if member is already in the team
    // 1. find the team
    const team = await Team.findById(teamId);

    // 2. check if team exists
    if (!team) {
      return res.status(404).json({
        status: "failed",
        message: "team not found",
      });
    }

    // if team exists, check if the member is in the team already
    const memberExist = team.members.find((item) => item.id === member.id);
    if (memberExist) {
      return res.status(400).json({
        status: "failed",
        message: "member is already in the team",
      });
    }

    // if not, send the invitation by pushing the teamID inside the member.invitations array

    // push the team ID into the invitations array on the user model

    member.invitations.push(team.id);

    // save changes
    await member.save();

    return res.status(200).json({
      status: "success",
      data: `invitation sent to ${member.email}`,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.acceptInvitation = async (req, res, next) => {
  try {
    // pass the teamID as a parameter to accept invitation
    const { teamId } = req.params;
    // find user in database
    const user = await User.findById(req.user.id);

    // find team in database
    const team = await Team.findById(teamId);

    // check if team still exists

    if (!team) {
      return res.status(404).json({
        status: "success",
        message: "team not found",
      });
    }

    // check if the user is already a member of the team
    const memberExist = team.members.find((item) => item.id === user.id);

    if (memberExist) {
      return res.status(400).json({
        status: "failed",
        message: "you are already a member of this group",
      });
    }

    // if user is not a member of the team, now let us accept invitation and add user to the team
    // 1. create user detail
    const userDetail = {
      name: user.name || "",
      email: user.email,
      id: user.id,
      role: "member",
    };

    // 2. add member to the team
    team.members.push(userDetail);

    // 3. remove the team from the invitation array
    const teamIndex = user.invitations.indexOf(team.id);
    user.invitations.splice(teamIndex);

    // 4. add team to the user team array
    user.teams.push(team.id);

    // 5. save changes
    await user.save();
    await team.save();

    return res.status(200).json({
      status: "success",
      message: `invitation to ${team.name} accepted`,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

// reject team invitation
exports.rejectInvitation = async (req, res) => {
  // find user in db

  const user = await User.findById(req.user.id);

  // find team in db
  // teamID will be gotted as a parameter when we run the request
  const team = await Team.findById(req.params.teamId);

  // check if team exists
  if (!team) {
    return res.status(404).json({
      status: "failed",
      message: "team not found",
    });
  }

  // if team exists, let us find the index of the team in the invitations array
  const teamIndex = user.invitations.indexOf(team.id);

  // remove team id from the invitations array

  user.invitations.splice(teamIndex);

  // save changes
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "invitation rejected",
  });
};

exports.leaveTeam = async (req, res) => {
  // find user in db
  const user = await User.findById(req.user.id);

  // find team in db
  const team = await Team.findById(req.params.teamId);

  // check if team exists
  if (!team) {
    return res.status(404).json({
      status: "failed",
      message: "team not found",
    });
  }

  // if team exist, check if user is a member of the team
  const member = team.members.find((item) => item.id === user.id);

  // if user is not a member, throw an error and terminate
  if (!member) {
    return res.status(400).json({
      status: "failed",
      message: `you are not a member of ${team.name.toUpperCase()}`,
    });
  }

  // if user is a member, find index of team in the team array on the user object
  const teamIndex = user.teams.indexOf(team.id);

  // delete team from team array
  user.teams.splice(teamIndex);

  // remove user from member array on the team
  const newMembers = team.members.filter((item) => item.id !== member.id);
  team.members = newMembers;

  // save changes
  await team.save();
  await user.save();

  return res.status(200).json({
    status: "success",
    message: `successfully exited ${team.name}`,
  });
};

exports.removeMemberFromTeam = async (req, res) => {
  // extract userId and teamId from the request query
  const { userId, teamId } = req.query;

  // find team in db
  const team = await Team.findById(teamId);
  const user = await User.findById(userId);

  // check if team exist
  if (!team) {
    return res.status(404).json({
      status: "failed",
      message: "team not found",
    });
  }

  // if team exist, check if user is a member of the team
  const member = team.members.find((item) => item.id === userId);

  // if user is not a member, throw an error and terminate
  if (!member) {
    return res.status(400).json({
      status: "failed",
      message: `you are not a member of ${team.name.toUpperCase()}`,
    });
  }

  // if user is a member, filter user out of the team
  const newTeamMember = team.members.filter((item) => item.id !== userId);
  team.members = newTeamMember;

  // remove teamId from teams array on user object
  const teamIndex = user.teams.indexOf(team.id);
  user.teams.splice(teamIndex);

  // save changes
  await team.save();
  await user.save();

  return res.status(200).json({
    status: "success",
    message: `${user.name} successfully removed from ${team.name}`,
  });
};

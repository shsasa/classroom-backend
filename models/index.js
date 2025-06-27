const mongoose = require('mongoose');

const User = require('./User')
const Batch = require('./Batch')
const Course = require('./Course')
const Assignment = require('./Assignment')
const Submission = require('./Submission')
const Attendance = require('./Attendance')
const Announcement = require('./Announcement')
const Post = require('./Post')

module.exports = {
  User,
  Batch,
  Course,
  Assignment,
  Submission,
  Attendance,
  Announcement,
  Post
};

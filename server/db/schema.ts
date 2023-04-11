import mongoose, { Schema } from 'mongoose';

export const User = mongoose.model(
  'User',

  new Schema({
    githubLogin: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    avatar: {
      type: String,
      required: false
    },
    githubToken: {
      type: String,
      required: false
    }
  })
);

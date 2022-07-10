const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        user: async(parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ $or: [{ _id: user ? _id : context.user._id }, { username: context.user.username}] })
                .select('-__v -password')
                .populate('savedBooks');

                return userData
            }

            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password, username }) => {
            const user = await User.findOne({ $or: [username, email] });
          
            if (!user) {
              throw new AuthenticationError('Incorrect credentials');
            }
          
            const correctPw = await user.isCorrectPassword(password);
          
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
          
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addtoSet: { savedBooks: args.input }},
                    { new: true, runValidators: true }
                );
                
                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async(parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user_id },
                    { $pull: { savedBooks: bookId }},
                    { new: true }
                );

                return updatedUser
            }

            throw new AuthenticationError('You need to be logged in!');
        } 
    }
}

module.exports = resolvers;
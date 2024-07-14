import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema({
  title: String,
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, unique: true },

  createdAt: { type: Date, default: Date.now },
});
export interface IMessage {
  content: string;
  role: string;
  chatId: mongoose.Types.ObjectId;
  createdAt: Date;
  imageData: Array<{
    metadata: {
      description?: string;
      title?: string;
      id?: string;
      image_path?: string;
    };
  }>;
  Documents: string[];
}
const MessageSchema = new mongoose.Schema({
  content: String,
  role: String,
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  createdAt: { type: Date, default: Date.now },
  imageData: {
    // New field for image data
    type: [
      // Array to store multiple image objects
      {
        metadata: {
          // Nested object for image metadata
          description: { type: String },
          title: { type: String },
          id: { type: String },
          image_path: { type: String },
        },
      },
    ],
    default: [], // Initialize with an empty array
  },
  Documents: {
    type: [String],
    default: [],
  },
});

const FeedbackSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  feedback: {
    referencedDocument: {
      type: String,
    },
    feedback1: {
      type: String,
    },
    relaventAnswer: {
      type: String,
    },
    feedback2: {
      type: String,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
export const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

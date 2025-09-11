

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: { type: String, required: true },
  text: {
    type: String,
    required: function() {
      return !this.attachmentUrl;
    },
    validate: {
      validator: function(v) {
        if (this.attachmentUrl) return true;
        return v && v.trim().length > 0;
      },
      message: 'Text is required if no attachment is provided',
    },
  },
  attachmentUrl: { type: String },
  attachmentType: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;

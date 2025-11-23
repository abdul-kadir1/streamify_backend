

// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   username: { type: String, required: true },
//   text: {
//     type: String,
//     default:"",
//     required: function() {
//       return !this.attachmentUrl;
//     },
//     // validate: {
//     //   validator: function(v) {
//     //     if (this.attachmentUrl) return true;
//     //     return v && v.trim().length > 0;
//     //   },
//     //   message: 'Text is required if no attachment is provided',
//     // },
//   },
//   // attachmentUrl: { type: String },
//   // attachmentType: { type: String },

//     attachmentUrl: { type: String, default: null },
//   attachmentType: { type: String, default: null },
//   attachmentName: { type: String, default: null },
//   createdAt: { type: Date, default: Date.now },
// });

// const Message = mongoose.model("Message", messageSchema);

// export default Message;


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
    required: function () {
      // Text is required ONLY if there is no attachment
      return !this.attachmentUrl;
    },
    validate: {
      validator: function (v) {
        if (this.attachmentUrl) return true; // allow empty text if attachment exists
        return v && v.trim().length > 0;
      },
      message: "Text is required if no attachment is provided",
    },
  },
  attachmentUrl: { type: String },       // URL of uploaded file
  attachmentType: { type: String },      // MIME type
  attachmentName: { type: String },      // Original filename
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;

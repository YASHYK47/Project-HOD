var mongoose = require("mongoose");

var Quiz = mongoose.model("Quiz", {
  quizName:String,
  questions: [
    {
      questionNo: Number,
      question: String,
      type: String,
      options: [String],
      answer: [String],
      marks: Number,
      negativeMarks: Number
    }
  ],
  tags:{
    type:[String]
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: Boolean,
  endTime: { type: Date, default: Date.now }
});

module.exports = {
  Quiz
};

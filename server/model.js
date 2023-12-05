import mongoose from "mongoose";

export const questionSchema = new mongoose.Schema({
    answers: [{ 
        type: String, 
        required: true 
    }],
    text: { 
        type: String, 
        required: true 
    },
    correctAnswer: { 
        type: Number, 
        required: false 
    }
})

const Question = mongoose.model("Question", questionSchema);

const attemptSchema = new mongoose.Schema({
    questions: [questionSchema],
    startedAt: {
        type: Date,
        required: true
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    userAnswers: Object,
    correctAnswers: Object,
    scoreText: {
        type: String,
        required: false
    },
    completed: {
        type: Boolean,
        required: true
    }
})

const Attempt = mongoose.model("Attempt", attemptSchema);

export{
    Attempt , Question
}


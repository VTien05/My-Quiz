import connect from './connectdb.js';
import express from 'express';
import asyncHandler from 'express-async-handler';
import {Question,Attempt} from './model.js';
import cors from "cors";


connect();
mongoose.set('strictQuery', false);

const app = express();

app.use(express.json());

app.use(cors());
// app.use('/attempts', mainRoutes);
const randomIntFromInterval = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const getArrNumber = (max, size) => {
    const ranArr = []
    if (!size || size === 0) {
        return
    }

    do {
        const randomNumber = randomIntFromInterval(0, max)

        if (!ranArr.includes(randomNumber)) { ranArr.push(randomNumber) }
    } while (ranArr.length < size)

    return ranArr

}

export const getRandomQuestions = (max, size, arr) => {
    const randomArr = [];
    for (const ele of getArrNumber(max, size)) {
        randomArr.push(arr[ele])
    }

    return randomArr;
}

export const returnCorrectAns = async(questionList) =>
{
    const gg = {};
    for (const i of questionList) {
        gg[i._id] = i.correctAnswer;
    }
    return gg;
}

export const returnUserAns = async(usersAnswer, correctAnswer) =>{
    let a = 0;
    for (const j in usersAnswer) {
        if (usersAnswer[j] === correctAnswer[j]) {
            a++;
        }
    }
    return a;
}

const createAttempt = asyncHandler(async (req, res) => {
    const questions = await Question.find({});
    const questionsRandomArr = getRandomQuestions(14, 10, questions);
    for (let index = 0; index < questionsRandomArr.length; index++) {
        delete questionsRandomArr[index].correctAnswer;
      }
    const newAttempt = new Attempt({
        questions: questionsRandomArr,
        startedAt: new Date(),
        score: 0,
        completed: false
    })

    const attempt = await newAttempt.save();

    if (newAttempt) {
        res.status(201)
        res.json(attempt)
    } else {
        res.status(404)
        throw new Error('Can not create attempt')
    }
})

export const handleScoreText = (score) => {
    if (score < 5) return "Practice more to improve it :D";
    if (score >= 5 && score < 7) return "Good, keep up!";
    if (score >= 7 && score < 9) return "Well done!";
    if (score >= 9 && score <= 10) return "Perfect";
    else return "";
}

const updateAttempt = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const attempt = await Attempt.findById(id);
    const questionsList = attempt.questions;
    const userAnswers = req.body.userAnswers;
    const correctAns = await returnCorrectAns(questionsList);
    const result = await returnUserAns(userAnswers, correctAns);

    if (attempt) {
        attempt.score = result;
        attempt.userAnswers = userAnswers;
        attempt.correctAnswers = correctAns;
        attempt.scoreText = handleScoreText(result);
        attempt.completed = true
        const updatedAttempt = await attempt.save();
        res.json(updatedAttempt)
    }

})

const router = express.Router();

router.route('/').post(createAttempt);
router.route('/:id/submit').post(updateAttempt);


app.use('/attempts' , router);

app.listen(3000, function(){
    console.log('Listening on port 3000!');
});


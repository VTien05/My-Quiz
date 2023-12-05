// TODO(you): Write the JavaScript necessary to complete the assignment.
const butnStart = document.querySelector("#btn-start");
const butnSubmit = document.querySelector("#btn-submit");
const butnTryAgain = document.querySelector("#btn-try-again");
const scrFirst = document.querySelector("#introduction");
const scrSecond = document.querySelector("#attempt-quiz");
const scrThird = document.querySelector("#review-quiz");
const scroll = document.querySelector("header");
const attempt = document.querySelector("#attempt");
const review = document.querySelector("#review");
const score = document.querySelector(".score");
const scorePercent = document.querySelector(".score-percent");
const advice = document.querySelector(".advice");

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

let id;
let reviewAns = {};

function switchScr() {
    scrFirst.classList.add("hidden");
    scrSecond.classList.remove("hidden");
    scroll.scrollIntoView();
    attempt.innerHTML = "";
    id = "";
    fetch("http://localhost:3000/attempts", {
        method: 'POST'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        id = data._id;
        for (i = 0; i < data.questions.length; i++) {
            attempt.innerHTML += `
                    <div class="question">
                        <div class="question-index">
                            <h2>Question ${i + 1} of 10</h2>
                        </div>
                
                        <div class="question-text">
                            <p>${escapeHtml(data.questions[i].text)}</p>
                        </div>

                        ${data.questions[i].answers.map(function (answer, index) {
                            const escapeAnswer = escapeHtml(answer);
                            return `
                                <div class="option" id="${data.questions[i]._id}">
                                    <label class="ques grid" >
                                        <input type="radio" name="${data.questions[i]._id}">
                                        ${escapeAnswer}
                                    </label>
                                </div>`
                        }).join("")}
                        
                    </div>
              `
        }
        handleCheck();
    }).catch(function(error){
        console.log(error);
    });

}

butnStart.addEventListener("click", switchScr);

function submitConfirm() {
    const result = confirm("Are you sure you want to finish this quiz?");
    if (result == true) {
        scrSecond.classList.add("hidden");
        scrThird.classList.remove("hidden");
        scroll.scrollIntoView();
        review.innerHTML="";
        fetch(`http://localhost:3000/attempts/${id}/submit`, {
            method: 'POST',
            body: JSON.stringify({
                userAnswers : reviewAns
            }),
            headers: {
                'Content-Type': 'application/json'
              },
        }).then(function(response){
            return response.json();
        }).then(function(data){
            for (i=0; i< data.questions.length; i++){
                const userAnswer = data.userAnswers[data.questions[i]._id];
                const correctAnswer = data.correctAnswers[data.questions[i]._id];
                function setClass(currentAnswer){
                    if (userAnswer === correctAnswer & currentAnswer === userAnswer){
                        return 'correct-answer';
                    }                      
                    if (userAnswer !== correctAnswer) {
                        if (currentAnswer === userAnswer){
                            return 'wrong-answer';
                        }
                            
                        if (currentAnswer === correctAnswer){
                            return 'option-correct';
                        }       
                    }
                    return '';
                }
                function setLabel(currentAnswer){
                    if (userAnswer === correctAnswer & currentAnswer === userAnswer){
                        return '<p class="label-ans">Correct answer</p>';
                    }        
                    
                    if (userAnswer !== correctAnswer) {
                        if (currentAnswer === userAnswer){
                            return '<p class="label-ans">Your answer</p>';
                        }
                            
                        if (currentAnswer === correctAnswer){
                            return '<p class="label-ans">Correct answer</p>';
                        }       
                    }
                    return '';
                }
                review.innerHTML += `
                    <div class="question">
                        <div class="question-index">
                            <h2>Question ${i+1} of 10</h2>
                        </div>
                        <div class="question-text">
                            <p>question ${escapeHtml(data.questions[i].text)}</p>
                        </div>
                        ${data.questions[i].answers.map(function(answer,index){
                            const escapeAnswer = escapeHtml(answer);
                            // console.log(data.userAnswers[]);
                            return `
                                <div class="option ${setClass(index)}">
                                    <input type="radio" disabled ${(setClass(index) === 'correct-answer') || (setClass(index) === 'wrong-answer') ? 'checked' : ''} name="${data.questions[i]._id}">
                                    <label class="ques grid">
                                        ${escapeAnswer}
                                    </label>
                                    ${setLabel(index)}
                                </div>
                            `
                        }).join('')}
                        
                    </div>`
            }
            score.innerHTML = data.score + '/10';
            scorePercent.innerHTML = data.score * 10 + '%';
            advice.innerHTML = data.scoreText;
        }).catch(function(error){
            console.log(error)
        })
    }    
}

butnSubmit.addEventListener("click", submitConfirm);

function tryAgain() {
    scrThird.classList.add("hidden");
    scrFirst.classList.remove("hidden");
    scroll.scrollIntoView();
    id = "";
    reviewAns = {};
}

butnTryAgain.addEventListener("click", tryAgain);

function handleCheck() {
    const highlight = document.querySelectorAll("#attempt-quiz .question");
    for (let question of highlight) {
        const optionSelected = question.querySelectorAll(".option");
        for (let i=0; i< optionSelected.length; i++) {
            let index = parseInt(i);
            optionSelected[index].addEventListener("click", function () {
                for (let answer of optionSelected) {
                    answer.classList.remove("option-selected");
                    answer.children[0].checked = false;
                }
                optionSelected[index].children[0].checked = true;
                optionSelected[index].classList.add("option-selected");
                reviewAns[optionSelected[index].getAttribute('id')] = index;
            });
        }
    }
}
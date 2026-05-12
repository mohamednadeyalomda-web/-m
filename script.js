// متغيرات عامة
let allQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = 0;
let examMode = 'all'; // all, chapter1, chapter2, chapter3, practice
let isPracticeMode = false;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    showScreen('startScreen');
});

// عرض الشاشة المحددة
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName).classList.add('active');
}

// بدء الاختبار الكامل
function startExam(mode) {
    examMode = mode;
    isPracticeMode = false;
    initializeExam();
}

// بدء اختبار فصل محدد
function startChapterExam(chapter) {
    examMode = chapter;
    isPracticeMode = false;
    initializeExam();
}

// وضع التدريب
function showPracticeMode() {
    examMode = 'all';
    isPracticeMode = true;
    initializeExam();
}

// تهيئة الاختبار
function initializeExam() {
    // تصفية الأسئلة حسب النمط المختار
    if (examMode === 'all') {
        allQuestions = [...examData.questions];
    } else {
        const chapterNum = parseInt(examMode.replace('chapter', ''));
        allQuestions = examData.questions.filter(q => q.chapter === chapterNum);
    }

    // خلط الأسئلة
    allQuestions = shuffleArray(allQuestions);

    // تهيئة الإجابات
    userAnswers = new Array(allQuestions.length).fill(null);

    // تعيين الوقت والمؤشرات
    currentQuestionIndex = 0;
    startTime = Date.now();

    // بدء الاختبار
    showScreen('examScreen');
    displayQuestion();
    startTimer();
    updateQuestionIndicator();
}

// عرض السؤال الحالي
function displayQuestion() {
    const question = allQuestions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');

    // تحديث رقم السؤال والإجمالي
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = allQuestions.length;

    // تحديث شريط التقدم
    const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    // بناء محتوى السؤال
    let html = `
        <div class="question-number">السؤال ${currentQuestionIndex + 1} من ${allQuestions.length}</div>
        <div class="question-text">${question.q}</div>
    `;

    if (question.type === 'TF') {
        // أسئلة صحيح/خاطئ
        html += `
            <div class="tf-options">
                <div class="tf-option true ${userAnswers[currentQuestionIndex] === true ? 'selected' : ''}" onclick="selectAnswer(true)">
                    ✓ صحيح
                </div>
                <div class="tf-option false ${userAnswers[currentQuestionIndex] === false ? 'selected' : ''}" onclick="selectAnswer(false)">
                    ✗ خاطئ
                </div>
            </div>
        `;
    } else {
        // أسئلة الاختيار من متعدد
        html += `<div class="mcq-options">`;
        question.options.forEach(option => {
            const isSelected = userAnswers[currentQuestionIndex] === option;
            html += `
                <label class="mcq-option ${isSelected ? 'selected' : ''}">
                    <input type="radio" name="mcq" value="${option}" ${isSelected ? 'checked' : ''} onchange="selectAnswer('${option}')">
                    ${option}
                </label>
            `;
        });
        html += `</div>`;
    }

    // إظهار الإجابة الصحيحة في وضع التدريب
    if (isPracticeMode && userAnswers[currentQuestionIndex] !== null) {
        html += `
            <div style="margin-top: 30px; padding: 15px; background: #f0f9ff; border-left: 5px solid #3b82f6; border-radius: 8px;">
                <p style="color: #0369a1; font-weight: bold; margin-bottom: 10px;">الإجابة الصحيحة:</p>
                <p style="color: #0c4a6e; font-size: 1.1rem;">${question.a}</p>
            </div>
        `;
    }

    container.innerHTML = html;

    // تحديث أزرار الملاحة
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').textContent = currentQuestionIndex === allQuestions.length - 1 ? 'إنهاء الاختبار' : 'التالي →';
}

// اختيار الإجابة
function selectAnswer(answer) {
    userAnswers[currentQuestionIndex] = answer;
    displayQuestion();
    updateQuestionIndicator();
}

// الانتقال للسؤال التالي
function nextQuestion() {
    if (currentQuestionIndex < allQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        document.querySelector('.exam-content').scrollTop = 0;
    } else {
        finishExam();
    }
}

// الانتقال للسؤال السابق
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        document.querySelector('.exam-content').scrollTop = 0;
    }
}

// تحديث مؤشرات الأسئلة
function updateQuestionIndicator() {
    let html = '';
    for (let i = 0; i < allQuestions.length; i++) {
        let classes = 'question-dot';
        if (i === currentQuestionIndex) {
            classes += ' current';
        } else if (userAnswers[i] !== null) {
            classes += ' answered';
        } else {
            classes += ' skipped';
        }
        html += `<div class="${classes}" onclick="goToQuestion(${i})">${i + 1}</div>`;
    }
    document.getElementById('questionIndicator').innerHTML = html;
}

// الانتقال لسؤال محدد
function goToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
    updateQuestionIndicator();
    document.querySelector('.exam-content').scrollTop = 0;
}

// مؤقت الوقت
function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// إنهاء الاختبار
function finishExam() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    // حساب النتائج
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    userAnswers.forEach((answer, index) => {
        if (answer === null) {
            skipped++;
        } else if (answer === allQuestions[index].a) {
            correct++;
        } else {
            wrong++;
        }
    });

    const percentage = Math.round((correct / allQuestions.length) * 100);

    // تخزين النتائج
    window.examResults = {
        correct,
        wrong,
        skipped,
        percentage,
        totalQuestions: allQuestions.length,
        timeMinutes: minutes,
        timeSeconds: seconds,
        allQuestions,
        userAnswers
    };

    // عرض النتائج
    displayResults();
}

// عرض شاشة النتائج
function displayResults() {
    const results = window.examResults;

    document.getElementById('finalScore').textContent = results.percentage;
    document.getElementById('correctCount').textContent = results.correct;
    document.getElementById('wrongCount').textContent = results.wrong;
    document.getElementById('skippedCount').textContent = results.skipped;
    document.getElementById('timeTaken').textContent = 
        `${results.timeMinutes} دقيقة و ${results.timeSeconds} ثانية`;

    // حساب أداء كل فصل
    const chapterPerformance = {};
    for (let ch = 1; ch <= 3; ch++) {
        const chapterQuestions = results.allQuestions.filter(q => q.chapter === ch);
        let chapterCorrect = 0;
        
        chapterQuestions.forEach(q => {
            const qIndex = results.allQuestions.indexOf(q);
            if (results.userAnswers[qIndex] === q.a) {
                chapterCorrect++;
            }
        });

        chapterPerformance[ch] = {
            correct: chapterCorrect,
            total: chapterQuestions.length,
            percentage: Math.round((chapterCorrect / chapterQuestions.length) * 100)
        };
    }

    // عرض نتائج الفصول
    let chapterHtml = '';
    Object.entries(chapterPerformance).forEach(([ch, perf]) => {
        chapterHtml += `
            <div class="chapter-result">
                <h3>${examData.chapterNames[ch]}</h3>
                <div class="result-text">
                    <p>الإجابات الصحيحة: ${perf.correct}/${perf.total}</p>
                    <p style="font-weight: bold; color: #6366f1;">${perf.percentage}%</p>
                </div>
            </div>
        `;
    });

    document.getElementById('chapterResults').innerHTML = chapterHtml;

    showScreen('resultsScreen');
}

// مراجعة الإجابات
function reviewAnswers() {
    displayReviewScreen('all');
}

// عرض شاشة المراجعة
function displayReviewScreen(filter) {
    const results = window.examResults;
    const reviewContainer = document.getElementById('reviewContainer');
    let html = '';

    results.allQuestions.forEach((question, index) => {
        const userAnswer = results.userAnswers[index];
        const isCorrect = userAnswer === question.a;
        const isSkipped = userAnswer === null;

        // تطبيق الفلتر
        if (filter === 'correct' && !isCorrect) return;
        if (filter === 'wrong' && (isCorrect || isSkipped)) return;
        if (filter === 'skipped' && !isSkipped) return;

        const statusClass = isCorrect ? 'correct' : isSkipped ? 'skipped' : 'wrong';
        const statusText = isCorrect ? '✓ صحيح' : isSkipped ? '- لم يجب' : '✗ خاطئ';

        html += `
            <div class="review-item ${statusClass}">
                <div class="review-item-header">
                    <span class="review-question-num">السؤال ${results.allQuestions.indexOf(question) + 1}</span>
                    <span class="review-status ${statusClass}">${statusText}</span>
                </div>
                <div class="review-question-text">${question.q}</div>
        `;

        if (!isSkipped) {
            html += `
                <div class="review-answer user">
                    <strong>إجابتك:</strong> ${userAnswer}
                </div>
            `;
        } else {
            html += `
                <div class="review-answer user" style="color: #9ca3af;">
                    <strong>لم تجب على هذا السؤال</strong>
                </div>
            `;
        }

        if (!isCorrect) {
            html += `
                <div class="review-answer correct">
                    <strong>الإجابة الصحيحة:</strong> ${question.a}
                </div>
            `;
        }

        html += `</div>`;
    });

    reviewContainer.innerHTML = html || '<p style="text-align: center; color: #9ca3af;">لا توجد نتائج للعرض</p>';
    showScreen('reviewScreen');
}

// فلترة النتائج
function filterReview(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayReviewScreen(filter);
}

// إعادة الاختبار
function retakeExam() {
    currentQuestionIndex = 0;
    userAnswers = [];
    showScreen('startScreen');
}

// الرجوع للنتائج من المراجعة
function backToResults() {
    showScreen('resultsScreen');
}

// الذهاب للرئيسية
function goToHome() {
    currentQuestionIndex = 0;
    userAnswers = [];
    showScreen('startScreen');
}

// تأكيد الخروج
function showExitConfirm() {
    document.getElementById('exitModal').classList.remove('hidden');
}

function closeExitModal() {
    document.getElementById('exitModal').classList.add('hidden');
}

function exitExam() {
    goToHome();
    closeExitModal();
}

// دالة مساعدة: خلط المصفوفة
function shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

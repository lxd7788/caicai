// 游戏题目数据 - 读音相近的英文单词
const questions = [
    {
        chinese: "苹果",
        options: ["apple", "ample", "appal", "apply"],
        correct: 0
    },
    {
        chinese: "书",
        options: ["book", "brook", "buck", "bake"],
        correct: 0
    },
    {
        chinese: "猫",
        options: ["cat", "cut", "cot", "coat"],
        correct: 0
    },
    {
        chinese: "狗",
        options: ["dog", "dug", "dag", "doge"],
        correct: 0
    },
    {
        chinese: "树",
        options: ["tree", "tray", "treat", "tread"],
        correct: 0
    },
    {
        chinese: "太阳",
        options: ["sun", "son", "sin", "sane"],
        correct: 0
    },
    {
        chinese: "月亮",
        options: ["moon", "mown", "moan", "man"],
        correct: 0
    },
    {
        chinese: "星星",
        options: ["star", "stare", "stair", "stir"],
        correct: 0
    },
    {
        chinese: "水",
        options: ["water", "wetter", "watt", "what"],
        correct: 0
    },
    {
        chinese: "火",
        options: ["fire", "fear", "fair", "fare"],
        correct: 0
    },
    {
        chinese: "花",
        options: ["flower", "flour", "floor", "flaw"],
        correct: 0
    },
    {
        chinese: "鸟",
        options: ["bird", "beard", "bard", "bared"],
        correct: 0
    },
    {
        chinese: "鱼",
        options: ["fish", "fist", "feast", "fast"],
        correct: 0
    },
    {
        chinese: "汽车",
        options: ["car", "care", "core", "cur"],
        correct: 0
    },
    {
        chinese: "房子",
        options: ["house", "horse", "hose", "hoarse"],
        correct: 0
    }
];

// 游戏状态
let currentQuestionIndex = 0;
let player1Score = 0;
let player2Score = 0;
let player1Answer = null;
let player2Answer = null;
let gameStarted = false;
let audioPlayed = false;

// DOM元素
const startScreen = document.getElementById('startScreen');
const endScreen = document.getElementById('endScreen');
const gameArea = document.querySelector('.game-area');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const nextBtn = document.getElementById('nextBtn');
const playAudioBtn = document.getElementById('playAudioBtn');
const chineseWord = document.getElementById('chineseWord');
const questionNum = document.getElementById('questionNum');
const totalQuestions = document.getElementById('totalQuestions');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const player1Area = document.getElementById('player1Area');
const player2Area = document.getElementById('player2Area');
const player1Options = document.getElementById('player1Options');
const player2Options = document.getElementById('player2Options');
const player1Status = document.getElementById('player1Status');
const player2Status = document.getElementById('player2Status');
const resultSection = document.getElementById('resultSection');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const correctAnswer = document.getElementById('correctAnswer');
const finalScore1 = document.getElementById('finalScore1');
const finalScore2 = document.getElementById('finalScore2');
const winner = document.getElementById('winner');

// 使用Web Speech API播放语音
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // 稍微慢一点，方便听清
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        alert('您的浏览器不支持语音播放功能');
    }
}

// 播放所有选项的语音
function playAllOptions() {
    // 停止当前播放
    window.speechSynthesis.cancel();
    
    const currentQuestion = questions[currentQuestionIndex];
    const optionLabels = ['A', 'B', 'C', 'D'];
    let index = 0;
    
    playAudioBtn.disabled = true;
    playAudioBtn.textContent = '🔊 播放中...';
    
    function playNext() {
        if (index < currentQuestion.options.length) {
            // 先播放选项标识（A、B、C、D），再播放单词
            const label = optionLabels[index];
            const word = currentQuestion.options[index];
            speakText(`${label}. ${word}`);
            index++;
            setTimeout(playNext, 2500); // 每个单词间隔2.5秒
        } else {
            playAudioBtn.disabled = false;
            playAudioBtn.textContent = '🔊 重新播放';
            audioPlayed = true;
        }
    }
    
    playNext();
}

// 初始化题目
function loadQuestion() {
    // 停止当前播放的语音
    window.speechSynthesis.cancel();
    
    const question = questions[currentQuestionIndex];
    
    // 重置状态
    player1Answer = null;
    player2Answer = null;
    audioPlayed = false;
    
    // 更新界面
    chineseWord.textContent = question.chinese;
    questionNum.textContent = currentQuestionIndex + 1;
    totalQuestions.textContent = questions.length;
    
    // 重置选项按钮
    player1Options.innerHTML = '';
    player2Options.innerHTML = '';
    
    // 创建选项按钮（只显示A、B、C、D，不显示单词）
    const optionLabels = ['A', 'B', 'C', 'D'];
    question.options.forEach((option, index) => {
        // 玩家1的选项
        const btn1 = document.createElement('button');
        btn1.className = 'option-btn';
        btn1.textContent = optionLabels[index];
        btn1.dataset.word = option; // 保存单词到data属性，用于显示结果
        btn1.onclick = () => selectAnswer(1, index);
        player1Options.appendChild(btn1);
        
        // 玩家2的选项
        const btn2 = document.createElement('button');
        btn2.className = 'option-btn';
        btn2.textContent = optionLabels[index];
        btn2.dataset.word = option; // 保存单词到data属性，用于显示结果
        btn2.onclick = () => selectAnswer(2, index);
        player2Options.appendChild(btn2);
    });
    
    // 重置状态显示
    player1Status.textContent = '等待选择...';
    player1Status.className = 'player-status';
    player2Status.textContent = '等待选择...';
    player2Status.className = 'player-status';
    
    // 重置区域样式
    player1Area.classList.remove('active');
    player2Area.classList.remove('active');
    
    // 隐藏结果区域
    resultSection.style.display = 'none';
    
    // 重置播放按钮
    playAudioBtn.disabled = false;
    playAudioBtn.textContent = '🔊 播放语音';
}

// 选择答案
function selectAnswer(player, answerIndex) {
    if (player === 1 && player1Answer !== null) return;
    if (player === 2 && player2Answer !== null) return;
    
    const question = questions[currentQuestionIndex];
    
    if (player === 1) {
        player1Answer = answerIndex;
        player1Status.textContent = '已选择';
        player1Status.className = 'player-status selected';
        player1Area.classList.add('active');
        
        // 更新按钮样式
        const buttons = player1Options.querySelectorAll('.option-btn');
        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === answerIndex) {
                btn.classList.add('selected');
            }
        });
    } else {
        player2Answer = answerIndex;
        player2Status.textContent = '已选择';
        player2Status.className = 'player-status selected';
        player2Area.classList.add('active');
        
        // 更新按钮样式
        const buttons = player2Options.querySelectorAll('.option-btn');
        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === answerIndex) {
                btn.classList.add('selected');
            }
        });
    }
    
    // 如果两个玩家都选择了，显示结果
    if (player1Answer !== null && player2Answer !== null) {
        showResult();
    }
}

// 显示结果
function showResult() {
    const question = questions[currentQuestionIndex];
    const correctIndex = question.correct;
    const correctWord = question.options[correctIndex];
    
    // 检查答案
    const player1Correct = player1Answer === correctIndex;
    const player2Correct = player2Answer === correctIndex;
    
    // 更新分数
    if (player1Correct) {
        player1Score++;
        score1.textContent = player1Score;
    }
    if (player2Correct) {
        player2Score++;
        score2.textContent = player2Score;
    }
    
    // 更新状态显示
    if (player1Correct) {
        player1Status.textContent = '✓ 正确';
        player1Status.className = 'player-status correct';
    } else {
        player1Status.textContent = '✗ 错误';
        player1Status.className = 'player-status wrong';
    }
    
    if (player2Correct) {
        player2Status.textContent = '✓ 正确';
        player2Status.className = 'player-status correct';
    } else {
        player2Status.textContent = '✗ 错误';
        player2Status.className = 'player-status wrong';
    }
    
    // 更新选项按钮样式
    const buttons1 = player1Options.querySelectorAll('.option-btn');
    const buttons2 = player2Options.querySelectorAll('.option-btn');
    
    buttons1.forEach((btn, idx) => {
        btn.classList.remove('selected');
        if (idx === correctIndex) {
            btn.classList.add('correct');
        } else if (idx === player1Answer && !player1Correct) {
            btn.classList.add('wrong');
        }
    });
    
    buttons2.forEach((btn, idx) => {
        btn.classList.remove('selected');
        if (idx === correctIndex) {
            btn.classList.add('correct');
        } else if (idx === player2Answer && !player2Correct) {
            btn.classList.add('wrong');
        }
    });
    
    // 显示结果区域
    resultSection.style.display = 'block';
    
    // 显示所有选项对应的单词
    const optionLabels = ['A', 'B', 'C', 'D'];
    let optionsText = '选项对应：';
    question.options.forEach((option, idx) => {
        optionsText += ` ${optionLabels[idx]}=${option}`;
    });
    
    correctAnswer.innerHTML = `${correctWord}<br><small style="color: #666; font-size: 0.8em;">${optionsText}</small>`;
    
    // 显示玩家选择
    const player1Choice = player1Answer !== null ? optionLabels[player1Answer] + '(' + question.options[player1Answer] + ')' : '未选择';
    const player2Choice = player2Answer !== null ? optionLabels[player2Answer] + '(' + question.options[player2Answer] + ')' : '未选择';
    
    if (player1Correct && player2Correct) {
        resultTitle.textContent = '两人都答对了！';
        resultText.textContent = `太棒了！两位玩家都选择了正确答案！玩家1选择：${player1Choice}，玩家2选择：${player2Choice}`;
    } else if (player1Correct) {
        resultTitle.textContent = '玩家1答对了！';
        resultText.textContent = `玩家1选择了正确答案(${player1Choice})，玩家2答错了(${player2Choice})。`;
    } else if (player2Correct) {
        resultTitle.textContent = '玩家2答对了！';
        resultText.textContent = `玩家2选择了正确答案(${player2Choice})，玩家1答错了(${player1Choice})。`;
    } else {
        resultTitle.textContent = '两人都答错了！';
        resultText.textContent = `很遗憾，两位玩家都没有选择正确答案。玩家1选择：${player1Choice}，玩家2选择：${player2Choice}`;
    }
}

// 下一题
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

// 结束游戏
function endGame() {
    gameArea.classList.remove('active');
    endScreen.style.display = 'block';
    
    finalScore1.textContent = player1Score;
    finalScore2.textContent = player2Score;
    
    if (player1Score > player2Score) {
        winner.textContent = '🏆 玩家1获胜！';
    } else if (player2Score > player1Score) {
        winner.textContent = '🏆 玩家2获胜！';
    } else {
        winner.textContent = '🤝 平局！';
    }
}

// 开始游戏
function startGame() {
    // 随机打乱题目顺序
    questions.sort(() => Math.random() - 0.5);
    
    currentQuestionIndex = 0;
    player1Score = 0;
    player2Score = 0;
    score1.textContent = '0';
    score2.textContent = '0';
    
    startScreen.style.display = 'none';
    endScreen.style.display = 'none';
    gameArea.classList.add('active');
    
    loadQuestion();
    gameStarted = true;
}

// 重新开始
function restartGame() {
    startGame();
}

// 事件监听
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
nextBtn.addEventListener('click', nextQuestion);
playAudioBtn.addEventListener('click', playAllOptions);

// 初始化
totalQuestions.textContent = questions.length;

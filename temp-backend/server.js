const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://survey-zeta-seven.vercel.app',
        'https://survey-amz9fv00u-commaeng09s-projects.vercel.app'
    ],
    credentials: true
}));

app.use(bodyParser.json());

// 간단한 메모리 저장소 (테스트용)
const users = [];
const surveys = [];

// Health check
app.get('/api/health/', (req, res) => {
    res.json({ status: 'healthy', message: 'Node.js Survey API is running' });
});

// 사용자명 중복 체크
app.post('/api/auth/check-username/', (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).json({
            error: '사용자명을 입력해주세요.'
        });
    }
    
    const isAvailable = !users.find(user => user.username === username);
    
    res.json({
        available: isAvailable,
        message: isAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'
    });
});

// 회원가입
app.post('/api/auth/register/', (req, res) => {
    const { username, email, password } = req.body;
    
    // 간단한 유효성 검사
    if (!username || !email || !password) {
        return res.status(400).json({
            error: '모든 필드를 입력해주세요.'
        });
    }
    
    // 중복 체크
    if (users.find(user => user.username === username)) {
        return res.status(400).json({
            error: '이미 사용 중인 아이디입니다.'
        });
    }
    
    // 사용자 추가
    const user = {
        id: users.length + 1,
        username,
        email,
        password: password // 실제로는 해시해야 함
    };
    
    users.push(user);
    
    // 가짜 JWT 토큰
    const fakeToken = Buffer.from(JSON.stringify({ userId: user.id, username })).toString('base64');
    
    res.status(201).json({
        message: '회원가입이 완료되었습니다.',
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },
        tokens: {
            access: fakeToken,
            refresh: fakeToken
        }
    });
});

// 로그인
app.post('/api/auth/login/', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({
            error: '아이디 또는 비밀번호가 잘못되었습니다.'
        });
    }
    
    const fakeToken = Buffer.from(JSON.stringify({ userId: user.id, username })).toString('base64');
    
    res.json({
        message: '로그인 성공',
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },
        tokens: {
            access: fakeToken,
            refresh: fakeToken
        }
    });
});

// 설문 목록
app.get('/api/surveys/', (req, res) => {
    res.json({
        results: surveys
    });
});

// 404 처리
app.use('*', (req, res) => {
    res.status(404).json({
        detail: 'Not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ CORS enabled for Vercel domains`);
    console.log(`📝 Users: ${users.length}, Surveys: ${surveys.length}`);
});

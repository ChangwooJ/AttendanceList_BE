const User = require("../models/User");

// 새로운 User 데이터 생성
const newUser = async (req, res) => {
    try {
        const { username, color } = req.body; // 클라이언트로부터 데이터 받기

        // User 모델 인스턴스 생성
        const newUser = new User({
            username,
            color,
        });

        // 데이터 저장
        await newUser.save();

        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (err) {
        res.status(400).json({ error: 'Error adding user', details: err.message });
    }
}

//전체 유저 데이터
const userList = async (req, res) => {
    try {
        const user = await User.find();
        res.json(user);
    } catch (err) {
      res.status(400).send('Error fetching users');
    }
}

const deleteUser = async (req, res) => {
    const { username } = req.params;

    try {
        const result = await User.deleteOne({ username });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "해당 이름의 유저를 찾을 수 없습니다." });
        }

        res.json({ message: `${username} 유저가 삭제되었습니다.` });
    } catch (err) {
        res.status(500).json({ message: "유저 삭제 중 오류 발생" });
    }
}

module.exports = { newUser, userList, deleteUser };
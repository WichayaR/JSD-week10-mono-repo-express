import express from "express";
import { user } from "./fakeDB/fakeUsers.js";

const app = express();

app.use(express.json())

//CRUD routes and endpoints

//Read Users
app.get("/users", (req,res) => {
    console.log(req);
    res.json(user);
});

//Create User
app.post("/users", (req,res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res
        .status(400)
        .json({error: "username, email and password are required!"});
    }

    const highestID = user.reduce(
        (max, u) => Math.max(max, Number(u.id) || 0),
        0
    );

    const nextId = String(highestID + 1);
    const newUser = {
        id: nextId,
        username: username,
        email: email,
        password: password,
    };

    user.push(newUser);

    return res.status(201).json(newUser);

})

//Update User
app.put("/users/:id", (req,res) => {});

//Delete User
app.delete("/users/:id", (req,res) => {});


const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on PORT:${PORT} 🟢`);
});
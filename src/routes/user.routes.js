import { Router } from "express";
import { UserRepository } from "../modules/user/repositories/UserRepository.js";
import { login } from "../middleware/login.js";

const userRoutes = Router();
const userRepository = new UserRepository

userRoutes.post('/sign-up', (request, response) => {
    userRepository.create(request, response);
})

userRoutes.post('/sign-in', (request, response)=> {
    userRepository.login(request, response);
})

userRoutes.get('/get-user', login, (request, response)=> {
    userRepository.getUser(request, response)
})

export {userRoutes}


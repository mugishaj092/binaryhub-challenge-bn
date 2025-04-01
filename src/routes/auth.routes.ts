import express from 'express';
import { addUser, deleteUser, getAllUsers, login, resendVerification, signup, updateUserRole, verifyUser } from '../controllers/auth.controller';
import { validateUser } from '../validations/user.validation';
import { checkUserExistence } from '../middlewares/checkUserExistence.middleware';

const authRoutes = express.Router();
authRoutes.post('/login', checkUserExistence,login);
authRoutes.post('/signup',validateUser,signup);
authRoutes.get('/verify', verifyUser);
authRoutes.post('/add-user', addUser);
authRoutes.delete('/delete/:id', deleteUser);
authRoutes.patch('/update-role', updateUserRole);
authRoutes.get('/users', getAllUsers);

export default authRoutes;
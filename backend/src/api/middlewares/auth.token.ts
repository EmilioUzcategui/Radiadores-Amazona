import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../../types/users';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Interface para el payload del token
export interface AuthenticationRequest extends Request {
    user?: JWTPayload;
}
interface TokenData {
    id: string;
    email: string;
    names: string;
}


// Middleware para asignar el token al usuario
export function authToken(user: TokenData) {
    if (!user) throw new Error('No user provided for token generation');
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            names: user.names,
        },
        JWT_SECRET,
        { expiresIn: "2h" }
    );
    return token;
}

// Middleware para verificar el token
export function verifyAuthToken(req: AuthenticationRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticación faltante o inválido' });
    }
    const token = String(authHeader.split(' ')[1]);
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token de autenticación inválido' });
    }
}

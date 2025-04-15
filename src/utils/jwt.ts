import jwt from 'jsonwebtoken';

const JWT_SECRET: jwt.Secret = (process.env.JWT_SECRET as string) || 'supersecret';

export function generateToken(
    payload: object,
    expiresIn: jwt.SignOptions['expiresIn'] = '7d'
): string {
    const options: jwt.SignOptions = { expiresIn };
    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken<T>(token: string): T {
    return jwt.verify(token, JWT_SECRET) as T;
}
// Schema para los datos del JWT
export interface JWTPayload {
    id?: string;
    email?: string;
    names?: string;
    exp?: number;
    iat?: number;
}
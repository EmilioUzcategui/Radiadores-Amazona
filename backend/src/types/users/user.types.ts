export interface User {
    id: string;
    names: string;
    last_names: string;
    password: string;
    email: string;
    phone: string;
    identification_number: string;
    status: boolean;
    created_at: Date;
    updated_at: Date;
}
// Schema para los datos a la hora de crear un nuevo usuario
export interface RegisterUserData {
    names: string;
    last_names: string;
    password: string;
    email: string;
    role_id: number;
    identification_number: string;
    phone: string;
    date_of_birth?: string;
    birth_date?: string;
}

// Schema para loguear a un usuario
export interface LoginUserData {
    email: string;
    password: string;
}
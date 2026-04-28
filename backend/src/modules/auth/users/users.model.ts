import { query } from "../../../config/database/db";
import type { LoginUserData, RegisterUserData, User } from "../../../types/users";

type UpdateUserData = Partial<
    Omit<RegisterUserData, "role_id" | "date_of_birth" | "birth_date">
> & {
    status?: boolean;
};

type DbUserRow = {
    id: string | number;
    names: string;
    last_names: string;
    password: string;
    email: string;
    phone: string;
    identification_number: string;
    status: boolean;
    created_at: string | Date;
    updated_at: string | Date;
};

type CreatePasswordRecoveryTokenInput = {
    userId: string;
    token: string;
    expiresAt: Date;
};

type VerifyPasswordRecoveryCodeResult = {
    isValid: boolean;
    isExpired: boolean;
    userId?: string;
    expiresAt?: Date;
};

type ResetPasswordWithRecoveryCodeResult = {
    success: boolean;
    isExpired: boolean;
};

const baseUserSelect = `
	SELECT
		id,
		names,
		last_names,
		password,
		email,
		phone,
		identification_number,
		status,
		created_at,
		updated_at
	FROM users
`;

const mapDbUser = (row: DbUserRow): User => {
    return {
        id: String(row.id),
        names: row.names,
        last_names: row.last_names,
        password: row.password,
        email: row.email,
        phone: row.phone,
        identification_number: row.identification_number,
        status: row.status,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
};

export const getAllUsersModel = async (): Promise<User[]> => {
    const result = await query(`${baseUserSelect} ORDER BY created_at DESC`);
    return result.rows.map((row) => mapDbUser(row as DbUserRow));
};

export const getUserByIdModel = async (id: string): Promise<User | null> => {
    const result = await query(`${baseUserSelect} WHERE id = $1 LIMIT 1`, [id]);

    if (result.rowCount === 0) {
        return null;
    }

    return mapDbUser(result.rows[0] as DbUserRow);
};

export const getUserByEmailModel = async (email: string): Promise<User | null> => {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await query(
        `${baseUserSelect} WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [normalizedEmail],
    );

    if (result.rowCount === 0) {
        return null;
    }

    return mapDbUser(result.rows[0] as DbUserRow);
};

export const createUserModel = async (
    data: RegisterUserData & { status?: boolean },
): Promise<User> => {
    const existingUser = await getUserByEmailModel(data.email);

    if (existingUser) {
        throw new Error("El email ya está registrado");
    }

    const result = await query(
        `INSERT INTO users (
			names,
			last_names,
			password,
			email,
			phone,
			identification_number,
			status
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, names, last_names, password, email, phone, identification_number, status, created_at, updated_at`,
        [
            data.names,
            data.last_names,
            data.password,
            data.email.trim().toLowerCase(),
            data.phone,
            data.identification_number,
            data.status ?? true,
        ],
    );

    return mapDbUser(result.rows[0] as DbUserRow);
};

export const updateUserModel = async (
    id: string,
    data: UpdateUserData,
): Promise<User | null> => {
    const user = await getUserByIdModel(id);

    if (!user) {
        return null;
    }

    if (data.email) {
        const existingUser = await getUserByEmailModel(data.email);
        if (existingUser && existingUser.id !== id) {
            throw new Error("El email ya está registrado por otro usuario");
        }
    }

    const fields: string[] = [];
    const values: Array<string | boolean> = [];

    if (data.names !== undefined) {
        fields.push(`names = $${fields.length + 1}`);
        values.push(data.names);
    }

    if (data.last_names !== undefined) {
        fields.push(`last_names = $${fields.length + 1}`);
        values.push(data.last_names);
    }

    if (data.password !== undefined) {
        fields.push(`password = $${fields.length + 1}`);
        values.push(data.password);
    }

    if (data.email !== undefined) {
        fields.push(`email = $${fields.length + 1}`);
        values.push(data.email.trim().toLowerCase());
    }

    if (data.phone !== undefined) {
        fields.push(`phone = $${fields.length + 1}`);
        values.push(data.phone);
    }

    if (data.identification_number !== undefined) {
        fields.push(`identification_number = $${fields.length + 1}`);
        values.push(data.identification_number);
    }

    if (data.status !== undefined) {
        fields.push(`status = $${fields.length + 1}`);
        values.push(data.status);
    }

    fields.push(`updated_at = NOW()`);

    const result = await query(
        `UPDATE users
		 SET ${fields.join(", ")}
		 WHERE id = $${fields.length + 1}
		 RETURNING id, names, last_names, password, email, phone, identification_number, status, created_at, updated_at`,
        [...values, id],
    );

    if (result.rowCount === 0) {
        return null;
    }

    return mapDbUser(result.rows[0] as DbUserRow);
};

export const deleteUserModel = async (id: string): Promise<boolean> => {
    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
    return (result.rowCount ?? 0) > 0;
};

export const loginUserModel = async (
    credentials: LoginUserData,
): Promise<User | null> => {


    const user = await getUserByEmailModel(credentials.email);

    console.log("Usuario encontrado para login:", user ? { ...user, password: "****" } : null);

    if (!user) {
        return null;
    }

    if (user.password !== credentials.password) {
        return null;
    }

    return user;
};

export const createPasswordRecoveryTokenModel = async ({
    userId,
    token,
    expiresAt,
}: CreatePasswordRecoveryTokenInput): Promise<void> => {
    await query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [userId]);

    await query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, token, expiresAt],
    );
};

export const verifyPasswordRecoveryCodeModel = async (
    email: string,
    code: string,
): Promise<VerifyPasswordRecoveryCodeResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    const result = await query(
        `SELECT prt.user_id, prt.expires_at
         FROM password_reset_tokens prt
         INNER JOIN users u ON u.id = prt.user_id
         WHERE LOWER(u.email) = LOWER($1)
           AND prt.token = $2
         ORDER BY prt.created_at DESC
         LIMIT 1`,
        [normalizedEmail, normalizedCode],
    );

    if (result.rowCount === 0) {
        return {
            isValid: false,
            isExpired: false,
        };
    }

    const row = result.rows[0] as { user_id: string; expires_at: string | Date };
    const expiresAt = new Date(row.expires_at);

    if (expiresAt.getTime() <= Date.now()) {
        return {
            isValid: false,
            isExpired: true,
            userId: String(row.user_id),
            expiresAt,
        };
    }

    return {
        isValid: true,
        isExpired: false,
        userId: String(row.user_id),
        expiresAt,
    };
};

export const resetPasswordWithRecoveryCodeModel = async (
    email: string,
    code: string,
    newPassword: string,
): Promise<ResetPasswordWithRecoveryCodeResult> => {
    const verification = await verifyPasswordRecoveryCodeModel(email, code);

    if (!verification.isValid) {
        return {
            success: false,
            isExpired: verification.isExpired,
        };
    }

    if (!verification.userId) {
        return {
            success: false,
            isExpired: false,
        };
    }

    await query(
        `UPDATE users
         SET password = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [newPassword, verification.userId],
    );

    await query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [verification.userId]);

    return {
        success: true,
        isExpired: false,
    };
};

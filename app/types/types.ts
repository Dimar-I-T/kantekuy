export interface RegisterType {
    username: string;
    email: string;
    password: string;
}

export interface LoginType {
    username: string;
    password: string;
}

export interface JWTPayload {
    user_id: string,
    stall_id: string,
    username: string,
    role: string
}

export interface StallType {
    name: string;
    description: string;
    block_id: string;
    phone_number: string;
}
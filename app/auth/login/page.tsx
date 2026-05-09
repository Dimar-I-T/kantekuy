'use client'

import React, { useState } from "react"
import { LoginType } from "@/app/types/types"
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
    const router = useRouter();
    const [loginForm, setLoginForm] = useState<LoginType>({
        username: "",
        password: ""
    });

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/auth/login`, loginForm);
            if (response) {
                alert('Successfully Logged In!');
                router.push('/');
                router.refresh();
            }
        } catch (error: any) {
            alert(error.response.data.message);
        }
    }

    const handleChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setLoginForm((prev) => ({
            ...prev,
            [key]: newValue
        }));
    }

    return (
        <div className="w-full min-h-screen flex flex-col px-3 justify-center items-center bg-gray-800">
            <div className="md:w-[400px] w-full p-10 max-md:p-8 rounded-xl bg-black/50">
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-xl text-blue-400">
                            Username
                        </h1>

                        <input
                            type="text"
                            value={loginForm.username}
                            onChange={(e) => handleChange("username", e)}
                            placeholder="Enter your username here"
                            className="border border-blue-400 w-full rounded-xl h-10 px-5"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-xl text-blue-400">
                            Password
                        </h1>

                        <input
                            type="password"
                            value={loginForm.password}
                            onChange={(e) => handleChange("password", e)}
                            placeholder="Enter your password here"
                            className="border border-blue-400 w-full rounded-xl h-10 px-5"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full h-15 rounded-xl text-xl text-black font-bold bg-blue-500/90 hover:bg-blue-500 text-center flex justify-center items-center">
                        LOGIN
                    </button>
                </form>
            </div>
        </div>
    )
}
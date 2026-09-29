
import type { User, CreateUseDTO } from "../types/user";

const API_BASE_URL = "http://localhost:3000/api";

export const userService = {
    //Get / api/users - Listar todos os usuarios
    async list(): Promise<User[]>{
        const resposta = await fetch(`${API_BASE_URL}/users`);
        if(!resposta.ok) {
            const erroBody = await resposta.json().catch(() => ({}));
            throw new Error(erroBody.erro || "Falha ao buscar a lista de usuários.");
        }
        return resposta.json();
    },

    //Post / api/users - Cadastrar novo usuarios
    async create(dados: CreateUseDTO): Promise<User>{
        const resposta = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
        });
        if(!resposta.ok) {
            const erroBody = await resposta.json().catch(() => ({}));
            throw new Error(erroBody.erro || "Falha ao buscar a lista de usuários.");
        }
        return resposta.json();
    },
};

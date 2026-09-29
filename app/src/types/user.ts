
// Contrato do usuario retornado pelo banco de dados
export interface User {
    id : number;
    nome: string;
    email: string;
    createdAt: string;
}

// dados necessário para cadastrar um novo usuario]
export interface CreateUseDTO {
    nome: string;
    email: string;
    password?: string;
    senha_hash?: string;
}


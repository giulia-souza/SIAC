//api para login e cadastro ----
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function POST(request: Request) {

    try{
        const body = await request.json();

        const {nome, email, password} = body;

        if (!nome || !email || !password) {
        return NextResponse.json(
            { error: 'Nome, email e senha são obrigatórios' },
            { status: 400 }
        );
        };

        const novoUsuario = await prisma.usuario.create({
        data: {
            nome,
            email,
            password,
            regra: 'ESTUDANTE',
        },
        });

        return NextResponse.json
        (
            { message: 'Usuário criado com sucesso!', user: novoUsuario }, 
            { status: 201 }
        ); // retorno o usuario novo

    }
    catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Este email já está cadastrado' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Erro ao criar utilizador' },
            { status: 500 }
        );
    }
};


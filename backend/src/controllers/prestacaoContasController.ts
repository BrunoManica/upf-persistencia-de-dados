import { Response, Request } from "express";
import { ConsultaContas, DadosContaReceber } from "../types/prestacaoConta";
import { criarConta, listarContas } from "../services/contasReceberService";



export function criar(
    requisicao: Request<object, object, DadosContaReceber>,
    resposta: Response) {
    const prestacaoConta = requisicao.body;
    const retorno= criarConta(prestacaoConta)

    resposta.status(201).json(retorno)
}


export function listar(requisicao: Request<object, object, object, ConsultaContas>,
    resposta: Response) {

        const { empresa, status }= requisicao.query
        const contas = listarContas(empresa, status)
        resposta.status(200).json(contas)
}
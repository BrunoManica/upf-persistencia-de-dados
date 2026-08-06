import { ContaReceber, DadosContaReceber } from "../types/prestacaoConta";


const contas :ContaReceber[] = [
    {
           id: 1,
           empresa: "automasul",
           descricao: "bati um rangao",
           data: "2026-08-05",
           valor: 3.80,
           notaFiscalBase64: "çjfhçkshfçLDHFÇLKFçlKJS",
           status:"PENDENTE" 
    }
]

let proximoId = 2


export function listarContas(empresa?:string, status?:string) {
    let resultado = contas;    
    console.log("oi to passando em listarContas")

   
    if(empresa){
       resultado =  resultado.filter((conta)=> 
            conta.empresa
        .includes(empresa.toLocaleLowerCase())
    )
    }


    if(status){
        resultado = resultado.filter((conta)=> conta.status==status)
    }

    return resultado
}

export function criarConta(dados: DadosContaReceber){
    const novaConta:ContaReceber ={
        id: proximoId,
        ...dados,
        status: "PENDENTE"
    }

    proximoId = proximoId + 1
    contas.push(novaConta)
    return novaConta

}


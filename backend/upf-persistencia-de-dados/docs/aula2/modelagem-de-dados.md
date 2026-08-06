# Aula 2 — Modelagem de dados agregados

**Disciplina:** Tecnologias de Persistência de Dados
**Tema:** Modelagem de dados agregados e documentos

## Objetivo

Ao final desta aula, você deve conseguir identificar um agregado, representar dados relacionados com objetos e arrays JSON e justificar uma decisão simples entre incorporar ou referenciar dados.

## Escopo da aula

    Nesta aula, o foco é a modelagem. Os comandos do MongoDB e a persistência dos documentos serão estudados na aula seguinte.

O caminho da aula é:

```text
PROBLEMA
   ↓
DADOS
   ↓
RELACIONAMENTOS
   ↓
DOCUMENTO JSON
```

## 1. JSON válido não garante uma boa modelagem

Na aula anterior, JSON apareceu como um formato útil para enviar dados em APIs, armazenar informações e representar objetos. Agora a questão é diferente: **como organizar as informações dentro de um documento?**

Considere este JSON:

```json
{
  "nome": "João",
  "idade": 25
}
```

Ele é sintaticamente válido. Isso, porém, não responde se é um bom modelo para um problema real. Formato válido e boa modelagem são problemas diferentes.

## 2. Partindo de um pedido

Imagine que uma loja precisa registrar pedidos. Um pedido precisa de número, data, cliente, status e produtos.

Uma primeira representação pode ser:

```json
{
  "numero": 1001,
  "data": "2026-08-03",
  "cliente": "Bruno",
  "status": "ABERTO"
}
```

Se também for necessário guardar o telefone do cliente, esta estrutura funciona:

```json
{
  "numero": 1001,
  "clienteNome": "Bruno",
  "clienteTelefone": "54999999999",
  "status": "ABERTO"
}
```

Mas não é a única possibilidade. O cliente pode ser representado como uma estrutura própria dentro do pedido:

```json
{
  "numero": 1001,
  "cliente": {
    "nome": "Bruno",
    "telefone": "54999999999"
  },
  "status": "ABERTO"
}
```

## 3. Objetos dentro de objetos

Um documento pode possuir estruturas internas. Compare as duas alternativas:

```json
{
  "nome": "Bruno",
  "cidade": "Passo Fundo",
  "estado": "RS"
}
```

```json
{
  "nome": "Bruno",
  "endereco": {
    "cidade": "Passo Fundo",
    "estado": "RS"
  }
}
```

Nenhuma delas é automaticamente errada. Na segunda, porém, fica explícito que cidade e estado fazem parte de um endereço:

```text
Cliente
│
├── nome
│
└── endereco
    ├── cidade
    └── estado
```

Essa organização é o início da ideia de composição e agregação.

## 4. Arrays e dados agregados

Um pedido com um único produto poderia começar assim:

```json
{
  "numero": 1001,
  "produto": "Mouse"
}
```

Se o pedido tiver dois produtos, evite criar campos como `produto1` e `produto2`. Esses campos até podem funcionar, mas não representam uma lista. Um array representa melhor a situação:

```json
{
  "numero": 1001,
  "produtos": [
    "Mouse",
    "Teclado"
  ]
}
```

Quando cada item precisa de mais informações, o array pode conter objetos:

```json
{
  "numero": 1001,
  "produtos": [
    {
      "nome": "Mouse",
      "quantidade": 2,
      "preco": 80.00
    },
    {
      "nome": "Teclado",
      "quantidade": 1,
      "preco": 250.00
    }
  ]
}
```

Agora a estrutura do pedido pode ser visualizada assim:

```text
PEDIDO
│
├── numero
├── data
├── status
├── cliente
│   ├── nome
│   └── telefone
│
└── itens
    ├── produto
    ├── quantidade
    └── preco
```

## 5. O que é um agregado?

**Agregado é um conjunto de dados relacionados que faz sentido tratar como uma unidade.**

No exemplo, o pedido é o agregado principal. Cliente e itens fazem parte dele:

```json
{
  "numero": 1001,
  "data": "2026-08-03",
  "status": "ABERTO",
  "cliente": {
    "nome": "Ana",
    "telefone": "54999999999"
  },
  "itens": [
    {
      "produto": "Mouse",
      "quantidade": 2,
      "preco": 80.00
    },
    {
      "produto": "Teclado",
      "quantidade": 1,
      "preco": 250.00
    }
  ]
}
```

MongoDB permite documentos com arrays e subdocumentos. Isso torna possível manter, na mesma estrutura, dados que fazem sentido juntos.

## 6. Relacional e documental

Em um modelo relacional, o mesmo cenário poderia ser separado em tabelas:

```text
CLIENTE                 PEDIDO                 PRODUTO
-------                 ------                 -------
id                      id                     id
nome                    data                   nome
telefone                status                 preco
                        cliente_id

ITEM_PEDIDO
-----------
pedido_id
produto_id
quantidade
preco
```

Visualmente, há relações entre estruturas diferentes:

```text
CLIENTE
   │
   └──── PEDIDO
            │
            └──── ITEM_PEDIDO
                     │
                     └──── PRODUTO
```

No documento, parte dessas informações pode aparecer junta:

```json
{
  "numero": 1001,
  "cliente": {
    "nome": "Ana",
    "telefone": "99999999"
  },
  "itens": [
    {
      "produto": "Mouse",
      "quantidade": 2,
      "preco": 80
    }
  ]
}
```

Não existe uma resposta universal para “qual modelo é melhor?”. A pergunta mais útil é:

> **Quando a aplicação buscar um pedido, o que ela precisa receber?**

Se a resposta for pedido, cliente, itens e preços, há um forte indício de que esses dados são acessados juntos e podem ser armazenados juntos. No MongoDB, a modelagem deve considerar os padrões de acesso da aplicação.

## 7. Dados incorporados

No exemplo abaixo, `cliente` está incorporado ao pedido:

```json
{
  "cliente": {
    "nome": "Ana",
    "telefone": "99999999"
  }
}
```

O mesmo ocorre com itens:

```json
{
  "itens": [
    {
      "produto": "Mouse"
    }
  ]
}
```

O MongoDB chama essa estratégia de *embedded data*: dado dentro do documento. Ela costuma ser interessante quando os dados relacionados são recuperados juntos.

**Incorporar não é colocar tudo dentro de tudo**

    O fato de um documento poder conter outros documentos não significa que todo o cadastro de um cliente deve ficar dentro de cada pedido.

Por exemplo, esta estrutura pode crescer e concentrar dados demais:

```json
{
  "pedido": 1001,
  "cliente": {
    "id": 10,
    "nome": "Ana",
    "cpf": "...",
    "telefone": "...",
    "enderecos": [],
    "pedidosAnteriores": [],
    "cartoes": [],
    "preferencias": [],
    "historico": []
  }
}
```

## 8. Referências

Outra possibilidade é manter os dados em documentos separados e ligar um ao outro por um identificador.

**Cliente:**

```json
{
  "_id": 10,
  "nome": "Ana",
  "telefone": "99999999"
}
```

**Pedido:**

```json
{
  "numero": 1001,
  "clienteId": 10,
  "status": "ABERTO"
}
```

```text
PEDIDO
   │
   └── clienteId
          │
          ▼
       CLIENTE
```

Isso é uma **referência**. Ela permite relacionar documentos separados usando um identificador.

## 9. Incorporar ou referenciar?

| Situação | Tendência |
|---|---|
| Os dados normalmente são usados juntos | Incorporar |
| O dado só faz sentido dentro do pai | Incorporar |
| É uma lista pequena e limitada | Incorporar |
| O dado possui vida própria | Referenciar |
| É consultado sozinho frequentemente | Referenciar |
| Pode crescer indefinidamente | Avaliar referência |
| Muitas entidades compartilham o mesmo dado | Avaliar referência |

**Não é uma receita matemática**

    Avalie o relacionamento e, principalmente, como a aplicação consulta e altera os dados.


## Fontes

- [MongoDB — Data Modeling](https://www.mongodb.com/pt-br/docs/manual/data-modeling/)
- [MongoDB — Embedded Data](https://www.mongodb.com/docs/manual/data-modeling/embedding/)
- [MongoDB — References](https://www.mongodb.com/docs/manual/data-modeling/referencing/)
- [MongoDB — Schema Design Process](https://www.mongodb.com/docs/v8.0/data-modeling/schema-design-process/)

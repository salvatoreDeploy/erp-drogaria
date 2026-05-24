---
id: CHANGE-PBM-001
task: TASK-PBM-001
prioridade: P1
status: pending
modulo: pbm
pagina: PbmPage
arquivos:
  - src/pages/PbmPage.tsx
  - src/schemas/pbm.ts
spec: .spec/pbm.spec.md
depende-de: [CHANGE-PBM-002]
---

# CHANGE-PBM-001 — Farmácia Popular: Fluxo HÓRUS Completo

## Contexto
O wizard PBM atual cobre convênios privados mas não o Programa Farmácia Popular (HÓRUS/DATASUS) — maior volume de atendimento PBM em farmácias populares.

## O que implementar
- [ ] Etapa 1: ao selecionar convênio "Farmácia Popular", ativar fluxo HÓRUS
- [ ] Identificação automática: medicamento consta na lista Farmácia Popular?
- [ ] Validação CPF obrigatória (RN-11) + mock verificação HÓRUS
- [ ] Tela de confirmação com visibilidade por perfil:
  - `operador_caixa`: vê apenas "VALOR PARA O CLIENTE: R$ 0,00"
  - `farmaceutico/admin`: vê custo farmácia + valor ressarcimento
- [ ] Receita digitalizada obrigatória para medicamentos de prescrição
- [ ] Geração de registro HÓRUS no estado local (lote mock)
- [ ] Etapa 3: resumo HÓRUS com protocolo de lote gerado
- [ ] `HorusLoteSchema.safeParse()` antes de finalizar

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/PbmPage.tsx` | Fluxo condicional na Etapa 1 + tela HÓRUS + schema de lote |
| `src/schemas/pbm.ts` | `HorusDispensacaoSchema`, `HorusLoteSchema` |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/pbm/horus/verificar-beneficiario
// TODO: integrar com API — POST /api/v1/pbm/horus/dispensar
// TODO: integrar com API — GET /api/v1/pbm/horus/lote-ativo
// TODO: integrar com API — POST /api/v1/pbm/horus/enviar-lote
```

## Dependência crítica
Layout do arquivo HÓRUS/DATASUS deve ser validado antes da integração real.
Ver: http://www.saude.gov.br/farmacia-popular

## Referência CLAUDE.md
- Status box multi-estado: `idle → validando → aprovado → rejeitado`
- Visibilidade por perfil: `STATUS_CFG` com campos condicionais por `perfil`
- RN-11: bloquear sem CPF válido + receita (quando aplicável)

## Resultado
*(preencher após implementação)*

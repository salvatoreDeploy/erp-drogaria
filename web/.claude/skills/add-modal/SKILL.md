---
name: add-modal
description: Adiciona um modal de fluxo (ação secundária, histórico ou confirmação) a uma página existente. Use quando a tarefa é adicionar um modal a uma tela já implementada.
arguments: [pagina, modal]
argument-hint: "<NomePage> <NomeModal (ex: ModalReposicao, ModalHistoricoCliente)>"
allowed-tools: Read, Edit, Bash
---

Adicione o modal `$modal` à página `$pagina`.

## Passo a passo

### 1. Ler a página e a spec

```
Read src/pages/$pagina.tsx
Read .spec/<modulo>.spec.md  (se existir)
```

Identifique:
- O padrão de modal já em uso na página (se houver)
- O estado `open` existente e como adicionar o novo
- Onde no JSX o modal deve ser renderizado

### 2. Adicionar o estado

```tsx
// No componente da página:
const [${nomeModal}Open, set${NomeModal}Open] = useState(false)
// Se o modal precisa de dados contextuais:
const [${nomeModal}Item, set${NomeModal}Item] = useState<TipoItem | null>(null)
```

### 3. Implementar a função modal (no mesmo arquivo)

Estrutura obrigatória:

```tsx
function $modal({ onClose, onConfirmar }: { onClose: () => void; onConfirmar?: (data: DadosTipo) => void }) {
  // Estado local do modal
  const [campo, setCampo] = useState('')

  function handleSubmit() {
    // Validação com Zod se aplicável
    // TODO: MÉTODO /api/v1/endpoint
    onConfirmar?.(dados)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay: SEMPRE <button type="button">, nunca <div onClick> */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[480px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        {/* Cabeçalho */}
        <div>
          <h3 className="font-bold text-[18px] text-brand-950">Título do modal</h3>
          <p className="text-[13px] text-text-secondary">Subtítulo opcional</p>
        </div>

        {/* Campos: padrão input inline */}
        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="campo-id" className="font-bold text-[12px] text-input-label">Rótulo</label>
          <input id="campo-id" ... className="bg-transparent text-[14px] text-brand-950 outline-none" />
        </div>

        {/* Rodapé */}
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700">
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 4. Adicionar gatilho na tabela/página

```tsx
// Botão de ação na coluna/área correspondente:
<button type="button" onClick={() => { set${NomeModal}Item(item); set${NomeModal}Open(true) }}
  className="flex h-7 items-center rounded-lg border border-brand-100 px-2.5 font-medium text-[11px] text-brand-700 hover:bg-brand-50">
  Ação
</button>
```

### 5. Renderizar o modal

```tsx
{/* No final do return da página, antes de fechar a div raiz: */}
{${nomeModal}Open && (
  <$modal
    item={${nomeModal}Item}
    onClose={() => { set${NomeModal}Open(false); set${NomeModal}Item(null) }}
    onConfirmar={handle${NomeModal}}
  />
)}
```

### 6. Implementar o handler

```tsx
function handle${NomeModal}(data: DadosTipo) {
  // TODO: MÉTODO /api/v1/endpoint
  setEstado(prev => prev.map(item => /* atualização */))
}
```

### 7. Rodar o quality gate

```bash
npx biome check --write ./src && npx tsc -b
```

## Regras invioláveis

| Regra | Motivo |
|---|---|
| Overlay `<button type="button">`, nunca `<div onClick>` | Biome `a11y/useKeyWithClickEvents` |
| Todo `<input>`/`<select>` tem `id` + `<label htmlFor>` | Biome `noLabelWithoutControl` |
| Campos somente-leitura usam `<p>` não `<label>` | Biome `noLabelWithoutControl` |
| `TODO: MÉTODO /endpoint` em cada ponto de integração | Rastreabilidade de API |
| Modal como função interna (não exportada) | Encapsulamento na página |
| Validação com `SafeParse` se há schema Zod | Nunca `parse()` — não lança exceção |

## Tipos de modal frequentes

| Tipo | Pattern |
|---|---|
| **Ação com campos** | estado local + validação Zod + `onConfirmar(data)` |
| **Confirmação danger** | banner warning + checkbox confirmação + botão `bg-danger-600` |
| **Histórico read-only** | tabela `ReadonlyField` — sem campos editáveis — sem `onConfirmar` |
| **Busca e seleção** | input busca + lista filtrada + `onSelect(item)` |

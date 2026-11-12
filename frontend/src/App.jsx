
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const formularioInicial = {
    descricao: '',
    valor: '',
    dataLancamento: '',
    tipo: 'DESPESA',
    categoria: '',
  }

  const [form, setForm] = useState(formularioInicial)
  const [lancamentos, setLancamentos] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(null)
  const [editandoId, setEditandoId] = useState(null)

  // PESQUISA E FILTROS
  const [pesquisa, setPesquisa] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  // BUSCAR LANÇAMENTOS
  async function buscarLancamentos() {
    try {
      const response = await fetch('http://localhost:8080/lancamentos')

      if (!response.ok) {
        throw new Error('Erro ao buscar lançamentos.')
      }

      const dados = await response.json()
      setLancamentos(dados)
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error)
      setMensagem('Não foi possível carregar os lançamentos.')
    }
  }

  useEffect(() => {
    buscarLancamentos()
  }, [])

  // ALTERAR CAMPOS DO FORMULÁRIO
  function alterarCampo(event) {
    const { name, value } = event.target

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }))
  }

  // CANCELAR EDIÇÃO
  function cancelarEdicao() {
    setEditandoId(null)
    setForm(formularioInicial)
    setMensagem('')
  }

  // INICIAR EDIÇÃO
  function iniciarEdicao(lancamento) {
    if (lancamento.status !== 'PENDENTE') {
      setMensagem('Somente lançamentos pendentes podem ser editados.')
      return
    }

    setEditandoId(lancamento.id)

    setForm({
      descricao: lancamento.descricao,
      valor: String(lancamento.valor),
      dataLancamento: lancamento.dataLancamento,
      tipo: lancamento.tipo,
      categoria: lancamento.categoria,
    })

    setMensagem('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // CADASTRAR OU EDITAR LANÇAMENTO
  async function salvarLancamento(event) {
    event.preventDefault()

    setMensagem('')
    setCarregando(true)

    const editando = editandoId !== null

    const url = editando
      ? `http://localhost:8080/lancamentos/${editandoId}`
      : 'http://localhost:8080/lancamentos'

    try {
      const response = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          valor: Number(form.valor),
        }),
      })

      if (!response.ok) {
        const erro = await response.json().catch(() => null)

        throw new Error(
          erro?.erro ||
          (editando
            ? 'Erro ao atualizar lançamento.'
            : 'Erro ao cadastrar lançamento.')
        )
      }

      setForm(formularioInicial)
      setEditandoId(null)

      await buscarLancamentos()

      setMensagem(
        editando
          ? 'Lançamento atualizado com sucesso!'
          : 'Lançamento cadastrado com sucesso!'
      )
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error)
      setMensagem(error.message || 'Não foi possível salvar o lançamento.')
    } finally {
      setCarregando(false)
    }
  }

  // APROVAR OU REJEITAR LANÇAMENTO
  async function alterarStatus(id, acao) {
    const operacao = acao === 'aprovar' ? 'aprovar' : 'rejeitar'

    setMensagem('')
    setAcaoEmAndamento(id)

    try {
      const response = await fetch(
        `http://localhost:8080/lancamentos/${id}/${operacao}`,
        { method: 'PATCH' }
      )

      if (!response.ok) {
        const erro = await response.json().catch(() => null)

        throw new Error(
          erro?.erro || 'Não foi possível alterar o status.'
        )
      }

      if (editandoId === id) {
        cancelarEdicao()
      }

      await buscarLancamentos()

      setMensagem(
        acao === 'aprovar'
          ? 'Lançamento aprovado com sucesso!'
          : 'Lançamento rejeitado com sucesso!'
      )
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      setMensagem(error.message || 'Erro ao atualizar o lançamento.')
    } finally {
      setAcaoEmAndamento(null)
    }
  }

  // EXCLUIR LANÇAMENTO
  async function excluirLancamento(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este lançamento? Esta ação não poderá ser desfeita.'
    )

    if (!confirmar) return

    setMensagem('')
    setAcaoEmAndamento(id)

    try {
      const response = await fetch(
        `http://localhost:8080/lancamentos/${id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const erro = await response.json().catch(() => null)

        throw new Error(
          erro?.erro || 'Não foi possível excluir o lançamento.'
        )
      }

      if (editandoId === id) {
        cancelarEdicao()
      }

      await buscarLancamentos()

      setMensagem('Lançamento excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error)
      setMensagem(error.message || 'Erro ao excluir lançamento.')
    } finally {
      setAcaoEmAndamento(null)
    }
  }

  // PESQUISA E FILTROS
  const lancamentosFiltrados = lancamentos.filter((lancamento) => {
    const correspondePesquisa = (lancamento.descricao || '')
      .toLowerCase()
      .includes(pesquisa.trim().toLowerCase())

    const correspondeTipo =
      filtroTipo === '' || lancamento.tipo === filtroTipo

    const correspondeCategoria =
      filtroCategoria === '' || lancamento.categoria === filtroCategoria

    const correspondeStatus =
      filtroStatus === '' || lancamento.status === filtroStatus

    return (
      correspondePesquisa &&
      correspondeTipo &&
      correspondeCategoria &&
      correspondeStatus
    )
  })

  // LIMPAR PESQUISA E FILTROS
  function limparFiltros() {
    setPesquisa('')
    setFiltroTipo('')
    setFiltroCategoria('')
    setFiltroStatus('')
  }

  // INDICADORES FINANCEIROS
  const lancamentosAprovados = lancamentos.filter(
    (lancamento) => lancamento.status === 'APROVADO'
  )

  const totalReceitas = lancamentosAprovados
    .filter((lancamento) => lancamento.tipo === 'RECEITA')
    .reduce((total, lancamento) => total + Number(lancamento.valor), 0)

  const totalDespesas = lancamentosAprovados
    .filter((lancamento) => lancamento.tipo === 'DESPESA')
    .reduce((total, lancamento) => total + Number(lancamento.valor), 0)

  const resultado = totalReceitas - totalDespesas

  const totalPendentes = lancamentos.filter(
    (lancamento) => lancamento.status === 'PENDENTE'
  ).length

  const totalAprovados = lancamentos.filter(
    (lancamento) => lancamento.status === 'APROVADO'
  ).length

  const totalRejeitados = lancamentos.filter(
    (lancamento) => lancamento.status === 'REJEITADO'
  ).length

  // FORMATAR VALORES
  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  // FORMATAR DATAS
  function formatarData(data) {
    if (!data) return ''

    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">F</div>

          <div>
            <h2>FinControl</h2>
            <span>Gestão financeira empresarial</span>
          </div>
        </div>

        <nav>
          <button type="button" className="nav-item">
            <span>⌂</span>
            Dashboard
          </button>

          <button type="button" className="nav-item active">
            <span>↕</span>
            Lançamentos
          </button>

          <button type="button" className="nav-item disabled">
            <span>▦</span>
            Categorias
          </button>

          <button type="button" className="nav-item disabled">
            <span>⚙</span>
            Configurações
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>FinControl Empresarial</p>
          <span>Gestão financeira para pequenos negócios</span>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>Visão financeira</h1>
            <p>Acompanhe as movimentações financeiras da empresa.</p>
          </div>

          <div className="avatar">ADM</div>
        </header>

        {/* INDICADORES FINANCEIROS */}
        <section className="summary">
          <div className="card">
            <div className="card-top">
              <span>Receitas cadastradas</span>
              <div className="card-icon income">↑</div>
            </div>

            <strong>{formatarMoeda(totalReceitas)}</strong>
            <small>Total de entradas registradas</small>
          </div>

          <div className="card">
            <div className="card-top">
              <span>Despesas cadastradas</span>
              <div className="card-icon expense">↓</div>
            </div>

            <strong>{formatarMoeda(totalDespesas)}</strong>
            <small>Total de saídas registradas</small>
          </div>

          <div className="card">
            <div className="card-top">
              <span>Resultado previsto</span>
              <div className="card-icon balance">$</div>
            </div>

            <strong className={resultado < 0 ? 'negative-value' : ''}>
              {formatarMoeda(resultado)}
            </strong>

            <small>Receitas aprovadas - despesas aprovadas</small>
          </div>
        </section>

        {/* CONTADORES POR STATUS */}
        <section className="summary status-summary">
          <div className="card">
            <div className="card-top">
              <span>Lançamentos pendentes</span>
            </div>
            <strong>{totalPendentes}</strong>
            <small>Aguardando aprovação</small>
          </div>

          <div className="card">
            <div className="card-top">
              <span>Lançamentos aprovados</span>
            </div>
            <strong>{totalAprovados}</strong>
            <small>Movimentações aprovadas</small>
          </div>

          <div className="card">
            <div className="card-top">
              <span>Lançamentos rejeitados</span>
            </div>
            <strong>{totalRejeitados}</strong>
            <small>Movimentações rejeitadas</small>
          </div>
        </section>

        {/* MENSAGENS */}
        {mensagem && (
          <div
            role="status"
            className={
              mensagem.includes('sucesso')
                ? 'message success'
                : 'message error'
            }
          >
            {mensagem}
          </div>
        )}

        {/* FORMULÁRIO */}
        <section className="content-card">
          <div className="content-header">
            <div>
              <span className="eyebrow">MOVIMENTAÇÕES</span>

              <h2>
                {editandoId !== null
                  ? 'Editar lançamento'
                  : 'Novo lançamento'}
              </h2>

              <p>
                {editandoId !== null
                  ? 'Altere as informações do lançamento selecionado.'
                  : 'Registre uma nova receita ou despesa empresarial.'}
              </p>
            </div>
          </div>

          <form onSubmit={salvarLancamento}>
            <div className="form-group full">
              <label htmlFor="descricao">Descrição</label>

              <input
                id="descricao"
                name="descricao"
                type="text"
                placeholder="Ex: Pagamento de fornecedor"
                value={form.descricao}
                onChange={alterarCampo}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="valor">Valor</label>

                <div className="money-input">
                  <span>R$</span>

                  <input
                    id="valor"
                    name="valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={alterarCampo}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dataLancamento">Data</label>

                <input
                  id="dataLancamento"
                  name="dataLancamento"
                  type="date"
                  value={form.dataLancamento}
                  onChange={alterarCampo}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="tipo">Tipo</label>

                <select
                  id="tipo"
                  name="tipo"
                  value={form.tipo}
                  onChange={alterarCampo}
                >
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria</label>

                <select
                  id="categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={alterarCampo}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Fornecedores">Fornecedores</option>
                  <option value="Folha de pagamento">
                    Folha de pagamento
                  </option>
                  <option value="Impostos">Impostos</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Utilidades">Utilidades</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={carregando || acaoEmAndamento !== null}
              >
                {carregando
                  ? 'Salvando...'
                  : editandoId !== null
                    ? 'Salvar alterações'
                    : '+ Salvar lançamento'}
              </button>

              {editandoId !== null && (
                <button
                  className="action-button reject-button"
                  type="button"
                  onClick={cancelarEdicao}
                  disabled={carregando}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>

        {/* HISTÓRICO DE LANÇAMENTOS */}
        <section className="content-card recent-card">
          <div className="content-header recent-header">
            <div>
              <span className="eyebrow">HISTÓRICO</span>
              <h2>Lançamentos recentes</h2>
              <p>Movimentações financeiras registradas no sistema.</p>
            </div>

            <span className="total-records">
              {lancamentosFiltrados.length} de {lancamentos.length} lançamento(s)
            </span>
          </div>

          {/* PESQUISA */}
          <div className="form-group full">
            <label htmlFor="pesquisa">Pesquisar lançamento</label>

            <input
              id="pesquisa"
              type="search"
              placeholder="Digite a descrição do lançamento..."
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
            />
          </div>

          {/* FILTROS */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="filtroTipo">Filtrar por tipo</label>

              <select
                id="filtroTipo"
                value={filtroTipo}
                onChange={(event) => setFiltroTipo(event.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="RECEITA">Receitas</option>
                <option value="DESPESA">Despesas</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filtroCategoria">Filtrar por categoria</label>

              <select
                id="filtroCategoria"
                value={filtroCategoria}
                onChange={(event) => setFiltroCategoria(event.target.value)}
              >
                <option value="">Todas as categorias</option>
                <option value="Vendas">Vendas</option>
                <option value="Serviços">Serviços</option>
                <option value="Fornecedores">Fornecedores</option>
                <option value="Folha de pagamento">
                  Folha de pagamento
                </option>
                <option value="Impostos">Impostos</option>
                <option value="Aluguel">Aluguel</option>
                <option value="Marketing">Marketing</option>
                <option value="Transporte">Transporte</option>
                <option value="Utilidades">Utilidades</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="filtroStatus">Filtrar por status</label>

              <select
                id="filtroStatus"
                value={filtroStatus}
                onChange={(event) => setFiltroStatus(event.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="APROVADO">Aprovados</option>
                <option value="REJEITADO">Rejeitados</option>
              </select>
            </div>

            <div className="form-group">
              <label>Limpar filtros</label>

              <button
                type="button"
                className="action-button"
                onClick={limparFiltros}
              >
                Limpar pesquisa e filtros
              </button>
            </div>
          </div>

          {/* RESULTADOS */}
          {lancamentosFiltrados.length === 0 ? (
            <div className="empty-state">
              {lancamentos.length === 0 ? (
                <>
                  <p>Nenhum lançamento cadastrado.</p>
                  <span>Os lançamentos registrados aparecerão aqui.</span>
                </>
              ) : (
                <>
                  <p>Nenhum lançamento encontrado.</p>
                  <span>
                    Tente alterar a pesquisa ou os filtros selecionados.
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Ações</th>
                    <th className="value-column">Valor</th>
                  </tr>
                </thead>

                <tbody>
                  {[...lancamentosFiltrados]
                    .sort((a, b) => b.id - a.id)
                    .map((lancamento) => (
                      <tr key={lancamento.id}>
                        <td>
                          <strong>{lancamento.descricao}</strong>
                        </td>

                        <td>{lancamento.categoria}</td>

                        <td>{formatarData(lancamento.dataLancamento)}</td>

                        <td>
                          <span
                            className={
                              lancamento.tipo === 'RECEITA'
                                ? 'type-badge receita'
                                : 'type-badge despesa'
                            }
                          >
                            {lancamento.tipo === 'RECEITA'
                              ? 'Receita'
                              : 'Despesa'}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              lancamento.status === 'APROVADO'
                                ? 'aprovado'
                                : lancamento.status === 'REJEITADO'
                                  ? 'rejeitado'
                                  : 'pendente'
                            }`}
                          >
                            {lancamento.status === 'APROVADO'
                              ? 'Aprovado'
                              : lancamento.status === 'REJEITADO'
                                ? 'Rejeitado'
                                : 'Pendente'}
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            {lancamento.status === 'PENDENTE' ? (
                              <>
                                <button
                                  type="button"
                                  className="action-button"
                                  onClick={() => iniciarEdicao(lancamento)}
                                  disabled={
                                    carregando || acaoEmAndamento !== null
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  className="action-button reject-button"
                                  onClick={() =>
                                    excluirLancamento(lancamento.id)
                                  }
                                  disabled={
                                    carregando || acaoEmAndamento !== null
                                  }
                                >
                                  {acaoEmAndamento === lancamento.id
                                    ? 'Processando...'
                                    : 'Excluir'}
                                </button>

                                <button
                                  type="button"
                                  className="action-button approve-button"
                                  disabled={acaoEmAndamento !== null}
                                  onClick={() =>
                                    alterarStatus(lancamento.id, 'aprovar')
                                  }
                                >
                                  {acaoEmAndamento === lancamento.id
                                    ? 'Processando...'
                                    : 'Aprovar'}
                                </button>

                                <button
                                  type="button"
                                  className="action-button reject-button"
                                  disabled={acaoEmAndamento !== null}
                                  onClick={() =>
                                    alterarStatus(lancamento.id, 'rejeitar')
                                  }
                                >
                                  {acaoEmAndamento === lancamento.id
                                    ? 'Processando...'
                                    : 'Rejeitar'}
                                </button>
                              </>
                            ) : (
                              <span className="action-completed">
                                Finalizado
                              </span>
                            )}
                          </div>
                        </td>

                        <td
                          className={
                            lancamento.tipo === 'RECEITA'
                              ? 'transaction-value receita-value'
                              : 'transaction-value despesa-value'
                          }
                        >
                          {lancamento.tipo === 'RECEITA' ? '+' : '-'}{' '}
                          {formatarMoeda(Number(lancamento.valor))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App

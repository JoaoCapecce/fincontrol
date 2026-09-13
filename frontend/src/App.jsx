import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    dataLancamento: '',
    tipo: 'DESPESA',
    categoria: '',
  })

  const [lancamentos, setLancamentos] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

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
    }
  }

  useEffect(() => {
    buscarLancamentos()
  }, [])

  function alterarCampo(event) {
    const { name, value } = event.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  async function cadastrarLancamento(event) {
    event.preventDefault()

    setMensagem('')
    setCarregando(true)

    try {
      const response = await fetch('http://localhost:8080/lancamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          valor: Number(form.valor),
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao cadastrar lançamento.')
      }

      setMensagem('Lançamento cadastrado com sucesso!')

      setForm({
        descricao: '',
        valor: '',
        dataLancamento: '',
        tipo: 'DESPESA',
        categoria: '',
      })

      await buscarLancamentos()
    } catch (error) {
      setMensagem('Não foi possível cadastrar o lançamento.')
    } finally {
      setCarregando(false)
    }
  }

  const totalReceitas = lancamentos
    .filter((lancamento) => lancamento.tipo === 'RECEITA')
    .reduce((total, lancamento) => total + Number(lancamento.valor), 0)

  const totalDespesas = lancamentos
    .filter((lancamento) => lancamento.tipo === 'DESPESA')
    .reduce((total, lancamento) => total + Number(lancamento.valor), 0)

  const resultado = totalReceitas - totalDespesas

  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

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
          <button className="nav-item">
            <span>⌂</span>
            Dashboard
          </button>

          <button className="nav-item active">
            <span>↕</span>
            Lançamentos
          </button>

          <button className="nav-item disabled">
            <span>▦</span>
            Categorias
          </button>

          <button className="nav-item disabled">
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

            <small>Receitas cadastradas - despesas cadastradas</small>
          </div>
        </section>

        <section className="content-card">
          <div className="content-header">
            <div>
              <span className="eyebrow">MOVIMENTAÇÕES</span>
              <h2>Novo lançamento</h2>
              <p>Registre uma nova receita ou despesa empresarial.</p>
            </div>
          </div>

          <form onSubmit={cadastrarLancamento}>
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

            {mensagem && (
              <div
                className={
                  mensagem.includes('sucesso')
                    ? 'message success'
                    : 'message error'
                }
              >
                {mensagem}
              </div>
            )}

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={carregando}
              >
                {carregando ? 'Salvando...' : '+ Salvar lançamento'}
              </button>
            </div>
          </form>
        </section>

        <section className="content-card recent-card">
          <div className="content-header recent-header">
            <div>
              <span className="eyebrow">HISTÓRICO</span>
              <h2>Lançamentos recentes</h2>
              <p>Movimentações financeiras registradas no sistema.</p>
            </div>

            <span className="total-records">
              {lancamentos.length} lançamento(s)
            </span>
          </div>

          {lancamentos.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum lançamento cadastrado.</p>
              <span>Os lançamentos registrados aparecerão aqui.</span>
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
                    <th className="value-column">Valor</th>
                  </tr>
                </thead>

                <tbody>
                  {[...lancamentos]
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
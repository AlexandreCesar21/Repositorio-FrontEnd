document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "http://localhost:8087/livraria/livros";
  const tabelaLivros = document.querySelector("#livrosTable tbody");
  const cadastrarBtn = document.querySelector(".button-cadast");
  const modal = document.getElementById("modalLivro");
  const closeBtn = document.querySelector(".close");
  const fecharModalBtn = document.getElementById("btnFechar");
  const btnSalvar = document.getElementById("btnSalvar");

  let linhaSelecionada = null;
  let livroSelecionado = null;
  let livros = [];

  // -------------------- TOAST --------------------
  function mostrarToast(mensagem, tipo = "sucesso") {
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.innerText = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // -------------------- CARREGAR LIVROS --------------------
  async function carregarLivros() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erro ao carregar livros");
      const data = await response.json();
      livros = data.content || data;
      renderizarTabela();
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao carregar livros", "erro");
    }
  }

  // -------------------- RENDERIZAR TABELA --------------------
  function renderizarTabela(lista = livros) {
    tabelaLivros.innerHTML = "";
    if (lista.length === 0) {
      tabelaLivros.innerHTML = "<tr><td colspan='11'>Nenhum livro cadastrado.</td></tr>";
      return;
    }

    lista.forEach(livro => {
      const tr = document.createElement("tr");
      tr.dataset.id = livro.livroId;
      tr.innerHTML = `
        <td>${livro.titulo}</td>
        <td>${livro.subtitulo || '-'}</td>
        <td>${livro.autor || '-'}</td>
        <td>${livro.editora || '-'}</td>
        <td>${livro.tipoCapa || '-'}</td>
        <td>${livro.categoria || '-'}</td>
        <td>${livro.isbn || '-'}</td>
        <td>${livro.valor || '-'}</td>
        <td>${livro.quantidade || '-'}</td>
        <td>${livro.status || 'ATIVO'}</td>
        <td>${livro.dataCadastroLivro ? new Date(livro.dataCadastroLivro).toLocaleDateString() : new Date().toLocaleDateString()}</td>
      `;
      tabelaLivros.appendChild(tr);
    });
  }

  // -------------------- CADASTRO DE LIVRO --------------------
  cadastrarBtn.addEventListener("click", async () => {
    try {
      const novoLivro = {
        titulo: document.getElementById("titulo").value.trim(),
        subtitulo: document.getElementById("subtitulo").value.trim() || null,
        autor: document.getElementById("autor").value.trim(),
        editora: document.getElementById("editora").value.trim(),
        valor: parseFloat(document.getElementById("valor").value.trim()),
        quantidade: parseInt(document.getElementById("quantidade").value.trim()),
        isbn: document.getElementById("isbn").value.trim(),
        categoria: document.getElementById("categoria").value.toUpperCase(),
        tipoCapa: document.getElementById("tipoCapa").value.toUpperCase(),
        status: "ATIVO"
      };

      // Validação básica
      if (!novoLivro.titulo || !novoLivro.autor || !novoLivro.editora || !novoLivro.categoria || !novoLivro.tipoCapa || !novoLivro.isbn || isNaN(novoLivro.valor) || isNaN(novoLivro.quantidade)) {
        mostrarToast("Preencha todos os campos corretamente.", "erro");
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoLivro)
      });

      if (!response.ok) throw new Error("Erro ao cadastrar livro");

      const livroSalvo = await response.json();
      livros.unshift(livroSalvo);
      renderizarTabela();
      document.getElementById("formCadastro").reset();
      mostrarToast("Livro cadastrado com sucesso!");
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao cadastrar livro", "erro");
    }
  });

  // -------------------- EDITAR LIVRO --------------------
  btnSalvar.addEventListener("click", async () => {
    if (!livroSelecionado) return;

    try {
      const livroEditado = {
        isbn: document.getElementById("editIsbn").value.trim(),
        titulo: document.getElementById("editTitulo").value.trim(),
        subtitulo: document.getElementById("editSubtitulo").value.trim() || null,
        valor: parseFloat(document.getElementById("editValor").value),
        quantidade: parseInt(document.getElementById("editQuantidade").value),
        categoria: document.getElementById("editCategoria").value.toUpperCase(),
        tipoCapa: document.getElementById("editTipoCapa").value.toUpperCase(),
        autor: document.getElementById("editAutor").value.trim(),
        editora: document.getElementById("editEditora").value.trim(),
        status: document.getElementById("editStatus").value.toUpperCase()
      };

      // Validação
      if (!livroEditado.titulo || !livroEditado.autor || !livroEditado.editora || !livroEditado.categoria || !livroEditado.tipoCapa || !livroEditado.isbn) {
        mostrarToast("Preencha todos os campos corretamente.", "erro");
        return;
      }
      if (isNaN(livroEditado.valor) || isNaN(livroEditado.quantidade)) {
        mostrarToast("Valor e quantidade devem ser números.", "erro");
        return;
      }

      console.log("Enviando PUT para:", `${API_URL}/${livroSelecionado.livroId}`);
      console.log("Payload:", livroEditado);

      const response = await fetch(`${API_URL}/${livroSelecionado.livroId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(livroEditado)
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Erro do back-end:", errorBody);
        throw new Error("Erro ao atualizar livro");
      }

      const atualizado = await response.json();
      const index = livros.findIndex(l => String(l.livroId) === String(livroSelecionado.livroId));
      if (index !== -1) livros[index] = atualizado;

      renderizarTabela();
      mostrarToast("Livro atualizado com sucesso!");
      fecharModalFunc();
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao atualizar livro", "erro");
    }
  });

  // -------------------- SELEÇÃO DE LINHA --------------------
  tabelaLivros.addEventListener("click", (event) => {
    const linha = event.target.closest("tr");
    if (!linha || !linha.dataset.id) return;

    linhaSelecionada = linha;
    livroSelecionado = livros.find(l => String(l.livroId) === linha.dataset.id);
    if (!livroSelecionado) return;

    modal.style.display = "flex";

    // Preencher campos do modal
    document.getElementById("editTitulo").value = livroSelecionado.titulo;
    document.getElementById("editSubtitulo").value = livroSelecionado.subtitulo || "";
    document.getElementById("editAutor").value = livroSelecionado.autor;
    document.getElementById("editEditora").value = livroSelecionado.editora;
    document.getElementById("editTipoCapa").value = livroSelecionado.tipoCapa;
    document.getElementById("editCategoria").value = livroSelecionado.categoria;
    document.getElementById("editIsbn").value = livroSelecionado.isbn;
    document.getElementById("editValor").value = livroSelecionado.valor;
    document.getElementById("editQuantidade").value = livroSelecionado.quantidade;
    document.getElementById("editStatus").value = livroSelecionado.status;
  });

  // -------------------- FECHAR MODAL --------------------
  function fecharModalFunc() {
    modal.style.display = "none";
    linhaSelecionada = null;
    livroSelecionado = null;
  }
  closeBtn.addEventListener("click", fecharModalFunc);
  fecharModalBtn.addEventListener("click", fecharModalFunc);
  window.addEventListener("click", e => { if (e.target === modal) fecharModalFunc(); });

  // -------------------- INICIALIZAÇÃO --------------------
  carregarLivros();

});

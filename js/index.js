document.addEventListener("DOMContentLoaded", function () {
    carregarLivros(); // carrega até 10 livros ao iniciar
});

let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector("main");


toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};



// Função para carregar os últimos 10 livros do catálogo
function carregarLivros(page = 0) {
    const tabelaBody = document.getElementById("livrosTableBody");
    if (!tabelaBody) return;

    tabelaBody.innerHTML = `<tr><td colspan="11" style="text-align:center;">Carregando...</td></tr>`; 

    fetch(`http://localhost:8087/livraria/livros?page=${page}&size=10&sort=dataCadastroLivro,desc`)
        .then(response => response.json())
        .then(data => {
            // Se a API retorna Page<Livro>, os dados ficam em data.content
            // Se retorna lista simples, já é o array
            const livros = Array.isArray(data) ? data : (data.content ?? []);

            if (livros.length === 0) {
                tabelaBody.innerHTML = `<tr><td colspan="11" style="text-align:center;">Nenhum livro encontrado.</td></tr>`;
            } else {
                renderizarLivros(livros);
            }
        })
        .catch(error => {
            console.error("Erro ao carregar livros:", error);
            tabelaBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:red;">Erro ao carregar livros</td></tr>`;
        });
}

// Função de busca por título (até 10 resultados)
function buscarPorTitulo() {
    const termo = document.getElementById("inputBusca").value.trim();
    const tabelaBody = document.getElementById("livrosTableBody");

    tabelaBody.innerHTML = `<tr><td colspan="11" style="text-align:center;">Buscando...</td></tr>`;

    fetch(`http://localhost:8087/livraria/livros?titulo=${encodeURIComponent(termo)}&page=0&size=10&sort=dataCadastroLivro,desc`)
        .then(response => response.json())
        .then(data => {
            const livros = Array.isArray(data) ? data : (data.content ?? []);
            if (livros.length === 0) {
                tabelaBody.innerHTML = `<tr><td colspan="11" style="text-align:center;">Nenhum livro encontrado.</td></tr>`;
            } else {
                renderizarLivros(livros);
            }
        })
        .catch(error => {
            console.error("Erro ao buscar livros:", error);
            tabelaBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:red;">Erro ao buscar livros</td></tr>`;
        });
}

// Função reutilizável para renderizar livros na tabela
function renderizarLivros(livros) {
    const tabelaBody = document.getElementById("livrosTableBody");
    tabelaBody.innerHTML = "";

    livros.forEach(livro => {
        const autores = livro.autores?.map(a => a.nome).join(", ") || "-";
        const editora = livro.editora?.nome || "-";
        const dataCadastro = livro.dataCadastroLivro
            ? new Date(livro.dataCadastroLivro).toLocaleString("pt-BR")
            : "-";

        const row = `
            <tr>
                <td>${livro.titulo || "-"}</td>
                <td>${livro.subtitulo || "-"}</td>
                <td>${livro.autor}</td>
                <td>${livro.editora}</td>
                <td>${livro.tipoCapa || "-"}</td>
                <td>${livro.categoria || "-"}</td>
                <td>${livro.isbn || "-"}</td>
                <td>R$ ${livro.valor ? Number(livro.valor).toFixed(2) : "0,00"}</td>
                <td>${livro.quantidade ?? "-"}</td>
                <td class="status-ativo">${livro.statusLivro === "DISPONIVEL" ? "DISPONÍVEL" : "INDISPONÍVEL"}</td>
                <td class="data-horario" style="text-align: center;">${dataCadastro}</td>
            </tr>
        `;
        tabelaBody.insertAdjacentHTML("beforeend", row);
    });
}

// Função para abrir o modal
function abrirModal() {
  const modal = document.getElementById("modalRelatorios");
  if (modal) {
    modal.style.display = "block";
  }
}

// Função para fechar o modal
function fecharModal() {
  const modal = document.getElementById("modalRelatorios");
  if (modal) {
    modal.style.display = "none";
  }
}

// Fechar modal ao clicar fora dele
window.onclick = function (event) {
  const modal = document.getElementById("modalRelatorios");
  if (event.target === modal) {
    fecharModal();
  }
};

// Função para gerar relatórios
function gerarRelatorio(numero) {
  let url = "";
  let nomeArquivo = "";

  switch (numero) {
    case 1:
      url = "http://localhost:8087/livraria/relatorios/livros/generico";
      nomeArquivo = "relatorio_livros_geral.pdf";
      break;

    case 2:
      const statusSelect = document.getElementById("statusSelect");
      const status = statusSelect ? statusSelect.value : "DISPONIVEL";

      url = `http://localhost:8087/livraria/relatorios/livros/por-status?status=${status}`;
      nomeArquivo = `relatorio_livros_${status.toLowerCase()}.pdf`;
      break;

    case 3:
      url = "http://localhost:8087/livraria/relatorios/livros/por-autor";
      nomeArquivo = "relatorio_livros_por_autor.pdf";
      break;

    case 4:
      url = "http://localhost:8087/livraria/relatorios/livros/por-editora";
      nomeArquivo = "relatorio_livros_por_editora.pdf";
      break;

    case 5:
      url = "http://localhost:8087/livraria/relatorios/livros/por-valor";
      nomeArquivo = "relatorio_livros_por_valor.pdf";
      break;

    case 6:
      url = "http://localhost:8087/livraria/relatorios/livros/por-estoque-zerado";
      nomeArquivo = "relatorio_livros_por_estoque_zerado.pdf";
      break;

    case 7:
      url = "http://localhost:8087/livraria/relatorios/livros/por-categoria";
      nomeArquivo = "relatorio_livros_por_categoria.pdf";
      break;

    default:
      alert("Relatório não implementado para o número: " + numero);
      return;
  }

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao gerar relatório: " + response.status);
      }
      return response.blob();
    })
    .then((blob) => {
      if (blob.type !== "application/pdf") {
        throw new Error("Resposta não é PDF, veio: " + blob.type);
      }
      const link = document.createElement("a");
      const urlBlob = window.URL.createObjectURL(blob);
      link.href = urlBlob;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
    })
    .catch((error) => {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar o relatório.");
    });

  fecharModal();
}

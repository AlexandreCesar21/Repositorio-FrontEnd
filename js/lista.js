document.addEventListener("DOMContentLoaded", () => {
    const tarefaInput = document.getElementById("tarefa");
    const funcionarioInput = document.getElementById("funcionario");
    const listaTarefa = document.getElementById("lista-tarefas");
    const buscarInput = document.getElementById("buscarLivro");
    const botaoCriar = document.querySelector(".button-cadast");

    // Carregar tarefas do localStorage
    carregarTarefas();

    botaoCriar.addEventListener("click", adicionar);

    buscarInput.addEventListener("input", () => {
        const termo = buscarInput.value.toLowerCase();
        const tarefas = document.querySelectorAll(".tarefa");

        tarefas.forEach(tarefa => {
            const titulo = tarefa.querySelector("h2").textContent.toLowerCase();
            tarefa.style.display = titulo.includes(termo) ? "block" : "none";
        });
    });

    function adicionar() {
        const nomeTarefa = tarefaInput.value.trim();
        const funcionario = funcionarioInput.value;

        if (nomeTarefa === "" || funcionario === "") {
            alert("Preencha todos os campos.");
            return;
        }

        criarElementoTarefa(nomeTarefa, funcionario);
        salvarTarefa(nomeTarefa, funcionario);

        tarefaInput.value = "";
        funcionarioInput.value = "";
    }

    function criarElementoTarefa(nome, funcionario) {
        const novaTarefa = document.createElement("div");
        novaTarefa.classList.add("tarefa");
        novaTarefa.innerHTML = `
            <div class="tarefa-info">
                <h2>${nome}</h2>
                <p>Funcionário(a): ${funcionario}</p>
            </div>
            <div class="buttons">
                <button class="button-concluir">Concluído</button>
                <br>
                <button class="button-excluir">Excluir</button>
            </div>
        `;

        novaTarefa.querySelector(".button-concluir").addEventListener("click", () => {
            novaTarefa.classList.toggle("concluida");
        });

        novaTarefa.querySelector(".button-excluir").addEventListener("click", () => {
            novaTarefa.remove();
            removerTarefa(nome, funcionario);
        });

        listaTarefa.appendChild(novaTarefa);

        setTimeout(() => {
            novaTarefa.classList.add("added");
        }, 10); 
    }

    function salvarTarefa(nome, funcionario) {
        const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
        tarefas.push({ nome, funcionario });
        localStorage.setItem("tarefas", JSON.stringify(tarefas));
    }

    function removerTarefa(nome, funcionario) {
        let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
        tarefas = tarefas.filter(t => !(t.nome === nome && t.funcionario === funcionario));
        localStorage.setItem("tarefas", JSON.stringify(tarefas));
    }

    function carregarTarefas() {
        const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
        tarefas.forEach(tarefa => criarElementoTarefa(tarefa.nome, tarefa.funcionario));
    }
});

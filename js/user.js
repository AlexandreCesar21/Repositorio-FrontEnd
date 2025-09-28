document.addEventListener('DOMContentLoaded', () => {
    const usuarioTable = document.querySelector('#usuarioTable tbody');
    const inputUsuario = document.getElementById('usuario');
    const inputSenha = document.getElementById('senha');
    const btnCadastrar = document.querySelector('.button-cadast');
    const buscarInput = document.getElementById('buscarUsuario');

    const modalUsuario = document.getElementById('modalUsuario');
    const btnFechar = document.getElementById('btnFechar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnRemover = document.getElementById('btnRemover');

    const confirmModal = document.getElementById('confirmModal');
    const btnConfirmarSim = document.getElementById('btnConfirmarSim');
    const btnConfirmarNao = document.getElementById('btnConfirmarNao');

    const editUsuarioInput = document.getElementById('editUsuario');
    const editSenhaInput = document.getElementById('editSenha');
    const editStatusInput = document.getElementById('editStatus');

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let usuarioSelecionadoIndex = null;

    function renderTabela() {
        usuarioTable.innerHTML = '';
        usuarios.forEach((usuario, index) => {
            const tr = document.createElement('tr');
            const classeStatus = usuario.status === "ATIVO" ? "status-ativo" : "status-inativo";
            tr.innerHTML = `
                <td>${usuario.usuario}</td>
                <td class="${classeStatus}">${usuario.status}</td>
                <td class="data-horario">${usuario.dataCadastro}</td>
            `;
            tr.addEventListener('click', () => abrirModal(index));
            usuarioTable.appendChild(tr);
        });
    }

    function carregarUsuarios() {
    fetch('http://localhost:8087/livraria/usuarios')
        .then(response => response.json())
        .then(data => {
            console.log("Resposta da API:", data); // Veja a estrutura real da resposta aqui

            // Se estiver usando Spring Data com paginação, os dados estão em "content"
            const listaUsuarios = data.content || data; 

            usuarios = listaUsuarios.map(usuario => ({
                usuarioId: usuario.usuarioId,
                usuario: usuario.nome, // <- ajuste aqui com base no nome do campo real
                senha: usuario.senha,
                status: usuario.statusUsuario,
                dataCadastro: usuario.dataCriacao
            }));

            renderTabela(); // Sua função para preencher a tabela
        })
        .catch(error => {
            console.error("Erro ao carregar usuários:", error);
        });
    }
   
  function cadastrarUsuario() {
    const nome = inputUsuario.value.trim();
    const senha = inputSenha.value.trim();

    // Validações
    if (!nome) {
        mostrarToast("O nome do usuário não pode estar em branco.", "erro");
        return;
    }

    if (nome.length < 3) {
        mostrarToast("O nome deve ter pelo menos 3 caracteres.", "erro");
        return;
    }

    if (!senha) {
        mostrarToast("A senha não pode estar em branco.", "erro");
        return;
    }

    if (senha.length < 6) {
        mostrarToast("A senha deve ter no mínimo 6 caracteres.", "erro");
        return;
    }

    const status = 'ATIVO'; // Status fixo no cadastro

    const novaDataCadastro = new Date();
    const dataCadastroFormatada = `${novaDataCadastro.toLocaleDateString()} ${novaDataCadastro.getHours().toString().padStart(2, '0')}:${novaDataCadastro.getMinutes().toString().padStart(2, '0')}:${novaDataCadastro.getSeconds().toString().padStart(2, '0')}`;

    const novoUsuario = {
        nome: nome,
        senha: senha,
        status: status,
        dataCadastro: dataCadastroFormatada
    };

    // Conexão
    fetch('http://localhost:8087/livraria/autenticacao/registro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoUsuario)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(msg => { throw new Error(msg); });
        }
        return response.json();
    })
    .then(data => {
        mostrarToast("Usuário cadastrado com sucesso!", "sucesso");
        inputUsuario.value = '';
        inputSenha.value = '';

        if (typeof renderTabela === 'function') renderTabela(); // atualiza a UI se houver tabela
    })
    .catch(error => {
        mostrarToast(error.message || "Erro ao cadastrar!", "erro");
        console.error("Erro:", error);
    });
   }

    function abrirModal(index) {
        const usuario = usuarios[index];
        usuarioSelecionadoIndex = index;
        editUsuarioInput.value = usuario.usuario;
        editSenhaInput.value = usuario.senha;
        editStatusInput.value = usuario.status;

        modalUsuario.style.display = 'block';
    }

    function fecharModal() {
        modalUsuario.style.display = 'none';
        usuarioSelecionadoIndex = null;
    }

   function salvarEdicao() {
    if (usuarioSelecionadoIndex === null) return;

    const nome = editUsuarioInput.value.trim();
    const senha = editSenhaInput.value.trim();
    const status = editStatusInput.value.trim();

    // Validações simples
    if (!nome) {
        mostrarToast("O nome do usuário não pode estar em branco.", "erro");
        return;
    }

    if (nome.length < 3) {
        mostrarToast("O nome deve ter pelo menos 3 caracteres.", "erro");
        return;
    }

    if (!senha) {
        mostrarToast("A senha não pode estar em branco.", "erro");
        return;
    }

    if (senha.length < 6) {
        mostrarToast("A senha deve ter no mínimo 6 caracteres.", "erro");
        return;
    }

    if (status !== "ATIVO" && status !== "INATIVO") {
        mostrarToast("Status inválido. Use 'ATIVO' ou 'INATIVO'.", "erro");
        return;
    }

    const usuario = usuarios[usuarioSelecionadoIndex];

    const usuarioPayload = {
        nome: nome,
        senha: senha,
        status: status
    };

    fetch(`http://localhost:8087/livraria/usuarios/${usuario.usuarioId}/usuario`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioPayload)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(msg => { throw new Error(msg); });
        }
        return response.json();
    })
    .then(data => {
        mostrarToast("Usuário atualizado com sucesso!", "sucesso");

        // Atualiza a lista local com os dados retornados
        usuarios[usuarioSelecionadoIndex] = {
            ...usuario,
            ...usuarioPayload
        };

        renderTabela();
        fecharModal();
    })
    .catch(error => {
        console.error("Erro ao atualizar usuário:", error);
        mostrarToast(error.message || "Erro ao atualizar usuário!", "erro");
    });
   }


    function confirmarRemocao() {
        confirmModal.style.display = 'block';
    }

    function cancelarRemocao() {
        confirmModal.style.display = 'none';
    }

  function removerUsuarioConfirmado() {
    if (usuarioSelecionadoIndex === null) return;

    const usuario = usuarios[usuarioSelecionadoIndex];

    fetch(`http://localhost:8087/livraria/usuarios/${usuario.usuarioId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(msg => { throw new Error(msg); });
        }
        return response.text(); // como você retorna uma string no back-end
    })
    .then(data => {
        mostrarToast("Usuário removido com sucesso!", "sucesso");

        // Remove da lista local após sucesso
        usuarios.splice(usuarioSelecionadoIndex, 1);
        renderTabela();
        fecharModal();
        confirmModal.style.display = 'none';
    })
    .catch(error => {
        console.error("Erro ao remover usuário:", error);
        mostrarToast(error.message || "Erro ao remover usuário!", "erro");
    });
}

   function buscarUsuario() {
    const termo = buscarInput.value.trim();

    fetch(`http://localhost:8087/livraria/usuarios?nome=${encodeURIComponent(termo)}&page=0&size=10`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(msg => { throw new Error(msg); });
            }
            return response.json();
        })
        .then(data => {
            console.log("Resposta da API:", data); // 👈 log para debug
            if (!data.content) {
                throw new Error("A resposta da API não contém a propriedade 'content'.");
            }

            usuarios = data.content.map(usuario => ({
            usuarioId: usuario.usuarioId,
            usuario: usuario.nome,
            senha: usuario.senha,
            status: usuario.statusUsuario,
            dataCadastro: usuario.dataCriacao // 👈 inclui aqui
        }));


            renderTabela(); // Atualiza a tabela com os dados
        })
        .catch(error => {
            console.error("Erro ao buscar usuários:", error);
            mostrarToast("Erro ao buscar usuários!", "erro");
        });
    }


    function mostrarToast(mensagem, tipo = "sucesso") {
        const toast = document.getElementById("toast");

        toast.classList.remove("toast-sucesso", "toast-erro");
        if (tipo === "sucesso") toast.classList.add("toast-sucesso");
        else if (tipo === "erro") toast.classList.add("toast-erro");

        toast.textContent = mensagem;
        toast.classList.remove("hidden");
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                toast.classList.add("hidden");
            }, 400);
        }, 2500);
    }


    // Eventos
    btnCadastrar.addEventListener('click', cadastrarUsuario);
    btnFechar.addEventListener('click', fecharModal);
    btnSalvar.addEventListener('click', salvarEdicao);
    btnRemover.addEventListener('click', confirmarRemocao);
    btnConfirmarNao.addEventListener('click', cancelarRemocao);
    btnConfirmarSim.addEventListener('click', removerUsuarioConfirmado);
    buscarInput.addEventListener('input', buscarUsuario);

    carregarUsuarios();
    renderTabela();
});

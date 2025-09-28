document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Evita o comportamento padrão do formulário

    const nome = document.getElementById("nome").value.trim();
    const senha = document.getElementById("password").value;

    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = ""; // Limpa mensagens anteriores

    // Validação básica no lado cliente
    if (!nome || !senha) {
        errorMessage.textContent = "Por favor, preencha todos os campos.";
        return;
    }

    try {
        const response = await fetch("http://localhost:8087/livraria/autenticacao/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome: nome, senha: senha })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Token JWT:", data.token);

            localStorage.setItem("token", data.token);
            window.location.href = "/html/index.html"; // Redireciona após login
        } else {
            // Trata os possíveis erros retornados pelo backend
            const errorText = await response.text();

            if (response.status === 401) {
                errorMessage.textContent = "Senha incorreta.";
            } else if (response.status === 404) {
                errorMessage.textContent = "Usuário não encontrado.";
            } else {
                errorMessage.textContent = errorText || "Erro ao realizar login.";
            }
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        errorMessage.textContent = "Erro ao conectar com o servidor.";
    }
});
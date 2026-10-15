<?php
require_once "conexao.php";
if ($_SERVER["REQUEST_METHOD"] !== "POST") { header("Location: cadastro.html"); exit; }

$nome = trim($_POST["nome"] ?? "");
$email = trim($_POST["email"] ?? "");
$telefone = trim($_POST["telefone"] ?? "");
$senha = $_POST["senha"] ?? "";

if ($nome === "" || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($senha) < 6) {
    die("Dados inválidos. Use um e-mail válido e senha com 6+ caracteres. <a href='cadastro.html'>Voltar</a>");
}
if ($senha !== ($_POST["confirmar_senha"] ?? "")) {
    die("As senhas não são iguais. <a href='cadastro.html'>Voltar</a>");
}
$hash = password_hash($senha, PASSWORD_DEFAULT);
$stmt = $conexao->prepare("INSERT INTO usuarios (nome, email, telefone, senha) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $nome, $email, $telefone, $hash);

if ($stmt->execute()) { header("Location: login.html"); exit; }
echo $stmt->errno === 1062
    ? "Este e-mail já está cadastrado. <a href='login.html'>Entrar</a>"
    : "Erro ao cadastrar. Tente novamente.";

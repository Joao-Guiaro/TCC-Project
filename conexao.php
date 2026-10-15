<?php
// Ajuste para o seu servidor (não publique senhas reais em repositórios)
$host = "localhost";
$usuario = "root";
$senha = "123456";
$banco = "netuno";

mysqli_report(MYSQLI_REPORT_OFF);
$conexao = new mysqli($host, $usuario, $senha, $banco);
if ($conexao->connect_error) {
    http_response_code(500);
    die("Não foi possível conectar ao banco de dados.");
}
$conexao->set_charset("utf8mb4");

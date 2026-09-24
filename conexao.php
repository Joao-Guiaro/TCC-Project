<?php

$host = "localhost";
$usuario = "root"; // usuario do bacno de dados é: netuno_app
$senha = "123456"; // a senha do usuario é: Netuno12345.
$banco = "netuno";

$conexao = new mysqli($host, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
}
?>
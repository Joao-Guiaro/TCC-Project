<?php

$host = "10.140.169.30";
$usuario = "netuno_app";
$senha = "Netuno12345."; 
$banco = "netuno";

$conexao = new mysqli($host, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
}
?>
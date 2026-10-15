<?php
// API do dashboard: lista, cria, exclui e gera dados de exemplo (só para usuário logado)
session_start();
header("Content-Type: application/json; charset=utf-8");
if (!isset($_SESSION["usuario_id"])) { http_response_code(401); echo '{"erro":"nao_autenticado"}'; exit; }
require_once "conexao.php";
$uid = (int)$_SESSION["usuario_id"];
$in = json_decode(file_get_contents("php://input"), true) ?? [];

function inserir($c, $uid, $d, $l, $p, $ca, $q, $v) {
    $s = $c->prepare("INSERT INTO scrap (usuario_id,data_registro,linha,produto,causa,quantidade,custo_unitario) VALUES (?,?,?,?,?,?,?)");
    $s->bind_param("issssid", $uid, $d, $l, $p, $ca, $q, $v);
    return $s->execute();
}

switch ($_SERVER["REQUEST_METHOD"]) {
  case "GET":
    $s = $conexao->prepare("SELECT id, data_registro AS data, linha, produto, causa, quantidade AS qtd, custo_unitario AS custo FROM scrap WHERE usuario_id=? ORDER BY data_registro DESC, id DESC");
    $s->bind_param("i", $uid); $s->execute();
    echo json_encode($s->get_result()->fetch_all(MYSQLI_ASSOC)); break;

  case "POST":
    if (($in["acao"] ?? "") === "demo") {
        $L = ["Linha 1","Linha 2","Linha 3"]; $C = ["Falha de máquina","Erro de operador","Matéria-prima","Ajuste de setup","Outros"]; $P = ["Tampa A12","Base B07","Eixo C33","Carcaça D01"];
        for ($i = 0; $i < 30; $i++) inserir($conexao, $uid, date("Y-m-d", strtotime("-".($i % 20)." days")), $L[$i%3], $P[$i%4], $C[($i*7)%5], 5+($i*13)%40, 2.5+($i*3)%9);
        echo '{"ok":true}'; break;
    }
    $d = $in["data"] ?? ""; $q = (int)($in["qtd"] ?? 0); $v = (float)($in["custo"] ?? -1);
    $p = trim($in["produto"] ?? ""); $l = trim($in["linha"] ?? ""); $ca = trim($in["causa"] ?? "");
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $d) || $q < 1 || $v < 0 || $p === "" || $l === "" || $ca === "") {
        http_response_code(422); echo '{"erro":"dados_invalidos"}'; break;
    }
    echo inserir($conexao, $uid, $d, $l, mb_substr($p,0,80), $ca, $q, $v) ? '{"ok":true}' : '{"erro":"falha"}'; break;

  case "DELETE":
    $id = (int)($_GET["id"] ?? 0);
    $s = $conexao->prepare("DELETE FROM scrap WHERE id=? AND usuario_id=?");
    $s->bind_param("ii", $id, $uid); $s->execute();
    echo '{"ok":true}'; break;
}

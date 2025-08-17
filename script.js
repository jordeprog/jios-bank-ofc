// ——— Constantes de LocalStorage ———
const LS_USERS_KEY   = 'jios_usuarios';
const LS_HISTORY_KEY = 'jios_historico';

// ——— Estruturas em memória ———
let usuarios  = {};
let historico = {};
let usuarioAtual = null;

// ——— Inicialização ———
window.onload = function() {
  carregarStorage();
};

function carregarStorage() {
  // Carrega usuários
  const us = localStorage.getItem(LS_USERS_KEY);
  if (us) {
    usuarios = JSON.parse(us);
  } else {
    // Se não houver, cria admin
    usuarios = {
      admin: { senha: 'admin', saldo: Infinity, admin: true }
    };
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(usuarios));
  }

  // Carrega histórico
  const hs = localStorage.getItem(LS_HISTORY_KEY);
  if (hs) {
    historico = JSON.parse(hs);
  } else {
    historico = { admin: [] };
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(historico));
  }
}

// ——— Funções de Utility ———
function salvarUsuarios() {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(usuarios));
}

function salvarHistorico() {
  localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(historico));
}

function logout() {
  window.location.reload();
}

// ——— Autenticação ———
function login() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;

  if (usuarios[user] && usuarios[user].senha === pass) {
    usuarioAtual = { ...usuarios[user], nome: user };
    mostrarPainel(usuarioAtual.admin);
    document.getElementById('loginMsg').textContent = '';
  } else {
    document.getElementById('loginMsg').textContent = 'Usuário ou senha incorretos.';
  }
}

function mostrarPainel(isAdmin) {
  document.getElementById('login').style.display      = 'none';
  document.getElementById('dashboard').style.display  = 'block';
  document.getElementById('welcome').textContent      = `Bem-vindo, ${usuarioAtual.nome}`;
  const saldoTxt = usuarioAtual.saldo === Infinity
    ? '∞'
    : usuarioAtual.saldo.toLocaleString('pt-BR');
  document.getElementById('saldoInfo').textContent = `Saldo: ${saldoTxt} J Créditos`;

  // Exibe painel de admin se for admin
  document.getElementById('adminPanel').style.display = isAdmin ? 'block' : 'none';

  atualizarHistorico();
}

// ——— CRUD de Usuários (Admin) ———
function criarUsuario() {
  const nome  = document.getElementById('newUser').value.trim();
  const senha = document.getElementById('newPass').value;
  const saldo = parseFloat(document.getElementById('newSaldo').value);

  if (!nome || !senha || isNaN(saldo)) {
    alert('Preencha todos os campos corretamente.');
    return;
  }
  if (usuarios[nome]) {
    alert('Usuário já existe.');
    return;
  }

  usuarios[nome] = { senha, saldo, admin: false };
  historico[nome] = [];
  salvarUsuarios();
  salvarHistorico();
  alert(`Usuário ${nome} criado com sucesso!`);
}

function excluirUsuario() {
  const nome = document.getElementById('delUser').value.trim();
  if (nome === 'admin') {
    alert('Não é possível excluir o administrador.');
    return;
  }
  if (!usuarios[nome]) {
    alert('Usuário não encontrado.');
    return;
  }
  delete usuarios[nome];
  delete historico[nome];
  salvarUsuarios();
  salvarHistorico();
  alert(`Usuário ${nome} excluído.`);
}

function editarSaldo() {
  const nome      = document.getElementById('editUser').value.trim();
  const novoSaldo = parseFloat(document.getElementById('editSaldo').value);

  if (!usuarios[nome]) {
    alert('Usuário não encontrado.');
    return;
  }

  usuarios[nome].saldo = novoSaldo;
  salvarUsuarios();
  alert(`Saldo de ${nome} atualizado para ${novoSaldo.toLocaleString('pt-BR')}.`);
}

// ——— Transferências e Histórico ———
function transferir() {
  const destino = document.getElementById('destino').value.trim();
  const valor   = parseFloat(document.getElementById('valor').value);

  if (!usuarios[destino]) {
    document.getElementById('transferMsg').textContent = 'Usuário de destino não existe.';
    return;
  }
  if (isNaN(valor) || valor <= 0) {
    document.getElementById('transferMsg').textContent = 'Valor inválido.';
    return;
  }
  if (usuarioAtual.saldo < valor && usuarioAtual.saldo !== Infinity) {
    document.getElementById('transferMsg').textContent = 'Saldo insuficiente.';
    return;
  }

  // Ajusta saldos
  if (usuarioAtual.saldo !== Infinity) {
    usuarios[usuarioAtual.nome].saldo -= valor;
    usuarioAtual.saldo -= valor;
  }
  usuarios[destino].saldo += valor;

  // Registra histórico
  const now = new Date().toLocaleString();
  const registro = `${now} — ${usuarioAtual.nome} → ${destino}: ${valor.toLocaleString('pt-BR')} J Créditos`;

  historico[usuarioAtual.nome].push(registro);
  historico[destino].push(registro);

  salvarUsuarios();
  salvarHistorico();

  // Atualiza tela
  document.getElementById('transferMsg').textContent = 'Transferência realizada!';
  mostrarPainel(usuarioAtual.admin);
}

function atualizarHistorico() {
  const lista   = document.getElementById('historico');
  const logs    = historico[usuarioAtual.nome] || [];
  lista.innerHTML = '';

  logs.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    lista.appendChild(li);
  });
}

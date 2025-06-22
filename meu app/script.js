// Constante para a senha mestra (altere para sua senha)
const ADMIN_PASSWORD = "bolochoco4";

// Funções originais (mantidas intactas)
function register(event) {
  event.preventDefault();

  const user = document.getElementById("registerUser").value.trim();
  const pass = document.getElementById("registerPass").value.trim();

  if (!user || !pass) {
    alert("Preencha todos os campos.");
    return;
  }

  if (localStorage.getItem(user)) {
    alert("Usuário já existe!");
  } else {
    const userData = {
      password: pass,
      codes: {}
    };
    localStorage.setItem(user, JSON.stringify(userData));
    alert("Usuário registrado com sucesso!");
    window.location.href = "index.html";
  }
}

function login(event) {
  event.preventDefault();

  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const dataString = localStorage.getItem(user);

  if (!dataString) {
    alert("Usuário não encontrado.");
    return;
  }

  const data = JSON.parse(dataString);

  if (data.password === pass) {
    sessionStorage.setItem("loggedUser", user);
    window.location.href = "dashboard.html";
  } else {
    alert("Usuário ou senha inválidos.");
  }
}

function addCode(event) {
  event.preventDefault();

  const user = sessionStorage.getItem("loggedUser");
  if (!user) {
    alert("Você precisa estar logado.");
    window.location.href = "index.html";
    return;
  }

  const code = document.getElementById("code").value.trim();
  const name = document.getElementById("name").value.trim();

  if (!code || !name) {
    alert("Preencha todos os campos.");
    return;
  }

  const data = JSON.parse(localStorage.getItem(user)) || { password: "", codes: {} };
  if (!data.codes) data.codes = {};

  if (data.codes.hasOwnProperty(code)) {
    alert(`O código "${code}" já está cadastrado.`);
    return;
  }

  const nameExists = Object.values(data.codes).some(existingName => existingName.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    alert(`O nome "${name}" já está cadastrado.`);
    return;
  }

  data.codes[code] = name;
  localStorage.setItem(user, JSON.stringify(data));

  alert("Código cadastrado com sucesso!");
  document.getElementById("code").value = "";
  document.getElementById("name").value = "";
}

function searchCode(event) {
  event.preventDefault();

  const user = sessionStorage.getItem("loggedUser");
  if (!user) {
    alert("Você precisa estar logado.");
    window.location.href = "index.html";
    return;
  }

  const dataString = localStorage.getItem(user);
  if (!dataString) {
    alert("Dados do usuário não encontrados.");
    return;
  }

  const data = JSON.parse(dataString);
  const code = document.getElementById("search").value.trim();

  if (!data.codes || !code) {
    document.getElementById("result").innerText = "Código não encontrado.";
    return;
  }

  const result = data.codes[code];
  document.getElementById("result").innerText = result
    ? `Nome: ${result}`
    : "Código não encontrado.";
}

function searchByName() {
  const user = sessionStorage.getItem("loggedUser");
  if (!user) {
    alert("Você precisa estar logado.");
    return;
  }

  const dataString = localStorage.getItem(user);
  if (!dataString) {
    alert("Dados do usuário não encontrados.");
    return;
  }

  const data = JSON.parse(dataString);
  const query = document.getElementById("nameSearch").value.toLowerCase();

  if (!data.codes || !query) {
    document.getElementById("nameResult").innerText = "Nenhum resultado encontrado.";
    return;
  }

  let found = null;
  for (const code in data.codes) {
    const name = data.codes[code].toLowerCase();
    if (name.includes(query)) {
      found = `${code} → ${data.codes[code]}`;
      break;
    }
  }

  document.getElementById("nameResult").innerText = found || "Nenhum resultado encontrado.";
}

// Sistema de Gerenciamento Avançado
function verifyAdminAccess() {
  const password = prompt("Digite a senha de administrador:");
  if (password === ADMIN_PASSWORD) {
    return true;
  }
  alert("Acesso negado: Senha incorreta!");
  return false;
}

function loadManagementPanel() {
  if (!verifyAdminAccess()) return;

  const allUsersData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const username = localStorage.key(i);
    allUsersData[username] = JSON.parse(localStorage.getItem(username));
  }

  const panel = document.getElementById("managementPanel");
  panel.innerHTML = "<h3>Painel de Administração</h3>";

  Object.entries(allUsersData).forEach(([user, data]) => {
    const userSection = document.createElement("div");
    userSection.className = "user-section";
    userSection.innerHTML = `
      <h4>${user}</h4>
      <p>Total de códigos: ${data.codes ? Object.keys(data.codes).length : 0}</p>
    `;

    if (data.codes && Object.keys(data.codes).length > 0) {
      const codesList = document.createElement("div");
      codesList.className = "codes-list";
      
      Object.entries(data.codes).forEach(([code, name]) => {
        const codeItem = document.createElement("div");
        codeItem.className = "code-item";
        codeItem.innerHTML = `
          <span>${code} → ${name}</span>
          <button onclick="adminDeleteCode('${user}', '${code}')">Excluir</button>
        `;
        codesList.appendChild(codeItem);
      });
      
      userSection.appendChild(codesList);
    }

    panel.appendChild(userSection);
  });
}

function adminDeleteCode(username, code) {
  if (!verifyAdminAccess()) return;
  
  if (confirm(`Deseja excluir o código ${code} do usuário ${username}?`)) {
    const userData = JSON.parse(localStorage.getItem(username));
    delete userData.codes[code];
    localStorage.setItem(username, JSON.stringify(userData));
    loadManagementPanel();
    alert("Código excluído com sucesso!");
  }
}

// Funções auxiliares
function openModal() {
  document.getElementById("searchModal").style.display = "block";
  document.getElementById("nameSearch").value = "";
  document.getElementById("nameResult").innerText = "";
}

function closeModal() {
  document.getElementById("searchModal").style.display = "none";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  document.getElementById('tab' + capitalize(tabId)).classList.add('active');

  if (tabId === 'management') {
    loadManagementPanel();
  }
}

window.onclick = function(event) {
  const modal = document.getElementById("searchModal");
  if (event.target === modal) {
    closeModal();
  }
};  

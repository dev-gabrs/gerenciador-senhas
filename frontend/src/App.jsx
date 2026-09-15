import { useState, useEffect } from "react";
import { deriveKey, encryptText, decryptText, randomSaltBase64 } from "./crypto";

function App() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [vaultKey, setVaultKey] = useState(null);
  const [siteInput, setSiteInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [entries, setEntries] = useState([]);

useEffect(() => {
    if (vaultKey) {
      loadEntries();
    }
  }, [vaultKey]);

function generatePassword() {
  const sets = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    number: "0123456789",
    symbol: "!@#$%^&*()_+[]{}|;:,.<>?",
  };

let pool = "";
  if (useUpper) pool += sets.upper;
  if (useLower) pool += sets.lower;
  if (useNumbers) pool += sets.number;
  if (useSymbols) pool += sets.symbol;

  if (pool === "") {
    setPassword("Selecione ao menos uma opção");
    return;
  }

  const randomValues = crypto.getRandomValues(new Uint32Array(length));
  let result = "";
  for (let i = 0; i < length; i++) {
    result += pool[randomValues[i] % pool.length];
  }

  setPassword(result);
}

// Como o salt está no localStorage, esse código só serve como um projeto de estudo para rodar
// localmente, visto que num sistema real ele deveria vir de um back-end associado a conta de cada máquina/usuário

async function handleUnlock() {
  let salt = localStorage.getItem("vaultSalt");

  if (!salt) {
    salt = randomSaltBase64();
    localStorage.setItem("vaultSalt", salt);
  }

  const key = await deriveKey(masterPassword, salt);
  setVaultKey(key);
}

async function handleSave() {
  if (!password || password === "Selecione ao menos uma opção") {
    alert("Gere uma senha primeiro");
    return;
  }

  const encryptedPassword = await encryptText(vaultKey, password);

  const response = await fetch("http://127.0.0.1:5000/api/vault", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      site: siteInput,
      username: usernameInput,
      encrypted_password: encryptedPassword,
    }),
  });

  if (response.ok) {
    alert("Senha salva com sucesso!");
    setSiteInput("");
    setUsernameInput("");
    loadEntries();
  } else {
    alert("Erro ao salvar a senha");
  }
}

async function loadEntries() {
  const response = await fetch("http://127.0.0.1:5000/api/vault");
  const data = await response.json();

  const decrypted = await Promise.all(
    data.map(async (item) => ({
      id: item.id,
      site: item.site,
      username: item.username,
      password: await decryptText(vaultKey, item.encrypted_password),
    }))
  );

  setEntries(decrypted);
}

async function handleDelete(id) {
  const confirmed = confirm("Tem certeza que deseja deletar esta senha?");
  if (!confirmed) return;

  const response = await fetch(`http://127.0.0.1:5000/api/vault/${id}`, {
    method: "DELETE",
  });

  if (response.ok) {
    loadEntries();
  } else {
    alert("Erro ao deletar a senha");
  }
}

return (
  <div>
    <h1>Gerenciador de Senhas</h1>

    {!vaultKey && (
      <div>
        <input  
            type="password"
            placeholder="Senha mestra"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
        />
        <button onClick={handleUnlock}>Entrar no cofre</button>
      </div>
    )}

    {vaultKey && (
      <div>
        <div>
          <label>
            Tamanho: {length}
            <input
              type="range"
              min="8"
              max="48"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </label>
        </div>

        <div>
          <label>
            <input
            type="checkbox"
            checked={useUpper}
            onChange={(e) => setUseUpper(e.target.checked)}
            />
            Letras Maiúsculas
          </label>

          <label>
            <input
            type="checkbox"
            checked={useLower}
            onChange={(e) => setUseLower(e.target.checked)}
            />
            Letras Minúsculas
          </label>
  
          <label>
            <input
            type="checkbox"
            checked={useNumbers}
            onChange={(e) => setUseNumbers(e.target.checked)}
            />
            Números
          </label>

          <label>
            <input
            type="checkbox"
            checked={useSymbols}
            onChange={(e) => setUseSymbols(e.target.checked)}
            />
            Símbolos
          </label>
        </div>  

        <button onClick={generatePassword}>Gerar Senha</button>
        <p>{password}</p>

        <div>
          <input
            type="text"
            placeholder="Site (ex: github.com)"
            value={siteInput}
            onChange={(e) => setSiteInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nome de usuário/e-mail"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSave}>Salvar Senha</button>
          </div>

           <h2>Senhas Salvas</h2>

        {entries.length === 0 && <p>Nenhuma senha salva ainda.</p>}

        {entries.map((entry) => (
          <div key={entry.id}>
            <strong>{entry.site}</strong>
            {entry.username && <span> - {entry.username}</span>}
            <p>{entry.password}</p>
            <button onClick={() => handleDelete(entry.id)}>Apagar</button>
          </div>
        ))}
      </div>
    )}
  </div> 
  );
}

export default App;

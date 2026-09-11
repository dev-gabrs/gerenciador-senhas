import { useState } from "react";
import { deriveKey, encryptText, randomSaltBase64 } from "./crypto";

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
        </div>
      )}
    </div>
  );
}

export default App;

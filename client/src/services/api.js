const BASE_URL = "http://localhost:3030";

async function request(method, url, body) {
  const options = {
    method,
    credentials: "include",
    headers: {}
  };

  if (body && !(body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    options.body = body;
  }

  const response = await fetch(`${BASE_URL}${url}`, options);

  // Se falhar, tentar extrair erro
  let data;
  try {
    data = await response.json();
  } catch {
    data = { erro: "Erro desconhecido" };
  }

  if (!response.ok) throw data;
  return data;
}

const api = {
  get: (url) => request("GET", url),
  post: (url, body) => request("POST", url, body),
  put: (url, body) => request("PUT", url, body),
  delete: (url) => request("DELETE", url)
};

export default api;

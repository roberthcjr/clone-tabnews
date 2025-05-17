import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAt = "Carregando...";

  if (!isLoading && data)
    updatedAt = new Date(data.updated_at).toLocaleString("pt-BR");

  return <div>Última atualização: {updatedAt}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let databaseStatus = "Carregando...";

  if (!isLoading && data) databaseStatus = data.dependencies.database;

  return (
    <>
      <DatabaseInfo
        text="Versão"
        value={databaseStatus.version ?? databaseStatus}
      />
      <DatabaseInfo
        text="Número máximo de conexões"
        value={databaseStatus.max_connections ?? databaseStatus}
      />
      <DatabaseInfo
        text="Conexões Ativas"
        value={databaseStatus.active_connections ?? databaseStatus}
      />
    </>
  );
}

function DatabaseInfo(props) {
  return <div>{`${props.text}:${props.value}`}</div>;
}

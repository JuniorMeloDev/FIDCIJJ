"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatBRLNumber, formatDate } from "@/app/utils/formatters";
import DashboardFiltros from "@/app/components/DashboardFiltros";
import RelatorioModal from "@/app/components/RelatorioModal";

const API_URL = "http://localhost:8080/api";

function DashboardPage() {
  const [saldos, setSaldos] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [tiposOperacao, setTiposOperacao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dataInicio: "",
    dataFim: "",
    tipoOperacaoId: "",
    clienteId: "",
    clienteNome: "",
    sacado: "",
  });
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);

  const fetchApiData = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error(`Erro ao buscar em ${url}:`, err);
      return [];
    }
  };

  const fetchClientes = (query) =>
    fetchApiData(`${API_URL}/cadastros/clientes/search?nome=${query}`);
  const fetchSacados = (query) =>
    fetchApiData(`${API_URL}/cadastros/sacados/search?nome=${query}`);

  useEffect(() => {
    const fetchTipos = async () => {
      const data = await fetchApiData(`${API_URL}/cadastros/tipos-operacao`);
      setTiposOperacao(data);
    };
    fetchTipos();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const metricParams = new URLSearchParams();
        if (filters.dataInicio)
          metricParams.append("dataInicio", filters.dataInicio);
        if (filters.dataFim) metricParams.append("dataFim", filters.dataFim);
        if (filters.tipoOperacaoId)
          metricParams.append("tipoOperacaoId", filters.tipoOperacaoId);
        if (filters.clienteId)
          metricParams.append("clienteId", filters.clienteId);
        if (filters.sacado) metricParams.append("sacado", filters.sacado);

        const [saldosRes, metricsRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/saldos`),
          fetch(`${API_URL}/dashboard/metrics?${metricParams.toString()}`),
        ]);

        if (!saldosRes.ok || !metricsRes.ok)
          throw new Error("Falha ao buscar os dados do dashboard.");

        setSaldos(await saldosRes.json());
        setMetrics(await metricsRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "clienteNome" && value === "") {
      setFilters((prev) => ({ ...prev, clienteId: "", clienteNome: "" }));
    } else if (name === "sacado" && value === "") {
      setFilters((prev) => ({ ...prev, sacado: "" }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAutocompleteSelect = (name, item) => {
    if (name === "cliente") {
      setFilters((prev) => ({
        ...prev,
        clienteId: item?.id || "",
        clienteNome: item?.nome || "",
      }));
    } else if (name === "sacado") {
      setFilters((prev) => ({
        ...prev,
        sacado: item?.nome || "",
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      dataInicio: "",
      dataFim: "",
      tipoOperacaoId: "",
      clienteId: "",
      clienteNome: "",
      sacado: "",
    });
  };

  const totalGeral = saldos.reduce((acc, conta) => acc + conta.saldo, 0);
  const totalOperadoTitle =
    filters.dataInicio || filters.dataFim
      ? "Total Operado no Período"
      : "Total Operado no Mês";

  return (
    <main className="bg-blue-50 min-h-full">
        <RelatorioModal
            isOpen={isRelatorioModalOpen}
            onClose={() => setIsRelatorioModalOpen(false)}
            tiposOperacao={tiposOperacao}
            fetchClientes={fetchClientes}
            fetchSacados={fetchSacados}
        />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6 border-b pb-3 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Visão geral da sua operação financeira.
            </p>
          </div>
          <button
            onClick={() => setIsRelatorioModalOpen(true)}
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700"
          >
            Imprimir Relatórios
          </button>
        </header>

        <DashboardFiltros
          filters={filters}
          onFilterChange={handleFilterChange}
          onAutocompleteSelect={handleAutocompleteSelect}
          tiposOperacao={tiposOperacao}
          fetchClientes={fetchClientes}
          fetchSacados={fetchSacados}
          onClear={clearFilters}
        />

        {error && <div className="text-center p-10 text-red-500">{error}</div>}
        {loading && !metrics && (
          <div className="text-center p-10">Carregando dashboard...</div>
        )}

        {!error && !loading && metrics && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                Saldos Bancários
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {saldos.map((conta) => (
                  <div
                    key={conta.contaBancaria}
                    className="bg-white p-4 rounded-lg shadow-lg flex flex-col justify-between"
                  >
                    <h3 className="text-sm font-semibold text-gray-500 truncate">
                      {conta.contaBancaria}
                    </h3>
                    <p
                      className={`$${
                        conta.saldo < 0 ? "text-red-600" : "text-gray-800"
                      } text-2xl font-bold mt-1`}
                    >
                      {formatBRLNumber(conta.saldo)}
                    </p>
                  </div>
                ))}
                <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-blue-100">
                    Total Geral
                  </h3>
                  <p className="text-2xl font-bold mt-1">
                    {formatBRLNumber(totalGeral)}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <h3 className="text-sm font-semibold text-blue-500">
                    {totalOperadoTitle}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {formatBRLNumber(metrics?.valorOperadoNoMes || 0)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Vencimentos Próximos (30 dias)
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {metrics?.vencimentosProximos?.length > 0 ? (
                      [...metrics.vencimentosProximos]
                        .sort(
                          (a, b) =>
                            new Date(a.dataVencimento) -
                            new Date(b.dataVencimento)
                        )
                        .map((dup) => (
                          <div
                            key={dup.id}
                            className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0"
                          >
                            <div>
                              <p className="font-semibold text-gray-700">
                                {dup.clienteSacado}
                              </p>
                              <p className="text-xs text-gray-500">
                                NF {dup.nfCte}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="font-bold text-red-600">
                                {formatDate(dup.dataVencimento)}
                              </p>
                              <p className="text-gray-600">
                                {formatBRLNumber(dup.valorBruto)}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500 mt-4">
                        Nenhuma duplicata a vencer nos próximos 30 dias.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:col-span-2">
                {["topClientes", "topSacados"].map((key) => (
                  <div key={key} className="bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">
                      {key === "topClientes"
                        ? "Top 5 Cedentes por Valor"
                        : "Top 5 Sacados por Valor"}
                    </h3>
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={metrics?.[key] || []}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            tickFormatter={(value) => `R$${value / 1000}k`}
                          />
                          <YAxis
                            dataKey="nome"
                            type="category"
                            width={100}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(value) => formatBRLNumber(value)}
                            cursor={{ fill: "#f3f4f6" }}
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #ccc",
                            }}
                          />
                          <Bar
                            dataKey="valorTotal"
                            name="Valor Operado"
                            fill="#3b82f6"
                            barSize={25}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default DashboardPage;
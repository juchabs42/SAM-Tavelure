const STAGE_DEFINITIONS = [
  {
    id: 1,
    shortLabel: "Aucune différenciation visible",
    technicalLabel: "Pseudothèces sans différenciation",
    date: "2026-02-10"
  },
  {
    id: 2,
    shortLabel: "Les futures structures commencent à se former",
    technicalLabel: "Pseudothèce avec asques en voie de différenciation",
    date: "2026-02-18"
  },
  {
    id: 3,
    shortLabel: "Les sacs contenant les spores sont formés",
    technicalLabel: "Pseudothèce avec asques différenciés",
    date: "2026-02-26"
  },
  {
    id: 4,
    shortLabel: "Les spores sont visibles mais encore claires",
    technicalLabel: "Pseudothèce avec ascospores claires",
    date: "2026-03-03"
  },
  {
    id: 5,
    shortLabel: "Début de coloration des spores",
    technicalLabel: "Pseudothèce avec 1 à 15 asques contenant des ascospores colorées",
    date: "2026-03-08"
  },
  {
    id: 6,
    shortLabel: "Maturation bien engagée",
    technicalLabel: "Pseudothèce avec 16 à 50 asques contenant des ascospores colorées",
    date: "2026-03-11"
  },
  {
    id: 7,
    shortLabel: "Spores prêtes à être projetées",
    technicalLabel: "Pseudothèce avec plus de 50 asques contenant des ascospores colorées",
    date: "2026-03-14"
  }
];

const MONITORING = {
  seasonClosed: true,
  closedOn: "2026-06-18"
};

const SPORE_RECORDS = [
  { episode: "Épisode 1", start: "2026-03-14T00:00", end: "2026-03-14T03:00", rain: 1.8, spores: 4, status: "Validé", countingDone: true },
  { episode: "Épisode 1", start: "2026-03-14T03:00", end: "2026-03-14T06:00", rain: 2.2, spores: 7, status: "Validé", countingDone: true },
  { episode: "Épisode 1", start: "2026-03-14T06:00", end: "2026-03-14T09:00", rain: 0.8, spores: 2, status: "Validé", countingDone: true },

  { episode: "Épisode 2", start: "2026-03-23T09:00", end: "2026-03-23T12:00", rain: 3.6, spores: 15, status: "Validé", countingDone: true },
  { episode: "Épisode 2", start: "2026-03-23T12:00", end: "2026-03-23T15:00", rain: 4.4, spores: 26, status: "Validé", countingDone: true },
  { episode: "Épisode 2", start: "2026-03-23T15:00", end: "2026-03-23T18:00", rain: 1.7, spores: 11, status: "Validé", countingDone: true },

  { episode: "Épisode 3", start: "2026-04-05T00:00", end: "2026-04-05T03:00", rain: 2.9, spores: 0, status: "Pas de contamination", countingDone: true },
  { episode: "Épisode 3", start: "2026-04-05T03:00", end: "2026-04-05T06:00", rain: 3.5, spores: 0, status: "Pas de contamination", countingDone: true },
  { episode: "Épisode 3", start: "2026-04-05T06:00", end: "2026-04-05T09:00", rain: 1.2, spores: 0, status: "Pas de contamination", countingDone: true },

  { episode: "Épisode 4", start: "2026-04-18T18:00", end: "2026-04-18T21:00", rain: 5.4, spores: 32, status: "Validé", countingDone: true },
  { episode: "Épisode 4", start: "2026-04-18T21:00", end: "2026-04-19T00:00", rain: 6.0, spores: 44, status: "Validé", countingDone: true },
  { episode: "Épisode 4", start: "2026-04-19T00:00", end: "2026-04-19T03:00", rain: 2.1, spores: 19, status: "Validé", countingDone: true },

  { episode: "Épisode 5", start: "2026-05-02T03:00", end: "2026-05-02T06:00", rain: 1.3, spores: 8, status: "Validé", countingDone: true },
  { episode: "Épisode 5", start: "2026-05-02T06:00", end: "2026-05-02T09:00", rain: 1.5, spores: 12, status: "Validé", countingDone: true },
  { episode: "Épisode 5", start: "2026-05-02T09:00", end: "2026-05-02T12:00", rain: 0.6, spores: 5, status: "Validé", countingDone: true },

  { episode: "Épisode 6", start: "2026-05-21T12:00", end: "2026-05-21T15:00", rain: 4.2, spores: 18, status: "Validé", countingDone: true },
  { episode: "Épisode 6", start: "2026-05-21T15:00", end: "2026-05-21T18:00", rain: 4.8, spores: 23, status: "Validé", countingDone: true },
  { episode: "Épisode 6", start: "2026-05-21T18:00", end: "2026-05-21T21:00", rain: 1.7, spores: 6, status: "Validé", countingDone: true },

  { episode: "Épisode 7", start: "2026-06-10T00:00", end: "2026-06-10T03:00", rain: 3.1, spores: 0, status: "En cours", countingDone: false },
  { episode: "Épisode 7", start: "2026-06-10T03:00", end: "2026-06-10T06:00", rain: 2.4, spores: 0, status: "En cours", countingDone: false }
];

const formatDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR");
const formatDateTime = (value) => new Date(value).toLocaleString("fr-FR", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
});
const formatNumber = (value) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value);

const chartBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 18 } },
    tooltip: { intersect: false, mode: "index" }
  },
  scales: {
    x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } }
  }
};

let sporeChart;
let displayedRows = [];

function getBiofixDate() {
  const stage7 = STAGE_DEFINITIONS.find((stage) => stage.id === 7 && stage.date);
  return stage7 ? stage7.date : null;
}

function getLatestObservedStage() {
  const observed = STAGE_DEFINITIONS.filter((stage) => !!stage.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return observed.at(-1) || null;
}

function getStatusBadge(status) {
  if (status === "Validé") return `<span class="badge badge-valid">Validé</span>`;
  if (status === "En cours") return `<span class="badge badge-pending">En cours</span>`;
  return `<span class="badge badge-none">Pas de contamination</span>`;
}

function getCompletionBadge(done) {
  return done
    ? `<span class="badge badge-done">Terminé</span>`
    : `<span class="badge badge-open">Non terminé</span>`;
}

function fillSummaryCards() {
  const biofix = getBiofixDate();
  const lastStage = getLatestObservedStage();
  const lastRecord = [...SPORE_RECORDS].sort((a, b) => new Date(a.start) - new Date(b.start)).at(-1);

  document.getElementById("biofixValue").textContent = biofix ? formatDate(biofix) : "Non défini";
  document.getElementById("latestStageValue").textContent = lastStage ? `Stade ${lastStage.id}` : "Aucun";
  document.getElementById("latestStageMeta").textContent = lastStage
    ? `${lastStage.shortLabel} — observé le ${formatDate(lastStage.date)}`
    : "Aucune date renseignée";

  document.getElementById("lastCountValue").textContent = lastRecord
    ? `${formatNumber(lastRecord.spores)} spores`
    : "—";
  document.getElementById("lastCountMeta").textContent = lastRecord
    ? `${lastRecord.episode} · ${formatDateTime(lastRecord.start)} à ${new Date(lastRecord.end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
    : "—";

  document.getElementById("seasonStatusValue").textContent = MONITORING.seasonClosed ? "Terminé" : "En cours";
  document.getElementById("seasonStatusMeta").textContent = MONITORING.seasonClosed
    ? `Fin du suivi indiquée le ${formatDate(MONITORING.closedOn)}`
    : "La saison de projection est encore en cours";
}

function renderStageTable() {
  const body = document.getElementById("stageTableBody");
  body.innerHTML = STAGE_DEFINITIONS.map((stage) => `
    <tr>
      <td><strong>Stade ${stage.id}</strong></td>
      <td>${stage.shortLabel}</td>
      <td>${stage.technicalLabel}</td>
      <td>${stage.date ? formatDate(stage.date) : "—"}</td>
    </tr>
  `).join("");
}

function floorToBucket(date, bucketHours) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  const hour = d.getHours();
  d.setHours(Math.floor(hour / bucketHours) * bucketHours);
  return d;
}

function isoDateOnly(dateTime) {
  return dateTime.slice(0, 10);
}

function parseFilters() {
  return {
    mode: document.getElementById("displayModeSelect").value,
    bucketHours: Number(document.getElementById("bucketHoursSelect").value),
    startDate: document.getElementById("startDateInput").value,
    endDate: document.getElementById("endDateInput").value
  };
}

function filterRecords() {
  const biofix = getBiofixDate();
  if (!biofix) return [];
  const { startDate, endDate } = parseFilters();
  const effectiveStart = startDate || biofix;

  return SPORE_RECORDS
    .filter((record) => isoDateOnly(record.start) >= biofix)
    .filter((record) => isoDateOnly(record.start) >= effectiveStart)
    .filter((record) => !endDate || isoDateOnly(record.start) <= endDate)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
}

function aggregateTimeSlots(records, bucketHours) {
  const grouped = new Map();

  records.forEach((record) => {
    const bucketStart = floorToBucket(record.start, bucketHours);
    const key = bucketStart.toISOString();

    if (!grouped.has(key)) {
      const bucketEnd = new Date(bucketStart.getTime() + bucketHours * 3600000);
      grouped.set(key, {
        label: `${formatDateTime(bucketStart.toISOString())} → ${bucketEnd.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
        rain: 0,
        spores: 0,
        statuses: [],
        countingDoneFlags: [],
        start: bucketStart.toISOString(),
        end: bucketEnd.toISOString()
      });
    }

    const item = grouped.get(key);
    item.rain += Number(record.rain) || 0;
    item.spores += Number(record.spores) || 0;
    item.statuses.push(record.status);
    item.countingDoneFlags.push(record.countingDone);
  });

  return [...grouped.values()].map((item) => ({
    category: item.label,
    rain: Number(item.rain.toFixed(1)),
    spores: item.spores,
    status: deriveStatus(item.statuses, item.spores),
    countingDone: item.countingDoneFlags.every(Boolean),
    exportStart: item.start,
    exportEnd: item.end
  }));
}

function aggregateEpisodes(records) {
  const grouped = new Map();

  records.forEach((record) => {
    if (!grouped.has(record.episode)) {
      grouped.set(record.episode, {
        episode: record.episode,
        rain: 0,
        spores: 0,
        statuses: [],
        countingDoneFlags: [],
        starts: [],
        ends: []
      });
    }

    const item = grouped.get(record.episode);
    item.rain += Number(record.rain) || 0;
    item.spores += Number(record.spores) || 0;
    item.statuses.push(record.status);
    item.countingDoneFlags.push(record.countingDone);
    item.starts.push(record.start);
    item.ends.push(record.end);
  });

  return [...grouped.values()].map((item) => {
    item.starts.sort();
    item.ends.sort();
    return {
      category: `${item.episode} · ${formatDate(item.starts[0].slice(0, 10))}`,
      rain: Number(item.rain.toFixed(1)),
      spores: item.spores,
      status: deriveStatus(item.statuses, item.spores),
      countingDone: item.countingDoneFlags.every(Boolean),
      exportStart: item.starts[0],
      exportEnd: item.ends.at(-1),
      episode: item.episode
    };
  });
}

function deriveStatus(statuses, sporesTotal) {
  if (statuses.includes("En cours")) return "En cours";
  if (sporesTotal === 0) return "Pas de contamination";
  return "Validé";
}

function getDisplayedRows() {
  const filters = parseFilters();
  const records = filterRecords();
  return filters.mode === "episode"
    ? aggregateEpisodes(records)
    : aggregateTimeSlots(records, filters.bucketHours);
}

function buildChart() {
  const biofix = getBiofixDate();
  const warning = document.getElementById("biofixWarning");
  const canvas = document.getElementById("sporeChart");

  if (!biofix) {
    warning.classList.remove("hidden");
    if (sporeChart) sporeChart.destroy();
    return;
  }

  warning.classList.add("hidden");
  displayedRows = getDisplayedRows();

  if (sporeChart) sporeChart.destroy();

  sporeChart = new Chart(canvas, {
    data: {
      labels: displayedRows.map((row) => row.category),
      datasets: [
        {
          type: "bar",
          label: "Pluviométrie (mm)",
          data: displayedRows.map((row) => row.rain),
          backgroundColor: "rgba(43, 121, 194, 0.75)",
          borderColor: "#2b79c2",
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: "yRain"
        },
        {
          type: "line",
          label: "Spores observées",
          data: displayedRows.map((row) => row.spores),
          borderColor: "#cf1e2e",
          backgroundColor: "#cf1e2e",
          tension: 0.25,
          pointRadius: 3,
          yAxisID: "ySpores"
        }
      ]
    },
    options: {
      ...chartBaseOptions,
      scales: {
        x: chartBaseOptions.scales.x,
        yRain: {
          beginAtZero: true,
          position: "left",
          title: { display: true, text: "Pluie (mm)" },
          grid: { color: "rgba(102, 113, 124, 0.13)" }
        },
        ySpores: {
          beginAtZero: true,
          position: "right",
          title: { display: true, text: "Nombre de spores" },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function renderGraphTable() {
  const filters = parseFilters();
  document.getElementById("historyCol1").textContent = filters.mode === "episode" ? "Épisode" : "Tranche / période";

  const body = document.getElementById("graphTableBody");
  body.innerHTML = displayedRows.length
    ? displayedRows.map((row) => `
      <tr>
        <td>${row.category}</td>
        <td>${formatNumber(row.rain)}</td>
        <td>${formatNumber(row.spores)}</td>
        <td>${getStatusBadge(row.status)}</td>
        <td>${getCompletionBadge(row.countingDone)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5">Aucune donnée sur la période sélectionnée.</td></tr>`;
}

function exportDisplayedRows() {
  if (!displayedRows.length) return;
  const filters = parseFilters();
  const header = filters.mode === "episode"
    ? ["episode_ou_periode", "debut", "fin", "pluie_mm", "spores", "statut", "comptage_termine"]
    : ["tranche_ou_periode", "debut", "fin", "pluie_mm", "spores", "statut", "comptage_termine"];

  const rows = displayedRows.map((row) => [
    row.category,
    row.exportStart,
    row.exportEnd,
    String(row.rain).replace(".", ","),
    String(row.spores).replace(".", ","),
    row.status,
    row.countingDone ? "oui" : "non"
  ]);

  const csvContent = [header, ...rows]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sam-tavelure-${filters.mode}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function initFilters() {
  const biofix = getBiofixDate();
  const lastDate = [...SPORE_RECORDS].sort((a, b) => new Date(a.start) - new Date(b.start)).at(-1)?.start.slice(0, 10) || "";

  document.getElementById("startDateInput").value = biofix || "";
  document.getElementById("endDateInput").value = lastDate;

  document.getElementById("displayModeSelect").addEventListener("change", refreshTavelureView);
  document.getElementById("bucketHoursSelect").addEventListener("change", refreshTavelureView);
  document.getElementById("startDateInput").addEventListener("change", refreshTavelureView);
  document.getElementById("endDateInput").addEventListener("change", refreshTavelureView);

  document.getElementById("resetFiltersButton").addEventListener("click", () => {
    document.getElementById("displayModeSelect").value = "timeslot";
    document.getElementById("bucketHoursSelect").value = "3";
    document.getElementById("startDateInput").value = biofix || "";
    document.getElementById("endDateInput").value = lastDate;
    refreshTavelureView();
  });

  document.getElementById("exportGraphButton").addEventListener("click", exportDisplayedRows);
}

function refreshTavelureView() {
  buildChart();
  renderGraphTable();
}

document.addEventListener("DOMContentLoaded", () => {
  fillSummaryCards();
  renderStageTable();
  initFilters();
  refreshTavelureView();
});

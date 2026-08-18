const STAGE_DEFINITIONS = [
  { id: 1, simple: "Aucune différenciation visible", technical: "Pseudothèces sans différenciation" },
  { id: 2, simple: "Les futures structures commencent à se former", technical: "Pseudothèce avec asques en voie de différenciation" },
  { id: 3, simple: "Les sacs contenant les spores sont formés", technical: "Pseudothèce avec asques différenciés" },
  { id: 4, simple: "Les spores sont visibles mais encore claires", technical: "Pseudothèce avec ascospores claires" },
  { id: 5, simple: "Début de coloration des spores", technical: "Pseudothèce avec 1 à 15 asques contenant des ascospores colorées" },
  { id: 6, simple: "Maturation bien engagée", technical: "Pseudothèce avec 16 à 50 asques contenant des ascospores colorées" },
  { id: 7, simple: "Spores prêtes à être projetées", technical: "Pseudothèce avec plus de 50 asques contenant des ascospores colorées" }
];

const CONFIG = window.SAM_CONFIG || {};
let supabaseClient = null;
let currentUser = null;
let stageDates = new Map();
let records = [];
let monitoring = { suivi_termine: false, date_fin: null };
let chart = null;
let deferredInstallPrompt = null;
const INSTALL_STORAGE_KEY = "samTavelureInstalled";


const byId = (id) => document.getElementById(id);
const formatDate = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR") : "";
const formatDateTime = (date, time) => {
  if (!date) return "";

  const dateParts = String(date).slice(0, 10).split("-");
  if (dateParts.length !== 3) return "";

  const [year, month, day] = dateParts;
  const cleanTime = String(time || "00:00").slice(0, 5);

  return `${day}/${month}/${year} à ${cleanTime}`;
};
const formatNumber = (value) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value);

function isConfigured() {
  return Boolean(
    CONFIG.supabaseUrl &&
    CONFIG.supabaseAnonKey &&
    !CONFIG.supabaseUrl.includes("VOTRE_") &&
    !CONFIG.supabaseAnonKey.includes("VOTRE_")
  );
}

function showDatabaseWarning(message) {
  byId("databaseWarning").textContent = message;
  byId("databaseWarning").classList.remove("hidden");
}

function hideDatabaseWarning() {
  byId("databaseWarning").classList.add("hidden");
}

function getJ0() {
  return stageDates.get(7) || null;
}

function statusBadge(status) {
  if (status === "Validé") return '<span class="badge badge-valid">Validé</span>';
  return '<span class="badge badge-none">Pas de contamination</span>';
}

function renderAuth() {
  byId("loginForm").classList.toggle("hidden", Boolean(currentUser));
  byId("connectedBlock").classList.toggle("hidden", !currentUser);
  document.querySelectorAll(".admin-only").forEach((element) => {
    element.classList.toggle("hidden", !currentUser);
  });

  if (currentUser) {
    byId("connectedEmail").textContent = currentUser.email || "Utilisateur connecté";
  } else {
    byId("connectedEmail").textContent = "";
  }

  renderStages();
}

function renderStages() {
  const body = byId("stageTableBody");
  body.innerHTML = STAGE_DEFINITIONS.map((stage) => {
    const date = stageDates.get(stage.id) || "";
    const dateCell = currentUser
      ? `<input class="stage-date-input" type="date" data-stage-id="${stage.id}" value="${date}">`
      : `<span class="empty-date">${date ? formatDate(date) : ""}</span>`;

    return `
      <tr>
        <td data-label="Stade"><strong>Stade ${stage.id}</strong></td>
        <td data-label="Lecture simplifiée">${stage.simple}</td>
        <td data-label="Formulation technique">${stage.technical}</td>
        <td data-label="Date observée">${dateCell}</td>
      </tr>`;
  }).join("");
}

async function loadStages() {
  stageDates = new Map();
  if (!supabaseClient) {
    renderStages();
    return;
  }

  const { data, error } = await supabaseClient
    .from(CONFIG.stagesTable || "tavelure_peritheces")
    .select("stade,date_obs")
    .order("stade", { ascending: true });

  if (error) {
    console.error(error);
    showDatabaseWarning("Impossible de charger les dates des périthèces depuis Supabase.");
    renderStages();
    return;
  }

  (data || []).forEach((row) => {
    if (row.date_obs) stageDates.set(Number(row.stade), row.date_obs);
  });
  renderStages();
}

async function saveStages() {
  if (!supabaseClient || !currentUser) return;
  const button = byId("saveStagesButton");
  const message = byId("stageMessage");
  button.disabled = true;
  message.textContent = "Enregistrement…";

  const payload = [...document.querySelectorAll(".stage-date-input")].map((input) => ({
    stade: Number(input.dataset.stageId),
    date_obs: input.value || null
  }));

  const { error } = await supabaseClient
    .from(CONFIG.stagesTable || "tavelure_peritheces")
    .upsert(payload, { onConflict: "stade" });

  button.disabled = false;
  if (error) {
    console.error(error);
    message.textContent = `Enregistrement impossible : ${error.message}`;
    return;
  }

  message.textContent = "Dates enregistrées.";
  await loadStages();
  resetFilters();
}

async function loadRecords() {
  records = [];
  if (!supabaseClient) {
    refreshDataViews();
    return;
  }

  const { data, error } = await supabaseClient
    .from(CONFIG.countsTable || "tavelure_comptages")
    .select("*")
    .order("date_obs", { ascending: true })
    .order("heure_obs", { ascending: true });

  if (error) {
    console.error(error);
    showDatabaseWarning("Impossible de charger les épisodes de tavelure depuis Supabase.");
    refreshDataViews();
    return;
  }

  records = data || [];
  refreshDataViews();
}

async function loadMonitoring() {
  monitoring = { suivi_termine: false, date_fin: null };
  if (!supabaseClient) {
    renderMonitoring();
    return;
  }

  const { data, error } = await supabaseClient
    .from(CONFIG.settingsTable || "tavelure_parametres")
    .select("suivi_termine,date_fin")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error(error);
    renderMonitoring();
    return;
  }

  if (data) monitoring = data;
  renderMonitoring();
}

function renderMonitoring() {
  const badge = byId("monitoringStatusBadge");
  badge.textContent = monitoring.suivi_termine
    ? `Suivi terminé${monitoring.date_fin ? ` · ${formatDate(monitoring.date_fin)}` : ""}`
    : "Suivi en cours";
  badge.classList.toggle("closed", Boolean(monitoring.suivi_termine));

  if (currentUser) {
    byId("monitoringClosedInput").checked = Boolean(monitoring.suivi_termine);
    byId("monitoringEndDateInput").value = monitoring.date_fin || "";
  }
}

async function saveMonitoring() {
  if (!supabaseClient || !currentUser) return;
  const message = byId("monitoringMessage");
  message.textContent = "Enregistrement…";

  const payload = {
    id: 1,
    suivi_termine: byId("monitoringClosedInput").checked,
    date_fin: byId("monitoringEndDateInput").value || null
  };

  const { error } = await supabaseClient
    .from(CONFIG.settingsTable || "tavelure_parametres")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error(error);
    message.textContent = `Enregistrement impossible : ${error.message}`;
    return;
  }

  message.textContent = "État du suivi enregistré.";
  await loadMonitoring();
}

function filteredRecords() {
  const j0 = getJ0();
  const start = byId("startDateInput").value || j0 || "";
  const end = byId("endDateInput").value || "";

  return records
    .filter((row) => !j0 || row.date_obs >= j0)
    .filter((row) => !start || row.date_obs >= start)
    .filter((row) => !end || row.date_obs <= end)
    .sort((a, b) => `${a.date_obs}T${a.heure_obs || "00:00"}`.localeCompare(`${b.date_obs}T${b.heure_obs || "00:00"}`));
}

function drawChart() {
  const j0 = getJ0();
  const rows = filteredRecords();
  const warning = byId("j0Warning");
  const empty = byId("emptyGraphMessage");
  const canvas = byId("sporeChart");

  warning.classList.toggle("hidden", Boolean(j0));
  empty.classList.toggle("hidden", !j0 || rows.length > 0);
  canvas.classList.toggle("hidden", !j0 || rows.length === 0);

  if (chart) {
    chart.destroy();
    chart = null;
  }
  if (!j0 || !rows.length) return;

  chart = new Chart(canvas, {
    data: {
      labels: rows.map((row) => `${row.episode} · ${formatDate(row.date_obs)}`),
      datasets: [
        {
          type: "bar",
          label: "Pluviométrie (mm)",
          data: rows.map((row) => Number(row.pluie_mm) || 0),
          backgroundColor: "rgba(43, 121, 194, 0.75)",
          borderColor: "#2b79c2",
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: "yRain"
        },
        {
          type: "line",
          label: "Spores observées",
          data: rows.map((row) => row.spores === null || row.spores === undefined ? null : Number(row.spores)),
          borderColor: "#cf1e2e",
          backgroundColor: "#cf1e2e",
          tension: 0.25,
          pointRadius: window.innerWidth <= 720 ? 3 : 4,
          spanGaps: false,
          yAxisID: "ySpores"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: window.innerWidth <= 720 ? 10 : 18, font: { size: window.innerWidth <= 720 ? 10 : 12 } } },
        tooltip: { intersect: false, mode: "index" }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: window.innerWidth <= 720 ? 5 : 12, font: { size: window.innerWidth <= 720 ? 10 : 12 } } },
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

function renderHistory() {
  const rows = filteredRecords();
  const body = byId("historyTableBody");
  const columnCount = currentUser ? 6 : 5;

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="${columnCount}">Aucune donnée enregistrée.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map((row) => `
    <tr>
      <td data-label="Épisode"><strong>${row.episode}</strong></td>
      <td data-label="Date / heure">${formatDateTime(row.date_obs, row.heure_obs)}</td>
      <td data-label="Pluie">${formatNumber(Number(row.pluie_mm) || 0)} mm</td>
      <td data-label="Spores">${row.spores === null || row.spores === undefined ? "" : formatNumber(Number(row.spores))}</td>
      <td data-label="Statut">${statusBadge(row.statut)}</td>
      ${currentUser ? `<td data-label="Action"><button class="delete-count-button" type="button" data-delete-count-id="${row.id}">Supprimer</button></td>` : ""}
    </tr>`).join("");
}

function refreshDataViews() {
  drawChart();
  renderHistory();
}

function resetFilters() {
  const j0 = getJ0();
  const lastDate = [...records].sort((a, b) => a.date_obs.localeCompare(b.date_obs)).at(-1)?.date_obs || "";
  byId("startDateInput").value = j0 || "";
  byId("endDateInput").value = lastDate;
  refreshDataViews();
}

function exportCsv() {
  const rows = filteredRecords();
  if (!rows.length) return;

  const header = ["episode", "date", "heure", "pluie_mm", "spores", "statut"];
  const values = rows.map((row) => [
    row.episode,
    row.date_obs,
    row.heure_obs,
    String(row.pluie_mm ?? "").replace(".", ","),
    row.spores ?? "",
    row.statut
  ]);

  const csv = [header, ...values]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sam-tavelure-episodes.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function login(event) {
  event.preventDefault();
  if (!supabaseClient) {
    byId("loginMessage").textContent = "Supabase n’est pas configuré.";
    return;
  }

  byId("loginMessage").textContent = "Connexion…";
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: byId("loginEmail").value.trim(),
    password: byId("loginPassword").value
  });

  if (error) {
    byId("loginMessage").textContent = "Adresse mail ou mot de passe incorrect.";
    return;
  }

  byId("loginMessage").textContent = "";
  byId("loginPassword").value = "";
  closeMobileAuthCard();
}

async function logout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  closeMobileAuthCard();
}

async function addEpisode(event) {
  event.preventDefault();
  if (!supabaseClient || !currentUser) return;

  const message = byId("episodeMessage");
  message.textContent = "Enregistrement…";
  const sporesRaw = byId("entrySpores").value;

  const payload = {
    episode: byId("entryEpisode").value.trim(),
    date_obs: byId("entryDate").value,
    heure_obs: byId("entryTime").value,
    pluie_mm: Number(byId("entryRain").value),
    spores: sporesRaw === "" ? null : Number(sporesRaw),
    statut: byId("entryStatus").value,
    comptage_termine: true
  };

  const { error } = await supabaseClient
    .from(CONFIG.countsTable || "tavelure_comptages")
    .insert(payload);

  if (error) {
    console.error(error);
    message.textContent = `Enregistrement impossible : ${error.message}`;
    return;
  }

  message.textContent = "Épisode enregistré.";
  byId("episodeForm").reset();
  await loadRecords();
  resetFilters();
}

async function deleteCount(id) {
  if (!supabaseClient || !currentUser || !id) return;

  const row = records.find((item) => String(item.id) === String(id));
  const label = row ? `${row.episode} du ${formatDate(row.date_obs)}` : "ce comptage";

  if (!window.confirm(`Supprimer ${label} ? Cette action est définitive.`)) return;

  const { error } = await supabaseClient
    .from(CONFIG.countsTable || "tavelure_comptages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    window.alert(`Suppression impossible : ${error.message}`);
    return;
  }

  await loadRecords();
  resetFilters();
}

function handleHistoryClick(event) {
  const button = event.target.closest("[data-delete-count-id]");
  if (!button) return;
  deleteCount(button.dataset.deleteCountId);
}

async function handleAuthState() {
  if (!supabaseClient) {
    currentUser = null;
    renderAuth();
    return;
  }
  const { data } = await supabaseClient.auth.getSession();
  currentUser = data.session?.user || null;
  renderAuth();
  renderMonitoring();
  renderHistory();
}


function toggleMobileAuthCard() {
  const card = byId("authCard");
  const button = byId("authToggleButton");
  if (!card || !button || window.innerWidth > 720) return;
  const open = card.classList.toggle("open");
  button.setAttribute("aria-expanded", String(open));
}

function closeMobileAuthCard() {
  const card = byId("authCard");
  const button = byId("authToggleButton");
  if (!card || !button || window.innerWidth > 720) return;
  card.classList.remove("open");
  button.setAttribute("aria-expanded", "false");
}

function isAppMarkedInstalled() {
  return window.localStorage.getItem(INSTALL_STORAGE_KEY) === "1";
}

function markAppInstalled() {
  window.localStorage.setItem(INSTALL_STORAGE_KEY, "1");
}


function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isMobileDevice() {
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean") {
    return navigator.userAgentData.mobile;
  }

  const ua = navigator.userAgent || "";
  const mobileUa = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i.test(ua);
  const iPadDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return mobileUa || iPadDesktopMode;
}

function showInstallMessage(message) {
  const box = byId("installMessage");
  box.textContent = message;
  box.classList.remove("hidden");
  window.clearTimeout(showInstallMessage.timer);
  showInstallMessage.timer = window.setTimeout(() => box.classList.add("hidden"), 7000);
}

async function installApp() {
  if (isStandalone()) return;

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (result.outcome === "accepted") {
      markAppInstalled();
      byId("installCard").classList.add("hidden");
    }
    return;
  }

  if (isIOS()) {
    showInstallMessage("Sur iPhone/iPad : ouvre cette page dans Safari, touche Partager, puis « Sur l’écran d’accueil ».");
  } else {
    showInstallMessage("Si l’installation ne s’ouvre pas, utilise le menu du navigateur puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».");
  }
}

function initPWA() {
  const installCard = byId("installCard");
  const installButton = byId("installButton");
  const mobile = isMobileDevice();

  // Si la page est ouverte depuis l'application installée, on mémorise cet état
  // pour ne plus reproposer l'installation lors des ouvertures suivantes dans le navigateur.
  if (isStandalone()) {
    markAppInstalled();
  }

  const alreadyInstalled = isStandalone() || isAppMarkedInstalled();

  if (!mobile || alreadyInstalled) {
    installCard.classList.add("hidden");
  } else {
    installCard.classList.remove("hidden");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (mobile && !isStandalone() && !isAppMarkedInstalled()) {
      installCard.classList.remove("hidden");
      installButton.classList.remove("hidden");
    }
  });


  const standaloneMedia = window.matchMedia("(display-mode: standalone)");
  const handleDisplayModeChange = () => {
    if (isStandalone()) {
      markAppInstalled();
      installCard.classList.add("hidden");
    }
  };
  if (standaloneMedia.addEventListener) {
    standaloneMedia.addEventListener("change", handleDisplayModeChange);
  }

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    markAppInstalled();
    installCard.classList.add("hidden");
    showInstallMessage("SAM Tavelure est installée.");
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./service-worker.js");
        await registration.update();
      } catch (error) {
        console.error("Service worker non enregistré", error);
      }
    });
  }
}


function bindEvents() {
  byId("installButton").addEventListener("click", installApp);
  byId("authToggleButton").addEventListener("click", toggleMobileAuthCard);
  byId("loginForm").addEventListener("submit", login);
  byId("logoutButton").addEventListener("click", logout);
  byId("saveStagesButton").addEventListener("click", saveStages);
  byId("episodeForm").addEventListener("submit", addEpisode);
  byId("saveMonitoringButton").addEventListener("click", saveMonitoring);
  byId("startDateInput").addEventListener("change", refreshDataViews);
  byId("endDateInput").addEventListener("change", refreshDataViews);
  byId("resetFiltersButton").addEventListener("click", resetFilters);
  byId("exportGraphButton").addEventListener("click", exportCsv);
  byId("historyTableBody").addEventListener("click", handleHistoryClick);
}

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  initPWA();
  renderStages();

  if (!isConfigured()) {
    showDatabaseWarning("Supabase n’est pas encore configuré dans config.js. Aucune donnée fictive n’est affichée.");
    renderAuth();
    renderMonitoring();
    refreshDataViews();
    return;
  }

  if (!window.supabase) {
    showDatabaseWarning("La librairie Supabase n’a pas pu être chargée.");
    return;
  }

  supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    renderAuth();
    renderMonitoring();
  });

  await handleAuthState();
  await Promise.all([loadStages(), loadRecords(), loadMonitoring()]);
  resetFilters();
  hideDatabaseWarning();
});

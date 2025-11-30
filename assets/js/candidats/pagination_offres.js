(() => {
  // ===== CONFIG =====
  const OFFRES_PAR_PAGE = 6;
  const JSON_URL = "/assets/data/offres.json"; // depuis eureka/candidats/index.html

  // ===== STATE =====
  let offres = [];
  let offresFiltrees = [];
  let pageActuelle = 1;

  const secteurClassMap = {
    btp: "secteur-btp",
    admin: "secteur-admin",
    logistique: "secteur-logistique",
    proprete: "secteur-proprete",
    restauration: "secteur-restauration",
    sante: "secteur-sante"
  };

  // ===== DOM =====
  function qs(id) { return document.getElementById(id); }

  // ===== RENDER OFFRES (6 par page) =====
  function renderOffres() {
    const container = qs("offres-liste");
    if (!container) return;

    // 🔥 on écrase TOUJOURS tout ce qui existe (même si un autre script a injecté)
    container.innerHTML = "";

    if (!offresFiltrees.length) {
      container.innerHTML = "<p>Aucune offre ne correspond à vos critères.</p>";
      return;
    }

    const start = (pageActuelle - 1) * OFFRES_PAR_PAGE;
    const end = start + OFFRES_PAR_PAGE;
    const pageOffres = offresFiltrees.slice(start, end);

    pageOffres.forEach(offre => {
      const secteurClass = secteurClassMap[offre.secteur] || "";

      const card = document.createElement("article");
      card.className = "offre-carte";
      card.innerHTML = `
        <header class="offre-header">
          <h3 class="offre-titre">${offre.titre}</h3>
          <p class="offre-localisation">${offre.lieu}</p>
        </header>

        <p class="offre-meta">
          <span class="offre-secteur-badge ${secteurClass}">
            ${offre.secteurLabel}
          </span>
          <span class="offre-contrat">${offre.contrat.toUpperCase()}</span>
        </p>

        <p class="offre-extrait">${offre.extrait}</p>

        <div class="offre-footer">
          <span class="offre-reference">Réf. : ${offre.id}</span>
          <a href="#form-candidature" class="btn btn-outline btn-offre">Postuler</a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // ===== RENDER PAGINATION =====
  function renderPagination() {
    const nav = document.querySelector(".pagination");
    const prevBtn = qs("page-prev");
    const nextBtn = qs("page-next");
    const pagesContainer = qs("pagination-pages");

    if (!nav || !prevBtn || !nextBtn || !pagesContainer) {
      // si la pagination n'existe pas dans le HTML, on sort sans casser
      return;
    }

    const totalPages = Math.ceil(offresFiltrees.length / OFFRES_PAR_PAGE);

    // cacher si 1 page
    nav.style.display = totalPages <= 1 ? "none" : "flex";

    pagesContainer.innerHTML = "";

    prevBtn.disabled = pageActuelle <= 1;
    nextBtn.disabled = pageActuelle >= totalPages;

    for (let i = 1; i <= totalPages; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "page-number" + (i === pageActuelle ? " active" : "");
      b.textContent = i;
      b.addEventListener("click", () => {
        pageActuelle = i;
        renderOffres();
        renderPagination();
      });
      pagesContainer.appendChild(b);
    }

    prevBtn.onclick = () => {
      if (pageActuelle > 1) {
        pageActuelle--;
        renderOffres();
        renderPagination();
      }
    };

    nextBtn.onclick = () => {
      if (pageActuelle < totalPages) {
        pageActuelle++;
        renderOffres();
        renderPagination();
      }
    };
  }

  // ===== APPLY FILTERS =====
  function appliquerFiltres() {
    const q = (qs("filtre-mot-cle")?.value || "").trim().toLowerCase();
    const secteur = qs("filtre-secteur")?.value || "";
    const contrat = qs("filtre-contrat")?.value || "";

    offresFiltrees = offres.filter(o => {
      const haystack = (o.titre + " " + o.extrait + " " + o.lieu).toLowerCase();
      const matchQ = !q || haystack.includes(q);
      const matchSecteur = !secteur || o.secteur === secteur;
      const matchContrat = !contrat || o.contrat === contrat;
      return matchQ && matchSecteur && matchContrat;
    });

    pageActuelle = 1;
    renderOffres();
    renderPagination();
  }

  // ===== LISTENERS =====
  function installerListeners() {
    const form = document.querySelector(".offres-filtres");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        appliquerFiltres();
      });
    }

    const secteursListe = document.querySelector(".secteurs-liste");
    if (secteursListe) {
      secteursListe.addEventListener("click", (e) => {
        const btn = e.target.closest(".secteur-tag");
        if (!btn) return;

        document.querySelectorAll(".secteur-tag")
          .forEach(b => b.classList.remove("secteur-tag-actif"));
        btn.classList.add("secteur-tag-actif");

        const secteurValue = btn.dataset.secteur || "";
        if (qs("filtre-secteur")) qs("filtre-secteur").value = secteurValue;

        appliquerFiltres();
      });
    }
  }

  // ===== LOAD JSON & INIT =====
  async function init() {
    try {
      const res = await fetch(JSON_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      offres = await res.json();
      offresFiltrees = offres;

      installerListeners();
      renderOffres();
      renderPagination();
    } catch (err) {
      console.error("Erreur chargement offres:", err);
      const container = qs("offres-liste");
      if (container) {
        container.innerHTML = "<p>Les offres ne peuvent pas être affichées pour le moment.</p>";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
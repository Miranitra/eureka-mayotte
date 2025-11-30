// Petit bonus SEO/UX : année du footer à jour automatiquement
    //document.getElementById('annee-courante').textContent = new Date().getFullYear();

  let offres = [];

  const secteurClassMap = {
    btp: "secteur-btp",
    admin: "secteur-admin",
    logistique: "secteur-logistique",
    proprete: "secteur-proprete",
    restauration: "secteur-restauration",
    sante: "secteur-sante"
  };

  async function chargerOffres() {
    try {
      // ⚠️ adapte le chemin selon l'emplacement de candidat.html :
      // - si candidat.html est à la racine : "assets/data/offres.json"
      // - si candidat.html est dans /pages : "../assets/data/offres.json"
      const response = await fetch("/assets/data/offres.json");
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      offres = await response.json();
      renderOffres(offres);
    } catch (error) {
      console.error("Erreur chargement offres :", error);
      console.error("Détails erreur :", error.message);
      const container = document.getElementById("offres-liste");
      if (container) {
        // container.innerHTML = "<p>Les offres ne peuvent pas être affichées pour le moment.</p>";
        container.innerHTML = "<p style='color:red;'>Erreur : " + error.message + "</p>";
      }
    }
  }

  function renderOffres(liste) {
    const container = document.getElementById("offres-liste");
    if (!container) return;

    container.innerHTML = "";

    if (!liste.length) {
      container.innerHTML = "<p>Aucune offre ne correspond à vos critères pour le moment.</p>";
      return;
    }

    liste.forEach(offre => {
      const article = document.createElement("article");
      article.className = "offre-carte";

      const secteurClass = secteurClassMap[offre.secteur] || "";

      article.innerHTML = `
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
        <p class="offre-extrait">
          ${offre.extrait}
        </p>
        <div class="offre-footer">
          <span class="offre-reference">Réf. : ${offre.id}</span>
          <a href="#form-candidature" class="btn btn-outline btn-offre">Postuler</a>
        </div>
      `;
      container.appendChild(article);
    });
  }

  function installerFiltres() {
    const formFiltres = document.querySelector(".offres-filtres");
    if (!formFiltres) return;

    formFiltres.addEventListener("submit", function (event) {
      event.preventDefault();

      const q = document.getElementById("filtre-mot-cle").value.trim().toLowerCase();
      const secteur = document.getElementById("filtre-secteur").value;
      const contrat = document.getElementById("filtre-contrat").value;

      const filtered = offres.filter(offre => {
        const haystack = (offre.titre + " " + offre.extrait + " " + offre.lieu).toLowerCase();
        const matchQ = q === "" || haystack.includes(q);
        const matchSecteur = secteur === "" || offre.secteur === secteur;
        const matchContrat = contrat === "" || offre.contrat.toLowerCase() === contrat.toLowerCase();
        return matchQ && matchSecteur && matchContrat;
      });

      renderOffres(filtered);
    });

    const secteursListe = document.querySelector(".secteurs-liste");
    if (secteursListe) {
      secteursListe.addEventListener("click", function (event) {
        const btn = event.target.closest(".secteur-tag");
        if (!btn) return;

        document.querySelectorAll(".secteur-tag").forEach(b => b.classList.remove("secteur-tag-actif"));
        btn.classList.add("secteur-tag-actif");

        const secteurValue = btn.dataset.secteur || "";
        const selectSecteur = document.getElementById("filtre-secteur");
        if (selectSecteur) selectSecteur.value = secteurValue;

        formFiltres.dispatchEvent(new Event("submit"));
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    installerFiltres();
    chargerOffres();
  });

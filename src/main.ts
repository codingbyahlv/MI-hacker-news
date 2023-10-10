import "./assets/scss/style.scss";
import {
  getNews as NewsAPI_getNews,
  getResultData as NewsAPI_getData,
} from "./api";
import { News } from "./news.types";
import { AxiosError } from "axios";

const formEl = document.querySelector<HTMLFormElement>("#form")!;
const newsEl = document.querySelector<HTMLDivElement>("#news-container")!;
const paginationEl = document.querySelector("#page-numbers")!;

let query = "";
let currentPage = 1;
let news: News[] = [];

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  return;
};

const formatDate = (timestamp: string): string => {
  const inputDate = new Date(timestamp);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - inputDate.getTime();

  const years = Math.floor(timeDifference / (365 * 24 * 60 * 60 * 1000));
  const days = Math.floor(
    (timeDifference % (365 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)
  );

  let result = "";
  if (years > 0) {
    result += `${years} ${years === 1 ? "year" : "years"} `;
  }
  if (years < 1) {
    if (days > 0) {
      result += `${days} ${days === 1 ? "day" : "days"} `;
    }
  }

  result += "ago";

  return result;
};

const renderSearchResult = () => {
  newsEl.innerHTML = news
    .map(
      (news) => `
    <a href="${news.url}" target="_blank" class="list-group-item mb-2">
    <div class="d-flex w-100 justify-content-between">
    <h5 class="mb-1">${news.title}</h5>
    <small class="mb-1">${formatDate(news.created_at)}</small>
    </div>
    <p class="my-1 fst-italic ps-2">${news.url}</p>
    <small class="text-body-secondary ps-2 mb-7">${news.points} points | ${
        news.author
      }</small>
    </a>
    `
    )
    .join("");
};

const renderPageBtns = async () => {
  const result = await NewsAPI_getData(query);
  const totalPages = result - 1;
  let paginationHTML = "";
  let maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  if (currentPage === 1) {
    paginationHTML += `<button class="pagination-button page-item page-link disabled" data-page="1">&laquo;</button>`;
    paginationHTML += `<button class="pagination-button page-item page-link disabled" data-page="${
      currentPage - 1
    }">Previous</button>`;
  } else {
    paginationHTML += `<button class="pagination-button page-item page-link " data-page="1">&laquo;</button>`;
    paginationHTML += `<button class="pagination-button page-item page-link" data-page="${
      currentPage - 1
    }">Previous</button>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="pagination-button page-item page-link active" data-page="${i}">${i}</button>`;
    } else {
      paginationHTML += `<button class="pagination-button page-item page-link" data-page="${i}">${i}</button>`;
    }
  }

  if (currentPage === totalPages) {
    paginationHTML += `<button class="pagination-button page-item page-link disabled" data-page="${
      currentPage + 1
    }">Next</button>`;
    paginationHTML += `<button class="pagination-button page-item page-link disabled" data-page="${totalPages}">&raquo;</button>`;
  } else {
    paginationHTML += `<button class="pagination-button page-item page-link" data-page="${
      currentPage + 1
    }">Next</button>`;
    paginationHTML += `<button class="pagination-button page-item page-link " data-page="${totalPages}">&raquo;</button>`;
  }

  paginationEl.innerHTML = paginationHTML;

  const paginationButtons = document.querySelectorAll(".pagination-button");
  paginationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = parseInt(button.getAttribute("data-page") || "1", 10);
      getNews(page);
      scrollToTop();
    });
  });
};

const getNews = async (page?: number) => {
  try {
    if (!page) {
      page = 0;
    } else {
      page = page - 1;
    }
    console.log("page: " + page);
    news = await NewsAPI_getNews(query, page);
    renderSearchResult();
    renderPageBtns();
    currentPage = page + 1;
  } catch (err) {
    if (err instanceof AxiosError) {
      alert("Try again!");
    } else if (err instanceof Error) {
      alert("What?!");
    } else {
      alert("Oh shit, you should never see this ");
    }
  }
};

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  query = document.querySelector<HTMLInputElement>("#query")!.value;
  getNews();
});

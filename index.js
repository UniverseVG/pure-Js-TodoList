const input = document.querySelector("#description");

const date = document.querySelector("#date");

const addItem = document.querySelector(".add-todo");

const list = document.querySelector(".list-container ul");

const listItem = document.querySelector(".list-item");

const noItem = document.querySelector(".centered-item");

const body = document.querySelector("body");

const sort = document.querySelector(".list-sort");

const pagination = document.querySelector(".pagination");

const modal = document.getElementById("filterModal");

const filterBtn = document.querySelector(".list-filter");

const applyFilter = document.getElementById("apply-filter");

const span = document.getElementsByClassName("close")[0];

const removeFilter = document.querySelector(".remove-filter");

let currentPage = 1;
const itemsPerPage = 20;
let isFiltered = false;
let filteredItems = [];

body.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addNewCardToList();
  }
});

// Filter

filterBtn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

applyFilter.addEventListener("click", () => {
  const filterDate = document.getElementById("filter-date").value;
  const filterText = document.getElementById("filter-text").value.toLowerCase();
  const items = getItemsFromLocalStorage();
  filteredItems = items.filter((item) => {
    const matchDate = filterDate ? item.date === filterDate : true;
    const matchText = filterText
      ? item.value.toLowerCase().includes(filterText)
      : true;
    return matchDate && matchText;
  });

  isFiltered = true;
  currentPage = 1;
  getFromLocalStorage(currentPage, filteredItems);
  updatePagination();
  removeFilter.classList.remove("hidden");
  if (
    filterBtn.children[0].children[0].classList.contains(
      "fa-filter-circle-xmark"
    )
  ) {
    filterBtn.children[0].children[0].classList.remove(
      "fa-filter-circle-xmark"
    );
    filterBtn.children[0].children[0].classList.add("fa-filter");
  }
  modal.style.display = "none";
});

removeFilter.addEventListener("click", () => {
  isFiltered = false;
  currentPage = 1;
  document.getElementById("filter-date").value = "";
  document.getElementById("filter-text").value = "";
  getFromLocalStorage(currentPage, getItemsFromLocalStorage());
  updatePagination();
  removeFilter.classList.add("hidden");
  if (filterBtn.children[0].children[0].classList.contains("fa-filter")) {
    filterBtn.children[0].children[0].classList.remove("fa-filter");
    filterBtn.children[0].children[0].classList.add("fa-filter-circle-xmark");
  }

  if (getItemsFromLocalStorage().length === 0) {
    disableSort();
  } else {
    enableSort();
  }
});

function sortItems(items, ascending) {
  items.sort((a, b) => {
    const aValue = a.querySelector(".list-input>.list-date").value;
    const bValue = b.querySelector(".list-input>.list-date").value;
    return ascending
      ? new Date(aValue) - new Date(bValue)
      : new Date(bValue) - new Date(aValue);
  });
  return items;
}

sort.addEventListener("click", () => {
  if (list.children.length > 1) {
    const items = Array.from(list.children);
    const sortIcon = sort.children[0].children[0];
    const ascending = sortIcon.classList.contains("fa-arrow-up");

    if (ascending) {
      sortIcon.classList.remove("fa-arrow-up");
      sortIcon.classList.add("fa-arrow-down");
    } else {
      sortIcon.classList.remove("fa-arrow-down");
      sortIcon.classList.add("fa-arrow-up");
    }

    const sortedItems = sortItems(items, ascending);

    list.innerHTML = "";
    sortedItems.forEach((item) => {
      list.appendChild(item);
    });
  }
});

function disablePastDates() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + "-" + mm + "-" + dd;
  date.min = today;
}

date.addEventListener("focus", () => {
  disablePastDates();
});

function disableButton() {
  addItem.disabled = true;
  addItem.style.opacity = "0.5";
  addItem.style.cursor = "not-allowed";
}

function disableSort() {
  sort.disabled = true;
  sort.style.opacity = "0.5";
  sort.style.cursor = "not-allowed";
  filterBtn.disabled = true;
  filterBtn.style.opacity = "0.5";
  filterBtn.style.cursor = "not-allowed";
}

function enableSort() {
  sort.disabled = false;
  sort.style.opacity = "1";
  sort.style.cursor = "pointer";
  filterBtn.disabled = false;
  filterBtn.style.opacity = "1";
  filterBtn.style.cursor = "pointer";
}

disableButton();

input.addEventListener("input", () => {
  getInputValue();
});

date.addEventListener("input", () => {
  getInputValue();
});

document.addEventListener("DOMContentLoaded", () => {
  getFromLocalStorage(currentPage, getItemsFromLocalStorage());
  addBlurEventToInputs();
  const items = isFiltered ? filteredItems : getItemsFromLocalStorage();
  if (items?.length === 0) {
    addNoItemElement();
    disableSort();
  } else {
    enableSort();
    updatePagination();
  }
});

function getInputValue() {
  if (input.value.length > 0 && date.value !== "") {
    addItem.disabled = false;
    addItem.style.opacity = "1";
    addItem.style.cursor = "pointer";
  } else {
    disableButton();
  }
}

function deleteItem(element) {
  const item = element.parentElement.parentElement.parentElement;
  const itemId = item.getAttribute("key");

  item.classList.add("slide-out");
  item.addEventListener("animationend", () => {
    let items = getItemsFromLocalStorage();
    items = items.filter((i) => i.id !== itemId);

    localStorage.setItem("items", JSON.stringify(items));

    if (isFiltered) {
      filteredItems = filteredItems.filter((i) => i.id !== itemId);
    }

    currentPage = Math.min(currentPage, getPagesNumber());
    getFromLocalStorage(currentPage, isFiltered ? filteredItems : items);
    updatePagination();
    console.log(items);

    if (
      list.children.length === 0 ||
      items.length === 0 ||
      (isFiltered && filteredItems.length === 0)
    ) {
      addNoItemElement();
      disableSort();
      pagination.innerHTML = "";
    }
  });
}
function editElement(element) {
  const parent = element.parentElement.parentElement.parentElement;
  const textInput = parent.querySelector(".list-input>.list-value");
  const dateInput = parent.querySelector(".list-input>.list-date");

  const itemId = parent.getAttribute("key");
  const items = getItemsFromLocalStorage();
  const item = items.find((i) => i.id === itemId);

  item.value = textInput.value;
  item.date = dateInput.value;
  localStorage.setItem("items", JSON.stringify(items));
  // getFromLocalStorage(currentPage);
}

function handleChecked(element) {
  const parent = element.parentElement.parentElement;
  const itemId = parent.getAttribute("key");
  const items = getItemsFromLocalStorage();

  const item = items.find((i) => i.id === itemId);

  item.checked = element.checked;
  localStorage.setItem("items", JSON.stringify(items));

  const parentValue = parent.querySelector(".list-input>.list-value");
  const parentDate = parent.querySelector(".list-input>.list-date");
  const editIcon = parent.querySelector(".list-actions>.edit");

  if (element.checked) {
    parentValue.value = getValueFromLocalStorage(itemId, "value");
    parentDate.value = getValueFromLocalStorage(itemId, "date");
    parentValue.disabled = true;
    parentDate.disabled = true;
    parentValue.style.textDecoration = "line-through";
    parentValue.style.opacity = "0.5";
    parentDate.style.opacity = "0.5";
    editIcon.style.cursor = "not-allowed";
    editIcon.style.opacity = "0.5";
  } else {
    parentValue.disabled = false;
    parentDate.disabled = false;
    parentValue.style.textDecoration = "none";
    parentValue.style.opacity = "1";
    parentDate.style.opacity = "1";
    editIcon.style.cursor = "pointer";
    editIcon.style.opacity = "1";
  }
  // getFromLocalStorage(currentPage); // Refresh list
}

list.addEventListener("click", (e) => {
  if (e.target.parentElement.classList.contains("delete")) {
    deleteItem(e.target);
  }
  if (e.target.parentElement.classList.contains("edit")) {
    const isChecked =
      e.target.parentElement.parentElement.parentElement.querySelector(
        ".list-input>.list-check"
      ).checked;

    if (!isChecked) {
      editElement(e.target);
    }
  }

  if (e.target.classList.contains("list-check")) {
    handleChecked(e.target);
  }
});

function listItemCard(id, value = "", checked = false, dateValue = "") {
  return `
    <li class="list-item  slide-in" key="${id}">
        <div class="list-input">
            <input
                type="checkbox"
                class="list-check"
                name="completed"
                ${checked ? "checked" : ""}

            />
            <input type="text" value="${value}" class="list-value" />
             <input type="date" value="${dateValue}" class="list-date" />
        </div>
        <div class="list-actions">
            <h5 title="Click here to save edit"class="edit" ><i class="fa-regular fa-pen-to-square"></i></h5>
            <h5 class="delete" title="Click here to delete" ><i class="fa-solid fa-trash"></i></h5>
        </div>
    </li>
    `;
}

// got this code from chatgpt to add tooltip 😅😅
function addBlurEventToInputs() {
  showToolTip(".list-value");
  showToolTip(".list-date");
}

function showToolTip(element) {
  document.querySelectorAll(element).forEach((inputField) => {
    const editIcon = inputField.closest(".list-item").querySelector(".edit");

    inputField.addEventListener("blur", () => {
      editIcon.title = "Click on edit icon to save edit";

      editIcon.classList.add("show-tooltip");

      setTimeout(() => {
        editIcon.classList.remove("show-tooltip");
      }, 3000);
    });
  });
}

addItem.addEventListener("click", (e) => {
  e.preventDefault();
  addNewCardToList();
});

function addNewCardToList() {
  if (input.value === "" && date.value === "") {
    return;
  } else {
    const inputValue = input.value;
    const dateValue = date.value;

    if (list.children[0].classList.contains("centered-item")) {
      list.children[0].classList.remove("slide-in");
      list.children[0].classList.add("slide-out");

      // Listen for the animation end event to remove the element
      list.children[0].addEventListener(
        "animationend",
        () => {
          list.children[0].remove();

          addNewCard(inputValue, dateValue);
        },
        { once: true }
      ); // The { once: true } option ensures the listener is removed after being called
    } else {
      addNewCard(inputValue, dateValue);
    }
  }

  input.value = "";
  date.value = "";
  disableButton();
}

function addNewCard(inputValue, dateValue) {
  const items = isFiltered ? filteredItems : getItemsFromLocalStorage();
  const newItem = {
    id: crypto.randomUUID(),
    value: inputValue,
    checked: false,
    date: dateValue,
  };
  items.unshift(newItem);
  localStorage.setItem("items", JSON.stringify(items));
  currentPage = 1;
  getFromLocalStorage(currentPage, items);
  enableSort();
  updatePagination();
  addBlurEventToInputs();
}

function getFromLocalStorage(pageNumber = 1, items) {
  const start = (pageNumber - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = items?.length > 0 ? items.slice(start, end) : [];

  if (paginatedItems?.length > 0) {
    list.innerHTML = "";
    paginatedItems?.forEach((item) => {
      const li = listItemCard(item.id, item.value, item.checked, item.date);
      list.insertAdjacentHTML("beforeend", li);
      if (item.checked) {
        const parent = document.querySelector(`[key="${item.id}"]`);
        parent.querySelector(".list-input>.list-check").checked = true;
        parent.querySelector(".list-input>.list-value").disabled = true;
        parent.querySelector(".list-input>.list-date").disabled = true;

        parent.querySelector(".list-input>.list-value").style.textDecoration =
          "line-through";
        parent.querySelector(".list-input>.list-value").style.opacity = "0.5";
        parent.querySelector(".list-input>.list-date").style.opacity = "0.5";
        parent.querySelector(".list-actions>.edit").style.cursor =
          "not-allowed";
        parent.querySelector(".list-actions>.edit").style.opacity = "0.5";
      }
    });
  } else {
    addNoItemElement();
    disableSort();
  }
  addBlurEventToInputs();
}

function getItemsFromLocalStorage() {
  const items = JSON.parse(localStorage.getItem("items")) || [];
  return items;
}

function getValueFromLocalStorage(id, value = "value") {
  if (getItemsFromLocalStorage()?.length > 0) {
    return getItemsFromLocalStorage().find((item) => item.id === id)[value];
  }
}

//pagination

function getPagesNumber() {
  const items = isFiltered ? filteredItems : getItemsFromLocalStorage();

  if (items?.length > 0) {
    return Math.ceil(items.length / itemsPerPage);
  }
}

function updatePagination() {
  const pagesNumber = getPagesNumber();
  pagination.innerHTML = "";
  if (pagesNumber <= 1) return;
  pagination.insertAdjacentHTML(
    "beforeend",
    `<button class="prev ${currentPage === 1 ? "disabled" : ""}">Prev</button>`
  );

  for (let i = 0; i < pagesNumber; i++) {
    pagination.insertAdjacentHTML(
      "beforeend",
      `<button class="page ${currentPage === i + 1 ? "active" : ""}" ><span>${
        i + 1
      }</span></button>`
    );
  }
  pagination.insertAdjacentHTML(
    "beforeend",
    `<button class="next ${
      currentPage === pagesNumber ? "disabled" : ""
    }">Next </button>`
  );
}
pagination.addEventListener("click", (e) => {
  const items = isFiltered ? filteredItems : getItemsFromLocalStorage();
  if (e.target.classList.contains("prev")) {
    if (currentPage === 1) return;
    currentPage = currentPage - 1;
    getFromLocalStorage(currentPage, items);
    updatePagination();
  } else if (e.target.classList.contains("next")) {
    if (currentPage === getPagesNumber()) return;
    currentPage = currentPage + 1;
    getFromLocalStorage(currentPage, items);
    updatePagination();
  } else if (e.target.classList.contains("page")) {
    currentPage = parseInt(e.target.textContent);
    getFromLocalStorage(currentPage, items);
    updatePagination();
  }
});

function addNoItemElement() {
  list.innerHTML = `<li class="centered-item slide-in "><img src="https://abizobindia.com/public/abizob_image/no_data.png" alt="no item"  /></li>`;
}

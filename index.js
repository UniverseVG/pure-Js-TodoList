const input = document.querySelector("#description");

const addItem = document.querySelector(".add-todo");

const list = document.querySelector(".list-container ul");

const listItem = document.querySelector(".list-item");

const noItem = document.querySelector(".centered-item");
const body = document.querySelector("body");

body.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (input.value === "") {
      return;
    } else {
      const inputValue = input.value;
      if (list.children[0].classList.contains("centered-item")) {
        list.children[0].classList.remove("slide-in");
        list.children[0].classList.add("slide-out");

        // Listen for the animation end event to remove the element
        list.children[0].addEventListener(
          "animationend",
          () => {
            list.children[0].remove();

            addNewCard(inputValue);
          },
          { once: true }
        ); // The { once: true } option ensures the listener is removed after being called
      } else {
        addNewCard(inputValue);
      }
    }
    input.value = "";
    disableButton();
  }
});

function disableButton() {
  addItem.disabled = true;
  addItem.style.opacity = "0.5";
  addItem.style.cursor = "not-allowed";
}

addItem.disabled = true;
addItem.style.opacity = "0.5";
addItem.style.cursor = "not-allowed";

input.addEventListener("input", (e) => {
  if (e.target.value.length > 0) {
    addItem.disabled = false;
    addItem.style.opacity = "1";
    addItem.style.cursor = "pointer";
  } else {
    disableButton();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  getFromLocalStorage();
  addBlurEventToInputs();
});

function deleteItem(element) {
  const item = element.parentElement.parentElement.parentElement;
  item.classList.add("slide-out");
  item.addEventListener("animationend", () => {
    item.remove();
    if (list.children.length === 0) {
      addNoItemElement();
    }
    saveToLocalStorage();
  });
}

function editElement(element) {
  const parent = element.parentElement.parentElement.parentElement;
  const textInput = parent.querySelector(".list-input>.list-value");

  let value = textInput.value;
  textInput.value = "";
  textInput.value = value;
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
      saveToLocalStorage();
    }
  }
  const parent = e.target.parentElement.querySelector(".list-value");
  const editIcon = e.target.parentElement.parentElement.querySelector(
    ".list-actions>.edit"
  );
  const id = e.target.parentElement.parentElement.getAttribute("key");

  if (e.target.classList.contains("list-check")) {
    if (e.target.checked) {
      parent.value = getValueFromLocalStorage(id);
      parent.disabled = true;
      parent.style.textDecoration = "line-through";
      parent.style.opacity = "0.5";
      editIcon.style.cursor = "not-allowed";
      editIcon.style.opacity = "0.5";
    } else {
      parent.disabled = false;
      parent.style.textDecoration = "none";
      parent.style.opacity = "1";
      editIcon.style.cursor = "pointer";
      editIcon.style.opacity = "1";
    }
    saveToLocalStorage();
  }
});

function listItemCard(id, value = "", checked = false) {
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
        </div>
        <div class="list-actions">
            <h5 title="Click here to save edit"class="edit" ><i class="fa-regular fa-pen-to-square"></i></h5>
            <h5 class="delete" ><i class="fa-solid fa-trash"></i></h5>
        </div>
    </li>
    `;
}

// got this code from chatgpt to add tooltip 😅😅
function addBlurEventToInputs() {
  document.querySelectorAll(".list-value").forEach((inputField) => {
    const editIcon = inputField.closest(".list-item").querySelector(".edit");

    inputField.addEventListener("blur", () => {
      editIcon.title = "Click on edit icon to save edit"; // Set the title attribute for tooltip
      // Optionally, you can add any class to show the tooltip immediately
      editIcon.classList.add("show-tooltip");

      // Hide the tooltip after a delay (optional)
      setTimeout(() => {
        editIcon.classList.remove("show-tooltip");
      }, 3000); // Hide after 3 seconds
    });
  });
}

addItem.addEventListener("click", (e) => {
  e.preventDefault();

  if (input.value === "") {
    return;
  } else {
    const inputValue = input.value;
    if (list.children[0].classList.contains("centered-item")) {
      list.children[0].classList.remove("slide-in");
      list.children[0].classList.add("slide-out");

      // Listen for the animation end event to remove the element
      list.children[0].addEventListener(
        "animationend",
        () => {
          list.children[0].remove();

          addNewCard(inputValue);
        },
        { once: true }
      ); // The { once: true } option ensures the listener is removed after being called
    } else {
      addNewCard(inputValue);
    }
  }
  input.value = "";
  disableButton();
});

function addNewCard(inputValue) {
  list.insertAdjacentHTML(
    "afterbegin",
    listItemCard(crypto.randomUUID(), inputValue, false)
  );

  saveToLocalStorage();
  addBlurEventToInputs();
}

function saveToLocalStorage() {
  const items = [];
  document.querySelectorAll(".list-item").forEach((item) => {
    const id = item.getAttribute("key");
    const value = item.querySelector(".list-input>.list-value").value;
    const checked = item.querySelector(".list-input>.list-check").checked;
    items.push({ id, value, checked });
  });

  localStorage.setItem("items", JSON.stringify(items));
}

function getFromLocalStorage() {
  const items = JSON.parse(localStorage.getItem("items"));

  if (items?.length > 0) {
    list.innerHTML = "";
    items.forEach((item) => {
      const li = listItemCard(item.id, item.value, item.checked);
      list.insertAdjacentHTML("beforeend", li);
      if (item.checked) {
        const parent = document.querySelector(`[key="${item.id}"]`);
        parent.querySelector(".list-input>.list-check").checked = true;
        parent.querySelector(".list-input>.list-value").disabled = true;

        parent.querySelector(".list-input>.list-value").style.textDecoration =
          "line-through";
        parent.querySelector(".list-input>.list-value").style.opacity = "0.5";
        parent.querySelector(".list-actions>.edit").style.cursor =
          "not-allowed";
        parent.querySelector(".list-actions>.edit").style.opacity = "0.5";
      }
    });
  }
}

function getValueFromLocalStorage(id) {
  const items = JSON.parse(localStorage.getItem("items"));
  if (items?.length > 0) {
    return items.find((item) => item.id === id).value;
  }
}

function addNoItemElement() {
  list.innerHTML = `<li class="centered-item slide-in "><img src="https://abizobindia.com/public/abizob_image/no_data.png" alt="no item"  /></li>`;
}

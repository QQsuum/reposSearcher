const REPOSITORIES_PER_PAGE = 5;

class View {
  constructor() {
    this.app = document.querySelector(".app");

    this.search = this.createNewElement("div", "search");

    this.title = this.createNewElement("h1", "search__title");
    this.title.textContent = "Let's find repository";

    this.line = this.createNewElement("div", "search-line");
    this.input = this.createNewElement("input", "search-line__input");

    this.dropdown = this.createNewElement("div", "dropdown");
    this.dropdownList = this.createNewElement("ul", "dropdown__list");

    this.added = this.createNewElement("div", "added");
    this.repsList = this.createNewElement("ul", "added__list");

    this.line.append(this.input);

    this.dropdown.append(this.dropdownList);

    this.search.append(this.title);
    this.search.append(this.line);
    this.search.append(this.dropdown);

    this.added.append(this.repsList);

    this.app.append(this.search);
    this.app.append(this.added);
  }

  createNewElement(elementTag, elementClass) {
    let element = document.createElement(elementTag);
    if (elementClass) {
      element.classList.add(elementClass);
    }
    return element;
  }

  createDropdownItem(repositoryData) {
    this.dropdown.classList.add("dropdown--open");

    let dropdownItem = this.createNewElement("li", "dropdown__item");
    dropdownItem.textContent = repositoryData["name"];
    dropdownItem.addEventListener(
      "click",
      this.addRepository.bind(this, repositoryData)
    );
    this.dropdownList.append(dropdownItem);
  }

  deleteItem(item) {
    this.repsList.removeChild(item);
  }

  async addRepository(repositoryData) {
    let addedItem = this.createNewElement("li", "added-item");

    let wrapper = this.createNewElement("div", "added-item__wrapper");
    let repsName = this.createNewElement("span", "added-item__name");
    repsName.textContent = repositoryData["name"];
    let repsOwner = this.createNewElement("span", "added-item__owner");
    repsOwner.innerHTML = ` by &ensp; <span class= 'repsowner'>${repositoryData["owner"]["login"]}</span>`;
    let repsStars = this.createNewElement("span", "added-item__stars");
    repsStars.innerHTML = ` have &ensp; <span class='repsStars'>${repositoryData.stargazers_count} stars</span>`;
    let deleteBtn = this.createNewElement("span", "delete-button");
    deleteBtn.innerHTML = `<i class="fa fa-trash"> </i>`;
    deleteBtn.addEventListener("click", this.deleteItem.bind(this, addedItem));

    wrapper.append(repsName);
    wrapper.append(repsOwner);
    wrapper.append(repsStars);

    addedItem.append(wrapper);
    addedItem.append(deleteBtn);
    this.repsList.append(addedItem);
    this.input.value = "";
  }
}

class Search {
  constructor(view) {
    this.view = view;
    this.view.input.addEventListener(
      "keyup",
      this.debounce(this.searchRepositories.bind(this), 500)
    );
  }
  clearReps() {
    this.view.dropdownList.innerHTML = "";
  }

  debounce(fn, debounceTime) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      let result = () => {
        fn.apply(context, args);
      };
      timeout = setTimeout(result, debounceTime);
    };
  }

  async searchRepositories() {
    if (this.view.input.value) {
      this.clearReps();
      return await fetch(
        `https://api.github.com/search/repositories?q=${this.view.input.value}&per_page=${REPOSITORIES_PER_PAGE}`
      ).then((res) => {
        if (res.ok) {
          res
            .json()
            .then((result) => result.items)
            .then((repositories) =>
              repositories.forEach((element) =>
                this.view.createDropdownItem(element)
              )
            );
        }
      });
    }
    return this.clearReps();
  }
}

new Search(new View());

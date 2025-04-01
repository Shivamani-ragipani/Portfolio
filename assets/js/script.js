'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// const slider = document.querySelector(".slider");
// const images = document.querySelectorAll(".avatar-img");
// let currentIndex = 0;
// let startX = 0;

// // Function to slide images
// function switchImage(nextIndex) {
//     currentIndex = nextIndex;
//     slider.style.transform = `translateX(-${currentIndex * 150}px)`; // Moves the slider left
// }

// // Auto-slide every 3 seconds
// setInterval(() => {
//     let nextIndex = (currentIndex + 1) % images.length;
//     switchImage(nextIndex);
// }, 3000);

// // Swipe/Drag Events for manual sliding
// document.getElementById("avatarBox").addEventListener("touchstart", (e) => {
//     startX = e.touches[0].clientX;
// });

// document.getElementById("avatarBox").addEventListener("touchend", (e) => {
//     let endX = e.changedTouches[0].clientX;
    
//     if (endX < startX - 30 || endX > startX + 30) { 
//         let nextIndex = (currentIndex + 1) % images.length;
//         switchImage(nextIndex);
//     }
// });

// document.getElementById("avatarBox").addEventListener("mousedown", (e) => {
//     startX = e.clientX;
// });

// document.getElementById("avatarBox").addEventListener("mouseup", (e) => {
//     let endX = e.clientX;
    
//     if (endX < startX - 30 || endX > startX + 30) { 
//         let nextIndex = (currentIndex + 1) % images.length;
//         switchImage(nextIndex);
//     }
// });




document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("draggableSidebar");

  if (window.innerWidth < 1500) {
    sidebar.removeAttribute("id");
    return; 
  }

  let isDragging = false, offsetX = 0, offsetY = 0;

  const rect = sidebar.getBoundingClientRect();
  sidebar.style.left = `${rect.left}px`;
  sidebar.style.top = `${rect.top}px`;
  sidebar.style.margin = "0";
  sidebar.style.cursor = "grab";
  sidebar.style.transition = "left 0.2s ease-out, top 0.2s ease-out"; 

  const onMouseDown = (e) => {
    isDragging = true;
    offsetX = e.clientX - sidebar.offsetLeft;
    offsetY = e.clientY - sidebar.offsetTop;

    sidebar.style.cursor = "grabbing";
    sidebar.style.zIndex = "1000"; // Bring to front
    sidebar.style.transition = "none"; // Remove transition during drag for smoothness
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    const maxX = window.innerWidth - sidebar.offsetWidth;
    const maxY = window.innerHeight - sidebar.offsetHeight;

    requestAnimationFrame(() => {
      sidebar.style.position = "absolute"; // Changes position to allow dragging
      sidebar.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
      sidebar.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    });
  };

  const onMouseUp = () => {
    isDragging = false;
    sidebar.style.cursor = "grab";
    sidebar.style.zIndex = "1";
    sidebar.style.transition = "left 0.2s ease-out, top 0.2s ease-out"; // Smooth transition when stopping
  };

  sidebar.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});






// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
// document.addEventListener("DOMContentLoaded", function () {
//   const form = document.querySelector("[data-form]");
//   const formInputs = document.querySelectorAll(".form-input");
//   const formBtn = document.querySelector(".form-btn");

//   if (!form || !formInputs || !formBtn) {
//     console.error("Form elements not found! Check your HTML.");
//     return; // Exit if form elements are missing
//   }

//   form.addEventListener("submit", function (event) {
//     event.preventDefault(); // Prevent default form submission

//     formBtn.setAttribute("disabled", ""); // Disable button while submitting

//     // Collect form data
//     const formData = new FormData(form);

//     // Send form data to FormSubmit
//     fetch("https://formsubmit.co/ajax/shivamaniragipani60@gmail.com", {
//       method: "POST",
//       body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//       if (data.success) {
//         window.location.href = "thank-you.html"; // Redirect to thank-you page
//       } else {
//         alert("Failed to send message. Try again later.");
//       }
//     })
//     .catch(error => {
//       console.error("FormSubmit Error:", error);
//       alert("An error occurred. Please check the console.");
//     });
//   });

//   // Enable submit button only when all fields are valid
//   formInputs.forEach(input => {
//     input.addEventListener("input", function () {
//       formBtn.disabled = !form.checkValidity();
//     });
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll(".form-input");
  const formBtn = document.querySelector(".form-btn");

  if (!form || !formInputs || !formBtn) {
    console.error("Form elements not found! Check your HTML.");
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    formBtn.setAttribute("disabled", ""); 
    formBtn.textContent = "Sending..."; 

    const formData = new FormData(form);

    try {
      const response = await fetch("https://formsubmit.co/ajax/shivamaniragipani60@gmail.com", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "thank-you.html"; // Redirect if successful
      } else {
        alert("Failed to send message. Try again later.");
      }
    } catch (error) {
      console.error("FormSubmit Error:", error);
      alert("An error occurred. Please check the console.");
    } finally {
      formBtn.removeAttribute("disabled"); // Re-enable button
      formBtn.textContent = "Send Message"; // Reset button text
    }
  });

  // Enable submit button only when all fields are valid
  formInputs.forEach(input => {
    input.addEventListener("input", function () {
      formBtn.disabled = !form.checkValidity();
    });
  });
});










// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}
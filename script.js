let header = document.querySelector("header");
let menu = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  header.classList.toggle("shadow", window.scrollY > 0);
});


// fetch("https://dhvanipatel-4.onrender.com/chat", {
//   method: "POST",
//   ...
// });

menu.onclick = () => {
  navbar.classList.toggle("active");
};
window.onscroll = () => {
  navbar.classList.remove("active");
};


document.addEventListener("DOMContentLoaded", () => {
  const hiddenSections = document.querySelectorAll(".hidden");

  const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("show");

              
              const lines = entry.target.querySelectorAll(".line-hidden");
              lines.forEach((line, index) => {
                  setTimeout(() => {
                      line.classList.add("line-show");
                  }, index * 100); 
              });

              observer.unobserve(entry.target); 
          }
      });
  }, { threshold: 0.2 });

  hiddenSections.forEach(section => {
      observer.observe(section);
  });
});

// const darkmode = document.getElementById("darkmode");

// darkmode.onclick = () => {
//   document.body.classList.toggle("dark");
  
//   darkmode.classList.toggle("bx-sun");
//   darkmode.classList.toggle("bx-moon");
// };

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.querySelector(".typing-animation").classList.add("done");
  }, 2000); 
});

const certificationBoxes = document.querySelectorAll(".certification-box");

certificationBoxes.forEach(box => {
    box.addEventListener("click", function () {
        this.classList.toggle("flip");
    });
});



function toggleChat() {
  const box = document.getElementById("chat-box");
  box.style.display = box.style.display === "flex" ? "none" : "flex";
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;

  const messages = document.getElementById("chat-messages");

  const userDiv = document.createElement("div");
  userDiv.className = "user-message";
  userDiv.innerHTML = `<strong>You:</strong> ${msg}`;
  messages.appendChild(userDiv);

  input.value = "";

  fetch("https://dhvanipatel-4.onrender.com/chat", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: msg })
  })
  .then(res => res.json())
  .then(data => {
      const botDiv = document.createElement("div");
      botDiv.className = "bot-message";
      botDiv.innerHTML = `<strong>Bot:</strong> ${data.reply}`;
      messages.appendChild(botDiv);
      messages.scrollTop = messages.scrollHeight;
  })
  .catch(err => {
      const botDiv = document.createElement("div");
      botDiv.className = "bot-message";
      botDiv.innerHTML = `<strong>Bot:</strong> Sorry, something went wrong!`;
      messages.appendChild(botDiv);
      messages.scrollTop = messages.scrollHeight;
  });
}

// --- Drag & Drop Functionality ---
const dragTarget = document.getElementById("chatbot-container");
const dragHandle = document.querySelector(".chat-header");

let offsetX = 0, offsetY = 0, isDragging = false;

dragHandle.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - dragTarget.getBoundingClientRect().left;
  offsetY = e.clientY - dragTarget.getBoundingClientRect().top;

  dragTarget.style.position = "fixed";
  dragTarget.style.zIndex = "9999";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    dragTarget.style.left = `${e.clientX - offsetX}px`;
    dragTarget.style.top = `${e.clientY - offsetY}px`;
    dragTarget.style.bottom = "auto"; 
    dragTarget.style.right = "auto";  
  }
});


const tooltip = document.createElement("div");
tooltip.id = "custom-tooltip";
tooltip.innerText = "I'm draggable, you can drag me 🥸";
document.body.appendChild(tooltip);

dragHandle.addEventListener("mouseenter", () => {
  const rect = dragHandle.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 35}px`;
  tooltip.style.transform = "translateX(-50%)";
  tooltip.style.opacity = "1";
});

dragHandle.addEventListener("mouseleave", () => {
  tooltip.style.opacity = "0";
});


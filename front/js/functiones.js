"use strict";
const contenedoresColores = document.querySelector("ul");
const modalBorrar = document.querySelector(".modal-borrar");
const botonesBorrar = modalBorrar.querySelectorAll("button");
const formulario = document.querySelector("form");
const input = formulario.querySelector("input[type='text']");
const error = formulario.querySelector(".error");
const modalEditar = document.querySelector(".modal-editar");
const btnEditar = modalEditar.querySelectorAll("button");
const inputRange = modalEditar.querySelectorAll("input[type='range']");
const divColor = modalEditar.querySelector(".color");
let colorBorrar = null;
let colorEditar = null;
let rgbTemporale = [0, 0, 0];
fetch("/colores")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((color) => {
      let { _id, r, g, b } = color;

      new Color(_id, r, g, b, contenedoresColores);
    });
  });

formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  error.classList.remove("visible");
  if (/^[0-9]{1,3},[0-9]{1,3},[0-9]{1,3}$/.test(input.value)) {
    let valores = input.value.split(",").map((n) => Number(n));
    let valido = true;
    let i = 0;
    while (valido && i < 3) {
      valido = valores[i] <= 255;
      i++;
    }
    if (valido) {
      let [r, g, b] = valores;
      return fetch("/colores/nuevo", {
        method: "POST",
        body: JSON.stringify({ r, g, b }),
        headers: { "Content-Type": "application/json" },
      })
        .then((resp) => {
          if (resp.status === 201) {
            return resp.json();
          }
          throw "mostrar err";
        })
        .then((resp) => {
          new Color(resp.id, r, g, b, contenedoresColores);
          input.value = "";
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }
  error.classList.add("visible");
});

botonesBorrar.forEach((boton, i) => {
  boton.addEventListener("click", () => {
    if (i === 0) {
      return colorBorrar.borrarColor();
    }
    colorBorrar = null;
    modalBorrar.classList.remove("modal-visible");
  });
});

btnEditar.forEach((boton, i) => {
  boton.addEventListener("click", () => {
    if (i === 0) {
      return colorEditar.modificarColor(rgbTemporale);
    }

    colorEditar = null;
    modalEditar.classList.remove("modal-visible");
  });
});

inputRange.forEach((control, i) => {
  control.addEventListener("input", () => {
    rgbTemporale[i] = Number(control.value);
    divColor.style.backgroundColor = `rgb(${rgbTemporale.join(",")})`;
  });
});

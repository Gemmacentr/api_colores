class Color {
  constructor(id, r, g, b, contenedor) {
    this.id = id;
    this.rgb = [r, g, b];
    this.DOM = null;
    this.crearColor(contenedor);
  }
  crearColor(contenedor) {
    this.DOM = document.createElement("li");

    this.DOM.innerHTML = `<span>${this.rgb.join(",")}</span>`;
    this.DOM.style.backgroundColor = `rgb(${this.rgb.join(",")})`;

    let botonEditar = document.createElement("button");
    botonEditar.innerText = "Editar";
    botonEditar.addEventListener("click", () => {
      colorEditar = this;
      divColor.style.backgroundColor = `rgb(${this.rgb.join(",")})`;
      this.rgb.forEach((valor, i) => {
        rgbTemporale[i] = valor;
        inputRange[i].value = valor;
      });
      modalEditar.classList.add("modal-visible");
    });
    let botonBorrar = document.createElement("button");
    botonBorrar.innerText = "Borrar";
    botonBorrar.addEventListener("click", () => {
      colorBorrar = this;
      modalBorrar.classList.add("modal-visible");
      //const btnAceptar = modalBorrar.querySelector(".btn-aceptar");
    });
    this.DOM.appendChild(botonEditar);
    this.DOM.appendChild(botonBorrar);
    contenedor.appendChild(this.DOM);
  }

  borrarColor() {
    fetch("/colores/borrar/" + this.id, {
      method: "DELETE",
    }).then((resp) => {
      if (resp.status === 204) {
        this.DOM.remove();
        colorBorrar = null;
        return modalBorrar.classList.remove("modal-visible");
      }
      console.log("Error al borrar el color");
    });
  }
  modificarColor(rgbTemporale) {
    let valido = false;
    let i = 0;
    while (!valido && i < 3) {
      valido = this.rgb[i] != rgbTemporale[i];
      i++;
    }

    if (valido) {
      let [r, g, b] = rgbTemporale;
      return fetch("/colores/modify/" + this.id, {
        method: "PATCH",
        body: JSON.stringify({ r, g, b }),
        headers: { "Content-Type": "application/json" },
      }).then((resp) => {
        if (resp.status === 204) {
          rgbTemporale.forEach((valor, i) => {
            colorEditar.rgb[i] = valor;
            rgbTemporale[i] = 0;
          });

          colorEditar.DOM.style.backgroundColor = `rgb(${colorEditar.rgb.join(",")})`;
          colorEditar.DOM.children[0].innerHTML = colorEditar.rgb.join(",");
          colorEditar = null;
          return modalEditar.classList.remove("modal-visible");
        }
        console.log("Error al modificar el color");
      });
    }
    colorEditar = null;
    rgbTemporale.forEach((valor, i) => (rgbTemporale[i] = 0));
    return modalEditar.classList.remove("modal-visible");
  }
}

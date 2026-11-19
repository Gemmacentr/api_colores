import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  leerColores,
  crearColor,
  deleteColor,
  modificarColor,
  encontrarUsuario,
} from "./db.js";
import cors from "cors";
dotenv.config();
function autorizar(peticion, respuesta, siguiente) {
  let { authorization } = peticion.headers;
  if (authorization == undefined) {
    return siguiente(true);
  }
  let token = authorization.split(" "); // divide [0]-> Bearer e [1]-> il token
  if (token.lenght > 2 || token[0] != "Bearer") {
    return respuesta.sendStatus(401);
  }
  jwt.verify(token[1], process.env.SECRET, (error, datos) => {
    if (error) {
      return respuesta.sendStatus(401);
    }
    peticion.id = datos.id;
    siguiente();
  });
}

const server = express();
server.use(cors());
server.use(express.json());
server.post("/login", async (peticion, respuesta, next) => {
  let { username, password } = peticion.body; // peticion body ciò che invio io
  if (username == undefined || password == undefined) {
    return next(true);
  }
  try {
    let baseUsuario = await encontrarUsuario(username);
    if (!baseUsuario) {
      return respuesta.sendStatus(401);
    }
    let valido = await bcrypt.compare(
      password.toString(),
      baseUsuario.password,
    );
    if (!valido) {
      return respuesta.sendStatus(403);
    }

    let token = jwt.sign({ id: baseUsuario._id }, process.env.SECRET);
    console.log(token);
    respuesta.json({ token });
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ e: "error" });
  }

  //el usuario inviarà a este endpoint { usuario, password }
  //si el usuario existe y la contraseno es correcta -->{token: tokenJWT con el ID del usuario }
  //si el usuario existe però la contraseno es incorrecta-> 403
  //si el usuario no existe 401
});
server.use(autorizar); // prima di tutto!!
server.get("/colores", async (peticion, respuesta) => {
  try {
    let colores = await leerColores(peticion.id);
    respuesta.json(colores);
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error nel server" });
  }
});

server.post("/colores/nuevo", async (peticion, respuesta, next) => {
  let { r, g, b } = peticion.body;
  let valores = true;
  [r, g, b].forEach((n) => {
    valores = valores && /^[0-9]{1,3}$/.test(n) && Number(n) <= 255;
  });
  //validaciones
  if (!valores) {
    return next(true);
  }
  try {
    let username = peticion.id;
    let id = await crearColor({ r, g, b, username });
    respuesta.status(201);
    respuesta.json({ id });
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error nel server" });
  }
});

server.delete("/colores/borrar/:id", async (peticion, respuesta, siguiente) => {
  let { id } = peticion.params; //no body ma param qui

  if (!/^[a-f0-9]{24}$/.test(id)) {
    return siguiente(true);
  }

  //validaciones
  try {
    let elementos = await deleteColor(id);
    if (elementos) {
      return respuesta.sendStatus(204);
    }
    siguiente();
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error nel server" });
  }
});

server.patch("/colores/modify/:id", async (peticion, respuesta, siguiente) => {
  let { id } = peticion.params;
  if (!/^[a-f0-9]{24}$/.test(id)) {
    return siguiente(true);
  }
  let { r, g, b } = peticion.body;
  let valido = r != undefined || g != undefined || b != undefined;

  if (!valido) {
    return siguiente(true);
  }
  let objCambios = {};
  let claves = ["r", "g", "b"];
  [r, g, b].forEach((n, i) => {
    if (n != undefined) {
      valido = valido && /^[0-9]{1,3}$/.test(n) && Number(n) <= 255;
      if (valido) {
        objCambios[claves[i]] = n;
      }
    }
  });
  if (!valido) {
    return siguiente(true);
  }
  try {
    let { modifiedCount } = await modificarColor(id, objCambios);
    if (modifiedCount) {
      return respuesta.sendStatus(204);
    }
    siguiente();
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error nel server" });
  }
});

server.use((error, peticion, respuesta, siguiente) => {
  console.log(error);
  respuesta.sendStatus(400);
});
server.use((peticion, respuesta) => {
  respuesta.sendStatus(404);
});

server.listen(process.env.PORT);

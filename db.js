import dotenv from "dotenv";

dotenv.config(); // CARICA LA VARIABLE CHE METTO IN .ENV
//------------------------------

import { MongoClient, ObjectId } from "mongodb";
function conectar() {
  return MongoClient.connect(process.env.MONGO_URL);
}

export function crearColor(objColor) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar() // provoa a connetttermi e se vado bene primo then
      .then((conexionMongoDb) => {
        conexion = conexionMongoDb;
        let connessione = conexion.db("colores").collection("colores");
        return connessione.insertOne(objColor);
      })
      .then(({ insertedId }) => ok(insertedId))
      .catch((error) => ko({ error: "errore trovato" })) // se la connessione va male vado qua
      .finally(() => {
        if (conexion) {
          conexion.close();
        }
      });
  });
}

// una fucntiona para buscar un usuario por su nombre de usuario
//se non lo becchi ritorna null

export function encontrarUsuario(username) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar() // provoa a connetttermi e se vado bene primo then
      .then((conexionMongoDb) => {
        conexion = conexionMongoDb;
        let connessione = conexion.db("colores").collection("usuarios");
        return connessione.findOne({ username });
      })
      .then((usuarios) => ok(usuarios))
      .catch((error) => (ko) => {
        return null;
      }) // se la connessione va male vado qua
      .finally(() => {
        if (conexion) {
          conexion.close();
        }
      });
  });
}

export function leerColores(username) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar() // provoa a connetttermi e se vado bene primo then
      .then((conexionMongoDb) => {
        conexion = conexionMongoDb;
        let connessione = conexion.db("colores").collection("colores");
        return connessione.find({ username }).toArray();
      })
      .then((colores) => ok(colores))
      .catch((error) => ko({ error: "errore trovato" })) // se la connessione va male vado qua
      .finally(() => {
        if (conexion) {
          conexion.close();
        }
      });
  });
}
/*leerColores()
  .then((x) => console.log(x))
  .catch((x) => console.log(x));
*/
export function deleteColor(id) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar() // provoa a connetttermi e se vado bene primo then
      .then((conexionMongoDb) => {
        conexion = conexionMongoDb;
        let connessione = conexion.db("colores").collection("colores");
        return connessione.deleteOne({
          _id: new ObjectId(id),
        });
      })
      .then(({ deletedCount }) => ok(deletedCount))
      .catch((error) => ko({ error: "errore trovato" })) // se la connessione va male vado qua
      .finally(() => {
        if (conexion) {
          conexion.close();
        }
      });
  });
}
//deleteColor("6adf8c7d6b4411e63d2e2b9f").then((x) => console.log(x));

export function modificarColor(id, objCambios) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar() // provoa a connetttermi e se vado bene primo then
      .then((conexionMongoDb) => {
        conexion = conexionMongoDb;
        let connessione = conexion.db("colores").collection("colores");
        return connessione.updateOne(
          {
            _id: new ObjectId(id),
          },
          { $set: objCambios },
        );
      })
      .then(({ modifiedCount, matchedCount }) =>
        ok({ modifiedCount, matchedCount }),
      )
      .catch((error) => ko({ error: "errore trovato" })) // se la connessione va male vado qua
      .finally(() => {
        if (conexion) {
          conexion.close();
        }
      });
  });
}

//6adf8c41d96e31ef1a8c6043

/*actualizarColor("6adf8c41d96e31ef1a8c6043", { b: 1 }).then((x) =>
  console.log(x),
); */

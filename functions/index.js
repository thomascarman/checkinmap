const functions = require("firebase-functions");
const fetch = require("node-fetch");

// Jotform API KEY and form id
let formKey = functions.config().form.key;
let formId = functions.config().form.id;

// Jotform url for requesting submitions to form
let jotform = `https://api.jotform.com/form/${formId}/submissions?apiKey=${formKey}`;

// Map box API Key
let mapKey = functions.config().map.key;

/**
 * reqMapData is the firebase function to get data from database.
 */
exports.reqMapData = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "GET" || !req.body.message) {
    let jotData = await fetch(jotform);
    let jsonData = await jotData.json();

    formatData(jsonData?.content).then((fData) => {
      // Commit all data to firebase
      fData.forEach((doc) => {
        const docRef = db.collection("users").doc(doc.place_name);
        // doc.update = db.FieldValue.serverTimestamp();
        batch.set(docRef, doc);
      });

      batch.commit();

      // Return data request
      res.send({
        data: fData,
      });
    });
  }
});

function formatData(data) {
  if (!data || !data?.length) return [];
  return new Promise((resolve, reject) => {
    let filtered = data.filter((el) => {
      return el.status !== "DELETED";
    });

    let addresses = filtered.map((el) => {
      for (let a in el.answers) {
        let answer = el.answers[a];
        if (
          answer?.answer?.city ||
          answer?.answer?.state ||
          answer?.answer?.postal ||
          answer?.answer?.country
        ) {
          console.log(answer?.answer);
          return `${answer?.answer?.city || ""} ${
            answer?.answer?.state || ""
          } ${answer?.answer?.postal || ""} ${
            answer?.answer?.country || ""
          }`.trim();
        }
      }

      return null;
    });

    let promises = [];

    addresses.forEach((addr) => {
      promises.push(getCoordFromAddress(addr));
    });

    Promise.all(promises).then((final) => {
      resolve(final);
    });
  });
}

function getCoordFromAddress(search) {
  return new Promise((resolve, reject) => {
    if (typeof search !== "string")
      reject("Invalid Values for getCoordFromAddress function.");

    search = encodeURIComponent(search);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=${mapKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        let { center, place_name, geometry } = res?.features?.[0] || {};
        resolve({ center, place_name, geometry });
      })
      .catch((err) => {
        throw new Error(err);
      });
  });
}

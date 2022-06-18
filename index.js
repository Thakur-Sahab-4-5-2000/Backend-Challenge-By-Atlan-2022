const express = require("express");
const app = express();
const cors = require("cors");
const translate = require("translate");
const mongoose = require("mongoose");
const Alien = require("./models/alien");
const csvWriter = require("csv-writer");
const twilio = require("twilio");
const port = 5000;

app.use(express.urlencoded({ extended: true }));
app.use("/DataStore", express.static(__dirname + "/DataStore"));
app.use(express.json());
app.use(cors());

const url =
  "mongodb+srv://Shubham:ShubhamKumar@cluster0.l4hi2xg.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  autoIndex: true,
});
const con = mongoose.connection;

con.on("open", () => {
  console.log("connected...");
});

app.use(express.json());

//Task Number 1
//One of our clients wanted to search for slangs (in local language) for an answer to a text question on the basis of cities (which was the answer to a different MCQ question)
langConverter = async (req, res) => {
  translate.engine = "google";
  console.log(req.query);
  try {
    const word = await translate(req.query.EnteredWord, req.query.Enteredlang);
    res.send(word);
  } catch {
    res.send(err.message);
  }
};

//Task Number 3
//A very common need for organizations is wanting all their data onto Google Sheets, wherein they could connect their CRM, and also generate graphs and charts offered by Sheets out of the box. In such cases, each response to the form becomes a row in the sheet, and questions in the form become columns.
async function storeFile(req, res, next) {
  try {
    var aliens = await Alien.find();
    var createCsvWriter = csvWriter.createObjectCsvWriter;
    const CSV = createCsvWriter({
      path: "./DataStore/data.csv",
      header: [
        { id: "id", title: "ID" },
        { id: "emailID", title: "EmailID" },
        { id: "namePerson", title: "NamePerson" },
        { id: "incomePerYear", title: "IncomePerYear" },
        { id: "savings", title: "Saving Per Year" },
        { id: "mobile", title: "Mobile Number" },
      ],
    });
    await CSV.writeRecords(aliens).then(() =>
      res.send(
        "<a href='/DataStore/data.csv' download='data.csv' id='download-link'></a><script>document.getElementById('download-link').click();</script>"
      )
    );
  } catch (err) {
    res.send("Error " + err);
  }
}

//Task Number 4
//A recent client partner wanted us to send an SMS to the customer whose details are collected in the response as soon as the ingestion was complete reliably. The content of the SMS consists of details of the customer, which were a part of the answers in the response. This customer was supposed to use this as a “receipt” for them having participated in the exercise.
async function sendSms(req, res) {
  const { email, name, income, savings, mobile } = req.body;
  var client = new twilio(
    "AC52afef0b9a5fcfcac44e96a32a48fe2b",
    "98c9d76a07349e3d3fab1aae5a99baf0"
  );
  client.messages
    .create({
      to: mobile,
      from: "+19895652192",
      body: `Your Details :\n Email ID :${email}\n Name : ${name}\n Income Per Annum: ${income}\n Savings Per Annum: ${savings}\n Contact : ${mobile}\n Thankyou for your response`,
    })
    .then(res.send("Message success"))
    .catch((err) => res.send(err));
}

app.get("/langConvert", langConverter, (req, res) => {});
const routers = require("./routes/aliens");
const alien = require("./models/alien");
app.use("/aliens", routers);
app.get("/export", storeFile, (req, res) => {});
app.get("/sendSms", sendSms, (req, res) => {});

app.listen(port, () => {
  console.log(`Server is listening at port : ${port}`);
});

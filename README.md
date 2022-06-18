
# Atlan Backend Challenge 2022 	:sunglasses:

I confirm that all of the information provided in this submission is my own work and, to the best of my knowledge, complete and accurate. Name: Shubham Kumar Date: 18/06/2022

## Task 1


One of our clients wanted to search for slangs (in local language)  for an answer to a text question 
on the basis of cities (which was  the answer to a different MCQ question)

### Task 1 Ideda/Approaches
1. **By Creating Different Collections in MongoDB:-**
 - **We can create different collections for different language and we can store the word in their particular language when a user enter a word we can simply find that word in the lsit and show the output.**
    - A)
    collectiion Name: English
    ```shell
    {
    "_id":{"$oid":"62ab642fe3c79e70ae02cf96"},
    "word":"Hy",
    "lang":"hi",
    }
    ```
    collectiion Name: Spanish
    ```shell
    {
    "_id":{"$oid":"62ab642fe3c79e70ae02cf96"},
    "word":"Hy",
    "lang":"hola",
    }
    ```
    Simillary we can create more collections like these collections for particular languages and we can find a word in particular language.

    But this method is not efficient as we have to create so many collections in the database and then find that word in the particular collection.

2. **Translation API approach :-**
  - **In order to find slang of a given word efficiently, we can use Google Translate API  [Click to translate](https://translate.google.co.in/)**
    
    ```shell
    langConverter = async (req, res) => 
    {
         translate.engine = "google";
            console.log(req.query);
            try {
               const word = await translate(req.query.EnteredWord, req.query.Enteredlang);
               res.send(word);
            } catch {
               res.send(err.message);
            }
      };
    ```

    ```shell
    app.get("/langConvert", langConverter, (req, res) => {});
    ```

     -   Route (GET Method) :  ```shell  http://localhost:5000/langConvert  Params {lang : "hi",word : "Hello"}```
    ### Output:
    ```shell 
    Namaste 
    ```

## Task 2

A market research agency wanted to validate responses coming in against a set of business rules (eg. monthly 
savings cannot be more than monthly income) and send the response back to the data collector to fix it when 
the rules generate a flag 

### Task 2 Ideda/Approaches
 1. **By creating a middleware  :-** 

   ```shell
   router.post("/enterdetails", validateData, async (req, res) => {
      const alien = new Alien({
      emailID: req.body.email,
      namePerson: req.body.name,
      incomePerYear: req.body.income,
      savings: req.body.savings,
      mobile: req.body.mobile,
   });
   try {
      const a1 = await alien.save();
      res.json(a1);
   } catch (err) {
      res.send("Error");
  }
});
   ```
- **Middleware for this approach**
```shell
function validateData(req, res, next) {
  const { income, savings, mobile } = req.body;

  if (income < savings) {
    console.error("Invalid income: " + income + " and savings: " + savings);
    next(new Error(`Invalid income: ${income} and savings: ${savings}`));
    return;
  }
  if (isNaN(mobile)) {
    next(new Error("Not a mobile number: " + mobile));
    return;
  }
  if (mobile.length !== 10) {
    next(new Error("Not a mobile number: " + mobile));
    return;
  }
  next();
}
```
 -   Route (POST Method) :  http://localhost:5000/enterdetails 
 ```shell  
#1st Example
  Params { 
    "name" : "Bholle Baba",
    "email" :"shubham@gmail.com",
    "income" : 700000, 
    "savings":20000, 
    "mobile":"8527300" //Not valid number
   }
   
   Response
   Not a valid number


#2nd Example
  Params { 
    "name" : "Bholle Baba",
    "email" :"shubham@gmail.com",
    "income" : 700000, 
    "savings":20000, 
    "mobile":"8527300f0ff0" //Not valid number
   }
   
   Response
   Not a valid number

#3rd Example
  Params { 
    "name" : "Bholle Baba",
    "email" :"shubham@gmail.com",
    "income" : 700, 
    "savings":20000, 
    "mobile":"8527300071" 
   }
   
   Response
   Invalid income: 700 and savings: 20000
```

## Task 3

A very common need for organizations is wanting all their data onto Google Sheets, wherein they could connect their CRM, 
and also generate graphs and charts offered by Sheets out of the box. In such cases, each response to the form becomes 
a row in the sheet, and questions in the form become columns.

### Task 3 Ideda/Approaches
 - **By creating a middleware and export the data in the sheet and download it:-** 
 -  **API used CSV-Writer**
```shell
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
        "<a href='/DataStore/data.csv' download='data.csv' 
        id='download-link'></a>
        <script>document.getElementById('download-link').click();
        </script>"
      )
    );
  } catch (err) {
    res.send("Error " + err);
  }
}
```

- Routes (GET METHOD): localhost//http:5000/export 
```shell
"data.csv"
ID,EmailID,NamePerson,IncomePerYear,Saving Per Year,Mobile Number
62ab642fe3c79e70ae02cf96,shubhamkofficial1@gmail.com,hy,1200000,60000,7710230187
62aca4ea89bcae0d255fac54,shubham@gmail.com,Bholle Baba,700000,20000,8527419630
```

## Task 4
A recent client partner wanted us to send an SMS to the customer whose details are collected in the response as soon as the ingestion was complete reliably. The content of the SMS consists of details of the customer, which were a part of the answers in the response. This customer was supposed to use this as a “receipt” for them having participated in the exercise.
- **Middleware approach**
- **By using Twilio Api**

```shell
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
```
-   Route (POST Method) :  ```shell http://localhost:3000/sendSms```


## Schema of MongoDB Database
```shell
const mongoose = require("mongoose");

const alienSchema = new mongoose.Schema({
  emailID: {
    type: String,
    required: true,
    unique: true,
  },
  namePerson: {
    type: String,
    required: true,
  },
  incomePerYear: {
    type: Number,
    required: true,
    integer: true,
  },
  savings: {
    type: Number,
    required: false,
    integer: true,
    minValue: 0,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    integer: true,
  },
});

module.exports = mongoose.model("Alien", alienSchema);

```

## Dependencies Used
 ```shell
    "dependencies": {
    "cors": "^2.8.5",
    "csv-writer": "^1.6.0",
    "dotenv": "^16.0.1",
    "express": "^4.18.1",
    "fast-csv": "^4.3.6",
    "mongo": "^0.1.0",
    "mongodb": "^4.7.0",
    "mongoose": "^6.3.8",
    "nodemon": "^2.0.16",
    "translate": "^1.4.1",
    "twilio": "^3.77.3"
  }
   ```


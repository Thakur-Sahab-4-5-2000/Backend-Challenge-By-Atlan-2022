const express = require("express");
const router = express.Router();
const Alien = require("../models/alien");

//Tak 2
//A market research agency wanted to validate responses coming in against a set of business rules (eg. monthly savings cannot be more than monthly income) and send the response back to the data collector to fix it when the rules generate a flag

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

router.get("/fetch", async (req, res) => {
  try {
    const aliens = await Alien.find();
    res.json(aliens);
  } catch (err) {
    res.send("Error " + err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const alien = await Alien.findById(req.params.id);
    res.json(alien);
  } catch (err) {
    res.send("Error " + err);
  }
});

//Task 2
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

router.patch("/:id", async (req, res) => {
  try {
    const alien = await Alien.findById(req.params.id);
    alien.sub = req.body.sub;
    const a1 = await alien.save();
    res.json(a1);
  } catch (err) {
    res.send("Error");
  }
});

module.exports = router;

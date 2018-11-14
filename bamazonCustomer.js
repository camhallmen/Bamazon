// Require npm packages
var mysql = require('mysql');
var inquirer = require('inquirer');

// Connect to mysql database
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'bamazon_db'
});
 
connection.connect();

// Display connection successful
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log("\n==================================")
  console.log("Successfully connected to Bamazon!");
  console.log("==================================\n")
  showProducts()
});

// Display all products
function showProducts() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err
        console.log("=============== All Available Products ===============")
        for (var i = 0; i < results.length; i ++) {
          console.log("ID: " + JSON.stringify(results[i].item_id)+ "," + " Product: " + results[i].product_name + "," +
           " Price: $" + results[i].price + "," + " Current Stock: " + results[i].stock_quantity)
        }
        console.log("--------------------------------------------")
      // Asks user to choose product
      inquirer
      .prompt([
        {
          name: "choice",
          type: "input",
          message: "Please enter the ID of the product you would like to purchase"
        },
        // Asks user how many units
        {
          name: "quantity",
          type: "input",
          message: "How many units would you like to purchase?"
        }
      ])
      .then(function(answer) {
        var chosenID = answer.choice
        // console.log(chosenID)
        // Targets product from database
        connection.query("SELECT * FROM products WHERE item_id =" + chosenID, function(err, results) {
          if (err) throw err
          // console.log("============== " + results[0].stock_quantity)
          // console.log("+++++++++ " + answer.quantity)
          // User can only buy as many units as are in stock
          if (answer.quantity <= results[0].stock_quantity) {
            console.log("\nThank you for your purchase of " + results[0].product_name + ", we hope you enjoy!\n")
            connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [results[0].stock_quantity - answer.quantity, chosenID])
            showProducts()
            // Otherwise, you're outta luck
          } else {
            console.log("\nWe're sorry, that quantity/product is not in stock! Would you like to pick something else?\n")
            showProducts()
          }
        })
      })
    })
}
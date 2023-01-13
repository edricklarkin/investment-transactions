/**
 * Create a template for the Plaid investment transations download project
 * 
 * Author: Edrick Larkin
 * Project Page: https://github.com/edricklarkin/investment-transactions/
 * 
 */

function createTemplate() {

  //create a new sheets file  
  var ss = SpreadsheetApp.create("Plaid Investment Transactions");

  //add sheets to the file
  var acct = ss.insertSheet("accounts", 0);
  var trans = ss.insertSheet("transactions", 1);
  var security = ss.insertSheet("securities", 2);
  var secrets = ss.insertSheet("secrets", 3);

  //create headers for account sheet
  let account_header = [["account_id", "mask", "name", "official_name", "subtype","type"]];
  acct.getRange(1,1,1,6).setValues(account_header);

  //create headers for transactions sheet
  let trans_headers = [["investment_transaction_id", "account_id", "security_id", "amount", "date", "fees", "name", "price", "quantity", "subtype", "type"]];
  trans.getRange(1,1,1,11).setValues(trans_headers);

  //create headers for securities
  let security_headers = [["security_id", "institution_id", "close_price", "close_price_as_of", "name", "ticker_symbol", "type"]];
  security.getRange(1,1,1,7).setValues(security_headers);

  //setup secrets tab
  secrets.getRange("A1").setValue("Important: This tab is where you store the secrets for each institution");
  
  let generic_secrets = [["url", "https://sandbox.plaid.com"], ["client_id", "{Enter client_id from the Plaid dashboard}"], ["secret","{Enter secret from Plaid dashboard}"]];

  let inst_secrets = [["instituion_name", "access_token"], ["{Name for first institution}", "{Enter access_token from Plaid quickstart}"],["{Name for second institution}", "{Enter access_token from Plaid quickstart}"],["Enter any number of insitutions and access tokens", ""]];

  secrets.getRange("A3:B5").setValues(generic_secrets);
  secrets.getRange("A7:B10").setValues(inst_secrets);  


}

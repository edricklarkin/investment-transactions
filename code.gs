/**
 * Download transactions from Plaid investments/transactions/get to google sheets
 * 
 * Author: Edrick Larkin
 * Project Page: https://github.com/edricklarkin/investment-transactions/code.gs
 * 
 **/


//API call function
function makeRequest(url, params) {

  // Make the POST request
  const response = UrlFetchApp.fetch(url, params);
  const status = response.getResponseCode();
  const responseText = response.getContentText();

  // If successful then return the response text
  if (status === 200) {
    return responseText;

    // Otherwise log and throw an error
  } else {
    Logger.log(`There was a ${status} error fetching ${url}.`);
    Logger.log(responseText);
    throw Error(`There was a ${status} error fetching ${url}.`);
  }

}

/**
 * Makes API call using makeRequest() and appends results to the account, transaction and security tabs.
 * Plaid investments/transactions/get paginates. @offset is required offset from prior run.
 * Returns remaining number of transactions to download in future call
 */
function downloadInvestments(offset, access_token) {

  //Select the active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  //Get all variables from the secrets tab,
  //except access_token which will be provided each time downloadInvestments is called
  var secrets_tab = ss.getSheetByName("secrets");
  let url = secrets_tab.getRange("B3").getValue();
  let client_id = secrets_tab.getRange("B4").getValue();
  let secret = secrets_tab.getRange("B5").getValue();

  // Prepare the request body
  const body = {
    "client_id": client_id,
    "secret": secret,
    "access_token": access_token,
    "start_date": "2021-12-31",
    "end_date": "2023-01-09",
    "options": {
      "count": 500,
      "offset": offset
    }
  };

  // Condense the above into a single object
  params = {
    "contentType": "application/json",
    "payload": JSON.stringify(body),
  };

  // Make the POST request
  const result = JSON.parse(makeRequest(`${url}/investments/transactions/get`, params));
  
  //total_count = transactions returned in current request
  //total_transactions = total transactions available from Plaid in date range
  const total_count = result.investment_transactions.length;
  const total_transactions = result.total_investment_transactions;

  Logger.log(`${total_count} of ${total_transactions} total available transactions downloaded from Plaid.`);

  //Create array of account results
  var account_array = [];
  for (let i = 0; i < result.accounts.length; i++){
    account_array[i] = new Array(6);

    account_array[i][0] = result.accounts[i].account_id;
    account_array[i][1] = result.accounts[i].mask;
    account_array[i][2] = result.accounts[i].name;
    account_array[i][3] = result.accounts[i].official_name;
    account_array[i][4] = result.accounts[i].subtype;
    account_array[i][5] = result.accounts[i].type;
  }

  //Create array of transaction results to append to spreadsheet
  var trans_array = [];
  for (let i = 0; i < result.investment_transactions.length; i++){
    trans_array[i] = new Array(11);

    trans_array[i][0] = result.investment_transactions[i].investment_transaction_id;
    trans_array[i][1] = result.investment_transactions[i].account_id;
    trans_array[i][2] = result.investment_transactions[i].security_id;
    trans_array[i][3] = result.investment_transactions[i].amount;
    trans_array[i][4] = result.investment_transactions[i].date;
    trans_array[i][5] = result.investment_transactions[i].fees;
    trans_array[i][6] = result.investment_transactions[i].name;
    trans_array[i][7] = result.investment_transactions[i].price;
    trans_array[i][8] = result.investment_transactions[i].quantity;
    trans_array[i][9] = result.investment_transactions[i].subtype;
    trans_array[i][10] = result.investment_transactions[i].type;
 
  }

  //Create array of security details
  var sec_array = [];
  for (let i = 0; i < result.securities.length; i++){
    sec_array[i] = new Array(7);

    sec_array[i][0] = result.securities[i].security_id;
    sec_array[i][1] = result.securities[i].institution_id;
    sec_array[i][2] = result.securities[i].close_price;
    sec_array[i][3] = result.securities[i].close_price_as_of;
    sec_array[i][4] = result.securities[i].name;
    sec_array[i][5] = result.securities[i].ticker_symbol;
    sec_array[i][6] = result.securities[i].type;

  }

  //Find last rows to start appending data
  let acct_last_row = ss.getSheetByName("accounts").getLastRow() + 1;
  let trans_last_row = ss.getSheetByName("transactions").getLastRow() + 1;
  let sec_last_row = ss.getSheetByName("securities").getLastRow() + 1;

  //Append data to sheets
  ss.getSheetByName("accounts").getRange(acct_last_row,1,account_array.length, 6).setValues(account_array);
  ss.getSheetByName("transactions").getRange(trans_last_row,1,trans_array.length, 11).setValues(trans_array);
  ss.getSheetByName("securities").getRange(sec_last_row,1,sec_array.length, 7).setValues(sec_array);

  //Returns remaining transactions to download or zero if none
  let remaining = total_transactions - (total_count + offset);
  if (remaining > 0) {return total_transactions - (total_count + offset);}
    else {return 0;}
  
}

//Removes any duplicate records from a sheet
function removeDups(sheet) {

  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
  let last_row = ss.getLastRow();
  let last_col = ss.getLastColumn();

  ss.getRange(1,1,last_row,last_col).removeDuplicates();
  
}

/**
 * Top level function that calls all other functions
 * Loops through each instituion's access token on secrets tab
 * Calls downloadInvestments() until no additional transactions are available from Plaid
 * Removeds duplate transactions with removeDups()
 **/
function incrementalDownload() {

  //Get access token
  var token_cell = SpreadsheetApp.getActiveSpreadsheet().getRange("secrets!B8");

  //Loop through each institution's client token
  let z = 0
  while (token_cell.offset(z,0).isBlank() == false){
    //x is the value of remaining transactions to download in the inner while loop
    let x = downloadInvestments(0, token_cell.offset(z,0).getValue());

    //Loop through Plaid's max pagination of 500 transations
    //Offsets the page by 500 transations and makes next API call
    let i = 500;
    while (x > 0) {x = downloadInvestments(i,token_cell.offset(z,0).getValue());
      i = i + 500;
    }
    z = z + 1;

  }

  //Remove any duplicate records after all API calls
  removeDups("accounts");
  removeDups("securities");
  removeDups("transactions");

}

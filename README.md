# investment-transactions
## Overview
This project downloads investment transactions from Plaid using the [investment/transaction/get](https://plaid.com/docs/api/products/investments/#investmentstransactionsget) API. It can download transactions from as many institutions as needed by iterating through institution access tokens saved in the secrets tab.
## Getting Started
###### Create Google Sheet Template
1. From your [Google App Scripts home](https://script.google.com/home) create a new project
2. Copy the [create template code](https://github.com/edricklarkin/investment-transactions/blob/main/create_template.gs) into code.gs
3. Run the code. It will prompt a warning. Grant the project access to modify files in Google Drive.
4. Open “Plaid Investment Transactions” from your Google Drive
5. From the “Extensions” menu open “App Script”
6. Copy [code.gs](https://github.com/edricklarkin/investment-transactions/blob/main/code.gs) into the code.gs file in your project.
You have now completed setting up your template
###### Getting Plaid Client ID and Secret
1. If you have not already, sign-up for a free account at [Plaid](https://plaid.com/)
2. Once you have an account, go to the [Keys Dashboard](https://dashboard.plaid.com/team/keys)
3. Copy your client_id and sandbox secret to the secrets table on the Sheet template
###### Getting Institution Access Tokens
1. This step requires following the instructions in the [Plaid Quickstart](https://plaid.com/docs/quickstart/) to sign into a sandbox institution and getting a unique access_token.
2. Enter as many different institutions’ access_tokens as you wish into the secrets tab below cell B7. Note: the institution names in column A are only there for organization and are not used by the script.
###### Running the App Script
1. Once the secrets and institution access tokens are entered go back to App Scripts from the template Sheet (Extension menu > App Scripts)
2. From Code.gs run the “incrementalDownload” function
If all is successful, you will have account, transaction, and securities data from the API downloaded into their respective sheet. From here you can join and use this data as you wish.

## Notes
###### Switching to Development
This template is set up for sandbox by default but can be modified for accessing the development environment for real data from up to 100 institutions. To do this:
1. Request access from your Plaid account to development
2. Update the url on the secrets tab to “https://development.plaid.com”
3. Replace the sandbox secret on the secrets tab with your development secret
4. Follow the Plaid Quickstart again, but in development this time, for your development access tokens.
5. Replace the sandbox access tokens on the secrets tab with the development tokens.

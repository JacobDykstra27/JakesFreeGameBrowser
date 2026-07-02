### TODO:
- update/ organize cashe api file
- create file / class to own a CheapSharkClient. *DealsList?*
    ```JS
    require('dotenv').config();
    let credentials = process.env.CHEAPSHARK_USER_AGENT;
    let client = new CheapSharkClient(credentials);
    ```
# Classic Coin

## Introduction

This project involves developing the backend for a fictional cryptocurrency blockchain. It includes features for listing blocks, creating and mining transactions, as well as user login and registration functionalities.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/hedigardi/ClassicCoin-Backend.git
   ```
2. Install the dependencies:
   ```sh
   npm i
   ```
3. Make sure to configure the following environment variables by creating a `config.env` file in the `config` folder:
   ```sh
   NODE_ENV=
   PORT=
   PUBLISH_KEY=
   SUBSCRIBE_KEY=
   SECRET_KEY=
   USER_ID=
   MONGO_URI=
   JWT_SECRET=
   JWT_TTL=
   JWT_COOKIE=
   ```
4. Start the application:
   ```sh
   npm run dev
   ```
5. Start an additional node (optional):

```sh
 npm run dev-node
```

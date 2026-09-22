#!/bin/bash
sed -i "s/u?.role === 'poster' ? 'Available Poster Wallet' : 'Your Balance'/'Deposit Wallet (Poster Wallet)'/g" earnap-client/src/views/DepositPage.js
sed -i "s/parseFloat(u.role === 'poster' ? (u.wallet_balance || 0) : (u.balance || 0))/parseFloat(u.wallet_balance || 0)/g" earnap-client/src/views/DepositPage.js
sed -i "s/parseFloat(u2.role === 'poster' ? (u2.wallet_balance || 0) : (u2.balance || 0))/parseFloat(u2.wallet_balance || 0)/g" earnap-client/src/views/DepositPage.js

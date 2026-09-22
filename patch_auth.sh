#!/bin/bash
sed -i "s/user\.role === 'poster'/true/g" earnap-client/src/views/PosterJobsPage.js
sed -i "s/user\.role === 'poster'/true/g" earnap-client/src/views/PostJobPage.js
sed -i "s/user\.role === 'poster'/true/g" earnap-client/src/views/PosterJobDetailPage.js
sed -i "s/user\.role !== 'poster'/false/g" earnap-client/src/views/PosterWalletPage.js
sed -i "s/user\.role !== 'poster'/false/g" earnap-client/src/views/PosterDashboardPage.js
sed -i "s/u\.role === 'poster'/true/g" earnap-client/src/components/MobileNav.js
sed -i "s/u\.role === 'poster'/true/g" earnap-client/src/components/Sidebar.js

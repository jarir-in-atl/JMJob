<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JMJob — Work. Earn. Grow.</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="/css/app-v2.css">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%92%B0%3C/text%3E%3C/svg%3E">
</head>
<body>
    <div id="app">
        <div class="app-loading">
            <div class="app-loading__spinner"></div>
            <p>Loading JMJob…</p>
        </div>
    </div>
    <script>
        window.EARNAPP_CONFIG = {
            apiBase: '/api',
            referralCode: new URLSearchParams(window.location.search).get('ref') || ''
        };
    </script>
    <script type="module" src="/js/app-v2.js"></script>
</body>
</html>

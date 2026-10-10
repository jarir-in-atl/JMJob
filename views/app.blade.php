<!DOCTYPE html>
<html lang="en">
<head>
    <!-- JMJob shell: app-v2 stylesheet -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JMJob — Work. Earn. Grow.</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap">
    <script>
        try {
            document.documentElement.lang = localStorage.getItem('jmjob_language') === 'bn' ? 'bn' : 'en';
        } catch (_) {}
    </script>
    <link rel="stylesheet" href="/css/app-v2.css?v={{ time() }}">
    <link rel="icon" type="image/jpeg" href="/favicon.jpeg">
</head>
<body>
    <div id="app">
        <div class="app-loading">
            <div class="app-loading__spinner"></div>
            <p>Loading JMJob…</p>
        </div>
    </div>
    <script>
        if (document.documentElement.lang === 'bn') {
            const loadingLabel = document.querySelector('.app-loading p');
            if (loadingLabel) loadingLabel.textContent = 'JMJob লোড হচ্ছে…';
        }
    </script>
    <script>
        window.JMJOB_CONFIG = {
            apiBase: '/api',
            referralCode: new URLSearchParams(window.location.search).get('ref') || ''
        };
    </script>
    <script type="module" src="/js/app.js?v={{ time() }}"></script>
</body>
</html>

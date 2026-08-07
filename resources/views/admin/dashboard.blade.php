<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Halaman panel kontrol administrator ZY Production untuk memantau ringkasan data sistem." />
    <meta name="theme-color" content="#E29A00" />
    <title>Dashboard Admin — ZY Production</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}" />
    <!-- Google Fonts for rich aesthetics -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/admin-dashboard.jsx'])
</head>
<body>
    {{-- React mounts here --}}
    <div id="app-admin-dashboard"></div>
</body>
</html>

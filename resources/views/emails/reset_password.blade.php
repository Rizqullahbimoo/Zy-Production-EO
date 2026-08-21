<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Halo, {{ $user->nama }}!</h2>
    <p>Kami menerima permintaan untuk mereset password akun ZY Production Anda ({{ $user->email }}).</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p>Klik tombol di bawah ini untuk membuat password baru. Tautan ini hanya berlaku selama <strong>60 menit</strong> dan hanya bisa dipakai satu kali.</p>
        <p style="text-align: center; margin: 20px 0;">
            <a href="{{ $resetUrl }}" style="background: #E29A00; color: #1E1606; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Reset Password
            </a>
        </p>
        <p style="font-size: 13px; color: #666;">Atau salin tautan berikut ke browser Anda:<br>{{ $resetUrl }}</p>
    </div>
    <p>Jika Anda tidak meminta reset password, abaikan saja email ini — password Anda tidak akan berubah.</p>
    <br>
    <p>Terima kasih,<br><strong>Tim ZY Production</strong></p>
</body>
</html>

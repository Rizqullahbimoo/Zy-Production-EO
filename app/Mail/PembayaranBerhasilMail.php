<?php

namespace App\Mail;

use App\Models\Pemesanan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PembayaranBerhasilMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pemesanan;
    public $jenis; // 'paket' atau 'custom'

    public function __construct($pemesanan, $jenis = 'paket')
    {
        $this->pemesanan = $pemesanan;
        $this->jenis = $jenis;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pembayaran Berhasil - ZY Production',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pembayaran_berhasil',
        );
    }
}

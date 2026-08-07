<?php

namespace App\Mail;

use App\Models\DokumenMou;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MouSelesaiMail extends Mailable
{
    use Queueable, SerializesModels;

    public $mou;

    public function __construct(DokumenMou $mou)
    {
        $this->mou = $mou;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Dokumen MOU Selesai - Lanjutkan Pembayaran DP - ZY Production',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.mou_selesai',
        );
    }
}

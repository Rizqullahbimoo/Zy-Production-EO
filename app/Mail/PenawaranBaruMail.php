<?php

namespace App\Mail;

use App\Models\PenawaranCustom;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PenawaranBaruMail extends Mailable
{
    use Queueable, SerializesModels;

    public $penawaran;

    public function __construct(PenawaranCustom $penawaran)
    {
        $this->penawaran = $penawaran;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Penawaran Harga Baru dari ZY Production',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.penawaran_baru',
        );
    }
}

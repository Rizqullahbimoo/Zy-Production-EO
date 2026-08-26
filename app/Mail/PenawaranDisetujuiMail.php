<?php

namespace App\Mail;

use App\Models\PenawaranCustom;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PenawaranDisetujuiMail extends Mailable
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
            subject: 'Penawaran Disetujui Customer - ZY Production',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.penawaran_disetujui',
        );
    }
}

<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Config;
use Illuminate\Notifications\Messages\MailMessage;

class CustomVerifyEmail extends VerifyEmail
{
    protected function verificationUrl($notifiable)
    {
        // ReactのURLに書き換え（ここが重要）
      $frontendUrl = config('app.frontend_url') . '/email/verify';


        $temporarySignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        $query = parse_url($temporarySignedUrl, PHP_URL_QUERY);

        return "{$frontendUrl}/{$notifiable->getKey()}/" . sha1($notifiable->getEmailForVerification()) . "?{$query}";
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
    ->subject('Email Verification Request')
    ->line('Please click the button below to verify your email address.')
    ->action('Verify Email', $this->verificationUrl($notifiable))
    ->line('If you did not request this email, please ignore it.');

    }
}

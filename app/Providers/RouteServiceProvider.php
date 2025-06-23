<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
       /* VerifyCsrfToken::csrfExcluding([
            '/broadcasting/auth',
        ]);*/
    }
}
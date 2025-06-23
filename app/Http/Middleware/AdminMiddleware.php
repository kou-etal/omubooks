<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;


class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // ユーザーがログインしていて、かつ is_admin カラムが true の場合のみ許可
        if (auth()->check() && auth()->user()->is_admin) {
            return $next($request);
        }
        return response()->json(['message'=>'管理者専用ページです']);
    }
}


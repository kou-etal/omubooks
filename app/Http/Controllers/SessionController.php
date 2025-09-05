<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        if ($user) {
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'email'       => $user->email,
                    'role'        => $user->role ?? null,
                    'is_admin'    => (int)($user->is_admin ?? 0),
                    'is_verified' => (int)($user->is_verified ?? 0),
                ],
            ], 200);
        }

       
        return response()->json([
            'authenticated' => false,
            'user' => null,
        ], 200);
    }
}
